import { Client, Databases, Query, Users } from "node-appwrite";

const VALID_STATUSES = new Set([
  "requested",
  "processing",
  "succeeded",
  "failed",
  "reversed",
  "all",
]);
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_OFFSET = 10000;

export default createGetAdminWithdrawalQueueHandler();

export function createGetAdminWithdrawalQueueHandler({
  createDatabases = createDatabasesClient,
  createUsers = createUsersClient,
} = {}) {
  return async ({ req, res, log, error }) => {
    try {
      if (req.method && req.method !== "POST" && req.method !== "GET") {
        return json(res, { error: "Method not allowed" }, 405);
      }

      const env = getEnv(req);
      const userId = getUserId(req);
      if (!userId) return json(res, { error: "Unauthorized" }, 401);

      const input = parseInput(req);
      if (!VALID_STATUSES.has(input.status)) {
        return json(res, { error: "Status withdrawal tidak valid." }, 400);
      }
      if (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > MAX_LIMIT) {
        return json(res, { error: `Limit harus antara 1 dan ${MAX_LIMIT}.` }, 400);
      }
      if (!Number.isInteger(input.offset) || input.offset < 0 || input.offset > MAX_OFFSET) {
        return json(res, { error: `Offset harus antara 0 dan ${MAX_OFFSET}.` }, 400);
      }

      const databases = createDatabases(env);
      const admin = await findActiveAdmin(databases, createUsers, env, userId);
      if (!admin) {
        log(`Admin withdrawal queue ditolak untuk ${userId}`);
        return json(res, { error: "Akses Admin ditolak." }, 403);
      }

      const queries = [
        Query.orderDesc("$createdAt"),
        Query.limit(input.limit),
        Query.offset(input.offset),
      ];
      if (input.status !== "all") queries.push(Query.equal("status", input.status));

      const result = await databases.listDocuments(
        env.databaseId,
        env.withdrawalsCollectionId,
        queries,
      );
      const items = await toQueueDtos(databases, env, result.documents);

      return json(res, {
        items,
        total: result.total,
        limit: input.limit,
        offset: input.offset,
      });
    } catch (err) {
      error(err?.stack || err?.message || String(err));
      return json(res, { error: "Internal server error" }, 500);
    }
  };
}

async function findActiveAdmin(databases, createUsers, env, userId) {
  try {
    const result = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    const user = result.documents[0];
    if (user) {
      if ((user.status || "active").toLowerCase() !== "active") return null;
      if (user.role?.toLowerCase() === "admin") return user;
    }
  } catch {
    return null;
  }

  try {
    const authUser = await createUsers(env).get(userId);
    if (!authUser || authUser.status === false) return null;
    const hasLabel = Array.isArray(authUser.labels)
      && authUser.labels.some((label) => typeof label === "string" && label.toLowerCase() === "admin");
    return hasLabel ? { userId, role: "admin", status: "active" } : null;
  } catch {
    return null;
  }
}

async function toQueueDtos(databases, env, withdrawals) {
  if (withdrawals.length === 0) return [];
  const creatorIds = [...new Set(withdrawals.map((item) => string(item.userId)).filter(Boolean))]
    .slice(0, MAX_LIMIT);
  const creatorResult = creatorIds.length
    ? await databases.listDocuments(env.databaseId, env.creatorProfilesCollectionId, [
      Query.equal("userId", creatorIds),
      Query.limit(MAX_LIMIT),
    ])
    : { documents: [] };
  const creators = new Map(
    creatorResult.documents.map((creator) => [string(creator.userId), creator]),
  );

  return withdrawals.map((withdrawal) => {
    const creator = creators.get(string(withdrawal.userId));
    return {
      id: string(withdrawal.$id),
      userId: string(withdrawal.userId),
      creator: {
        name: nullableString(creator?.displayName) || "Content Creator",
        username: nullableString(creator?.username) || nullableString(creator?.tiktokHandle),
        avatarUrl: nullableString(creator?.avatarUrl),
      },
      amount: Number(withdrawal.amount) || 0,
      payoutMethod: string(withdrawal.payoutMethod),
      providerName: string(withdrawal.providerName),
      accountNumber: string(withdrawal.accountNumber),
      accountName: string(withdrawal.accountName),
      status: VALID_STATUSES.has(withdrawal.status) && withdrawal.status !== "all"
        ? withdrawal.status
        : "requested",
      requestedAt: nullableString(withdrawal.$createdAt) || nullableString(withdrawal.createdAt),
      processingAt: nullableString(withdrawal.processing_at),
      processedAt: nullableString(withdrawal.processedAt),
      failureReason: nullableString(withdrawal.failure_reason),
      transferReference: nullableString(withdrawal.transfer_reference),
      adminNote: nullableString(withdrawal.admin_note),
      processedBy: nullableString(withdrawal.processed_by),
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
    withdrawalsCollectionId: process.env.WITHDRAWALS_COLLECTION_ID || "withdrawals",
    creatorProfilesCollectionId: process.env.CREATOR_PROFILES_COLLECTION_ID || "creator_profiles",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createClient(env) {
  return new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);
}

function createDatabasesClient(env) { return new Databases(createClient(env)); }
function createUsersClient(env) { return new Users(createClient(env)); }
function getUserId(req) { return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"]; }
function string(value) { return typeof value === "string" ? value : ""; }
function nullableString(value) { return string(value) || null; }
function json(res, body, statusCode = 200) { return res.json(body, statusCode, { "content-type": "application/json" }); }

function parseInput(req) {
  let body = {};
  try {
    body = req.bodyJson && typeof req.bodyJson === "object"
      ? req.bodyJson
      : JSON.parse(req.bodyText || req.body || "{}");
  } catch {
    // Invalid JSON uses defaults; explicit invalid values are rejected below.
  }
  return {
    status: typeof body.status === "string" ? body.status : "requested",
    limit: body.limit === undefined ? DEFAULT_LIMIT : body.limit,
    offset: body.offset === undefined ? 0 : body.offset,
  };
}
