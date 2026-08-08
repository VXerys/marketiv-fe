import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";
import { incrementColumn, decrementColumn } from "./atomic.js";

/**
 * refund-order — orkestrator refund (T-02, Pasal 15 T&C). Dua jalur +
 * handler event:
 *
 * 1. orderId  — order dibatalkan/expired → escrow `held` → refund ke Wallet UMKM.
 * 2. campaignId — campaign cancelled/completed dengan sisa budget → kembalikan
 *    `remainingBudget` ke Wallet UMKM dan zero-kan budget-nya.
 *
 * Register event: `databases.*.tables.orders.rows.*.update` — saat order berubah
 * jadi `cancelled`/`expired`, auto-refund escrow-nya. `execute: []` (server-only):
 * admin/CLI memanggil manual untuk dispute, dan event memicu jalur otomatis.
 *
 * Refund TIDAK mengembalikan fee: kredit = persis `escrow.amount` / sisa budget.
 * Ledger append-only (T-17): koreksi = entry baru, tidak pernah update/delete
 * entry lama. Idempoten lewat ledger id deterministik + guard status escrow.
 *
 * Logika refund escrow di sini IDENTIK dengan refund-escrow/src/main.js. Keduanya
 * di-duplikasi (bukan import bareng) karena deploy root Appwrite adalah
 * `functions/<id>/` — modul di luar folder itu tidak ikut ter-bundle.
 */

const REFUNDABLE_ORDER_STATUSES = new Set(["cancelled", "expired"]);
const REFUNDABLE_CAMPAIGN_STATUSES = new Set(["cancelled", "completed"]);

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const payload = parseBody(req);
    const databases = createDatabasesClient(env);

    // Jalur event `orders.*.update` — payload adalah dokumen order apa adanya
    // (`$id`, `status`, `oldStatus`).
    if (payload?.$id && payload?.status && !payload?.orderId && !payload?.campaignId) {
      return handleOrderEvent(databases, env, payload, log, res);
    }

    if (payload?.orderId) {
      return handleManualOrder(databases, env, payload.orderId, log, res);
    }

    if (payload?.campaignId) {
      return handleManualCampaign(databases, env, payload.campaignId, log, res);
    }

    return json(res, { error: "orderId atau campaignId wajib diisi" }, 400);
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

/**
 * Jalur event: payload berisi `$id`, `status`, `oldStatus`. Refund hanya bila
 * status jadi `cancelled`/`expired`. `oldStatus` berbeda memfilter re-send event
 * yang membawa status sama; kalau `oldStatus` tidak dikirim Appwrite (beberapa
 * versi tidak menyertakan `$previous`), guard ini lolos dan refund tetap jalan.
 */
async function handleOrderEvent(databases, env, orderEvent, log, res) {
  const status = String(orderEvent.status);
  if (!REFUNDABLE_ORDER_STATUSES.has(status)) {
    return json(res, { status: "ignored", reason: `order status is ${status}` });
  }
  if (String(orderEvent.oldStatus) === status) {
    return json(res, { status: "ignored", reason: "no status change" });
  }
  return runOrderRefund(databases, env, orderEvent.$id, log, res);
}

/**
 * Jalur manual `orderId`: load order, validasi status. Order yang sedang jalan
 * / selesai BUKAN jalur refund — kembalikan 409. Yang sah untuk refund:
 * `cancelled`/`expired`.
 */
async function handleManualOrder(databases, env, orderId, log, res) {
  let order;
  try {
    order = await databases.getDocument(env.databaseId, env.ordersCollectionId, orderId);
  } catch (err) {
    if (err?.code === 404) return json(res, { error: "Order tidak ditemukan" }, 404);
    throw err;
  }
  const status = String(order.status);
  if (!REFUNDABLE_ORDER_STATUSES.has(status)) {
    return json(res, { status: "ignored", reason: `order status is ${status}`, code: 409 }, 409);
  }
  return runOrderRefund(databases, env, orderId, log, res);
}

/** Escrow masih `held` → refund. Tidak ada / sudah refunded → idempoten skip. */
async function runOrderRefund(databases, env, orderId, log, res) {
  const escrow = await findEscrowByOrder(databases, env, orderId);
  if (!escrow) return json(res, { status: "ignored", reason: "escrow not found for order" });
  if (String(escrow.status) !== "held") {
    return json(res, { status: "ignored", reason: `escrow status is ${escrow.status}` });
  }
  return refundEscrow(databases, env, escrow, log, res);
}

/**
 * Inti refund escrow — flip-first idempoten (sama dengan refund-escrow): escrow
 * `held` → `refunded`, ledger pending deterministic, kredit atomik ke Wallet
 * UMKM, ledger `completed`, notifikasi.
 */
async function refundEscrow(databases, env, escrow, log, res) {
  const order = await databases.getDocument(env.databaseId, env.ordersCollectionId, escrow.orderId);
  const umkmId = order.umkmId;
  if (!umkmId) return json(res, { error: "Order has no umkm" }, 400);

  const escrowAmount = Number(escrow.amount) || 0;

  await databases.updateDocument(env.databaseId, env.escrowsCollectionId, escrow.$id, {
    status: "refunded"
  });

  const ledgerId = deterministicId(escrow.$id, "refund");
  try {
    await databases.createDocument(
      env.databaseId,
      env.transactionsCollectionId,
      ledgerId,
      {
        userId: umkmId,
        amount: escrowAmount,
        type: "refund",
        referenceId: escrow.$id,
        referenceType: "escrow",
        status: "pending"
      },
      [Permission.read(Role.user(umkmId))]
    );
  } catch (err) {
    if (isConflict(err)) return json(res, { status: "already_processed" });
    throw err;
  }

  const wallet = await findOrCreateWallet(databases, env, umkmId);
  try {
    await incrementColumn(env, env.walletsCollectionId, wallet.$id, "balance", escrowAmount);
  } catch (creditErr) {
    error(`Kredit refund ${ledgerId} gagal: ${creditErr?.message || String(creditErr)}`);
    try {
      await databases.deleteDocument(env.databaseId, env.transactionsCollectionId, ledgerId);
    } catch (cleanupErr) {
      error(`Rollback ledger ${ledgerId} gagal: ${cleanupErr?.message || String(cleanupErr)}`);
    }
    return json(res, { error: "Gagal memproses refund. Coba lagi." }, 500);
  }

  await databases.updateDocument(env.databaseId, env.transactionsCollectionId, ledgerId, {
    status: "completed"
  });

  await notify(databases, env, {
    userId: umkmId,
    sourceId: escrow.$id,
    kind: "refund_escrow",
    title: "Refund Diterima",
    message: `Pesanan dibatalkan. Dana ${rupiah(escrowAmount)} sudah dikembalikan ke saldo Wallet UMKM-mu.`,
    type: "refund",
  }, log);

  log(`Order ${escrow.orderId}: escrow ${escrow.$id} refunded ${escrowAmount} to UMKM ${umkmId}`);
  return json(res, { status: "ok", escrowId: escrow.$id, walletId: wallet.$id, amount: escrowAmount });
}

/**
 * Jalur `campaignId`: sisa budget campaign yang tidak terpakai dikembalikan ke
 * UMKM. Hanya campaign `cancelled`/`completed` dengan `remainingBudget > 0`.
 * Idempoten via ledger `tx` + sha256(`${campaignId}:refund`) — call kedua 409.
 */
async function handleManualCampaign(databases, env, campaignId, log, res) {
  let campaign;
  try {
    campaign = await databases.getDocument(env.databaseId, env.campaignsCollectionId, campaignId);
  } catch (err) {
    if (err?.code === 404) return json(res, { error: "Campaign tidak ditemukan" }, 404);
    throw err;
  }

  const status = String(campaign.status);
  if (!REFUNDABLE_CAMPAIGN_STATUSES.has(status)) {
    return json(res, { status: "ignored", reason: `campaign status is ${status}` });
  }

  const budget = Number(campaign.remainingBudget) || 0;
  if (budget <= 0) return json(res, { status: "ignored", reason: "no remaining budget" });

  const umkmId = campaign.umkmId;
  if (!umkmId) return json(res, { error: "Campaign has no umkm" }, 400);

  const ledgerId = deterministicId(campaignId, "refund");
  try {
    await databases.createDocument(
      env.databaseId,
      env.transactionsCollectionId,
      ledgerId,
      {
        userId: umkmId,
        amount: budget,
        type: "refund",
        referenceId: campaignId,
        referenceType: "campaign",
        status: "pending"
      },
      [Permission.read(Role.user(umkmId))]
    );
  } catch (err) {
    if (isConflict(err)) return json(res, { status: "already_processed" });
    throw err;
  }

  const wallet = await findOrCreateWallet(databases, env, umkmId);
  try {
    await incrementColumn(env, env.walletsCollectionId, wallet.$id, "balance", budget);
    // Zero-kan sisa budget (min 0 di server).
    await decrementColumn(env, env.campaignsCollectionId, campaignId, "remainingBudget", budget, 0);
  } catch (creditErr) {
    error(`Kredit refund campaign ${ledgerId} gagal: ${creditErr?.message || String(creditErr)}`);
    try {
      await databases.deleteDocument(env.databaseId, env.transactionsCollectionId, ledgerId);
    } catch (cleanupErr) {
      error(`Rollback ledger ${ledgerId} gagal: ${cleanupErr?.message || String(cleanupErr)}`);
    }
    return json(res, { error: "Gagal memproses refund. Coba lagi." }, 500);
  }

  await databases.updateDocument(env.databaseId, env.transactionsCollectionId, ledgerId, {
    status: "completed"
  });

  await notify(databases, env, {
    userId: umkmId,
    sourceId: campaignId,
    kind: "refund_campaign",
    title: "Sisa Budget Dikembalikan",
    message: `Sisa budget campaign ${rupiah(budget)} sudah dikembalikan ke saldo Wallet UMKM-mu.`,
    type: "refund",
  }, log);

  log(`Campaign ${campaignId} refunded ${budget} to UMKM ${umkmId}`);
  return json(res, { status: "ok", campaignId, walletId: wallet.$id, amount: budget });
}

async function findEscrowByOrder(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.escrowsCollectionId, [
    Query.equal("orderId", orderId),
    Query.limit(1)
  ]);
  return result.documents[0] || null;
}

async function findOrCreateWallet(databases, env, userId) {
  const existing = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  if (existing.documents.length > 0) return existing.documents[0];
  return databases.createDocument(
    env.databaseId,
    env.walletsCollectionId,
    ID.unique(),
    { userId, balance: 0, pendingBalance: 0 },
    [Permission.read(Role.user(userId))]
  );
}

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

function deterministicId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `tx${digest.slice(0, 32)}`;
}

function isConflict(err) {
  return err?.code === 409 || err?.type === "document_already_exists";
}

function rupiah(value) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || "transactions",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || "escrows",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || "orders",
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || "campaigns",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
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

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}