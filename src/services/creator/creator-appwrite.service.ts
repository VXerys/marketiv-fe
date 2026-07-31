import { Query, ID, Permission, Role } from "appwrite";
import { databases } from "@/lib/appwrite/databases";
import { appwriteConfig } from "@/lib/appwrite/config";
import { uploadPublicFile, FileRuleError } from "@/lib/appwrite/storage";
import {
  executeFunction,
  FunctionExecutionError,
  FUNCTION_IDS,
} from "@/lib/appwrite/functions";
import {
  type Doc,
  str,
  num,
  ok,
  fail,
  failValidation,
  failFromError,
  failFromWriteError,
  requireUserId,
} from "@/services/shared/service-result";
import {
  ServiceResult,
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
  creatorProfiles: "creator_profiles",
  creatorSocialAccounts: "creator_social_accounts",
  creatorPortfolios: "creator_portfolios",
  umkmProfiles: "umkm_profiles",
  transactions: "transactions",
  notifications: "notifications",
  orders: "orders",
  offers: "offers",
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

const orUndefined = (v: string): string | undefined => v || undefined;

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
  type: str(d.type) || undefined,
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
  // Keuangan
  reward: "payout",
  reward_matured: "payout",
  escrow_released: "payout",
  // Submission
  submission_approved: "submission_valid",
  // Escrow
  escrow_held: "pending_escrow",
  // Negosiasi / Rate Card
  chat_message: "negotiation_new",
  offer_rejected: "negotiation_new",
  order_created: "negotiation_new",
  order_completed: "negotiation_new",
  deliverable_submitted: "negotiation_new",
  revision_requested: "negotiation_new",
  // campaign_published, claim, claim_expired: pass-through (sudah cocok CreatorActivityType)
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

/**
 * Join conversations + offers + orders + escrows + messages + umkm_profiles.
 * Di-key conversationId — di Alur B order lahir paling akhir.
 */
export async function getCreatorNegotiationsFromAppwrite(): Promise<ServiceResult<CreatorNegotiation[]>> {
  try {
    const data = await executeFunction<CreatorNegotiation[]>(FUNCTION_IDS.creatorNegotiations);
    return { success: true, data };
  } catch (err) {
    return failFromError<CreatorNegotiation[]>(err, []);
  }
}

export async function getCreatorNegotiationByIdFromAppwrite(
  conversationId: string
): Promise<ServiceResult<CreatorNegotiation>> {
  try {
    const data = await executeFunction<CreatorNegotiation>(FUNCTION_IDS.creatorNegotiations, {
      conversationId,
    });
    return { success: true, data };
  } catch (err) {
    if (err instanceof FunctionExecutionError && err.code === "not_found") {
      return { success: false, data: null, error: "Negosiasi tidak ditemukan", code: "not_found" };
    }
    return failFromError<CreatorNegotiation>(err, null as unknown as CreatorNegotiation);
  }
}

/**
 * Terima / tolak Custom Offer. Ini SATU-SATUNYA aksi kreator terhadap offer —
 * membuat offer adalah hak UMKM (docs/02_Modules/Offers/30_Business_Rules.md:13),
 * dan permission baris offer memang hanya memberi kreator `update`.
 *
 * ⚠️ ORDER TIDAK DIBUAT DI SINI. `create-order` dipicu event
 * `offers.rows.*.update` dan berjalan ASINKRON — beberapa detik setelah tulisan
 * ini masuk. Pemanggil harus mem-poll, bukan menganggap ordernya langsung ada.
 * Membuat order dari klien juga akan ditolak: `orders` punya `$permissions`
 * kosong, hanya Function yang bisa menulis ke sana.
 */
async function setOfferStatusInAppwrite(
  offerId: string,
  status: "accepted" | "rejected"
): Promise<ServiceResult<null>> {
  const auth = await requireUserId<null>(null);
  if (!auth.ok) return auth.result;
  try {
    const offer = (await databases.getDocument(DB, COLLECTIONS.offers, offerId)) as unknown as Doc;

    if (str(offer.creatorId) !== auth.userId) {
      return fail("Hanya kreator penerima yang dapat menjawab penawaran ini.", "forbidden", null);
    }
    if (str(offer.status) !== "pending") {
      return fail("Penawaran ini sudah dijawab sebelumnya.", "validation", null);
    }

    await databases.updateDocument(DB, COLLECTIONS.offers, offerId, { status });
    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, null);
  }
}

export const acceptOfferInAppwrite = (offerId: string) =>
  setOfferStatusInAppwrite(offerId, "accepted");

export const rejectOfferInAppwrite = (offerId: string) =>
  setOfferStatusInAppwrite(offerId, "rejected");

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
      rejectedReason: submission ? orUndefined(str(submission.reviewNotes)) : undefined,
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
      rateCardId: str(p.rateCardId),
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

// ── rate card CRUD (Sprint 3) ─────────────────────────────────────────────────
//
// Model 1 rate_cards per paket UI (1:1): status ada di parent, toggle per paket
// jalan tanpa restrukturisasi, dan update TIDAK pernah delete-recreate sibling
// (menghindari bug creator.service.ts yang mengorphankan orders.packageId).

const RC_MAX_PACKAGES = 3;
const RC_ACTIVE_ORDER_STATUSES = [
  "pending_payment",
  "escrow",
  "in_progress",
  "revision",
  "approved",
];

export type RateCardPackageWriteInput = {
  name: string;
  description: string;
  output: string;
  deliveryDays: number;
  price: number;
  revisionLimit: number;
  /** → rate_cards.status */
  published: boolean;
};

const mapRcPackage = (child: Doc, status: RateCardStatus): CreatorRateCardPackage => ({
  id: str(child.$id),
  rateCardId: str(child.rateCardId),
  name: str(child.name),
  description: str(child.description),
  price: num(child.price),
  deliverable: str(child.output),
  estimatedDays: num(child.deliveryDays),
  status,
  revisionCount: num(child.revisionLimit),
});

/** Baca parent rate_cards milik user; forbidden bila bukan miliknya. */
async function requireOwnedRateCard(
  rateCardId: string,
  userId: string
): Promise<{ ok: true; doc: Doc } | { ok: false; result: ServiceResult<never> }> {
  const res = await databases.listDocuments(DB, COLLECTIONS.rateCards, [
    Query.equal("$id", rateCardId),
    Query.equal("creatorId", userId),
    Query.limit(1),
  ]);
  const doc = res.documents[0] as unknown as Doc | undefined;
  if (!doc) {
    return {
      ok: false,
      result: fail("Paket tidak ditemukan atau bukan milik Anda.", "forbidden", null as never),
    };
  }
  return { ok: true, doc };
}

export async function createCreatorRateCardPackageInAppwrite(
  input: RateCardPackageWriteInput
): Promise<ServiceResult<CreatorRateCardPackage>> {
  const empty = null as unknown as CreatorRateCardPackage;
  const auth = await requireUserId<CreatorRateCardPackage>(empty);
  if (!auth.ok) return auth.result;
  const uid = auth.userId;
  const perms = [
    Permission.read(Role.any()),
    Permission.update(Role.user(uid)),
    Permission.delete(Role.user(uid)),
  ];
  const status: RateCardStatus = input.published ? "published" : "draft";

  try {
    const existing = await databases.listDocuments(DB, COLLECTIONS.rateCards, [
      Query.equal("creatorId", uid),
      Query.limit(RC_MAX_PACKAGES + 1),
    ]);
    if (existing.total >= RC_MAX_PACKAGES) {
      return failValidation("Maksimal 3 paket. Hapus satu paket dulu.", empty);
    }

    const parent = (await databases.createDocument(
      DB,
      COLLECTIONS.rateCards,
      ID.unique(),
      {
        creatorId: uid,
        title: input.name.trim(),
        description: input.description.trim(),
        status,
        createdAt: new Date().toISOString(),
      },
      perms
    )) as unknown as Doc;

    let child: Doc;
    try {
      child = (await databases.createDocument(
        DB,
        COLLECTIONS.rateCardPackages,
        ID.unique(),
        {
          rateCardId: str(parent.$id),
          name: input.name.trim(),
          description: input.description.trim(),
          output: input.output.trim(),
          deliveryDays: input.deliveryDays,
          price: input.price,
          revisionLimit: input.revisionLimit,
        },
        perms
      )) as unknown as Doc;
    } catch (childErr) {
      // Rate card tanpa paket akan jadi hantu di direktori UMKM — buang parent.
      try {
        await databases.deleteDocument(DB, COLLECTIONS.rateCards, str(parent.$id));
      } catch {
        /* biarkan — sudah dilaporkan lewat error di bawah */
      }
      return failFromWriteError<CreatorRateCardPackage>(childErr, empty);
    }

    return ok(mapRcPackage(child, status));
  } catch (err) {
    return failFromWriteError<CreatorRateCardPackage>(err, empty);
  }
}

export async function updateCreatorRateCardPackageInAppwrite(
  pkg: { id: string; rateCardId: string },
  input: RateCardPackageWriteInput
): Promise<ServiceResult<CreatorRateCardPackage>> {
  const empty = null as unknown as CreatorRateCardPackage;
  const auth = await requireUserId<CreatorRateCardPackage>(empty);
  if (!auth.ok) return auth.result;

  try {
    const owned = await requireOwnedRateCard(pkg.rateCardId, auth.userId);
    if (!owned.ok) return owned.result as ServiceResult<CreatorRateCardPackage>;

    const status: RateCardStatus = input.published ? "published" : "draft";

    // Update baris anak in-place (JANGAN delete-recreate — orders.packageId stabil).
    const child = (await databases.updateDocument(
      DB,
      COLLECTIONS.rateCardPackages,
      pkg.id,
      {
        name: input.name.trim(),
        description: input.description.trim(),
        output: input.output.trim(),
        deliveryDays: input.deliveryDays,
        price: input.price,
        revisionLimit: input.revisionLimit,
      }
    )) as unknown as Doc;

    // Mirror title + status ke parent.
    await databases.updateDocument(DB, COLLECTIONS.rateCards, pkg.rateCardId, {
      title: input.name.trim(),
      status,
    });

    return ok(mapRcPackage(child, status));
  } catch (err) {
    return failFromWriteError<CreatorRateCardPackage>(err, empty);
  }
}

export async function setCreatorRateCardPackageStatusInAppwrite(
  pkg: { id: string; rateCardId: string },
  status: RateCardStatus
): Promise<ServiceResult<CreatorRateCardPackage>> {
  const empty = null as unknown as CreatorRateCardPackage;
  const auth = await requireUserId<CreatorRateCardPackage>(empty);
  if (!auth.ok) return auth.result;

  try {
    const owned = await requireOwnedRateCard(pkg.rateCardId, auth.userId);
    if (!owned.ok) return owned.result as ServiceResult<CreatorRateCardPackage>;

    await databases.updateDocument(DB, COLLECTIONS.rateCards, pkg.rateCardId, { status });
    const child = (await databases.getDocument(
      DB,
      COLLECTIONS.rateCardPackages,
      pkg.id
    )) as unknown as Doc;
    return ok(mapRcPackage(child, status));
  } catch (err) {
    return failFromWriteError<CreatorRateCardPackage>(err, empty);
  }
}

export async function deleteCreatorRateCardPackageInAppwrite(pkg: {
  id: string;
  rateCardId: string;
}): Promise<ServiceResult<null>> {
  const auth = await requireUserId<null>(null);
  if (!auth.ok) return auth.result;

  try {
    const owned = await requireOwnedRateCard(pkg.rateCardId, auth.userId);
    if (!owned.ok) return owned.result as ServiceResult<null>;

    // Tolak hapus bila paket terpakai order berjalan.
    const orders = await databases.listDocuments(DB, COLLECTIONS.orders, [
      Query.equal("packageId", pkg.id),
      Query.equal("status", RC_ACTIVE_ORDER_STATUSES),
      Query.limit(1),
    ]);
    if (orders.total > 0) {
      return failValidation(
        "Paket tidak bisa dihapus karena masih ada order berjalan. Jadikan Draft saja.",
        null
      );
    }

    await databases.deleteDocument(DB, COLLECTIONS.rateCardPackages, pkg.id);
    await databases.deleteDocument(DB, COLLECTIONS.rateCards, pkg.rateCardId);
    return ok(null);
  } catch (err) {
    // Baris yang dibuat sebelum fitur ini aktif tidak punya row-perm delete.
    const code = (err as { code?: number })?.code;
    if (code === 401 || code === 403) {
      return fail(
        "Paket ini tidak bisa dihapus dari aplikasi karena dibuat sebelum fitur ini aktif. Jadikan Draft saja agar tidak tampil di marketplace.",
        "forbidden",
        null
      );
    }
    return failFromWriteError<null>(err, null);
  }
}

// ── profil kreator (Sprint 3) ────────────────────────────────────────────────

/**
 * Kolom `creator_profiles` yang boleh ditulis klien.
 * Menambah `niche` dibanding allow-list user.service.ts:270 — kolomnya ada dan
 * UI mengeditnya (temuan handoff Sprint 3).
 */
const CREATOR_PROFILE_WRITABLE = [
  "displayName",
  "bio",
  "city",
  "avatarUrl",
  "niche",
  "isProfileCompleted",
] as const;

export type CreatorProfileWriteInput = Partial<
  Record<(typeof CREATOR_PROFILE_WRITABLE)[number], string | boolean>
>;

/** Cari dokumen creator_profiles milik user aktif. */
async function findOwnCreatorProfileDoc(userId: string): Promise<Doc | undefined> {
  const res = await databases.listDocuments(DB, COLLECTIONS.creatorProfiles, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  return res.documents[0] as unknown as Doc | undefined;
}

/**
 * Update profil kreator lalu baca ulang DTO gabungan lewat Function agar UI
 * mendapat bentuk CreatorProfile yang sama seperti saat load.
 */
export async function updateCreatorProfileInAppwrite(
  input: CreatorProfileWriteInput
): Promise<ServiceResult<CreatorProfile>> {
  const empty = null as unknown as CreatorProfile;
  const auth = await requireUserId<CreatorProfile>(empty);
  if (!auth.ok) return auth.result;

  const payload: Record<string, string | boolean> = {};
  for (const key of CREATOR_PROFILE_WRITABLE) {
    const value = input[key];
    if (value !== undefined) payload[key] = value;
  }
  if (Object.keys(payload).length === 0) {
    return failValidation("Tidak ada perubahan untuk disimpan.", empty);
  }

  try {
    const doc = await findOwnCreatorProfileDoc(auth.userId);
    if (!doc) return fail("Profil kreator tidak ditemukan.", "not_found", empty);

    await databases.updateDocument(DB, COLLECTIONS.creatorProfiles, str(doc.$id), payload);
    return getCreatorProfileFromAppwrite();
  } catch (err) {
    return failFromWriteError<CreatorProfile>(err, empty);
  }
}

/** Unggah avatar ke bucket `avatars` (client-writable) dan kembalikan URL-nya. */
export async function uploadCreatorAvatarInAppwrite(file: File): Promise<ServiceResult<string>> {
  const auth = await requireUserId<string>("");
  if (!auth.ok) return auth.result;
  try {
    const uploaded = await uploadPublicFile("avatars", file, auth.userId);
    return ok(uploaded.url);
  } catch (err) {
    if (err instanceof FileRuleError) return failValidation(err.message, "");
    return failFromWriteError<string>(err, "");
  }
}

// ── akun sosial kreator (Sprint 3) ───────────────────────────────────────────

/**
 * Upsert akun sosial. `creatorId` ditulis = userId (BUKAN $id dokumen profil):
 * get-creator-profile query Query.equal("creatorId", userId), sedangkan
 * user.service.ts:306 menulis $id profil sehingga barisnya tak pernah terbaca.
 * Kami standardisasi ke userId — backend harus pilih satu & backfill (handoff).
 * Tak ada unique index, jadi list dulu supaya tidak duplikat.
 */
export async function upsertCreatorSocialAccountInAppwrite(input: {
  platform: "tiktok";
  username: string;
}): Promise<ServiceResult<null>> {
  const auth = await requireUserId<null>(null);
  if (!auth.ok) return auth.result;
  const uid = auth.userId;
  try {
    const existing = await databases.listDocuments(DB, COLLECTIONS.creatorSocialAccounts, [
      Query.equal("creatorId", uid),
      Query.equal("platform", input.platform),
      Query.limit(1),
    ]);
    const doc = existing.documents[0] as unknown as Doc | undefined;
    if (doc) {
      await databases.updateDocument(DB, COLLECTIONS.creatorSocialAccounts, str(doc.$id), {
        username: input.username,
      });
    } else {
      await databases.createDocument(
        DB,
        COLLECTIONS.creatorSocialAccounts,
        ID.unique(),
        { creatorId: uid, platform: input.platform, username: input.username },
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(uid)),
          Permission.delete(Role.user(uid)),
        ]
      );
    }
    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, null);
  }
}

// ── portofolio kreator (Sprint 3) ────────────────────────────────────────────

export type CreatorPortfolioWriteInput = {
  title: string;
  portfolioUrl: string;
  description?: string;
  thumbnailUrl?: string;
};

/** Sama seperti mapper baca di getCreatorPortfolioFromAppwrite (view-model `url`). */
const mapPortfolioDoc = (d: Doc): CreatorPortfolioItem => ({
  id: str(d.$id),
  title: str(d.title),
  url: str(d.portfolioUrl),
  description: str(d.description),
  thumbnailUrl: orUndefined(str(d.thumbnailUrl)),
});

export async function createCreatorPortfolioInAppwrite(
  input: CreatorPortfolioWriteInput
): Promise<ServiceResult<CreatorPortfolioItem>> {
  const empty = null as unknown as CreatorPortfolioItem;
  const auth = await requireUserId<CreatorPortfolioItem>(empty);
  if (!auth.ok) return auth.result;
  const uid = auth.userId;
  try {
    const doc = await databases.createDocument(
      DB,
      COLLECTIONS.creatorPortfolios,
      ID.unique(),
      {
        creatorId: uid,
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        thumbnailUrl: input.thumbnailUrl ?? "",
        portfolioUrl: input.portfolioUrl.trim(),
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(uid)),
        Permission.delete(Role.user(uid)),
      ]
    );
    return ok(mapPortfolioDoc(doc as unknown as Doc));
  } catch (err) {
    return failFromWriteError<CreatorPortfolioItem>(err, empty);
  }
}

export async function updateCreatorPortfolioInAppwrite(
  id: string,
  input: CreatorPortfolioWriteInput
): Promise<ServiceResult<CreatorPortfolioItem>> {
  const empty = null as unknown as CreatorPortfolioItem;
  const auth = await requireUserId<CreatorPortfolioItem>(empty);
  if (!auth.ok) return auth.result;
  try {
    const doc = await databases.updateDocument(DB, COLLECTIONS.creatorPortfolios, id, {
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      thumbnailUrl: input.thumbnailUrl ?? "",
      portfolioUrl: input.portfolioUrl.trim(),
    });
    return ok(mapPortfolioDoc(doc as unknown as Doc));
  } catch (err) {
    return failFromWriteError<CreatorPortfolioItem>(err, empty);
  }
}

export async function deleteCreatorPortfolioInAppwrite(id: string): Promise<ServiceResult<null>> {
  const auth = await requireUserId<null>(null);
  if (!auth.ok) return auth.result;
  try {
    await databases.deleteDocument(DB, COLLECTIONS.creatorPortfolios, id);
    return ok(null);
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code === 401 || code === 403) {
      return fail(
        "Item ini tidak bisa dihapus dari aplikasi karena dibuat sebelum fitur ini aktif; hubungi support.",
        "forbidden",
        null
      );
    }
    return failFromWriteError<null>(err, null);
  }
}

/** Unggah thumbnail portofolio ke bucket `portfolios` (50 MB). */
export async function uploadCreatorPortfolioThumbnailInAppwrite(
  file: File
): Promise<ServiceResult<string>> {
  const auth = await requireUserId<string>("");
  if (!auth.ok) return auth.result;
  try {
    const uploaded = await uploadPublicFile("portfolios", file, auth.userId);
    return ok(uploaded.url);
  } catch (err) {
    if (err instanceof FileRuleError) return failValidation(err.message, "");
    return failFromWriteError<string>(err, "");
  }
}

// ── penarikan saldo (Sprint 3) ───────────────────────────────────────────────

export type WithdrawRequestInput = {
  amount: number;
  payoutMethod: "bank" | "ewallet";
  providerName: string;
  accountNumber: string;
  accountName: string;
  /** Kunci idempotensi; Function memakainya sebagai document id deterministik. */
  requestKey: string;
};

export type WithdrawalReceipt = {
  withdrawalId: string;
  amount: number;
  status: "processed";
  processedAt: string;
  balanceAfter: number;
  transactionId: string | null;
};

/**
 * Ajukan penarikan lewat Function `request-withdrawal`.
 * WAJIB lewat Function: `wallets` & `transactions` punya $permissions kosong,
 * jadi klien tak bisa mendebit saldo sendiri.
 */
export async function requestWithdrawalInAppwrite(
  input: WithdrawRequestInput
): Promise<ServiceResult<WithdrawalReceipt>> {
  const empty = null as unknown as WithdrawalReceipt;
  const auth = await requireUserId<WithdrawalReceipt>(empty);
  if (!auth.ok) return auth.result;
  try {
    const res = await executeFunction<WithdrawalReceipt>(FUNCTION_IDS.requestWithdrawal, input);
    return ok(res);
  } catch (err) {
    return failFromWriteError<WithdrawalReceipt>(err, empty);
  }
}

// ── Alur A: klaim campaign & kirim bukti (Sprint 4) ──────────────────────────
//
// Keduanya lewat SDK tulis dokumen, BUKAN executeFunction. `campaign-claimed`
// dan `ai-fraud-precheck` dipicu event database (lihat `events` di
// 00_BACKEND/appwrite.config.json) dan menyala sendiri setelah tulisan masuk.
//
// `campaign-claimed` SEKARANG menambah `totalClaims` secara atomik. Klien hanya
// membuat baris claim — counter adalah tanggung jawab Function. Sweep basi
// sisi klien juga dihapus: slot dikembalikan oleh `expire-stale-claims` (cron
// per jam) dan oleh `campaign-claimed` sendiri saat kuota terlampaui.

/**
 * Klaim campaign aktif.
 *
 * Mirror 00_BACKEND/src/services/claim.service.ts:83-160 dengan dua
 * penyimpangan yang disengaja:
 *
 * 1. **`isProfileCompleted` dibaca dari `creator_profiles`, bukan `users`.**
 *    Backend membacanya dari `users` (claim.service.ts:91) padahal koleksi itu
 *    hanya punya kolom userId/role/status/email/phone/createdAt — `users` tidak
 *    pernah punya `isProfileCompleted`. Kolomnya ada di `creator_profiles`.
 *    Sudah dilaporkan ke backend.
 * 2. **Baris claim dibuat dengan `Permission.delete`.** `campaign_claims` tidak
 *    punya `delete("users")` di level collection, dan jalur create backend baru
 *    memasang read+update — tanpa ini `unclaimCampaignInAppwrite` selalu
 *    401/403 (temuan V-1).
 */
export async function claimCampaignInAppwrite(
  campaignId: string
): Promise<ServiceResult<string>> {
  const auth = await requireUserId<string>("");
  if (!auth.ok) return auth.result;
  try {
    const campaign = (await databases.getDocument(
      DB,
      COLLECTIONS.campaigns,
      campaignId
    )) as unknown as Doc;

    if (str(campaign.status) !== "active") {
      return failValidation("Campaign ini sudah tidak aktif.", "");
    }

    const profileRes = await databases.listDocuments(DB, COLLECTIONS.creatorProfiles, [
      Query.equal("userId", auth.userId),
      Query.limit(1),
    ]);
    const profile = profileRes.documents[0] as unknown as Doc | undefined;
    if (!profile || !profile.isProfileCompleted) {
      return failValidation(
        "Lengkapi profil kreator dulu sebelum mengambil pekerjaan.",
        ""
      );
    }

    // Guard cepat berbasis bacaan — mungkin basi (counter diperbarui oleh
    // `campaign-claimed` async, ~0,5–3 detik setelah createDocument). Tetap
    // berguna sebagai penolakan dini untuk kasus yang jelas-jelas penuh.
    // Penegakan final ada di `campaign-claimed` yang memakai incrementColumn
    // dengan `max: claimLimit` — server yang benar-benar menolak bila sudah penuh.
    if (num(campaign.totalClaims) >= num(campaign.claimLimit)) {
      return failValidation("Kuota kreator untuk campaign ini sudah penuh.", "");
    }

    // ⚠️ Cek duplikat sengaja TIDAK memfilter status — cermin persis
    // claim.service.ts:126. Konsekuensinya: kreator yang claim-nya sempat
    // `expired` tidak bisa mengambil campaign ini lagi, padahal slotnya sudah
    // dikembalikan untuk kreator lain. Tidak dilonggarkan sepihak karena aturan
    // bisnis harus sama di kedua sisi; sudah ditanyakan ke backend.
    const existing = await databases.listDocuments(DB, COLLECTIONS.claims, [
      Query.equal("campaignId", campaignId),
      Query.equal("creatorId", auth.userId),
      Query.limit(1),
    ]);
    if (existing.documents.length > 0) {
      const previous = existing.documents[0] as unknown as Doc;
      return failValidation(
        str(previous.status) === "expired"
          ? "Batas waktu pengerjaan campaign ini sudah lewat dan tidak bisa diambil lagi."
          : "Kamu sudah pernah mengambil campaign ini.",
        ""
      );
    }

    const claim = await databases.createDocument(
      DB,
      COLLECTIONS.claims,
      ID.unique(),
      {
        campaignId,
        creatorId: auth.userId,
        status: "claimed",
        claimedAt: new Date().toISOString(),
      },
      // HANYA role diri sendiri. Appwrite menolak klien yang memasang permission
      // untuk user lain ("Permissions must be one of: (any, users, user:<diri
      // sendiri>, ...)"), jadi dua baris untuk UMKM yang sempat ada di sini
      // membuat klaim campaign gagal total — bukan sekadar tidak berefek.
      //
      // UMKM tetap bisa membaca klaim ini lewat `read("any")` yang masih
      // terpasang di level koleksi `campaign_claims`, dan update statusnya
      // dikerjakan Function `review-submission` dengan API key.
      [
        Permission.read(Role.user(auth.userId)),
        Permission.update(Role.user(auth.userId)),
        Permission.delete(Role.user(auth.userId)),
      ]
    );

    // Counter denormalisasi — lihat catatan di atas, Function tidak melakukannya.
    //
    // Increment ATOMIK, bukan `totalClaims + 1` hasil bacaan di awal fungsi:
    // dua kreator yang mengklaim bersamaan sama-sama membaca angka lama lalu
    // menuliskan hasil yang sama, sehingga kuota bisa terlampaui. `max`
    // membuat SERVER yang menolak klaim ke-(claimLimit+1) — bukan pembacaan
    // klien yang sudah basi saat dipakai.
    try {
      await databases.incrementDocumentAttribute({
        databaseId: DB,
        collectionId: COLLECTIONS.campaigns,
        documentId: campaignId,
        attribute: "totalClaims",
        value: 1,
        max: num(campaign.claimLimit),
      });
    } catch {
      // Claim sudah sah; counter yang tertinggal bisa direkonsiliasi, dan
      // `campaign-claimed` akan mengoreksi bila sampai melewati batas.
    }

    // Counter tidak lagi diincrement di sini — sekarang dilakukan oleh Function
    // `campaign-claimed` secara atomik dengan max=claimLimit. Menghapus increment
    // sisi klien menutup race condition di mana dua kreator membaca totalClaims=0
    // bersamaan dan sama-sama berhasil melewati guard di atas.

    return ok(claim.$id);
  } catch (err) {
    return failFromWriteError<string>(err, "");
  }
}

export type SubmitProofInput = {
  claimId: string;
  campaignId: string;
  postUrl: string;
  caption?: string;
  /** Platform konten — diteruskan ke Appwrite supaya ai-fraud-precheck
   *  membandingkan hostname URL dengan platform yang benar, bukan selalu "tiktok". */
  platform: "tiktok" | "instagram";
};

/**
 * Kirim bukti konten untuk claim yang sedang dikerjakan.
 *
 * `views` sengaja ditulis 0: tidak ada Function backend yang mengaudit views,
 * dan angka yang diisi sendiri oleh kreator akan langsung jadi dasar reward.
 * UMKM yang mengisinya saat menyetujui submission (lihat B-1 di handoff).
 *
 * `ai-fraud-precheck` menyala pada create dan menulis balik `fraudScore` /
 * `fraudStatus` beberapa saat kemudian — UI harus menampilkan "sedang
 * diperiksa", bukan menganggap aman.
 *
 * ⚠️ INI JALUR UANG, dan permission barisnya mencerminkan itu — sama persis
 * dengan alasan di header deliverable-appwrite.service.ts:
 *
 * - `update` diberikan HANYA ke UMKM. Menulis `status: "approved"` di baris ini
 *   memicu `calculate-campaign-reward`, yang langsung menambah
 *   `wallets.pendingBalance` kreator. Memberi kreator `update` sama dengan
 *   mengizinkannya menyetujui pekerjaannya sendiri lalu mencairkan dananya.
 *   Guard peran di service TIDAK cukup — penyerang cukup memanggil
 *   `updateDocument` langsung dari konsol browser.
 * - `read` diberikan ke KEDUANYA. Sebelumnya UMKM tidak diberi read sama sekali,
 *   dan layar review hidup semata karena `read("any")` di level koleksi. Begitu
 *   koleksi diketatkan (gelombang 5), layar itu akan kosong tanpa baris ini.
 * - `ai-fraud-precheck` memakai API key, jadi tetap bisa menulis fraudScore.
 */
export async function submitProofInAppwrite(
  input: SubmitProofInput
): Promise<ServiceResult<null>> {
  const auth = await requireUserId<null>(null);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.claims, [
      Query.equal("$id", input.claimId),
      Query.equal("creatorId", auth.userId),
      Query.limit(1),
    ]);
    const claim = res.documents[0] as unknown as Doc | undefined;
    if (!claim) return fail("Pekerjaan tidak ditemukan.", "not_found", null);

    if (str(claim.status) !== "claimed") {
      return failValidation(
        "Bukti untuk pekerjaan ini sudah pernah dikirim.",
        null
      );
    }

    await databases.createDocument(
      DB,
      COLLECTIONS.submissions,
      ID.unique(),
      {
        claimId: input.claimId,
        campaignId: input.campaignId,
        creatorId: auth.userId,
        // Dulu selalu "tiktok". Sekarang diteruskan dari UI supaya ai-fraud-precheck
        // tidak menambah +20 skor fraud "Platform tidak cocok" ke submission Instagram.
        platform: input.platform,
        postUrl: input.postUrl,
        caption: input.caption ?? "",
        views: 0,
        status: "pending",
      },
      // HANYA role diri sendiri — alasan yang sama dengan claimCampaign di atas.
      //
      // Jalur uang tetap terjaga, dan justru lebih rapat: `views` + status
      // "approved" adalah yang memicu calculate-campaign-reward menambah saldo
      // kreator, dan sekarang SATU-SATUNYA yang bisa menulisnya adalah Function
      // `review-submission` (level koleksi tanpa update, baris tanpa update untuk
      // siapa pun kecuali kreatornya sendiri untuk kirim ulang bukti). UMKM
      // membacanya lewat `read("any")` yang masih ada di level koleksi.
      [
        Permission.read(Role.user(auth.userId)),
        Permission.update(Role.user(auth.userId)),
      ]
    );

    await databases.updateDocument(DB, COLLECTIONS.claims, input.claimId, {
      status: "submitted",
    });

    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, null);
  }
}

// ── batalkan claim (Sprint 3.5) ──────────────────────────────────────────────

/**
 * Batalkan claim campaign yang belum disubmit — HARD DELETE.
 *
 * Mirror 00_BACKEND/src/services/claim.service.ts:unclaimCampaign setelah
 * resolusi T-1 (2026-07-26): backend memilih menghapus barisnya, bukan
 * memindahkan status ke `unclaimed`. Itu satu-satunya cara kreator bisa
 * mengambil campaign yang sama lagi, karena cek duplikat di `claimCampaign`
 * menolak berdasarkan keberadaan baris tanpa memfilter status.
 *
 * ⚠️ Butuh `Permission.delete(Role.user(creatorId))` pada baris claim.
 * `campaign_claims` TIDAK punya `delete("users")` di level collection, dan
 * jalur create backend (claim.service.ts:147) baru memasang read+update.
 * Jalur create milik frontend (Sprint 4 `s4-ppv-claim`) WAJIB memasang
 * Permission.delete — kalau tidak, fungsi ini selalu balas 401/403.
 * Sudah dilaporkan ke backend untuk baris lama & jalur create mereka.
 *
 * `totalClaims` dikurangi setelah baris terhapus, dan kegagalannya tidak
 * membatalkan operasi: slot yang telat kembali bisa direkonsiliasi,
 * sedangkan claim yang menggantung tidak.
 */
export async function unclaimCampaignInAppwrite(claimId: string): Promise<ServiceResult<null>> {
  const auth = await requireUserId<null>(null);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.claims, [
      Query.equal("$id", claimId),
      Query.equal("creatorId", auth.userId),
      Query.limit(1),
    ]);
    const claim = res.documents[0] as unknown as Doc | undefined;
    if (!claim) return fail("Pekerjaan tidak ditemukan.", "not_found", null);

    if (str(claim.status) !== "claimed") {
      return failValidation(
        "Hanya pekerjaan yang belum dikirim yang bisa dibatalkan.",
        null
      );
    }

    const campaignId = str(claim.campaignId);

    try {
      await databases.deleteDocument(DB, COLLECTIONS.claims, claimId);
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code === 401 || code === 403) {
        return fail(
          "Pekerjaan ini tidak bisa dibatalkan dari aplikasi karena diklaim sebelum fitur pembatalan aktif; hubungi support.",
          "forbidden",
          null
        );
      }
      throw err;
    }

    // Decrement ATOMIK dengan `min: 0`. Versi lama membaca `totalClaims` lalu
    // menulis `total - 1`; dua pembatalan bersamaan sama-sama membaca angka yang
    // sama sehingga hanya satu slot yang benar-benar kembali. `min` juga
    // menggantikan guard `total > 0` yang ikut basi karena berdasar bacaan.
    try {
      await databases.decrementDocumentAttribute({
        databaseId: DB,
        collectionId: COLLECTIONS.campaigns,
        documentId: campaignId,
        attribute: "totalClaims",
        value: 1,
        min: 0,
      });
    } catch {
      // Slot yang telat kembali bisa direkonsiliasi; claim menggantung tidak.
    }

    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, null);
  }
}
