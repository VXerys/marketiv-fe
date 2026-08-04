import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";
import { incrementColumn } from "./atomic.js";

/**
 * refund-escrow — kembalikan dana escrow ke Wallet UMKM (T-02, Pasal 15 T&C).
 *
 * Satu-satunya jalur yang memindahkan escrow `held` → `refunded`. Dipicu dua
 * cara:
 *   - manual (admin/Console/CLI) untuk dispute — payload `{ escrowId }` atau
 *     `{ orderId }`; `execute: []` jadi tidak ada user biasa yang memanggil.
 *   - tidak langsung lewat `refund-order` yang dipicu event `orders.*.update`.
 *
 * TIDAK mengembalikan fee: escrow rate card berisi PERSIS harga order (fee
 * seller-side dipotong saat release dari pendapatan kreator, fee buyer-side
 * campaign tidak pernah masuk escrow). Jadi kredit ke UMKM = `escrow.amount`
 * utuh, tanpa potongan apa pun.
 *
 * Pola flip-first idempoten (release-escrow:50-73): escrow di-flip ke
 * `refunded` LEBIH DULU, baru ledger dibuat, baru wallet dikredit. Event yang
 * terkirim ulang menemukan escrow `refunded` → dilewati, jadi dana UMKM tidak
 * pernah dikredit dua kali. Ledger memakai id deterministik (`tx` + sha256 dari
 * `${escrow.$id}:refund`) sehingga create kedua gagal 409 — perlindungan kedua
 * untuk jalur yang sama.
 *
 * Koreksi ledger mengikuti T-17: entry baru, jangan update/delete entry lama.
 * Satu-satunya delete yang tersisa adalah rollback baris `pending` saat kredit
 * gagal (perilaku dipertahankan sampai T-17, pola request-withdrawal:100-108).
 */

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const payload = parseBody(req);
    const escrowId = payload?.escrowId;
    const orderId = payload?.orderId;
    if (!escrowId && !orderId) {
      return json(res, { error: "escrowId atau orderId wajib diisi" }, 400);
    }

    const databases = createDatabasesClient(env);

    const escrow = escrowId
      ? await databases.getDocument(env.databaseId, env.escrowsCollectionId, escrowId)
      : await findEscrowByOrder(databases, env, orderId);

    if (!escrow) return json(res, { status: "ignored", reason: "escrow not found" });

    // Hanya escrow `held` yang bisa di-refund. `released` = dana kreator sudah
    // cair (tidak boleh ditarik), `refunded` = sudah diproses (event ulang).
    if (String(escrow.status) !== "held") {
      return json(res, { status: "ignored", reason: `escrow status is ${escrow.status}` });
    }

    const order = await databases.getDocument(env.databaseId, env.ordersCollectionId, escrow.orderId);
    const umkmId = order.umkmId;
    if (!umkmId) return json(res, { error: "Order has no umkm" }, 400);

    const escrowAmount = Number(escrow.amount) || 0;

    // 1) Flip escrow DULU — kalau eksekusi berhenti di antara flip dan kredit,
    //    retry menemukan escrow `refunded` dan berhenti sebelum kredit dua kali.
    await databases.updateDocument(env.databaseId, env.escrowsCollectionId, escrow.$id, {
      status: "refunded"
    });

    // 2) Klaim baris ledger sebagai penanda idempotensi (create-escrow:183-195).
    const ledgerId = deterministicId(escrow.$id, "refund");
    try {
      await databases.createDocument(
        env.databaseId,
        env.transactionsCollectionId,
        ledgerId,
        {
          userId: umkmId,
          amount: escrowAmount,
          type: "refund",
          referenceId: escrow.$id,
          referenceType: "escrow",
          status: "pending"
        },
        // `transactions` punya $permissions kosong + rowSecurity, jadi permission
        // baris adalah satu-satunya jalur baca bagi pemiliknya.
        [Permission.read(Role.user(umkmId))]
      );
    } catch (err) {
      if (isConflict(err)) return json(res, { status: "already_processed" });
      throw err;
    }

    // 3) Kredit atomik ke Wallet UMKM. Gagal → hapus baris ledger `pending`
    //    (rollback, pola request-withdrawal:100-108) supaya tidak ada catatan
    //    refund tanpa perpindahan uang.
    const wallet = await findOrCreateWallet(databases, env, umkmId);
    try {
      await incrementColumn(env, env.walletsCollectionId, wallet.$id, "balance", escrowAmount);
    } catch (creditErr) {
      error(`Kredit refund ${ledgerId} gagal: ${creditErr?.message || String(creditErr)}`);
      try {
        await databases.deleteDocument(env.databaseId, env.transactionsCollectionId, ledgerId);
      } catch (cleanupErr) {
        error(`Rollback ledger ${ledgerId} gagal: ${cleanupErr?.message || String(cleanupErr)}`);
      }
      return json(res, { error: "Gagal memproses refund. Coba lagi." }, 500);
    }

    // 4) Tandai ledger selesai.
    await databases.updateDocument(env.databaseId, env.transactionsCollectionId, ledgerId, {
      status: "completed"
    });

    await notify(databases, env, {
      userId: umkmId,
      sourceId: escrow.$id,
      kind: "refund_escrow",
      title: "Refund Diterima",
      message: `Pesanan dibatalkan. Dana ${rupiah(escrowAmount)} sudah dikembalikan ke saldo Wallet UMKM-mu.`,
      type: "refund",
    }, log);

    log(`Escrow ${escrow.$id} refunded to UMKM ${umkmId}: ${escrowAmount}`);
    return json(res, {
      status: "ok",
      escrowId: escrow.$id,
      walletId: wallet.$id,
      amount: escrowAmount
    });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

async function findEscrowByOrder(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.escrowsCollectionId, [
    Query.equal("orderId", orderId),
    Query.limit(1)
  ]);
  return result.documents[0] || null;
}

async function findOrCreateWallet(databases, env, userId) {
  const existing = await databases.listDocuments(env.databaseId, env.walletsCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  if (existing.documents.length > 0) return existing.documents[0];
  return databases.createDocument(
    env.databaseId,
    env.walletsCollectionId,
    ID.unique(),
    { userId, balance: 0, pendingBalance: 0 },
    [Permission.read(Role.user(userId))]
  );
}

/**
 * Tulis satu baris notifikasi. Id dokumen deterministik dari (sourceId, kind),
 * jadi event ulang tidak menghasilkan notifikasi ganda — 409 adalah hasil yang
 * benar. Kegagalan notifikasi TIDAK PERNAH menggagalkan pemanggilnya.
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

/** "tx" + 32 hex = 34 karakter — kunci idempotensi ledger (create-escrow). */
function deterministicId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `tx${digest.slice(0, 32)}`;
}

function isConflict(err) {
  return err?.code === 409 || err?.type === "document_already_exists";
}

function rupiah(value) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    walletsCollectionId: process.env.WALLETS_COLLECTION_ID || "wallets",
    transactionsCollectionId: process.env.TRANSACTIONS_COLLECTION_ID || "transactions",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || "escrows",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || "orders",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
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

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}