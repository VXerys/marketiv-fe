import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";
import { incrementColumn } from "./atomic.js";

/**
 * Mirror PLATFORM_FEE_RATE di 00_BACKEND/src/services/wallet.service.ts:6 dan
 * src/types/domain.ts:117. Jangan menuliskan angka fee di tempat lain.
 *
 * ADR-008: Rate Card Order memakai fee SELLER-SIDE — UMKM membayar persis harga
 * rate card, potongan 2% diambil dari pendapatan kreator saat escrow dirilis.
 * (Campaign PPV sebaliknya, buyer-side, ditangani create-payment.)
 *
 * Sebelum ini Function mengkredit escrow PENUH ke kreator sementara
 * get-creator-negotiations:138 sudah menampilkan potongan 2% ke layar kreator —
 * angka layar dan angka wallet tidak pernah cocok, dan platform tidak pernah
 * mencatat pendapatan apa pun dari Rate Card Mode.
 */
const PLATFORM_FEE_RATE = 0.02;

/**
 * Status order yang boleh menghasilkan pelepasan dana. Order `cancelled`,
 * `completed`, atau `pending_payment` tidak boleh ikut cair hanya karena ada
 * baris deliverable yang berpindah ke `approved`.
 */
const RELEASABLE_ORDER_STATUSES = new Set(["in_progress", "revision"]);

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const deliverable = parseBody(req);
    if (!deliverable?.$id) return json(res, { error: "Missing deliverable payload" }, 400);
    if (deliverable.status !== "approved") return json(res, { status: "ignored", reason: "deliverable is not approved" });

    const orderId = deliverable.orderId;
    if (!orderId) return json(res, { error: "Missing order id" }, 400);

    const databases = createDatabasesClient(env);
    const order = await databases.getDocument(env.databaseId, env.ordersCollectionId, orderId);
    const creatorId = order.creatorId;
    if (!creatorId) return json(res, { error: "Order has no creator" }, 400);

    // Payload event adalah baris deliverable apa adanya; `orderId`-nya dipakai
    // untuk memuat order di atas, jadi keduanya sudah pasti sinkron. Yang belum
    // diperiksa adalah apakah order-nya memang sedang berjalan.
    if (!RELEASABLE_ORDER_STATUSES.has(String(order.status))) {
      return json(res, { status: "ignored", reason: `order status is ${order.status}` });
    }

    const escrow = await findHeldEscrow(databases, env, orderId);
    if (!escrow) return json(res, { status: "ignored", reason: "held escrow not found" });

    const wallet = await findWallet(databases, env, creatorId);
    if (!wallet) throw new Error(`Wallet not found for creator ${creatorId}`);

    const escrowAmount = Number(escrow.amount);
    const feeAmount = Math.floor(escrowAmount * PLATFORM_FEE_RATE);
    // Sejajar calculateCreatorPayout() di src/services/wallet.service.ts:129.
    const creatorAmount = escrowAmount - feeAmount;

    // Urutannya sengaja: escrow di-flip ke `released` LEBIH DULU, baru wallet
    // dikredit. Kalau eksekusi berhenti di antara keduanya, `findHeldEscrow`
    // pada percobaan berikutnya mengembalikan null sehingga kreator tidak
    // dibayar dua kali — dana tertahan dan bisa dikoreksi manual. Urutan
    // sebaliknya (kredit dulu) akan membayar dua kali saat event terkirim ulang,
    // dan itu tidak bisa ditarik kembali.
    await databases.updateDocument(env.databaseId, env.escrowsCollectionId, escrow.$id, { status: "released" });
    // Increment atomik: kreator bisa punya beberapa order yang dirilis dalam
    // detik yang sama, dan `wallet.balance` di sini adalah bacaan dari sebelum
    // escrow di-flip. Menulis hasil hitungan dari bacaan itu akan menghapus
    // pelepasan lain yang kebetulan bersamaan.
    await incrementColumn(
      env, env.walletsCollectionId, wallet.$id, "balance", creatorAmount
    );

    await ensureTransaction(databases, env, {
      userId: creatorId,
      amount: creatorAmount,
      // `release` + referenceType `escrow` adalah kunci yang dibaca
      // get-creator-dashboard-summary:99 sebagai pendapatan Rate Card. Nominalnya
      // kini bersih setelah fee — itu memang yang diterima kreator.
      type: "release",
      referenceId: escrow.$id,
      referenceType: "escrow",
      status: "completed"
    });

    if (feeAmount > 0) {
      await ensureTransaction(databases, env, {
        userId: creatorId,
        amount: feeAmount,
        // Tipe `fee` tidak ikut terhitung sebagai pendapatan di dashboard
        // (EARNING_TYPE = "release"), jadi baris ini murni jejak transparansi
        // bagi kreator atas potongan yang diambil platform.
        type: "fee",
        referenceId: escrow.$id,
        referenceType: "escrow",
        status: "completed"
      });
    }

    await updateOrderCompleted(databases, env, orderId);

    await notify(databases, env, {
      userId: creatorId,
      sourceId: escrow.$id,
      kind: "escrow_released_creator",
      title: "Dana Sudah Cair",
      message:
        `Pesanan selesai. ${rupiah(creatorAmount)} masuk ke saldomu` +
        (feeAmount > 0 ? ` setelah dipotong fee platform 2% (${rupiah(feeAmount)}).` : "."),
      type: "escrow_released",
    }, log);

    if (order.umkmId) {
      await notify(databases, env, {
        userId: order.umkmId,
        sourceId: escrow.$id,
        kind: "escrow_released_umkm",
        title: "Pesanan Selesai",
        message: `Kamu menyetujui hasil kerjanya dan dana ${rupiah(escrowAmount)} sudah dilepaskan ke kreator.`,
        type: "order_completed",
      }, log);
    }

    log(`Escrow ${escrow.$id} released to creator ${creatorId}: ${creatorAmount} net, ${feeAmount} fee`);
    return json(res, {
      status: "ok",
      escrowId: escrow.$id,
      walletId: wallet.$id,
      creatorAmount,
      feeAmount
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
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || process.env.NEXT_PUBLIC_WALLET_COLLECTION || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION || "transactions",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || process.env.NEXT_PUBLIC_ESCROW_COLLECTION || "escrows",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
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

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

async function findHeldEscrow(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.escrowsCollectionId, [
    Query.equal("orderId", orderId),
    Query.equal("status", "held"),
    Query.limit(1)
  ]);
  return result.documents[0] || null;
}

async function findWallet(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

/**
 * Satu baris ledger per (referenceId, referenceType, type). Dipakai dua kali:
 * sekali untuk `release` (nominal bersih) dan sekali untuk `fee` (potongan
 * platform). Karena `type` ikut jadi kunci, keduanya tidak saling menimpa.
 */
async function ensureTransaction(databases, env, transaction) {
  const existing = await databases.listDocuments(env.databaseId, env.transactionsCollectionId, [
    Query.equal("referenceId", transaction.referenceId),
    Query.equal("referenceType", transaction.referenceType),
    Query.equal("type", transaction.type),
    Query.limit(1)
  ]);
  if (existing.documents[0]) return existing.documents[0];

  return databases.createDocument(
    env.databaseId,
    env.transactionsCollectionId,
    ID.unique(),
    transaction,
    // `transactions` punya $permissions kosong + rowSecurity, jadi permission
    // baris adalah satu-satunya jalur baca bagi pemiliknya.
    [Permission.read(Role.user(transaction.userId))]
  );
}

async function updateOrderCompleted(databases, env, orderId) {
  await databases.updateDocument(env.databaseId, env.ordersCollectionId, orderId, {
    status: "completed"
  });
}

/**
 * Tulis satu baris notifikasi.
 *
 * Id dokumennya deterministik dari (sourceId, kind), jadi event yang terkirim
 * ulang tidak menghasilkan notifikasi ganda — 409 dari server justru hasil yang
 * benar. Pola ini sama dengan dedup ledger di file ini.
 *
 * Kegagalan menulis notifikasi TIDAK PERNAH menggagalkan pemanggilnya: dana
 * sudah berpindah, dan membatalkan itu karena notifikasi gagal jauh lebih
 * merugikan daripada notifikasi yang hilang.
 */
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
        type: payload.type,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      // `notifications` punya $permissions kosong + rowSecurity — tanpa
      // permission baris, notifikasi tidak akan pernah terbaca pemiliknya.
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))]
    );
  } catch (err) {
    if (err?.code === 409) return;
    log(`Notifikasi ${payload.kind} gagal untuk ${payload.userId}: ${err?.message || String(err)}`);
  }
}

/** "ntf" + 29 hex = 32 karakter, valid sebagai document id Appwrite. */
function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

function rupiah(value) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
