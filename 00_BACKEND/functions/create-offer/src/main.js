import { Client, Databases, ID, Permission, Role, Query } from "node-appwrite";

/**
 * Kirim Custom Offer di dalam ruang negosiasi. UMKM-ONLY —
 * docs/02_Modules/Offers/30_Business_Rules.md:13.
 *
 * ADA DI SISI SERVER KARENA TERPAKSA: baris `offers` harus bisa dibaca KREATOR
 * dan di-update KREATOR (dialah yang accept/reject), sementara klien tidak boleh
 * memasang permission untuk user lain. `offers` juga tanpa `read` level koleksi.
 *
 * Pembagian permission barisnya dipertahankan apa adanya dari service lama, dan
 * itu bukan detail sepele:
 *   - `update` ke KREATOR — dia yang menerima atau menolak;
 *   - `delete` ke UMKM   — dia yang membatalkan;
 *   - UMKM sengaja TIDAK diberi `update`. Mengubah harga offer yang sudah
 *     dikirim, setelah kreator melihatnya, bukan negosiasi yang jujur.
 *
 * `create-order` menyala dari event `offers.*.update` begitu kreator menerima —
 * jadi urutan tulis di sini menentukan alur berikutnya, jangan dibalik.
 */

const MAX_MESSAGE_LENGTH = 2000;
const MAX_LAST_MESSAGE_LENGTH = 1000;
const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_PRICE = 999999999;

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const body = parseBody(req);
    const conversationId = str(body.conversationId);
    const title = str(body.title).trim();
    const description = str(body.description).trim();
    const deadline = str(body.deadline).trim();
    const price = Number(body.price);
    const revisionLimit = Number(body.revisionLimit);

    const invalid = validate({ conversationId, title, description, deadline, price, revisionLimit });
    if (invalid) return json(res, { error: invalid }, 400);

    const databases = createDatabasesClient(env);

    let conversation;
    try {
      conversation = await databases.getDocument(
        env.databaseId,
        env.conversationsCollectionId,
        conversationId
      );
    } catch (err) {
      if (err?.code === 404) return json(res, { error: "Percakapan tidak ditemukan." }, 404);
      throw err;
    }

    // Peserta diambil dari percakapan, BUKAN dari body: creatorId yang dikirim
    // klien tidak boleh menentukan siapa yang dapat permission.
    const umkmId = str(conversation.umkm_id);
    const creatorId = str(conversation.creator_id);

    if (umkmId !== userId) {
      return json(res, { error: "Hanya UMKM dalam percakapan ini yang dapat mengirim penawaran." }, 403);
    }
    if (body.creatorId && str(body.creatorId) !== creatorId) {
      return json(res, { error: "Kreator tidak sesuai dengan percakapan." }, 400);
    }

    // Tolak offer kedua bila masih ada yang menunggu jawaban kreator — menerima
    // offer lama setelah ada yang baru memicu create-order pada harga yang tidak
    // ditampilkan lagi di UI.
    const pending = await databases.listDocuments(
      env.databaseId,
      env.offersCollectionId,
      [Query.equal("conversationId", conversationId), Query.equal("status", "pending"), Query.limit(1)]
    );
    if (pending.total > 0) {
      return json(res, {
        error: "Masih ada penawaran yang menunggu jawaban kreator. Tarik penawaran tersebut dulu sebelum mengirim yang baru.",
      }, 409);
    }

    const created = await databases.createDocument(
      env.databaseId,
      env.offersCollectionId,
      ID.unique(),
      {
        conversationId,
        umkmId,
        creatorId,
        title,
        description,
        price,
        deadline,
        revisionLimit,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(umkmId)),
        Permission.read(Role.user(creatorId)),
        Permission.update(Role.user(creatorId)),
        Permission.delete(Role.user(umkmId)),
      ]
    );

    const offerId = created.$id;
    const summary = `Penawaran Khusus: ${title}`.slice(0, MAX_MESSAGE_LENGTH);

    // Pesan chat menyusul offer-nya, bukan sebaliknya: kalau createDocument di
    // atas gagal, tidak ada kartu offer menggantung yang menunjuk ke baris yang
    // tidak ada. Kalau JUSTRU ini yang gagal, offer tetap sah dan tetap muncul
    // di DTO negosiasi — jadi kegagalannya tidak dinaikkan sebagai error.
    try {
      await databases.createDocument(
        env.databaseId,
        env.messagesCollectionId,
        ID.unique(),
        {
          conversation_id: conversationId,
          sender_id: userId,
          message_type: "offer",
          content: summary,
          offer_id: offerId,
          read_at: null,
        },
        [
          Permission.read(Role.user(umkmId)),
          Permission.read(Role.user(creatorId)),
          Permission.update(Role.user(umkmId)),
          Permission.update(Role.user(creatorId)),
        ]
      );

      await databases.updateDocument(env.databaseId, env.conversationsCollectionId, conversationId, {
        last_message: summary.slice(0, MAX_LAST_MESSAGE_LENGTH),
        last_message_at: new Date().toISOString(),
        offer_id: offerId,
      });
    } catch (err) {
      log(`Kartu offer ${offerId} gagal ditulis ke chat: ${err?.message || String(err)}`);
    }

    log(`Offer ${offerId} dibuat di ${conversationId} oleh ${userId}`);
    return json(res, { offerId });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

/** Cermin createOfferSchema di src/services/umkm — batasnya dari appwrite.config.json. */
function validate({ conversationId, title, description, deadline, price, revisionLimit }) {
  if (!conversationId) return "Percakapan tidak valid.";
  if (!title) return "Judul penawaran wajib diisi.";
  if (title.length > MAX_TITLE_LENGTH) return `Judul maksimal ${MAX_TITLE_LENGTH} karakter.`;
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return `Deskripsi maksimal ${MAX_DESCRIPTION_LENGTH} karakter.`;
  }
  if (!deadline) return "Deadline wajib diisi.";
  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) return "Format deadline tidak valid.";
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (deadlineDate < today) return "Deadline harus di masa depan.";
  if (!Number.isInteger(price) || price <= 0 || price > MAX_PRICE) return "Harga tidak valid.";
  if (!Number.isInteger(revisionLimit) || revisionLimit < 0) return "Jumlah revisi tidak valid.";
  return null;
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    conversationsCollectionId:
      process.env.CONVERSATIONS_COLLECTION_ID ||
      process.env.NEXT_PUBLIC_CONVERSATION_COLLECTION ||
      "conversations",
    messagesCollectionId: process.env.MESSAGES_COLLECTION_ID || "messages",
    offersCollectionId: process.env.OFFERS_COLLECTION_ID || "offers",
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
  try {
    if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
    const rawBody = req.bodyText || req.body || "{}";
    return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
  } catch {
    return {};
  }
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
