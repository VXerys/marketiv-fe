import { Client, Databases, Query, Permission, Role } from "node-appwrite";
import { createHash } from "node:crypto";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const payload = parseBody(req);
    
    const { userId, status, reason } = payload;
    if (!userId || !status || !reason) {
      return res.json({ error: "Missing required fields" }, 400);
    }
    if (status !== "suspended" && status !== "terminated") {
      return res.json({ error: "Invalid status" }, 400);
    }

    const databases = createDatabasesClient(env);
    
    const userDoc = await getUser(databases, env, userId);
    if (!userDoc) {
      return res.json({ error: "User not found" }, 404);
    }
    if (userDoc.status && userDoc.status !== "active") {
      return res.json({ error: "User is already suspended or terminated" }, 409);
    }

    const suspendedAt = new Date();
    const deadlineAt = new Date(suspendedAt.getTime() + 14 * 24 * 60 * 60 * 1000);

    await databases.updateDocument(env.databaseId, env.usersCollectionId, userDoc.$id, {
      status,
      suspended_at: suspendedAt.toISOString()
    });

    const kind = status === "suspended" ? "account_suspended" : "account_terminated";
    const title = status === "suspended" ? "Akun Ditangguhkan" : "Akun Dihentikan";
    const message = `Akun Anda ${status === "suspended" ? "ditangguhkan" : "dihentikan"} karena: ${reason}. Anda dapat mengajukan banding dalam waktu 14 hari (hingga ${deadlineAt.toISOString().split("T")[0]}).`;
    
    const notificationId = deterministicNotificationId(userDoc.$id, kind);
    await notify(databases, env, {
      sourceId: userDoc.$id,
      kind,
      userId,
      title,
      message,
      type: "system"
    }, log);

    log(`User ${userId} ${status}. Deadline: ${deadlineAt.toISOString()}`);
    return res.json({
      status,
      deadlineAt: deadlineAt.toISOString(),
      notificationId
    });

  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return res.json({ error: "Internal server error" }, 500);
  }
};

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing env: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

async function getUser(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents[0] || null;
}

function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId, env.notificationsCollectionId,
      deterministicNotificationId(payload.sourceId, payload.kind),
      { userId: payload.userId, title: payload.title, message: payload.message,
        type: payload.type, isRead: false, createdAt: new Date().toISOString() },
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))]
    );
  } catch (err) {
    if (err?.code === 409) return;
    log(`Notify ${payload.kind} failed for ${payload.userId}: ${err?.message || err}`);
  }
}
