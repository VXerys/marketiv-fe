import { Client, Databases, ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const databases = createDatabasesClient(env);
    const { Query } = await import("node-appwrite");

    const now = new Date();
    const campaignMap = {};
    const LIMIT = 100;
    let offset = 0;
    let total = 0;

    while (true) {
      const claims = await databases.listDocuments(
        env.databaseId, env.claimsCollectionId,
        [
          Query.equal("status", "claimed"),
          Query.limit(LIMIT),
          Query.offset(offset),
        ]
      );

      if (claims.documents.length === 0) break;

      for (const claim of claims.documents) {
        const campaignId = claim.campaignId;

        let campaign;
        if (campaignMap[campaignId]) {
          campaign = campaignMap[campaignId];
        } else {
          campaign = await databases.getDocument(
            env.databaseId, env.campaignsCollectionId, campaignId
          );
          campaignMap[campaignId] = campaign;
        }

        const submissionDays = Number(campaign.submissionDays) || 7;
        const claimedAt = new Date(claim.claimedAt);
        const deadline = new Date(claimedAt.getTime() + submissionDays * 24 * 60 * 60 * 1000);

        if (now >= deadline) {
          await databases.updateDocument(
            env.databaseId, env.claimsCollectionId, claim.$id,
            { status: "expired" }
          );

          const currentTotal = Number(campaign.totalClaims) || 0;
          await databases.updateDocument(
            env.databaseId, env.campaignsCollectionId, campaignId,
            { totalClaims: Math.max(0, currentTotal - 1) }
          );

          campaign.totalClaims = Math.max(0, currentTotal - 1);

          const creatorProfiles = await databases.listDocuments(
            env.databaseId, env.creatorProfilesCollectionId,
            [Query.equal("userId", claim.creatorId), Query.limit(1)]
          );

          await databases.createDocument(
            env.databaseId, env.notificationsCollectionId, ID.unique(),
            {
              userId: claim.creatorId,
              title: "Claim Expired",
              message: `Claim-mu di "${campaign.title}" expired karena kamu tidak submit dalam ${submissionDays} hari`,
              type: "claim_expired",
              isRead: false,
              createdAt: now.toISOString(),
            }
          );

          total++;
          log(`Claim ${claim.$id} expired for campaign ${campaignId}`);
        }
      }

      if (claims.documents.length < LIMIT) break;
      offset += LIMIT;
    }

    log(`Expired ${total} stale claims`);
    return res.json({ success: true, expired: total });
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
