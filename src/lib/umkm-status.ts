import {
  CampaignStatus,
  SubmissionStatus,
  FraudStatus,
  OrderStatus,
  TransactionStatus,
} from "@/types/umkm-dashboard.types";

/**
 * Map status kanon (nilai backend) → label Bahasa Indonesia + varian badge.
 * Ini SATU-SATUNYA tempat penerjemahan status untuk dashboard UMKM.
 * Jangan pernah membandingkan label Indonesia di layer data.
 */

type BadgeVariant = "neutral" | "success" | "warning" | "info" | "danger";

export function getCampaignStatusLabel(status: CampaignStatus): string {
  const map: Record<CampaignStatus, string> = {
    draft: "Draft",
    active: "Aktif",
    paused: "Dijeda",
    completed: "Selesai",
  };
  return map[status] || status;
}

export function getCampaignStatusVariant(status: CampaignStatus): BadgeVariant {
  const map: Record<CampaignStatus, BadgeVariant> = {
    draft: "neutral",
    active: "success",
    paused: "warning",
    completed: "info",
  };
  return map[status] || "neutral";
}

export function getSubmissionStatusLabel(status: SubmissionStatus): string {
  const map: Record<SubmissionStatus, string> = {
    pending: "Menunggu Review",
    approved: "Disetujui",
    rejected: "Ditolak",
  };
  return map[status] || status;
}

export function getSubmissionStatusVariant(status: SubmissionStatus): BadgeVariant {
  const map: Record<SubmissionStatus, BadgeVariant> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };
  return map[status] || "neutral";
}

/** fraudStatus adalah field terpisah dari status — ditampilkan sebagai badge sendiri. */
export function getFraudStatusLabel(status: FraudStatus): string {
  const map: Record<FraudStatus, string> = {
    safe: "Aman",
    review: "Perlu Ditinjau",
    rejected: "Terindikasi Fraud",
  };
  return map[status] || status;
}

export function getFraudStatusVariant(status: FraudStatus): BadgeVariant {
  const map: Record<FraudStatus, BadgeVariant> = {
    safe: "success",
    review: "warning",
    rejected: "danger",
  };
  return map[status] || "neutral";
}

export function getNegotiationStatusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending_payment: "Menunggu Pembayaran",
    escrow: "Dana di Escrow",
    in_progress: "Sedang Dikerjakan",
    revision: "Revisi",
    approved: "Disetujui",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return map[status] || status;
}

export function getNegotiationStatusVariant(status: OrderStatus): BadgeVariant {
  const map: Record<OrderStatus, BadgeVariant> = {
    pending_payment: "warning",
    escrow: "info",
    in_progress: "info",
    revision: "warning",
    approved: "success",
    completed: "success",
    cancelled: "neutral",
  };
  return map[status] || "neutral";
}

export function getTransactionStatusLabel(status: TransactionStatus): string {
  const map: Record<TransactionStatus, string> = {
    pending: "Menunggu Pembayaran",
    paid: "Berhasil",
    failed: "Gagal",
    expired: "Kedaluwarsa",
    cancelled: "Dibatalkan",
    held: "Dana Ditahan (Escrow)",
    released: "Dana Dicairkan",
    refunded: "Dikembalikan (Refund)",
    // Nilai yang benar-benar ditulis ke `transactions.status` oleh backend.
    completed: "Selesai",
  };
  return map[status] || status;
}

export function getTransactionStatusVariant(status: TransactionStatus): BadgeVariant {
  const map: Record<TransactionStatus, BadgeVariant> = {
    pending: "warning",
    paid: "success",
    failed: "danger",
    expired: "neutral",
    cancelled: "neutral",
    held: "warning",
    released: "success",
    refunded: "neutral",
    completed: "success",
  };
  return map[status] || "neutral";
}
