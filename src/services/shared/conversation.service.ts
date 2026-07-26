import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { mockDelay } from "@/lib/mock-delay";
import type { ServiceResult } from "@/types/domain";
import {
  getMyConversationsFromAppwrite,
  setConversationArchivedInAppwrite,
  conversationPairKey,
  type ConversationFlag,
} from "./conversation-appwrite.service";

/**
 * Facade arsip percakapan — satu untuk UMKM dan Kreator.
 *
 * Pasangan dari src/services/{umkm,creator}/*-dashboard.service.ts, tapi tidak
 * ditaruh di salah satunya karena dipakai kedua dashboard.
 */

export type { ConversationFlag };
export { conversationPairKey };

/**
 * Mock: tidak ada percakapan yang diarsipkan.
 *
 * Sengaja daftar kosong, bukan data karangan. `conversations` tidak punya mock
 * sendiri, dan mengarang pasangan umkm/creator yang tidak cocok dengan
 * mockNegotiations akan membuat baris hilang dari inbox tanpa sebab yang jelas.
 * Dengan daftar kosong, tab "Arsip" mock tampil kosong — jujur dan tidak
 * menyesatkan. Toggle-nya sendiri tetap bisa diuji lewat state optimistis UI.
 */
export async function getMyConversations(): Promise<ServiceResult<ConversationFlag[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: [] };
  }
  return getMyConversationsFromAppwrite();
}

/** Arsipkan / batal arsip. Pesan di dalamnya tidak tersentuh. */
export async function setConversationArchived(
  conversationId: string,
  archived: boolean
): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(400);
    return { success: true, data: null };
  }
  return setConversationArchivedInAppwrite(conversationId, archived);
}
