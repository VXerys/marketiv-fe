import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { mockDelay } from "@/lib/mock-delay";
import {
  ServiceResult,
  CreatorProfile,
  CreatorPortfolioItem,
  CreatorMetric,
  CreatorJob,
  CreatorActiveWork,
  CreatorSubmission,
  CreatorNegotiation,
  CreatorRateCardPackage,
  CreatorTransaction,
  CreatorActivity,
} from "@/types/creator-dashboard";
import {
  mockCreatorProfile,
  mockCreatorPortfolioItems,
  mockCreatorMetrics,
  mockCreatorJobs,
  mockCreatorActiveWorks,
  mockCreatorSubmissions,
  mockCreatorNegotiations,
  mockCreatorRateCardPackages,
  mockCreatorTransactions,
  mockCreatorActivities,
} from "@/mocks/creator-dashboard.mock";
import {
  getCreatorProfileFromAppwrite,
  getCreatorPortfolioFromAppwrite,
  getCreatorMetricsFromAppwrite,
  getCreatorJobsFromAppwrite,
  getCreatorJobByIdFromAppwrite,
  getCreatorActiveWorksFromAppwrite,
  getCreatorActiveWorkByIdFromAppwrite,
  getCreatorSubmissionsFromAppwrite,
  getCreatorNegotiationsFromAppwrite,
  getCreatorNegotiationByIdFromAppwrite,
  getCreatorRateCardPackagesFromAppwrite,
  getCreatorTransactionsFromAppwrite,
  getCreatorActivitiesFromAppwrite,
  createCreatorRateCardPackageInAppwrite,
  updateCreatorRateCardPackageInAppwrite,
  setCreatorRateCardPackageStatusInAppwrite,
  deleteCreatorRateCardPackageInAppwrite,
  updateCreatorProfileInAppwrite,
  uploadCreatorAvatarInAppwrite,
  upsertCreatorSocialAccountInAppwrite,
  createCreatorPortfolioInAppwrite,
  updateCreatorPortfolioInAppwrite,
  deleteCreatorPortfolioInAppwrite,
  uploadCreatorPortfolioThumbnailInAppwrite,
  requestWithdrawalInAppwrite,
  unclaimCampaignInAppwrite,
  claimCampaignInAppwrite,
  submitProofInAppwrite,
} from "./creator-appwrite.service";
import type {
  RateCardPackageWriteInput,
  CreatorProfileWriteInput,
  CreatorPortfolioWriteInput,
  WithdrawRequestInput,
  WithdrawalReceipt,
  SubmitProofInput,
} from "./creator-appwrite.service";
import type { RateCardStatus } from "@/types/domain";

export async function getCreatorProfile(): Promise<ServiceResult<CreatorProfile>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorProfile };
  }
  return getCreatorProfileFromAppwrite();
}

export async function getCreatorPortfolio(): Promise<ServiceResult<CreatorPortfolioItem[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorPortfolioItems };
  }
  return getCreatorPortfolioFromAppwrite();
}

export async function getCreatorMetrics(): Promise<ServiceResult<CreatorMetric>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorMetrics };
  }
  return getCreatorMetricsFromAppwrite();
}

export async function getCreatorJobs(): Promise<ServiceResult<CreatorJob[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorJobs };
  }
  return getCreatorJobsFromAppwrite();
}

export async function getCreatorJobById(id: string): Promise<ServiceResult<CreatorJob>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const job = mockCreatorJobs.find((j) => j.id === id);
    if (!job) {
      return { success: false, data: null, error: "Job tidak ditemukan" };
    }
    return { success: true, data: job };
  }
  return getCreatorJobByIdFromAppwrite(id);
}

export async function getCreatorActiveWorks(): Promise<ServiceResult<CreatorActiveWork[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorActiveWorks };
  }
  return getCreatorActiveWorksFromAppwrite();
}

export async function getCreatorActiveWorkById(id: string): Promise<ServiceResult<CreatorActiveWork>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const work = mockCreatorActiveWorks.find((w) => w.id === id);
    if (!work) {
      return { success: false, data: null, error: "Pekerjaan tidak ditemukan" };
    }
    return { success: true, data: work };
  }
  return getCreatorActiveWorkByIdFromAppwrite(id);
}

export async function getCreatorSubmissions(): Promise<ServiceResult<CreatorSubmission[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorSubmissions };
  }
  return getCreatorSubmissionsFromAppwrite();
}

export async function getCreatorNegotiations(): Promise<ServiceResult<CreatorNegotiation[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorNegotiations };
  }
  return getCreatorNegotiationsFromAppwrite();
}

export async function getCreatorNegotiationById(id: string): Promise<ServiceResult<CreatorNegotiation>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    const order = mockCreatorNegotiations.find((n) => n.id === id);
    if (!order) {
      return { success: false, data: null, error: "Negosiasi tidak ditemukan" };
    }
    return { success: true, data: order };
  }
  return getCreatorNegotiationByIdFromAppwrite(id);
}

export async function getCreatorRateCardPackages(): Promise<ServiceResult<CreatorRateCardPackage[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorRateCardPackages };
  }
  return getCreatorRateCardPackagesFromAppwrite();
}

export async function getCreatorTransactions(): Promise<ServiceResult<CreatorTransaction[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorTransactions };
  }
  return getCreatorTransactionsFromAppwrite();
}

export async function getCreatorActivities(): Promise<ServiceResult<CreatorActivity[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorActivities };
  }
  return getCreatorActivitiesFromAppwrite();
}

// ── rate card CRUD (Sprint 3) ─────────────────────────────────────────────────

export type { RateCardPackageWriteInput };

function mockRcEcho(
  input: RateCardPackageWriteInput,
  ids?: { id: string; rateCardId: string }
): CreatorRateCardPackage {
  return {
    id: ids?.id ?? `mock_pkg_${Date.now()}`,
    rateCardId: ids?.rateCardId ?? `mock_rc_${Date.now()}`,
    name: input.name,
    description: input.description,
    price: input.price,
    deliverable: input.output,
    estimatedDays: input.deliveryDays,
    status: input.published ? "published" : "draft",
    revisionCount: input.revisionLimit,
  };
}

export async function createRateCardPackage(
  input: RateCardPackageWriteInput
): Promise<ServiceResult<CreatorRateCardPackage>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(500);
    return { success: true, data: mockRcEcho(input) };
  }
  return createCreatorRateCardPackageInAppwrite(input);
}

export async function updateRateCardPackage(
  pkg: { id: string; rateCardId: string },
  input: RateCardPackageWriteInput
): Promise<ServiceResult<CreatorRateCardPackage>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(500);
    return { success: true, data: mockRcEcho(input, pkg) };
  }
  return updateCreatorRateCardPackageInAppwrite(pkg, input);
}

export async function setRateCardPackageStatus(
  pkg: { id: string; rateCardId: string; base: CreatorRateCardPackage },
  status: RateCardStatus
): Promise<ServiceResult<CreatorRateCardPackage>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(400);
    return { success: true, data: { ...pkg.base, status } };
  }
  return setCreatorRateCardPackageStatusInAppwrite({ id: pkg.id, rateCardId: pkg.rateCardId }, status);
}

export async function deleteRateCardPackage(pkg: {
  id: string;
  rateCardId: string;
}): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(400);
    return { success: true, data: null };
  }
  return deleteCreatorRateCardPackageInAppwrite(pkg);
}

// ── profil / sosial / portofolio kreator (Sprint 3) ──────────────────────────

export type { CreatorProfileWriteInput, CreatorPortfolioWriteInput };

export async function updateCreatorProfile(
  input: CreatorProfileWriteInput
): Promise<ServiceResult<CreatorProfile>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(500);
    return {
      success: true,
      data: {
        ...mockCreatorProfile,
        name: (input.displayName as string) ?? mockCreatorProfile.name,
        bio: (input.bio as string) ?? mockCreatorProfile.bio,
        location: (input.city as string) ?? mockCreatorProfile.location,
        niche: (input.niche as CreatorProfile["niche"]) ?? mockCreatorProfile.niche,
        avatarUrl: (input.avatarUrl as string) ?? mockCreatorProfile.avatarUrl,
      },
    };
  }
  return updateCreatorProfileInAppwrite(input);
}

export async function uploadCreatorAvatar(file: File): Promise<ServiceResult<string>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(700);
    return {
      success: true,
      data: `https://placehold.co/160x160?text=${encodeURIComponent(file.name.slice(0, 8))}`,
    };
  }
  return uploadCreatorAvatarInAppwrite(file);
}

export async function upsertCreatorSocialAccount(input: {
  platform: "tiktok" | "instagram";
  username: string;
}): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(400);
    return { success: true, data: null };
  }
  return upsertCreatorSocialAccountInAppwrite(input);
}

export async function createCreatorPortfolio(
  input: CreatorPortfolioWriteInput
): Promise<ServiceResult<CreatorPortfolioItem>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(500);
    return {
      success: true,
      data: {
        id: `mock_port_${Date.now()}`,
        title: input.title,
        url: input.portfolioUrl,
        description: input.description ?? "",
        thumbnailUrl: input.thumbnailUrl || undefined,
      },
    };
  }
  return createCreatorPortfolioInAppwrite(input);
}

export async function updateCreatorPortfolio(
  id: string,
  input: CreatorPortfolioWriteInput
): Promise<ServiceResult<CreatorPortfolioItem>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(500);
    return {
      success: true,
      data: {
        id,
        title: input.title,
        url: input.portfolioUrl,
        description: input.description ?? "",
        thumbnailUrl: input.thumbnailUrl || undefined,
      },
    };
  }
  return updateCreatorPortfolioInAppwrite(id, input);
}

export async function deleteCreatorPortfolio(id: string): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(400);
    return { success: true, data: null };
  }
  return deleteCreatorPortfolioInAppwrite(id);
}

export async function uploadCreatorPortfolioThumbnail(
  file: File
): Promise<ServiceResult<string>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(700);
    return {
      success: true,
      data: `https://placehold.co/320x180?text=${encodeURIComponent(file.name.slice(0, 10))}`,
    };
  }
  return uploadCreatorPortfolioThumbnailInAppwrite(file);
}

// ── penarikan saldo (Sprint 3) ───────────────────────────────────────────────

export type { WithdrawRequestInput, WithdrawalReceipt };

/**
 * Pra-validasi Zod dilakukan di pemanggil (KeuanganView) SEBELUM sampai sini —
 * feedback instan, satu eksekusi Function lebih sedikit, dan satu-satunya sumber
 * `code: "validation"` yang andal di klien.
 */
export async function requestWithdrawal(
  input: WithdrawRequestInput
): Promise<ServiceResult<WithdrawalReceipt>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(900);
    return {
      success: true,
      data: {
        withdrawalId: `mock_wd_${Date.now()}`,
        amount: input.amount,
        status: "processed",
        processedAt: new Date().toISOString(),
        balanceAfter: 0,
        transactionId: `mock_tx_${Date.now()}`,
      },
    };
  }
  return requestWithdrawalInAppwrite(input);
}

// ── Alur A: klaim & kirim bukti (Sprint 4) ───────────────────────────────────

export type { SubmitProofInput };

/**
 * Klaim campaign dari Job Pool. Mengembalikan claimId supaya pemanggil bisa
 * langsung mengarahkan ke halaman pekerjaan aktif.
 *
 * Mock menegakkan guard kuota & duplikat yang sama — dua penolakan yang paling
 * mungkin ditemui pengguna nyata, jadi harus bisa diuji tanpa Appwrite.
 */
export async function claimCampaign(campaignId: string): Promise<ServiceResult<string>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(800);
    const job = mockCreatorJobs.find((j) => j.id === campaignId);
    if (!job) {
      return { success: false, data: "", error: "Campaign tidak ditemukan.", code: "not_found" };
    }
    if (job.usedQuota >= job.quota) {
      return {
        success: false,
        data: "",
        error: "Kuota kreator untuk campaign ini sudah penuh.",
        code: "validation",
      };
    }
    if (mockCreatorActiveWorks.some((w) => w.campaignId === campaignId)) {
      return {
        success: false,
        data: "",
        error: "Kamu sudah pernah mengambil campaign ini.",
        code: "validation",
      };
    }
    return { success: true, data: `mock_claim_${Date.now()}` };
  }
  return claimCampaignInAppwrite(campaignId);
}

/**
 * Kirim bukti konten. `fraudScore`/`fraudStatus` TIDAK langsung tersedia —
 * `ai-fraud-precheck` berjalan asinkron setelah submission dibuat.
 */
export async function submitProof(input: SubmitProofInput): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(900);
    const work = mockCreatorActiveWorks.find((w) => w.id === input.claimId);
    if (!work) {
      return { success: false, data: null, error: "Pekerjaan tidak ditemukan.", code: "not_found" };
    }
    if (work.status !== "claimed") {
      return {
        success: false,
        data: null,
        error: "Bukti untuk pekerjaan ini sudah pernah dikirim.",
        code: "validation",
      };
    }
    return { success: true, data: null };
  }
  return submitProofInAppwrite(input);
}

// ── batalkan claim (Sprint 3.5) ──────────────────────────────────────────────

/**
 * Batalkan pekerjaan yang belum dikirim — baris claim dihapus, slot campaign
 * kembali terbuka, dan kreator boleh mengambilnya lagi nanti (resolusi T-1).
 */
export async function unclaimCampaign(claimId: string): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(500);
    const work = mockCreatorActiveWorks.find((w) => w.id === claimId);
    if (!work) {
      return { success: false, data: null, error: "Pekerjaan tidak ditemukan.", code: "not_found" };
    }
    if (work.status !== "claimed") {
      return {
        success: false,
        data: null,
        error: "Hanya pekerjaan yang belum dikirim yang bisa dibatalkan.",
        code: "validation",
      };
    }
    return { success: true, data: null };
  }
  return unclaimCampaignInAppwrite(claimId);
}
