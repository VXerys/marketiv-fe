import { Client, Databases, ID, Messaging, Permission, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const message = parseBody(req);
    const conversationId = message.conversation_id;
    const senderId = message.sender_id;

    if (!conversationId || !senderId) {
      return json(res, { error: "Missing conversation_id or sender_id in event payload" }, 400);
    }

    const client = createClient(env);
    const databases = new Databases(client);
    const messaging = new Messaging(client);
    const conversation = await databases.getDocument(env.databaseId, env.conversationsCollectionId, conversationId);
    const receiverId = getReceiverId(conversation, senderId);

    if (!receiverId) {
      log(`No chat notification receiver found for message ${message.$id || "unknown"}`);
      return json(res, { status: "skipped", reason: "receiver_not_found" });
    }

    const title = "Pesan chat baru";
    const body = createNotificationBody(message);
    const notification = await databases.createDocument(
      env.databaseId,
      env.notificationsCollectionId,
      ID.unique(),
      {
        userId: receiverId,
        title,
        message: body,
        type: "chat_message",
        isRead: false,
        createdAt: new Date().toISOString()
      },
      [Permission.read(Role.user(receiverId)), Permission.update(Role.user(receiverId))]
    );

    let pushSent = false;
    try {
      await messaging.createPush(
        ID.unique(),
        title,
        body,
        [],
        [receiverId],
        [],
        {
          type: "chat_message",
          conversationId,
          messageId: message.$id || ""
        }
      );
      pushSent = true;
    } catch (err) {
      log(`Push notification skipped/failed for ${receiverId}: ${err?.message || String(err)}`);
    }

    return json(res, { status: "ok", notificationId: notification.$id, pushSent });
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
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications"
  };

  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createClient(env) {
  return new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function getReceiverId(conversation, senderId) {
  if (conversation.umkm_id && conversation.umkm_id !== senderId) return conversation.umkm_id;
  if (conversation.creator_id && conversation.creator_id !== senderId) return conversation.creator_id;
  return null;
}

function createNotificationBody(message) {
  if (message.content) return String(message.content).slice(0, 120);
  if (message.message_type === "offer") return "Offer baru dikirim di chat.";
  if (["image", "file"].includes(message.message_type)) return "Attachment baru dikirim di chat.";
  return "Buka chat untuk melihat pesan baru.";
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
