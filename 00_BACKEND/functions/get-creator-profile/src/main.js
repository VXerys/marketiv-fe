import { Client, Databases, Query, Users } from "node-appwrite";

/**
 * get-creator-profile
 *
 * DTO profil kreator versi PEMILIK: join `users` (mirror) + `creator_profiles` +
 * `creator_social_accounts` + akun Auth.
 * Response = `CreatorProfile` (src/types/creator-dashboard.ts).
 *
 * Bedanya dengan get-creator-directory: fungsi itu melayani UMKM yang menelusuri
 * kreator lain (identitas dari body `creatorId`, field sensitif disaring). Fungsi
 * ini hanya melayani kreator yang sedang login untuk dirinya sendiri — identitas
 * datang dari sesi, tidak pernah dari body, jadi tidak ada parameter sama sekali.
 *
 * KEPUTUSAN SKEMA — field view-model yang tidak punya kolom sendiri:
 *
 * 1. name → nama akun Appwrite Auth, fallback `creator_profiles.displayName`.
 *    Alasan sama seperti get-umkm-profile: displayName diisi create-user-profile
 *    dari nama akun, jadi akun Auth adalah sumber yang lebih baru bila user
 *    mengganti namanya.
 * 2. username & engagementRate → `creator_social_accounts`, diambil dari SATU
 *    akun yang sama (TikTok diprioritaskan, lalu follower terbanyak) supaya
 *    username dan angka engagement tidak merujuk akun berbeda. Konvensi ini
 *    dipertahankan identik dengan get-creator-directory.
 * 3. startingPrice → paket termurah dari rate card `published`. Draft tidak ikut
 *    walaupun ini view pemilik — angka ini adalah "harga mulai" yang dilihat
 *    UMKM, jadi harus sama persis dengan yang dihitung get-creator-directory.
 * 4. instagramUrl & tiktokUrl → disusun dari username akun sosial per platform.
 *    Tidak ada kolom URL di skema dan tidak perlu ada — URL profil kedua platform
 *    deterministik dari username.
 *
 * TIDAK ADA SUMBER DATA (dikembalikan sebagai nilai kosong, bukan fabrikasi):
 *   isVerified* · bannerUrl · averageViews · responseTime · completionRate ·
 *   portfolioUrl
 * (*) isVerified dipetakan ke `isProfileCompleted` — konvensi yang sudah dipakai
 * get-umkm-profile dan get-creator-directory. Bila nanti verifikasi identitas
 * jadi konsep tersendiri, kolom `isVerified` layak ditambahkan.
 */

const IN_CHUNK = 100;
const PAGE_SIZE = 100;
const MAX_DOCS = 5000;

/** Harus sinkron dengan CreatorNiche di src/types/creator-dashboard.ts. */
const NICHES = new Set(["kuliner", "fashion", "pariwisata", "edukasi", "kecantikan", "lainnya"]);
const FALLBACK_NICHE = "lainnya";

/** Platform MVP — akun TikTok mewakili kreator. */
const PRIMARY_PLATFORM = "tiktok";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "GET") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv();
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const client = createClient(env);
    const databases = new Databases(client);
    const users = new Users(client);

    const [userMirror, creatorProfile, authUser, socialAccounts] = await Promise.all([
      findByField(databases, env.databaseId, env.usersCollectionId, "userId", userId),
      findByField(databases, env.databaseId, env.creatorProfilesCollectionId, "userId", userId),
      // Akun Auth boleh tidak terbaca (mis. API key tanpa scope users) — jangan
      // menggagalkan seluruh profil hanya karena nama tidak terambil.
      users.get(userId).catch(() => null),
      listAll(databases, env.databaseId, env.creatorSocialAccountsCollectionId, [
        Query.equal("creatorId", userId),
      ]),
    ]);

    if (!creatorProfile) {
      return json(res, { error: "Creator profile not found" }, 404);
    }
    if (userMirror && userMirror.role !== "creator") {
      return json(res, { error: "User is not a creator account" }, 403);
    }

    const primarySocial = pickPrimarySocialAccount(socialAccounts);
    const startingPrice = await resolveStartingPrice(databases, env, userId);
    const displayName = str(creatorProfile.displayName);

    const profile = {
      // `userId`, bukan `$id` dokumen profil — orders.creatorId, rate_cards.creatorId,
      // dan wallets.userId semuanya memakai userId.
      id: userId,
      name: str(authUser?.name) || displayName,
      username: str(primarySocial?.username),
      avatarUrl: str(creatorProfile.avatarUrl),
      niche: normalizeNiche(creatorProfile.niche),
      bio: str(creatorProfile.bio),
      location: str(creatorProfile.city),
      followers: number(creatorProfile.totalFollowers),
      startingPrice,
      rating: number(creatorProfile.rating),
      completedJobs: number(creatorProfile.totalOrders),
      engagementRate: number(primarySocial?.engagementRate),
      instagramUrl: socialUrl(socialAccounts, "instagram"),
      tiktokUrl: socialUrl(socialAccounts, "tiktok"),
      isVerified: creatorProfile.isProfileCompleted === true,
      isOnboarded: creatorProfile.isProfileCompleted === true,
    };

    log(
      `Creator profile resolved for ${userId} ` +
        `(auth account ${authUser ? "read" : "unavailable"}, ${socialAccounts.length} social account(s))`
    );
    return json(res, profile);
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getEnv() {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: process.env.APPWRITE_FUNCTION_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || process.env.NEXT_PUBLIC_USER_COLLECTION || "users",
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

function createClient(env) {
  return new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

/**
 * Satu kreator bisa punya beberapa akun sosial. Pilih satu wakil supaya username
 * dan engagementRate tidak berasal dari akun yang berbeda — konvensi identik
 * dengan get-creator-directory.
 */
function pickPrimarySocialAccount(accounts) {
  let best = null;
  for (const account of accounts) {
    if (!best || isBetterSocialAccount(account, best)) best = account;
  }
  return best;
}

function isBetterSocialAccount(candidate, current) {
  const candidateIsPrimary = str(candidate.platform) === PRIMARY_PLATFORM;
  const currentIsPrimary = str(current.platform) === PRIMARY_PLATFORM;
  if (candidateIsPrimary !== currentIsPrimary) return candidateIsPrimary;
  return number(candidate.followers) > number(current.followers);
}

/** URL profil kedua platform deterministik dari username — tidak perlu kolom. */
function socialUrl(accounts, platform) {
  const account = accounts.find((a) => str(a.platform) === platform);
  const username = str(account?.username).replace(/^@/, "");
  if (!username) return undefined;
  return platform === "tiktok"
    ? `https://www.tiktok.com/@${username}`
    : `https://www.instagram.com/${username}`;
}

/**
 * startingPrice = paket termurah di seluruh rate card `published` milik kreator.
 * Draft sengaja tidak ikut supaya angka ini identik dengan yang dilihat UMKM
 * lewat get-creator-directory.
 */
async function resolveStartingPrice(databases, env, creatorId) {
  const rateCards = await listAll(databases, env.databaseId, env.rateCardsCollectionId, [
    Query.equal("creatorId", creatorId),
    Query.equal("status", "published"),
  ]);
  if (rateCards.length === 0) return 0;

  const packages = await listByIds(
    databases,
    env.databaseId,
    env.rateCardPackagesCollectionId,
    "rateCardId",
    rateCards.map((card) => card.$id)
  );

  let lowest = 0;
  for (const pkg of packages) {
    const price = number(pkg.price);
    if (price <= 0) continue;
    if (lowest === 0 || price < lowest) lowest = price;
  }
  return lowest;
}

function normalizeNiche(value) {
  const niche = str(value).toLowerCase();
  return NICHES.has(niche) ? niche : FALLBACK_NICHE;
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
