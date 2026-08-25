import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

const DECISIONS = new Set(["valid", "invalid"]);
const ORDER_STATUSES = new Set(["in_progress", "revision"]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") return json(res, { error: "Method not allowed" }, 405);
    const env = getEnv(req);
    const reviewerId = userId(req);
    if (!reviewerId) return json(res, { error: "Unauthorized" }, 401);
    const input = parseBody(req);
    const deliverableId = str(input.deliverableId);
    const decision = str(input.decision);
    const notes = str(input.notes).trim().slice(0, 2000);
    if (!deliverableId || !DECISIONS.has(decision)) return json(res, { error: "Input review tidak valid." }, 400);
    if (decision === "invalid" && !notes) return json(res, { error: "Catatan wajib untuk keputusan invalid." }, 400);

    const databases = createDatabases(env);
    if (!await isActiveAdmin(databases, env, reviewerId)) return json(res, { error: "Akses Admin ditolak." }, 403);
    const deliverable = await getOr404(databases, env.deliverablesCollectionId, deliverableId, env);
    const order = await getOr404(databases, env.ordersCollectionId, str(deliverable.orderId), env);
    if (!isRateCardOrder(order)) return json(res, { error: "Deliverable bukan bagian dari Rate Card order." }, 409);
    if (!ORDER_STATUSES.has(str(order.status))) return json(res, { error: "Order tidak berada pada tahap review." }, 409);
    if (str(deliverable.status) !== "submitted") return json(res, { error: "Deliverable tidak menunggu validasi." }, 409);

    const latest = await latestDeliverable(databases, env, str(order.$id));
    if (!latest || str(latest.$id) !== deliverableId) return json(res, { error: "Deliverable bukan versi terbaru." }, 409);
    const existing = await validationForDeliverable(databases, env, deliverableId);
    if (existing) return json(res, { error: "Deliverable sudah memiliki keputusan final." }, 409);

    const reviewedAt = new Date().toISOString();
    const validation = {
      deliverableId, orderId: str(order.$id), deliverableVersion: int(deliverable.version),
      sourceSnapshot: str(deliverable.source), evidenceUrlSnapshot: str(deliverable.fileUrl),
      status: decision, reviewedBy: reviewerId, reviewedAt, ...(notes ? { reviewNotes: notes } : {}),
    };
    try {
      await databases.createDocument(env.databaseId, env.validationsCollectionId, ID.unique(), validation);
    } catch (err) {
      if (err?.code === 409) return json(res, { error: "Deliverable sudah memiliki keputusan final." }, 409);
      throw err;
    }
    await notify(databases, env, {
      sourceId: deliverableId, kind: `ratecard_validation_${decision}`, userId: str(order.creatorId),
      title: decision === "valid" ? "Deliverable Tervalidasi" : "Deliverable Perlu Diperbaiki",
      message: decision === "valid" ? "Admin Marketiv sudah memvalidasi deliverable. UMKM dapat melanjutkan persetujuan." : `Admin Marketiv meminta perbaikan: ${notes}`,
      type: "order",
    }, log);
    await notify(databases, env, {
      sourceId: deliverableId, kind: `ratecard_validation_${decision}_umkm`, userId: str(order.umkmId),
      title: decision === "valid" ? "Deliverable Siap Direview" : "Deliverable Tidak Valid",
      message: decision === "valid" ? "Admin Marketiv sudah memvalidasi deliverable. Kamu dapat menyetujuinya setelah memeriksa hasil kerja." : `Admin Marketiv menolak deliverable: ${notes}`,
      type: "order",
    }, log);
    log(`Rate card deliverable ${deliverableId} ${decision} by ${reviewerId}`);
    return json(res, { success: true, deliverableId, decision, reviewedAt });
  } catch (err) { if (err?.code === 404) return json(res, { error: "Deliverable atau order tidak ditemukan." }, 404); error(err?.stack || err?.message || String(err)); return json(res, { error: "Internal server error" }, 500); }
};

async function isActiveAdmin(databases, env, id) {
  try { const result = await databases.listDocuments(env.databaseId, env.usersCollectionId, [Query.equal("userId", id), Query.limit(1)]); const user = result.documents[0]; if (str(user?.role).toLowerCase() === "admin") return !user.status || str(user.status).toLowerCase() === "active"; } catch {}
  try { const { Users, Client: NodeClient } = await import("node-appwrite"); const auth = await new Users(new NodeClient().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey)).get(id); return auth.status !== false && (auth.labels?.some((label) => str(label).toLowerCase() === "admin") || str(auth.prefs?.role).toLowerCase() === "admin"); } catch { return false; }
}
async function getOr404(databases, collectionId, id, env) { try { return await databases.getDocument(env.databaseId, collectionId, id); } catch (err) { if (err?.code === 404) { const e = new Error("not_found"); e.code = 404; throw e; } throw err; } }
async function latestDeliverable(databases, env, orderId) { const r = await databases.listDocuments(env.databaseId, env.deliverablesCollectionId, [Query.equal("orderId", orderId), Query.orderDesc("version"), Query.limit(1)]); return r.documents[0] || null; }
async function validationForDeliverable(databases, env, deliverableId) { const r = await databases.listDocuments(env.databaseId, env.validationsCollectionId, [Query.equal("deliverableId", deliverableId), Query.limit(1)]); return r.documents[0] || null; }
async function notify(databases, env, p, log) { if (!p.userId) return; try { await databases.createDocument(env.databaseId, env.notificationsCollectionId, notificationId(p.sourceId, p.kind), { userId:p.userId,title:p.title,message:p.message,type:p.type,isRead:false,createdAt:new Date().toISOString() }, [Permission.read(Role.user(p.userId)), Permission.update(Role.user(p.userId))]); } catch (err) { if (err?.code !== 409) log(`Notification failed: ${err?.message || err}`); } }
function notificationId(sourceId, kind) { return `ntf${createHash("sha256").update(`${sourceId}:${kind}`).digest("hex").slice(0,29)}`; }
function getEnv(req) { const env={appwriteEndpoint:process.env.APPWRITE_FUNCTION_API_ENDPOINT||process.env.APPWRITE_ENDPOINT,appwriteProjectId:process.env.APPWRITE_FUNCTION_PROJECT_ID||process.env.APPWRITE_PROJECT_ID,appwriteApiKey:req.headers?.["x-appwrite-key"]||process.env.APPWRITE_API_KEY,databaseId:process.env.APPWRITE_DATABASE_ID||process.env.NEXT_PUBLIC_DB_ID,usersCollectionId:process.env.USERS_COLLECTION_ID||"users",ordersCollectionId:process.env.ORDERS_COLLECTION_ID||"orders",deliverablesCollectionId:process.env.DELIVERABLES_COLLECTION_ID||"deliverables",validationsCollectionId:process.env.RATECARD_DELIVERABLE_VALIDATIONS_COLLECTION_ID||"ratecard_deliverable_validations",notificationsCollectionId:process.env.NOTIFICATIONS_COLLECTION_ID||"notifications"}; const missing=Object.entries(env).filter(([,v])=>!v).map(([k])=>k); if(missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`); return env; }
function createDatabases(env) { return new Databases(new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey)); }
function userId(req) { return req.headers?.["x-appwrite-user-id"]||req.headers?.["X-Appwrite-User-Id"]; }
function parseBody(req) { try { return req.bodyJson&&typeof req.bodyJson==="object"?req.bodyJson:JSON.parse(req.bodyText||req.body||"{}"); } catch { return {}; } }
function str(value) { return typeof value === "string" ? value : ""; } function int(value) { return Number.isInteger(value) ? value : 0; }
function isRateCardOrder(order) { return Boolean(str(order?.offerId) || str(order?.packageId)); }
function json(res, body, status=200) { return res.json(body,status,{"content-type":"application/json"}); }
