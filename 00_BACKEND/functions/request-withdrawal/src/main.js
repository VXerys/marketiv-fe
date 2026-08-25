import { createHash } from "node:crypto";
import { Client, Databases, Permission, Query, Role } from "node-appwrite";
import { reserveWithdrawalAtomically } from "./withdrawal-transaction.js";

/**
 * request-withdrawal — penarikan saldo kreator/UMKM (T-06, Pasal 11 & 15 T&C).
 *
 * Request baru berhenti di `requested` setelah saldo di-reserve dan ledger
 * pending dibuat. Admin memproses transfer manual lewat Function fase admin.
 * Legacy `withdrawal-callback` tetap menangani withdrawal Iris lama.
 *
 * MENGAPA Function, bukan SDK klien: `wallets` dan `transactions` punya
 * `$permissions: []` + rowSecurity, jadi browser TIDAK bisa mendebit saldo.
 *
 * Persistence stages:
 *   - `failed` + internal marker — claim non-actionable selama reserve/ledger.
 *   - `requested` — hanya setelah saldo reserved dan ledger pending tersedia.
 *   - `processing`/`succeeded`/`reversed` — hanya jalur admin atau callback
 *     legacy yang boleh mengubahnya.
 *
 * Reserve wajib satu transaksi database: debit wallet, ledger pending, dan
 * transisi requested commit atau rollback bersama.
 *
 * Rollback saat debit gagal TETAP delete baris withdrawal supaya request tanpa
 * reserve tidak terlihat valid. Reversal request manual menjadi tanggung jawab
 * jalur admin pada fase berikutnya.
 */

const PAYOUT_METHODS = new Set(["bank", "ewallet"]);
const UMKM_SOURCE_ORIGINS = new Set(["umkm_refund", "umkm_budget"]);
const ACTIVE_STATUSES = new Set(["requested", "processing", "succeeded"]);
const LEGACY_RESERVE_PENDING_REASON = "withdrawal_reserve_pending";
const ATOMIC_RESERVE_PENDING_REASON = "withdrawal_atomic_reserve_pending";
const LEDGER_RECOVERY_REASON = "withdrawal_ledger_pending";
const INTERNAL_RECOVERY_REASONS = new Set([
  LEGACY_RESERVE_PENDING_REASON,
  ATOMIC_RESERVE_PENDING_REASON,
  LEDGER_RECOVERY_REASON
]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const payload = parseBody(req);
    const validationError = validatePayload(payload, env.minimumWithdraw);
    if (validationError) return json(res, { error: validationError }, 400);

    const databases = createDatabasesClient(env);
    const amount = Number(payload.amount);

    // Baris `users` dibaca SEKALI di awal: role, T-14 (TOS), T-15 (email), KYC.
    const user = await getUser(databases, env, userId);
    const role = user?.role || null;

    // 1) Guard role + UMKM. Kreator bebas; UMKM wajib menegaskan sumber saldo
    //    (refund / sisa budget) dan membuktikannya di ledger. Role lain ditolak
    //    (perilaku lama) — tanpa guard ini siapa pun yang punya wallet balance
    //    bisa menarik dana platform.
    let sourceOrigin;
    if (role === "creator") {
      sourceOrigin = "creator";
    } else if (role === "umkm") {
      const requested = payload.sourceOrigin;
      if (!UMKM_SOURCE_ORIGINS.has(requested)) {
        log(`Withdrawal UMKM ${userId} ditolak: sourceOrigin=${requested || "none"}`);
        return json(res, { error: "Saldo UMKM hanya dapat ditarik dari refund atau sisa budget." }, 403);
      }
      if (!(await hasLedgerSource(databases, env, userId))) {
        log(`Withdrawal UMKM ${userId} ditolak: tidak ada sumber refund/budget di ledger`);
        return json(res, { error: "Saldo UMKM hanya dapat ditarik dari refund atau sisa budget." }, 403);
      }
      sourceOrigin = requested;
    } else {
      log(`Withdrawal ditolak untuk ${userId}: role=${role || "unknown"}`);
      return json(res, { error: "Hanya kreator yang dapat menarik saldo." }, 403);
    }

    if (user?.status && user.status !== "active") {
      log(`Withdrawal ditolak untuk ${userId}: status akun ${user.status}`);
      return json(res, { error: "Akun Anda sedang tidak aktif." }, 403);
    }

    // T-14: penarikan = aksi finansial, wajib setuju T&C terbaru. Fungsi
    // `accept-tos` mencatat `tos_version`/`tos_accepted_at` saat user klaim.
    const agreedTos = user?.tos_version === env.currentTosVersion && Boolean(user?.tos_accepted_at);
    if (!agreedTos) {
      log(`Withdrawal ditolak untuk ${userId}: tos_version=${user?.tos_version || "none"}`);
      return json(res, { error: "Setujui T&C terbaru terlebih dahulu." }, 403);
    }

    // Future/strict policy: penarikan pertama wajib email terverifikasi
    // (ditulis fungsi `user-email-verified` dari event Auth). Manual-admin MVP
    // tidak hard-block request pada guard ini.
    if (
      env.advancedGuardsEnabled &&
      !(await hasWithdrawal(databases, env, userId)) &&
      !user?.email_verified_at
    ) {
      log(`Withdrawal ditolak untuk ${userId}: email belum diverifikasi`);
      return json(res, { error: "Verifikasi email sebelum penarikan pertama." }, 403);
    }

    // Future/strict policy: nominal besar wajib KYC verified. Manual-admin MVP
    // tidak hard-block dan tidak memutasi status KYC dari request ini.
    if (
      env.advancedGuardsEnabled &&
      amount >= env.kycThreshold &&
      user?.kyc_status !== "verified"
    ) {
      if (!user?.kyc_status || user?.kyc_status === "none") {
        try {
          await databases.updateDocument(env.databaseId, env.usersCollectionId, user.$id, {
            kyc_status: "pending_wa"
          });
        } catch (kycErr) {
          error(`Set kyc_status pending_wa gagal untuk ${userId}: ${kycErr?.message || String(kycErr)}`);
        }
      }
      log(`Withdrawal ditolak untuk ${userId}: KYC=${user?.kyc_status || "none"} amount=${amount}`);
      return json(res, { error: "Verifikasi KYC dulu melalui WhatsApp admin." }, 403);
    }

    const documentId = deterministicId(userId, payload.requestKey);
    const existingWithdrawal = await getDocumentOrNull(
      databases, env.databaseId, env.withdrawalsCollectionId, documentId
    );
    let withdrawal = existingWithdrawal;
    if (existingWithdrawal) {
      if (!matchesWithdrawalRequest(existingWithdrawal, payload, amount)) {
        return json(res, { error: "Permintaan penarikan ini sudah diproses." }, 409);
      }

      if (existingWithdrawal.status === "requested") {
        const ledger = await getValidPendingLedger(
          databases, env, existingWithdrawal, userId, amount
        );
        if (!ledger) {
          error(`Withdrawal requested ${documentId} tidak punya ledger pending valid`);
          return json(res, { error: "Data reserve penarikan tidak lengkap. Hubungi admin." }, 500);
        }
        return json(res, await buildRequestedReceipt(
          databases, env, existingWithdrawal, userId, amount, ledger.$id, log
        ));
      }

      if (
        existingWithdrawal.status === "failed" &&
        existingWithdrawal.failure_reason === LEDGER_RECOVERY_REASON
      ) {
        return recoverPendingLedger(
          databases, env, existingWithdrawal, userId, amount, res, log, error
        );
      }

      // Marker versi lama ambigu: dapat berarti debit belum terjadi atau debit
      // sudah terjadi lalu marker berikutnya gagal. Jangan pernah menebak dan
      // berisiko mendebit ulang; perlu rekonsiliasi manual.
      if (
        existingWithdrawal.status !== "failed" ||
        existingWithdrawal.failure_reason !== ATOMIC_RESERVE_PENDING_REASON
      ) {
        return json(res, { error: "Permintaan penarikan ini perlu rekonsiliasi admin." }, 409);
      }

      const canonical = await findUnresolvedInternalWithdrawal(databases, env, userId);
      if (canonical && canonical.$id !== documentId) {
        return json(res, { error: "Selesaikan pengajuan penarikan sebelumnya dengan requestKey yang sama." }, 409);
      }
    } else {
      const unresolved = await findUnresolvedInternalWithdrawal(databases, env, userId);
      if (unresolved) {
        return json(res, { error: "Selesaikan pengajuan penarikan sebelumnya dengan requestKey yang sama." }, 409);
      }
    }

    const wallet = await getWallet(databases, env, userId);
    if (!wallet) return json(res, { error: "Wallet tidak ditemukan" }, 404);
    if (Number(wallet.balance) < amount) {
      return json(res, { error: "Saldo tidak mencukupi" }, 409);
    }

    if (!existingWithdrawal) {
      // Future/strict policy: rate limit + cooling hanya untuk klaim baru.
      // Retry same-key melanjutkan klaim yang sebelumnya sudah lolos guard.
      if (env.advancedGuardsEnabled) {
        const daily = await countTodayWithdrawals(databases, env, userId);
        if (daily >= env.withdrawPerDayLimit) {
          log(`Withdrawal ditolak untuk ${userId}: ${daily} hari ini`);
          return json(res, { error: "Batas penarikan harian tercapai (3/hari)." }, 429);
        }
        if (await hasCoolingBlock(databases, env, userId, payload)) {
          log(`Withdrawal ditolak untuk ${userId}: rekening baru dalam cooling 3 hari`);
          return json(res, { error: "Akun penarikan baru perlu pending 3 hari." }, 429);
        }
      }

      // Core accidental double-submit guard remains active in every mode.
      if (await findRecentDuplicate(databases, env, userId, amount)) {
        return json(res, { error: "Permintaan penarikan ini sudah diproses." }, 409);
      }

      try {
        withdrawal = await databases.createDocument(
          env.databaseId,
          env.withdrawalsCollectionId,
          documentId,
          {
            userId,
            amount,
            payoutMethod: payload.payoutMethod,
            providerName: String(payload.providerName).trim(),
            accountNumber: String(payload.accountNumber).trim(),
            accountName: String(payload.accountName).trim(),
            status: "failed",
            failure_reason: ATOMIC_RESERVE_PENDING_REASON,
            requester_role: role,
            source_origin: sourceOrigin,
            kyc_status: user?.kyc_status || "none"
          },
          [Permission.read(Role.user(userId))]
        );
      } catch (err) {
        if (err?.code === 409) {
          return json(res, { error: "Permintaan penarikan ini sudah diproses." }, 409);
        }
        throw err;
      }

      // Tutup race dua requestKey yang sama-sama lolos pre-check sebelum claim
      // lawannya terlihat. Hanya marker internal tertua/id terkecil lanjut.
      const canonical = await findUnresolvedInternalWithdrawal(databases, env, userId);
      if (canonical?.$id !== documentId) {
        try {
          await databases.deleteDocument(env.databaseId, env.withdrawalsCollectionId, documentId);
        } catch (cleanupErr) {
          error(`Cleanup claim kalah ${documentId} gagal: ${cleanupErr?.message || cleanupErr}`);
        }
        return json(res, { error: "Selesaikan pengajuan penarikan sebelumnya dengan requestKey yang sama." }, 409);
      }
    }

    const transactionId = deterministicLedgerId(documentId, "withdrawal");
    try {
      await reserveWithdrawalAtomically(env, {
        walletId: wallet.$id,
        withdrawalId: documentId,
        ledgerId: transactionId,
        userId,
        amount
      });
    } catch (reserveErr) {
      error(`Atomic reserve ${documentId} gagal pada ${reserveErr?.transactionPhase || "create"}: ${reserveErr?.message || reserveErr}`);

      // Network failure dan HTTP non-409 pada commit tidak membuktikan apakah
      // server sudah commit. Hanya conflict 409 Appwrite yang menjamin commit
      // ditolak; semua hasil lain wajib reconcile dan mempertahankan claim.
      if (reserveErr?.transactionPhase === "commit" && reserveErr?.status !== 409) {
        const committed = await getCommittedReservationOrNull(
          databases, env, documentId, userId, amount
        );
        if (committed) {
          return json(res, { error: "Konfirmasi reserve terputus. Ulangi dengan requestKey yang sama." }, 500);
        }
        // Hasil commit belum dapat dibuktikan. Biarkan claim internal tetap ada;
        // same-key retry akan rekonsiliasi lagi tanpa membuka requestKey baru.
        return json(res, { error: "Status reserve belum pasti. Ulangi dengan requestKey yang sama." }, 500);
      }

      try {
        await databases.deleteDocument(env.databaseId, env.withdrawalsCollectionId, documentId);
      } catch (cleanupErr) {
        error(`Rollback baris withdrawal ${documentId} gagal: ${cleanupErr?.message || cleanupErr}`);
      }
      return json(res, { error: "Gagal memproses penarikan. Coba lagi." }, 500);
    }

    withdrawal = await databases.getDocument(
      env.databaseId, env.withdrawalsCollectionId, documentId
    );

    return json(res, await buildRequestedReceipt(
      databases, env, withdrawal, userId, amount, transactionId, log
    ));
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    if (err?.statusCode) return json(res, { error: err.message }, err.statusCode);
    return json(res, { error: "Internal server error" }, 500);
  }
};

async function recoverPendingLedger(databases, env, withdrawal, userId, amount, res, log, error) {
  let transactionId;
  try {
    transactionId = await createWithdrawalTransaction(
      databases, env, { userId, amount, withdrawalId: withdrawal.$id }
    );
  } catch (ledgerErr) {
    error(`Recovery ledger ${withdrawal.$id} gagal: ${ledgerErr?.message || ledgerErr}`);
    return json(res, { error: "Gagal mencatat penarikan. Ulangi dengan requestKey yang sama." }, 500);
  }

  let recovered;
  try {
    recovered = await databases.updateDocument(
      env.databaseId,
      env.withdrawalsCollectionId,
      withdrawal.$id,
      { status: "requested", failure_reason: null }
    );
  } catch (updateErr) {
    error(`Recovery status ${withdrawal.$id} gagal: ${updateErr?.message || updateErr}`);
    return json(res, { error: "Gagal memulihkan pengajuan. Ulangi dengan requestKey yang sama." }, 500);
  }

  return json(res, await buildRequestedReceipt(
    databases, env, recovered, userId, amount, transactionId, log
  ));
}

async function createWithdrawalTransaction(databases, env, { userId, amount, withdrawalId }) {
  const transactionId = deterministicLedgerId(withdrawalId, "withdrawal");
  try {
    await databases.createDocument(
      env.databaseId,
      env.transactionsCollectionId,
      transactionId,
      {
        userId,
        // Positif — arah uang berasal dari `type`. Semua Function terdeploy
        // menulis positif, dan UI merender/mengurutkan formatCurrency(amount).
        amount,
        type: "withdrawal",
        referenceId: withdrawalId,
        referenceType: "withdrawal",
        status: "pending"
      },
      [Permission.read(Role.user(userId))]
    );
  } catch (err) {
    if (err?.code !== 409) throw err;
    const existing = await databases.getDocument(
      env.databaseId, env.transactionsCollectionId, transactionId
    );
    const matches = existing.userId === userId &&
      Number(existing.amount) === amount &&
      existing.type === "withdrawal" &&
      existing.referenceId === withdrawalId &&
      existing.referenceType === "withdrawal" &&
      existing.status === "pending";
    if (!matches) throw new Error(`Ledger conflict untuk withdrawal ${withdrawalId}`);
  }
  return transactionId;
}

async function getValidPendingLedger(databases, env, withdrawal, userId, amount) {
  const ledgerId = deterministicLedgerId(withdrawal.$id, "withdrawal");
  const ledger = await getDocumentOrNull(
    databases, env.databaseId, env.transactionsCollectionId, ledgerId
  );
  if (!ledger) return null;
  const matches = ledger.userId === userId &&
    Number(ledger.amount) === amount &&
    ledger.type === "withdrawal" &&
    ledger.referenceId === withdrawal.$id &&
    ledger.referenceType === "withdrawal" &&
    ledger.status === "pending";
  return matches ? ledger : null;
}

async function getCommittedReservationOrNull(databases, env, withdrawalId, userId, amount) {
  try {
    const withdrawal = await getDocumentOrNull(
      databases, env.databaseId, env.withdrawalsCollectionId, withdrawalId
    );
    if (!withdrawal || withdrawal.status !== "requested" || withdrawal.failure_reason) return null;
    const ledger = await getValidPendingLedger(databases, env, withdrawal, userId, amount);
    return ledger ? { withdrawal, ledger } : null;
  } catch {
    return null;
  }
}

async function buildRequestedReceipt(databases, env, withdrawal, userId, amount, transactionId, log) {
  const balanceAfter = await readBalance(databases, env, userId);
  await notify(databases, env, {
    sourceId: withdrawal.$id,
    kind: "withdrawal",
    userId,
    title: "Pengajuan Penarikan Diterima",
    message: `Pengajuan penarikan Rp${amount.toLocaleString("id-ID")} diterima. Saldo sudah dialokasikan dan umumnya diproses dalam 1–2 hari kerja.`,
    type: "keuangan",
  }, log);

  log(`Withdrawal ${withdrawal.$id} requested for ${userId}: ${amount}`);
  return {
    withdrawalId: withdrawal.$id,
    amount,
    status: "requested",
    requestedAt: withdrawal.$createdAt,
    balanceAfter,
    transactionId
  };
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

/** "tx" + 32 hex = 34 karakter — kunci idempotensi ledger. */
function deterministicLedgerId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `tx${digest.slice(0, 32)}`;
}

/**
 * Pola header-first sesuai integration-context/2026-07-25-blocker-api-key-runtime.md:
 * APPWRITE_FUNCTION_API_KEY hanya ada saat BUILD; saat runtime kunci dinamis
 * datang lewat header x-appwrite-key. Ini membuat Function tetap jalan sebelum
 * maupun sesudah backend memperbaiki blocker.
 */
function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || "wallets",
    withdrawalsCollectionId: process.env.WITHDRAWALS_COLLECTION_ID || "withdrawals",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || "transactions",
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
  };

  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);

  env.minimumWithdraw = Number(process.env.MINIMUM_WITHDRAW || 50000);
  env.currentTosVersion = process.env.CURRENT_TOS_VERSION || "v3.1";
  env.kycThreshold = Number(process.env.KYC_THRESHOLD || 5000000);
  env.withdrawPerDayLimit = Number(process.env.WITHDRAW_PER_DAY_LIMIT || 3);
  env.coolingDays = Number(process.env.WITHDRAW_COOLING_DAYS || 3);
  env.advancedGuardsEnabled = String(
    process.env.WITHDRAWAL_ADVANCED_GUARDS_ENABLED || ""
  ).trim().toLowerCase() === "true";
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

/** Port validateWithdrawAmount + validatePayoutDestination, plus batas kolom. */
function validatePayload(payload, minimumWithdraw) {
  const amount = Number(payload?.amount);
  if (!Number.isInteger(amount) || amount <= 0) return "Jumlah penarikan tidak valid";
  if (amount < minimumWithdraw) {
    return `Minimum penarikan Rp${minimumWithdraw.toLocaleString("id-ID")}`;
  }
  if (!PAYOUT_METHODS.has(payload.payoutMethod)) return "Metode penarikan tidak valid";

  const providerName = String(payload.providerName || "").trim();
  const accountNumber = String(payload.accountNumber || "").trim();
  const accountName = String(payload.accountName || "").trim();
  if (!providerName || !accountNumber || !accountName) return "Lengkapi data penarikan";
  if (!/^\d{6,20}$/.test(accountNumber)) return "Nomor rekening tidak valid";

  // Batas ukuran kolom appwrite.config.json.
  if (providerName.length > 100) return "Nama bank/e-wallet terlalu panjang";
  if (accountNumber.length > 100) return "Nomor rekening terlalu panjang";
  if (accountName.length > 255) return "Nama pemilik rekening terlalu panjang";

  const requestKey = String(payload.requestKey || "");
  if (!/^[A-Za-z0-9-]{8,64}$/.test(requestKey)) return "requestKey wajib diisi";
  return null;
}

/**
 * Document id deterministik dari (userId, requestKey). `withdrawals` tak punya
 * kolom requestKey maupun unique index, jadi id inilah kunci idempotensinya.
 * Hasil: "wd" + 32 hex = 34 karakter [a-z0-9], valid sebagai document id.
 */
function deterministicId(userId, requestKey) {
  const digest = createHash("sha256").update(`${userId}:${requestKey}`).digest("hex");
  return `wd${digest.slice(0, 32)}`;
}

/**
 * Baris `users` lewat listDocuments + Query.equal("userId"), BUKAN getDocument:
 * `$id` baris dibuat ID.unique() di create-user-profile, jadi tidak sama dengan
 * id akun Auth (jebakan B-3, fix 11ebfc3).
 */
async function getUser(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents[0] || null;
}

async function getWallet(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents[0] || null;
}

async function readBalance(databases, env, userId) {
  const wallet = await getWallet(databases, env, userId);
  return wallet ? Number(wallet.balance) : 0;
}

async function getDocumentOrNull(databases, databaseId, collectionId, documentId) {
  try {
    return await databases.getDocument(databaseId, collectionId, documentId);
  } catch (err) {
    if (err?.code === 404) return null;
    throw err;
  }
}

function matchesWithdrawalRequest(withdrawal, payload, amount) {
  return Number(withdrawal.amount) === amount &&
    withdrawal.payoutMethod === payload.payoutMethod &&
    String(withdrawal.providerName) === String(payload.providerName).trim() &&
    String(withdrawal.accountNumber) === String(payload.accountNumber).trim() &&
    String(withdrawal.accountName) === String(payload.accountName).trim();
}

/** True jika user pernah punya baris withdrawal (untuk gate email penarikan pertama). */
async function hasWithdrawal(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.withdrawalsCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents.length > 0;
}

/**
 * Sumber saldo UMKM: baris ledger `refund` (escrow/campaign) ATAU pembayaran
 * campaign yang sudah lunas — dua-duanya asal saldo yang sah (T-02, Pasal 15).
 */
async function hasLedgerSource(databases, env, userId) {
  const refunds = await databases.listDocuments(env.databaseId, env.transactionsCollectionId, [
    Query.equal("userId", userId),
    Query.equal("type", "refund"),
    Query.limit(1)
  ]);
  if (refunds.documents.length > 0) return true;

  const campaignPayments = await databases.listDocuments(env.databaseId, env.transactionsCollectionId, [
    Query.equal("userId", userId),
    Query.equal("type", "payment"),
    Query.equal("referenceType", "campaign"),
    Query.limit(1)
  ]);
  return campaignPayments.documents.length > 0;
}

/** Jumlah withdrawal hari ini. Marker recovery internal ikut dihitung/diblok. */
async function countTodayWithdrawals(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.withdrawalsCollectionId, [
    Query.equal("userId", userId)
  ]);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return res.documents.filter((d) => {
    if (d.status === "failed" && !isInternalRecoveryState(d)) return false;
    const created = new Date(d.$createdAt || d.createdAt).getTime();
    return created >= startOfDay.getTime();
  }).length;
}

function isInternalRecoveryState(withdrawal) {
  return withdrawal.status === "failed" &&
    INTERNAL_RECOVERY_REASONS.has(withdrawal.failure_reason);
}

async function findUnresolvedInternalWithdrawal(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.withdrawalsCollectionId, [
    Query.equal("userId", userId)
  ]);
  return res.documents
    .filter(isInternalRecoveryState)
    .sort((left, right) => {
      const timeDelta = new Date(left.$createdAt || left.createdAt).getTime() -
        new Date(right.$createdAt || right.createdAt).getTime();
      return timeDelta || String(left.$id).localeCompare(String(right.$id));
    })[0] || null;
}

/**
 * Cooling 3 hari (Pasal 11): ada withdrawal sukses/aktif 3 hari terakhir dengan
 * rekening BERBEDA dari request ini → blokir. Pola fraud: ganti rekening → tarik.
 */
async function hasCoolingBlock(databases, env, userId, payload) {
  const res = await databases.listDocuments(env.databaseId, env.withdrawalsCollectionId, [
    Query.equal("userId", userId)
  ]);
  const cutoff = Date.now() - env.coolingDays * 24 * 60 * 60 * 1000;
  const accountNumber = String(payload.accountNumber || "").trim();
  const providerName = String(payload.providerName || "").trim();

  return res.documents.some((d) => {
    if (!ACTIVE_STATUSES.has(d.status)) return false;
    const created = new Date(d.$createdAt || d.createdAt).getTime();
    if (created < cutoff) return false;
    const sameAccount = String(d.accountNumber || "") === accountNumber && String(d.providerName || "") === providerName;
    return !sameAccount;
  });
}

/** Withdrawal dengan nominal sama dari user yang sama dalam 60 detik terakhir. */
async function findRecentDuplicate(databases, env, userId, amount) {
  const res = await databases.listDocuments(env.databaseId, env.withdrawalsCollectionId, [
    Query.equal("userId", userId),
    Query.equal("amount", amount),
    Query.orderDesc("$createdAt"),
    Query.limit(1)
  ]);
  const last = res.documents[0];
  if (!last) return null;
  if (last.status === "failed" && !isInternalRecoveryState(last)) return null;
  const ageMs = Date.now() - new Date(last.$createdAt).getTime();
  return ageMs >= 0 && ageMs < 60_000 ? last : null;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
