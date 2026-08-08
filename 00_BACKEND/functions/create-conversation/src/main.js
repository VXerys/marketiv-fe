import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

/**
 * Buka (atau lanjutkan) ruang negosiasi antara UMKM pemanggil dan seorang kreator.
 *
 * ADA DI SISI SERVER KARENA TERPAKSA, bukan karena agregasi.
 *
 * Appwrite menolak klien memasang permission untuk user LAIN: dari sesi browser,
 * `permissions` hanya boleh menyebut `any`, `users`, dan role diri sendiri.
 * Errornya berbunyi
 *
 *   Permissions must be one of: (any, users, user:<diri sendiri>, ...)
 *
 * Sementara `conversations` TIDAK punya `read` di level koleksi (pengetatan
 * gelombang 2), jadi lawan bicara hanya bisa membaca barisnya lewat permission
 * per-baris. Dua syarat itu tidak bisa dipenuhi bersamaan dari browser — satu-
 * satunya jalan adalah menulisnya dengan API key. Jangan pindahkan kembali ke
 * `conversation-appwrite.service.ts`.
 *
 * Idempoten. `conversations` punya unique index `idx_umkm_creator`, jadi satu
 * pasangan hanya boleh punya satu baris; percakapan yang sudah ada dikembalikan
 * apa adanya, bukan dianggap error.
 */

/** Bentuk user ID Appwrite. Dipakai sebelum nilainya jadi `Role.user(...)`. */
const USER_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/;

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const umkmId = getUserId(req);
    if (!umkmId) return json(res, { error: "Unauthorized" }, 401);

    const body = parseBody(req);
    const creatorId = str(body.creatorId);

    if (!creatorId) return json(res, { error: "Kreator tidak valid." }, 400);
    if (creatorId === umkmId) {
      return json(res, { error: "Tidak bisa memulai percakapan dengan diri sendiri." }, 400);
    }
    if (!USER_ID.test(creatorId) || !USER_ID.test(umkmId)) {
      return json(res, { error: "Profil kreator ini belum tertaut ke akun yang sah." }, 400);
    }

    const databases = createDatabasesClient(env);

    const existing = await findByPair(databases, env, umkmId, creatorId);
    if (existing) {
      log(`Percakapan ${umkmId}→${creatorId} sudah ada: ${existing}`);
      return json(res, { conversationId: existing });
    }

    let created;
    try {
      created = await databases.createDocument(
        env.databaseId,
        env.conversationsCollectionId,
        ID.unique(),
        {
          umkm_id: umkmId,
          creator_id: creatorId,
          last_message: "",
          last_message_at: new Date().toISOString(),
          is_archived: false,
        },
        participantPermissions(umkmId, creatorId)
      );
    } catch (err) {
      // 409 = unique index menolak duplikat, artinya barisnya ADA. Dua tab yang
      // menekan tombol bersamaan sampai di sini; hasil yang benar tetap
      // mengembalikan percakapan itu, bukan melempar error.
      if (err?.code === 409) {
        const raced = await findByPair(databases, env, umkmId, creatorId);
        if (raced) return json(res, { conversationId: raced });
      }
      throw err;
    }

    log(`Percakapan ${created.$id} dibuat untuk ${umkmId}→${creatorId}`);
    return json(res, { conversationId: created.$id });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

/** Permission baris: kedua peserta membaca dan memperbarui. */
function participantPermissions(umkmId, creatorId) {
  return [
    Permission.read(Role.user(umkmId)),
    Permission.read(Role.user(creatorId)),
    Permission.update(Role.user(umkmId)),
    Permission.update(Role.user(creatorId)),
  ];
}

async function findByPair(databases, env, umkmId, creatorId) {
  const res = await databases.listDocuments(env.databaseId, env.conversationsCollectionId, [
    Query.equal("umkm_id", umkmId),
    Query.equal("creator_id", creatorId),
    Query.limit(1),
  ]);
  return res.documents[0]?.$id || null;
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    conversationsCollectionId:
      process.env.CONVERSATIONS_COLLECTION_ID ||
      process.env.NEXT_PUBLIC_CONVERSATION_COLLECTION ||
      "conversations",
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
