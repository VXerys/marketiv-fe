import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

/**
 * request-withdrawal — penarikan saldo kreator.
 *
 * MENGAPA Function, bukan SDK klien: `wallets` dan `transactions` punya
 * `$permissions: []` + rowSecurity, jadi browser TIDAK bisa mendebit saldo.
 * Port dari 00_BACKEND/src/services/wallet.service.ts:209-268 yang secara
 * struktural tak bisa berjalan dari klien.
 *
 * ADR-008: withdrawal langsung `processed` tanpa review admin, dan kolom
 * `withdrawals.processedAt` required. Artinya platform mencatat payout selesai
 * pada saat request, sebelum pencairan nyata terjadi — itu risiko produk/
 * keuangan, bukan bug kode. Lihat handoff Sprint 3.
 */

const PAYOUT_METHODS = new Set(["bank", "ewallet"]);

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

    // Hanya kreator yang menarik saldo. UMKM mengisi saldo untuk membayar
    // campaign/order, bukan mencairkannya — tanpa guard ini siapa pun yang
    // punya `wallets.balance` bisa menarik dana platform.
    const role = await getUserRole(databases, env, userId);
    if (role !== "creator") {
      log(`Withdrawal ditolak untuk ${userId}: role=${role || "unknown"}`);
      return json(res, { error: "Hanya kreator yang dapat menarik saldo." }, 403);
    }

    // T-14: penarikan = aksi finansial, wajib setuju T&C terbaru. Fungsi
    // `accept-tos` mencatat `tos_version`/`tos_accepted_at` saat user klaim.
    const user = await getUser(databases, env, userId);
    const agreedTos = user?.tos_version === env.currentTosVersion && Boolean(user?.tos_accepted_at);
    if (!agreedTos) {
      log(`Withdrawal ditolak untuk ${userId}: tos_version=${user?.tos_version || "none"}`);
      return json(res, { error: "Setujui T&C terbaru terlebih dahulu." }, 403);
    }

    // T-15: penarikan pertama wajib email terverifikasi (ditulis fungsi
    // `user-email-verified` dari event Auth). Hanya gate penarikan pertama —
    // penarikan berikutnya tidak dicek ulang.
    if (!(await hasWithdrawal(databases, env, userId)) && !user?.email_verified_at) {
      log(`Withdrawal ditolak untuk ${userId}: email belum diverifikasi`);
      return json(res, { error: "Verifikasi email sebelum penarikan pertama." }, 403);
    }

    const wallet = await getWallet(databases, env, userId);
    if (!wallet) return json(res, { error: "Wallet tidak ditemukan" }, 404);
    if (Number(wallet.balance) < amount) {
      return json(res, { error: "Saldo tidak mencukupi" }, 409);
    }

    // Guard sekunder: tangkap klien yang me-regenerate requestKey lalu retry.
    const duplicate = await findRecentDuplicate(databases, env, userId, amount);
    if (duplicate) {
      return json(res, { error: "Permintaan penarikan ini sudah diproses." }, 409);
    }

    const processedAt = new Date().toISOString();
    const documentId = deterministicId(userId, payload.requestKey);

    // 1) Audit dulu — id deterministik = idempotensi tanpa perubahan skema.
    //    Panggilan ulang dengan requestKey sama gagal 409 di sini.
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
          status: "processed",
          processedAt
        },
        [Permission.read(Role.user(userId))]
      );
    } catch (err) {
      if (err?.code === 409) {
        return json(res, { error: "Permintaan penarikan ini sudah diproses." }, 409);
      }
      throw err;
    }

    // 2) Debit saldo. Appwrite tidak punya compare-and-set, jadi baca ulang
    //    tepat sebelum menulis. Gagal -> hapus baris audit (API key boleh hapus
    //    walaupun user tidak) supaya tidak ada catatan tanpa perpindahan uang.
    try {
      const fresh = await getWallet(databases, env, userId);
      if (!fresh || Number(fresh.balance) < amount) {
        throw new Error("Saldo berubah sebelum penarikan diproses");
      }
      await databases.updateDocument(env.databaseId, env.walletsCollectionId, fresh.$id, {
        balance: Number(fresh.balance) - amount
      });
      var balanceAfter = Number(fresh.balance) - amount;
    } catch (err) {
      error(`Debit gagal untuk withdrawal ${documentId}: ${err?.message || err}`);
      try {
        await databases.deleteDocument(env.databaseId, env.withdrawalsCollectionId, documentId);
      } catch (cleanupErr) {
        error(`Rollback baris withdrawal ${documentId} gagal: ${cleanupErr?.message || cleanupErr}`);
      }
      return json(res, { error: "Gagal memproses penarikan. Coba lagi." }, 500);
    }

    // 3) Ledger. Gagal di sini TIDAK di-rollback — merekonstruksi dari
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

    await notify(databases, env, {
      sourceId: withdrawal.$id,
      kind: "withdrawal",
      userId,
      title: "Penarikan Saldo Berhasil",
      message: `Penarikan Rp${amount.toLocaleString("id-ID")} ke ${String(payload.payoutMethod).toUpperCase()} berhasil diproses.`,
      type: "keuangan",
    }, log);

    log(`Withdrawal ${withdrawal.$id} processed for ${userId}: ${amount}`);
    return json(res, {
      withdrawalId: withdrawal.$id,
      amount,
      status: "processed",
      processedAt,
      balanceAfter,
      transactionId
    });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    if (err?.statusCode) return json(res, { error: err.message }, err.statusCode);
    return json(res, { error: "Internal server error" }, 500);
  }
};

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
 * Peran user dari koleksi `users`.
 *
 * WAJIB lewat listDocuments + Query.equal("userId"), BUKAN getDocument(userId):
 * baris `users` dibuat dengan `ID.unique()` di create-user-profile, jadi `$id`
 * baris tidak sama dengan id akun Auth. `getDocument` akan 404 lebih dulu —
 * persis jebakan yang membuat setiap klaim campaign gagal (B-3, fix 11ebfc3).
 */
async function getUser(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents[0] || null;
}

async function getUserRole(databases, env, userId) {
  const doc = await getUser(databases, env, userId);
  return doc?.role || null;
}

async function getWallet(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents[0] || null;
}

/** True jika user pernah punya baris withdrawal (untuk gate email penarikan pertama). */
async function hasWithdrawal(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.withdrawalsCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents.length > 0;
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

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
