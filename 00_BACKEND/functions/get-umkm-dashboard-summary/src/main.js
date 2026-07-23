import { Client, Databases, Query } from "node-appwrite";

/**
 * get-umkm-dashboard-summary
 *
 * DTO agregasi untuk kartu metrik dashboard UMKM. Menggantikan perhitungan di
 * klien yang melanggar boundary kontrak data (08-frontend-data-contract.md §6).
 *
 * Response = `UmkmDashboardSummary` (src/types/umkm-dashboard.types.ts), camelCase.
 *
 * Semantik dipertahankan setia dengan mock referensi
 * (src/mocks/umkm/dashboard-summary.mock.ts) supaya mock ON/OFF tidak berbeda:
 * - totalSpent .......... uang yang sudah benar-benar keluar (campaign.spentAmount
 *                         + amount order rate card yang selesai)
 * - escrowBalance ....... sisa budget campaign yang masih ditahan + escrow order
 * - pendingPayments ..... JUMLAH order berstatus pending_payment (count, bukan rupiah).
 *                         Versi rupiah ada di get-umkm-finance-summary.
 * - totalViews .......... Σ campaign_submissions.views, submission rejected diabaikan.
 */

const PAGE_SIZE = 100;
const MAX_DOCS = 5000;
const IN_CHUNK = 100;

/** Campaign yang dananya masih ditahan platform. */
const CAMPAIGN_ESCROW_STATUSES = new Set(["active", "paused"]);
/** Order yang belum tuntas dihitung sebagai negosiasi berjalan. */
const ORDER_CLOSED_STATUSES = new Set(["completed", "cancelled"]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "GET") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv();
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const databases = createDatabasesClient(env);

    const campaigns = await listAll(databases, env.databaseId, env.campaignsCollectionId, [
      Query.equal("umkmId", userId),
    ]);
    const campaignIds = campaigns.map((c) => c.$id);

    const [submissions, orders] = await Promise.all([
      listByIds(databases, env.databaseId, env.submissionsCollectionId, "campaignId", campaignIds),
      listAll(databases, env.databaseId, env.ordersCollectionId, [Query.equal("umkmId", userId)]),
    ]);

    const heldEscrowTotal = await sumHeldEscrows(databases, env, orders);

    const summary = {
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      completedCampaigns: campaigns.filter((c) => c.status === "completed").length,
      totalViews: sum(
        submissions.filter((s) => s.status !== "rejected"),
        (s) => s.views
      ),
      totalSpent:
        sum(campaigns, (c) => c.spentAmount) +
        sum(
          orders.filter((o) => o.status === "completed"),
          (o) => o.amount
        ),
      escrowBalance:
        sum(
          campaigns.filter((c) => CAMPAIGN_ESCROW_STATUSES.has(c.status)),
          (c) => c.remainingBudget
        ) + heldEscrowTotal,
      pendingSubmissions: submissions.filter((s) => s.status === "pending").length,
      activeNegotiations: orders.filter((o) => !ORDER_CLOSED_STATUSES.has(o.status)).length,
      pendingPayments: orders.filter((o) => o.status === "pending_payment").length,
    };

    log(
      `Dashboard summary for ${userId}: ${campaigns.length} campaigns, ` +
        `${submissions.length} submissions, ${orders.length} orders`
    );
    return json(res, summary);
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getEnv() {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || "campaigns",
    submissionsCollectionId: process.env.CAMPAIGN_SUBMISSIONS_COLLECTION_ID || "campaign_submissions",
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
 * Escrow di-key oleh orderId saja (tidak menyimpan umkmId), jadi kepemilikan
 * ditentukan lewat order milik UMKM ini — bukan lewat query langsung ke escrows.
 */
async function sumHeldEscrows(databases, env, orders) {
  const orderIds = orders.map((o) => o.$id);
  if (orderIds.length === 0) return 0;
  const escrows = await listByIds(databases, env.databaseId, env.escrowsCollectionId, "orderId", orderIds, [
    Query.equal("status", "held"),
  ]);
  return sum(escrows, (e) => e.amount);
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
