import { Client, Databases, ID, InputFile, Permission, Role, Storage } from "node-appwrite";

// Chat attachment upload. Does NOT use the Users File Manager (no user_files, no quota).
// Only validates conversation participant + type/size, then uploads to the chat-files bucket.
const RULES = {
  image: { maxBytes: 5 * 1024 * 1024, ext: ["jpg", "jpeg", "png", "webp"], mimes: ["image/jpeg", "image/png", "image/webp"] },
  file: { maxBytes: 10 * 1024 * 1024, ext: ["pdf", "doc", "docx"], mimes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
};

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") return json(res, { error: "Method not allowed" }, 405);

    const env = getEnv();
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const payload = parseBody(req);
    const err = validatePayload(payload);
    if (err) return json(res, { error: err }, 400);

    const buffer = Buffer.from(payload.contentBase64, "base64");
    if (buffer.length !== Number(payload.sizeBytes)) return json(res, { error: "File size does not match payload" }, 400);
    const rule = RULES[payload.kind];
    if (buffer.length > rule.maxBytes) return json(res, { error: `${payload.kind} exceeds size limit` }, 413);

    const databases = createClient(env, Databases);
    const conversation = await databases.getDocument(env.databaseId, env.conversationsCollectionId, payload.conversationId).catch(() => null);
    if (!conversation) return json(res, { error: "Conversation not found" }, 404);
    if (conversation.umkm_id !== userId && conversation.creator_id !== userId) {
      return json(res, { error: "Not a participant of this conversation" }, 403);
    }

    const storage = createClient(env, Storage);
    const participants = [conversation.umkm_id, conversation.creator_id].filter(Boolean);
    const permissions = participants.flatMap((uid) => [Permission.read(Role.user(uid)), Permission.delete(Role.user(uid))]);

    const uploaded = await storage.createFile(env.chatBucketId, ID.unique(), InputFile.fromBuffer(buffer, payload.fileName), permissions);
    const url = `${env.appwriteEndpoint}/storage/buckets/${env.chatBucketId}/files/${uploaded.$id}/view?project=${env.appwriteProjectId}`;

    log(`Chat attachment ${uploaded.$id} uploaded for ${userId} in ${payload.conversationId}`);
    return json(res, {
      status: "ok",
      attachmentUrl: url,
      attachmentName: payload.fileName,
      attachmentSize: buffer.length,
      attachmentMime: payload.mimeType,
      fileId: uploaded.$id,
    });
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
    conversationsCollectionId: process.env.CONVERSATIONS_COLLECTION_ID || "conversations",
    chatBucketId: process.env.CHAT_FILES_BUCKET_ID || "chat-files",
  };
  const required = ["appwriteEndpoint", "appwriteProjectId", "appwriteApiKey", "databaseId"];
  const missing = required.filter((k) => !env[k]);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createClient(env, Service) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Service(client);
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const raw = req.bodyText || req.body || "{}";
  return typeof raw === "object" ? raw : JSON.parse(raw);
}

function validatePayload(p) {
  const required = ["conversationId", "kind", "fileName", "mimeType", "sizeBytes", "contentBase64"];
  const missing = required.filter((f) => !p?.[f]);
  if (missing.length > 0) return `Missing required fields: ${missing.join(", ")}`;
  const rule = RULES[p.kind];
  if (!rule) return "Invalid kind (expected 'image' or 'file')";
  if (!rule.mimes.includes(p.mimeType)) return `MIME type not allowed for ${p.kind}`;
  const ext = String(p.fileName).split(".").pop()?.toLowerCase();
  if (!rule.ext.includes(ext)) return `Extension .${ext} not allowed for ${p.kind}`;
  if (!Number.isFinite(Number(p.sizeBytes)) || Number(p.sizeBytes) <= 0) return "Invalid file size";
  return null;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
