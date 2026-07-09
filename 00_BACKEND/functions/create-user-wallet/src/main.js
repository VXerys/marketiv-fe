import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const user = parseBody(req);
    const userId = user.$id || user.id || user.userId;
    if (!userId) return json(res, { error: "Missing user id in event payload" }, 400);

    const databases = createDatabasesClient(env);
    const existing = await findWallet(databases, env, userId);
    if (existing) return json(res, { status: "ok", walletId: existing.$id, created: false });

    const wallet = await databases.createDocument(
      env.databaseId,
      env.walletsCollectionId,
      ID.unique(),
      { userId, balance: 0, pendingBalance: 0 },
      [Permission.read(Role.user(userId))]
    );

    log(`Wallet ${wallet.$id} created for ${userId}`);
    return json(res, { status: "ok", walletId: wallet.$id, created: true });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getEnv() {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || process.env.NEXT_PUBLIC_WALLET_COLLECTION || "wallets"
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

async function findWallet(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
