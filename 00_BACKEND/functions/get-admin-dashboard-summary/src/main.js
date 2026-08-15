import { Client, Databases, Query } from "node-appwrite";

export default createGetAdminDashboardSummaryHandler();

export function createGetAdminDashboardSummaryHandler({ createDatabases = createDatabasesClient } = {}) {
  return async ({ req, res, log, error }) => {
    try {
      if (req.method && req.method !== "POST" && req.method !== "GET") return json(res, { error: "Method not allowed" }, 405);
      const env = getEnv(req);
      const userId = getUserId(req);
      if (!userId) return json(res, { error: "Unauthorized" }, 401);
      const databases = createDatabases(env);
      const userResult = await databases.listDocuments(env.databaseId, env.usersCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
      const user = userResult.documents[0];
      if (user?.role !== "admin" || user?.status !== "active") {
        log(`Admin dashboard ditolak untuk ${userId}`);
        return json(res, { error: "Akses Admin ditolak." }, 403);
      }
      const [pending, reviewed, active] = await Promise.all([
        databases.listDocuments(env.databaseId, env.submissionsCollectionId, [Query.equal("status", "pending"), Query.limit(1)]),
        databases.listDocuments(env.databaseId, env.submissionsCollectionId, [Query.notEqual("status", "pending"), Query.limit(1)]),
        databases.listDocuments(env.databaseId, env.campaignsCollectionId, [Query.equal("status", "active"), Query.limit(1)]),
      ]);
      return json(res, {
        pendingSubmissionsCount: pending.total,
        reviewedSubmissionsCount: reviewed.total,
        activeCampaignsCount: active.total,
      });
    } catch (err) {
      error(err?.stack || err?.message || String(err));
      return json(res, { error: "Internal server error" }, 500);
    }
  };
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
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}
function createDatabasesClient(env) { return new Databases(new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey)); }
function getUserId(req) { return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"]; }
function json(res, body, statusCode = 200) { return res.json(body, statusCode, { "content-type": "application/json" }); }
