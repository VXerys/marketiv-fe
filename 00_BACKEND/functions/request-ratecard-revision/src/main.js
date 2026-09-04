import { createHash } from "node:crypto";
import { Client, Databases, Permission, Query, Role } from "node-appwrite";

const ORDER_STATUSES = new Set(["in_progress", "revision"]);
const APPWRITE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/;
const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_REVISION_LIMIT = 3;

/**
 * Request a Rate Card revision as one trusted, synchronous command.
 *
 * Browser callers provide only orderId/message. Caller identity, order
 * ownership, participant permissions, current deliverable, and revision
 * limit all come from server-side Appwrite reads.
 */
export function createRequestRatecardRevisionHandler(dependencies = {}) {
  const createDatabases = dependencies.createDatabases || createDatabasesClient;
  const createRevisionId = dependencies.createRevisionId || revisionDocumentId;
  const getEnvironment = dependencies.getEnvironment || getEnv;

  return async ({ req, res, log, error }) => {
    try {
      if (str(req.method).toUpperCase() !== "POST") {
        return json(res, { error: "Method not allowed" }, 405);
      }

      const callerId = getUserId(req);
      if (!callerId) return json(res, { error: "Unauthorized" }, 401);

      const input = parseBody(req);
      const invalid = validateInput(input);
      if (invalid) return json(res, { error: invalid }, 400);
      const orderId = str(input.orderId).trim();

      const env = getEnvironment(req);
      const databases = createDatabases(env);
      const actor = await getUser(databases, env, callerId);
      if (!actor) return json(res, { error: "Profil Pengguna tidak ditemukan." }, 404);
      if (str(actor.status) && str(actor.status) !== "active") {
        return json(res, { error: "Akun Anda sedang tidak aktif." }, 403);
      }
      if (str(actor.role) !== "umkm") {
        return json(res, { error: "Hanya UMKM yang dapat meminta revisi." }, 403);
      }

      const order = await getDocumentOrNull(
        databases,
        env.databaseId,
        env.ordersCollectionId,
        orderId
      );
      if (!order) return json(res, { error: "Pesanan tidak ditemukan." }, 404);

      // Hide existence of another UMKM's order. Creator has already been
      // rejected by role guard above, so this is not an ownership oracle.
      if (str(order.umkmId) !== callerId) {
        return json(res, { error: "Pesanan tidak ditemukan." }, 404);
      }
      const creatorId = str(order.creatorId);
      if (!APPWRITE_ID.test(creatorId)) {
        return json(res, { error: "Pesanan tidak memiliki kreator yang valid." }, 409);
      }
      if (!ORDER_STATUSES.has(str(order.status))) {
        return json(
          res,
          { error: "Pesanan tidak dalam status yang dapat direvisi." },
          409
        );
      }

      const latest = await findLatestDeliverable(databases, env, orderId);
      if (!latest) {
        return json(
          res,
          { error: "Deliverable terbaru belum siap untuk diminta revisi." },
          409
        );
      }

      const revisionId = createRevisionId(orderId, latest.$id);
      let revision = await getDocumentOrNull(
        databases,
        env.databaseId,
        env.revisionsCollectionId,
        revisionId
      );

      if (revision && !isMatchingRevision(revision, orderId, callerId)) {
        return json(res, { error: "Data permintaan revisi tidak konsisten." }, 409);
      }

      if (!revision) {
        if (str(latest.status) !== "submitted") {
          return json(
            res,
            { error: "Deliverable terbaru belum siap untuk diminta revisi." },
            409
          );
        }

        const revisions = await databases.listDocuments(
          env.databaseId,
          env.revisionsCollectionId,
          [Query.equal("orderId", orderId), Query.limit(1)]
        );
        const revisionCount = Number(revisions.total || 0);
        const revisionLimit = await resolveRevisionLimit(databases, env, order);
        if (!Number.isInteger(revisionLimit) || revisionCount >= revisionLimit) {
          return json(
            res,
            { error: `Batas revisi (${revisionLimit}) sudah tercapai. Setujui apa adanya atau buka sengketa.` },
            409
          );
        }

        try {
          revision = await databases.createDocument(
            env.databaseId,
            env.revisionsCollectionId,
            revisionId,
            {
              orderId,
              requestedBy: callerId,
              message: input.message.trim(),
              status: "open",
            },
            revisionPermissions(callerId, creatorId)
          );
        } catch (err) {
          if (err?.code !== 409) throw err;
          revision = await getDocumentOrNull(
            databases,
            env.databaseId,
            env.revisionsCollectionId,
            revisionId
          );
          if (!revision || !isMatchingRevision(revision, orderId, callerId)) throw err;
        }
      }

      if (!["submitted", "revision_requested"].includes(str(latest.status))) {
        return json(
          res,
          { error: "Deliverable terbaru belum siap untuk diminta revisi." },
          409
        );
      }

      if (str(latest.status) === "submitted") {
        await databases.updateDocument(
          env.databaseId,
          env.deliverablesCollectionId,
          latest.$id,
          { status: "revision_requested" }
        );
      }
      await databases.updateDocument(
        env.databaseId,
        env.ordersCollectionId,
        order.$id,
        {
          status: "revision",
          review_deadline_at: null,
          reminder_sent_at: null,
        }
      );

      log(`Revision ${revision.$id} requested for order ${order.$id} by UMKM ${callerId}`);
      return json(res, mapRevision(revision));
    } catch (err) {
      error(err?.stack || err?.message || String(err));
      return json(res, { error: "Internal server error" }, 500);
    }
  };
}

export default createRequestRatecardRevisionHandler();

function validateInput(input) {
  if (!input || typeof input !== "object") return "Data revisi tidak valid.";
  const orderId = str(input.orderId).trim();
  const message = str(input.message);
  if (!APPWRITE_ID.test(orderId)) return "Order tidak valid.";
  if (!message.trim()) return "Alasan revisi wajib diisi.";
  if (message.length > MAX_MESSAGE_LENGTH) {
    return `Alasan revisi maksimal ${MAX_MESSAGE_LENGTH} karakter.`;
  }
  return null;
}

async function getUser(databases, env, userId) {
  const result = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

async function getDocumentOrNull(databases, databaseId, collectionId, documentId) {
  try {
    return await databases.getDocument(databaseId, collectionId, documentId);
  } catch (err) {
    if (err?.code === 404) return null;
    throw err;
  }
}

async function findLatestDeliverable(databases, env, orderId) {
  const result = await databases.listDocuments(env.databaseId, env.deliverablesCollectionId, [
    Query.equal("orderId", orderId),
    Query.orderDesc("version"),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

async function resolveRevisionLimit(databases, env, order) {
  const storedLimit = nonNegativeInteger(order.revision_limit);
  if (storedLimit !== null && storedLimit > 0) return storedLimit;

  const collectionId = str(order.offerId)
    ? env.offersCollectionId
    : str(order.packageId)
      ? env.packagesCollectionId
      : "";
  const sourceId = str(order.offerId) || str(order.packageId);
  if (collectionId && sourceId) {
    try {
      const source = await getDocumentOrNull(databases, env.databaseId, collectionId, sourceId);
      const sourceLimit = nonNegativeInteger(source?.revisionLimit);
      if (sourceLimit !== null) return sourceLimit;
    } catch {
      // Missing source provenance should not block an otherwise valid order.
    }
  }

  return storedLimit !== null && storedLimit > 0 ? storedLimit : DEFAULT_REVISION_LIMIT;
}

function revisionPermissions(umkmId, creatorId) {
  return [
    Permission.read(Role.user(umkmId)),
    Permission.read(Role.user(creatorId)),
  ];
}

export function revisionDocumentId(orderId, latestDeliverableId) {
  const digest = createHash("sha256").update(`${orderId}:${latestDeliverableId}`).digest("hex");
  return `rev${digest.slice(0, 29)}`;
}

function isMatchingRevision(revision, orderId, callerId) {
  return str(revision.orderId) === orderId && str(revision.requestedBy) === callerId;
}

function mapRevision(document) {
  return {
    id: str(document.$id),
    orderId: str(document.orderId),
    requestedBy: str(document.requestedBy),
    message: str(document.message),
    status: str(document.status) || "open",
    createdAt: str(document.$createdAt),
  };
}

function nonNegativeInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function getUserId(req) {
  return str(req.headers?.["x-appwrite-user-id"] || req.headers?.["X-Appwrite-User-Id"]);
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || "orders",
    deliverablesCollectionId: process.env.DELIVERABLES_COLLECTION_ID || "deliverables",
    revisionsCollectionId: process.env.REVISIONS_COLLECTION_ID || "revisions",
    offersCollectionId: process.env.OFFERS_COLLECTION_ID || "offers",
    packagesCollectionId: process.env.RATE_CARD_PACKAGES_COLLECTION_ID || "rate_card_packages",
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

function str(value) {
  return typeof value === "string" ? value : "";
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
