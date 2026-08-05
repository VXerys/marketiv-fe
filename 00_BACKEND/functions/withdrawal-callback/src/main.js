import { createHash } from "node:crypto";
import { Client, Databases, Query, Role, Permission } from "node-appwrite";
import { incrementColumn } from "./atomic.js";

/**
 * withdrawal-callback — webhook Midtrans Iris mononton status final payout.
 *
 * Iris menjalankan disbursement ASINKRON: request-withdrawal hanya menerima
 * payout (status `processing`). Callback ini menutup 4-state flow:
 *
 *   processing → succeeded  (Iris "completed": dana sampai rekening penerima)
 *   processing → failed     (Iris "failed": dana ditolak) → KREDIT BALIK
 *
 * MENUTUP SUDAH DILAKUKAN SAAT PERMINTAAN: kalau Iris menolak payout SYNCHRON
 * (rektori salah, saldo platform kurang), request-withdrawal sudah menandai
 * `failed` + reversal. Callback yang tiba belakangan melihat status terminal
 * dan menjadi no-op (idempoten) — tidak kredit dua kali.
 *
 * IDEMPOTENSI DOUBLE-SOURCE:
 *   1. Status terminal (`succeeded|failed|reversed`) → 200 tanpa mutasi.
 *   2. Ledger reversal id `tx` + sha256(`${withdrawalId}:reversal`) — kredit
 *      balik tidak pernah dieksekusi dobel walau callback terkirim ulang.
 *
 * AUTH: payload webhook Iris tidak punya skema signature_key terdokumentasi,
 * jadi identitas diikat ke pencarian `iris_reference` (referensi payout) yang
 * dibuat request-withdrawal. Keterbatasan dicatat — pengganti harus membaca
 * webhook signature Iris bila dokumentasi resmi tersedia.
 */

const FINAL_STATUSES = new Set(["succeeded", "failed", "reversed"]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const notification = parseBody(req, error);
    const validationError = validateRequiredPayload(notification);
    if (validationError) return json(res, { error: validationError }, 400);

    const databases = createDatabasesClient(env);
    const referenceNo = notification.reference_no || notification.payouts?.[0]?.reference_no;
    const eventStatus = String(notification.status || notification.payouts?.[0]?.status || "").toLowerCase();

    const withdrawal = await findWithdrawalByIrisReference(databases, env, referenceNo);
    if (!withdrawal) {
      error(`Withdrawal not found for iris reference: ${referenceNo}`);
      return json(res, { error: "Withdrawal not found" }, 404);
    }

    const nextStatus = mapIrisStatus(eventStatus);
    if (!nextStatus) {
      log(`Ignoring Iris status ${eventStatus} for withdrawal ${withdrawal.$id}`);
      return json(res, { status: "ignored", withdrawalId: withdrawal.$id });
    }

    if (FINAL_STATUSES.has(withdrawal.status)) {
      log(`Ignoring ${nextStatus} for terminal withdrawal ${withdrawal.$id} (${withdrawal.status})`);
      return json(res, { status: "ok", withdrawalId: withdrawal.$id, withdrawalStatus: withdrawal.status });
    }

    if (nextStatus === "succeeded") {
      await databases.updateDocument(env.databaseId, env.withdrawalsCollectionId, withdrawal.$id, {
        status: "succeeded",
        processedAt: new Date().toISOString()
      });
      await notify(databases, env, {
        sourceId: withdrawal.$id,
        kind: "withdrawal_success",
        userId: withdrawal.userId,
        title: "Penarikan Saldo Berhasil",
        message: `Penarikan Rp${Number(withdrawal.amount).toLocaleString("id-ID")} sudah masuk ke rekening Anda.`,
        type: "keuangan",
      }, log);
    } else {
      await databases.updateDocument(env.databaseId, env.withdrawalsCollectionId, withdrawal.$id, {
        status: "failed",
        failure_reason: String(notification.status_message || "Dana ditolak penerima").slice(0, 500)
      });
      await creditBackReversal(databases, env, withdrawal, log);
      await notify(databases, env, {
        sourceId: withdrawal.$id,
        kind: "withdrawal_failed",
        userId: withdrawal.userId,
        title: "Penarikan Saldo Gagal",
        message: `Penarikan Rp${Number(withdrawal.amount).toLocaleString("id-ID")} gagal dan saldo sudah dikembalikan. Hubungi admin bila perlu.`,
        type: "keuangan",
      }, log);
    }

    log(`Withdrawal ${withdrawal.$id} updated to ${nextStatus}`);
    return json(res, { status: "ok", withdrawalId: withdrawal.$id, withdrawalStatus: nextStatus });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    if (err?.statusCode) return json(res, { error: err.message }, err.statusCode);
    return json(res, { error: "Internal server error" }, 500);
  }
};

/**
 * Kredit balik saldo + ledger `withdrawal_reversal` deterministik. Idempoten:
 * kalau ledger reversal sudah ada / 409, tidak kredit dua kali.
 */
async function creditBackReversal(databases, env, withdrawal, log) {
  const ledgerId = deterministicLedgerId(withdrawal.$id, "reversal");
  try {
    await databases.getDocument(env.databaseId, env.transactionsCollectionId, ledgerId);
    log(`Reversal ${ledgerId} sudah ada untuk ${withdrawal.$id} — lewati kredit`);
    return;
  } catch (err) {
    if (err?.code !== 404) throw err;
  }

  const wallet = await getWallet(databases, env, withdrawal.userId);
  if (!wallet) throw new Error("Wallet tidak ditemukan saat reversal");

  await incrementColumn(env, env.walletsCollectionId, wallet.$id, "balance", Number(withdrawal.amount));
  try {
    await databases.createDocument(
      env.databaseId,
      env.transactionsCollectionId,
      ledgerId,
      {
        userId: withdrawal.userId,
        amount: Number(withdrawal.amount),
        type: "withdrawal_reversal",
        referenceId: withdrawal.$id,
        referenceType: "withdrawal",
        status: "completed"
      },
      [Permission.read(Role.user(withdrawal.userId))]
    );
  } catch (ledgerErr) {
    if (ledgerErr?.code !== 409) {
      log(`Ledger reversal ${ledgerId} gagal: ${ledgerErr?.message || String(ledgerErr)}`);
    }
  }

  try {
    await databases.updateDocument(env.databaseId, env.withdrawalsCollectionId, withdrawal.$id, {
      status: "reversed",
      reversed_at: new Date().toISOString()
    });
  } catch (updateErr) {
    log(`Tandai reversed ${withdrawal.$id} gagal: ${updateErr?.message || String(updateErr)}`);
  }
}

async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId, env.notificationsCollectionId,
      deterministicNotificationId(payload.sourceId, payload.kind),
      { userId: payload.userId, title: payload.title, message: payload.message,
        type: payload.type, isRead: false, createdAt: new Date().toISOString() },
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))]
    );
  } catch (err) {
    if (err?.code === 409) return;
    log(`Notifikasi ${payload.kind} gagal untuk ${payload.userId}: ${err?.message || String(err)}`);
  }
}

function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

/** "tx" + 32 hex = 34 karakter — kunci idempotensi ledger (create-escrow). */
function deterministicLedgerId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `tx${digest.slice(0, 32)}`;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    withdrawalsCollectionId: process.env.WITHDRAWALS_COLLECTION_ID || "withdrawals",
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || "transactions",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications"
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

function parseBody(req, error) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "";
  if (typeof rawBody === "object") return rawBody;
  if (!rawBody) {
    const e = new Error("Missing request body");
    e.statusCode = 400;
    throw e;
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
  const referenceNo = notification?.reference_no || notification?.payouts?.[0]?.reference_no;
  const status = notification?.status || notification?.payouts?.[0]?.status;
  if (!referenceNo) return "Missing payout reference_no";
  if (!status) return "Missing payout status";
  return null;
}

function mapIrisStatus(status) {
  if (status === "completed" || status === "settled") return "succeeded";
  if (status === "failed" || status === "rejected" || status === "denied") return "failed";
  if (status === "queued" || status === "processing" || status === "pending") return null;
  return null;
}

async function findWithdrawalByIrisReference(databases, env, referenceNo) {
  const result = await databases.listDocuments(env.databaseId, env.withdrawalsCollectionId, [
    Query.equal("iris_reference", referenceNo),
    Query.limit(1)
  ]);
  return result.documents[0] || null;
}

async function getWallet(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents[0] || null;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}