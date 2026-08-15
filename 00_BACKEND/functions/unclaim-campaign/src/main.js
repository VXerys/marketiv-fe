import { Client, Databases, Permission, Query, Role } from "node-appwrite";
import { decrementColumn } from "./atomic.js";

export default createUnclaimCampaignHandler();

export function createUnclaimCampaignHandler({ createDatabases = createDatabasesClient } = {}) {
  return async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") return json(res, { error: "Method not allowed" }, 405);
    const env = getEnv(req);
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);
    const claimId = stringValue(parseBody(req).claimId);
    if (!claimId) return json(res, { error: "Claim ID wajib diisi." }, 400);
    const databases = createDatabases(env);
    const users = await databases.listDocuments(env.databaseId, env.usersCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
    const user = users.documents[0];
    if (user?.role !== "creator" || user?.status !== "active") return json(res, { error: "Akses kreator aktif diperlukan." }, 403);
    let claim;
    try { claim = await databases.getDocument(env.databaseId, env.claimsCollectionId, claimId); } catch (err) {
      if (err?.code === 404) return json(res, { error: "Claim tidak ditemukan." }, 404);
      throw err;
    }
    if (stringValue(claim.creatorId) !== userId) return json(res, { error: "Claim bukan milik Anda." }, 403);
    if (stringValue(claim.status) !== "claimed") return json(res, { error: "Hanya claim berstatus claimed yang dapat dibatalkan." }, 409);
    const campaignId = stringValue(claim.campaignId);
    if (!campaignId) throw new Error(`Claim ${claimId} tidak memiliki campaignId`);
    await databases.deleteDocument(env.databaseId, env.claimsCollectionId, claimId);
    try {
      await decrementColumn(env, env.campaignsCollectionId, campaignId, "totalClaims", 1, 0);
    } catch (decrementError) {
      const restored = await restoreClaim(databases, env, claim, userId, log);
      const detail = decrementError?.message || String(decrementError);
      if (restored) {
        error(`Unclaim ${claimId} restored after counter decrement failure: ${detail}`);
        return json(res, { error: "Pembatalan gagal; claim dipulihkan karena kuota tidak dapat dikembalikan." }, 500);
      }
      error(`CRITICAL unclaim consistency failure claim=${claimId} campaign=${campaignId}: ${detail}`);
      return json(res, { error: "Konsistensi claim gagal dipulihkan. Hubungi support dengan ID claim ini." }, 500);
    }
    log(`Claim ${claimId} removed by creator ${userId}; campaign ${campaignId} slot restored`);
    return json(res, { success: true, claimId });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
  };
}

async function restoreClaim(databases, env, claim, creatorId, log) {
  try {
    await databases.createDocument(env.databaseId, env.claimsCollectionId, claim.$id,
      { campaignId: claim.campaignId, creatorId, status: "claimed", claimedAt: claim.claimedAt },
      [Permission.read(Role.user(creatorId)), Permission.update(Role.user(creatorId)), Permission.delete(Role.user(creatorId))]);
    log(`Claim ${claim.$id} restored after failed unclaim decrement`);
    return true;
  } catch (restoreError) {
    log(`Claim ${claim.$id} restore failed: ${restoreError?.message || String(restoreError)}`);
    return false;
  }
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
    claimsCollectionId: process.env.CAMPAIGN_CLAIMS_COLLECTION_ID || process.env.CLAIMS_COLLECTION_ID || "campaign_claims",
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || "campaigns",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}
function createDatabasesClient(env) { return new Databases(new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey)); }
function getUserId(req) { return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"]; }
function parseBody(req) { try { return req.bodyJson && typeof req.bodyJson === "object" ? req.bodyJson : JSON.parse(req.bodyText || req.body || "{}"); } catch { return {}; } }
function stringValue(value) { return typeof value === "string" ? value : ""; }
function json(res, body, statusCode = 200) { return res.json(body, statusCode, { "content-type": "application/json" }); }
