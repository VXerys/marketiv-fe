import { Client, Databases, ID, Permission, Role } from "node-appwrite";

/**
 * Kirim satu pesan teks ke ruang negosiasi.
 *
 * ADA DI SISI SERVER KARENA TERPAKSA — alasan yang sama dengan
 * `create-conversation`: baris `messages` harus bisa dibaca LAWAN BICARA, dan
 * klien tidak boleh memasang permission untuk user lain. `messages` juga tidak
 * punya `read` di level koleksi, jadi tanpa permission per-baris pesan itu tidak
 * akan pernah sampai — termasuk lewat realtime, yang hanya mengirim event untuk
 * baris yang boleh dibaca penerimanya.
 *
 * `conversations.last_message` sengaja diperbarui SETELAH pesannya tersimpan.
 * Urutan sebaliknya bisa meninggalkan ringkasan percakapan yang menjanjikan
 * pesan yang tidak pernah ada.
 */

/** Batas kolom `messages.content` di appwrite.config.json. */
const MAX_MESSAGE_LENGTH = 2000;
/** Batas kolom `conversations.last_message`. Lebih kecil dari content. */
const MAX_LAST_MESSAGE_LENGTH = 1000;

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
    const text = str(body.content).trim();

    if (!conversationId) return json(res, { error: "Percakapan tidak valid." }, 400);
    if (!text) return json(res, { error: "Pesan tidak boleh kosong." }, 400);
    if (text.length > MAX_MESSAGE_LENGTH) {
      return json(res, { error: `Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter.` }, 400);
    }

    const databases = createDatabasesClient(env);

    const participation = await loadParticipation(databases, env, conversationId, userId);
    // 404, bukan 403 — membedakan keduanya membocorkan keberadaan percakapan
    // milik orang lain.
    if (!participation) return json(res, { error: "Percakapan tidak ditemukan." }, 404);

    const created = await databases.createDocument(
      env.databaseId,
      env.messagesCollectionId,
      ID.unique(),
      {
        conversation_id: conversationId,
        sender_id: userId,
        message_type: "text",
        content: text,
        offer_id: null,
        read_at: null,
      },
      participantPermissions(participation.umkmId, participation.creatorId)
    );

    // Kegagalan update ringkasan tidak membatalkan pengiriman pesan — baris
    // `messages` sudah tersimpan. Membiarkan 500 di sini menyebabkan pengirim
    // mencoba ulang dan menghasilkan pesan dobel.
    try {
      await databases.updateDocument(env.databaseId, env.conversationsCollectionId, conversationId, {
        last_message: text.slice(0, MAX_LAST_MESSAGE_LENGTH),
        last_message_at: new Date().toISOString(),
      });
    } catch (err) {
      log(`Gagal memperbarui ringkasan percakapan ${conversationId}: ${err?.message || String(err)}`);
    }

    log(`Pesan ${created.$id} terkirim di ${conversationId} oleh ${userId}`);

    // Bentuknya ChatMessage di src/types/umkm-dashboard.types.ts — klien
    // merendernya langsung tanpa memuat ulang percakapan.
    return json(res, {
      id: created.$id,
      conversationId,
      senderId: userId,
      senderRole: participation.role,
      type: "text",
      content: text,
      isRead: false,
      createdAt: created.$createdAt,
    });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

/** Permission baris: kedua peserta membaca dan memperbarui. */
function participantPermissions(umkmId, creatorId) {
  return [
    Permission.read(Role.user(umkmId)),
    Permission.read(Role.user(creatorId)),
    Permission.update(Role.user(umkmId)),
    Permission.update(Role.user(creatorId)),
  ];
}

/** Peserta percakapan + peran pemanggil, atau null bila bukan peserta. */
async function loadParticipation(databases, env, conversationId, userId) {
  let doc;
  try {
    doc = await databases.getDocument(env.databaseId, env.conversationsCollectionId, conversationId);
  } catch (err) {
    if (err?.code === 404) return null;
    throw err;
  }

  const umkmId = str(doc.umkm_id);
  const creatorId = str(doc.creator_id);
  if (umkmId !== userId && creatorId !== userId) return null;

  return { umkmId, creatorId, role: umkmId === userId ? "umkm" : "creator" };
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
