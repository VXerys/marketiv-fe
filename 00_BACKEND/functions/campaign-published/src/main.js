import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const databases = createDatabasesClient(env);
    const { Query } = await import("node-appwrite");

    const doc = req.bodyJson || {};

    if (!doc.$id) {
      return res.empty();
    }

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

    for (const creator of eligibleCreators.documents) {
      await databases.createDocument(
        env.databaseId, env.notificationsCollectionId, ID.unique(),
        {
          userId: creator.userId,
          title: "Campaign Baru",
          message: `Campaign "${doc.title}" tersedia — cek now`,
          type: "campaign_published",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        // `notifications` punya $permissions kosong + rowSecurity — tanpa permission
        // baris, notifikasi tidak akan pernah terbaca pemiliknya. `update` diperlukan
        // agar penerima bisa menandainya sudah dibaca.
        [Permission.read(Role.user(creator.userId)), Permission.update(Role.user(creator.userId))]
      );
    }

    log(`Campaign ${doc.$id} published, ${eligibleCreators.documents.length} creators notified`);
    return res.json({ success: true, notified: eligibleCreators.documents.length });
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
