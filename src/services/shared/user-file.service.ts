import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { mockDelay } from "@/lib/mock-delay";
import type { ServiceResult } from "@/types/domain";
import {
  uploadUserFileInAppwrite,
  MAX_USER_FILE_BYTES,
} from "./user-file-appwrite.service";

/**
 * Facade File Manager — dipakai kedua dashboard.
 *
 * MOCK MEMAKAI `URL.createObjectURL`, bukan URL karangan. Tautan blob itu benar
 * bisa dibuka di tab pengunggah selama sesi berjalan, jadi alurnya bisa dicoba
 * tanpa berpura-pura ada berkas di server yang sebenarnya tidak ada.
 */

export { MAX_USER_FILE_BYTES };

export type UploadedUserFile = {
  fileId: string;
  fileUrl: string;
  fileName: string;
};

export async function uploadUserFile(input: {
  file: File;
  /** Pihak lawan pada order ini ikut diberi izin baca. */
  shareWithOrderId?: string;
}): Promise<ServiceResult<UploadedUserFile>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(800);
    return {
      success: true,
      data: {
        fileId: `file_mock_${Date.now()}`,
        fileUrl: URL.createObjectURL(input.file),
        fileName: input.file.name,
      },
    };
  }
  return uploadUserFileInAppwrite(input);
}
