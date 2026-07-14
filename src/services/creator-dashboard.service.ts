import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { mockDelay } from "@/lib/mock-delay";
import {
  ServiceResult,
  CreatorProfile,
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
  mockCreatorMetrics,
  mockCreatorJobs,
  mockCreatorActiveWorks,
  mockCreatorSubmissions,
  mockCreatorNegotiations,
  mockCreatorRateCardPackages,
  mockCreatorTransactions,
  mockCreatorActivities,
} from "@/mocks/creator-dashboard.mock";

export async function getCreatorProfile(): Promise<ServiceResult<CreatorProfile>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorProfile };
  }
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
}

export async function getCreatorMetrics(): Promise<ServiceResult<CreatorMetric>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorMetrics };
  }
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
}

export async function getCreatorJobs(): Promise<ServiceResult<CreatorJob[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorJobs };
  }
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
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
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
}

export async function getCreatorActiveWorks(): Promise<ServiceResult<CreatorActiveWork[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorActiveWorks };
  }
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
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
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
}

export async function getCreatorSubmissions(): Promise<ServiceResult<CreatorSubmission[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorSubmissions };
  }
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
}

export async function getCreatorNegotiations(): Promise<ServiceResult<CreatorNegotiation[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorNegotiations };
  }
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
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
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
}

export async function getCreatorRateCardPackages(): Promise<ServiceResult<CreatorRateCardPackage[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorRateCardPackages };
  }
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
}

export async function getCreatorTransactions(): Promise<ServiceResult<CreatorTransaction[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorTransactions };
  }
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
}

export async function getCreatorActivities(): Promise<ServiceResult<CreatorActivity[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: mockCreatorActivities };
  }
  return { success: false, data: null, error: "Appwrite integration not implemented yet" };
}
