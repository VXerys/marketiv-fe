import { Client, Databases, Query, ID, Permission, Role } from "node-appwrite";
import { createHash } from "node:crypto";

/**
 * fee-rate-flip — Cron harian untuk memantau threshold transaksi completed.
 *
 * Logika:
 * - Hitung `transactions` dengan `status = "completed"` (pakai pagination cursor).
 * - Jika count ≥ 1000: kirim notifikasi admin/platform (log + notifikasi ke user
 *   env `ADMIN_NOTIFY_USER_ID` jika di-set).
 * - Function TIDAK mengubah env FEE_RATE — flip dilakukan manual via Console Appwrite.
 * - Response: { count, thresholdReached, rate: env.FEE_RATE || 0.02 }
 *
 * Schedule: "0 0 * * *" (harian 00:00 UTC — pola expire-stale-claims).
 * Scopes: documents.read (transactions) + documents.write (notifications).
 */

const TRANSACTIONS_COLLECTION_ID = "transactions";
const NOTIFICATIONS_COLLECTION_ID = "notifications";
const THRESHOLD = 1000;
const PAGE_SIZE = 100;

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const databases = createDatabasesClient(env);

    // Hitung completed transactions dengan pagination cursor
    let count = 0;
    let cursor = null;

    for (;;) {
      const queries = [
        Query.equal("status", "completed"),
        Query.limit(PAGE_SIZE)
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const page = await databases.listDocuments(env.databaseId, env.transactionsCollectionId, queries);
      count += page.documents.length;

      if (page.documents.length < PAGE_SIZE) break;
      cursor = page.documents[page.documents.length - 1].$id;
    }

    const currentRate = Number(process.env.FEE_RATE || 0.02);
    const thresholdReached = count >= THRESHOLD;

    if (thresholdReached) {
      // Kirim notifikasi ke admin (log + notifikasi user jika ADMIN_NOTIFY_USER_ID diset)
      log(`FEE_RATE FLIP THRESHOLD REACHED: ${count} completed transactions (threshold: ${THRESHOLD}). Current FEE_RATE: ${currentRate}. Manual flip required via Console: set FEE_RATE=0.05`);

      const adminUserId = process.env.ADMIN_NOTIFY_USER_ID;
      if (adminUserId) {
        await notifyAdmin(databases, env, adminUserId, count, currentRate, log);
      }
    } else {
      log(`FEE_RATE check: ${count} completed transactions (threshold: ${THRESHOLD}). No action needed.`);
    }

    return json(res, {
      count,
      thresholdReached,
      rate: currentRate
    });
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
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications"
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

async function notifyAdmin(databases, env, adminUserId, count, currentRate, log) {
  try {
    const sourceId = `fee-rate-flip-${new Date().toISOString().split("T")[0]}`;
    const kind = "fee_rate_flip_alert";
    const notificationId = deterministicNotificationId(sourceId, kind);

    await databases.createDocument(
      env.databaseId,
      env.notificationsCollectionId,
      notificationId,
      {
        userId: adminUserId,
        title: "Fee Rate Flip Threshold Tercapai",
        message: `Transaksi completed: ${count} (threshold: ${THRESHOLD}). FEE_RATE saat ini: ${(currentRate * 100).toFixed(0)}%. Flip manual ke 5% via Console Appwrite (set FEE_RATE=0.05).`,
        type: "system",
        isRead: false,
        createdAt: new Date().toISOString()
      },
      [Permission.read(Role.user(adminUserId)), Permission.update(Role.user(adminUserId))]
    );
    log(`Notifikasi fee-rate flip dikirim ke admin ${adminUserId}`);
  } catch (err) {
    if (err?.code === 409) return; // already exists
    log(`Gagal kirim notifikasi admin: ${err?.message || String(err)}`);
  }
}

function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}