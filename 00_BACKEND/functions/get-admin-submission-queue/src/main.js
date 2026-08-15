import { Client, Databases, Query } from "node-appwrite";

const VALID_STATUS = new Set(["pending", "approved", "rejected", "all"]);
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export default createGetAdminSubmissionQueueHandler();

export function createGetAdminSubmissionQueueHandler({ createDatabases = createDatabasesClient } = {}) {
  return async ({ req, res, log, error }) => {
    try {
      if (req.method && req.method !== "POST" && req.method !== "GET") {
        return json(res, { error: "Method not allowed" }, 405);
      }

      const env = getEnv(req);
      const userId = getUserId(req);
      if (!userId) return json(res, { error: "Unauthorized" }, 401);

      const input = parseInput(req);
      if (!VALID_STATUS.has(input.status)) {
        return json(res, { error: "Status submission tidak valid." }, 400);
      }
      if (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > MAX_LIMIT) {
        return json(res, { error: `Limit harus antara 1 dan ${MAX_LIMIT}.` }, 400);
      }

      const databases = createDatabases(env);
      const admin = await findActiveAdmin(databases, env, userId);
      if (!admin) {
        log(`Admin queue ditolak untuk ${userId}`);
        return json(res, { error: "Akses Admin ditolak." }, 403);
      }

      const queries = [Query.orderDesc("$createdAt"), Query.limit(input.limit)];
      if (input.status !== "all") queries.push(Query.equal("status", input.status));
      const submissionResult = await databases.listDocuments(env.databaseId, env.submissionsCollectionId, queries);
      const items = await toQueueDtos(databases, env, submissionResult.documents);

      return json(res, { items, total: submissionResult.total });
    } catch (err) {
      error(err?.stack || err?.message || String(err));
      return json(res, { error: "Internal server error" }, 500);
    }
  };
}

async function findActiveAdmin(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  const user = result.documents[0];
  return user?.role === "admin" && user?.status === "active" ? user : null;
}

async function toQueueDtos(databases, env, submissions) {
  if (submissions.length === 0) return [];
  const campaignIds = unique(submissions.map((item) => str(item.campaignId)));
  const creatorIds = unique(submissions.map((item) => str(item.creatorId)));
  const [campaignResult, creatorResult] = await Promise.all([
    campaignIds.length
      ? databases.listDocuments(env.databaseId, env.campaignsCollectionId, [Query.equal("$id", campaignIds), Query.limit(MAX_LIMIT)])
      : { documents: [] },
    creatorIds.length
      ? databases.listDocuments(env.databaseId, env.creatorProfilesCollectionId, [Query.equal("userId", creatorIds), Query.limit(MAX_LIMIT)])
      : { documents: [] },
  ]);
  const umkmIds = unique(campaignResult.documents.map((item) => str(item.umkmId)));
  const umkmResult = umkmIds.length
    ? await databases.listDocuments(env.databaseId, env.umkmProfilesCollectionId, [Query.equal("userId", umkmIds), Query.limit(MAX_LIMIT)])
    : { documents: [] };
  const campaigns = by(campaignResult.documents, "$id");
  const creators = by(creatorResult.documents, "userId");
  const umkms = by(umkmResult.documents, "userId");

  return submissions.map((submission) => {
    const campaign = campaigns.get(str(submission.campaignId));
    const creator = creators.get(str(submission.creatorId));
    const umkm = umkms.get(str(campaign?.umkmId));
    const verifiedViews = Number(submission.views_final ? submission.views_count : submission.views) || 0;
    const rewardPer1000Views = Number(campaign?.rewardPer1000Views) || 0;
    const estimatedReward = Math.floor(verifiedViews / 1000) * rewardPer1000Views;
    const displayName = str(creator?.displayName) || "Content Creator";

    return {
      id: str(submission.$id),
      campaignId: str(submission.campaignId),
      creator: {
        id: str(submission.creatorId),
        name: displayName,
        username: str(creator?.username) || str(creator?.tiktokHandle) || "@creator",
        avatarUrl: optionalString(creator?.avatarUrl),
        tiktokHandle: optionalString(creator?.tiktokHandle),
      },
      campaign: {
        id: str(submission.campaignId),
        title: str(campaign?.title) || "Campaign Pay-Per-View",
        rewardPer1000Views,
        platform: platform(submission.platform),
      },
      umkm: {
        id: str(campaign?.umkmId),
        name: str(umkm?.businessName) || str(umkm?.brandName) || "UMKM Client",
        ownerName: optionalString(umkm?.ownerName),
      },
      platform: platform(submission.platform),
      postUrl: str(submission.postUrl),
      note: optionalString(submission.caption) || optionalString(submission.note),
      status: submissionStatus(submission.status),
      submittedAt: str(submission.$createdAt) || str(submission.submittedAt),
      verifiedViews,
      verifiedAt: optionalString(submission.views_captured_at) || optionalString(submission.verifiedAt),
      verifiedBy: optionalString(submission.views_source) || optionalString(submission.verifiedBy),
      estimatedReward,
      finalReward: estimatedReward,
      rejectionReason: optionalString(submission.reviewNotes) || optionalString(submission.rejectionReason),
    };
  });
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
    submissionsCollectionId: process.env.CAMPAIGN_SUBMISSIONS_COLLECTION_ID || "campaign_submissions",
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || "campaigns",
    creatorProfilesCollectionId: process.env.CREATOR_PROFILES_COLLECTION_ID || "creator_profiles",
    umkmProfilesCollectionId: process.env.UMKM_PROFILES_COLLECTION_ID || "umkm_profiles",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  return new Databases(new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey));
}

function getUserId(req) { return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"]; }
function parseInput(req) {
  let body = {};
  try { body = req.bodyJson && typeof req.bodyJson === "object" ? req.bodyJson : JSON.parse(req.bodyText || req.body || "{}"); } catch { /* invalid input becomes default */ }
  return { status: typeof body.status === "string" ? body.status : "pending", limit: body.limit === undefined ? DEFAULT_LIMIT : body.limit };
}
function unique(values) { return [...new Set(values.filter(Boolean))].slice(0, MAX_LIMIT); }
function by(items, key) { return new Map(items.map((item) => [str(item[key]), item])); }
function str(value) { return typeof value === "string" ? value : ""; }
function optionalString(value) { const text = str(value); return text || undefined; }
function submissionStatus(value) { return VALID_STATUS.has(value) && value !== "all" ? value : "pending"; }
function platform(value) { return value === "instagram" || value === "youtube" ? value : "tiktok"; }
function json(res, body, statusCode = 200) { return res.json(body, statusCode, { "content-type": "application/json" }); }
