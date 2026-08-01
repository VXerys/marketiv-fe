import { Client, Databases, Permission, Query, Role } from "node-appwrite";
import { createHash } from "node:crypto";
import { incrementColumn, decrementColumn } from "./atomic.js";

/**
 * mature-pending-balance — cron harian.
 *
 * `calculate-campaign-reward` menaruh reward campaign di `wallets.pendingBalance`.
 * Sebelum Function ini ada, TIDAK ADA satu pun kode yang memindahkannya ke
 * `balance`, sementara `request-withdrawal` hanya membaca `balance` — jadi
 * reward kreator mengendap permanen dan tidak pernah bisa ditarik.
 *
 * Di sini reward "matang" setelah MATURATION_DAYS hari sejak ledger reward
 * dibuat, lalu dipindah pendingBalance -> balance. Jeda itu memberi jendela
 * koreksi kalau fraud baru ketahuan setelah UMKM menyetujui submission.
 *
 * Idempotensi memakai pola create-escrow (fix M-2): baris ledger `mature`
 * dengan id deterministik dibuat sebagai `pending` LEBIH DULU, baru dana
 * dipindah, baru ledger ditandai `completed`. Kalau eksekusi berhenti di
 * tengah, cron berikutnya menemukan ledger `pending` dan MENYELESAIKAN
 * pemindahan, bukan mengulanginya dari nol.
 *
 * Ledger baru sengaja bertipe "mature", bukan "release" — kalau memakai
 * "release" ia akan terhitung dua kali sebagai pendapatan di
 * get-creator-dashboard-summary:93.
 */

const MATURATION_DAYS = 7;
const PAGE = 100;
// Batas atas putaran supaya bug apa pun tidak berubah jadi loop tak berujung
// yang menghabiskan timeout Function. 100 putaran x 100 baris = 10.000 reward
// per eksekusi; sisanya diambil cron berikutnya.
const MAX_ROUNDS = 100;

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const databases = createDatabasesClient(env);

    const now = new Date();
    const cutoff = new Date(now.getTime() - MATURATION_DAYS * 24 * 60 * 60 * 1000);

    let matured = 0;
    let movedTotal = 0;

    // Sengaja TIDAK memakai Query.offset. Setiap baris yang selesai diproses
    // ditandai `matured`, jadi ia keluar dari filter `status = completed` dan
    // himpunan hasilnya menyusut di tiap iterasi — offset yang bertambah justru
    // akan melewati baris yang belum tersentuh. Karena itu selalu ambil halaman
    // pertama, dan berhenti kalau satu putaran penuh tidak mengubah apa pun
    // (mis. semua sisanya tertunda karena wallet-nya belum ada).
    for (let guard = 0; guard < MAX_ROUNDS; guard++) {
      const batch = await databases.listDocuments(
        env.databaseId,
        env.transactionsCollectionId,
        [
          Query.equal("type", "release"),
          // Hanya reward campaign. `release-escrow` juga menulis type "release",
          // tapi dengan referenceType "escrow" dan langsung ke `balance` —
          // baris itu tidak boleh ikut dimatangkan.
          Query.equal("referenceType", "campaign_submission"),
          Query.equal("status", "completed"),
          Query.lessThanEqual("$createdAt", cutoff.toISOString()),
          Query.limit(PAGE),
        ]
      );

      if (batch.documents.length === 0) break;

      let progressed = 0;

      for (const tx of batch.documents) {
        const amount = Number(tx.amount) || 0;
        if (amount <= 0) {
          await markMatured(databases, env, tx.$id);
          progressed++;
          continue;
        }

        const result = await matureOne(databases, env, tx, amount, now, log);
        if (result.settled) progressed++;
        if (result.moved) {
          matured++;
          movedTotal += amount;
        }
      }

      if (progressed === 0) {
        log(`${batch.documents.length} reward tertunda (wallet belum ada), berhenti`);
        break;
      }
    }

    log(`Matured ${matured} reward(s), total ${movedTotal}`);
    return res.json({ success: true, matured, amount: movedTotal });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return res.json({ success: false, error: err.message }, 500);
  }
};

async function matureOne(databases, env, tx, amount, now, log) {
  const userId = tx.userId;
  const ledgerId = deterministicId(tx.$id, "mature");

  const claim = await claimLedgerRow(databases, env, {
    id: ledgerId,
    userId,
    amount,
    referenceId: tx.$id,
    referenceType: "transaction",
  });

  if (claim.alreadyCompleted) {
    // Dana sudah pindah di eksekusi sebelumnya; yang tersisa cuma menandai
    // baris sumbernya supaya tidak terus terpindai tiap hari.
    await markMatured(databases, env, tx.$id);
    return { moved: false, settled: true };
  }

  const wallet = await findWallet(databases, env, userId);
  if (!wallet) {
    // Jangan tandai apa pun — biarkan cron berikutnya mencoba lagi setelah
    // wallet-nya ada.
    log(`Wallet not found for user ${userId}, deferring tx ${tx.$id}`);
    return { moved: false, settled: false };
  }

  const pending = Number(wallet.pendingBalance) || 0;

  // Jangan biarkan pendingBalance jadi negatif kalau ada koreksi manual di
  // luar Function ini.
  const move = Math.min(amount, pending);

  // Dua mutasi ATOMIK, bukan satu updateDocument dari hasil bacaan.
  //
  // Cron ini tidak berlomba dengan dirinya sendiri, tapi berlomba dengan
  // `calculate-campaign-reward` (menambah pendingBalance), `release-escrow`, dan
  // `request-withdrawal` (mengubah balance). Menulis `pending - move` dan
  // `balance + move` dari angka yang dibaca beberapa milidetik sebelumnya akan
  // MENGHAPUS reward atau penarikan yang kebetulan masuk di sela itu.
  //
  // Dikurangi lebih dulu: kalau eksekusi berhenti di antara keduanya, dana
  // tertahan (bisa dikoreksi manual) alih-alih terhitung dua kali. `min: 0`
  // membuat server menolak bila `pending` ternyata sudah menyusut — ledger
  // tetap `pending` dan cron berikutnya mengulangnya, bukan memindahkan dana
  // yang tidak ada.
  await decrementColumn(env, env.walletsCollectionId, wallet.$id, "pendingBalance", move, 0);
  await incrementColumn(env, env.walletsCollectionId, wallet.$id, "balance", move);

  await databases.updateDocument(
    env.databaseId,
    env.transactionsCollectionId,
    ledgerId,
    { status: "completed" }
  );

  await markMatured(databases, env, tx.$id);

  await databases.createDocument(
    env.databaseId,
    env.notificationsCollectionId,
    deterministicId(tx.$id, "notif"),
    {
      userId,
      title: "Reward Sudah Bisa Ditarik",
      message: `Reward campaign sebesar Rp${move.toLocaleString("id-ID")} sudah masuk saldo dan bisa kamu tarik.`,
      type: "reward_matured",
      isRead: false,
      createdAt: now.toISOString(),
    },
    // `notifications` punya $permissions kosong + rowSecurity — tanpa permission
    // baris, notifikasi tidak akan pernah terbaca pemiliknya.
    [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))]
  ).catch((err) => {
    // Notifikasi gagal tidak boleh membatalkan pemindahan dana yang sudah
    // selesai. Id deterministik membuat percobaan ulang menabrak 409, dan itu
    // memang hasil yang benar.
    if (!isConflict(err)) throw err;
  });

  log(`Matured tx ${tx.$id}: moved ${move} to balance for user ${userId}`);
  return { moved: true, settled: true };
}

async function markMatured(databases, env, transactionId) {
  await databases.updateDocument(
    env.databaseId,
    env.transactionsCollectionId,
    transactionId,
    { status: "matured" }
  );
}

async function claimLedgerRow(databases, env, tx) {
  try {
    await databases.createDocument(
      env.databaseId,
      env.transactionsCollectionId,
      tx.id,
      {
        userId: tx.userId,
        amount: tx.amount,
        type: "mature",
        referenceId: tx.referenceId,
        referenceType: tx.referenceType,
        status: "pending",
      },
      // `transactions` punya $permissions kosong, jadi permission baris adalah
      // satu-satunya jalur baca bagi pemiliknya.
      [Permission.read(Role.user(tx.userId))]
    );
    return { alreadyCompleted: false };
  } catch (err) {
    if (!isConflict(err)) throw err;

    // Baris sudah ada. `completed` = dana sudah pindah, aman dilewati.
    // `pending` = percobaan sebelumnya berhenti sebelum memindahkan, jadi
    // biarkan pemanggil melanjutkannya.
    const existing = await databases.getDocument(
      env.databaseId,
      env.transactionsCollectionId,
      tx.id
    );
    return { alreadyCompleted: existing.status === "completed" };
  }
}

function isConflict(err) {
  return err?.code === 409 || err?.type === "document_already_exists";
}

function deterministicId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `tx${digest.slice(0, 32)}`;
}

async function findWallet(databases, env, userId) {
  const result = await databases.listDocuments(
    env.databaseId,
    env.walletsCollectionId,
    [Query.equal("userId", userId), Query.limit(1)]
  );
  return result.documents[0] || null;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    walletsCollectionId:
      process.env.WALLETS_COLLECTION_ID || process.env.NEXT_PUBLIC_WALLET_COLLECTION || "wallets",
    transactionsCollectionId:
      process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
    notificationsCollectionId:
      process.env.NOTIFICATIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_NOTIFICATION_COLLECTION || "notifications",
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
