import { Client, Databases, Query } from "node-appwrite";

const LIMIT = 100;
export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST" && req.method !== "GET") return json(res, { error: "Method not allowed" }, 405);
    const env = getEnv(req); const id = userId(req); if (!id) return json(res, { error: "Unauthorized" }, 401);
    const databases = createDatabases(env); if (!await isActiveAdmin(databases, env, id)) return json(res, { error: "Akses Admin ditolak." }, 403);
    const deliverables = await databases.listDocuments(env.databaseId, env.deliverablesCollectionId, [Query.equal("status", "submitted"), Query.orderDesc("$createdAt"), Query.limit(LIMIT)]);
    const candidates = [];
    for (const deliverable of deliverables.documents) {
      const validations = await databases.listDocuments(env.databaseId, env.validationsCollectionId, [Query.equal("deliverableId", deliverable.$id), Query.limit(1)]);
      if (validations.documents[0]) continue;
      let order; try { order = await databases.getDocument(env.databaseId, env.ordersCollectionId, deliverable.orderId); } catch { continue; }
      if (!["in_progress", "revision"].includes(String(order.status))) continue;
      const latest = await databases.listDocuments(env.databaseId, env.deliverablesCollectionId, [Query.equal("orderId", deliverable.orderId), Query.orderDesc("version"), Query.limit(1)]);
      if (latest.documents[0]?.$id !== deliverable.$id) continue;
      candidates.push({ deliverable, order });
    }
    const creatorIds = unique(candidates.map(({ order }) => str(order.creatorId)));
    const umkmIds = unique(candidates.map(({ order }) => str(order.umkmId)));
    const [creators, umkms] = await Promise.all([
      creatorIds.length ? databases.listDocuments(env.databaseId, env.creatorProfilesCollectionId, [Query.equal("userId", creatorIds), Query.limit(LIMIT)]) : { documents: [] },
      umkmIds.length ? databases.listDocuments(env.databaseId, env.umkmProfilesCollectionId, [Query.equal("userId", umkmIds), Query.limit(LIMIT)]) : { documents: [] },
    ]);
    const creatorById = new Map(creators.documents.map((item) => [str(item.userId), item]));
    const umkmById = new Map(umkms.documents.map((item) => [str(item.userId), item]));
    const items = candidates.map(({ deliverable, order }) => {
      const creator = creatorById.get(str(order.creatorId)); const umkm = umkmById.get(str(order.umkmId));
      return { id: deliverable.$id, orderId: order.$id, version: Number(deliverable.version) || 0, source: str(deliverable.source), evidenceUrl: str(deliverable.fileUrl), notes: str(deliverable.notes) || undefined, submittedAt: str(deliverable.$createdAt) || str(deliverable.createdAt), status: "pending", isLatest: true, creator: { id: str(order.creatorId), name: str(creator?.displayName) || "Content Creator" }, umkm: { id: str(order.umkmId), businessName: str(umkm?.businessName) || str(umkm?.brandName) || "UMKM" }, projectTitle: str(order.packageNameSnapshot) || "Rate Card Order", finalAmount: Number(order.amount) || 0 };
    });
    return json(res, { items, total: items.length });
  } catch (err) { error(err?.stack || err?.message || String(err)); return json(res, { error: "Internal server error" }, 500); }
};
async function isActiveAdmin(databases, env, id) { try { const r=await databases.listDocuments(env.databaseId,env.usersCollectionId,[Query.equal("userId",id),Query.limit(1)]); const u=r.documents[0]; if(str(u?.role).toLowerCase()==="admin") return !u.status||str(u.status).toLowerCase()==="active"; } catch {} try { const {Users,Client:NodeClient}=await import("node-appwrite"); const u=await new Users(new NodeClient().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey)).get(id); return u.status!==false&&(u.labels?.some((x)=>str(x).toLowerCase()==="admin")||str(u.prefs?.role).toLowerCase()==="admin"); } catch{return false;} }
function getEnv(req) { const env={appwriteEndpoint:process.env.APPWRITE_FUNCTION_API_ENDPOINT||process.env.APPWRITE_ENDPOINT,appwriteProjectId:process.env.APPWRITE_FUNCTION_PROJECT_ID||process.env.APPWRITE_PROJECT_ID,appwriteApiKey:req.headers?.["x-appwrite-key"]||process.env.APPWRITE_API_KEY,databaseId:process.env.APPWRITE_DATABASE_ID||process.env.NEXT_PUBLIC_DB_ID,usersCollectionId:process.env.USERS_COLLECTION_ID||"users",ordersCollectionId:process.env.ORDERS_COLLECTION_ID||"orders",deliverablesCollectionId:process.env.DELIVERABLES_COLLECTION_ID||"deliverables",validationsCollectionId:process.env.RATECARD_DELIVERABLE_VALIDATIONS_COLLECTION_ID||"ratecard_deliverable_validations",creatorProfilesCollectionId:process.env.CREATOR_PROFILES_COLLECTION_ID||"creator_profiles",umkmProfilesCollectionId:process.env.UMKM_PROFILES_COLLECTION_ID||"umkm_profiles"}; const m=Object.entries(env).filter(([,v])=>!v).map(([k])=>k);if(m.length)throw new Error(`Missing required environment variables: ${m.join(", ")}`);return env; }
function createDatabases(env){return new Databases(new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey));} function userId(req){return req.headers?.["x-appwrite-user-id"]||req.headers?.["X-Appwrite-User-Id"];} function str(v){return typeof v==="string"?v:"";} function json(res,b,s=200){return res.json(b,s,{"content-type":"application/json"});}
function unique(values) { return [...new Set(values.filter(Boolean))].slice(0, LIMIT); }
