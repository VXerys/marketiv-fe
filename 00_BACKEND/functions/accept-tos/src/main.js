import { Client, Databases, Query } from "node-appwrite";

/**
 * Re-consent T&C saat versi berubah (interstitial).
 *
 * Di sisi server karena `users` ($permissions: []) TIDAK bisa di-update dari
 * browser: gate TOS di `request-withdrawal`/`create-order` menuntut kolom
 * `tos_version`/`tos_accepted_at` di baris `users`, dan baris itu (rowSecurity)
 * tidak punya update("users") di level collection. Klien juga tidak boleh
 * memasang permission tulis untuk dirinya sendiri ke baris milik dirinya.
 *
 * Idempoten: versi yang sama sudah tersimpan → 200 tanpa update ulang.
 */

const DEFAULT_TOS_VERSION = "v3.1";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const body = parseBody(req);
    const action = typeof body.action === "string" ? body.action.trim() : "accept";
    if (action !== "status" && action !== "accept") {
      return json(res, { error: "Action tidak didukung." }, 400);
    }

    const databases = createDatabasesClient(env);
    const user = await findByUserId(databases, env.databaseId, env.usersCollectionId, userId);

    if (!user) return json(res, { error: "Profil pengguna tidak ditemukan." }, 404);

    if (action === "status") {
      const acceptedVersion = user.tos_version || null;
      const acceptedAt = user.tos_accepted_at || null;
      return json(res, {
        currentVersion: env.currentTosVersion,
        acceptedVersion,
        acceptedAt,
        needsConsent: acceptedVersion !== env.currentTosVersion || !acceptedAt,
      });
    }

    const tosVersion = typeof body.tos_version === "string" ? body.tos_version.trim() : "";
    if (!tosVersion) {
      return json(res, { error: "tos_version wajib diisi." }, 400);
    }
    if (tosVersion !== env.currentTosVersion) {
      return json(res, { error: "Versi T&C tidak sesuai dengan versi aktif." }, 400);
    }

    if (user.tos_version === tosVersion && user.tos_accepted_at) {
      return json(res, { success: true, alreadyAccepted: true, tos_version: tosVersion });
    }
    const acceptanceData = { tos_accepted_at: new Date().toISOString() };
    if (user.tos_version !== tosVersion) acceptanceData.tos_version = tosVersion;
    await databases.updateDocument(env.databaseId, env.usersCollectionId, user.$id, acceptanceData);
    log(`T&C ${tosVersion} diterima oleh ${userId}`);
    return json(res, { success: true, alreadyAccepted: false, tos_version: tosVersion });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || process.env.NEXT_PUBLIC_USER_COLLECTION || "users",
    currentTosVersion: process.env.CURRENT_TOS_VERSION || DEFAULT_TOS_VERSION,
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);
  return new Databases(client);
}

async function findByUserId(databases, databaseId, collectionId, userId) {
  const result = await databases.listDocuments(databaseId, collectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

function parseBody(req) {
  try {
    if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
    const rawBody = req.bodyText || req.body || "{}";
    return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
  } catch {
    return {};
  }
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
