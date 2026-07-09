import { Client, Databases, ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const databases = createDatabasesClient(env);
    const { Query } = await import("node-appwrite");

    const doc = req.bodyJson || {};

    const claimId = doc.$id;
    if (!claimId) {
      return res.empty();
    }

    const campaign = await databases.getDocument(
      env.databaseId, env.campaignsCollectionId, doc.campaignId
    );

    const currentTotal = Number(campaign.totalClaims) || 0;
    const claimLimit = Number(campaign.claimLimit) || 0;

    if (currentTotal > claimLimit) {
      const corrected = Math.max(0, currentTotal - 1);
      await databases.updateDocument(
        env.databaseId, env.campaignsCollectionId, doc.campaignId,
        { totalClaims: corrected }
      );
      await databases.updateDocument(
        env.databaseId, env.claimsCollectionId, claimId,
        { status: "expired" }
      );
      log(`Claim ${claimId} expired - claim limit ${claimLimit} exceeded (was ${currentTotal})`);
      return res.json({ success: true, action: "claim_limit_corrected" });
    }

    const creatorProfile = await databases.listDocuments(
      env.databaseId, env.creatorProfilesCollectionId,
      [Query.equal("userId", doc.creatorId), Query.limit(1)]
    );

    const creatorName = creatorProfile.documents[0]?.displayName || "Seorang kreator";

    await databases.createDocument(
      env.databaseId, env.notificationsCollectionId, ID.unique(),
      {
        userId: campaign.umkmId,
        title: "Campaign Di-klaim",
        message: `${creatorName} mengklaim campaign "${campaign.title}"`,
        type: "claim",
        isRead: false,
        createdAt: new Date().toISOString(),
      }
    );

    log(`Claim ${claimId} verified, UMKM ${campaign.umkmId} notified`);
    return res.json({ success: true, action: "verified" });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return res.json({ success: false, error: err.message }, 500);
  }
};

function getEnv() {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: process.env.APPWRITE_API_KEY,
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
