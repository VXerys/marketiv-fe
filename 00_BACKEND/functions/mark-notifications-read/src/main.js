import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") return json(res, { error: "Method not allowed" }, 405);

    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const env = getEnv(req);
    const body = parseBody(req);
    const notificationIds = body.ids || [];
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return json(res, { error: "Daftar ID notifikasi wajib diisi." }, 400);
    }

    const databases = createDatabasesClient(env);
    
    // Safety check: ensure the notifications belong to the user
    const notifications = await Promise.all(
      notificationIds.map((id) =>
        databases.getDocument(env.databaseId, env.notificationsCollectionId, id).catch(() => null)
      )
    );

    let updated = 0;
    for (const notif of notifications) {
      if (notif && notif.userId === userId && notif.isRead === false) {
        await databases.updateDocument(env.databaseId, env.notificationsCollectionId, notif.$id, { isRead: true });
        updated++;
      }
    }

    log(`Marked ${updated} notifications as read for ${userId}`);
    return json(res, { ok: true, updated });
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
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
