import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const deliverable = parseBody(req);
    if (!deliverable?.$id) return json(res, { error: "Missing deliverable payload" }, 400);
    if (deliverable.status !== "approved") return json(res, { status: "ignored", reason: "deliverable is not approved" });

    const orderId = deliverable.orderId;
    if (!orderId) return json(res, { error: "Missing order id" }, 400);

    const databases = createDatabasesClient(env);
    const order = await databases.getDocument(env.databaseId, env.ordersCollectionId, orderId);
    const creatorId = order.creatorId;
    if (!creatorId) return json(res, { error: "Order has no creator" }, 400);

    const escrow = await findHeldEscrow(databases, env, orderId);
    if (!escrow) return json(res, { status: "ignored", reason: "held escrow not found" });

    const wallet = await findWallet(databases, env, creatorId);
    if (!wallet) throw new Error(`Wallet not found for creator ${creatorId}`);

    await databases.updateDocument(env.databaseId, env.escrowsCollectionId, escrow.$id, { status: "released" });
    await databases.updateDocument(env.databaseId, env.walletsCollectionId, wallet.$id, {
      balance: Number(wallet.balance || 0) + Number(escrow.amount)
    });
    await ensureReleaseTransaction(databases, env, creatorId, escrow);
    await updateOrderCompleted(databases, env, orderId);

    log(`Escrow ${escrow.$id} released to creator ${creatorId}`);
    return json(res, { status: "ok", escrowId: escrow.$id, walletId: wallet.$id });
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
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || process.env.NEXT_PUBLIC_WALLET_COLLECTION || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || process.env.NEXT_PUBLIC_ESCROW_COLLECTION || "escrows",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders"
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

async function findHeldEscrow(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.escrowsCollectionId, [
    Query.equal("orderId", orderId),
    Query.equal("status", "held"),
    Query.limit(1)
  ]);
  return result.documents[0] || null;
}

async function findWallet(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

async function ensureReleaseTransaction(databases, env, creatorId, escrow) {
  const existing = await databases.listDocuments(env.databaseId, env.transactionsCollectionId, [
    Query.equal("referenceId", escrow.$id),
    Query.equal("referenceType", "escrow"),
    Query.equal("type", "release"),
    Query.limit(1)
  ]);
  if (existing.documents[0]) return existing.documents[0];

  return databases.createDocument(
    env.databaseId,
    env.transactionsCollectionId,
    ID.unique(),
    {
      userId: creatorId,
      amount: Number(escrow.amount),
      type: "release",
      referenceId: escrow.$id,
      referenceType: "escrow",
      status: "completed"
    },
    [Permission.read(Role.user(creatorId))]
  );
}

async function updateOrderCompleted(databases, env, orderId) {
  await databases.updateDocument(env.databaseId, env.ordersCollectionId, orderId, {
    status: "completed"
  });
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
