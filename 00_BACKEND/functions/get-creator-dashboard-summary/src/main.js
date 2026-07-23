import { Client, Databases, Query } from "node-appwrite";

/**
 * get-creator-dashboard-summary
 *
 * DTO agregasi metrik dashboard kreator.
 * Response = `CreatorMetric` (src/types/creator-dashboard.ts).
 *
 * Angka uang dan agregasi lintas collection TIDAK BOLEH dihitung di klien
 * (08-frontend-data-contract.md §9, §26), dan dua dari sumbernya memang tidak
 * terbaca dari browser sama sekali:
 * - `escrows` .... $permissions kosong + rowSecurity, tanpa permission baris.
 * - `wallets` .... saldo tidak boleh melewati klien untuk dijumlahkan.
 *
 * Sumber angka:
 * - `campaigns` ......... Job Pool yang masih punya slot.
 * - `campaign_claims` ... pekerjaan aktif kreator.
 * - `campaign_submissions` submission menunggu review + views tervalidasi.
 * - `orders` + `escrows`  negosiasi berjalan + dana tertahan.
 * - `wallets` ........... saldo & pending balance (READ-ONLY, tidak pernah dimutasi).
 * - `transactions` ...... rincian pendapatan.
 * - `rate_cards` ........ rate card yang sedang tayang.
 */

const PAGE_SIZE = 100;
const MAX_DOCS = 5000;
const IN_CHUNK = 100;

/** campaign_claims.status yang masih menjadi tanggungan kreator. */
const ACTIVE_CLAIM_STATUSES = new Set(["claimed", "submitted"]);
/** orders.status yang masih berjalan — sisanya (completed/cancelled) sudah tutup. */
const OPEN_ORDER_STATUSES = new Set(["pending_payment", "escrow", "in_progress", "revision", "approved"]);
/** campaigns.status yang boleh muncul di Job Pool. */
const OPEN_CAMPAIGN_STATUS = "active";

/**
 * Pendapatan kreator selalu bertipe `release` — dibedakan lewat referenceType:
 * `campaign_submission` (calculate-campaign-reward) vs `escrow` (release-escrow).
 */
const EARNING_TYPE = "release";
const CAMPAIGN_EARNING_REFERENCE = "campaign_submission";
const RATE_CARD_EARNING_REFERENCE = "escrow";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "GET") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv();
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const databases = createDatabasesClient(env);

    const [openCampaigns, claims, submissions, orders, wallet, transactions, rateCards] = await Promise.all([
      listAll(databases, env.databaseId, env.campaignsCollectionId, [
        Query.equal("status", OPEN_CAMPAIGN_STATUS),
      ]),
      listAll(databases, env.databaseId, env.claimsCollectionId, [Query.equal("creatorId", userId)]),
      listAll(databases, env.databaseId, env.submissionsCollectionId, [Query.equal("creatorId", userId)]),
      listAll(databases, env.databaseId, env.ordersCollectionId, [Query.equal("creatorId", userId)]),
      findByField(databases, env.databaseId, env.walletsCollectionId, "userId", userId),
      listAll(databases, env.databaseId, env.transactionsCollectionId, [Query.equal("userId", userId)]),
      listAll(databases, env.databaseId, env.rateCardsCollectionId, [
        Query.equal("creatorId", userId),
        Query.equal("status", "published"),
      ]),
    ]);

    // ── Job Pool ──────────────────────────────────────────────────────────────
    // Campaign yang sudah pernah diklaim kreator ini tidak lagi "tersedia"
    // baginya, walaupun slotnya masih ada untuk kreator lain.
    const claimedCampaignIds = new Set(claims.map((c) => str(c.campaignId)));
    const availableJobsCount = openCampaigns.filter(
      (c) => hasFreeSlot(c) && !claimedCampaignIds.has(c.$id)
    ).length;

    // ── Pekerjaan & submission ────────────────────────────────────────────────
    const activeJobsCount = claims.filter((c) => ACTIVE_CLAIM_STATUSES.has(str(c.status))).length;
    const pendingSubmissionsCount = submissions.filter((s) => str(s.status) === "pending").length;
    const validatedViewsCount = sum(
      submissions.filter((s) => str(s.status) === "approved"),
      (s) => s.views
    );

    // ── Negosiasi & escrow ────────────────────────────────────────────────────
    const negotiationOrdersCount = orders.filter((o) => OPEN_ORDER_STATUSES.has(str(o.status))).length;
    const heldEscrows = await listHeldEscrows(databases, env, orders);
    const escrowBalance = sum(heldEscrows, (e) => e.amount);

    // ── Pendapatan ────────────────────────────────────────────────────────────
    const earnings = transactions.filter((t) => str(t.type) === EARNING_TYPE);
    const campaignEarnings = sum(
      earnings.filter((t) => str(t.referenceType) === CAMPAIGN_EARNING_REFERENCE),
      (t) => t.amount
    );
    const rateCardEarnings = sum(
      earnings.filter((t) => str(t.referenceType) === RATE_CARD_EARNING_REFERENCE),
      (t) => t.amount
    );
    // `transactions` tidak punya kolom tanggal sendiri — $createdAt adalah satu-
    // satunya penanda waktu ledger.
    const thisMonthEarnings = sum(earnings.filter(isThisMonth), (t) => t.amount);

    const metric = {
      availableJobsCount,
      activeJobsCount,
      pendingSubmissionsCount,
      balance: number(wallet?.balance),
      pendingPayouts: number(wallet?.pendingBalance),
      validatedViewsCount,
      activeRateCardsCount: rateCards.length,
      negotiationOrdersCount,
      escrowBalance,
      totalEarnings: campaignEarnings + rateCardEarnings,
      thisMonthEarnings,
      campaignEarnings,
      rateCardEarnings,
    };

    log(
      `Creator metrics for ${userId}: ${claims.length} claim(s), ${submissions.length} submission(s), ` +
        `${orders.length} order(s), ${heldEscrows.length} held escrow(s), wallet ${wallet ? "found" : "missing"}`
    );
    return json(res, metric);
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
    claimsCollectionId: process.env.CLAIMS_COLLECTION_ID || process.env.NEXT_PUBLIC_CLAIM_COLLECTION || "campaign_claims",
    submissionsCollectionId: process.env.SUBMISSIONS_COLLECTION_ID || "campaign_submissions",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || process.env.NEXT_PUBLIC_ESCROW_COLLECTION || "escrows",
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || process.env.NEXT_PUBLIC_WALLET_COLLECTION || "wallets",
    transactionsCollectionId:
      process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
    rateCardsCollectionId: process.env.RATE_CARDS_COLLECTION_ID || "rate_cards",
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

/** claimLimit 0/kosong berarti tidak dibatasi. */
function hasFreeSlot(campaign) {
  const limit = number(campaign.claimLimit);
  if (limit <= 0) return true;
  return number(campaign.totalClaims) < limit;
}

/**
 * `escrows` tidak menyimpan creatorId — kepemilikan hanya bisa ditegakkan lewat
 * daftar order milik kreator ini. Pola sama dengan get-umkm-finance-summary.
 */
async function listHeldEscrows(databases, env, orders) {
  const orderIds = orders.map((o) => o.$id);
  if (orderIds.length === 0) return [];
  return listByIds(databases, env.databaseId, env.escrowsCollectionId, "orderId", orderIds, [
    Query.equal("status", "held"),
  ]);
}

function isThisMonth(document) {
  const created = new Date(document.$createdAt);
  if (Number.isNaN(created.getTime())) return false;
  const now = new Date();
  return created.getUTCFullYear() === now.getUTCFullYear() && created.getUTCMonth() === now.getUTCMonth();
}

/** Dokumen dibuat dengan ID.unique(), jadi lookup selalu lewat kolom. */
async function findByField(databases, databaseId, collectionId, field, value) {
  const result = await databases.listDocuments(databaseId, collectionId, [
    Query.equal(field, value),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
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

function str(value) {
  return typeof value === "string" ? value : "";
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
