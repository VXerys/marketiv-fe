import { Client, Databases } from "node-appwrite";

/**
 * cancel-payment — Batalkan payment yg masih pending.
 *
 * POST
 * Header: x-appwrite-user-id → 401 bila absen
 * Body:   { paymentId: string }
 *
 * Syarat:
 *   - Payment harus milik user yg login
 *   - Payment status harus "pending" (belum paid/expired/failed/cancelled)
 *
 * 200: { ok: true }
 * 400: { error: "..." }
 * 401: { error: "Unauthorized" }
 * 403: { error: "..." }
 * 409: { error: "Payment status is not pending" }
 */
export default async ({ req, res, log, error }) => {
  try {
    if (req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const payload = parseBody(req);
    if (!payload?.paymentId) {
      return json(res, { error: "paymentId wajib diisi" }, 400);
    }

    const env = getEnv(req);
    const databases = createDatabasesClient(env);

    // Ambil payment
    let payment;
    try {
      payment = await databases.getDocument(
        env.databaseId,
        env.paymentsCollectionId,
        payload.paymentId
      );
    } catch (err) {
      if (err?.code === 404) {
        return json(res, { error: "Payment tidak ditemukan" }, 404);
      }
      throw err;
    }

    // Validasi kepemilikan
    if (payment.user_id !== userId) {
      return json(res, { error: "Payment bukan milik user ini" }, 403);
    }

    // Validasi status
    if (payment.status !== "pending") {
      return json(res, {
        error: `Hanya payment dengan status pending yang bisa dibatalkan (saat ini: ${payment.status})`
      }, 409);
    }

    // Update status
    await databases.updateDocument(
      env.databaseId,
      env.paymentsCollectionId,
      payload.paymentId,
      { status: "cancelled" }
    );

    log(`Payment ${payload.paymentId} cancelled by user ${userId}`);
    return json(res, { ok: true });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    if (err?.statusCode) return json(res, { error: err.message }, err.statusCode);
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    paymentsCollectionId: process.env.PAYMENTS_COLLECTION_ID || process.env.NEXT_PUBLIC_PAYMENT_COLLECTION || "payments",
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
