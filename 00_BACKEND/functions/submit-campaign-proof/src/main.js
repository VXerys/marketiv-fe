import { createHash } from "node:crypto";
import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

const VALID_PLATFORM = new Set(["tiktok", "instagram"]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const body = parseBody(req);
    const claimId = str(body.claimId);
    const campaignId = str(body.campaignId);
    const platform = str(body.platform).toLowerCase();
    const postUrl = str(body.postUrl).trim();
    const caption = typeof body.caption === "string" ? body.caption.trim().slice(0, 1000) : "";

    if (!claimId) return json(res, { error: "Claim tidak valid." }, 400);
    if (!campaignId) return json(res, { error: "Campaign tidak valid." }, 400);
    if (!VALID_PLATFORM.has(platform)) return json(res, { error: "Platform tidak valid." }, 400);
    if (!isValidProofUrl(postUrl, platform)) {
      return json(res, { error: "URL bukti tayang tidak valid untuk platform yang dipilih." }, 400);
    }

    const databases = createDatabasesClient(env);

    const userRes = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    const userDoc = userRes.documents[0] || null;
    if (userDoc?.status && userDoc.status !== "active") {
      return json(res, { error: "Akun Anda sedang tidak aktif." }, 403);
    }

    const claims = await databases.listDocuments(env.databaseId, env.claimsCollectionId, [
      Query.equal("$id", claimId),
      Query.equal("creatorId", userId),
      Query.equal("campaignId", campaignId),
      Query.limit(1),
    ]);
    const claim = claims.documents[0];
    if (!claim) return json(res, { error: "Pekerjaan tidak ditemukan." }, 404);

    if (str(claim.status) !== "claimed") {
      return json(res, { error: "Bukti untuk pekerjaan ini sudah pernah dikirim." }, 409);
    }

    const campaigns = await databases.listDocuments(env.databaseId, env.campaignsCollectionId, [
      Query.equal("$id", campaignId),
      Query.limit(1),
    ]);
    const campaign = campaigns.documents[0];
    if (!campaign) return json(res, { error: "Campaign tidak ditemukan." }, 404);
    const umkmId = str(campaign.umkmId);
    if (!umkmId) {
      return json(res, { error: "Campaign tidak punya pemilik yang valid." }, 500);
    }

    const existing = await databases.listDocuments(env.databaseId, env.submissionsCollectionId, [
      Query.equal("claimId", claimId),
      Query.limit(1),
    ]);
    if (existing.documents[0]) {
      return json(res, { error: "Bukti untuk pekerjaan ini sudah pernah dikirim." }, 409);
    }

    const created = await databases.createDocument(
      env.databaseId,
      env.submissionsCollectionId,
      ID.unique(),
      {
        claimId,
        campaignId,
        creatorId: userId,
        platform,
        postUrl,
        caption,
        views: 0,
        status: "pending",
      },
      [
        Permission.read(Role.user(userId)),
        Permission.read(Role.user(umkmId)),
      ]
    );

    await databases.updateDocument(env.databaseId, env.claimsCollectionId, claimId, {
      status: "submitted",
    });

    await notify(databases, env, {
      userId: umkmId,
      sourceId: created.$id,
      kind: "submission",
      title: "Bukti Kerja Baru",
      message: `Kreator mengirim bukti kerja untuk campaign "${str(campaign.title)}".`,
      type: "campaign",
    }, log);

    return json(res, {
      success: true,
      submissionId: str(created.$id),
      claimId,
      campaignId,
      status: "pending",
    });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId,
      env.notificationsCollectionId,
      deterministicNotificationId(payload.sourceId, payload.kind),
      {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))]
    );
  } catch (err) {
    if (err?.code === 409) return;
    log(`Notifikasi ${payload.kind} gagal untuk ${payload.userId}: ${err?.message || String(err)}`);
  }
}

function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

function isValidProofUrl(rawUrl, platform) {
  try {
    const url = new URL(rawUrl);
    if (!/^https?:$/.test(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (platform === "tiktok") return /(^|\.)tiktok\.com$/.test(host);
    if (platform === "instagram") return /(^|\.)instagram\.com$/.test(host);
    return false;
  } catch {
    return false;
  }
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
    usersCollectionId: process.env.USERS_COLLECTION_ID || "users",
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || "campaigns",
    claimsCollectionId: process.env.CAMPAIGN_CLAIMS_COLLECTION_ID || "campaign_claims",
    submissionsCollectionId: process.env.CAMPAIGN_SUBMISSIONS_COLLECTION_ID || "campaign_submissions",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
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
