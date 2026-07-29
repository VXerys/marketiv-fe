import { Client, Databases, Query } from "node-appwrite";

/**
 * UMKM menyetujui atau menolak bukti kerja kreator (Alur A).
 *
 * ADA DI SISI SERVER KARENA TERPAKSA. Sprint 8 mencabut `update("users")` dari
 * `campaign_submissions` dan `campaign_claims` — benar, karena permission itu
 * berarti SIAPA PUN yang login bisa menulis status:"approved" ke submission
 * siapa pun, dan update itulah yang memicu `calculate-campaign-reward` menambah
 * saldo kreator. Penggantinya waktu itu adalah permission baris untuk UMKM yang
 * dipasang dari browser kreator — dan itu ditolak Appwrite, karena klien tidak
 * boleh memasang permission untuk user lain. Jadi jalur review putus di kedua
 * ujungnya sampai pekerjaan ini.
 *
 * Kepemilikan ditegakkan di sini, bukan dipercayakan ke permission: submission
 * tidak menyimpan umkmId, jadi pemiliknya dibaca dari campaign induknya.
 *
 * SENGAJA TIDAK mengembalikan kuota campaign saat submission ditolak. Itu tetap
 * dikerjakan klien lewat `decrementDocumentAttribute`, yang atomik dan memang
 * boleh dilakukan UMKM karena dia pemilik baris `campaigns`. node-appwrite 14
 * belum punya operasi itu, dan menggantinya dengan baca-ubah-tulis di sini
 * justru mengembalikan race yang baru saja ditutup commit 016811d.
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

    // Kepemilikan lewat campaign induk. Query, bukan get-lalu-bandingkan, supaya
    // campaign milik UMKM lain tidak pernah terbaca sekalipun id-nya ditebak.
    const parent = await databases.listDocuments(env.databaseId, env.campaignsCollectionId, [
      Query.equal("$id", str(submission.campaignId)),
      Query.equal("umkmId", userId),
      Query.limit(1),
    ]);
    // 404, bukan 403 — membedakan keduanya membocorkan submission milik UMKM lain.
    if (!parent.documents[0]) return json(res, { error: "Submission tidak ditemukan." }, 404);

    await databases.updateDocument(env.databaseId, env.submissionsCollectionId, submissionId, {
      status,
      views: status === "approved" ? views : Number(submission.views) || 0,
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

    log(`Submission ${submissionId} di-${status} oleh ${userId}`);
    return json(res, { success: true, campaignId: str(submission.campaignId), status });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

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
    campaignsCollectionId: process.env.CAMPAIGNS_COLLECTION_ID || "campaigns",
    submissionsCollectionId: process.env.CAMPAIGN_SUBMISSIONS_COLLECTION_ID || "campaign_submissions",
    claimsCollectionId: process.env.CAMPAIGN_CLAIMS_COLLECTION_ID || "campaign_claims",
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
