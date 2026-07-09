import { Client, Databases, ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const offer = parseBody(req);
    if (!offer?.$id) return json(res, { error: "Missing offer payload" }, 400);

    const oldStatus = (req.bodyJson && req.bodyJson.oldStatus) || (offer.$previous?.status);
    if (oldStatus !== "pending" || offer.status !== "accepted") {
      return json(res, { status: "ignored", reason: "offer status transition is not pending->accepted" });
    }

    const databases = createDatabasesClient(env);

    const order = await databases.createDocument(
      env.databaseId,
      env.ordersCollectionId,
      ID.unique(),
      {
        offerId: offer.$id,
        creatorId: offer.creatorId,
        umkmId: offer.umkmId,
        amount: Number(offer.price),
        status: "pending_payment",
      }
    );

    log(`Order ${order.$id} created from offer ${offer.$id}`);
    return json(res, { success: true, orderId: order.$id });
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
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
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

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
