import { Client, Databases, Query } from "node-appwrite";

/**
 * get-creator-negotiations
 *
 * DTO negosiasi Rate Card Mode dari sisi kreator.
 * Response = `CreatorNegotiation[]`, atau satu objek bila body berisi `orderId`.
 *
 * Body (opsional, JSON):
 *   { orderId?: string }
 *
 * MENGAPA HARUS FUNCTION — `orders` sendirian tidak cukup. Kolomnya hanya
 * offerId, packageId, creatorId, umkmId, amount, status, createdAt; sementara
 * view-model butuh judul proyek, scope, deadline, identitas UMKM, pesan
 * terakhir, dan status escrow. Itu join enam collection, dan salah satunya
 * (`escrows`) TIDAK BISA dibaca klien sama sekali — $permissions kosong +
 * rowSecurity, tanpa permission baris (lihat create-escrow).
 *
 * Sumber per field:
 * - `orders` ................ id, status, finalPrice (amount), umkmId
 * - `offers` ................ projectTitle, scope, deadline, revisionCount
 * - `rate_card_packages` .... fallback judul/scope + `deliverables` (kolom output)
 * - `umkm_profiles` ......... umkmName, umkmAvatarUrl
 * - `conversations` ......... lastMessage, lastMessageAt (kolom snake_case!)
 * - `messages` .............. unreadCount (kolom snake_case!)
 * - `escrows` ............... escrowStatus
 * - `deliverables` .......... submittedCollabUrl (versi terbaru)
 *
 * FEE — SENGAJA BERBEDA DARI MOCK. src/mocks/creator-dashboard.mock.ts memakai
 * fee 3% dan `totalAmount = finalPrice + platformFee` (semantik pembeli). Untuk
 * kreator itu salah arah: rate card order adalah seller-side (ADR-008), kreator
 * MENERIMA nominal dikurangi fee. Di sini platformFee = 2% dibulatkan ke bawah
 * dan totalAmount = nominal bersih yang diterima kreator, mengikuti
 * calculateCreatorPayout() di 00_BACKEND/src/services/wallet.service.ts.
 */

const PAGE_SIZE = 100;
const MAX_DOCS = 5000;
const IN_CHUNK = 100;

/**
 * Mirror PLATFORM_FEE_RATE di 00_BACKEND/src/services/wallet.service.ts.
 * Jangan menuliskan angka fee di tempat lain dalam fungsi ini.
 */
const PLATFORM_FEE_RATE = 0.02;

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "GET") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv();
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const body = parseBody(req);
    const orderId = typeof body.orderId === "string" ? body.orderId : null;

    const databases = createDatabasesClient(env);

    // Kepemilikan ditegakkan lewat query, bukan lewat pemeriksaan setelah ambil:
    // creatorId selalu ikut sebagai filter, jadi order milik kreator lain tidak
    // pernah terbaca walaupun orderId-nya ditebak.
    const orders = orderId
      ? await listAll(databases, env.databaseId, env.ordersCollectionId, [
          Query.equal("$id", orderId),
          Query.equal("creatorId", userId),
          Query.limit(1),
        ])
      : await listAll(databases, env.databaseId, env.ordersCollectionId, [
          Query.equal("creatorId", userId),
          Query.orderDesc("$createdAt"),
        ]);

    if (orderId && orders.length === 0) {
      // 404, bukan 403 — membedakan keduanya membocorkan keberadaan order milik
      // kreator lain.
      return json(res, { error: "Negotiation not found" }, 404);
    }
    if (orders.length === 0) return json(res, []);

    const context = await loadContext(databases, env, orders, userId);
    const negotiations = orders.map((order) => toNegotiation(order, context));

    log(`Creator negotiations for ${userId}: ${negotiations.length} order(s)`);
    return json(res, orderId ? negotiations[0] : negotiations);
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

/** Semua join dikumpulkan sekali, lalu dipetakan per order di memori. */
async function loadContext(databases, env, orders, userId) {
  const orderIds = orders.map((o) => o.$id);
  const offerIds = unique(orders.map((o) => str(o.offerId)));
  const packageIds = unique(orders.map((o) => str(o.packageId)));
  const umkmIds = unique(orders.map((o) => str(o.umkmId)));

  const [offers, packages, umkmProfiles, escrows, deliverables] = await Promise.all([
    listByIds(databases, env.databaseId, env.offersCollectionId, "$id", offerIds),
    listByIds(databases, env.databaseId, env.rateCardPackagesCollectionId, "$id", packageIds),
    listByIds(databases, env.databaseId, env.umkmProfilesCollectionId, "userId", umkmIds),
    listByIds(databases, env.databaseId, env.escrowsCollectionId, "orderId", orderIds),
    listByIds(databases, env.databaseId, env.deliverablesCollectionId, "orderId", orderIds),
  ]);

  // conversations & messages memakai kolom snake_case — satu-satunya collection
  // yang begitu di seluruh skema.
  const conversationIds = unique(offers.map((o) => str(o.conversationId)));
  const [conversations, messages] = await Promise.all([
    listByIds(databases, env.databaseId, env.conversationsCollectionId, "$id", conversationIds),
    listByIds(databases, env.databaseId, env.messagesCollectionId, "conversation_id", conversationIds),
  ]);

  return {
    userId,
    offerById: byKey(offers, (o) => o.$id),
    packageById: byKey(packages, (p) => p.$id),
    umkmByUserId: byKey(umkmProfiles, (p) => str(p.userId)),
    escrowByOrderId: byKey(escrows, (e) => str(e.orderId)),
    latestDeliverableByOrderId: pickLatestDeliverables(deliverables),
    conversationById: byKey(conversations, (c) => c.$id),
    unreadByConversationId: countUnread(messages, userId),
  };
}

function toNegotiation(order, ctx) {
  const offer = ctx.offerById.get(str(order.offerId));
  const pkg = ctx.packageById.get(str(order.packageId));
  const umkm = ctx.umkmByUserId.get(str(order.umkmId));
  const conversation = offer ? ctx.conversationById.get(str(offer.conversationId)) : null;
  const escrow = ctx.escrowByOrderId.get(order.$id);
  const deliverable = ctx.latestDeliverableByOrderId.get(order.$id);

  const finalPrice = number(order.amount);
  const platformFee = Math.floor(finalPrice * PLATFORM_FEE_RATE);

  return {
    id: order.$id,
    umkmId: str(order.umkmId),
    umkmName: str(umkm?.businessName),
    umkmAvatarUrl: str(umkm?.logoUrl),
    projectTitle: str(offer?.title) || str(pkg?.name),
    scope: str(offer?.description) || str(pkg?.description),
    finalPrice,
    deadline: str(offer?.deadline),
    status: str(order.status),
    lastMessage: str(conversation?.last_message),
    lastMessageAt: str(conversation?.last_message_at),
    unreadCount: conversation ? ctx.unreadByConversationId.get(conversation.$id) ?? 0 : 0,
    // Ringkasan output paket — `offers.description` sudah dipakai sebagai scope.
    deliverables: str(pkg?.output) || undefined,
    revisionCount: offer?.revisionLimit ?? pkg?.revisionLimit ?? undefined,
    platformFee,
    // Seller-side: yang diterima kreator, bukan yang dibayar UMKM.
    totalAmount: finalPrice - platformFee,
    escrowStatus: escrow ? str(escrow.status) : undefined,
    submittedCollabUrl: str(deliverable?.fileUrl) || undefined,
  };
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

function getEnv() {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    offersCollectionId: process.env.OFFERS_COLLECTION_ID || process.env.NEXT_PUBLIC_OFFER_COLLECTION || "offers",
    rateCardPackagesCollectionId: process.env.RATE_CARD_PACKAGES_COLLECTION_ID || "rate_card_packages",
    umkmProfilesCollectionId: process.env.UMKM_PROFILES_COLLECTION_ID || "umkm_profiles",
    conversationsCollectionId:
      process.env.CONVERSATIONS_COLLECTION_ID || process.env.NEXT_PUBLIC_CONVERSATION_COLLECTION || "conversations",
    messagesCollectionId: process.env.MESSAGES_COLLECTION_ID || process.env.NEXT_PUBLIC_MESSAGE_COLLECTION || "messages",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || process.env.NEXT_PUBLIC_ESCROW_COLLECTION || "escrows",
    deliverablesCollectionId: process.env.DELIVERABLES_COLLECTION_ID || "deliverables",
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

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
