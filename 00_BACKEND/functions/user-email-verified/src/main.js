import { Client, Databases, Query } from "node-appwrite";

/**
 * Sinkronkan status verifikasi email dari Appwrite Auth ke baris `users`.
 *
 * Verifikasi email adalah fitur native Auth: saat user mengetuk link verifikasi,
 * akun Auth berubah (`emailVerification` jadi true). Perubahan akun itu memicu
 * event `users.*.update` — function ini mendengarnya dan mencetak
 * `email_verified_at` ke baris `users` milik user (lookup lewat `userId`).
 *
 * Yang membacanya nanti adalah gate withdrawal pertama di `request-withdrawal`.
 * Kolom `email_verified_at` kosong → 403 "Verifikasi email sebelum penarikan
 * pertama.".
 *
 * Idempoten: baris sudah punya `email_verified_at` → lewati (tidak menimpa
 * timestamp pertama). Function ini TIDAK ada di jalur klien (events Auth),
 * jadi tidak punya `execute` role.
 */

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const databases = createDatabasesClient(env);

    // Payload = akun Auth Appwrite (bukan baris `users`). `$id` = id akun Auth.
    const account = req.bodyJson || {};
    const authUserId = account.$id || account.id || account.userId;

    if (!authUserId) {
      return res.empty();
    }

    // Guard murah: hanya verifikasi (emailVerification) yang relevan. Event
    // `users.*.update` menyala pada pembaruan apa pun; tanpa guard ini tiap
    // ubah profil Auth akan memicu query `users`.
    if (!account.emailVerification) {
      return res.empty();
    }

    const user = await findByUserId(databases, env.databaseId, env.usersCollectionId, authUserId);
    if (!user) {
      log(`users row belum ada untuk Auth user ${authUserId} — lewati sinkronisasi email`);
      return res.empty();
    }

    if (user.email_verified_at) {
      // Sudah terisi — idempoten, jangan timpa timestamp pertama.
      return res.empty();
    }

    await databases.updateDocument(env.databaseId, env.usersCollectionId, user.$id, {
      email_verified_at: new Date().toISOString(),
    });

    log(`Email verified sinkron ke users:${user.$id} (${authUserId})`);
    return res.json({ success: true, userId: authUserId });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return res.json({ success: false, error: err?.message || String(err) }, 500);
  }
};

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || process.env.NEXT_PUBLIC_USER_COLLECTION || "users",
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