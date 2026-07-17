import { Client, Databases, ID, Permission, Role } from "node-appwrite";

const PURPOSES = new Set(["order", "topup", "campaign"]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv();
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const payload = parseBody(req);
    const validationError = validatePayload(payload);
    if (validationError) return json(res, { error: validationError }, 400);

    const databases = createDatabasesClient(env);
    const amount = Number(payload.amount);
    let order = null;

    if (payload.purpose === "order") {
      order = await databases.getDocument(env.databaseId, env.ordersCollectionId, payload.orderId);
      const orderOwner = order.umkm_id || order.umkmId;
      const orderStatus = order.order_status || order.status;
      const orderAmount = Number(order.price ?? order.amount ?? order.escrow_amount);

      if (orderOwner !== userId) return json(res, { error: "Order does not belong to current user" }, 403);
      if (orderStatus !== "pending_payment") return json(res, { error: "Order is not pending payment" }, 409);
      if (orderAmount !== amount) return json(res, { error: "Payment amount does not match order amount" }, 409);
    }

    const gatewayReference = createGatewayReference(payload.purpose, payload.orderId);
    const payment = await databases.createDocument(
      env.databaseId,
      env.paymentsCollectionId,
      ID.unique(),
      {
        user_id: userId,
        order_id: payload.orderId || null,
        amount,
        purpose: payload.purpose,
        gateway: "midtrans",
        gateway_reference: gatewayReference,
        snap_token: null,
        redirect_url: null,
        status: "pending",
        paid_at: null
      },
      [Permission.read(Role.user(userId))]
    );

    try {
      const midtrans = await createMidtransTransaction(env, {
        gatewayReference,
        amount,
        itemName: order?.title || (payload.purpose === "topup" ? "Marketiv Wallet Top Up" : "Marketiv Order Payment"),
        userId
      });

      await databases.updateDocument(env.databaseId, env.paymentsCollectionId, payment.$id, {
        snap_token: midtrans.token || null,
        redirect_url: midtrans.redirect_url || null
      });

      log(`Payment ${payment.$id} created for ${userId}`);
      return json(res, {
        paymentId: payment.$id,
        gateway: "midtrans",
        snapToken: midtrans.token || undefined,
        redirectUrl: midtrans.redirect_url || undefined,
        status: "pending"
      });
    } catch (err) {
      await databases.updateDocument(env.databaseId, env.paymentsCollectionId, payment.$id, { status: "failed" });
      throw err;
    }
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    if (err?.statusCode) return json(res, { error: err.message }, err.statusCode);
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
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    midtransEnv: process.env.MIDTRANS_ENV || "sandbox"
  };

  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function validatePayload(payload) {
  if (!PURPOSES.has(payload?.purpose)) return "Invalid payment purpose";
  if (!Number.isInteger(Number(payload.amount)) || Number(payload.amount) <= 0) return "Invalid payment amount";
  if (payload.purpose === "order" && !payload.orderId) return "orderId is required for order payment";
  if (payload.purpose === "topup" && payload.orderId) return "Top up must not include orderId";
  return null;
}

function createGatewayReference(purpose, orderId) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return purpose === "order" ? `order-${orderId}-${suffix}` : `topup-${suffix}`;
}

async function createMidtransTransaction(env, params) {
  const baseUrl = env.midtransEnv === "production" ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
  const auth = Buffer.from(`${env.midtransServerKey}:`).toString("base64");
  const response = await fetch(`${baseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${auth}`
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.gatewayReference,
        gross_amount: params.amount
      },
      item_details: [
        {
          id: params.gatewayReference.slice(0, 50),
          price: params.amount,
          quantity: 1,
          name: params.itemName.slice(0, 50)
        }
      ],
      custom_field1: params.userId
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(body.error_messages?.join(", ") || "Failed to create Midtrans transaction");
    err.statusCode = response.status;
    throw err;
  }
  return body;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
