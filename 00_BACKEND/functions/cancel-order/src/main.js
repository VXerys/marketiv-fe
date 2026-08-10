import { Client, Databases, Query } from "node-appwrite";

const CANCELLABLE_STATUS = "pending_payment";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method !== "POST") return json(res, { error: "Method not allowed" }, 405);

    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const payload = parseBody(req);
    if (!payload?.orderId) return json(res, { error: "orderId wajib diisi" }, 400);

    const env = getEnv(req);
    const databases = createDatabasesClient(env);
    const order = await getOrder(databases, env, payload.orderId, res);
    if (!order) return;

    const actor = await getUser(databases, env, userId);
    if (actor?.role !== "umkm" || actor?.status !== "active") {
      return json(res, { error: "Akun UMKM aktif diperlukan" }, 403);
    }
    if (order.umkmId !== userId) return json(res, { error: "Order bukan milik user ini" }, 403);

    if (order.status === "cancelled") return json(res, { ok: true, status: "already_cancelled" });
    if (order.status !== CANCELLABLE_STATUS) {
      return json(res, { error: `Order status tidak dapat dibatalkan: ${order.status}` }, 409);
    }

    await databases.updateDocument(env.databaseId, env.ordersCollectionId, order.$id, { status: "cancelled" });
    log(`Order ${order.$id} cancelled by UMKM ${userId}`);
    return json(res, { ok: true, status: "cancelled" });
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
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

async function getOrder(databases, env, orderId, res) {
  try {
    return await databases.getDocument(env.databaseId, env.ordersCollectionId, orderId);
  } catch (err) {
    if (err?.code === 404) {
      json(res, { error: "Order tidak ditemukan" }, 404);
      return null;
    }
    throw err;
  }
}

async function getUser(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
