import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const payment = parseBody(req);
    if (!payment?.$id) return json(res, { error: "Missing payment payload" }, 400);
    if (payment.status !== "paid") return json(res, { status: "ignored", reason: "payment is not paid" });

    const databases = createDatabasesClient(env);

    if (payment.purpose === "topup" || payment.purpose === "campaign") {
      const result = await completeTopup(databases, env, payment);
      log(`Top up payment ${payment.$id} completed for ${payment.user_id}`);
      return json(res, { status: "ok", ...result });
    }

    if (payment.purpose !== "order" || !payment.order_id) {
      return json(res, { error: "Paid payment has invalid purpose/order_id" }, 400);
    }

    const existingEscrow = await findEscrow(databases, env, payment.order_id);
    const escrow = existingEscrow || await databases.createDocument(
      env.databaseId,
      env.escrowsCollectionId,
      ID.unique(),
      { orderId: payment.order_id, amount: Number(payment.amount), status: "held" }
    );

    await ensureTransaction(databases, env, {
      userId: payment.user_id,
      amount: Number(payment.amount),
      type: "payment",
      referenceId: payment.order_id,
      referenceType: "order",
      status: "completed"
    });

    await updateOrderAfterEscrow(databases, env, payment.order_id);
    log(`Escrow ${escrow.$id} held for order ${payment.order_id}`);
    return json(res, { status: "ok", escrowId: escrow.$id });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    paymentsCollectionId: process.env.PAYMENTS_COLLECTION_ID || process.env.NEXT_PUBLIC_PAYMENT_COLLECTION || "payments",
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || process.env.NEXT_PUBLIC_WALLET_COLLECTION || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || process.env.NEXT_PUBLIC_ESCROW_COLLECTION || "escrows",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || process.env.NEXT_PUBLIC_CAMPAIGN_COLLECTION || "campaigns"
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

/**
 * Top-up (reguler maupun campaign).
 *
 * Urutannya sengaja: baris ledger dibuat sebagai `pending` LEBIH DULU dengan id
 * deterministik, baru dana dikredit, baru ledger ditandai `completed`. Pola ini
 * mengikuti request-withdrawal:50-99.
 *
 * Versi sebelumnya menulis ledger `completed` di awal lalu `return` saat baris
 * itu sudah ada. Akibatnya kalau kredit gagal di tengah, panggilan ulang webhook
 * Midtrans akan menemukan baris ledger lama dan berhenti SEBELUM mengkredit —
 * uang tercatat di ledger tapi tidak pernah masuk ke mana pun, permanen.
 *
 * Dengan penanda `pending`, retry justru MENYELESAIKAN kredit yang tertunda.
 */
async function completeTopup(databases, env, payment) {
  const isCampaign = payment.purpose === "campaign" && Boolean(payment.campaign_id);

  // Wallet hanya relevan untuk top-up reguler. Jalur campaign tidak menyentuh
  // wallet sama sekali (lihat V-2), jadi jangan gagalkan top-up campaign hanya
  // karena UMKM belum punya baris wallet.
  const wallet = isCampaign ? null : await findWallet(databases, env, payment.user_id);
  if (!isCampaign && !wallet) throw new Error(`Wallet not found for user ${payment.user_id}`);

  const type = isCampaign ? "payment" : "deposit";
  const ledgerId = deterministicId(payment.$id, type);

  const claim = await claimLedgerRow(databases, env, {
    id: ledgerId,
    userId: payment.user_id,
    amount: Number(payment.amount),
    type,
    referenceId: payment.$id,
    referenceType: "payment"
  });

  if (claim.alreadyCompleted) {
    return { walletId: wallet?.$id ?? null, status: "already_processed" };
  }

  if (isCampaign) {
    // Campaign top-up: credit remainingBudget only — dana tidak masuk wallet bebas
    const campaign = await databases.getDocument(
      env.databaseId, env.campaignsCollectionId, payment.campaign_id
    );
    await databases.updateDocument(
      env.databaseId, env.campaignsCollectionId, payment.campaign_id,
      { remainingBudget: Number(campaign.remainingBudget || 0) + Number(payment.amount) }
    );
  } else {
    // Baca ulang tepat sebelum menulis — Appwrite tidak punya compare-and-set.
    const fresh = await findWallet(databases, env, payment.user_id);
    if (!fresh) throw new Error(`Wallet not found for user ${payment.user_id}`);
    await databases.updateDocument(env.databaseId, env.walletsCollectionId, fresh.$id, {
      balance: Number(fresh.balance || 0) + Number(payment.amount)
    });
  }

  await databases.updateDocument(env.databaseId, env.transactionsCollectionId, ledgerId, {
    status: "completed"
  });

  return { walletId: wallet?.$id ?? null };
}

/**
 * Klaim baris ledger sebagai penanda idempotensi.
 *
 * `transactions` tidak punya unique index untuk (referenceId, type), jadi id
 * dokumen deterministik-lah kuncinya: create kedua dengan id sama gagal 409.
 * Hasil: "tx" + 32 hex = 34 karakter, valid sebagai document id.
 */
async function claimLedgerRow(databases, env, tx) {
  try {
    await databases.createDocument(
      env.databaseId,
      env.transactionsCollectionId,
      tx.id,
      {
        userId: tx.userId,
        amount: tx.amount,
        type: tx.type,
        referenceId: tx.referenceId,
        referenceType: tx.referenceType,
        status: "pending"
      },
      // `transactions` punya $permissions kosong, jadi permission baris adalah
      // satu-satunya jalur baca bagi pemiliknya.
      [Permission.read(Role.user(tx.userId))]
    );
    return { alreadyCompleted: false };
  } catch (err) {
    if (err?.code !== 409) throw err;

    // Baris sudah ada. `completed` = kredit sudah selesai, aman dilewati.
    // `pending` = percobaan sebelumnya berhenti sebelum mengkredit, jadi
    // biarkan pemanggil melanjutkannya.
    const existing = await databases.getDocument(
      env.databaseId, env.transactionsCollectionId, tx.id
    );
    return { alreadyCompleted: existing.status === "completed" };
  }
}

function deterministicId(paymentId, type) {
  const digest = createHash("sha256").update(`${paymentId}:${type}`).digest("hex");
  return `tx${digest.slice(0, 32)}`;
}

async function findWallet(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

async function findEscrow(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.escrowsCollectionId, [Query.equal("orderId", orderId), Query.limit(1)]);
  return result.documents[0] || null;
}

async function ensureTransaction(databases, env, transaction) {
  const existing = await databases.listDocuments(env.databaseId, env.transactionsCollectionId, [
    Query.equal("referenceId", transaction.referenceId),
    Query.equal("referenceType", transaction.referenceType),
    Query.equal("type", transaction.type),
    Query.limit(1)
  ]);
  if (existing.documents[0]) return { transaction: existing.documents[0], created: false };

  const transactionDocument = await databases.createDocument(
    env.databaseId,
    env.transactionsCollectionId,
    ID.unique(),
    transaction,
    [Permission.read(Role.user(transaction.userId))]
  );

  return { transaction: transactionDocument, created: true };
}

async function updateOrderAfterEscrow(databases, env, orderId) {
  await databases.updateDocument(env.databaseId, env.ordersCollectionId, orderId, {
    status: "in_progress"
  });
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
