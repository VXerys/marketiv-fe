import { Client, Databases, Query, Permission, Role } from "node-appwrite";
import { createHash } from "node:crypto";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const payload = parseBody(req);
    
    const { appealId, decision, note } = payload;
    if (!appealId || !decision) {
      return res.json({ error: "Missing appealId or decision" }, 400);
    }
    if (decision !== "approved" && decision !== "rejected") {
      return res.json({ error: "Invalid decision" }, 400);
    }

    const databases = createDatabasesClient(env);
    
    let appeal;
    try {
      appeal = await databases.getDocument(env.databaseId, env.appealsCollectionId, appealId);
    } catch (err) {
      return res.json({ error: "Appeal not found" }, 404);
    }

    if (appeal.status === "approved" || appeal.status === "rejected") {
      return res.json({ error: "Appeal is already decided" }, 409);
    }

    const newStatus = decision;

    await databases.updateDocument(env.databaseId, env.appealsCollectionId, appealId, {
      status: newStatus,
      decision: note || "",
      decidedAt: new Date().toISOString()
    });

    const userDoc = await getUser(databases, env, appeal.userId);
    
    if (newStatus === "approved") {
      if (userDoc && userDoc.status !== "active") {
        await databases.updateDocument(env.databaseId, env.usersCollectionId, userDoc.$id, {
          status: "active"
        });
      }

      const kind = "account_restored";
      const notificationId = deterministicNotificationId(appeal.$id, kind);
      await notify(databases, env, {
        sourceId: appeal.$id,
        kind,
        userId: appeal.userId,
        title: "Banding Disetujui",
        message: `Banding Anda disetujui. Status akun Anda telah dikembalikan menjadi aktif. ${note ? note : ""}`.trim(),
        type: "system"
      }, log);
      
      log(`Appeal ${appealId} approved. User ${appeal.userId} active.`);
      return res.json({ status: "approved", notificationId });
    } else {
      const kind = "appeal_rejected";
      const notificationId = deterministicNotificationId(appeal.$id, kind);
      await notify(databases, env, {
        sourceId: appeal.$id,
        kind,
        userId: appeal.userId,
        title: "Banding Ditolak",
        message: `Banding Anda ditolak. ${note ? note : ""}`.trim(),
        type: "system"
      }, log);
      
      log(`Appeal ${appealId} rejected. User ${appeal.userId} remains non-active.`);
      return res.json({ status: "rejected", notificationId });
    }

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
