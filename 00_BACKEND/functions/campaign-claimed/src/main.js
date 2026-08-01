import { createHash } from "node:crypto";
import { Client, Databases, Permission, Query, Role } from "node-appwrite";
import { incrementColumn } from "./atomic.js";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const databases = createDatabasesClient(env);

    const doc = req.bodyJson || {};

    const claimId = doc.$id;
    if (!claimId) {
      return res.empty();
    }

    const campaign = await databases.getDocument(
      env.databaseId, env.campaignsCollectionId, doc.campaignId
    );

    const claimLimit = Number(campaign.claimLimit) || 0;

    // Increment totalClaims atomik — server menolak bila hasilnya melewati max.
    // JANGAN mem-parse pesan error: atomic.js meratakan kode HTTP menjadi string,
    // tidak ada `.code` yang bisa dipercaya. Sebagai gantinya, baca ulang campaign
    // dan periksa state — kalau totalClaims >= claimLimit berarti penolakan kuota,
    // bukan gangguan jaringan.
    //
    // ⚠️ Sisa celah yang disengaja: antara createDocument(campaign_claims) klien
    // dan increment ini selesai ada jeda ~0,5–3 detik. Dalam jeda itu guard klien
    // membaca angka basi, jadi klaim ke-(N+1) bisa masuk lalu dibalik di sini.
    // Menutupnya total berarti memindahkan pembuatan klaim ke Function — out-of-scope.
    try {
      await incrementColumn(env, env.campaignsCollectionId, doc.campaignId, "totalClaims", 1, claimLimit);
    } catch (incrementErr) {
      // Increment gagal: baca ulang untuk membedakan "kuota penuh" vs "gangguan".
      let freshCampaign;
      try {
        freshCampaign = await databases.getDocument(
          env.databaseId, env.campaignsCollectionId, doc.campaignId
        );
      } catch {
        error(`Tidak bisa membaca ulang campaign ${doc.campaignId} setelah increment gagal: ${incrementErr?.message}`);
        return res.json({ success: false, error: "campaign_read_failed" }, 500);
      }

      if (Number(freshCampaign.totalClaims) >= claimLimit) {
        // Kuota sudah penuh — balik klaim ke expired.
        await databases.updateDocument(
          env.databaseId, env.claimsCollectionId, claimId,
          { status: "expired" }
        );
        log(`Claim ${claimId} expired — quota ${claimLimit} penuh (totalClaims=${freshCampaign.totalClaims})`);
        return res.json({ success: true, action: "claim_limit_reached" });
      }

      // Bukan masalah kuota — gangguan nyata, catat dan kembalikan 500 supaya
      // Appwrite bisa mencoba ulang event.
      error(`Increment totalClaims gagal (bukan kuota): ${incrementErr?.message}`);
      return res.json({ success: false, error: "increment_failed" }, 500);
    }

    // Increment berhasil — notifikasi UMKM.
    const creatorProfile = await databases.listDocuments(
      env.databaseId, env.creatorProfilesCollectionId,
      [Query.equal("userId", doc.creatorId), Query.limit(1)]
    );

    const creatorName = creatorProfile.documents[0]?.displayName || "Seorang kreator";

    await notify(databases, env, {
      userId: campaign.umkmId,
      sourceId: claimId,
      kind: "claim",
      title: "Campaign Di-klaim",
      message: `${creatorName} mengklaim campaign "${campaign.title}"`,
      type: "claim",
    }, log);

    log(`Claim ${claimId} verified, totalClaims naik, UMKM ${campaign.umkmId} notified`);
    return res.json({ success: true, action: "claimed" });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return res.json({ success: false, error: err.message }, 500);
  }
};

/**
 * Buat notifikasi dengan id deterministik — 409 dari Appwrite berarti sudah ada,
 * itu bukan error. Gagal karena alasan lain dicatat tapi tidak menggagalkan alur
 * utama.
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
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))]
    );
  } catch (err) {
    if (err?.code === 409) return;
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
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || process.env.NEXT_PUBLIC_CAMPAIGN_COLLECTION || "campaigns",
    claimsCollectionId: process.env.CLAIMS_COLLECTION_ID || process.env.NEXT_PUBLIC_CLAIM_COLLECTION || "campaign_claims",
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
