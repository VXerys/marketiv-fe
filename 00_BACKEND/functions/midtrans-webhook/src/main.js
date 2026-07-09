import crypto from "node:crypto";
import { Client, Databases, Query } from "node-appwrite";

const TERMINAL_STATUSES = new Set(["paid", "failed", "expired", "cancelled"]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv();
    const notification = parseBody(req, error);
    const validationError = validateRequiredPayload(notification);

    if (validationError) {
      return json(res, { error: validationError }, 400);
    }

    if (!isValidSignature(notification, env.midtransServerKey)) {
      error("Invalid Midtrans signature_key");
      return json(res, { error: "Invalid signature" }, 401);
    }

    const databases = createDatabasesClient(env);
    const payment = await findPayment(databases, env, notification.order_id);

    if (!payment) {
      error(`Payment not found for Midtrans order_id: ${notification.order_id}`);
      return json(res, { error: "Payment not found" }, 404);
    }

    if (!isAmountEqual(payment.amount, notification.gross_amount)) {
      error(`Amount mismatch for payment ${payment.$id}`);
      return json(res, { error: "Amount mismatch" }, 409);
    }

    const nextStatus = mapMidtransStatus(notification);
    const currentStatus = payment.status;

    if (!nextStatus) {
      log(`Ignoring Midtrans status ${notification.transaction_status} for payment ${payment.$id}`);
      return json(res, { status: "ignored" });
    }

    if (currentStatus === nextStatus) {
      return json(res, { status: "ok", paymentId: payment.$id, paymentStatus: currentStatus });
    }

    if (TERMINAL_STATUSES.has(currentStatus)) {
      log(`Ignoring ${nextStatus} for terminal payment ${payment.$id} (${currentStatus})`);
      return json(res, { status: "ok", paymentId: payment.$id, paymentStatus: currentStatus });
    }

    const update = { status: nextStatus };

    if (nextStatus === "paid") {
      update.paid_at = toIsoDate(notification.settlement_time || notification.transaction_time);
    }

    await databases.updateDocument(
      env.databaseId,
      env.paymentsCollectionId,
      payment.$id,
      update
    );

    log(`Payment ${payment.$id} updated to ${nextStatus}`);
    return json(res, { status: "ok", paymentId: payment.$id, paymentStatus: nextStatus });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    if (err?.statusCode) {
      return json(res, { error: err.message }, err.statusCode);
    }

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
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY
  };

  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return env;
}

function createDatabasesClient(env) {
  const client = new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);

  return new Databases(client);
}

function parseBody(req, error) {
  if (req.bodyJson && typeof req.bodyJson === "object") {
    return req.bodyJson;
  }

  const rawBody = req.bodyText || req.body || "";

  if (typeof rawBody === "object") {
    return rawBody;
  }

  if (!rawBody) {
    const missingBodyError = new Error("Missing request body");
    missingBodyError.statusCode = 400;
    throw missingBodyError;
  }

  try {
    return JSON.parse(rawBody);
  } catch (err) {
    error(err?.message || String(err));
    const parseError = new Error("Invalid JSON body");
    parseError.statusCode = 400;
    throw parseError;
  }
}

function validateRequiredPayload(notification) {
  const requiredFields = ["order_id", "status_code", "gross_amount", "signature_key", "transaction_status"];
  const missing = requiredFields.filter((field) => !notification?.[field]);

  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  return null;
}

function isValidSignature(notification, serverKey) {
  const source = `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`;
  const expected = crypto.createHash("sha512").update(source).digest("hex");

  return timingSafeEqual(expected, notification.signature_key);
}

function timingSafeEqual(expected, actual) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(String(actual), "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function mapMidtransStatus(notification) {
  const transactionStatus = notification.transaction_status;
  const fraudStatus = notification.fraud_status;

  if (transactionStatus === "capture") {
    if (fraudStatus === "accept") return "paid";
    if (fraudStatus === "challenge") return "pending";
    return "failed";
  }

  if (transactionStatus === "settlement") return "paid";
  if (transactionStatus === "pending") return "pending";
  if (transactionStatus === "expire") return "expired";
  if (transactionStatus === "cancel") return "cancelled";
  if (transactionStatus === "deny" || transactionStatus === "failure") return "failed";
  if (transactionStatus === "refund" || transactionStatus === "partial_refund") return "cancelled";
  if (transactionStatus === "chargeback" || transactionStatus === "partial_chargeback") return "cancelled";

  return null;
}

async function findPayment(databases, env, gatewayReference) {
  const result = await databases.listDocuments(
    env.databaseId,
    env.paymentsCollectionId,
    [Query.equal("gateway_reference", gatewayReference), Query.limit(1)]
  );

  return result.documents[0] || null;
}

function isAmountEqual(localAmount, midtransGrossAmount) {
  const local = Number(localAmount);
  const gross = Number(midtransGrossAmount);

  if (!Number.isFinite(local) || !Number.isFinite(gross)) {
    return false;
  }

  return Math.round(local) === Math.round(gross);
}

function toIsoDate(value) {
  if (!value) return new Date().toISOString();

  const normalized = value.includes("T") ? value : value.replace(" ", "T") + "+07:00";
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
