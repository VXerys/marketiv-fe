import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { mockDelay } from "@/lib/mock-delay";
import { MINIMUM_CAMPAIGN_BUDGET } from "@/types/domain";
import {
  ServiceResult,
  UmkmProfile,
  UmkmDashboardSummary,
  Campaign,
  CampaignSubmission,
  CreatorProfile,
  RateCardPackage,
  NegotiationOrder,
  ChatMessage,
  Transaction,
  UmkmFinanceSummary,
  EscrowOverview,
  UmkmSettingsProfile,
} from "@/types/umkm-dashboard.types";
import {
  mockUmkmProfile,
  mockCampaigns,
  mockSubmissions,
  mockCreators,
  mockRateCardPackages,
  mockNegotiations,
  mockChatMessages,
  mockTransactions,
  mockUmkmOverview,
  mockUmkmSettingsProfile,
  getCalculatedDashboardSummary,
} from "@/mocks/umkm";
import type { UmkmOverviewData } from "@/mocks/umkm/overview.mock";
import {
  getUmkmProfileFromAppwrite,
  getDashboardSummaryFromAppwrite,
  getCampaignsFromAppwrite,
  getCampaignByIdFromAppwrite,
  getCampaignSubmissionsFromAppwrite,
  getPendingSubmissionsFromAppwrite,
  getCreatorsFromAppwrite,
  getCreatorByIdFromAppwrite,
  getCreatorRateCardsFromAppwrite,
  getNegotiationsFromAppwrite,
  getNegotiationByIdFromAppwrite,
  getMessagesByOrderIdFromAppwrite,
  getTransactionsFromAppwrite,
  getTransactionByIdFromAppwrite,
  getFinanceSummaryFromAppwrite,
  getEscrowOverviewFromAppwrite,
  getFinanceOverviewFromAppwrite,
  createCampaignDraftInAppwrite,
  updateCampaignStatusInAppwrite,
  duplicateCampaignInAppwrite,
  getUmkmSettingsProfileFromAppwrite,
  updateUmkmProfileInAppwrite,
  uploadUmkmLogoInAppwrite,
  generateCampaignBriefFromAppwrite,
  createCampaignPaymentInAppwrite,
} from "./umkm-appwrite.service";
import type {
  UmkmFinanceOverview,
  AiBriefInput,
  AiBrief,
  PaymentIntent,
  CreateCampaignDraftInput,
  CampaignDraftResult,
  DuplicateCampaignOptions,
  UmkmProfileWriteInput,
} from "./umkm-appwrite.service";

export async function getUmkmProfile(): Promise<ServiceResult<UmkmProfile>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockUmkmProfile };
  }
  return getUmkmProfileFromAppwrite();
}

/**
 * View-model kaya untuk halaman Overview (hero, KPI, insights, activities).
 * Mock ON  → mock overview terelokasi. Mock OFF → memerlukan Function DTO
 * `get-umkm-dashboard-summary` (belum ada) — lihat chip task backend.
 */
export async function getOverview(): Promise<ServiceResult<UmkmOverviewData>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockUmkmOverview };
  }
  return {
    success: false,
    data: null,
    error: "Belum tersedia — memerlukan Function DTO backend.",
    code: "unknown",
  };
}

export async function getDashboardSummary(): Promise<ServiceResult<UmkmDashboardSummary>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: getCalculatedDashboardSummary() };
  }
  return getDashboardSummaryFromAppwrite();
}

export async function getCampaigns(): Promise<ServiceResult<Campaign[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCampaigns };
  }
  return getCampaignsFromAppwrite();
}

export async function getCampaignById(id: string): Promise<ServiceResult<Campaign>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const campaign = mockCampaigns.find((c) => c.id === id);
    if (!campaign) {
      return { success: false, data: null, error: "Campaign tidak ditemukan", code: "not_found" };
    }
    return { success: true, data: campaign };
  }
  return getCampaignByIdFromAppwrite(id);
}

export async function getCampaignSubmissions(campaignId: string): Promise<ServiceResult<CampaignSubmission[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const submissions = mockSubmissions.filter((s) => s.campaignId === campaignId);
    return { success: true, data: submissions };
  }
  return getCampaignSubmissionsFromAppwrite(campaignId);
}

export async function getPendingSubmissions(): Promise<ServiceResult<CampaignSubmission[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const submissions = mockSubmissions.filter((s) => s.validationStatus === "pending");
    return { success: true, data: submissions };
  }
  return getPendingSubmissionsFromAppwrite();
}

export async function getCreators(): Promise<ServiceResult<CreatorProfile[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreators };
  }
  return getCreatorsFromAppwrite();
}

export async function getCreatorById(id: string): Promise<ServiceResult<CreatorProfile>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const creator = mockCreators.find((c) => c.id === id);
    if (!creator) {
      return { success: false, data: null, error: "Kreator tidak ditemukan", code: "not_found" };
    }
    return { success: true, data: creator };
  }
  return getCreatorByIdFromAppwrite(id);
}

export async function getCreatorRateCards(creatorId: string): Promise<ServiceResult<RateCardPackage[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const packages = mockRateCardPackages.filter((p) => p.creatorId === creatorId && p.status === "published");
    return { success: true, data: packages };
  }
  return getCreatorRateCardsFromAppwrite(creatorId);
}

export async function getNegotiations(): Promise<ServiceResult<NegotiationOrder[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockNegotiations };
  }
  return getNegotiationsFromAppwrite();
}

export async function getNegotiationById(id: string): Promise<ServiceResult<NegotiationOrder>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const order = mockNegotiations.find((n) => n.id === id);
    if (!order) {
      return { success: false, data: null, error: "Negosiasi tidak ditemukan", code: "not_found" };
    }
    return { success: true, data: order };
  }
  return getNegotiationByIdFromAppwrite(id);
}

export async function getMessagesByOrderId(orderId: string): Promise<ServiceResult<ChatMessage[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const messages = mockChatMessages[orderId] || [];
    return { success: true, data: messages };
  }
  return getMessagesByOrderIdFromAppwrite(orderId);
}

export async function getTransactions(): Promise<ServiceResult<Transaction[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockTransactions };
  }
  return getTransactionsFromAppwrite();
}

export async function getTransactionById(id: string): Promise<ServiceResult<Transaction>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const transaction = mockTransactions.find((tx) => tx.id === id);
    if (!transaction) {
      return { success: false, data: null, error: "Transaksi tidak ditemukan", code: "not_found" };
    }
    return { success: true, data: transaction };
  }
  return getTransactionByIdFromAppwrite(id);
}

export async function getFinanceSummary(): Promise<ServiceResult<UmkmFinanceSummary>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    
    // Total expenses: deposit + fee transactions that are success or escrow
    const totalExpenses = mockTransactions
      .filter((tx) => (tx.status === "paid" || tx.status === "held") && (tx.type === "deposit" || tx.type === "fee"))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const escrowBalance = mockTransactions
      .filter((tx) => tx.status === "held")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const pendingPayments = mockTransactions
      .filter((tx) => tx.status === "pending")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const refundsReceived = mockTransactions
      .filter((tx) => tx.type === "refund" && tx.status === "refunded")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const platformFees = mockTransactions
      .filter((tx) => tx.type === "fee" && tx.status === "paid")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const successfulTransactionsCount = mockTransactions
      .filter((tx) => tx.status === "paid" || tx.status === "held" || tx.status === "refunded")
      .length;

    return {
      success: true,
      data: {
        totalExpenses,
        escrowBalance,
        pendingPayments,
        refundsReceived,
        platformFees,
        successfulTransactionsCount,
      },
    };
  }
  return getFinanceSummaryFromAppwrite();
}

/**
 * Ringkasan keuangan + escrow dalam satu perjalanan.
 *
 * Mock OFF → satu eksekusi Function `get-umkm-finance-summary`. Halaman Keuangan
 * harus memakai ini, bukan getFinanceSummary() + getEscrowOverview() bersamaan,
 * karena keduanya memicu agregasi backend yang sama dua kali.
 */
export async function getFinanceOverview(): Promise<ServiceResult<UmkmFinanceOverview>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    const [financeRes, escrowRes] = await Promise.all([
      getFinanceSummary(),
      getEscrowOverview(),
    ]);
    if (!financeRes.success || !financeRes.data || !escrowRes.success || !escrowRes.data) {
      return {
        success: false,
        data: null,
        error: financeRes.error ?? escrowRes.error ?? "Gagal memuat ringkasan keuangan.",
        code: financeRes.code ?? escrowRes.code ?? "unknown",
      };
    }
    return { success: true, data: { finance: financeRes.data, escrow: escrowRes.data } };
  }
  return getFinanceOverviewFromAppwrite();
}

export async function getEscrowOverview(): Promise<ServiceResult<EscrowOverview>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    
    const activeEscrow = mockTransactions
      .filter((tx) => tx.status === "held")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const campaignEscrow = mockTransactions
      .filter((tx) => tx.status === "held" && tx.referenceType === "campaign")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const rateCardEscrow = mockTransactions
      .filter((tx) => tx.status === "held" && tx.referenceType === "rate_card")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const pendingRelease = rateCardEscrow; // Rate card custom offers pending verification / collab post URL
    const refundEligible = campaignEscrow > 0 ? Math.min(campaignEscrow, 1200000) : 0; // Unused budget of campaign quota

    return {
      success: true,
      data: {
        activeEscrow,
        pendingRelease,
        refundEligible,
        campaignEscrow,
        rateCardEscrow,
      },
    };
  }
  return getEscrowOverviewFromAppwrite();
}

// ── writes (Sprint 3) ────────────────────────────────────────────────────────

export type { CreateCampaignDraftInput, CampaignDraftResult };

/**
 * Buat campaign draft (campaigns + campaign_briefs + campaign_assets).
 * Mock: echo input jadi Campaign dengan id `mock_campaign_*` — TIDAK memutasi
 * mockCampaigns (mutasi module-level di dev server tidak konsisten). Id fabrikasi
 * kini hanya hidup di cabang mock.
 */
export async function createCampaignDraft(
  input: CreateCampaignDraftInput
): Promise<ServiceResult<CampaignDraftResult>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(600);
    const campaign: Campaign = {
      id: `mock_campaign_${Date.now()}`,
      umkmId: "mock_umkm",
      title: input.title,
      brief: input.brief?.briefDetail ?? "",
      externalAssetUrl: input.asset?.fileUrl ?? "",
      thumbnailUrl: "",
      niche: input.category as Campaign["niche"],
      status: "draft",
      creatorQuota: input.claimLimit,
      usedQuota: 0,
      pricePerThousandViews: input.rewardPer1000Views,
      totalBudgetEscrow: input.budget,
      usedBudget: 0,
      totalViews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, data: { campaign, complete: true, warnings: [] } };
  }
  return createCampaignDraftInAppwrite(input);
}

export type { DuplicateCampaignOptions };

/** Jeda / aktifkan kembali campaign. Mock meniru validasi status yang sama. */
export async function updateCampaignStatus(
  campaignId: string,
  next: "paused" | "active"
): Promise<ServiceResult<Campaign>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(400);
    const c = mockCampaigns.find((x) => x.id === campaignId);
    if (!c) return { success: false, data: null, error: "Campaign tidak ditemukan.", code: "not_found" };
    if (next === "paused" && c.status !== "active") {
      return { success: false, data: null, error: "Hanya campaign aktif yang bisa dijeda.", code: "validation" };
    }
    if (next === "active" && c.status !== "paused") {
      return { success: false, data: null, error: "Hanya campaign terjeda yang bisa diaktifkan kembali.", code: "validation" };
    }
    return { success: true, data: { ...c, status: next } };
  }
  return updateCampaignStatusInAppwrite(campaignId, next);
}

/** Duplikasi campaign jadi draft baru. Mock echo dari mockCampaigns. */
export async function duplicateCampaign(
  sourceId: string,
  newTitle: string,
  options: DuplicateCampaignOptions
): Promise<ServiceResult<CampaignDraftResult>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(600);
    const src = mockCampaigns.find((x) => x.id === sourceId);
    if (!src) return { success: false, data: null, error: "Campaign sumber tidak ditemukan.", code: "not_found" };
    const campaign: Campaign = {
      ...src,
      id: `mock_campaign_${Date.now()}`,
      title: newTitle,
      status: "draft",
      totalBudgetEscrow: options.copyBudget ? src.totalBudgetEscrow : MINIMUM_CAMPAIGN_BUDGET,
      usedQuota: 0,
      usedBudget: 0,
      totalViews: 0,
      externalAssetUrl: options.copyAssets ? src.externalAssetUrl : "",
      brief: options.copyBrief ? src.brief : "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, data: { campaign, complete: true, warnings: [] } };
  }
  return duplicateCampaignInAppwrite(sourceId, newTitle, options);
}

// ── profil UMKM / pengaturan (Sprint 3) ──────────────────────────────────────

export type { UmkmProfileWriteInput };

export async function getUmkmSettingsProfile(): Promise<ServiceResult<UmkmSettingsProfile>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockUmkmSettingsProfile };
  }
  return getUmkmSettingsProfileFromAppwrite();
}

export async function updateUmkmProfile(
  input: UmkmProfileWriteInput
): Promise<ServiceResult<UmkmSettingsProfile>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(500);
    return {
      success: true,
      data: { ...mockUmkmSettingsProfile, ...(input as Partial<UmkmSettingsProfile>) },
    };
  }
  return updateUmkmProfileInAppwrite(input);
}

export async function uploadUmkmLogo(file: File): Promise<ServiceResult<string>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(700);
    return { success: true, data: `https://placehold.co/128x128?text=${encodeURIComponent(file.name.slice(0, 8))}` };
  }
  return uploadUmkmLogoInAppwrite(file);
}

// ── AI brief (Sprint 3) ──────────────────────────────────────────────────────

export type { AiBriefInput, AiBrief };

/**
 * Mock mengembalikan brief tetap setelah delay supaya UX loading/confirm/error
 * bisa diuji di browser hari ini — Function-nya sendiri masih kena blocker
 * APPWRITE_FUNCTION_API_KEY. Ini tempat yang jujur untuk contoh brief lama.
 */
export async function generateCampaignBrief(
  input: AiBriefInput
): Promise<ServiceResult<AiBrief>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(1400);
    return {
      success: true,
      data: {
        objective: `Meningkatkan awareness ${input.productName ?? "produk"} di kalangan pengguna TikTok.`,
        contentAngle: "Daily vlog santai menikmati produk di sore hari.",
        cta: input.goal ?? "Kunjungi toko",
        briefDetail: [
          "Konsep Video:",
          "Daily vlog santai saat menikmati produk.",
          "",
          "Panduan Produksi:",
          "- Tunjukkan kemasan produk dengan jelas di awal video.",
          "- Ambil close-up detail tekstur dan penyajian produk.",
          "- Perlihatkan reaksi jujur saat mencoba produk.",
          "- Tutup video dengan mengarahkan penonton ke tautan di bio.",
        ].join("\n"),
        doAndDont: {
          do: [
            "Wajib menunjukkan kemasan di awal video",
            "Wajib memperlihatkan reaksi saat mencoba produk",
          ],
          dont: ["membandingkan produk dengan kompetitor", "menggunakan musik berhak cipta"],
        },
      },
    };
  }
  return generateCampaignBriefFromAppwrite(input);
}

// ── pembayaran campaign (Sprint 3 / 6b) ──────────────────────────────────────

export type { PaymentIntent };

/**
 * Mock mengembalikan intent tanpa snapToken/redirectUrl, sehingga modal jatuh ke
 * jalur "berhasil" lokal dan UX mock tidak berubah.
 */
export async function createCampaignPayment(input: {
  campaignId: string;
  budget: number;
}): Promise<ServiceResult<PaymentIntent>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(800);
    return {
      success: true,
      data: {
        paymentId: `mock_pay_${Date.now()}`,
        gateway: "midtrans",
        status: "pending",
      },
    };
  }
  return createCampaignPaymentInAppwrite(input);
}
