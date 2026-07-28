import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { mockDelay } from "@/lib/mock-delay";
import type { ServiceResult } from "@/types/domain";
import type { Deliverable, Revision } from "@/types/umkm-dashboard.types";
import type {
  UploadDeliverableInput,
  RequestRevisionInput,
} from "@/lib/validations/deliverable.schema";
import {
  getDeliverablesInAppwrite,
  getRevisionsInAppwrite,
  uploadDeliverableInAppwrite,
  approveDeliverableInAppwrite,
  requestRevisionInAppwrite,
} from "./deliverable-appwrite.service";

/**
 * Facade deliverable & revisi — satu untuk UMKM dan Kreator.
 *
 * Pasangan dari src/services/{umkm,creator}/*-dashboard.service.ts, tapi tidak
 * ditaruh di salah satunya karena dipakai kedua dashboard.
 *
 * MOCK SENGAJA KOSONG, bukan data karangan. Tidak ada satu pun mock order Rate
 * Card yang punya deliverable, dan mengarang bukti kerja beserta versinya akan
 * membuat tombol "Setujui" di mode mock terlihat berfungsi padahal jalur uang di
 * belakangnya tidak pernah diuji. Daftar kosong itu jujur.
 */

export type { UploadDeliverableInput, RequestRevisionInput };

export async function getDeliverables(orderId: string): Promise<ServiceResult<Deliverable[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: [] };
  }
  return getDeliverablesInAppwrite(orderId);
}

export async function getRevisions(orderId: string): Promise<ServiceResult<Revision[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: [] };
  }
  return getRevisionsInAppwrite(orderId);
}

/** Kirim hasil kerja. Kreator-only; setiap kiriman jadi versi baru. */
export async function uploadDeliverable(
  input: UploadDeliverableInput
): Promise<ServiceResult<Deliverable>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(600);
    return {
      success: true,
      data: {
        id: `dlv_mock_${Date.now()}`,
        orderId: input.orderId,
        source: input.source,
        fileUrl: input.fileUrl,
        notes: input.notes || undefined,
        version: 1,
        status: "submitted",
        createdAt: new Date().toISOString(),
      },
    };
  }
  return uploadDeliverableInAppwrite(input);
}

/**
 * Setujui deliverable. UMKM-only.
 *
 * ⚠️ Memicu `release-escrow` — dana escrow pindah ke wallet kreator dikurangi
 * fee 2%. Efeknya ASINKRON lewat event database; jangan anggap ordernya langsung
 * `completed`.
 */
export async function approveDeliverable(
  orderId: string,
  deliverableId: string
): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(600);
    return { success: true, data: null };
  }
  return approveDeliverableInAppwrite(orderId, deliverableId);
}

/** Minta revisi. UMKM-only; dibatasi `offers.revisionLimit`. */
export async function requestRevision(
  input: RequestRevisionInput
): Promise<ServiceResult<Revision>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(600);
    return {
      success: true,
      data: {
        id: `rev_mock_${Date.now()}`,
        orderId: input.orderId,
        requestedBy: "umkm_001",
        message: input.message,
        status: "open",
        createdAt: new Date().toISOString(),
      },
    };
  }
  return requestRevisionInAppwrite(input);
}
