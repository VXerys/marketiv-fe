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
} from "./creator-appwrite.service";
import type { RateCardPackageWriteInput } from "./creator-appwrite.service";
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
