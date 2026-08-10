import { Query } from "appwrite";
import { databases } from "@/lib/appwrite/databases";
import { appwriteConfig } from "@/lib/appwrite/config";
import type { ServiceResult } from "@/types/domain";
import type { AppNotification, NotifType } from "@/types/notification.types";
import type { UserRole } from "@/types/domain";
import { executeFunction, FUNCTION_IDS } from "@/lib/appwrite/functions";
import {
  type Doc,
  str,
  ok,
  failFromError,
  failFromWriteError,
  requireUserId,
  noData,
} from "./service-result";

/**
 * Lapisan Appwrite notifikasi — satu untuk UMKM dan Kreator.
 *
 * Baris `notifications` ditulis Function dengan
 * `[Permission.read(Role.user(userId)), Permission.update(Role.user(userId))]`.
 * Konsekuensinya:
 * - Baca & tandai-sudah-dibaca BISA dari klien.
 * - Hapus TIDAK bisa — tidak ada `Permission.delete`. UI-nya karena itu tidak
 *   menawarkan hapus; lihat catatan di NotificationView.
 *
 * Sampai perbaikan permission baris di 4 Function penulis notifikasi dideploy
 * (§B handoff Alur B), daftar ini bisa pulang kosong meski barisnya ada. Kosong
 * ditampilkan sebagai empty state, bukan error.
 */

const DB = appwriteConfig.databaseId;
const COLLECTION = "notifications";
const PAGE_LIMIT = 100;

/**
 * `notifications.type` → kategori tampilan.
 *
 * Nilai DB ditulis Function dan tidak dibatasi enum. Yang tidak dikenali jatuh
 * ke "sistem" — sengaja, supaya notifikasi jenis baru tetap tampil alih-alih
 * hilang dari semua tab.
 */
const TYPE_ALIAS: Record<string, NotifType> = {
  // Campaign Mode (Alur A)
  campaign_published: "campaign",
  claim: "campaign",
  claim_expired: "campaign",
  submission_approved: "campaign",
  submission_rejected: "campaign",
  // Rate Card Mode (Alur B)
  chat_message: "negosiasi",
  offer_created: "negosiasi",
  offer_rejected: "negosiasi",
  order_created: "negosiasi",
  order_completed: "keuangan",
  deliverable_submitted: "negosiasi",
  revision_requested: "negosiasi",
  // Uang
  escrow_held: "keuangan",
  escrow_released: "keuangan",
  reward: "keuangan",
  reward_matured: "keuangan",
  withdrawal: "keuangan",
  payment: "keuangan",
};

/**
 * Tautan aksi per kategori. `notifications` tidak menyimpan URL, jadi tujuannya
 * diturunkan dari kategori + role pembaca — bukan ditebak per-notifikasi.
 */
const ACTION_BY_TYPE: Record<
  UserRole,
  Partial<Record<NotifType, { label: string; href: string }>>
> = {
  umkm: {
    campaign: { label: "Lihat Campaign", href: "/dashboard/umkm/campaign" },
    negosiasi: { label: "Lihat Negosiasi", href: "/dashboard/umkm/negosiasi" },
    keuangan: { label: "Lihat Keuangan", href: "/dashboard/umkm/keuangan" },
  },
  creator: {
    campaign: { label: "Lihat Job Pool", href: "/dashboard/kreator/job-pool" },
    negosiasi: { label: "Lihat Negosiasi", href: "/dashboard/kreator/negosiasi" },
    keuangan: { label: "Lihat Dompet", href: "/dashboard/kreator/keuangan" },
    rate_card: { label: "Lihat Rate Card", href: "/dashboard/kreator/rate-card" },
  },
  admin: {},
};

const mapNotification = (d: Doc, role: UserRole): AppNotification => {
  const type = TYPE_ALIAS[str(d.type)] ?? "sistem";
  const action = ACTION_BY_TYPE[role][type];
  return {
    id: str(d.$id),
    type,
    title: str(d.title),
    message: str(d.message),
    timestamp: str(d.createdAt) || str(d.$createdAt),
    isRead: d.isRead === true,
    actionLabel: action?.label,
    actionHref: action?.href,
  };
};

export async function getNotificationsFromAppwrite(
  role: UserRole
): Promise<ServiceResult<AppNotification[]>> {
  const auth = await requireUserId<AppNotification[]>([]);
  if (!auth.ok) return auth.result;

  try {
    const notifications: AppNotification[] = [];
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const queries = [
        Query.equal("userId", auth.userId),
        Query.orderDesc("$createdAt"),
        Query.limit(PAGE_LIMIT),
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const res = await databases.listDocuments(DB, COLLECTION, queries);
      const docs = res.documents as unknown as Doc[];
      
      for (const d of docs) {
        notifications.push(mapNotification(d, role));
      }

      if (docs.length < PAGE_LIMIT) {
        hasMore = false;
      } else {
        cursor = str(docs[docs.length - 1].$id);
      }
    }

    return ok(notifications);
  } catch (err) {
    return failFromError<AppNotification[]>(err, []);
  }
}

export async function markNotificationReadInAppwrite(
  id: string
): Promise<ServiceResult<null>> {
  try {
    await databases.updateDocument(DB, COLLECTION, id, { isRead: true });
    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, noData<null>());
  }
}

/**
 * Tandai semua sebagai dibaca. Tidak ada operasi batch di Appwrite, jadi ini
 * N update paralel. Kegagalan sebagian dilaporkan sebagai gagal — pemanggil
 * memuat ulang daftar supaya layar tidak mengklaim lebih dari yang terjadi.
 */
export async function markAllNotificationsReadInAppwrite(
  ids: string[]
): Promise<ServiceResult<null>> {
  if (ids.length === 0) return ok(null);

  try {
    await executeFunction(FUNCTION_IDS.markNotificationsRead, { ids });
    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, noData<null>());
  }
}
