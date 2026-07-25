import { Query } from "appwrite";
import { databases } from "@/lib/appwrite/databases";
import { appwriteConfig } from "@/lib/appwrite/config";
import {
  executeFunction,
  FunctionExecutionError,
  FUNCTION_IDS,
} from "@/lib/appwrite/functions";
import { getSession } from "@/services/auth/session.service";
import {
  ServiceResult,
  ServiceErrorCode,
  CreatorProfile,
  CreatorMetric,
  CreatorJob,
  CreatorJobMaterial,
  CreatorPortfolioItem,
  CreatorActiveWork,
  CreatorSubmission,
  CreatorNegotiation,
  CreatorRateCardPackage,
  CreatorTransaction,
  CreatorActivity,
  CreatorActivityType,
  CreatorNiche,
  CampaignStatus,
  ClaimStatus,
  SubmissionStatus,
  FraudStatus,
  RateCardStatus,
  TransactionType,
  TransactionStatus,
} from "@/types/creator-dashboard";

/**
 * Lapisan Appwrite dashboard Kreator (s2-appwrite-read).
 *
 * Sumber kebenaran skema: 00_BACKEND/appwrite.config.json (tables camelCase,
 * KECUALI `conversations` & `messages` yang snake_case).
 * Pola sama dengan src/services/umkm/umkm-appwrite.service.ts:
 * getSession() untuk kepemilikan → databases.listDocuments → mapper $id→id.
 *
 * Tiga jenis baca WAJIB lewat Function DTO, bukan query klien:
 * - Profil ....... join creator_profiles + creator_social_accounts + akun Auth.
 * - Metrik ....... agregasi 7 collection; `escrows` & `wallets` tak boleh
 *                  dijumlahkan di klien (08-frontend-data-contract.md §9, §26).
 * - Negosiasi .... join 6 collection, salah satunya `escrows` yang $permissions-nya
 *                  kosong + rowSecurity → tidak terbaca dari browser sama sekali.
 *
 * CATATAN JUJUR (belum bisa runtime-test — NEXT_PUBLIC_USE_MOCK_DATA=true):
 * - `CreatorActiveWork.earnings` & `CreatorSubmission.earnings` dibiarkan kosong.
 *   Rumusnya views/1000 × rewardPer1000Views adalah perhitungan uang, dan §26
 *   melarang klien menghitungnya. Nilai sebenarnya ada di `transactions` sebagai
 *   baris `release` — perlu Function tersendiri bila UI benar-benar butuh angka
 *   per-submission.
 * - `CreatorJob.targetViews`, `productDescription`, `targetAudience`,
 *   `thumbnailUrl` dan `CreatorActiveWork.rejectedReason` tidak punya kolom
 *   sumber; dibiarkan undefined, bukan diisi tebakan.
 * - `CreatorActivity` berasal dari `notifications`, yang baru terbaca setelah
 *   perbaikan permission baris di 4 Function penulis notifikasi dideploy.
 */

const DB = appwriteConfig.databaseId;

const COLLECTIONS = {
  campaigns: "campaigns",
  campaignBriefs: "campaign_briefs",
  campaignAssets: "campaign_assets",
  claims: "campaign_claims",
  submissions: "campaign_submissions",
  rateCards: "rate_cards",
  rateCardPackages: "rate_card_packages",
  creatorPortfolios: "creator_portfolios",
  umkmProfiles: "umkm_profiles",
  transactions: "transactions",
  notifications: "notifications",
} as const;

const PAGE_LIMIT = 100;

/** Harus sinkron dengan CreatorNiche. */
const NICHES = new Set<CreatorNiche>([
  "kuliner",
  "fashion",
  "pariwisata",
  "edukasi",
  "kecantikan",
  "lainnya",
]);

// ── helpers ──────────────────────────────────────────────────────────────────

type Doc = Record<string, unknown>;

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const num = (v: unknown): number => (typeof v === "number" ? v : 0);
const orUndefined = (v: string): string | undefined => v || undefined;

const mapErrorCode = (err: unknown): ServiceErrorCode => {
  // Function DTO sudah memetakan sendiri HTTP status → ServiceErrorCode.
  if (err instanceof FunctionExecutionError) return err.code;

  const code = (err as { code?: number })?.code;
  if (code === 401) return "auth";
  if (code === 403) return "forbidden";
  if (code === 404) return "not_found";
  if (typeof code === "number" && code >= 500) return "server";
  return "unknown";
};

const failFromError = <T>(err: unknown, empty: T): ServiceResult<T> => ({
  success: false,
  data: empty,
  error: "Gagal memuat data. Coba lagi.",
  code: mapErrorCode(err),
});

/** Ambil userId sesi aktif, atau ServiceResult error yang siap dikembalikan. */
async function requireUserId<T>(
  empty: T
): Promise<{ ok: true; userId: string } | { ok: false; result: ServiceResult<T> }> {
  const session = await getSession();
  if (!session.success || !session.data) {
    return {
      ok: false,
      result: {
        success: false,
        data: empty,
        error: session.error ?? "Sesi tidak ditemukan. Silakan login.",
        code: session.code ?? "auth",
      },
    };
  }
  return { ok: true, userId: session.data.userId };
}

const normalizeNiche = (v: unknown): CreatorNiche => {
  const niche = str(v).toLowerCase() as CreatorNiche;
  return NICHES.has(niche) ? niche : "lainnya";
};

/** `campaign_submissions.platform` & `deliverables` hanya mengenal dua platform. */
const asPlatform = (v: unknown): "tiktok" | "instagram" =>
  str(v) === "instagram" ? "instagram" : "tiktok";

/** Deadline submission = tanggal klaim + campaigns.submissionDays. */
function submissionDeadline(claimedAt: string, submissionDays: number): string {
  const claimed = new Date(claimedAt);
  if (Number.isNaN(claimed.getTime()) || submissionDays <= 0) return "";
  claimed.setDate(claimed.getDate() + submissionDays);
  return claimed.toISOString();
}

/** Query.equal dengan array dibatasi 100 nilai. */
async function listByIds(collectionId: string, field: string, ids: string[], extra: string[] = []) {
  if (ids.length === 0) return [];
  const res = await databases.listDocuments(DB, collectionId, [
    ...extra,
    Query.equal(field, ids.slice(0, PAGE_LIMIT)),
    Query.limit(PAGE_LIMIT),
  ]);
  return res.documents as unknown as Doc[];
}

/** Peta userId UMKM → profil, untuk brandName & brandAvatar. */
async function loadUmkmProfiles(umkmIds: string[]): Promise<Map<string, Doc>> {
  const unique = Array.from(new Set(umkmIds.filter(Boolean)));
  const profiles = await listByIds(COLLECTIONS.umkmProfiles, "userId", unique);
  return new Map(profiles.map((p) => [str(p.userId), p]));
}

// ── mappers ──────────────────────────────────────────────────────────────────

/** `campaigns.platforms` adalah kolom array; nilai non-array diabaikan. */
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((i): i is string => typeof i === "string" && i.length > 0) : [];

/** Nama tampilan materi: fileName, atau host URL bila UMKM tidak mengisinya. */
function materialLabel(d: Doc): string {
  const name = str(d.fileName);
  if (name) return name;
  const url = str(d.fileUrl);
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const mapMaterial = (d: Doc): CreatorJobMaterial => ({
  id: str(d.$id),
  label: materialLabel(d),
  url: str(d.fileUrl),
  kind: str(d.type) === "link" ? "link" : "file",
});

const mapJob = (d: Doc, umkm?: Doc): CreatorJob => ({
  id: str(d.$id),
  title: str(d.title),
  brandName: str(umkm?.businessName),
  brandAvatar: str(umkm?.logoUrl),
  brief: str(d.description),
  niche: normalizeNiche(d.category),
  quota: num(d.claimLimit),
  usedQuota: num(d.totalClaims),
  ratePerThousandViews: num(d.rewardPer1000Views),
  status: str(d.status) as CampaignStatus,
  totalBudget: num(d.budget),
  createdAt: str(d.$createdAt),
  platforms: strList(d.platforms),
});

const mapSubmission = (d: Doc): CreatorSubmission => ({
  id: str(d.$id),
  campaignId: str(d.campaignId),
  claimId: str(d.claimId),
  platform: asPlatform(d.platform),
  contentUrl: str(d.postUrl),
  actualViews: num(d.views),
  status: str(d.status) as SubmissionStatus,
  // fraudStatus adalah kolom TERPISAH — jangan digabung ke status.
  fraudStatus: orUndefined(str(d.fraudStatus)) as FraudStatus | undefined,
  submittedAt: str(d.$createdAt),
  validatedAt: str(d.status) === "pending" ? undefined : str(d.$updatedAt),
  // Tidak ada kolom earnings; nilainya hanya ada di ledger `transactions`.
  earnings: 0,
});

/**
 * `notifications.type` yang punya padanan visual dipetakan; sisanya diteruskan
 * apa adanya dan ditampilkan UI sebagai "INFO".
 */
const ACTIVITY_TYPE_ALIAS: Record<string, CreatorActivityType> = {
  reward: "payout",
  chat_message: "negotiation_new",
};

const mapActivity = (d: Doc): CreatorActivity => {
  const raw = str(d.type);
  return {
    id: str(d.$id),
    type: ACTIVITY_TYPE_ALIAS[raw] ?? (raw as CreatorActivityType),
    title: str(d.title),
    description: str(d.message),
    // `notifications` tidak menyimpan nominal — pesannya sudah memuat angka.
    createdAt: str(d.createdAt) || str(d.$createdAt),
  };
};

/** referenceType menentukan asal uang; dipakai untuk label sumber di UI. */
const TRANSACTION_SOURCE: Record<string, CreatorTransaction["source"]> = {
  campaign_submission: "Campaign",
  escrow: "Rate Card",
  withdrawal: "Withdrawal",
};

const TRANSACTION_DESCRIPTION: Record<string, string> = {
  campaign_submission: "Reward campaign",
  escrow: "Pencairan escrow rate card",
  withdrawal: "Penarikan saldo",
};

const mapTransaction = (d: Doc): CreatorTransaction => {
  const referenceType = str(d.referenceType);
  return {
    id: str(d.$id),
    type: str(d.type) as TransactionType,
    amount: num(d.amount),
    status: str(d.status) as TransactionStatus,
    description: TRANSACTION_DESCRIPTION[referenceType] ?? str(d.type),
    // `transactions` tidak punya kolom tanggal sendiri.
    createdAt: str(d.$createdAt),
    referenceId: orUndefined(str(d.referenceId)),
    source: TRANSACTION_SOURCE[referenceType],
  };
};

// ── READS via Function DTO ───────────────────────────────────────────────────
//
// Function menegakkan kepemilikan sendiri lewat header `x-appwrite-user-id`
// (sesi aktif), jadi userId TIDAK pernah dikirim dari klien — tidak bisa dipalsukan.

/** Join creator_profiles + creator_social_accounts + akun Auth. */
export async function getCreatorProfileFromAppwrite(): Promise<ServiceResult<CreatorProfile>> {
  try {
    const data = await executeFunction<CreatorProfile>(FUNCTION_IDS.creatorProfile);
    return { success: true, data };
  } catch (err) {
    return failFromError<CreatorProfile>(err, null as unknown as CreatorProfile);
  }
}

/** Agregasi campaigns + claims + submissions + orders + escrows + wallets. */
export async function getCreatorMetricsFromAppwrite(): Promise<ServiceResult<CreatorMetric>> {
  try {
    const data = await executeFunction<CreatorMetric>(FUNCTION_IDS.creatorDashboardSummary);
    return { success: true, data };
  } catch (err) {
    return failFromError<CreatorMetric>(err, null as unknown as CreatorMetric);
  }
}

/** Join orders + offers + escrows + conversations + messages + umkm_profiles. */
export async function getCreatorNegotiationsFromAppwrite(): Promise<ServiceResult<CreatorNegotiation[]>> {
  try {
    const data = await executeFunction<CreatorNegotiation[]>(FUNCTION_IDS.creatorNegotiations);
    return { success: true, data };
  } catch (err) {
    return failFromError<CreatorNegotiation[]>(err, []);
  }
}

export async function getCreatorNegotiationByIdFromAppwrite(
  id: string
): Promise<ServiceResult<CreatorNegotiation>> {
  try {
    const data = await executeFunction<CreatorNegotiation>(FUNCTION_IDS.creatorNegotiations, {
      orderId: id,
    });
    return { success: true, data };
  } catch (err) {
    if (err instanceof FunctionExecutionError && err.code === "not_found") {
      return { success: false, data: null, error: "Negosiasi tidak ditemukan", code: "not_found" };
    }
    return failFromError<CreatorNegotiation>(err, null as unknown as CreatorNegotiation);
  }
}

// ── READS query langsung ─────────────────────────────────────────────────────

/**
 * Job Pool publik: semua campaign `active`, bukan hanya milik kreator ini.
 * `campaigns` punya read("any") sehingga tidak perlu Function.
 */
export async function getCreatorJobsFromAppwrite(): Promise<ServiceResult<CreatorJob[]>> {
  const auth = await requireUserId<CreatorJob[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.campaigns, [
      Query.equal("status", "active"),
      Query.orderDesc("$createdAt"),
      Query.limit(PAGE_LIMIT),
    ]);
    const docs = res.documents as unknown as Doc[];
    const umkmById = await loadUmkmProfiles(docs.map((d) => str(d.umkmId)));
    return { success: true, data: docs.map((d) => mapJob(d, umkmById.get(str(d.umkmId)))) };
  } catch (err) {
    return failFromError<CreatorJob[]>(err, []);
  }
}

/** Detail Job Pool: campaign + brief + aset. Ketiganya read("any"). */
export async function getCreatorJobByIdFromAppwrite(id: string): Promise<ServiceResult<CreatorJob>> {
  const auth = await requireUserId<CreatorJob>(null as unknown as CreatorJob);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.campaigns, [
      Query.equal("$id", id),
      Query.equal("status", "active"),
      Query.limit(1),
    ]);
    const doc = res.documents[0] as unknown as Doc | undefined;
    if (!doc) {
      return { success: false, data: null, error: "Job tidak ditemukan", code: "not_found" };
    }

    const [briefs, assets, umkmById] = await Promise.all([
      listByIds(COLLECTIONS.campaignBriefs, "campaignId", [id]),
      listByIds(COLLECTIONS.campaignAssets, "campaignId", [id]),
      loadUmkmProfiles([str(doc.umkmId)]),
    ]);

    const brief = briefs[0];
    const job: CreatorJob = {
      ...mapJob(doc, umkmById.get(str(doc.umkmId))),
      contentInstruction: orUndefined(str(brief?.briefDetail)),
      ctaInstruction: orUndefined(str(brief?.cta)),
      targetAudience: orUndefined(str(brief?.objective)),
      doAndDont: parseDoAndDont(brief?.doAndDont),
      externalAssetUrl: orUndefined(str(assets[0]?.fileUrl)),
      materials: assets.map(mapMaterial),
    };
    return { success: true, data: job };
  } catch (err) {
    return failFromError<CreatorJob>(err, null as unknown as CreatorJob);
  }
}

/** `campaign_briefs.doAndDont` disimpan sebagai JSON string. */
function parseDoAndDont(value: unknown): CreatorJob["doAndDont"] {
  const raw = str(value);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { do?: unknown; dont?: unknown };
    const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((i) => typeof i === "string") : []);
    return { do: list(parsed.do), dont: list(parsed.dont) };
  } catch {
    return undefined;
  }
}

export async function getCreatorActiveWorksFromAppwrite(): Promise<ServiceResult<CreatorActiveWork[]>> {
  const auth = await requireUserId<CreatorActiveWork[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const claims = await listOwnClaims(auth.userId);
    if (claims.length === 0) return { success: true, data: [] };
    return { success: true, data: await buildActiveWorks(claims) };
  } catch (err) {
    return failFromError<CreatorActiveWork[]>(err, []);
  }
}

export async function getCreatorActiveWorkByIdFromAppwrite(
  id: string
): Promise<ServiceResult<CreatorActiveWork>> {
  const auth = await requireUserId<CreatorActiveWork>(null as unknown as CreatorActiveWork);
  if (!auth.ok) return auth.result;
  try {
    // creatorId ikut sebagai filter, jadi klaim kreator lain tidak pernah terbaca
    // walaupun claimId-nya ditebak.
    const res = await databases.listDocuments(DB, COLLECTIONS.claims, [
      Query.equal("$id", id),
      Query.equal("creatorId", auth.userId),
      Query.limit(1),
    ]);
    const claim = res.documents[0] as unknown as Doc | undefined;
    if (!claim) {
      return { success: false, data: null, error: "Pekerjaan tidak ditemukan", code: "not_found" };
    }
    const works = await buildActiveWorks([claim]);
    return { success: true, data: works[0] };
  } catch (err) {
    return failFromError<CreatorActiveWork>(err, null as unknown as CreatorActiveWork);
  }
}

async function listOwnClaims(userId: string): Promise<Doc[]> {
  const res = await databases.listDocuments(DB, COLLECTIONS.claims, [
    Query.equal("creatorId", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(PAGE_LIMIT),
  ]);
  return res.documents as unknown as Doc[];
}

/** Gabungkan klaim dengan campaign induk, profil UMKM, dan submission-nya. */
async function buildActiveWorks(claims: Doc[]): Promise<CreatorActiveWork[]> {
  const campaignIds = Array.from(new Set(claims.map((c) => str(c.campaignId)).filter(Boolean)));
  const claimIds = claims.map((c) => str(c.$id));

  const [campaigns, submissions, assets] = await Promise.all([
    listByIds(COLLECTIONS.campaigns, "$id", campaignIds),
    listByIds(COLLECTIONS.submissions, "claimId", claimIds),
    listByIds(COLLECTIONS.campaignAssets, "campaignId", campaignIds),
  ]);

  const campaignById = new Map(campaigns.map((c) => [str(c.$id), c]));
  const submissionByClaimId = new Map(submissions.map((s) => [str(s.claimId), s]));
  // Materi pertama per campaign — tombol "Buka Materi" hanya butuh satu tautan.
  const assetUrlByCampaignId = new Map<string, string>();
  for (const asset of assets) {
    const campaignId = str(asset.campaignId);
    if (campaignId && !assetUrlByCampaignId.has(campaignId)) {
      assetUrlByCampaignId.set(campaignId, str(asset.fileUrl));
    }
  }
  const umkmById = await loadUmkmProfiles(campaigns.map((c) => str(c.umkmId)));

  return claims.map((claim) => {
    const campaign = campaignById.get(str(claim.campaignId));
    const umkm = campaign ? umkmById.get(str(campaign.umkmId)) : undefined;
    const submission = submissionByClaimId.get(str(claim.$id));
    const claimedAt = str(claim.claimedAt) || str(claim.$createdAt);

    return {
      id: str(claim.$id),
      campaignId: str(claim.campaignId),
      title: str(campaign?.title),
      brandName: str(umkm?.businessName),
      brandAvatar: str(umkm?.logoUrl),
      brief: str(campaign?.description),
      ratePerThousandViews: num(campaign?.rewardPer1000Views),
      status: str(claim.status) as ClaimStatus,
      claimedAt,
      deadline: submissionDeadline(claimedAt, num(campaign?.submissionDays)),
      submissionId: submission ? str(submission.$id) : undefined,
      submissionStatus: submission ? (str(submission.status) as SubmissionStatus) : undefined,
      // Hasil ai-fraud-precheck — terpisah dari submissionStatus.
      fraudStatus: submission ? (orUndefined(str(submission.fraudStatus)) as FraudStatus | undefined) : undefined,
      contentUrl: submission ? orUndefined(str(submission.postUrl)) : undefined,
      actualViews: submission ? num(submission.views) : undefined,
      platform: submission ? asPlatform(submission.platform) : undefined,
      notes: submission ? orUndefined(str(submission.caption)) : undefined,
      submittedAt: submission ? str(submission.$createdAt) : undefined,
      validatedAt:
        submission && str(submission.status) !== "pending" ? str(submission.$updatedAt) : undefined,
      assetUrl: orUndefined(assetUrlByCampaignId.get(str(claim.campaignId)) ?? ""),
    };
  });
}

export async function getCreatorSubmissionsFromAppwrite(): Promise<ServiceResult<CreatorSubmission[]>> {
  const auth = await requireUserId<CreatorSubmission[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.submissions, [
      Query.equal("creatorId", auth.userId),
      Query.orderDesc("$createdAt"),
      Query.limit(PAGE_LIMIT),
    ]);
    return {
      success: true,
      data: (res.documents as unknown as Doc[]).map(mapSubmission),
    };
  } catch (err) {
    return failFromError<CreatorSubmission[]>(err, []);
  }
}

/**
 * View pemilik: rate card `draft` IKUT ditampilkan. Bedanya dengan
 * getCreatorRateCardsFromAppwrite di sisi UMKM yang hanya `published`.
 */
export async function getCreatorPortfolioFromAppwrite(): Promise<
  ServiceResult<CreatorPortfolioItem[]>
> {
  const auth = await requireUserId<CreatorPortfolioItem[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.creatorPortfolios, [
      Query.equal("creatorId", auth.userId),
      Query.orderDesc("$createdAt"),
      Query.limit(PAGE_LIMIT),
    ]);
    const docs = res.documents as unknown as Doc[];
    // platform/niche/views sengaja tidak diisi — tidak ada kolomnya di skema.
    const data: CreatorPortfolioItem[] = docs.map((d) => ({
      id: str(d.$id),
      title: str(d.title),
      url: str(d.portfolioUrl),
      description: str(d.description),
      thumbnailUrl: orUndefined(str(d.thumbnailUrl)),
    }));
    return { success: true, data };
  } catch (err) {
    return failFromError<CreatorPortfolioItem[]>(err, []);
  }
}

export async function getCreatorRateCardPackagesFromAppwrite(): Promise<
  ServiceResult<CreatorRateCardPackage[]>
> {
  const auth = await requireUserId<CreatorRateCardPackage[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const cards = await databases.listDocuments(DB, COLLECTIONS.rateCards, [
      Query.equal("creatorId", auth.userId),
      Query.limit(PAGE_LIMIT),
    ]);
    const cardDocs = cards.documents as unknown as Doc[];
    if (cardDocs.length === 0) return { success: true, data: [] };

    // Status ada di parent `rate_cards`, paketnya di `rate_card_packages`.
    const statusByCard = new Map(
      cardDocs.map((c) => [str(c.$id), str(c.status) as RateCardStatus])
    );
    const packages = await listByIds(
      COLLECTIONS.rateCardPackages,
      "rateCardId",
      Array.from(statusByCard.keys())
    );

    const data: CreatorRateCardPackage[] = packages.map((p) => ({
      id: str(p.$id),
      name: str(p.name),
      description: str(p.description),
      price: num(p.price),
      deliverable: str(p.output),
      estimatedDays: num(p.deliveryDays),
      status: statusByCard.get(str(p.rateCardId)) ?? "draft",
      revisionCount: num(p.revisionLimit),
      // Tidak ada kolom platform di rate_card_packages.
    }));
    return { success: true, data };
  } catch (err) {
    return failFromError<CreatorRateCardPackage[]>(err, []);
  }
}

/**
 * Sumbernya HANYA `transactions`. Withdrawal sudah punya baris ledger sendiri
 * (wallet.service.ts menulis withdrawals + transactions sekaligus), jadi membaca
 * `withdrawals` juga akan menghitung penarikan dua kali.
 */
export async function getCreatorTransactionsFromAppwrite(): Promise<ServiceResult<CreatorTransaction[]>> {
  const auth = await requireUserId<CreatorTransaction[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.transactions, [
      Query.equal("userId", auth.userId),
      Query.orderDesc("$createdAt"),
      Query.limit(PAGE_LIMIT),
    ]);
    return {
      success: true,
      data: (res.documents as unknown as Doc[]).map(mapTransaction),
    };
  } catch (err) {
    return failFromError<CreatorTransaction[]>(err, []);
  }
}

export async function getCreatorActivitiesFromAppwrite(): Promise<ServiceResult<CreatorActivity[]>> {
  const auth = await requireUserId<CreatorActivity[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.notifications, [
      Query.equal("userId", auth.userId),
      Query.orderDesc("$createdAt"),
      Query.limit(PAGE_LIMIT),
    ]);
    return {
      success: true,
      data: (res.documents as unknown as Doc[]).map(mapActivity),
    };
  } catch (err) {
    return failFromError<CreatorActivity[]>(err, []);
  }
}
