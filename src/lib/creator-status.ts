import {
  ClaimStatus,
  SubmissionStatus,
  FraudStatus,
  OrderStatus,
  EscrowStatus,
  RateCardStatus,
  TransactionStatus,
  TransactionType,
} from "@/types/domain";

/**
 * Map status kanon (nilai backend) → label Bahasa Indonesia untuk dashboard
 * Kreator. Pasangan dari src/lib/umkm-status.ts.
 */

export function getClaimStatusLabel(status: ClaimStatus): string {
  const map: Record<ClaimStatus, string> = {
    claimed: "Sedang Dikerjakan",
    submitted: "Menunggu Review",
    approved: "Selesai",
    rejected: "Ditolak",
    expired: "Kedaluwarsa",
  };
  return map[status] || status;
}

export function getSubmissionStatusLabel(status: SubmissionStatus): string {
  const map: Record<SubmissionStatus, string> = {
    pending: "Menunggu Review",
    approved: "Disetujui",
    rejected: "Ditolak",
  };
  return map[status] || status;
}

/** fraudStatus adalah field terpisah — ditampilkan sebagai badge sendiri. */
export function getFraudStatusLabel(status: FraudStatus): string {
  const map: Record<FraudStatus, string> = {
    safe: "Aman",
    review: "Perlu Ditinjau",
    rejected: "Terindikasi Fraud",
  };
  return map[status] || status;
}

export function getOrderStatusLabel(status: OrderStatus): string {
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

export function getEscrowStatusLabel(status: EscrowStatus): string {
  const map: Record<EscrowStatus, string> = {
    held: "Dana Ditahan",
    released: "Dana Dicairkan",
    refunded: "Dana Dikembalikan",
  };
  return map[status] || status;
}

export function getRateCardStatusLabel(status: RateCardStatus): string {
  const map: Record<RateCardStatus, string> = {
    draft: "Draft",
    published: "Tayang",
  };
  return map[status] || status;
}

export function getCreatorTransactionStatusLabel(status: TransactionStatus): string {
  const map: Record<TransactionStatus, string> = {
    pending: "Menunggu Diproses",
    paid: "Berhasil",
    failed: "Gagal",
    expired: "Kedaluwarsa",
    cancelled: "Dibatalkan",
    held: "Dana Ditahan",
    released: "Dana Dicairkan",
    refunded: "Dikembalikan",
    // Nilai yang benar-benar ditulis ke `transactions.status` oleh backend.
    completed: "Selesai",
    matured: "Selesai",
  };
  return map[status] || status;
}

const SUCCESSFUL_TRANSACTION_STATUSES = new Set<TransactionStatus>([
  "paid",
  "released",
  "completed",
  "matured",
]);

export function matchesCreatorTransactionStatusFilter(
  status: TransactionStatus,
  filter: string
): boolean {
  if (filter === "all") return true;
  if (filter === "success") return SUCCESSFUL_TRANSACTION_STATUSES.has(status);
  return status === filter;
}

export function getCreatorTransactionTypeLabel(type: TransactionType): string {
  const map: Record<TransactionType, string> = {
    deposit: "Top-up",
    withdrawal: "Penarikan Dana",
    withdrawal_reversal: "Pengembalian Penarikan",
    payment: "Pembayaran",
    refund: "Refund",
    release: "Pencairan Escrow",
    fee: "Platform Fee",
  };
  return map[type] || type;
}
