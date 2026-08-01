import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";
import { incrementColumn } from "./atomic.js";

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
    await notifyEscrowHeld(databases, env, payment, escrow, log);

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
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || process.env.NEXT_PUBLIC_CAMPAIGN_COLLECTION || "campaigns",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications"
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

  // Kedua cabang memakai increment atomik. Sebelumnya keduanya baca-ubah-tulis;
  // "baca ulang tepat sebelum menulis" mempersempit jendela balapan tapi tidak
  // menutupnya, dan webhook Midtrans memang bisa terkirim ulang.
  if (isCampaign) {
    // Campaign top-up: credit remainingBudget only — dana tidak masuk wallet bebas
    await incrementColumn(
      env, env.campaignsCollectionId, payment.campaign_id, "remainingBudget", Number(payment.amount)
    );
  } else {
    const fresh = await findWallet(databases, env, payment.user_id);
    if (!fresh) throw new Error(`Wallet not found for user ${payment.user_id}`);
    await incrementColumn(
      env, env.walletsCollectionId, fresh.$id, "balance", Number(payment.amount)
    );
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

/**
 * Kedua pihak diberi tahu, dengan kalimat yang berbeda: UMKM perlu tahu dananya
 * aman, kreator perlu tahu ia boleh mulai bekerja. Order dimuat ulang di sini
 * karena `payments` hanya menyimpan `user_id` pembayarnya — creatorId ada di
 * `orders`.
 */
async function notifyEscrowHeld(databases, env, payment, escrow, log) {
  let order;
  try {
    order = await databases.getDocument(env.databaseId, env.ordersCollectionId, payment.order_id);
  } catch (err) {
    log(`Notifikasi escrow dilewati, order ${payment.order_id} tidak terbaca: ${err?.message || String(err)}`);
    return;
  }

  const amount = rupiah(escrow.amount);

  await notify(databases, env, {
    userId: payment.user_id,
    sourceId: escrow.$id,
    kind: "escrow_held_umkm",
    title: "Pembayaran Berhasil",
    message: `Dana ${amount} sudah ditahan di escrow. Kreator bisa mulai mengerjakan pesananmu.`,
    type: "escrow_held",
  }, log);

  if (order.creatorId) {
    await notify(databases, env, {
      userId: order.creatorId,
      sourceId: escrow.$id,
      kind: "escrow_held_creator",
      title: "Pesanan Siap Dikerjakan",
      message: `UMKM sudah membayar ${amount} ke escrow. Silakan mulai mengerjakan dan kirim hasilnya lewat ruang negosiasi.`,
      type: "escrow_held",
    }, log);
  }
}

/**
 * Tulis satu baris notifikasi.
 *
 * Id dokumennya deterministik dari (sourceId, kind), jadi event yang terkirim
 * ulang tidak menghasilkan notifikasi ganda — 409 dari server justru hasil yang
 * benar. Pola ini sama dengan penanda ledger di file ini.
 *
 * Kegagalan menulis notifikasi TIDAK PERNAH menggagalkan pemanggilnya: dana
 * sudah berpindah, dan membatalkan itu karena notifikasi gagal jauh lebih
 * merugikan daripada notifikasi yang hilang.
 */
async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId,
      env.notificationsCollectionId,
      deterministicNotificationId(payload.sourceId, payload.kind),
      {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      // `notifications` punya $permissions kosong + rowSecurity — tanpa
      // permission baris, notifikasi tidak akan pernah terbaca pemiliknya.
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))]
    );
  } catch (err) {
    if (err?.code === 409) return;
    log(`Notifikasi ${payload.kind} gagal untuk ${payload.userId}: ${err?.message || String(err)}`);
  }
}

/** "ntf" + 29 hex = 32 karakter, valid sebagai document id Appwrite. */
function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

function rupiah(value) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
