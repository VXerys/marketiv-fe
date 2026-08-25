import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";
import { incrementColumn } from "./atomic.js";

/**
 * ADR-008: Rate Card Order memakai fee SELLER-SIDE — UMKM membayar persis harga
 * rate card, potongan fee diambil dari pendapatan kreator saat escrow dirilis.
 * (Campaign PPV sebaliknya, buyer-side, ditangani create-payment.)
 *
 * Fee rate dibaca dari env FEE_RATE (default 0.02). Saat create-escrow, rate
 * di-snapshot ke escrow.fee_rate — order lama pakai rate lama (stabilitas).
 */
const RELEASABLE_ORDER_STATUSES = new Set(["in_progress", "revision"]);

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const databases = createDatabasesClient(env);
    const event = parseBody(req);
    const deliverableId = event?.deliverableId || event?.$id;
    if (!deliverableId) return json(res, { error: "Missing deliverable id" }, 400);
    // Event payload tidak dipercaya. Event deliverable dan validation sama-sama
    // memicu fungsi ini; state final selalu dimuat ulang dari database.
    const deliverable = await databases.getDocument(env.databaseId, env.deliverablesCollectionId, deliverableId);
    const orderId = deliverable.orderId;
    if (!orderId) return json(res, { error: "Missing order id" }, 400);
    const order = await databases.getDocument(env.databaseId, env.ordersCollectionId, orderId);
    const creatorId = order.creatorId;
    if (!creatorId) return json(res, { error: "Order has no creator" }, 400);

    if (!RELEASABLE_ORDER_STATUSES.has(String(order.status))) {
      return json(res, { status: "ignored", reason: `order status is ${order.status}` });
    }

    if (String(deliverable.status) !== "approved") {
      return json(res, { status: "ignored", reason: "deliverable is not approved" });
    }
    const latest = await findLatestDeliverable(databases, env, orderId);
    if (!latest || latest.$id !== deliverable.$id) {
      return json(res, { status: "ignored", reason: "deliverable is not latest" });
    }
    const validation = await findValidation(databases, env, deliverable.$id);
    if (!validation || validation.status !== "valid" ||
      validation.orderId !== orderId || Number(validation.deliverableVersion) !== Number(deliverable.version) ||
      validation.sourceSnapshot !== deliverable.source || validation.evidenceUrlSnapshot !== deliverable.fileUrl) {
      return json(res, { status: "ignored", reason: "trusted validation is missing or mismatched" });
    }

    const escrow = await findEscrowForRelease(databases, env, orderId);
    if (!escrow) return json(res, { status: "ignored", reason: "releasable escrow not found" });
    if (escrow.status === "released") {
      return json(res, { status: "already_released", escrowId: escrow.$id });
    }

    const wallet = await findWallet(databases, env, creatorId);
    if (!wallet) throw new Error(`Wallet not found for creator ${creatorId}`);

    const escrowAmount = Number(escrow.amount);
    // Snapshot fee_rate dari escrow (fallback 0.02 untuk escrow lama tanpa snapshot)
    const rate = Number(escrow.fee_rate) || 0.02;
    const feeAmount = Math.floor(escrowAmount * rate);
    // Sejajar calculateCreatorPayout() di src/services/wallet.service.ts:129.
    const creatorAmount = escrowAmount - feeAmount;

    if (escrow.status !== "releasing") {
      await databases.updateDocument(env.databaseId, env.escrowsCollectionId, escrow.$id, { status: "releasing" });
      escrow.status = "releasing";
    }

    const releaseTransaction = await ensureTransaction(databases, env, {
      userId: creatorId,
      amount: creatorAmount,
      type: "release",
      referenceId: escrow.$id,
      referenceType: "escrow",
      status: "processing"
    });

    const feeTransaction = feeAmount > 0
      ? await ensureTransaction(databases, env, {
        userId: creatorId,
        amount: feeAmount,
        type: "fee",
        referenceId: escrow.$id,
        referenceType: "escrow",
        status: "processing"
      })
      : null;

    if (releaseTransaction.status !== "completed") {
      // Increment atomik: kreator bisa punya beberapa order yang dirilis dalam
      // detik yang sama. Kredit wallet hanya dijalankan selama ledger release
      // masih `processing`, sehingga retry normal menyelesaikan state `releasing`
      // yang gagal sebelum kredit selesai.
      await incrementColumn(
        env, env.walletsCollectionId, wallet.$id, "balance", creatorAmount
      );
      await markTransactionCompleted(databases, env, releaseTransaction.$id);
    }

    if (feeAmount > 0) {
      if (feeTransaction?.status !== "completed") {
        await markTransactionCompleted(databases, env, feeTransaction.$id);
      }
    }

    await updateOrderCompleted(databases, env, orderId);
    await databases.updateDocument(env.databaseId, env.escrowsCollectionId, escrow.$id, { status: "released" });

    await notify(databases, env, {
      userId: creatorId,
      sourceId: escrow.$id,
      kind: "escrow_released_creator",
      title: "Dana Sudah Cair",
      message:
        `Pesanan selesai. ${rupiah(creatorAmount)} masuk ke saldomu` +
        (feeAmount > 0 ? ` setelah dipotong fee platform 2% (${rupiah(feeAmount)}).` : "."),
      type: "escrow_released",
    }, log);

    if (order.umkmId) {
      await notify(databases, env, {
        userId: order.umkmId,
        sourceId: escrow.$id,
        kind: "escrow_released_umkm",
        title: "Pesanan Selesai",
        message: `Kamu menyetujui hasil kerjanya dan dana ${rupiah(escrowAmount)} sudah dilepaskan ke kreator.`,
        type: "order_completed",
      }, log);
    }

    log(`Escrow ${escrow.$id} released to creator ${creatorId}: ${creatorAmount} net, ${feeAmount} fee`);
    return json(res, {
      status: "ok",
      escrowId: escrow.$id,
      walletId: wallet.$id,
      creatorAmount,
      feeAmount
    });
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
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || process.env.NEXT_PUBLIC_WALLET_COLLECTION || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || process.env.NEXT_PUBLIC_ESCROW_COLLECTION || "escrows",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    deliverablesCollectionId: process.env.DELIVERABLES_COLLECTION_ID || "deliverables",
    validationsCollectionId: process.env.RATECARD_DELIVERABLE_VALIDATIONS_COLLECTION_ID || "ratecard_deliverable_validations",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
    feeRate: Number(process.env.FEE_RATE || 0.02)
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

async function findEscrowForRelease(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.escrowsCollectionId, [
    Query.equal("orderId", orderId),
    Query.equal("status", ["held", "releasing", "released"]),
    Query.limit(1)
  ]);
  return result.documents[0] || null;
}

async function findLatestDeliverable(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.deliverablesCollectionId, [
    Query.equal("orderId", orderId), Query.orderDesc("version"), Query.limit(1)
  ]);
  return result.documents[0] || null;
}

async function findValidation(databases, env, deliverableId) {
  const result = await databases.listDocuments(env.databaseId, env.validationsCollectionId, [
    Query.equal("deliverableId", deliverableId), Query.limit(1)
  ]);
  return result.documents[0] || null;
}

async function findWallet(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

/**
 * Satu baris ledger per (referenceId, referenceType, type). Dipakai dua kali:
 * sekali untuk `release` (nominal bersih) dan sekali untuk `fee` (potongan
 * platform). Karena `type` ikut jadi kunci, keduanya tidak saling menimpa.
 */
async function ensureTransaction(databases, env, transaction) {
  const documentId = deterministicTransactionId(
    transaction.referenceId,
    transaction.referenceType,
    transaction.type
  );
  try {
    return await databases.getDocument(env.databaseId, env.transactionsCollectionId, documentId);
  } catch (err) {
    if (err?.code !== 404) throw err;
  }

  return await databases.createDocument(
    env.databaseId,
    env.transactionsCollectionId,
    documentId,
    transaction,
    [Permission.read(Role.user(transaction.userId))]
  );
}

async function markTransactionCompleted(databases, env, transactionId) {
  await databases.updateDocument(env.databaseId, env.transactionsCollectionId, transactionId, {
    status: "completed"
  });
}

async function updateOrderCompleted(databases, env, orderId) {
  await databases.updateDocument(env.databaseId, env.ordersCollectionId, orderId, {
    status: "completed"
  });
}

/**
 * Tulis satu baris notifikasi.
 *
 * Id dokumennya deterministik dari (sourceId, kind), jadi event yang terkirim
 * ulang tidak menghasilkan notifikasi ganda — 409 dari server justru hasil yang
 * benar. Pola ini sama dengan dedup ledger di file ini.
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

function deterministicTransactionId(referenceId, referenceType, type) {
  const digest = createHash("sha256").update(`${referenceId}:${referenceType}:${type}`).digest("hex");
  return `tx${digest.slice(0, 30)}`;
}

function rupiah(value) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
