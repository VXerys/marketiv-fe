import { Client, Databases, Query, Permission, Role, ID } from "node-appwrite";
import { createHash } from "node:crypto";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const userId = getUserId(req);
    if (!userId) return res.json({ error: "Unauthorized" }, 401);

    const payload = parseBody(req);
    const { reason, evidence, actionRef } = payload;
    
    if (!reason) {
      return res.json({ error: "Missing reason" }, 400);
    }

    const databases = createDatabasesClient(env);
    
    const userDoc = await getUser(databases, env, userId);
    if (!userDoc) return res.json({ error: "User not found" }, 404);
    if (userDoc.status === "active") {
      return res.json({ error: "Akun Anda berstatus aktif, tidak bisa banding." }, 403);
    }

    if (!userDoc.suspended_at) {
      return res.json({ error: "Tanggal suspend tidak ditemukan." }, 400);
    }

    const suspendedAt = new Date(userDoc.suspended_at);
    const deadlineAt = new Date(suspendedAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    if (new Date() > deadlineAt) {
      return res.json({ error: "Batas waktu banding telah berakhir." }, 403);
    }

    const openAppeals = await databases.listDocuments(env.databaseId, env.appealsCollectionId, [
      Query.equal("userId", userId),
      Query.equal("status", ["submitted", "under_review"]),
      Query.limit(1)
    ]);

    if (openAppeals.documents.length > 0) {
      return res.json({ error: "Anda sudah memiliki banding yang sedang diproses." }, 409);
    }

    const slaDecidedAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const appeal = await databases.createDocument(
      env.databaseId,
      env.appealsCollectionId,
      ID.unique(),
      {
        userId,
        actionRef: actionRef || "unknown",
        reason,
        evidence: evidence || null,
        deadlineAt: deadlineAt.toISOString(),
        slaDecidedAt: slaDecidedAt.toISOString(),
        status: "submitted",
      },
      [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))]
    );

    const kind = "appeal_submitted";
    const notificationId = deterministicNotificationId(appeal.$id, kind);
    await notify(databases, env, {
      sourceId: appeal.$id,
      kind,
      userId,
      title: "Banding Diterima",
      message: "Banding Anda telah kami terima dan akan direview dalam waktu 7 hari kerja.",
      type: "system"
    }, log);

    log(`User ${userId} created appeal ${appeal.$id}. SLA: ${slaDecidedAt.toISOString()}`);
    return res.json({
      appealId: appeal.$id,
      status: "submitted",
      slaDecidedAt: slaDecidedAt.toISOString(),
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
    appealsCollectionId: process.env.APPEALS_COLLECTION_ID || "appeals",
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

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
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
