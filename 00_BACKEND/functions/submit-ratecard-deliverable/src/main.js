import { createHash } from "node:crypto";
import { Client, Databases, Permission, Query, Role } from "node-appwrite";

const ORDER_STATUSES = new Set(["in_progress", "revision"]);
const SOURCES = new Set(["external_url", "storage"]);
const APPWRITE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/;
const MAX_FILE_URL = 2048;
const MAX_NOTES = 2000;

/**
 * Create Rate Card deliverable through trusted server credentials.
 *
 * Browser callers cannot assign row permissions to another user. Function
 * therefore derives both participants from order, then creates row using
 * dynamic API key. Creator receives READ only; order UMKM receives READ and
 * UPDATE because approval is UMKM-owned and can trigger escrow release.
 */
export function createSubmitRatecardDeliverableHandler(dependencies = {}) {
  const createDatabases = dependencies.createDatabases || createDatabasesClient;
  const createId = dependencies.createId || deliverableDocumentId;
  const getEnvironment = dependencies.getEnvironment || getEnv;
  const now = dependencies.now || (() => new Date());

  return async ({ req, res, log, error }) => {
    try {
      if (str(req.method).toUpperCase() !== "POST") {
        return json(res, { error: "Method not allowed" }, 405);
      }

      const callerId = getUserId(req);
      if (!callerId) return json(res, { error: "Unauthorized" }, 401);

      const input = parseBody(req);
      const orderId = str(input.orderId);
      if (!APPWRITE_ID.test(orderId)) {
        return json(res, { error: "Order tidak valid." }, 400);
      }

      const env = getEnvironment(req);
      const databases = createDatabases(env);
      const order = await getDocumentOrNull(
        databases,
        env.databaseId,
        env.ordersCollectionId,
        orderId
      );
      if (!order) return json(res, { error: "Pesanan tidak ditemukan." }, 404);

      const creatorId = str(order.creatorId);
      const umkmId = str(order.umkmId);
      if (callerId !== creatorId) {
        return json(
          res,
          { error: "Hanya kreator pengerja yang dapat mengirim deliverable." },
          403
        );
      }
      if (!APPWRITE_ID.test(creatorId) || !APPWRITE_ID.test(umkmId)) {
        throw new Error(`Order ${orderId} tidak memiliki participant ID yang valid.`);
      }
      if (!ORDER_STATUSES.has(str(order.status))) {
        return json(
          res,
          { error: "Deliverable hanya bisa dikirim saat pesanan sedang dikerjakan atau direvisi." },
          409
        );
      }

      const invalid = validateInput(input);
      if (invalid) return json(res, { error: invalid }, 400);

      const source = str(input.source);
      const fileUrl = str(input.fileUrl);
      const fileId = str(input.fileId);
      const notes = typeof input.notes === "string" ? input.notes : "";

      if (source === "storage") {
        const file = await getDocumentOrNull(
          databases,
          env.databaseId,
          env.userFilesCollectionId,
          fileId
        );
        if (!file) return json(res, { error: "Berkas tidak ditemukan." }, 404);
        if (str(file.userId) !== callerId) {
          return json(res, { error: "Berkas harus milik kreator yang sedang login." }, 403);
        }
        if (str(file.status) !== "active") {
          return json(res, { error: "Berkas sudah tidak aktif." }, 409);
        }
        const umkmReadPermission = Permission.read(Role.user(umkmId));
        if (!Array.isArray(file.$permissions) || !file.$permissions.includes(umkmReadPermission)) {
          return json(
            res,
            { error: "Berkas belum dibagikan kepada UMKM pemilik pesanan." },
            409
          );
        }
      }

      const latest = await databases.listDocuments(
        env.databaseId,
        env.deliverablesCollectionId,
        [Query.equal("orderId", orderId), Query.orderDesc("version"), Query.limit(1)]
      );
      const latestVersion = normalizeVersion(latest.documents[0]?.version);
      if (latest.documents[0] && latestVersion === null) {
        return json(res, { error: "Versi deliverable terakhir tidak valid." }, 409);
      }

      const version = (latestVersion ?? 0) + 1;
      const createdAt = now().toISOString();
      let created;
      try {
        created = await databases.createDocument(
          env.databaseId,
          env.deliverablesCollectionId,
          createId(orderId, version),
          {
            orderId,
            source,
            fileUrl,
            fileId: source === "storage" ? fileId : null,
            notes: notes || null,
            version,
            status: "submitted",
            createdAt,
          },
          deliverablePermissions(creatorId, umkmId)
        );
      } catch (err) {
        if (err?.code === 400 || err?.code === 409) {
          return json(
            res,
            { error: err.code === 409 ? "Versi deliverable baru berkonflik. Muat ulang lalu coba lagi." : "Data deliverable tidak valid." },
            err.code
          );
        }
        throw err;
      }

      log(`Deliverable ${created.$id} versi ${version} dibuat untuk order ${orderId}.`);
      return json(res, mapDeliverable(created));
    } catch (err) {
      error(err?.stack || err?.message || String(err));
      return json(res, { error: "Internal server error" }, 500);
    }
  };
}

export default createSubmitRatecardDeliverableHandler();

function validateInput(input) {
  const source = str(input.source);
  const fileUrl = str(input.fileUrl);
  const fileId = str(input.fileId);

  if (!SOURCES.has(source)) return "Sumber deliverable tidak valid.";
  if (!fileUrl) return "Link deliverable wajib diisi.";
  if (fileUrl.length > MAX_FILE_URL) {
    return `Link deliverable maksimal ${MAX_FILE_URL} karakter.`;
  }
  try {
    const url = new URL(fileUrl);
    if (url.protocol !== "https:") {
      return "Link harus diawali https:// — http biasa tidak diterima.";
    }
  } catch {
    return "Format link tidak valid.";
  }
  if (input.notes !== undefined && typeof input.notes !== "string") {
    return "Catatan tidak valid.";
  }
  if (typeof input.notes === "string" && input.notes.length > MAX_NOTES) {
    return `Catatan maksimal ${MAX_NOTES} karakter.`;
  }

  if (source === "storage") {
    if (!APPWRITE_ID.test(fileId)) return "Berkas belum terunggah.";
    return null;
  }
  return null;
}

/** Same order version maps to same ID, so parallel creates conflict instead of duplicating version. */
export function deliverableDocumentId(orderId, version) {
  const digest = createHash("sha256").update(`${orderId}:${version}`).digest("hex");
  return `dlv${digest.slice(0, 29)}`;
}

function deliverablePermissions(creatorId, umkmId) {
  return [
    Permission.read(Role.user(creatorId)),
    Permission.read(Role.user(umkmId)),
    Permission.update(Role.user(umkmId)),
  ];
}

async function getDocumentOrNull(databases, databaseId, collectionId, documentId) {
  try {
    return await databases.getDocument(databaseId, collectionId, documentId);
  } catch (err) {
    if (err?.code === 404) return null;
    throw err;
  }
}

function normalizeVersion(value) {
  if (value === undefined) return 0;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function mapDeliverable(document) {
  const dto = {
    id: str(document.$id),
    orderId: str(document.orderId),
    source: str(document.source) || "external_url",
    fileUrl: str(document.fileUrl),
    version: normalizeVersion(document.version) ?? 0,
    status: str(document.status) || "submitted",
    createdAt: str(document.createdAt) || str(document.$createdAt),
  };
  const fileId = str(document.fileId);
  const notes = str(document.notes);
  if (fileId) dto.fileId = fileId;
  if (notes) dto.notes = notes;
  return dto;
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
    ordersCollectionId:
      process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    deliverablesCollectionId: process.env.DELIVERABLES_COLLECTION_ID || "deliverables",
    userFilesCollectionId: process.env.USER_FILES_COLLECTION_ID || "user_files",
  };
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
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
