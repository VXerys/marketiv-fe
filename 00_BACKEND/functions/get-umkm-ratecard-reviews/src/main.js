import { Client, Databases, Query } from "node-appwrite";

const PAGE_SIZE = 100;
const MAX_DOCS = 5000;
const IN_CHUNK = 100;
const APPWRITE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/;

export default createUmkmRatecardReviewsHandler();

export function createUmkmRatecardReviewsHandler({
  createDatabases = createDatabasesClient,
} = {}) {
  return async ({ req, res, log, error }) => {
    try {
      if (req.method && req.method !== "POST" && req.method !== "GET") {
        return json(res, { error: "Method not allowed" }, 405);
      }

      const env = getEnv(req);
      const callerId = getUserId(req);
      if (!callerId) return json(res, { error: "Unauthorized" }, 401);

      const body = parseBody(req);
      const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
      if (orderId && !APPWRITE_ID.test(orderId)) {
        return json(res, { error: "Order ID tidak valid." }, 400);
      }

      const databases = createDatabases(env);
      const orderQueries = [Query.equal("umkmId", callerId)];
      if (orderId) orderQueries.push(Query.equal("$id", orderId));
      else orderQueries.push(Query.orderDesc("$createdAt"));

      // Ownership masuk query awal. Foreign ID dan missing ID menghasilkan bentuk
      // yang sama, sehingga detail tidak membocorkan keberadaan order UMKM lain.
      const ownedOrders = await listAll(
        databases,
        env.databaseId,
        env.ordersCollectionId,
        orderQueries,
      );
      // Rate Card provenance follows existing backend convention: orders are
      // created from an offer and/or package. Campaign work lives outside this
      // aggregate and must never enter this review surface.
      const orders = ownedOrders.filter(isRateCardOrder);

      if (orderId && orders.length === 0) {
        return json(res, { error: "Review pekerjaan tidak ditemukan." }, 404);
      }
      if (orders.length === 0) return json(res, []);

      const context = await loadContext(databases, env, orders);
      const reviews = orders.map((order) => toReview(order, context));

      log(`UMKM Rate Card reviews for ${callerId}: ${reviews.length} order(s)`);
      return json(res, orderId ? reviews[0] : reviews);
    } catch (err) {
      error(err?.stack || err?.message || String(err));
      return json(res, { error: "Internal server error" }, 500);
    }
  };
}

/**
 * Join per collection, not per order. Dependencies require two additional
 * batches: conversations need offer results; validations need deliverable IDs.
 */
async function loadContext(databases, env, orders) {
  const orderIds = orders.map((order) => order.$id);
  const offerIds = unique(orders.map((order) => str(order.offerId)));
  const creatorIds = unique(orders.map((order) => str(order.creatorId)));
  const packageIds = unique(orders.map((order) => str(order.packageId)));

  const [offers, creators, packages, escrows, deliverables, revisions] = await Promise.all([
    listByIds(databases, env.databaseId, env.offersCollectionId, "$id", offerIds),
    listByIds(databases, env.databaseId, env.creatorProfilesCollectionId, "userId", creatorIds),
    listByIds(databases, env.databaseId, env.packagesCollectionId, "$id", packageIds),
    listByIds(databases, env.databaseId, env.escrowsCollectionId, "orderId", orderIds),
    listByIds(databases, env.databaseId, env.deliverablesCollectionId, "orderId", orderIds),
    listByIds(databases, env.databaseId, env.revisionsCollectionId, "orderId", orderIds),
  ]);

  const conversationIds = unique(offers.map((offer) => str(offer.conversationId)));
  const deliverableIds = deliverables.map((deliverable) => deliverable.$id);
  const [conversations, validations] = await Promise.all([
    listByIds(
      databases,
      env.databaseId,
      env.conversationsCollectionId,
      "$id",
      conversationIds,
    ),
    listByIds(
      databases,
      env.databaseId,
      env.validationsCollectionId,
      "deliverableId",
      deliverableIds,
    ),
  ]);

  return {
    offerById: byKey(offers, (item) => item.$id),
    conversationById: byKey(conversations, (item) => item.$id),
    creatorByUserId: byKey(creators, (item) => str(item.userId)),
    packageById: byKey(packages, (item) => item.$id),
    escrowByOrderId: byKey(escrows, (item) => str(item.orderId)),
    deliverablesByOrderId: groupBy(deliverables, (item) => str(item.orderId)),
    validationByDeliverableId: pickLatestValidations(validations),
    revisionsByOrderId: groupBy(revisions, (item) => str(item.orderId)),
  };
}

function toReview(order, context) {
  const offer = context.offerById.get(str(order.offerId)) || null;
  const conversationId = str(offer?.conversationId);
  const conversation = context.conversationById.get(conversationId) || null;
  const creatorId = str(order.creatorId);
  const creator = context.creatorByUserId.get(creatorId) || null;
  const pkg = context.packageById.get(str(order.packageId)) || null;
  const escrow = context.escrowByOrderId.get(order.$id) || null;
  const deliverables = [...(context.deliverablesByOrderId.get(order.$id) || [])]
    .sort(compareDeliverablesDesc);
  const latest = deliverables[0] || null;
  const validation = latest
    ? context.validationByDeliverableId.get(latest.$id) || null
    : null;
  const revisions = [...(context.revisionsByOrderId.get(order.$id) || [])]
    .sort((a, b) => createdAt(b).localeCompare(createdAt(a)));
  const packageId = str(order.packageId);
  const packageName = str(order.packageNameSnapshot) || str(pkg?.name);

  return {
    orderId: order.$id,
    conversationId,

    creatorId,
    creatorName: str(creator?.displayName) || "Creator",
    creatorAvatarUrl: str(creator?.avatarUrl),

    projectTitle: str(offer?.title) || packageName || "Pekerjaan Rate Card",
    scope: str(offer?.description) || str(pkg?.description),
    packageContext:
      packageId || packageName
        ? {
            id: packageId,
            name: packageName,
            description: str(pkg?.description),
            output: str(pkg?.output),
            deliveryDays: number(pkg?.deliveryDays),
            basePrice: number(order.packagePriceSnapshot ?? pkg?.price),
          }
        : null,

    amount: number(order.amount),
    orderStatus: str(order.status),
    escrowStatus: str(escrow?.status),

    revisionCount: revisions.length,
    revisionLimit: resolveRevisionLimit(
      order.revision_limit,
      offer?.revisionLimit,
      pkg?.revisionLimit,
    ),

    latestDeliverable: latest ? mapDeliverable(latest) : null,
    validation: mapValidation(validation),
    deliverableHistory: deliverables.map(mapDeliverable),
    revisionHistory: revisions.map((revision) => ({
      id: revision.$id,
      message: str(revision.message),
      status: str(revision.status),
      createdAt: createdAt(revision),
    })),
    createdAt: createdAt(order),
  };
}

function mapDeliverable(deliverable) {
  return {
    id: deliverable.$id,
    version: number(deliverable.version),
    status: str(deliverable.status),
    source: str(deliverable.source),
    fileUrl: str(deliverable.fileUrl),
    notes: str(deliverable.notes),
    createdAt: createdAt(deliverable),
  };
}

function mapValidation(validation) {
  if (!validation) return { status: "pending" };
  const status = ["valid", "invalid"].includes(str(validation.status))
    ? str(validation.status)
    : "pending";
  return {
    status,
    reviewNotes: str(validation.reviewNotes) || undefined,
    reviewedAt: str(validation.reviewedAt) || createdAt(validation) || undefined,
  };
}

function compareDeliverablesDesc(a, b) {
  return number(b.version) - number(a.version) || createdAt(b).localeCompare(createdAt(a));
}

function pickLatestValidations(validations) {
  const result = new Map();
  for (const validation of validations) {
    const deliverableId = str(validation.deliverableId);
    const current = result.get(deliverableId);
    if (!current || createdAt(validation) > createdAt(current)) {
      result.set(deliverableId, validation);
    }
  }
  return result;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || "orders",
    offersCollectionId: process.env.OFFERS_COLLECTION_ID || "offers",
    conversationsCollectionId: process.env.CONVERSATIONS_COLLECTION_ID || "conversations",
    creatorProfilesCollectionId: process.env.CREATOR_PROFILES_COLLECTION_ID || "creator_profiles",
    packagesCollectionId: process.env.RATE_CARD_PACKAGES_COLLECTION_ID || "rate_card_packages",
    escrowsCollectionId: process.env.ESCROWS_COLLECTION_ID || "escrows",
    deliverablesCollectionId: process.env.DELIVERABLES_COLLECTION_ID || "deliverables",
    validationsCollectionId:
      process.env.RATECARD_DELIVERABLE_VALIDATIONS_COLLECTION_ID ||
      "ratecard_deliverable_validations",
    revisionsCollectionId: process.env.REVISIONS_COLLECTION_ID || "revisions",
  };
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
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
  try {
    if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
    const raw = req.bodyText || req.body || "{}";
    return typeof raw === "object" ? raw : JSON.parse(raw);
  } catch {
    return {};
  }
}

async function listAll(databases, databaseId, collectionId, queries = []) {
  const documents = [];
  let cursor = null;

  for (;;) {
    const pageQueries = [...queries, Query.limit(PAGE_SIZE)];
    if (cursor) pageQueries.push(Query.cursorAfter(cursor));
    const page = await databases.listDocuments(databaseId, collectionId, pageQueries);
    documents.push(...page.documents);

    if (page.documents.length < PAGE_SIZE || documents.length >= MAX_DOCS) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }
  return documents;
}

async function listByIds(databases, databaseId, collectionId, field, ids) {
  if (!ids.length) return [];
  const pages = await Promise.all(
    chunk(ids, IN_CHUNK).map((values) =>
      listAll(databases, databaseId, collectionId, [Query.equal(field, values)]),
    ),
  );
  return pages.flat();
}

function byKey(documents, pick) {
  return new Map(documents.map((document) => [pick(document), document]));
}

function groupBy(documents, pick) {
  const groups = new Map();
  for (const document of documents) {
    const key = pick(document);
    const group = groups.get(key) || [];
    group.push(document);
    groups.set(key, group);
  }
  return groups;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function resolveRevisionLimit(storedValue, ...sourceValues) {
  const stored = nonNegativeInteger(storedValue);
  if (stored !== null && stored > 0) return stored;
  for (const value of sourceValues) {
    const parsed = nonNegativeInteger(value);
    if (parsed !== null) return parsed;
  }
  return stored ?? 0;
}

function nonNegativeInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function isRateCardOrder(order) {
  return Boolean(str(order?.offerId) || str(order?.packageId));
}

function createdAt(document) {
  return str(document?.createdAt) || str(document?.$createdAt);
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
