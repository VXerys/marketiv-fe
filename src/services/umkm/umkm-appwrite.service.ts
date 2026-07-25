import { Query, ID, Permission, Role } from "appwrite";
import { databases } from "@/lib/appwrite/databases";
import { appwriteConfig } from "@/lib/appwrite/config";
import {
  executeFunction,
  FunctionExecutionError,
  FUNCTION_IDS,
} from "@/lib/appwrite/functions";
import { type CampaignType, MINIMUM_CAMPAIGN_BUDGET } from "@/types/domain";
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
  UmkmProfile,
  UmkmDashboardSummary,
  Campaign,
  CampaignSubmission,
  CreatorProfile,
  CreatorNiche,
  RateCardPackage,
  NegotiationOrder,
  ChatMessage,
  Transaction,
  UmkmFinanceSummary,
  EscrowOverview,
  CampaignStatus,
  SubmissionStatus,
  FraudStatus,
  RateCardStatus,
  OrderStatus,
  MessageType,
  TransactionType,
  TransactionStatus,
} from "@/types/umkm-dashboard.types";

/**
 * Lapisan Appwrite dashboard UMKM (s1-appwrite-read).
 *
 * Sumber kebenaran skema: 00_BACKEND/appwrite.config.json (tables camelCase).
 * Pola: getSession() untuk kepemilikan → databases.listDocuments → mapper $id→id.
 * Semua nilai status di DB adalah string bebas; backend Function menulis nilai
 * kanon (@/types/domain), jadi mapper melakukan cast langsung.
 *
 * Agregasi & join yang tidak bisa dipetakan setia dari satu collection dilayani
 * Function DTO backend (00_BACKEND/functions/get-*), bukan dihitung di klien —
 * lihat docs/.../08-frontend-data-contract.md §6, §15, §28.
 *
 * CATATAN JUJUR (belum bisa runtime-test — NEXT_PUBLIC_USE_MOCK_DATA=true):
 * - Field view-model berikut masih tanpa kolom sumber: Campaign.thumbnailUrl/
 *   externalAssetUrl/totalViews, Negotiation.projectTitle/scope/creatorName.
 *   Diberi default terdokumentasi sampai kolom/Function-nya ada.
 * - CreatorProfile.niche baru terisi setelah kolom `creator_profiles.niche`
 *   di-push dan di-backfill; sebelum itu Function mengembalikan "lainnya".
 */

const DB = appwriteConfig.databaseId;

const COLLECTIONS = {
  campaigns: "campaigns",
  campaignBriefs: "campaign_briefs",
  campaignAssets: "campaign_assets",
  submissions: "campaign_submissions",
  rateCards: "rate_cards",
  rateCardPackages: "rate_card_packages",
  orders: "orders",
  messages: "messages",
  payments: "payments",
} as const;

// ── mappers ──────────────────────────────────────────────────────────────────

const mapCampaign = (d: Doc): Campaign => ({
  id: str(d.$id),
  umkmId: str(d.umkmId),
  title: str(d.title),
  brief: str(d.description),
  externalAssetUrl: "", // tak ada kolom sumber — aset ada di campaign_assets
  thumbnailUrl: "", // tak ada kolom sumber
  niche: (str(d.category) as CreatorNiche) || "lainnya",
  status: str(d.status) as CampaignStatus,
  creatorQuota: num(d.claimLimit),
  usedQuota: num(d.totalClaims),
  pricePerThousandViews: num(d.rewardPer1000Views),
  totalBudgetEscrow: num(d.budget),
  usedBudget: num(d.spentAmount),
  totalViews: 0, // tak ada kolom — perlu agregasi campaign_submissions
  createdAt: str(d.$createdAt),
  updatedAt: str(d.$updatedAt),
});

const mapSubmission = (d: Doc): CampaignSubmission => ({
  id: str(d.$id),
  campaignId: str(d.campaignId),
  creatorId: str(d.creatorId),
  creatorName: "", // perlu join creator_profiles
  creatorAvatarUrl: "",
  platform: (str(d.platform) as "tiktok" | "instagram") || "tiktok",
  contentUrl: str(d.postUrl),
  actualViews: num(d.views),
  targetViews: 0, // tak ada kolom sumber
  releasedFund: 0, // ditentukan calculate-campaign-reward Function
  validationStatus: str(d.status) as SubmissionStatus,
  fraudStatus: str(d.fraudStatus) as FraudStatus,
  submittedAt: str(d.$createdAt),
});

// CreatorProfile dipetakan di Function `get-creator-directory` — join lintas
// collection tidak bisa dilakukan di klien tanpa kehilangan field.

const mapOrder = (d: Doc): NegotiationOrder => ({
  id: str(d.$id),
  umkmId: str(d.umkmId),
  creatorId: str(d.creatorId),
  creatorName: "", // perlu join creator_profiles
  creatorAvatarUrl: "",
  projectTitle: "", // tak ada kolom sumber (ada di rate_card / offer)
  scope: "",
  finalPrice: num(d.amount),
  deadline: "", // tak ada kolom sumber
  status: str(d.status) as OrderStatus,
  lastMessage: "", // perlu query messages terakhir
  lastMessageAt: str(d.createdAt) || str(d.$createdAt),
  unreadCount: 0,
});

const mapTransaction = (d: Doc): Transaction => {
  const campaignId = str(d.campaign_id);
  return {
    id: str(d.$id),
    userId: str(d.user_id),
    referenceId: campaignId || str(d.order_id),
    referenceType: campaignId ? "campaign" : "rate_card",
    amount: num(d.amount),
    type: str(d.purpose) as TransactionType,
    status: str(d.status) as TransactionStatus,
    description: str(d.purpose),
    midtransOrderId: str(d.gateway_reference) || undefined,
    createdAt: str(d.paid_at) || str(d.$createdAt),
  };
};

// ── KOMPOSIT via Function DTO ────────────────────────────────────────────────
//
// Function menegakkan kepemilikan sendiri lewat header `x-appwrite-user-id`
// (sesi aktif), jadi userId TIDAK pernah dikirim dari klien — tidak bisa dipalsukan.

/** Join `users` + `umkm_profiles` + akun Auth → Function `get-umkm-profile`. */
export async function getUmkmProfileFromAppwrite(): Promise<ServiceResult<UmkmProfile>> {
  try {
    const data = await executeFunction<UmkmProfile>(FUNCTION_IDS.umkmProfile);
    return { success: true, data };
  } catch (err) {
    return failFromError<UmkmProfile>(err, null as unknown as UmkmProfile);
  }
}

/** Agregasi campaigns + campaign_submissions + orders + escrows. */
export async function getDashboardSummaryFromAppwrite(): Promise<ServiceResult<UmkmDashboardSummary>> {
  try {
    const data = await executeFunction<UmkmDashboardSummary>(FUNCTION_IDS.umkmDashboardSummary);
    return { success: true, data };
  } catch (err) {
    return failFromError<UmkmDashboardSummary>(err, null as unknown as UmkmDashboardSummary);
  }
}

/**
 * `get-umkm-finance-summary` mengembalikan finance + escrow sekali jalan supaya
 * halaman Keuangan tidak memicu dua agregasi identik atas data yang sama.
 */
export type UmkmFinanceOverview = {
  finance: UmkmFinanceSummary;
  escrow: EscrowOverview;
};

/**
 * Satu eksekusi Function untuk finance + escrow sekaligus. Halaman Keuangan
 * WAJIB memakai ini; memanggil getFinanceSummary + getEscrowOverview bersamaan
 * akan menjalankan agregasi yang sama dua kali.
 */
export async function getFinanceOverviewFromAppwrite(): Promise<ServiceResult<UmkmFinanceOverview>> {
  try {
    const data = await executeFunction<UmkmFinanceOverview>(FUNCTION_IDS.umkmFinanceSummary);
    return { success: true, data };
  } catch (err) {
    return failFromError<UmkmFinanceOverview>(err, null as unknown as UmkmFinanceOverview);
  }
}

/** Dipakai bila hanya ringkasan finance yang dibutuhkan (tanpa escrow). */
export async function getFinanceSummaryFromAppwrite(): Promise<ServiceResult<UmkmFinanceSummary>> {
  try {
    const data = await executeFunction<UmkmFinanceOverview>(FUNCTION_IDS.umkmFinanceSummary);
    return { success: true, data: data.finance };
  } catch (err) {
    return failFromError<UmkmFinanceSummary>(err, null as unknown as UmkmFinanceSummary);
  }
}

/** Dipakai bila hanya escrow yang dibutuhkan (tanpa ringkasan finance). */
export async function getEscrowOverviewFromAppwrite(): Promise<ServiceResult<EscrowOverview>> {
  try {
    const data = await executeFunction<UmkmFinanceOverview>(FUNCTION_IDS.umkmFinanceSummary);
    return { success: true, data: data.escrow };
  } catch (err) {
    return failFromError<EscrowOverview>(err, null as unknown as EscrowOverview);
  }
}

// ── READS single-collection ──────────────────────────────────────────────────

export async function getCampaignsFromAppwrite(): Promise<ServiceResult<Campaign[]>> {
  const auth = await requireUserId<Campaign[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.campaigns, [
      Query.equal("umkmId", auth.userId),
      Query.orderDesc("$updatedAt"),
      Query.limit(100),
    ]);
    return { success: true, data: res.documents.map((d) => mapCampaign(d as unknown as Doc)) };
  } catch (err) {
    return failFromError<Campaign[]>(err, []);
  }
}

export async function getCampaignByIdFromAppwrite(id: string): Promise<ServiceResult<Campaign>> {
  const auth = await requireUserId<Campaign>(null as unknown as Campaign);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.campaigns, [
      Query.equal("$id", id),
      Query.equal("umkmId", auth.userId),
      Query.limit(1),
    ]);
    const doc = res.documents[0];
    if (!doc) {
      return { success: false, data: null, error: "Campaign tidak ditemukan", code: "not_found" };
    }
    return { success: true, data: mapCampaign(doc as unknown as Doc) };
  } catch (err) {
    return failFromError<Campaign>(err, null as unknown as Campaign);
  }
}

export async function getCampaignSubmissionsFromAppwrite(
  campaignId: string
): Promise<ServiceResult<CampaignSubmission[]>> {
  const auth = await requireUserId<CampaignSubmission[]>([]);
  if (!auth.ok) return auth.result;
  try {
    // Kepemilikan: pastikan campaign milik UMKM ini sebelum membaca submission-nya.
    const owned = await databases.listDocuments(DB, COLLECTIONS.campaigns, [
      Query.equal("$id", campaignId),
      Query.equal("umkmId", auth.userId),
      Query.limit(1),
    ]);
    if (!owned.documents[0]) {
      return { success: false, data: [], error: "Campaign tidak ditemukan", code: "not_found" };
    }
    const res = await databases.listDocuments(DB, COLLECTIONS.submissions, [
      Query.equal("campaignId", campaignId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return { success: true, data: res.documents.map((d) => mapSubmission(d as unknown as Doc)) };
  } catch (err) {
    return failFromError<CampaignSubmission[]>(err, []);
  }
}

export async function getPendingSubmissionsFromAppwrite(): Promise<ServiceResult<CampaignSubmission[]>> {
  const auth = await requireUserId<CampaignSubmission[]>([]);
  if (!auth.ok) return auth.result;
  try {
    // submissions tak punya umkmId → ambil campaign milik UMKM dulu, lalu filter.
    const campaigns = await databases.listDocuments(DB, COLLECTIONS.campaigns, [
      Query.equal("umkmId", auth.userId),
      Query.limit(100),
    ]);
    const campaignIds = campaigns.documents.map((c) => str((c as unknown as Doc).$id));
    if (campaignIds.length === 0) return { success: true, data: [] };

    const res = await databases.listDocuments(DB, COLLECTIONS.submissions, [
      Query.equal("campaignId", campaignIds),
      Query.equal("status", "pending"),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return { success: true, data: res.documents.map((d) => mapSubmission(d as unknown as Doc)) };
  } catch (err) {
    return failFromError<CampaignSubmission[]>(err, []);
  }
}

/**
 * Direktori kreator via Function `get-creator-directory`.
 *
 * Query langsung ke `creator_profiles` tidak dipakai lagi: username,
 * engagementRate (creator_social_accounts) dan startingPrice (rate_cards →
 * rate_card_packages termurah) butuh join lintas collection.
 *
 * `id` yang dikembalikan adalah `userId`, BUKAN `$id` dokumen profil — itu kunci
 * yang dipakai orders.creatorId, rate_cards.creatorId dan wallets.userId.
 */
export async function getCreatorsFromAppwrite(): Promise<ServiceResult<CreatorProfile[]>> {
  try {
    const data = await executeFunction<CreatorProfile[]>(FUNCTION_IDS.creatorDirectory);
    return { success: true, data };
  } catch (err) {
    return failFromError<CreatorProfile[]>(err, []);
  }
}

export async function getCreatorByIdFromAppwrite(id: string): Promise<ServiceResult<CreatorProfile>> {
  try {
    const data = await executeFunction<CreatorProfile>(FUNCTION_IDS.creatorDirectory, { creatorId: id });
    return { success: true, data };
  } catch (err) {
    if (err instanceof FunctionExecutionError && err.code === "not_found") {
      return { success: false, data: null, error: "Kreator tidak ditemukan", code: "not_found" };
    }
    return failFromError<CreatorProfile>(err, null as unknown as CreatorProfile);
  }
}

export async function getCreatorRateCardsFromAppwrite(
  creatorId: string
): Promise<ServiceResult<RateCardPackage[]>> {
  const auth = await requireUserId<RateCardPackage[]>([]);
  if (!auth.ok) return auth.result;
  try {
    // creatorId & status ada di parent `rate_cards`; paket ada di `rate_card_packages`.
    const cards = await databases.listDocuments(DB, COLLECTIONS.rateCards, [
      Query.equal("creatorId", creatorId),
      Query.equal("status", "published"),
      Query.limit(100),
    ]);
    if (cards.documents.length === 0) return { success: true, data: [] };

    // Peta rateCardId → status parent, untuk RateCardPackage.status.
    const statusByCard = new Map<string, RateCardStatus>();
    for (const c of cards.documents) {
      const cd = c as unknown as Doc;
      statusByCard.set(str(cd.$id), str(cd.status) as RateCardStatus);
    }
    const cardIds = Array.from(statusByCard.keys());

    const packages = await databases.listDocuments(DB, COLLECTIONS.rateCardPackages, [
      Query.equal("rateCardId", cardIds),
      Query.limit(100),
    ]);
    const data: RateCardPackage[] = packages.documents.map((p) => {
      const pd = p as unknown as Doc;
      const rateCardId = str(pd.rateCardId);
      return {
        id: str(pd.$id),
        creatorId,
        name: str(pd.name),
        description: str(pd.description),
        price: num(pd.price),
        deliverable: str(pd.output),
        estimatedDays: num(pd.deliveryDays),
        status: statusByCard.get(rateCardId) ?? "published",
      };
    });
    return { success: true, data };
  } catch (err) {
    return failFromError<RateCardPackage[]>(err, []);
  }
}

export async function getNegotiationsFromAppwrite(): Promise<ServiceResult<NegotiationOrder[]>> {
  const auth = await requireUserId<NegotiationOrder[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.orders, [
      Query.equal("umkmId", auth.userId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return { success: true, data: res.documents.map((d) => mapOrder(d as unknown as Doc)) };
  } catch (err) {
    return failFromError<NegotiationOrder[]>(err, []);
  }
}

export async function getNegotiationByIdFromAppwrite(id: string): Promise<ServiceResult<NegotiationOrder>> {
  const auth = await requireUserId<NegotiationOrder>(null as unknown as NegotiationOrder);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.orders, [
      Query.equal("$id", id),
      Query.equal("umkmId", auth.userId),
      Query.limit(1),
    ]);
    const doc = res.documents[0];
    if (!doc) {
      return { success: false, data: null, error: "Negosiasi tidak ditemukan", code: "not_found" };
    }
    return { success: true, data: mapOrder(doc as unknown as Doc) };
  } catch (err) {
    return failFromError<NegotiationOrder>(err, null as unknown as NegotiationOrder);
  }
}

export async function getMessagesByOrderIdFromAppwrite(orderId: string): Promise<ServiceResult<ChatMessage[]>> {
  const auth = await requireUserId<ChatMessage[]>([]);
  if (!auth.ok) return auth.result;
  try {
    // Catatan: `messages` di-key oleh conversation_id. Diasumsikan caller mengirim
    // conversation_id order terkait. senderRole diturunkan via perbandingan sesi.
    const res = await databases.listDocuments(DB, COLLECTIONS.messages, [
      Query.equal("conversation_id", orderId),
      Query.orderAsc("$createdAt"),
      Query.limit(200),
    ]);
    const data: ChatMessage[] = res.documents.map((m) => {
      const md = m as unknown as Doc;
      const senderId = str(md.sender_id);
      return {
        id: str(md.$id),
        orderId,
        senderId,
        senderRole: senderId === auth.userId ? "umkm" : "creator",
        type: str(md.message_type) as MessageType,
        content: str(md.content),
        isRead: str(md.read_at) !== "",
        createdAt: str(md.$createdAt),
      };
    });
    return { success: true, data };
  } catch (err) {
    return failFromError<ChatMessage[]>(err, []);
  }
}

export async function getTransactionsFromAppwrite(): Promise<ServiceResult<Transaction[]>> {
  const auth = await requireUserId<Transaction[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.payments, [
      Query.equal("user_id", auth.userId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return { success: true, data: res.documents.map((d) => mapTransaction(d as unknown as Doc)) };
  } catch (err) {
    return failFromError<Transaction[]>(err, []);
  }
}

export async function getTransactionByIdFromAppwrite(id: string): Promise<ServiceResult<Transaction>> {
  const auth = await requireUserId<Transaction>(null as unknown as Transaction);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.payments, [
      Query.equal("$id", id),
      Query.equal("user_id", auth.userId),
      Query.limit(1),
    ]);
    const doc = res.documents[0];
    if (!doc) {
      return { success: false, data: null, error: "Transaksi tidak ditemukan", code: "not_found" };
    }
    return { success: true, data: mapTransaction(doc as unknown as Doc) };
  } catch (err) {
    return failFromError<Transaction>(err, null as unknown as Transaction);
  }
}

// ── writes (Sprint 3) ────────────────────────────────────────────────────────

export type CreateCampaignDraftInput = {
  title: string;
  category: string;
  type: CampaignType;
  description: string;
  budget: number;
  rewardPer1000Views: number;
  claimLimit: number;
  submissionDays?: number;
  /** Brief sudah dikomposisi klien (composeBriefDetail/packDoAndDontJson). */
  brief?: {
    briefDetail: string;
    contentAngle: string;
    cta: string;
    objective?: string;
    doAndDont?: string;
    generatedByAi?: boolean;
  };
  asset?: { fileUrl: string; fileName?: string };
};

export type CampaignDraftResult = {
  campaign: Campaign;
  /** false bila brief/asset gagal ditulis — campaign-nya tetap ada & bisa diedit. */
  complete: boolean;
  warnings: string[];
};

/**
 * Tulis campaign draft (status "draft") + campaign_briefs + campaign_assets.
 * TANPA transaction — SDK 25 mendukungnya tapi belum teruji di server ini.
 * Kebijakan gagal: campaign row adalah sumber keberhasilan; brief/asset yang
 * gagal hanya menambah warning, campaign tidak di-rollback (draft tetap ada).
 * Permission baris read(any)/update+delete(owner) — grant delete adalah satu-
 * satunya cara baris ini nanti bisa dihapus (tak ada collection delete("users")).
 */
export async function createCampaignDraftInAppwrite(
  input: CreateCampaignDraftInput
): Promise<ServiceResult<CampaignDraftResult>> {
  const empty = null as unknown as CampaignDraftResult;
  const auth = await requireUserId<CampaignDraftResult>(empty);
  if (!auth.ok) return auth.result;
  const uid = auth.userId;
  const perms = [
    Permission.read(Role.any()),
    Permission.update(Role.user(uid)),
    Permission.delete(Role.user(uid)),
  ];

  let campaignDoc: Doc;
  try {
    campaignDoc = (await databases.createDocument(
      DB,
      COLLECTIONS.campaigns,
      ID.unique(),
      {
        umkmId: uid,
        title: input.title.trim(),
        category: input.category,
        type: input.type,
        platforms: ["tiktok"],
        description: input.description.trim(),
        budget: input.budget,
        rewardPer1000Views: input.rewardPer1000Views,
        status: "draft",
        claimLimit: input.claimLimit,
        submissionDays: input.submissionDays ?? 7,
        totalClaims: 0,
        spentAmount: 0,
        remainingBudget: 0,
      },
      perms
    )) as unknown as Doc;
  } catch (err) {
    return failFromWriteError<CampaignDraftResult>(err, empty);
  }

  const warnings: string[] = [];
  const campaignId = str(campaignDoc.$id);

  if (input.brief) {
    try {
      await databases.createDocument(
        DB,
        COLLECTIONS.campaignBriefs,
        ID.unique(),
        {
          campaignId,
          objective: input.brief.objective ?? "",
          contentAngle: input.brief.contentAngle,
          cta: input.brief.cta,
          briefDetail: input.brief.briefDetail,
          doAndDont: input.brief.doAndDont ?? "",
          generatedByAi: input.brief.generatedByAi ?? false,
        },
        perms
      );
    } catch {
      warnings.push("Brief belum tersimpan — buka draft untuk melengkapi.");
    }
  }

  if (input.asset) {
    try {
      await databases.createDocument(
        DB,
        COLLECTIONS.campaignAssets,
        ID.unique(),
        {
          campaignId,
          source: "external",
          type: "link",
          fileUrl: input.asset.fileUrl,
          fileName: input.asset.fileName ?? "Folder Aset Eksternal",
        },
        perms
      );
    } catch {
      warnings.push("Tautan aset belum tersimpan — buka draft untuk melengkapi.");
    }
  }

  return ok<CampaignDraftResult>({
    campaign: mapCampaign(campaignDoc),
    complete: warnings.length === 0,
    warnings,
  });
}

/**
 * Ubah status campaign (jeda/aktifkan). Baca ownership-filtered dulu sebagai
 * defence in depth — collection update("users") terlalu longgar (temuan handoff).
 */
export async function updateCampaignStatusInAppwrite(
  campaignId: string,
  next: "paused" | "active"
): Promise<ServiceResult<Campaign>> {
  const empty = null as unknown as Campaign;
  const auth = await requireUserId<Campaign>(empty);
  if (!auth.ok) return auth.result;
  try {
    const res = await databases.listDocuments(DB, COLLECTIONS.campaigns, [
      Query.equal("$id", campaignId),
      Query.equal("umkmId", auth.userId),
      Query.limit(1),
    ]);
    const doc = res.documents[0] as unknown as Doc | undefined;
    if (!doc) return fail("Campaign tidak ditemukan.", "not_found", empty);

    const current = str(doc.status);
    if (next === "paused" && current !== "active") {
      return failValidation("Hanya campaign aktif yang bisa dijeda.", empty);
    }
    if (next === "active" && current !== "paused") {
      return failValidation("Hanya campaign terjeda yang bisa diaktifkan kembali.", empty);
    }

    const updated = await databases.updateDocument(DB, COLLECTIONS.campaigns, campaignId, {
      status: next,
    });
    return ok(mapCampaign(updated as unknown as Doc));
  } catch (err) {
    return failFromWriteError<Campaign>(err, empty);
  }
}

export type DuplicateCampaignOptions = {
  copyBrief: boolean;
  copyBudget: boolean;
  copyAssets: boolean;
};

/**
 * Duplikasi campaign lewat createCampaignDraftInAppwrite (satu jalur create).
 * Baca sumber ownership-filtered + brief/asset opsional sesuai options.
 */
export async function duplicateCampaignInAppwrite(
  sourceId: string,
  newTitle: string,
  options: DuplicateCampaignOptions
): Promise<ServiceResult<CampaignDraftResult>> {
  const empty = null as unknown as CampaignDraftResult;
  const auth = await requireUserId<CampaignDraftResult>(empty);
  if (!auth.ok) return auth.result;
  try {
    const srcRes = await databases.listDocuments(DB, COLLECTIONS.campaigns, [
      Query.equal("$id", sourceId),
      Query.equal("umkmId", auth.userId),
      Query.limit(1),
    ]);
    const src = srcRes.documents[0] as unknown as Doc | undefined;
    if (!src) return fail("Campaign sumber tidak ditemukan.", "not_found", empty);

    let brief: CreateCampaignDraftInput["brief"];
    if (options.copyBrief) {
      const bRes = await databases.listDocuments(DB, COLLECTIONS.campaignBriefs, [
        Query.equal("campaignId", sourceId),
        Query.limit(1),
      ]);
      const b = bRes.documents[0] as unknown as Doc | undefined;
      if (b) {
        brief = {
          briefDetail: str(b.briefDetail),
          contentAngle: str(b.contentAngle),
          cta: str(b.cta),
          objective: str(b.objective),
          doAndDont: str(b.doAndDont),
          generatedByAi: Boolean(b.generatedByAi),
        };
      }
    }

    let asset: CreateCampaignDraftInput["asset"];
    if (options.copyAssets) {
      const aRes = await databases.listDocuments(DB, COLLECTIONS.campaignAssets, [
        Query.equal("campaignId", sourceId),
        Query.limit(1),
      ]);
      const a = aRes.documents[0] as unknown as Doc | undefined;
      if (a) asset = { fileUrl: str(a.fileUrl), fileName: str(a.fileName) || undefined };
    }

    return createCampaignDraftInAppwrite({
      title: newTitle,
      category: str(src.category),
      type: (str(src.type) as CampaignType) || "ugc",
      description: str(src.description),
      budget: options.copyBudget ? num(src.budget) : MINIMUM_CAMPAIGN_BUDGET,
      rewardPer1000Views: num(src.rewardPer1000Views),
      claimLimit: num(src.claimLimit),
      submissionDays: num(src.submissionDays) || 7,
      brief,
      asset,
    });
  } catch (err) {
    return failFromWriteError<CampaignDraftResult>(err, empty);
  }
}
