import { Client, Databases, Query, Users } from "node-appwrite";

/**
 * get-umkm-profile
 *
 * DTO komposit profil UMKM: join `users` (mirror) + `umkm_profiles` + akun Auth.
 * Response = `UmkmProfile` (src/types/umkm-dashboard.types.ts).
 *
 * KEPUTUSAN SKEMA — `ownerName` & `whatsappNumber` tidak punya kolom sendiri:
 *
 * 1. ownerName → nama akun Appwrite Auth (`users.get(userId).name`).
 *    Tidak menambah kolom baru: nama ini sudah diisi saat registrasi dan sudah
 *    dipakai sebagai sumber `displayName` kreator (lihat create-user-profile).
 *    Menyalinnya ke `umkm_profiles` hanya akan membuat dua sumber kebenaran yang
 *    bisa berbeda setelah user mengganti nama akun.
 *    Fallback: businessName, supaya UI tidak pernah menampilkan string kosong.
 *
 * 2. whatsappNumber → `users.phone` (mirror collection), fallback ke phone akun
 *    Auth. Kolom `phone` sudah ada dan sudah diisi create-user-profile; kolom
 *    `whatsappNumber` terpisah hanya akan duplikat selama MVP memakai satu nomor.
 *
 * Konsekuensi: kalau nanti nomor WhatsApp bisnis harus berbeda dari nomor login,
 * barulah `umkm_profiles.whatsappNumber` layak ditambahkan — dan fungsi ini yang
 * jadi satu-satunya tempat yang perlu diubah.
 */

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "GET") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv();
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const client = createClient(env);
    const databases = new Databases(client);
    const users = new Users(client);

    const [userMirror, umkmProfile, authUser] = await Promise.all([
      findByUserId(databases, env.databaseId, env.usersCollectionId, userId),
      findByUserId(databases, env.databaseId, env.umkmProfilesCollectionId, userId),
      // Akun Auth boleh tidak terbaca (mis. API key tanpa scope users) — jangan
      // menggagalkan seluruh profil hanya karena nama tidak terambil.
      users.get(userId).catch(() => null),
    ]);

    if (!umkmProfile) {
      return json(res, { error: "UMKM profile not found" }, 404);
    }
    if (userMirror && userMirror.role !== "umkm") {
      return json(res, { error: "User is not an UMKM account" }, 403);
    }

    const businessName = str(umkmProfile.businessName);

    const profile = {
      id: userId,
      businessName,
      ownerName: str(authUser?.name) || businessName,
      email: str(userMirror?.email) || str(authUser?.email),
      whatsappNumber: str(userMirror?.phone) || str(authUser?.phone),
      location: str(umkmProfile.city),
      avatarUrl: str(umkmProfile.logoUrl),
      isVerified: umkmProfile.isProfileCompleted === true,
    };

    log(`UMKM profile resolved for ${userId} (auth account ${authUser ? "read" : "unavailable"})`);
    return json(res, profile);
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getEnv() {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: process.env.APPWRITE_FUNCTION_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || process.env.NEXT_PUBLIC_USER_COLLECTION || "users",
    umkmProfilesCollectionId: process.env.UMKM_PROFILES_COLLECTION_ID || "umkm_profiles",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createClient(env) {
  return new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

/** Dokumen dibuat dengan ID.unique(), jadi lookup selalu lewat kolom userId. */
async function findByUserId(databases, databaseId, collectionId, userId) {
  const result = await databases.listDocuments(databaseId, collectionId, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
