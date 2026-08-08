import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";
import { decrementColumn, incrementColumn } from "./atomic.js";

/**
 * request-withdrawal — penarikan saldo kreator/UMKM (T-06, Pasal 11 & 15 T&C).
 *
 * Alur 4-state: `requested → processing → succeeded | failed | reversed`.
 * Disbursement via Midtrans Iris (B2B payout API, TERPISAH dari Snap — aktivasi
 * dan API key sendiri). Webhook `withdrawal-callback` menutup status final.
 *
 * MENGAPA Function, bukan SDK klien: `wallets` dan `transactions` punya
 * `$permissions: []` + rowSecurity, jadi browser TIDAK bisa mendebit saldo.
 *
 * Perubahan vs ADR-008 lama (withdrawal langsung `processed`):
 *   - `requested`  — audit row dibuat, saldo BELUM keluar.
 *   - `processing` — Iris menerima transfer (dana keluar dari wallet platform).
 *   - `succeeded`  — webhook Iris: dana sampai rekening penerima.
 *   - `failed`     — Iris menolak (rekening salah, saldo platform kurang, dsb);
 *                    saldo DIKREDIT BALIK via ledger `withdrawal_reversal`.
 *   - `reversed`   — kredit balik sudah dieksekusi (marker idempoten).
 *
 * Debit wajib ATOMIK (`decrementColumn` min 0, Fix B) — Appwrite tidak punya
 * compare-and-set; baca-ubah-tulis lama membuat dua request yang tumpang tindih
 * bisa sama-sama membaca angka lama dan satu mutasi hilang.
 *
 * Reversal = entry ledger BARU `withdrawal_reversal` (T-17 append-only), id
 * deterministik `tx` + sha256(`${withdrawalId}:reversal`) sehingga kredit balik
 * tidak pernah dobel. Rollback saat debit gagal TETAP delete baris withdrawal
 * (pola lama, dipertahankan sampai T-17 diganti jadi tanda `failed`).
 */

const PAYOUT_METHODS = new Set(["bank", "ewallet"]);
const UMKM_SOURCE_ORIGINS = new Set(["umkm_refund", "umkm_budget"]);
const ACTIVE_STATUSES = new Set(["requested", "processing", "succeeded"]);

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

    // T-15: penarikan pertama wajib email terverifikasi (ditulis fungsi
    // `user-email-verified` dari event Auth). Hanya gate penarikan pertama.
    if (!(await hasWithdrawal(databases, env, userId)) && !user?.email_verified_at) {
      log(`Withdrawal ditolak untuk ${userId}: email belum diverifikasi`);
      return json(res, { error: "Verifikasi email sebelum penarikan pertama." }, 403);
    }

    // 2) KYC (Pasal 11.8): nominal besar wajib verified. Dokumen diverifikasi
    //    admin via WhatsApp; sistem hanya mencatat status lewat `verify-kyc`.
    if (amount >= env.kycThreshold && user?.kyc_status !== "verified") {
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

    const wallet = await getWallet(databases, env, userId);
    if (!wallet) return json(res, { error: "Wallet tidak ditemukan" }, 404);
    if (Number(wallet.balance) < amount) {
      return json(res, { error: "Saldo tidak mencukupi" }, 409);
    }

    // 3) Rate limit (T-18, Pasal 11): maks 3 withdrawal/hari (status != failed),
    //    plus cooling 3 hari setelah ganti rekening (pola fraud: ganti → tarik).
    const daily = await countTodayWithdrawals(databases, env, userId);
    if (daily >= env.withdrawPerDayLimit) {
      log(`Withdrawal ditolak untuk ${userId}: ${daily} hari ini`);
      return json(res, { error: "Batas penarikan harian tercapai (3/hari)." }, 429);
    }
    if (await hasCoolingBlock(databases, env, userId, payload)) {
      log(`Withdrawal ditolak untuk ${userId}: rekening baru dalam cooling 3 hari`);
      return json(res, { error: "Akun penarikan baru perlu pending 3 hari." }, 429);
    }

    // Guard sekunder: tangkap klien yang me-regenerate requestKey lalu retry.
    const duplicate = await findRecentDuplicate(databases, env, userId, amount);
    if (duplicate) {
      return json(res, { error: "Permintaan penarikan ini sudah diproses." }, 409);
    }

    const documentId = deterministicId(userId, payload.requestKey);

    // 4) Audit dulu — id deterministik = idempotensi tanpa perubahan skema.
    //    Panggilan ulang dengan requestKey sama gagal 409 di sini. Status awal
    //    `requested`, `processedAt` dikosongkan (kolom kini optional) — diisi
    //    hanya saat status final `succeeded`.
    let withdrawal;
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
          status: "requested",
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

    // 5) Debit ATOMIK (Fix B) — min 0 ditegakkan server, bukan Math.max dari
    //    bacaan yang mungkin basi. Gagal -> hapus baris audit (API key boleh
    //    hapus walaupun user tidak) supaya tidak ada catatan tanpa perpindahan.
    try {
      await decrementColumn(env, env.walletsCollectionId, wallet.$id, "balance", amount, 0);
    } catch (err) {
      error(`Debit gagal untuk withdrawal ${documentId}: ${err?.message || err}`);
      try {
        await databases.deleteDocument(env.databaseId, env.withdrawalsCollectionId, documentId);
      } catch (cleanupErr) {
        error(`Rollback baris withdrawal ${documentId} gagal: ${cleanupErr?.message || cleanupErr}`);
      }
      return json(res, { error: "Gagal memproses penarikan. Coba lagi." }, 500);
    }

    // 6) Ledger. Gagal di sini TIDAK di-rollback — merekonstruksi dari
    //    `withdrawals` jauh lebih aman daripada membatalkan debit yang selesai.
    //    Permission baris WAJIB: transactions $permissions kosong, jadi row perm
    //    satu-satunya jalur baca (sama seperti fix 17d5241).
    let transactionId = null;
    try {
      const tx = await databases.createDocument(
        env.databaseId,
        env.transactionsCollectionId,
        ID.unique(),
        {
          userId,
          // Positif — arah uang berasal dari `type`. Semua Function terdeploy
          // menulis positif, dan UI merender/mengurutkan formatCurrency(amount).
          amount,
          type: "withdrawal",
          referenceId: documentId,
          referenceType: "withdrawal",
          status: "completed"
        },
        [Permission.read(Role.user(userId))]
      );
      transactionId = tx.$id;
    } catch (err) {
      error(`Baris transactions gagal untuk withdrawal ${documentId}: ${err?.message || err}`);
    }

    // 7) Disbursement Midtrans Iris. `processedAt` diisi saat status final.
    //    Sukses dipanggil (Iris menerima) → `processing` + iris_reference.
    //    Iris menolak (rekening salah, saldo platform kurang, dsb) → `failed` +
    //    failure_reason + KREDIT BALIK reversal SEKARANG (idempoten).
    let irisReference = null;
    let finalStatus = "processing";
    let failureReason = null;
    try {
      const iris = await createIrisPayout(env, {
        beneficiaryName: String(payload.accountName).trim(),
        beneficiaryAccount: String(payload.accountNumber).trim(),
        beneficiaryBank: String(payload.providerName).trim(),
        amount,
        notes: documentId,
      });
      irisReference = iris.reference_no || null;
      await databases.updateDocument(env.databaseId, env.withdrawalsCollectionId, documentId, {
        status: "processing",
        iris_reference: irisReference
      });
    } catch (irisErr) {
      failureReason = irisErr?.message || String(irisErr);
      error(`Iris payout gagal untuk withdrawal ${documentId}: ${failureReason}`);
      await databases.updateDocument(env.databaseId, env.withdrawalsCollectionId, documentId, {
        status: "failed",
        failure_reason: failureReason.slice(0, 500)
      });
      finalStatus = "failed";
      await creditBackReversal(databases, env, withdrawal, amount, log);
    }

    const balanceAfter = await readBalance(databases, env, userId);

    if (finalStatus === "processing") {
      await notify(databases, env, {
        sourceId: withdrawal.$id,
        kind: "withdrawal",
        userId,
        title: "Penarikan Saldo Diproses",
        message: `Penarikan Rp${amount.toLocaleString("id-ID")} ke ${String(payload.payoutMethod).toUpperCase()} sedang diproses. Dana diterima maksimal 1×24 jam kerja.`,
        type: "keuangan",
      }, log);
    } else {
      await notify(databases, env, {
        sourceId: withdrawal.$id,
        kind: "withdrawal_failed",
        userId,
        title: "Penarikan Saldo Gagal",
        message: `Penarikan Rp${amount.toLocaleString("id-ID")} gagal dan saldo sudah dikembalikan. Hubungi admin bila perlu.`,
        type: "keuangan",
      }, log);
    }

    log(`Withdrawal ${withdrawal.$id} ${finalStatus} for ${userId}: ${amount}`);
    return json(res, {
      withdrawalId: withdrawal.$id,
      amount,
      status: finalStatus,
      balanceAfter,
      transactionId,
      ...(irisReference ? { irisReference } : {}),
      ...(failureReason ? { failureReason } : {})
    });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    if (err?.statusCode) return json(res, { error: err.message }, err.statusCode);
    return json(res, { error: "Internal server error" }, 500);
  }
};

/**
 * Kredit balik saldo + ledger `withdrawal_reversal` deterministik. Idempoten:
 * kalau ledger reversal sudah ada (409 / getDocument hit), tidak kredit dua kali.
 */
async function creditBackReversal(databases, env, withdrawal, amount, log) {
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

  await incrementColumn(env, env.walletsCollectionId, wallet.$id, "balance", amount);
  try {
    await databases.createDocument(
      env.databaseId,
      env.transactionsCollectionId,
      ledgerId,
      {
        userId: withdrawal.userId,
        amount,
        type: "withdrawal_reversal",
        referenceId: withdrawal.$id,
        referenceType: "withdrawal",
        status: "completed"
      },
      [Permission.read(Role.user(withdrawal.userId))]
    );
  } catch (ledgerErr) {
    // Kredit sudah jalan; ledger 409 berarti sudah ada dari jalur lain. Gagal
    // lain di-log tanpa menggagalkan alur (rekonstruksi tetap bisa dari withdrawals).
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
  // Iris API key TERPISAH dari Snap (aktivasi terpisah). Fallback ke key Snap
  // hanya supaya sandbox/test yang belum menyetel env Iris tetap jalan.
  env.midtransIrisServerKey = process.env.MIDTRANS_IRIS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY || "";
  env.midtransIrisEnv = process.env.MIDTRANS_IRIS_ENV || "sandbox";
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

/** Jumlah withdrawal user hari ini (status != failed). */
async function countTodayWithdrawals(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.withdrawalsCollectionId, [
    Query.equal("userId", userId)
  ]);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return res.documents.filter((d) => {
    if (d.status === "failed") return false;
    const created = new Date(d.$createdAt || d.createdAt).getTime();
    return created >= startOfDay.getTime();
  }).length;
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
  const ageMs = Date.now() - new Date(last.$createdAt).getTime();
  return ageMs >= 0 && ageMs < 60_000 ? last : null;
}

/**
 * Midtrans Iris — B2B disbursement API (TERPISAH dari Snap, aktivasi terpisah).
 *
 * Endpoint & payload resmi:
 *   POST {base}/payouts
 *   base sandbox: https://app.sandbox.midtrans.com/iris
 *   base prod:    https://app.midtrans.com/iris
 *   Auth: Basic base64(`${serverKey}:`)
 *   Body: { payouts: [{ beneficiary_name, beneficiary_account, beneficiary_bank,
 *          amount (string), notes }] }
 *   Respon: { payouts: [{ reference_no, status }] }
 *
 * Referensi: https://docs.midtrans.com/reference/https-request dan SDK resmi
 * (midtrans-go iris/request.go, midtrans-java MidtransIrisApi).
 */
async function createIrisPayout(env, params) {
  if (!env.midtransIrisServerKey) {
    throw new Error("MIDTRANS_IRIS_SERVER_KEY belum disetel");
  }
  const base = env.midtransIrisEnv === "production"
    ? "https://app.midtrans.com/iris"
    : "https://app.sandbox.midtrans.com/iris";
  const auth = Buffer.from(`${env.midtransIrisServerKey}:`).toString("base64");

  const response = await fetch(`${base}/payouts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${auth}`
    },
    body: JSON.stringify({
      payouts: [
        {
          beneficiary_name: params.beneficiaryName,
          beneficiary_account: params.beneficiaryAccount,
          beneficiary_bank: params.beneficiaryBank,
          amount: String(params.amount),
          notes: params.notes
        }
      ]
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const messages = body?.error_messages || body?.errors || body?.error_message;
    const detail = Array.isArray(messages) ? messages.join(", ") : (messages || `Iris HTTP ${response.status}`);
    const err = new Error(String(detail).slice(0, 500));
    err.statusCode = response.status;
    throw err;
  }
  return body?.payouts?.[0] || body || {};
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
