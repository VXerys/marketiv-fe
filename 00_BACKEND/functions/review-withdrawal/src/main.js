import { createHash } from "node:crypto";
import { Client, Databases, Permission, Query, Role, Users } from "node-appwrite";
import { runWithdrawalTransitionAtomically } from "./withdrawal-transition.js";

const ACTIONS = new Set(["start_processing", "mark_succeeded", "fail"]);

export default createReviewWithdrawalHandler();

export function createReviewWithdrawalHandler({
  createDatabases = createDatabasesClient,
  createUsers = createUsersClient,
  runTransitionAtomically = runWithdrawalTransitionAtomically,
  now = () => new Date(),
} = {}) {
  return async ({ req, res, log, error }) => {
    try {
      if (req.method && req.method !== "POST") {
        return json(res, { error: "Method not allowed" }, 405);
      }

      const env = getEnv(req);
      const adminId = getUserId(req);
      if (!adminId) return json(res, { error: "Unauthorized" }, 401);

      const body = parseBody(req);
      const withdrawalId = text(body.withdrawalId, 36);
      const action = text(body.action, 50);
      const transferReference = text(body.transferReference, 255);
      const failureReason = text(body.failureReason, 500);
      const adminNote = text(body.adminNote, 1000);
      if (!withdrawalId) return json(res, { error: "Withdrawal tidak valid." }, 400);
      if (!ACTIONS.has(action)) return json(res, { error: "Action withdrawal tidak valid." }, 400);
      if (action === "mark_succeeded" && !transferReference) {
        return json(res, { error: "Referensi transfer wajib diisi." }, 400);
      }
      if (action === "fail" && !failureReason) {
        return json(res, { error: "Alasan kegagalan wajib diisi." }, 400);
      }

      const databases = createDatabases(env);
      const admin = await findActiveAdmin(databases, createUsers, env, adminId);
      if (!admin) {
        log(`Review withdrawal ditolak untuk ${adminId}`);
        return json(res, { error: "Akses Admin ditolak." }, 403);
      }

      const withdrawal = await getWithdrawal(databases, env, withdrawalId);
      if (!withdrawal) return json(res, { error: "Withdrawal tidak ditemukan." }, 404);

      const transition = await buildTransition(
        databases,
        env,
        withdrawal,
        { action, transferReference, failureReason, adminNote, adminId, timestamp: now().toISOString() },
      );
      if (transition.error) return json(res, { error: transition.error }, transition.statusCode);

      try {
        await runTransitionAtomically(env, transition.value);
      } catch (transitionError) {
        if (
          transitionError?.transactionPhase === "commit"
          && transitionError?.commitOutcome === "ambiguous"
        ) {
          let committed = false;
          try {
            committed = await proveCommittedTransition(
              databases,
              env,
              transition.value,
            );
          } catch (reconcileError) {
            error(`Rekonsiliasi withdrawal ${withdrawalId} gagal: ${reconcileError?.message || String(reconcileError)}`);
          }
          if (!committed) {
            return json(res, {
              error: "Status commit belum dapat dipastikan. Muat ulang antrean dan lakukan rekonsiliasi sebelum mencoba lagi.",
            }, 500);
          }
          log(`Commit withdrawal ${withdrawalId} terkonfirmasi lewat rekonsiliasi canonical`);
        } else if (transitionError?.status === 409) {
          return json(res, { error: "Withdrawal sudah berubah. Muat ulang antrean." }, 409);
        } else {
          throw transitionError;
        }
      }

      const status = transition.value.withdrawalData.status;
      if (status === "processing") {
        await notify(databases, env, {
          sourceId: withdrawalId,
          kind: "withdrawal_processing",
          userId: withdrawal.userId,
          title: "Penarikan Sedang Diproses",
          message: "Penarikan saldo Anda sedang diproses tim Marketiv.",
        }, log);
      } else if (status === "succeeded") {
        await notify(databases, env, {
          sourceId: withdrawalId,
          kind: "withdrawal_succeeded",
          userId: withdrawal.userId,
          title: "Penarikan Berhasil",
          message: `Penarikan Rp${Number(withdrawal.amount).toLocaleString("id-ID")} berhasil ditransfer.`,
        }, log);
      } else if (status === "reversed") {
        await notify(databases, env, {
          sourceId: withdrawalId,
          kind: "withdrawal_reversed",
          userId: withdrawal.userId,
          title: "Saldo Penarikan Dikembalikan",
          message: `Penarikan Rp${Number(withdrawal.amount).toLocaleString("id-ID")} tidak dapat diproses dan saldo sudah dikembalikan.`,
        }, log);
      }

      log(`Withdrawal ${withdrawalId} menjadi ${status} oleh ${adminId}`);
      return json(res, { success: true, withdrawalId, status });
    } catch (err) {
      error(err?.stack || err?.message || String(err));
      return json(res, { error: "Internal server error" }, 500);
    }
  };
}

async function buildTransition(databases, env, withdrawal, input) {
  const currentStatus = typeof withdrawal.status === "string" ? withdrawal.status : "";

  if (input.action === "start_processing") {
    if (currentStatus !== "requested") return conflict(currentStatus, input.action);
    return {
      value: {
        kind: "state",
        withdrawalId: withdrawal.$id,
        withdrawalData: {
          status: "processing",
          processing_at: input.timestamp,
          processed_by: input.adminId,
        },
      },
    };
  }

  if (input.action === "mark_succeeded") {
    if (currentStatus !== "processing") return conflict(currentStatus, input.action);
    const primary = await getPrimaryTransaction(databases, env, withdrawal);
    if (!primary || primary.status !== "pending") {
      return { error: "Ledger withdrawal pending tidak ditemukan.", statusCode: 409 };
    }
    return {
      value: {
        kind: "succeed",
        withdrawalId: withdrawal.$id,
        withdrawalData: {
          status: "succeeded",
          processedAt: input.timestamp,
          processed_by: input.adminId,
          transfer_reference: input.transferReference,
          ...(input.adminNote ? { admin_note: input.adminNote } : {}),
        },
        primaryTransactionId: primary.$id,
        primaryTransactionStatus: "completed",
      },
    };
  }

  if (currentStatus !== "requested" && currentStatus !== "processing") {
    return conflict(currentStatus, input.action);
  }
  const [primary, wallet] = await Promise.all([
    getPrimaryTransaction(databases, env, withdrawal),
    getWallet(databases, env, withdrawal.userId),
  ]);
  if (!primary || primary.status !== "pending") {
    return { error: "Ledger withdrawal pending tidak ditemukan.", statusCode: 409 };
  }
  if (!wallet) return { error: "Wallet creator tidak ditemukan.", statusCode: 409 };

  return {
    value: {
      kind: "reverse",
      withdrawalId: withdrawal.$id,
      withdrawalData: {
        status: "reversed",
        failure_reason: input.failureReason,
        reversed_at: input.timestamp,
        processedAt: input.timestamp,
        processed_by: input.adminId,
        ...(input.adminNote ? { admin_note: input.adminNote } : {}),
      },
      primaryTransactionId: primary.$id,
      primaryTransactionStatus: "failed",
      walletId: wallet.$id,
      amount: Number(withdrawal.amount),
      userId: withdrawal.userId,
      reversalLedgerId: deterministicLedgerId(withdrawal.$id, "reversal"),
    },
  };
}

function conflict(status, action) {
  return {
    error: `Transisi ${status || "unknown"} dengan action ${action} tidak diizinkan.`,
    statusCode: 409,
  };
}

async function getWithdrawal(databases, env, withdrawalId) {
  try {
    return await databases.getDocument(env.databaseId, env.withdrawalsCollectionId, withdrawalId);
  } catch (err) {
    if (err?.code === 404) return null;
    throw err;
  }
}

async function getPrimaryTransaction(databases, env, withdrawal) {
  const result = await databases.listDocuments(env.databaseId, env.transactionsCollectionId, [
    Query.equal("referenceId", withdrawal.$id),
    Query.limit(10),
  ]);
  const matches = result.documents.filter((transaction) => (
    transaction.referenceType === "withdrawal"
    && transaction.type === "withdrawal"
    && transaction.userId === withdrawal.userId
    && Number(transaction.amount) === Number(withdrawal.amount)
  ));
  return matches.length === 1 ? matches[0] : null;
}

async function getWallet(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

async function proveCommittedTransition(databases, env, transition) {
  const withdrawal = await getWithdrawal(databases, env, transition.withdrawalId);
  if (!withdrawal) return false;

  if (transition.kind === "state") {
    return withdrawal.status === "processing"
      && withdrawal.processed_by === transition.withdrawalData.processed_by
      && sameInstant(withdrawal.processing_at, transition.withdrawalData.processing_at);
  }

  const primary = await getTransactionOrNull(
    databases,
    env,
    transition.primaryTransactionId,
  );
  if (transition.kind === "succeed") {
    return withdrawal.status === "succeeded"
      && withdrawal.transfer_reference === transition.withdrawalData.transfer_reference
      && withdrawal.processed_by === transition.withdrawalData.processed_by
      && primary?.status === "completed";
  }

  if (transition.kind !== "reverse") return false;
  const reversal = await getTransactionOrNull(
    databases,
    env,
    transition.reversalLedgerId,
  );
  return withdrawal.status === "reversed"
    && primary?.status === "failed"
    && reversal?.status === "completed"
    && reversal.userId === transition.userId
    && Number(reversal.amount) === transition.amount
    && reversal.type === "withdrawal_reversal"
    && reversal.referenceId === transition.withdrawalId
    && reversal.referenceType === "withdrawal";
}

async function getTransactionOrNull(databases, env, transactionId) {
  try {
    return await databases.getDocument(
      env.databaseId,
      env.transactionsCollectionId,
      transactionId,
    );
  } catch (err) {
    if (err?.code === 404) return null;
    throw err;
  }
}

function sameInstant(left, right) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  return Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime === rightTime;
}

async function findActiveAdmin(databases, createUsers, env, userId) {
  try {
    const result = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    const user = result.documents[0];
    if (user) {
      if ((user.status || "active").toLowerCase() !== "active") return null;
      if (user.role?.toLowerCase() === "admin") return user;
    }
  } catch {
    return null;
  }

  try {
    const authUser = await createUsers(env).get(userId);
    if (!authUser || authUser.status === false) return null;
    const hasLabel = Array.isArray(authUser.labels)
      && authUser.labels.some((label) => typeof label === "string" && label.toLowerCase() === "admin");
    return hasLabel ? { userId, role: "admin", status: "active" } : null;
  } catch {
    return null;
  }
}

async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId,
      env.notificationsCollectionId,
      deterministicNotificationId(payload.sourceId, payload.kind),
      {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: "keuangan",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))],
    );
  } catch (err) {
    if (err?.code !== 409) {
      log(`Notifikasi ${payload.kind} gagal untuk ${payload.userId}: ${err?.message || String(err)}`);
    }
  }
}

function deterministicLedgerId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `tx${digest.slice(0, 32)}`;
}

function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
    withdrawalsCollectionId: process.env.WITHDRAWALS_COLLECTION_ID || "withdrawals",
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || "transactions",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createClient(env) {
  return new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);
}

function createDatabasesClient(env) { return new Databases(createClient(env)); }
function createUsersClient(env) { return new Users(createClient(env)); }
function getUserId(req) { return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"]; }
function text(value, maxLength) { return typeof value === "string" ? value.trim().slice(0, maxLength) : ""; }
function json(res, body, statusCode = 200) { return res.json(body, statusCode, { "content-type": "application/json" }); }

function parseBody(req) {
  try {
    if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
    const raw = req.bodyText || req.body || "{}";
    return typeof raw === "object" ? raw : JSON.parse(raw);
  } catch {
    return {};
  }
}
