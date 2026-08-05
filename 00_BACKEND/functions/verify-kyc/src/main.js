import { createHash } from "node:crypto";
import { Client, Databases, Query, Role, Permission } from "node-appwrite";

/**
 * verify-kyc — menandai status KYC user menjadi `verified` (Pasal 11.8 T&C).
 *
 * Alur dokumen KYC lewat WhatsApp admin (di luar sistem): admin memverifikasi
 * KTP/SIUP/akta manual, lalu fungsi ini dipanggil INTERNAL (execute: [] —
 * hanya Appwrite key, bukan user browser) untuk mencatat hasilnya.
 *
 * Status yang didukung (kolom `users.kyc_status`):
 *   none        — belum pernah mengirim dokumen
 *   pending_wa  — dokumen dikirim, menunggu verifikasi admin (di-set
 *                 request-withdrawal saat nominal >= threshold KYC)
 *   verified    — diverifikasi admin (fungsi ini)
 *
 * Idempoten: user yang sudah `verified` dijawab 200 tanpa mutasi ulang.
 */

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const payload = parseBody(req, error);
    const userId = String(payload?.userId || "").trim();
    if (!userId) return json(res, { error: "userId wajib diisi" }, 400);

    const databases = createDatabasesClient(env);
    const user = await findUserByUserId(databases, env, userId);

    if (!user) {
      error(`User profile not found for userId: ${userId}`);
      return json(res, { error: "Profil user tidak ditemukan" }, 404);
    }

    if (user.kyc_status === "verified") {
      return json(res, { status: "ok", userId, kyc_status: "verified" });
    }

    await databases.updateDocument(env.databaseId, env.usersCollectionId, user.$id, {
      kyc_status: "verified",
      kyc_verified_at: new Date().toISOString()
    });

    await notify(databases, env, {
      sourceId: user.$id,
      kind: "kyc_verified",
      userId,
      title: "Verifikasi KYC Disetujui",
      message: "Dokumen KYC Anda telah diverifikasi. Anda kini dapat menarik saldo tanpa batas nominal.",
      type: "keuangan",
    }, log);

    log(`KYC ${userId} ditandai verified`);
    return json(res, { status: "ok", userId, kyc_status: "verified" });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    if (err?.statusCode) return json(res, { error: err.message }, err.statusCode);
    return json(res, { error: "Internal server error" }, 500);
  }
};

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
    log(`Notifikasi ${payload.kind} gagal untuk ${payload.userId}: ${err?.message || String(err)}`);
  }
}

function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications"
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

function parseBody(req, error) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "";
  if (typeof rawBody === "object") return rawBody;
  if (!rawBody) {
    const e = new Error("Missing request body");
    e.statusCode = 400;
    throw e;
  }
  try {
    return JSON.parse(rawBody);
  } catch (err) {
    error(err?.message || String(err));
    const parseError = new Error("Invalid JSON body");
    parseError.statusCode = 400;
    throw parseError;
  }
}

/** Baris `users` lewat listDocuments + Query.equal("userId"), BUKAN getDocument. */
async function findUserByUserId(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents[0] || null;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}