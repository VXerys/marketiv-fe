/**
 * Tipe notifikasi lintas-role.
 *
 * Sumber: collection `notifications` (userId, title, message, type, isRead,
 * createdAt). Kolom `type` di DB adalah string bebas yang ditulis Function;
 * `NotifType` di sini adalah kategori TAMPILAN yang dipakai tab filter, bukan
 * cerminan 1:1 dari nilai DB. Pemetaannya ada di notification-appwrite.service.
 *
 * Tidak ada kolom `actionLabel`/`actionHref` di DB. Tautan aksi diturunkan dari
 * kategori — lihat ACTION_BY_TYPE di service.
 */

export type NotifType =
  | "campaign"
  | "keuangan"
  | "negosiasi"
  | "sistem"
  | "rate_card";

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  /** ISO string. `notifications.createdAt`, fallback ke `$createdAt`. */
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
  actionHref?: string;
}
