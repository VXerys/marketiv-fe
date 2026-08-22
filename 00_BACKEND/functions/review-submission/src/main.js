import { createHash } from "node:crypto";
import { Client, Databases, Permission, Query, Role } from "node-appwrite";
import { decrementColumn } from "./atomic.js";
import {
  VIEW_VALIDATION_DELAY_HOURS,
  getViewValidationEligibility,
} from "./observation-window.js";

/**
 * Admin Marketiv menyetujui atau menolak bukti kerja kreator (Alur A).
 */

const VALID_STATUS = new Set(["approved", "rejected"]);

export default async ({ req, res, log, error }) => {
  try {
    if (req.method && req.method !== "POST") {
      return json(res, { error: "Method not allowed" }, 405);
    }

    const env = getEnv(req);
    const userId = getUserId(req);
    if (!userId) return json(res, { error: "Unauthorized" }, 401);

    const body = parseBody(req);
    const submissionId = str(body.submissionId);
    const status = str(body.status);
    const views = body.views;
    const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : undefined;

    if (!submissionId) return json(res, { error: "Submission tidak valid." }, 400);
    if (!VALID_STATUS.has(status)) return json(res, { error: "Status review tidak valid." }, 400);
    if (status === "approved" && (!Number.isInteger(views) || views < 0)) {
      return json(res, { error: "Jumlah views tidak valid." }, 400);
    }

    const databases = createDatabasesClient(env);

    let submission;
    try {
      submission = await databases.getDocument(env.databaseId, env.submissionsCollectionId, submissionId);
    } catch (err) {
      if (err?.code === 404) return json(res, { error: "Submission tidak ditemukan." }, 404);
      throw err;
    }

    if (str(submission.status) !== "pending") {
      return json(res, { error: "Submission ini sudah pernah direview." }, 409);
    }

    let isAdmin = false;
    try {
      const userRes = await databases.listDocuments(env.databaseId, env.usersCollectionId, [
        Query.equal("userId", userId),
        Query.limit(1)
      ]);
      const userDoc = userRes.documents[0] || null;
      if (userDoc?.role && userDoc.role.toLowerCase() === "admin") {
        const userStatus = userDoc.status ? userDoc.status.toLowerCase() : "active";
        if (userStatus !== "active") {
          return json(res, { error: "Akun Anda sedang tidak aktif." }, 403);
        }
        isAdmin = true;
      }
    } catch {
      // database lookup skipped
    }

    if (!isAdmin) {
      try {
        const { Users, Client: NodeClient } = await import("node-appwrite");
        const client = new NodeClient()
          .setEndpoint(env.appwriteEndpoint)
          .setProject(env.appwriteProjectId)
          .setKey(env.appwriteApiKey);
        const usersClient = new Users(client);
        const authUser = await usersClient.get(userId);
        if (authUser) {
          if (authUser.status === false) {
            return json(res, { error: "Akun Anda sedang tidak aktif." }, 403);
          }
          const hasLabel = Array.isArray(authUser.labels) && authUser.labels.some((l) => typeof l === "string" && l.toLowerCase() === "admin");
          const hasPref = typeof authUser.prefs?.role === "string" && authUser.prefs.role.toLowerCase() === "admin";
          if (hasLabel || hasPref) {
            isAdmin = true;
          }
        }
      } catch {
        // auth user lookup skipped
      }
    }

    if (!isAdmin) {
      log(`Review ditolak untuk ${userId}: bukan admin`);
      return json(res, { error: "Akses ditolak: Hanya Admin Marketiv yang dapat memvalidasi submission." }, 403);
    }

    if (status === "approved") {
      const eligibility = getViewValidationEligibility(submission);
      if (!eligibility.eligibleAt) {
        return json(res, {
          error: "Views tidak dapat difinalisasi karena waktu submission tidak valid.",
        }, 409);
      }
      if (!eligibility.isEligible) {
        return json(res, {
          error: `Views belum dapat difinalisasi. Periode observasi ${VIEW_VALIDATION_DELAY_HOURS} jam belum selesai.`,
          eligibleAt: eligibility.eligibleAt,
        }, 409);
      }
    }

    const parent = await databases.listDocuments(env.databaseId, env.campaignsCollectionId, [
      Query.equal("$id", str(submission.campaignId)),
      Query.limit(1),
    ]);
    if (!parent.documents[0]) return json(res, { error: "Submission tidak ditemukan." }, 404);

    await databases.updateDocument(env.databaseId, env.submissionsCollectionId, submissionId, {
      status,
      views: status === "approved" ? views : Number(submission.views) || 0,
      ...(status === "approved" ? {
        views_count: views,
        views_captured_at: new Date().toISOString(),
        views_source: "manual_admin",
        views_final: true
      } : {}),
      ...(notes ? { reviewNotes: notes } : {}),
    });

    // Status claim mengikuti hasil review supaya layar kreator tidak terus
    // menampilkan "menunggu review" setelah keputusan keluar. Kegagalannya tidak
    // membatalkan review — submission adalah sumber kebenaran, claim menyusul.
    const claimId = str(submission.claimId);
    if (claimId) {
      try {
        await databases.updateDocument(env.databaseId, env.claimsCollectionId, claimId, { status });
      } catch (err) {
        log(`Claim ${claimId} gagal diselaraskan: ${err?.message || String(err)}`);
      }
    }

    if (status === "rejected") {
      try {
        await decrementColumn(env, env.campaignsCollectionId, str(submission.campaignId), "totalClaims", 1, 0);
        log(`Quota restored (totalClaims decremented) for campaign ${submission.campaignId}`);
      } catch (decErr) {
        log(`Decrement totalClaims gagal untuk campaign ${submission.campaignId}: ${decErr?.message}`);
      }

      await notify(databases, env, {
        sourceId: submissionId,
        kind: "submission_rejected",
        userId: str(submission.creatorId),
        title: "Bukti Kerja Ditolak",
        message: notes
          ? `Bukti kerja Anda ditolak: ${notes}`
          : "Bukti kerja Anda ditolak oleh Marketiv. Periksa catatan review.",
        type: "campaign",
      }, log);
    }

    if (status === "approved") {
      log(`Views captured: source=manual_admin, views=${views}, submission=${submissionId}`);
    }
    log(`Submission ${submissionId} di-${status} oleh ${userId}`);
    return json(res, { success: true, campaignId: str(submission.campaignId), status });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId, env.notificationsCollectionId,
      deterministicNotificationId(payload.sourceId, payload.kind),
      { userId: payload.userId, title: payload.title, message: payload.message,
        type: payload.type, isRead: false, createdAt: new Date().toISOString() },
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
    submissionsCollectionId: process.env.CAMPAIGN_SUBMISSIONS_COLLECTION_ID || "campaign_submissions",
    claimsCollectionId: process.env.CAMPAIGN_CLAIMS_COLLECTION_ID || "campaign_claims",
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
