import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";
import { decrementColumn } from "./atomic.js";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const databases = createDatabasesClient(env);

    const now = new Date();
    // TIDAK memakai campaignMap untuk menyimpan totalClaims. Dulu cache itu dipakai
    // untuk menghitung Math.max(0, currentTotal - 1) secara lokal, yang menghasilkan
    // race dengan campaign-claimed: satu lintasan cron bisa menghapus increment yang
    // baru ditulisnya. decrementColumn atomik menyelesaikan keduanya sekaligus.
    const campaignMap = {};
    const LIMIT = 100;
    let total = 0;
    // Pagination dengan cursor bukan offset — kita memutasi set yang sama
    // (rows menyingkir dari filter `status=claimed` begitu dibalik), sehingga
    // offset-based pagination bisa melompati klaim. Selalu ambil halaman pertama
    // sampai kurang dari LIMIT kembali.
    while (true) {
      const claims = await databases.listDocuments(
        env.databaseId, env.claimsCollectionId,
        [
          Query.equal("status", "claimed"),
          Query.limit(LIMIT),
        ]
      );

      if (claims.documents.length === 0) break;

      for (const claim of claims.documents) {
        const campaignId = claim.campaignId;

        // Baca campaign sekali per campaign-id unik; kita tidak perlu totalClaims
        // dari cache karena decrementColumn langsung ke server.
        if (!campaignMap[campaignId]) {
          try {
            campaignMap[campaignId] = await databases.getDocument(
              env.databaseId, env.campaignsCollectionId, campaignId
            );
          } catch {
            log(`Campaign ${campaignId} tidak ditemukan, skip klaim ${claim.$id}`);
            continue;
          }
        }
        const campaign = campaignMap[campaignId];

        const submissionDays = Number(campaign.submissionDays) || 7;
        const claimedAt = new Date(claim.claimedAt);
        const deadline = new Date(claimedAt.getTime() + submissionDays * 24 * 60 * 60 * 1000);

        if (now >= deadline) {
          // Balik status klaim.
          await databases.updateDocument(
            env.databaseId, env.claimsCollectionId, claim.$id,
            { status: "expired" }
          );

          // Kurangi counter atomik — server menegakkan min=0, tidak ada negatif.
          // Bungkus try/catch supaya kegagalan counter tidak membatalkan notifikasi;
          // kuota yang sedikit lebih tinggi dari seharusnya jauh lebih aman daripada
          // kampanye tanpa notifikasi.
          try {
            await decrementColumn(env, env.campaignsCollectionId, campaignId, "totalClaims", 1);
          } catch (decErr) {
            log(`Decrement totalClaims gagal untuk campaign ${campaignId}: ${decErr?.message}`);
          }

          // Notifikasi kreator.
          await databases.createDocument(
            env.databaseId, env.notificationsCollectionId, ID.unique(),
            {
              userId: claim.creatorId,
              title: "Claim Expired",
              message: `Claim-mu di "${campaign.title}" expired karena kamu tidak submit dalam ${submissionDays} hari`,
              type: "claim_expired",
              isRead: false,
              createdAt: now.toISOString(),
            },
            [Permission.read(Role.user(claim.creatorId)), Permission.update(Role.user(claim.creatorId))]
          );

          total++;
          log(`Claim ${claim.$id} expired untuk campaign ${campaignId}`);
        }
      }

      // Kalau semua dalam halaman ini sudah diproses dan semuanya expired,
      // halaman berikutnya akan memuat klaim yang belum expired. Kalau < LIMIT
      // dokumen kembali, tidak ada halaman berikutnya.
      if (claims.documents.length < LIMIT) break;
    }

    log(`Expired ${total} stale claims`);
    return res.json({ success: true, expired: total });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return res.json({ success: false, error: err.message }, 500);
  }
};

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    claimsCollectionId: process.env.CLAIMS_COLLECTION_ID || process.env.NEXT_PUBLIC_CLAIM_COLLECTION || "campaign_claims",
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || process.env.NEXT_PUBLIC_CAMPAIGN_COLLECTION || "campaigns",
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
