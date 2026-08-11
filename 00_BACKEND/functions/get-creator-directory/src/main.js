import { Client, Databases, Query } from "node-appwrite";

/**
 * get-creator-directory
 *
 * DTO direktori kreator untuk UMKM (08-frontend-data-contract.md §15).
 * Response:
 * - `CreatorProfile` tunggal bila body berisi `creatorId`
 * - `{ items, total, nextCursor }` untuk daftar ter-paginasi
 *
 * Body (opsional, JSON):
 *   { creatorId?: string, limit?: number, cursor?: string }
 *
 * KEPUTUSAN SKEMA — 4 field view-model tidak ada di `creator_profiles`:
 *
 * 1. username → `creator_social_accounts.username`. Akun TikTok diprioritaskan
 *    (platform MVP, lihat CampaignPlatform), lalu akun dengan follower terbanyak.
 * 2. engagementRate → dari akun sosial yang sama, supaya username dan angka
 *    engagement selalu merujuk akun yang identik.
 * 3. startingPrice → harga paket TERMURAH dari rate card berstatus `published`
 *    (rate_cards → rate_card_packages). Draft tidak boleh bocor ke UMKM.
 * 4. niche → butuh kolom baru `creator_profiles.niche`; tidak ada satupun kolom
 *    yang bisa menurunkannya (campaigns.category milik UMKM, bukan kreator).
 *    Kolom sudah didaftarkan di appwrite/generate_appwrite_json.js dan menunggu
 *    `appwrite push`. Sebelum di-backfill, nilainya jatuh ke "lainnya".
 *
 * Field sensitif (nomor WhatsApp, saldo, data bank) tidak pernah ikut — §15.
 */

const PAGE_SIZE = 100;
const MAX_DOCS = 5000;
const IN_CHUNK = 100;
const DEFAULT_LIMIT = 100;

/** Harus sinkron dengan CreatorNiche di src/types/umkm-dashboard.types.ts. */
const NICHES = new Set(["kuliner", "fashion", "pariwisata", "edukasi", "kecantikan", "lainnya"]);
const FALLBACK_NICHE = "lainnya";

/** Platform MVP — akun TikTok mewakili kreator di direktori. */
const PRIMARY_PLATFORM = "tiktok";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "GET") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    if (!getUserId(req)) return json(res, { error: "Unauthorized" }, 401);

    const body = parseBody(req);
    const creatorId = typeof body.creatorId === "string" ? body.creatorId : null;
    const limit = clampLimit(body.limit);
    const cursor = typeof body.cursor === "string" && body.cursor.trim() ? body.cursor.trim() : null;

    const databases = createDatabasesClient(env);

    const profiles = creatorId
      ? await listAll(databases, env.databaseId, env.creatorProfilesCollectionId, [
          Query.equal("userId", creatorId),
          Query.limit(1),
        ])
      : await listPage(
          databases,
          env.databaseId,
          env.creatorProfilesCollectionId,
          [Query.equal("isProfileCompleted", true), Query.orderDesc("rating")],
          limit,
          cursor
        );

    if (creatorId && profiles.length === 0) {
      return json(res, { error: "Creator not found" }, 404);
    }

    // `userId` adalah kunci relasi lintas collection, bukan `$id` dokumen profil.
    const creatorIds = profiles.map((p) => str(p.userId)).filter(Boolean);

    const [socialByCreator, startingPriceByCreator] = await Promise.all([
      resolvePrimarySocialAccounts(databases, env, creatorIds),
      resolveStartingPrices(databases, env, creatorIds),
    ]);

    const directory = profiles.map((profile) => {
      const id = str(profile.userId);
      const social = socialByCreator.get(id);
      return {
        id,
        name: str(profile.displayName),
        username: str(social?.username),
        avatarUrl: str(profile.avatarUrl),
        niche: normalizeNiche(profile.niche),
        bio: str(profile.bio),
        location: str(profile.city),
        startingPrice: startingPriceByCreator.get(id) ?? 0,
        rating: number(profile.rating),
        completedJobs: number(profile.totalOrders),
        engagementRate: number(social?.engagementRate),
        isVerified: profile.isProfileCompleted === true,
      };
    });

    if (creatorId) {
      log(`Creator directory resolved: single creator ${creatorId}`);
      return json(res, directory[0]);
    }

    const totalProfiles = await listAll(
      databases,
      env.databaseId,
      env.creatorProfilesCollectionId,
      [Query.equal("isProfileCompleted", true), Query.orderDesc("rating")]
    );
    const nextCursor =
      profiles.length === limit ? str(profiles[profiles.length - 1]?.$id) || null : null;

    log(`Creator directory resolved: ${directory.length}/${totalProfiles.length} profile(s)`);
    return json(res, {
      items: directory,
      total: totalProfiles.length,
      nextCursor,
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
    creatorProfilesCollectionId:
      process.env.CREATOR_PROFILES_COLLECTION_ID || process.env.NEXT_PUBLIC_CREATOR_COLLECTION || "creator_profiles",
    creatorSocialAccountsCollectionId:
      process.env.CREATOR_SOCIAL_ACCOUNTS_COLLECTION_ID || "creator_social_accounts",
    rateCardsCollectionId: process.env.RATE_CARDS_COLLECTION_ID || "rate_cards",
    rateCardPackagesCollectionId: process.env.RATE_CARD_PACKAGES_COLLECTION_ID || "rate_card_packages",
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

function parseBody(req) {
  try {
    if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
    const rawBody = req.bodyText || req.body || "{}";
    return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
  } catch {
    return {};
  }
}

function clampLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_DOCS);
}

/**
 * Satu kreator bisa punya beberapa akun sosial. Pilih satu wakil supaya
 * username dan engagementRate tidak berasal dari akun yang berbeda.
 */
async function resolvePrimarySocialAccounts(databases, env, creatorIds) {
  const accounts = await listByIds(
    databases,
    env.databaseId,
    env.creatorSocialAccountsCollectionId,
    "creatorId",
    creatorIds
  );

  const byCreator = new Map();
  for (const account of accounts) {
    const creatorId = str(account.creatorId);
    const current = byCreator.get(creatorId);
    if (!current || isBetterSocialAccount(account, current)) byCreator.set(creatorId, account);
  }
  return byCreator;
}

function isBetterSocialAccount(candidate, current) {
  const candidateIsPrimary = str(candidate.platform) === PRIMARY_PLATFORM;
  const currentIsPrimary = str(current.platform) === PRIMARY_PLATFORM;
  if (candidateIsPrimary !== currentIsPrimary) return candidateIsPrimary;
  return number(candidate.followers) > number(current.followers);
}

/**
 * startingPrice = paket termurah di seluruh rate card `published` milik kreator.
 * Rate card `draft` sengaja tidak ikut — UMKM tidak boleh melihat harga yang
 * belum dipublikasikan.
 */
async function resolveStartingPrices(databases, env, creatorIds) {
  const rateCards = await listByIds(databases, env.databaseId, env.rateCardsCollectionId, "creatorId", creatorIds, [
    Query.equal("status", "published"),
  ]);
  if (rateCards.length === 0) return new Map();

  const creatorByRateCard = new Map(rateCards.map((card) => [card.$id, str(card.creatorId)]));
  const packages = await listByIds(
    databases,
    env.databaseId,
    env.rateCardPackagesCollectionId,
    "rateCardId",
    Array.from(creatorByRateCard.keys())
  );

  const lowestByCreator = new Map();
  for (const pkg of packages) {
    const creatorId = creatorByRateCard.get(str(pkg.rateCardId));
    if (!creatorId) continue;
    const price = number(pkg.price);
    if (price <= 0) continue;
    const current = lowestByCreator.get(creatorId);
    if (current === undefined || price < current) lowestByCreator.set(creatorId, price);
  }
  return lowestByCreator;
}

function normalizeNiche(value) {
  const niche = str(value).toLowerCase();
  return NICHES.has(niche) ? niche : FALLBACK_NICHE;
}

/** Paginasi penuh dengan cursor — listDocuments dibatasi 100 dokumen per panggilan. */
async function listAll(databases, databaseId, collectionId, queries = [], cap = MAX_DOCS) {
  const documents = [];
  let cursor = null;

  for (;;) {
    const pageSize = Math.min(PAGE_SIZE, cap - documents.length);
    if (pageSize <= 0) break;

    const paged = [...queries, Query.limit(pageSize)];
    if (cursor) paged.push(Query.cursorAfter(cursor));

    const page = await databases.listDocuments(databaseId, collectionId, paged);
    documents.push(...page.documents);

    if (page.documents.length < pageSize) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }

  return documents;
}

async function listPage(databases, databaseId, collectionId, queries = [], limit = DEFAULT_LIMIT, cursor = null) {
  const paged = [...queries, Query.limit(Math.min(PAGE_SIZE, limit))];
  if (cursor) paged.push(Query.cursorAfter(cursor));
  const page = await databases.listDocuments(databaseId, collectionId, paged);
  return page.documents;
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
