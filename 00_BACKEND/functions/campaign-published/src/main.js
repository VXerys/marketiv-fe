import { createHash } from "node:crypto";
import { Client, Databases, Permission, Query, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const databases = createDatabasesClient(env);

    const doc = req.bodyJson || {};

    if (!doc.$id) {
      return res.empty();
    }

    // Guard murah: only fire for campaigns that are truly going active.
    // campaign-published fires on EVERY campaigns.rows.*.update — termasuk
    // calculate-campaign-reward, expire-stale-claims, reviewSubmission, dan
    // updateCampaignStatus. Tanpa guard ini setiap tulisan di campaign aktif
    // menyiram 100 kreator lagi.
    if (doc.status !== "active") {
      return res.empty();
    }

    const eligibleCreators = await databases.listDocuments(
      env.databaseId, env.creatorProfilesCollectionId,
      [
        Query.equal("isProfileCompleted", true),
        Query.limit(100),
      ]
    );

    let notified = 0;
    for (const creator of eligibleCreators.documents) {
      // Kunci deterministik: (campaignId, creatorId, kind).
      // Konsekuensi yang disengaja: draft→active→paused→active TIDAK menotifikasi
      // ulang — satu pemberitahuan per kreator per campaign. Kalau ingin notifikasi
      // ulang saat publish kembali, ubah kind menjadi `campaign_published_<n>`.
      await notify(databases, env, {
        userId: creator.userId,
        sourceId: `${doc.$id}:${creator.userId}`,
        kind: "campaign_published",
        title: "Campaign Baru",
        message: `Campaign "${doc.title}" tersedia — cek sekarang`,
        type: "campaign_published",
      }, log);
      notified++;
    }

    log(`Campaign ${doc.$id} published, ${notified} creators notified (dedup keyed per creator)`);
    return res.json({ success: true, notified });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return res.json({ success: false, error: err.message }, 500);
  }
};

/**
 * Buat notifikasi dengan id deterministik — 409 dari Appwrite berarti sudah ada,
 * itu bukan error. Gagal karena alasan lain dicatat tapi tidak menggagalkan alur
 * utama (uang atau status sudah berpindah; membatalkan itu jauh lebih merugikan).
 */
async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId,
      env.notificationsCollectionId,
      deterministicNotificationId(payload.sourceId, payload.kind),
      {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      // `notifications` punya $permissions kosong + rowSecurity — tanpa permission
      // baris, notifikasi tidak akan pernah terbaca pemiliknya. `update` diperlukan
      // agar penerima bisa menandainya sudah dibaca.
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))]
    );
  } catch (err) {
    if (err?.code === 409) return; // sudah ada — idempoten, bukan error
    log(`Notifikasi ${payload.kind} gagal untuk ${payload.userId}: ${err?.message || String(err)}`);
  }
}

/** "ntf" + 29 hex = 32 karakter, valid sebagai document id Appwrite. */
function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    creatorProfilesCollectionId: process.env.CREATOR_PROFILES_COLLECTION_ID || process.env.NEXT_PUBLIC_CREATOR_COLLECTION || "creator_profiles",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_NOTIFICATION_COLLECTION || "notifications",
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
