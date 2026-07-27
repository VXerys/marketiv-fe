import { Client, Databases, ID, Permission, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const offer = parseBody(req);
    if (!offer?.$id) return json(res, { error: "Missing offer payload" }, 400);

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

    log(`Order ${order.$id} created from offer ${offer.$id}`);
    return json(res, { success: true, orderId: order.$id });
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
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
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
