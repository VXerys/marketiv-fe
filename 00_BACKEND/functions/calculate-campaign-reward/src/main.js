import { Client, Databases, ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const databases = createDatabasesClient(env);
    const { Query } = await import("node-appwrite");

    const doc = req.bodyJson || {};

    const submissionId = doc.$id;
    if (!submissionId) {
      return res.empty();
    }

    if (doc.status !== "approved") {
      return res.empty();
    }

    const existingTransactions = await databases.listDocuments(
      env.databaseId, env.transactionsCollectionId,
      [
        Query.equal("referenceId", submissionId),
        Query.equal("referenceType", "campaign_submission"),
        Query.limit(1),
      ]
    );

    if (existingTransactions.documents.length > 0) {
      log(`Reward already processed for submission ${submissionId}, skipping`);
      return res.empty();
    }

    const campaign = await databases.getDocument(
      env.databaseId, env.campaignsCollectionId, doc.campaignId
    );

    const views = Number(doc.views) || 0;
    const rewardPer1000Views = Number(campaign.rewardPer1000Views) || 0;
    const remainingBudget = Number(campaign.remainingBudget) || 0;

    const reward = Math.min(
      Math.floor((views / 1000) * rewardPer1000Views),
      remainingBudget
    );

    if (reward <= 0) {
      log(`Reward 0 for submission ${submissionId}, skipping`);
      return res.empty();
    }

    const creatorId = doc.creatorId;
    const walletDoc = await findOrCreateWallet(databases, env, creatorId);

    const currentPending = Number(walletDoc.pendingBalance) || 0;

    await databases.updateDocument(
      env.databaseId, env.walletsCollectionId, walletDoc.$id,
      { pendingBalance: currentPending + reward }
    );

    await databases.createDocument(
      env.databaseId, env.transactionsCollectionId, ID.unique(),
      {
        userId: creatorId,
        amount: reward,
        type: "release",
        referenceId: submissionId,
        referenceType: "campaign_submission",
        status: "completed",
      }
    );

    const spentAmount = Number(campaign.spentAmount) + reward;
    const newRemainingBudget = Math.max(0, remainingBudget - reward);

    await databases.updateDocument(
      env.databaseId, env.campaignsCollectionId, doc.campaignId,
      {
        spentAmount,
        remainingBudget: newRemainingBudget,
      }
    );

    if (newRemainingBudget <= 0) {
      await databases.updateDocument(
        env.databaseId, env.campaignsCollectionId, doc.campaignId,
        { status: "completed" }
      );
    }

    await databases.createDocument(
      env.databaseId, env.notificationsCollectionId, ID.unique(),
      {
        userId: creatorId,
        title: "Reward Campaign",
        message: `Reward Rp${reward.toLocaleString("id-ID")} sudah masuk ke pending balance`,
        type: "reward",
        isRead: false,
        createdAt: new Date().toISOString(),
      }
    );

    log(`Reward ${reward} calculated for submission ${submissionId}`);
    return res.json({ success: true, reward });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return res.json({ success: false, error: err.message }, 500);
  }
};

async function findOrCreateWallet(databases, env, userId) {
  const { Query } = await import("node-appwrite");
  const existing = await databases.listDocuments(
    env.databaseId, env.walletsCollectionId,
    [Query.equal("userId", userId), Query.limit(1)]
  );
  if (existing.documents.length > 0) return existing.documents[0];
  return await databases.createDocument(
    env.databaseId, env.walletsCollectionId, ID.unique(),
    { userId, balance: 0, pendingBalance: 0 }
  );
}

function getEnv() {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || process.env.NEXT_PUBLIC_CAMPAIGN_COLLECTION || "campaigns",
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || process.env.NEXT_PUBLIC_WALLET_COLLECTION || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
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
