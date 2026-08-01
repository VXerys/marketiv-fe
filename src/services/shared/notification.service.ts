import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { mockDelay } from "@/lib/mock-delay";
import type { ServiceResult, UserRole } from "@/types/domain";
import type { AppNotification } from "@/types/notification.types";
import {
  mockKreatorNotifications,
  mockUmkmNotifications,
} from "@/mocks/notifications.mock";
import {
  getNotificationsFromAppwrite,
  markNotificationReadInAppwrite,
  markAllNotificationsReadInAppwrite,
} from "./notification-appwrite.service";

/**
 * Facade notifikasi — satu untuk UMKM dan Kreator.
 *
 * Sebelum s5-notifikasi-wire, halaman /notifikasi kedua role memakai array
 * hardcode di dalam komponen tanpa cabang mock sama sekali, jadi data karangan
 * tetap tampil meski mock dimatikan. Sekarang jalurnya sama dengan modul lain.
 *
 * Hapus notifikasi tidak disediakan: baris `notifications` ditulis Function
 * dengan `read` + `update` untuk pemiliknya, tanpa `delete`. Menyediakan tombol
 * yang pasti 401 lebih buruk daripada tidak menyediakannya.
 */

export async function getNotifications(
  role: UserRole
): Promise<ServiceResult<AppNotification[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return {
      success: true,
      data: role === "creator" ? mockKreatorNotifications : mockUmkmNotifications,
    };
  }
  return getNotificationsFromAppwrite(role);
}

export async function markNotificationRead(
  id: string
): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(200);
    return { success: true, data: null };
  }
  return markNotificationReadInAppwrite(id);
}

/** `ids` = hanya yang belum dibaca; pemanggil yang menyaring. */
export async function markAllNotificationsRead(
  ids: string[]
): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return { success: true, data: null };
  }
  return markAllNotificationsReadInAppwrite(ids);
}
