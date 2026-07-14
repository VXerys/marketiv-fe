import { Client, Databases, ID, InputFile, Permission, Query, Role, Storage } from "node-appwrite";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_ACTIVE_FILES = 100;
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv();
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const payload = parseBody(req);
    const validationError = validatePayload(payload);
    if (validationError) return json(res, { error: validationError }, 400);

    const fileBuffer = Buffer.from(payload.contentBase64, "base64");
    if (fileBuffer.length !== Number(payload.sizeBytes)) {
      return json(res, { error: "File size does not match payload" }, 400);
    }

    const databases = createDatabasesClient(env);
    const storage = createStorageClient(env);
    const usage = await getStorageUsage(databases, env, userId);

    if (!usage) return json(res, { error: "Storage usage not found" }, 404);
    if (usage.fileCount >= MAX_ACTIVE_FILES) return json(res, { error: "Active file limit reached" }, 409);
    if (Number(usage.usedBytes) + fileBuffer.length > Number(usage.quotaBytes)) {
      return json(res, { error: "Storage quota exceeded" }, 409);
    }

    const bucketId = env.defaultBucketId;
    const uploaded = await storage.createFile(
      bucketId,
      ID.unique(),
      InputFile.fromBuffer(fileBuffer, payload.fileName),
      [Permission.read(Role.user(userId)), Permission.delete(Role.user(userId))]
    );

    const metadata = await databases.createDocument(
      env.databaseId,
      env.userFilesCollectionId,
      ID.unique(),
      {
        userId,
        storageFileId: uploaded.$id,
        bucketId,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        sizeBytes: fileBuffer.length,
        status: "active",
        createdAt: new Date().toISOString(),
        deletedAt: null
      },
      [Permission.read(Role.user(userId))]
    );

    await databases.updateDocument(env.databaseId, env.storageUsageCollectionId, usage.$id, {
      usedBytes: Number(usage.usedBytes) + fileBuffer.length,
      fileCount: Number(usage.fileCount) + 1
    });

    log(`File ${metadata.$id} uploaded for ${userId}`);
    return json(res, { status: "ok", file: metadata, storageFile: uploaded });
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
    userFilesCollectionId: process.env.USER_FILES_COLLECTION_ID || "user_files",
    storageUsageCollectionId: process.env.USER_STORAGE_USAGE_COLLECTION_ID || "user_storage_usage",
    defaultBucketId: process.env.DEFAULT_STORAGE_BUCKET_ID || process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  };

  const required = ["appwriteEndpoint", "appwriteProjectId", "appwriteApiKey", "databaseId", "defaultBucketId"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

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

function validatePayload(payload) {
  const required = ["fileName", "mimeType", "sizeBytes", "contentBase64"];
  const missing = required.filter((field) => !payload?.[field]);
  if (missing.length > 0) return `Missing required fields: ${missing.join(", ")}`;
  if (!isAllowedMimeType(payload.mimeType)) return "File type is not allowed";
  if (!Number.isFinite(Number(payload.sizeBytes)) || Number(payload.sizeBytes) <= 0) return "Invalid file size";
  if (Number(payload.sizeBytes) > MAX_FILE_SIZE_BYTES) return "File exceeds 20 MB limit";
  return null;
}

function isAllowedMimeType(mimeType) {
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix)) || ALLOWED_MIME_TYPES.has(mimeType);
}

async function getStorageUsage(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.storageUsageCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
