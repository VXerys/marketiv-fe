import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const offer = parseBody(req);
    if (!offer?.$id) return json(res, { error: "Missing offer payload" }, 400);

    // Penolakan tidak membuat order, tapi UMKM tetap harus tahu. Ditangani di
    // sini, bukan di Function terpisah: event `offers.*.update` sudah terpasang
    // ke Function ini, jadi menambah Function kedua untuk event yang sama cuma
    // menggandakan hal yang harus di-deploy dan dijaga tetap sinkron.
    if (offer.status === "rejected") {
      const databases = createDatabasesClient(env);
    
    const [umkm, creator] = await Promise.all([
      getUser(databases, env, offer.umkmId),
      getUser(databases, env, offer.creatorId)
    ]);
    
    if (umkm?.status && umkm.status !== "active") {
      log(`Order untuk offer ${offer.$id} ditolak: UMKM non-active (${umkm.status})`);
      await notify(databases, env, {
        userId: offer.creatorId,
        sourceId: offer.$id,
        kind: "order_blocked_umkm_suspended",
        title: "Pembuatan Pesanan Dibatalkan",
        message: "Pesanan tidak dapat dibuat karena akun UMKM sedang tidak aktif.",
        type: "system",
      }, log);
      return json(res, { status: "ignored", reason: "UMKM is not active" });
    }
    
    if (creator?.status && creator.status !== "active") {
      log(`Order untuk offer ${offer.$id} ditolak: Kreator non-active (${creator.status})`);
      await notify(databases, env, {
        userId: offer.umkmId,
        sourceId: offer.$id,
        kind: "order_blocked_creator_suspended",
        title: "Pembuatan Pesanan Dibatalkan",
        message: "Pesanan tidak dapat dibuat karena akun Kreator sedang tidak aktif.",
        type: "system",
      }, log);
      return json(res, { status: "ignored", reason: "Creator is not active" });
    }


      await notify(databases, env, {
        userId: offer.umkmId,
        sourceId: offer.$id,
        kind: "offer_rejected",
        title: "Penawaran Ditolak",
        message: `Kreator menolak penawaran "${str(offer.title)}". Kamu bisa menawar ulang di ruang negosiasi.`,
        type: "offer_rejected",
      }, log);
      return json(res, { status: "notified", reason: "offer rejected" });
    }

    // Sengaja HANYA memeriksa status akhir, bukan transisi pending->accepted.
    // Event dokumen Appwrite tidak mengirim `$previous`, jadi guard lama
    // (`oldStatus !== "pending"`) selalu gagal dan Function ini tidak pernah
    // membuat satu order pun — memblokir seluruh alur Rate Card.
    // Perlindungan terhadap order ganda dipegang unique index `idx_offerId`
    // di tabel `orders`: createDocument kedua ditolak server, bukan oleh kita.
    if (offer.status !== "accepted") {
      return json(res, { status: "ignored", reason: "offer status is not accepted" });
    }

    const databases = createDatabasesClient(env);

    // T-14: order = aksi finansial, wajib setuju T&C terbaru. Pihak yang
    // bertransaksi adalah kreator (menerima penawaran). Function ini
    // event-driven — tidak ada user untuk dibalas 403, jadi order tidak
    // dibuat dan UMKM diberi tahu agar alur tidak mati senyap.
    const agreedTos = creator?.tos_version === env.currentTosVersion && Boolean(creator?.tos_accepted_at);
    if (!agreedTos) {
      log(`Order untuk offer ${offer.$id} ditolak: kreator ${offer.creatorId} belum setuju T&C ${env.currentTosVersion}`);
      await notify(databases, env, {
        userId: offer.umkmId,
        sourceId: offer.$id,
        kind: "order_tos_blocked",
        title: "Kreator Belum Setujui T&C",
        message: "Kreator belum menyetujui T&C terbaru, jadi pesanan tidak dapat dibuat. Minta kreator menyetujui T&C dulu.",
        type: "order_tos_blocked",
      }, log);
      return json(res, { status: "blocked", reason: "creator has not accepted current T&C" });
    }

    let order;
    try {
      order = await databases.createDocument(
        env.databaseId,
        env.ordersCollectionId,
        ID.unique(),
        {
          offerId: offer.$id,
          creatorId: offer.creatorId,
          umkmId: offer.umkmId,
          amount: Number(offer.price),
          status: "pending_payment",
        },
        // Kedua pihak order harus bisa membacanya, dan UMKM memperbarui statusnya
        // (mis. pembatalan). Tanpa permission baris, order hanya terbaca selama
        // `orders` masih punya read("users") di level koleksi — dan permission itu
        // memberi akses ke order SEMUA orang. Baris ini prasyarat untuk
        // mengetatkannya.
        [
          Permission.read(Role.user(offer.umkmId)),
          Permission.read(Role.user(offer.creatorId)),
          Permission.update(Role.user(offer.umkmId)),
          Permission.update(Role.user(offer.creatorId)),
        ]
      );
    } catch (err) {
      // Offer yang di-update lagi setelah accepted memicu event ini sekali lagi.
      // Unique index menolak duplikatnya — itu hasil yang benar, bukan kegagalan.
      if (isUniqueConflict(err)) {
        log(`Order for offer ${offer.$id} already exists, skipping`);
        return json(res, { status: "already_exists", offerId: offer.$id });
      }
      throw err;
    }

    await notify(databases, env, {
      userId: offer.umkmId,
      sourceId: order.$id,
      kind: "order_created",
      title: "Penawaran Diterima",
      message: `Kreator menerima penawaran "${str(offer.title)}". Selesaikan pembayaran agar pengerjaan bisa dimulai.`,
      type: "order_created",
    }, log);

    log(`Order ${order.$id} created from offer ${offer.$id}`);
    return json(res, { success: true, orderId: order.$id });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

/**
 * Tulis satu baris notifikasi.
 *
 * Id dokumennya deterministik dari (sourceId, kind), jadi event yang terkirim
 * ulang tidak menghasilkan notifikasi ganda — 409 dari server justru hasil yang
 * benar. Pola ini sama dengan penanda ledger di create-escrow.
 *
 * Kegagalan menulis notifikasi TIDAK PERNAH menggagalkan pemanggilnya:
 * ordernya sudah terbentuk, dan membatalkan itu karena notifikasi gagal jauh
 * lebih merugikan daripada notifikasi yang hilang.
 */
async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId,
      env.notificationsCollectionId,
      deterministicId(payload.sourceId, payload.kind),
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
function deterministicId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  env.currentTosVersion = process.env.CURRENT_TOS_VERSION || "v3.1";
  return env;
}

async function getUser(databases, env, userId) {
  const res = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1)
  ]);
  return res.documents[0] || null;
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

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}

// Appwrite membalas 409 saat unique index dilanggar. `type` lebih stabil
// daripada mencocokkan teks pesan, tapi keduanya diperiksa karena versi SDK
// yang berbeda tidak konsisten mengisi `type`.
function isUniqueConflict(err) {
  if (err?.code === 409) return true;
  const type = err?.type || "";
  if (type === "document_already_exists" || type === "index_duplicate") return true;
  return /already exists|duplicate/i.test(err?.message || "");
}
