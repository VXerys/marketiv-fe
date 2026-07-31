import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";
import { incrementColumn, decrementColumn } from "./atomic.js";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const databases = createDatabasesClient(env);
    const { Query } = await import("node-appwrite");

    const doc = req.bodyJson || {};

    const submissionId = doc.$id;
    if (!submissionId) {
      return res.empty();
    }

    if (doc.status !== "approved") {
      return res.empty();
    }

    const existingTransactions = await databases.listDocuments(
      env.databaseId, env.transactionsCollectionId,
      [
        Query.equal("referenceId", submissionId),
        Query.equal("referenceType", "campaign_submission"),
        Query.limit(1),
      ]
    );

    if (existingTransactions.documents.length > 0) {
      log(`Reward already processed for submission ${submissionId}, skipping`);
      return res.empty();
    }

    const campaign = await databases.getDocument(
      env.databaseId, env.campaignsCollectionId, doc.campaignId
    );

    const views = Number(doc.views) || 0;
    const rewardPer1000Views = Number(campaign.rewardPer1000Views) || 0;
    const remainingBudget = Number(campaign.remainingBudget) || 0;

    const reward = Math.min(
      Math.floor((views / 1000) * rewardPer1000Views),
      remainingBudget
    );

    if (reward <= 0) {
      log(`Reward 0 for submission ${submissionId}, skipping`);
      return res.empty();
    }

    const creatorId = doc.creatorId;
    const walletDoc = await findOrCreateWallet(databases, env, creatorId);

    // Atomik: dua submission yang di-approve bersamaan sama-sama membaca
    // pendingBalance lama, dan yang terakhir menulis menghapus reward yang lain.
    await incrementColumn(
      env, env.walletsCollectionId, walletDoc.$id, "pendingBalance", reward
    );

    await databases.createDocument(
      env.databaseId, env.transactionsCollectionId, ID.unique(),
      {
        userId: creatorId,
        amount: reward,
        type: "release",
        referenceId: submissionId,
        referenceType: "campaign_submission",
        status: "completed",
      },
      // Sejajar dengan release-escrow: baris ledger dimiliki kreator. Saat ini
      // `transactions` masih punya read("users") di level koleksi, jadi tanpa baris
      // ini pun terbaca — justru itu masalahnya (semua user bisa membaca semua
      // transaksi). Permission baris membuat koleksi itu aman untuk diperketat.
      [Permission.read(Role.user(creatorId))]
    );

    // Kedua kolom atomik. Versi lama menghitung dari `campaign` yang dibaca di
    // awal handler: dua approve bersamaan sama-sama melihat remainingBudget yang
    // sama, lalu keduanya menuliskan pengurangan dari angka itu — campaign
    // membayar melebihi dananya dan `spentAmount` tidak pernah cocok dengan
    // jumlah reward yang benar-benar keluar.
    //
    // `min: 0` menggantikan Math.max(0, …) dan ditegakkan server, jadi sisa
    // budget tidak bisa jatuh negatif walau dua eksekusi bertemu.
    await decrementColumn(
      env, env.campaignsCollectionId, doc.campaignId, "remainingBudget", reward, 0
    );
    await incrementColumn(
      env, env.campaignsCollectionId, doc.campaignId, "spentAmount", reward
    );

    // Status dinilai dari angka SESUDAH pengurangan, dibaca ulang — bukan dari
    // hasil hitungan lokal yang bisa meleset saat ada eksekusi bersamaan.
    const fresh = await databases.getDocument(
      env.databaseId, env.campaignsCollectionId, doc.campaignId
    );
    if ((Number(fresh.remainingBudget) || 0) <= 0) {
      await databases.updateDocument(
        env.databaseId, env.campaignsCollectionId, doc.campaignId,
        { status: "completed" }
      );
    }

    await notify(databases, env, {
      sourceId: submissionId,
      kind: "reward",
      userId: creatorId,
      title: "Reward Campaign",
      message: `Reward Rp${reward.toLocaleString("id-ID")} sudah masuk ke pending balance`,
      type: "reward",
    }, log);

    log(`Reward ${reward} calculated for submission ${submissionId}`);
    return res.json({ success: true, reward });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return res.json({ success: false, error: err.message }, 500);
  }
};

async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId, env.notificationsCollectionId,
      deterministicNotificationId(payload.sourceId, payload.kind),
      { userId: payload.userId, title: payload.title, message: payload.message,
        type: payload.type, isRead: false, createdAt: new Date().toISOString() },
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))]
    );
  } catch (err) {
    if (err?.code === 409) return;
    log(`Notifikasi ${payload.kind} gagal untuk ${payload.userId}: ${err?.message || String(err)}`);
  }
}

function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

async function findOrCreateWallet(databases, env, userId) {
  const { Query } = await import("node-appwrite");
  const existing = await databases.listDocuments(
    env.databaseId, env.walletsCollectionId,
    [Query.equal("userId", userId), Query.limit(1)]
  );
  if (existing.documents.length > 0) return existing.documents[0];
  return await databases.createDocument(
    env.databaseId, env.walletsCollectionId, ID.unique(),
    { userId, balance: 0, pendingBalance: 0 },
    [Permission.read(Role.user(userId))]
  );
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || process.env.NEXT_PUBLIC_CAMPAIGN_COLLECTION || "campaigns",
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || process.env.NEXT_PUBLIC_WALLET_COLLECTION || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_NOTIFICATION_COLLECTION || "notifications",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);
  return new Databases(client);
}
