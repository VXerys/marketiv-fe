import { StatusDetail, EscrowStepStatus } from "./negotiation.types";

/**
 * Maps the negotiation status string to labels and CSS classes.
 */
export function getStatusDetails(status: string): StatusDetail {
  switch (status) {
    // Empat tahap sebelum order lahir. Tanpa ini keduanya jatuh ke `default`
    // dan badge-nya menampilkan slug mentah ("chatting", "offer_pending") ke
    // pengguna — lihat NegotiationRoomPage.STATUS_CFG untuk label yang sama.
    case "chatting":
      return {
        label: "Negosiasi",
        textClass: "text-neutral-600",
        bgClass: "bg-neutral-100 border-neutral-200",
      };
    case "offer_pending":
      return {
        label: "Menunggu Kreator",
        textClass: "text-warning-strong",
        bgClass: "bg-warning-soft/30 border-warning-soft",
      };
    case "offer_rejected":
      return {
        label: "Penawaran Ditolak",
        textClass: "text-danger-strong",
        bgClass: "bg-danger-soft/30 border-danger-soft",
      };
    case "awaiting_order":
      return {
        label: "Menyiapkan Pesanan",
        textClass: "text-info-strong",
        bgClass: "bg-info-soft/30 border-info-soft",
      };
    case "pending_payment":
      return {
        label: "Menunggu Pembayaran",
        textClass: "text-warning-strong",
        bgClass: "bg-warning-soft/30 border-warning-soft",
      };
    case "escrow":
      return {
        label: "Dalam Escrow",
        textClass: "text-primary-800",
        bgClass: "bg-primary-50/50 border-primary-200/50",
      };
    case "in_progress":
      return {
        label: "Sedang Dikerjakan",
        textClass: "text-info-strong",
        bgClass: "bg-info-soft/30 border-info-soft",
      };
    case "revision":
      return {
        label: "Revisi",
        textClass: "text-danger-strong",
        bgClass: "bg-danger-soft/30 border-danger-soft",
      };
    case "approved":
      return {
        label: "Disetujui",
        textClass: "text-success-strong",
        bgClass: "bg-success-soft/30 border-success-soft",
      };
    case "completed":
      return {
        label: "Selesai",
        textClass: "text-success-strong",
        bgClass: "bg-success-soft/30 border-success-soft",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        textClass: "text-neutral-600",
        bgClass: "bg-neutral-100 border-neutral-200",
      };
    default:
      return {
        label: status,
        textClass: "text-neutral-600",
        bgClass: "bg-neutral-100 border-neutral-200",
      };
  }
}

/**
 * Formats dynamic step status in the escrow tracker.
 *
 * Empat tahap sebelum order lahir (chatting → offer_pending → offer_rejected →
 * awaiting_order) tidak punya cabang di versi lama, sehingga stepIdx 0 selalu
 * "completed" termasuk saat UMKM baru membuka percakapan. Sekarang memakai urutan
 * kanonik sebagai bilangan bulat agar setiap langkah dievaluasi hanya dari posisi
 * tahap saat ini.
 */
export function getStepStatus(stepIdx: number, orderStatus: string): EscrowStepStatus {
  if (orderStatus === "cancelled") return "cancelled";

  // Tahap bercabang (offer_rejected, revision) sejajar dengan tahap sebelumnya
  // agar tracker tidak mengklaim sudah maju saat negosiasi mengulang.
  const STAGE_ORDER: Record<string, number> = {
    chatting: 0,
    offer_pending: 1,
    offer_rejected: 1,
    awaiting_order: 2,
    pending_payment: 3,
    escrow: 4,
    in_progress: 5,
    revision: 5,
    approved: 6,
    completed: 7,
  };
  const o = STAGE_ORDER[orderStatus] ?? 0;

  switch (stepIdx) {
    case 0: // Offer Dibuat
      if (o === 0) return "pending";
      if (o === 1) return "active";
      return "completed";
    case 1: // Pembayaran UMKM
      if (o < 3) return "pending";
      if (o === 3) return "active";
      return "completed";
    case 2: // Dana Terkunci Escrow
      if (o < 4) return "pending";
      if (o === 4) return "active";
      return "completed";
    case 3: // Kreator Eksekusi
      if (o < 5) return "pending";
      if (o === 5) return "active";
      return "completed";
    case 4: // Verifikasi Collab Post
      if (o < 6) return "pending";
      if (o === 6) return "active";
      return "completed";
    case 5: // Dana Cair ke Kreator
      return o >= 7 ? "completed" : "pending";
    default:
      return "pending";
  }
}

/**
 * Formats relative date or text representation for Indonesian local dates with time.
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/**
 * Formats full Indonesian date for deadlines.
 */
export function deadlineTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}
