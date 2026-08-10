import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const databases = createDatabasesClient(env);
    const escrows = await databases.listDocuments(env.databaseId, env.escrowsCollectionId, [
      Query.equal("status", "releasing"),
      Query.limit(100),
    ]);

    let finalized = 0;
    const unresolved = [];

    for (const escrow of escrows.documents) {
      const releaseTx = await findTransaction(databases, env, escrow.$id, "escrow", "release");
      const feeTx = await findTransaction(databases, env, escrow.$id, "escrow", "fee");

      if (releaseTx?.status === "completed" && (!feeTx || feeTx.status === "completed")) {
        await databases.updateDocument(env.databaseId, env.escrowsCollectionId, escrow.$id, { status: "released" });
        if (escrow.orderId) {
          await databases.updateDocument(env.databaseId, env.ordersCollectionId, escrow.orderId, { status: "completed" });
        }
        finalized++;
        continue;
      }

      unresolved.push({
        escrowId: escrow.$id,
        orderId: escrow.orderId || null,
        releaseStatus: releaseTx?.status || "missing",
        feeStatus: feeTx?.status || "missing",
      });
    }

    log(`Reconcile release escrow finalized=${finalized} unresolved=${unresolved.length}`);
    return json(res, { ok: true, finalized, unresolved });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || "escrows",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || "orders",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || "transactions",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

async function findTransaction(databases, env, referenceId, referenceType, type) {
  const result = await databases.listDocuments(env.databaseId, env.transactionsCollectionId, [
    Query.equal("referenceId", referenceId),
    Query.equal("referenceType", referenceType),
    Query.equal("type", type),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
