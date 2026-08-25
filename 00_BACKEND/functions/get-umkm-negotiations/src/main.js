import { Client, Databases, Query } from "node-appwrite";

/**
 * get-umkm-negotiations
 *
 * DTO ruang negosiasi Rate Card Mode dari sisi UMKM.
 * Response = `NegotiationOrder[]`, atau satu objek bila body berisi
 * `conversationId`.
 *
 * Body (opsional, JSON):
 *   { conversationId?: string }
 *
 * CERMIN dari `get-creator-negotiations`. Rantai join, pemilihan offer aktif,
 * dan derivasi `stage` identik — yang berbeda hanya tiga hal:
 *   1. filter peserta  : `umkm_id` alih-alih `creator_id`
 *   2. profil lawan    : `creator_profiles` alih-alih `umkm_profiles`
 *   3. semantik fee    : lihat blok FEE di bawah
 * Perubahan skema di salah satunya HARUS diikutkan ke yang lain.
 *
 * MENGAPA DI-KEY OLEH CONVERSATION, BUKAN ORDER — urutan Alur B adalah
 * chat → offer → accept → order. Order lahir PALING AKHIR, dibuat `create-order`
 * setelah kreator menerima offer. Meng-key daftar ini oleh order membuat seluruh
 * tahap negosiasi tidak punya tempat.
 *
 * MENGAPA HARUS FUNCTION — bukan pilihan gaya. `escrows` dan `orders` punya
 * `$permissions` kosong + rowSecurity; `escrows` bahkan tidak pernah dipasangi
 * permission baris oleh `create-escrow`, jadi klien tidak bisa membacanya sama
 * sekali. Versi klien sebelumnya (`getNegotiationsFromAppwrite`) beriterasi atas
 * `orders` dan mengambil pesan dengan `Query.equal("conversation_id", orderId)` —
 * memakai orderId sebagai conversation_id, yang tidak akan pernah cocok.
 *
 * FEE — SENGAJA BERBEDA DARI SISI KREATOR. ADR-008 menetapkan Rate Card Order
 * sebagai seller-side: UMKM membayar PERSIS harga rate card, tanpa tambahan
 * apa pun, dan potongan 2% diambil dari pendapatan kreator saat escrow dirilis.
 * Jadi di sini `platformFee` = 0 dan `totalAmount` = `finalPrice`. Angka 2% yang
 * muncul di `get-creator-negotiations` adalah beban kreator, bukan beban UMKM —
 * menampilkannya di layar UMKM akan menyesatkan.
 * (Campaign PPV kebalikannya, buyer-side — ditangani `create-payment`.)
 */

const PAGE_SIZE = 100;
const MAX_DOCS = 5000;
const IN_CHUNK = 100;

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "GET") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const body = parseBody(req);
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;

    const databases = createDatabasesClient(env);

    // Kepemilikan ditegakkan lewat query, bukan lewat pemeriksaan setelah ambil:
    // umkm_id selalu ikut sebagai filter, jadi percakapan UMKM lain tidak pernah
    // terbaca walaupun conversationId-nya ditebak.
    const conversations = conversationId
      ? await listAll(databases, env.databaseId, env.conversationsCollectionId, [
          Query.equal("$id", conversationId),
          Query.equal("umkm_id", userId),
          Query.limit(1),
        ])
      : await listAll(databases, env.databaseId, env.conversationsCollectionId, [
          Query.equal("umkm_id", userId),
          // SENGAJA $createdAt, bukan last_message_at: `conversations` tidak punya
          // index untuk kolom itu, dan Appwrite menolak order pada kolom tanpa
          // index. Urutan yang diinginkan UI dipasang di memori di bawah.
          Query.orderDesc("$createdAt"),
        ]);

    if (conversationId && conversations.length === 0) {
      // 404, bukan 403 — membedakan keduanya membocorkan keberadaan percakapan
      // milik UMKM lain.
      return json(res, { error: "Negotiation not found" }, 404);
    }
    if (conversations.length === 0) return json(res, []);

    const context = await loadContext(databases, env, conversations, userId);
    const negotiations = conversations
      .map((conversation) => toNegotiation(conversation, context))
      .sort((a, b) => (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""));

    log(`UMKM negotiations for ${userId}: ${negotiations.length} conversation(s)`);
    return json(res, conversationId ? negotiations[0] : negotiations);
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

/** Semua join dikumpulkan sekali, lalu dipetakan per percakapan di memori. */
async function loadContext(databases, env, conversations, userId) {
  const conversationIds = conversations.map((c) => c.$id);
  const creatorIds = unique(conversations.map((c) => str(c.creator_id)));

  // conversations & messages memakai kolom snake_case — satu-satunya collection
  // yang begitu di seluruh skema.
  const [messages, offers, creatorProfiles] = await Promise.all([
    listByIds(databases, env.databaseId, env.messagesCollectionId, "conversation_id", conversationIds),
    listByIds(databases, env.databaseId, env.offersCollectionId, "conversationId", conversationIds),
    listByIds(databases, env.databaseId, env.creatorProfilesCollectionId, "userId", creatorIds),
  ]);

  const activeOffers = pickLatestOffers(offers);
  const offerIds = unique([...activeOffers.values()].map((o) => o.$id));

  const orders = await listByIds(databases, env.databaseId, env.ordersCollectionId, "offerId", offerIds);
  const orderIds = orders.map((o) => o.$id);
  const packageIds = unique(orders.map((o) => str(o.packageId)));

  const [escrows, deliverables, packages] = await Promise.all([
    listByIds(databases, env.databaseId, env.escrowsCollectionId, "orderId", orderIds),
    listByIds(databases, env.databaseId, env.deliverablesCollectionId, "orderId", orderIds),
    listByIds(databases, env.databaseId, env.rateCardPackagesCollectionId, "$id", packageIds),
  ]);
  const validations = await listByIds(databases, env.databaseId, env.validationsCollectionId, "deliverableId", deliverables.map((item) => item.$id));

  return {
    userId,
    offerByConversationId: activeOffers,
    orderByOfferId: byKey(orders, (o) => str(o.offerId)),
    packageById: byKey(packages, (p) => p.$id),
    creatorByUserId: byKey(creatorProfiles, (p) => str(p.userId)),
    escrowByOrderId: byKey(escrows, (e) => str(e.orderId)),
    latestDeliverableByOrderId: pickLatestDeliverables(deliverables),
    validationByDeliverableId: byKey(validations, (item) => str(item.deliverableId)),
    unreadByConversationId: countUnread(messages, userId),
  };
}

function toNegotiation(conversation, ctx) {
  const offer = ctx.offerByConversationId.get(conversation.$id) || null;
  const order = offer ? ctx.orderByOfferId.get(offer.$id) || null : null;
  const pkg = order ? ctx.packageById.get(str(order.packageId)) : null;
  const packageId = str(order?.packageId) || str(offer?.packageId);
  const packageNameSnapshot = str(order?.packageNameSnapshot) || str(offer?.packageNameSnapshot);
  const packagePriceSnapshot = number(
    order?.packagePriceSnapshot ?? offer?.packagePriceSnapshot
  );
  const creator = ctx.creatorByUserId.get(str(conversation.creator_id));
  const escrow = order ? ctx.escrowByOrderId.get(order.$id) : null;
  const deliverable = order ? ctx.latestDeliverableByOrderId.get(order.$id) : null;
  const validation = deliverable ? ctx.validationByDeliverableId.get(deliverable.$id) : null;

  // Nominal mengikuti order kalau sudah ada (itu yang mengikat), kalau belum
  // pakai harga offer yang sedang ditawar.
  const finalPrice = order ? number(order.amount) : number(offer?.price);

  return {
    // Kunci ruang = conversationId. `id` sengaja sama supaya route dan pemetaan
    // klien punya satu sumber, bukan dua field yang bisa berbeda.
    id: conversation.$id,
    conversationId: conversation.$id,
    stage: deriveStage(offer, order),

    creatorId: str(conversation.creator_id),
    creatorName: str(creator?.displayName),
    creatorAvatarUrl: str(creator?.avatarUrl),

    lastMessage: str(conversation.last_message),
    lastMessageAt: str(conversation.last_message_at),
    unreadCount: ctx.unreadByConversationId.get(conversation.$id) ?? 0,
    // Diambil dari kolomnya sendiri, bukan diturunkan dari status order —
    // mengarsipkan adalah keputusan pengguna, bukan konsekuensi status.
    isArchived: Boolean(conversation.is_archived),

    offerId: offer?.$id || undefined,
    offerStatus: offer ? str(offer.status) : undefined,
    projectTitle: str(offer?.title) || str(pkg?.name),
    scope: str(offer?.description) || str(pkg?.description),
    deadline: str(offer?.deadline),
    revisionCount: offer?.revisionLimit ?? pkg?.revisionLimit ?? undefined,
    packageContext:
      packageId && packageNameSnapshot
        ? { id: packageId, name: packageNameSnapshot, basePrice: packagePriceSnapshot }
        : undefined,

    orderId: order?.$id || undefined,
    orderStatus: order ? str(order.status) : undefined,
    escrowStatus: escrow ? str(escrow.status) : undefined,
    // Direct Order lama boleh masih dereference paket; provenance offer baru
    // selalu memakai snapshot di atas agar riwayat tidak berubah saat paket diedit.
    deliverables: str(pkg?.output) || undefined,
    submittedCollabUrl: str(deliverable?.fileUrl) || undefined,
    deliverableValidation: validation ? { status: str(validation.status), reviewedAt: str(validation.reviewedAt) || undefined, reviewNotes: str(validation.reviewNotes) || undefined } : { status: "pending" },

    finalPrice,
    // Seller-side (ADR-008): UMKM membayar persis harga rate card. Nol, bukan
    // 2% — lihat blok FEE di header.
    platformFee: 0,
    totalAmount: finalPrice,
  };
}

/**
 * Satu tahap yang bisa di-switch UI, karena `OrderStatus` tidak punya nilai
 * untuk "order belum ada". Urutannya dari yang paling akhir: begitu order lahir,
 * statusnyalah yang menentukan — status offer tidak lagi relevan.
 *
 * Sama persis dengan get-creator-negotiations:deriveStage.
 */
function deriveStage(offer, order) {
  if (order) return str(order.status);
  if (!offer) return "chatting";
  const status = str(offer.status);
  if (status === "accepted") return "awaiting_order";
  if (status === "rejected") return "offer_rejected";
  return "offer_pending";
}

/**
 * Satu percakapan bisa punya beberapa offer (ditolak lalu ditawar ulang) —
 * ambil yang terbaru.
 */
function pickLatestOffers(offers) {
  const byConversation = new Map();
  for (const offer of offers) {
    const conversationId = str(offer.conversationId);
    const current = byConversation.get(conversationId);
    if (!current || str(offer.$createdAt) > str(current.$createdAt)) {
      byConversation.set(conversationId, offer);
    }
  }
  return byConversation;
}

/** Satu order bisa punya beberapa versi deliverable — ambil versi tertinggi. */
function pickLatestDeliverables(deliverables) {
  const byOrder = new Map();
  for (const deliverable of deliverables) {
    const orderId = str(deliverable.orderId);
    const current = byOrder.get(orderId);
    if (!current || number(deliverable.version) > number(current.version)) {
      byOrder.set(orderId, deliverable);
    }
  }
  return byOrder;
}

/** Belum dibaca = dikirim lawan bicara dan `read_at` masih kosong. */
function countUnread(messages, userId) {
  const byConversation = new Map();
  for (const message of messages) {
    if (str(message.sender_id) === userId) continue;
    if (str(message.read_at)) continue;
    const conversationId = str(message.conversation_id);
    byConversation.set(conversationId, (byConversation.get(conversationId) ?? 0) + 1);
  }
  return byConversation;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    offersCollectionId: process.env.OFFERS_COLLECTION_ID || process.env.NEXT_PUBLIC_OFFER_COLLECTION || "offers",
    rateCardPackagesCollectionId: process.env.RATE_CARD_PACKAGES_COLLECTION_ID || "rate_card_packages",
    creatorProfilesCollectionId: process.env.CREATOR_PROFILES_COLLECTION_ID || "creator_profiles",
    conversationsCollectionId:
      process.env.CONVERSATIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_CONVERSATION_COLLECTION || "conversations",
    messagesCollectionId: process.env.MESSAGES_COLLECTION_ID || process.env.NEXT_PUBLIC_MESSAGE_COLLECTION || "messages",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || process.env.NEXT_PUBLIC_ESCROW_COLLECTION || "escrows",
    deliverablesCollectionId: process.env.DELIVERABLES_COLLECTION_ID || "deliverables",
    validationsCollectionId: process.env.RATECARD_DELIVERABLE_VALIDATIONS_COLLECTION_ID || "ratecard_deliverable_validations",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
  return new Databases(client);
}

function getUserId(req) {
  return req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"];
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

/** Paginasi penuh dengan cursor — listDocuments dibatasi 100 dokumen per panggilan. */
async function listAll(databases, databaseId, collectionId, queries = []) {
  const documents = [];
  let cursor = null;

  for (;;) {
    const paged = [...queries, Query.limit(PAGE_SIZE)];
    if (cursor) paged.push(Query.cursorAfter(cursor));

    const page = await databases.listDocuments(databaseId, collectionId, paged);
    documents.push(...page.documents);

    if (page.documents.length < PAGE_SIZE || documents.length >= MAX_DOCS) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }

  return documents;
}

/** Query.equal dengan array dibatasi 100 nilai — pecah jadi beberapa panggilan. */
async function listByIds(databases, databaseId, collectionId, field, ids, extraQueries = []) {
  if (ids.length === 0) return [];
  const batches = await Promise.all(
    chunk(ids, IN_CHUNK).map((slice) =>
      listAll(databases, databaseId, collectionId, [...extraQueries, Query.equal(field, slice)])
    )
  );
  return batches.flat();
}

function byKey(documents, pick) {
  return new Map(documents.map((document) => [pick(document), document]));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function chunk(values, size) {
  const chunks = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function number(value) {
  return typeof value === "number" ? value : 0;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
