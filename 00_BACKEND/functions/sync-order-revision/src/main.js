import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const revision = parseBody(req);
    if (!revision?.$id) return json(res, { error: "Missing revision payload" }, 400);

    const orderId = revision.orderId;
    if (!orderId) return json(res, { status: "ignored", reason: "no orderId" });

    const databases = createDatabasesClient(env);
    const order = await databases.getDocument(env.databaseId, env.ordersCollectionId, orderId);
    if (!["in_progress", "revision"].includes(String(order.status))) {
      return json(res, { status: "ignored", reason: `order status is ${order.status}` });
    }

    const latestDeliverable = await findLatestDeliverable(databases, env, orderId);
    if (latestDeliverable?.status === "submitted") {
      await databases.updateDocument(env.databaseId, env.deliverablesCollectionId, latestDeliverable.$id, {
        status: "revision_requested",
      });
    }

    await databases.updateDocument(env.databaseId, env.ordersCollectionId, orderId, {
      status: "revision",
      review_deadline_at: null,
      reminder_sent_at: null,
    });

    log(`Order ${orderId} moved to revision from revision ${revision.$id}`);
    return json(res, { ok: true, orderId, latestDeliverableId: latestDeliverable?.$id || null });
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
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || "orders",
    deliverablesCollectionId: process.env.DELIVERABLES_COLLECTION_ID || "deliverables",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

async function findLatestDeliverable(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.deliverablesCollectionId, [
    Query.equal("orderId", orderId),
    Query.orderDesc("version"),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
