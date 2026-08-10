import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") return json(res, { error: "Method not allowed" }, 405);

    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const env = getEnv(req);
    const body = parseBody(req);
    const conversationId = str(body.conversationId);
    if (!conversationId) return json(res, { error: "Conversation ID wajib diisi." }, 400);

    const databases = createDatabasesClient(env);
    const conversation = await loadConversation(databases, env, conversationId);
    if (!conversation) return json(res, { error: "Percakapan tidak ditemukan." }, 404);
    if (conversation.umkmId !== userId && conversation.creatorId !== userId) {
      return json(res, { error: "Percakapan tidak ditemukan." }, 404);
    }

    const unreadMessages = await databases.listDocuments(env.databaseId, env.messagesCollectionId, [
      Query.equal("conversation_id", conversationId),
      Query.notEqual("sender_id", userId),
      Query.isNull("read_at"),
      Query.limit(100),
    ]);

    const now = new Date().toISOString();
    for (const msg of unreadMessages.documents) {
      await databases.updateDocument(env.databaseId, env.messagesCollectionId, msg.$id, { read_at: now });
    }

    log(`Marked ${unreadMessages.documents.length} messages as read in ${conversationId} for ${userId}`);
    return json(res, { ok: true, updated: unreadMessages.documents.length });
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
    conversationsCollectionId: process.env.CONVERSATIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_CONVERSATION_COLLECTION || "conversations",
    messagesCollectionId: process.env.MESSAGES_COLLECTION_ID || "messages",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

async function loadConversation(databases, env, conversationId) {
  try {
    const doc = await databases.getDocument(env.databaseId, env.conversationsCollectionId, conversationId);
    return {
      umkmId: str(doc.umkm_id),
      creatorId: str(doc.creator_id),
    };
  } catch (err) {
    if (err?.code === 404) return null;
    throw err;
  }
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
