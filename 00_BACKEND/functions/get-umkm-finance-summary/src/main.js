import { Client, Databases, Query } from "node-appwrite";

/**
 * get-umkm-finance-summary
 *
 * DTO agregasi finansial UMKM. Angka uang TIDAK BOLEH dihitung di klien
 * (08-frontend-data-contract.md §26 — mutation boundary), jadi kedua view-model
 * dikembalikan sekaligus dalam satu eksekusi:
 *
 *   { finance: UmkmFinanceSummary, escrow: EscrowOverview }
 *
 * Sumber angka:
 * - `payments` .... arus kas keluar UMKM (total_amount = amount + fee_amount).
 * - `transactions`  ledger internal — dipakai untuk refund yang diterima UMKM.
 * - `campaigns` ... campaign escrow = remainingBudget yang belum tersalurkan.
 * - `escrows` ..... rate card escrow, di-key oleh orderId (lihat create-escrow).
 *
 * Semantik mengikuti mock referensi src/services/umkm/umkm-dashboard.service.ts
 * agar mock ON/OFF konsisten. Catatan per-field ada di bawah.
 */

const PAGE_SIZE = 100;
const MAX_DOCS = 5000;
const IN_CHUNK = 100;

/** Campaign yang dananya masih ditahan platform. */
const CAMPAIGN_ESCROW_STATUSES = new Set(["active", "paused"]);
/**
 * Campaign selesai/dibatalkan yang masih menyisakan budget → dana itu berhak
 * dikembalikan ke UMKM (belum tentu sudah diproses).
 */
const CAMPAIGN_REFUNDABLE_STATUSES = new Set(["completed"]);
/** Order yang deliverable-nya sudah disetujui, tinggal menunggu release-escrow. */
const ORDER_AWAITING_RELEASE_STATUSES = new Set(["approved"]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "GET") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const databases = createDatabasesClient(env);

    const [payments, transactions, campaigns, orders] = await Promise.all([
      listAll(databases, env.databaseId, env.paymentsCollectionId, [Query.equal("user_id", userId)]),
      listAll(databases, env.databaseId, env.transactionsCollectionId, [Query.equal("userId", userId)]),
      listAll(databases, env.databaseId, env.campaignsCollectionId, [Query.equal("umkmId", userId)]),
      listAll(databases, env.databaseId, env.ordersCollectionId, [Query.equal("umkmId", userId)]),
    ]);

    const paidPayments = payments.filter((p) => p.status === "paid");
    const pendingPayments = payments.filter((p) => p.status === "pending");

    // ── Escrow ───────────────────────────────────────────────────────────────
    const campaignEscrow = sum(
      campaigns.filter((c) => CAMPAIGN_ESCROW_STATUSES.has(c.status)),
      (c) => c.remainingBudget
    );

    const heldEscrows = await listHeldEscrows(databases, env, orders);
    const rateCardEscrow = sum(heldEscrows, (e) => e.amount);

    const orderStatusById = new Map(orders.map((o) => [o.$id, o.status]));
    const pendingRelease = sum(
      heldEscrows.filter((e) => ORDER_AWAITING_RELEASE_STATUSES.has(orderStatusById.get(e.orderId))),
      (e) => e.amount
    );

    const refundEligible = sum(
      campaigns.filter((c) => CAMPAIGN_REFUNDABLE_STATUSES.has(c.status)),
      (c) => c.remainingBudget
    );

    const escrow = {
      activeEscrow: campaignEscrow + rateCardEscrow,
      pendingRelease,
      refundEligible,
      campaignEscrow,
      rateCardEscrow,
    };

    // ── Finance ──────────────────────────────────────────────────────────────
    const finance = {
      // Uang keluar termasuk fee platform — kolom total_amount sudah gabungan.
      totalExpenses: sum(paidPayments, (p) => p.total_amount),
      escrowBalance: escrow.activeEscrow,
      pendingPayments: sum(pendingPayments, (p) => p.total_amount),
      // Refund tidak melewati `payments`; ledger `transactions` yang mencatatnya.
      refundsReceived: sum(
        transactions.filter((t) => t.type === "refund"),
        (t) => t.amount
      ),
      // Fee dibaca dari kolom, bukan dihitung ulang — tarif bisa berubah per periode.
      platformFees: sum(paidPayments, (p) => p.fee_amount),
      successfulTransactionsCount: paidPayments.length,
    };

    log(
      `Finance summary for ${userId}: ${payments.length} payments, ` +
        `${campaigns.length} campaigns, ${heldEscrows.length} held escrows`
    );
    return json(res, { finance, escrow });
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
    transactionsCollectionId:
      process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || "campaigns",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || process.env.NEXT_PUBLIC_ESCROW_COLLECTION || "escrows",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

/**
 * `escrows` tidak menyimpan umkmId — kepemilikan hanya bisa ditegakkan lewat
 * daftar order milik UMKM ini.
 */
async function listHeldEscrows(databases, env, orders) {
  const orderIds = orders.map((o) => o.$id);
  if (orderIds.length === 0) return [];
  return listByIds(databases, env.databaseId, env.escrowsCollectionId, "orderId", orderIds, [
    Query.equal("status", "held"),
  ]);
}

/** Paginasi penuh dengan cursor — listDocuments dibatasi 100 dokumen per panggilan. */
async function listAll(databases, databaseId, collectionId, queries = []) {
  const documents = [];
  let cursor = null;

  for (;;) {
    const paged = [...queries, Query.limit(PAGE_SIZE)];
    if (cursor) paged.push(Query.cursorAfter(cursor));

    const page = await databases.listDocuments(databaseId, collectionId, paged);
    documents.push(...page.documents);

    if (page.documents.length < PAGE_SIZE || documents.length >= MAX_DOCS) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }

  return documents;
}

/** Query.equal dengan array dibatasi 100 nilai — pecah jadi beberapa panggilan. */
async function listByIds(databases, databaseId, collectionId, field, ids, extraQueries = []) {
  if (ids.length === 0) return [];
  const batches = await Promise.all(
    chunk(ids, IN_CHUNK).map((slice) =>
      listAll(databases, databaseId, collectionId, [...extraQueries, Query.equal(field, slice)])
    )
  );
  return batches.flat();
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function sum(items, pick) {
  return items.reduce((total, item) => total + (Number(pick(item)) || 0), 0);
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
