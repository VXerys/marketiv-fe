import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const payment = parseBody(req);
    if (!payment?.$id) return json(res, { error: "Missing payment payload" }, 400);
    if (payment.status !== "paid") return json(res, { status: "ignored", reason: "payment is not paid" });

    const databases = createDatabasesClient(env);

    if (payment.purpose === "topup") {
      const result = await completeTopup(databases, env, payment);
      log(`Top up payment ${payment.$id} completed for ${payment.user_id}`);
      return json(res, { status: "ok", ...result });
    }

    if (payment.purpose !== "order" || !payment.order_id) {
      return json(res, { error: "Paid payment has invalid purpose/order_id" }, 400);
    }

    const existingEscrow = await findEscrow(databases, env, payment.order_id);
    const escrow = existingEscrow || await databases.createDocument(
      env.databaseId,
      env.escrowsCollectionId,
      ID.unique(),
      { orderId: payment.order_id, amount: Number(payment.amount), status: "held" }
    );

    await ensureTransaction(databases, env, {
      userId: payment.user_id,
      amount: Number(payment.amount),
      type: "payment",
      referenceId: payment.order_id,
      referenceType: "order",
      status: "completed"
    });

    await updateOrderAfterEscrow(databases, env, payment.order_id);
    log(`Escrow ${escrow.$id} held for order ${payment.order_id}`);
    return json(res, { status: "ok", escrowId: escrow.$id });
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
    paymentsCollectionId: process.env.PAYMENTS_COLLECTION_ID || process.env.NEXT_PUBLIC_PAYMENT_COLLECTION || "payments",
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

async function completeTopup(databases, env, payment) {
  const wallet = await findWallet(databases, env, payment.user_id);
  if (!wallet) throw new Error(`Wallet not found for user ${payment.user_id}`);

  const result = await ensureTransaction(databases, env, {
    userId: payment.user_id,
    amount: Number(payment.amount),
    type: "deposit",
    referenceId: payment.$id,
    referenceType: "payment",
    status: "completed"
  });

  if (!result.created) return { walletId: wallet.$id };

  await databases.updateDocument(env.databaseId, env.walletsCollectionId, wallet.$id, {
    balance: Number(wallet.balance || 0) + Number(payment.amount)
  });

  return { walletId: wallet.$id };
}

async function findWallet(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

async function findEscrow(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.escrowsCollectionId, [Query.equal("orderId", orderId), Query.limit(1)]);
  return result.documents[0] || null;
}

async function ensureTransaction(databases, env, transaction) {
  const existing = await databases.listDocuments(env.databaseId, env.transactionsCollectionId, [
    Query.equal("referenceId", transaction.referenceId),
    Query.equal("referenceType", transaction.referenceType),
    Query.equal("type", transaction.type),
    Query.limit(1)
  ]);
  if (existing.documents[0]) return { transaction: existing.documents[0], created: false };

  const transactionDocument = await databases.createDocument(
    env.databaseId,
    env.transactionsCollectionId,
    ID.unique(),
    transaction,
    [Permission.read(Role.user(transaction.userId))]
  );

  return { transaction: transactionDocument, created: true };
}

async function updateOrderAfterEscrow(databases, env, orderId) {
  await databases.updateDocument(env.databaseId, env.ordersCollectionId, orderId, {
    status: "in_progress"
  });
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
