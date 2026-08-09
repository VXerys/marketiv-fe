import { Client, Account, Databases, ID, Query, Users } from "node-appwrite";
import { createHash } from "node:crypto";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const payload = getPayload(req);
    const email = normalizeEmail(payload.email);

    if (!email) {
      return json(res, { success: false, error: "Email wajib diisi." }, 400);
    }

    const ip = getClientIp(req);
    const databases = createDatabasesClient(env);
    const limited = await hitRateLimit(databases, env, email, ip, Date.now());
    if (limited.blocked) {
      return json(
        res,
        {
          success: false,
          error: "Terlalu banyak permintaan OTP. Tunggu beberapa menit lalu coba lagi.",
          retryAfterSeconds: limited.retryAfterSeconds,
        },
        429
      );
    }

    const authUser = await findAuthUserByEmail(env, email);
    if (!authUser) {
      // Jangan bocorkan apakah email terdaftar. Tidak ada OTP dikirim.
      log(`Password OTP diminta untuk email tanpa akun: ${email}`);
      return json(res, { success: true });
    }

    const account = createPublicAccountClient(env);
    await account.createEmailToken(authUser.$id, email);

    return json(res, { success: true });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { success: false, error: "Gagal mengirim kode OTP. Coba lagi." }, 500);
  }
};

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || process.env.NEXT_PUBLIC_USER_COLLECTION || "users",
    rateLimitsCollectionId: process.env.OTP_RATE_LIMITS_COLLECTION_ID || "otp_rate_limits",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createAdminClient(env) {
  return new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);
}

function createDatabasesClient(env) {
  return new Databases(createAdminClient(env));
}

function createPublicAccountClient(env) {
  const client = new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setLocale("id");
  return new Account(client);
}

function getPayload(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];
  const candidate = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "");
  return candidate.split(",")[0].trim() || req.headers["x-real-ip"] || req.headers["x-appwrite-user-ip"] || "unknown";
}

async function findAuthUserByEmail(env, email) {
  const users = new Users(createAdminClient(env));
  const result = await users.list([Query.limit(10)], email);
  return (result.users || []).find((user) => String(user.email || "").toLowerCase() === email) || null;
}

async function hitRateLimit(databases, env, email, ip, nowMs) {
  const key = rateLimitKey(email, ip);
  const nowIso = new Date(nowMs).toISOString();
  const windowStartMs = nowMs - RATE_LIMIT_WINDOW_MS;

  let doc = null;
  try {
    doc = await databases.getDocument(env.databaseId, env.rateLimitsCollectionId, key);
  } catch (err) {
    if (err?.code !== 404) throw err;
  }

  if (!doc) {
    await databases.createDocument(
      env.databaseId,
      env.rateLimitsCollectionId,
      ID.custom(key),
      { key, email, ip, count: 1, windowStart: nowIso, updatedAt: nowIso }
    );
    return { blocked: false, retryAfterSeconds: 0 };
  }

  if (new Date(doc.windowStart).getTime() <= windowStartMs) {
    await databases.updateDocument(env.databaseId, env.rateLimitsCollectionId, doc.$id, {
      count: 1,
      windowStart: nowIso,
      updatedAt: nowIso,
    });
    return { blocked: false, retryAfterSeconds: 0 };
  }

  const count = Number(doc.count || 0);
  if (count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(doc.windowStart).getTime() + RATE_LIMIT_WINDOW_MS - nowMs) / 1000)
    );
    return { blocked: true, retryAfterSeconds };
  }

  await databases.updateDocument(env.databaseId, env.rateLimitsCollectionId, doc.$id, {
    count: count + 1,
    updatedAt: nowIso,
  });
  return { blocked: false, retryAfterSeconds: 0 };
}

function rateLimitKey(email, ip) {
  return createHash("sha256").update(`${email}|${ip}`).digest("hex").slice(0, 36);
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
