import { Client, Databases, Query, Storage } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "DELETE") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv();
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const payload = parseBody(req);
    if (!payload.fileId) return json(res, { error: "Missing fileId" }, 400);

    const databases = createDatabasesClient(env);
    const storage = createStorageClient(env);
    const file = await databases.getDocument(env.databaseId, env.userFilesCollectionId, payload.fileId);

    if (file.userId !== userId) return json(res, { error: "Forbidden" }, 403);
    if (file.status === "deleted") return json(res, { status: "ok", file });

    try {
      await storage.deleteFile(file.bucketId, file.storageFileId);
    } catch (err) {
      if (err?.code !== 404) throw err;
    }

    const usage = await getStorageUsage(databases, env, userId);
    const nextUsedBytes = Math.max(0, Number(usage?.usedBytes || 0) - Number(file.sizeBytes || 0));
    const nextFileCount = Math.max(0, Number(usage?.fileCount || 0) - 1);

    const deleted = await databases.updateDocument(env.databaseId, env.userFilesCollectionId, file.$id, {
      status: "deleted",
      deletedAt: new Date().toISOString()
    });

    if (usage) {
      await databases.updateDocument(env.databaseId, env.storageUsageCollectionId, usage.$id, {
        usedBytes: nextUsedBytes,
        fileCount: nextFileCount
      });
    }

    log(`File ${file.$id} deleted for ${userId}`);
    return json(res, { status: "ok", file: deleted });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    if (err?.code === 404) return json(res, { error: "File not found" }, 404);
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getEnv() {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    userFilesCollectionId: process.env.USER_FILES_COLLECTION_ID || "user_files",
    storageUsageCollectionId: process.env.USER_STORAGE_USAGE_COLLECTION_ID || "user_storage_usage"
  };

  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

function createStorageClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Storage(client);
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

async function getStorageUsage(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.storageUsageCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
