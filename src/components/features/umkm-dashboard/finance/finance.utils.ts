import { TransactionStatus, TransactionType, ReferenceType } from "./finance.types";

export function getStatusBadgeVariant(status: TransactionStatus): "warning" | "info" | "success" | "danger" | "neutral" {
  switch (status) {
    case "pending":
      return "warning";
    case "escrow":
      return "info";
    case "success":
      return "success";
    case "failed":
      return "danger";
    case "refunded":
      return "neutral";
    default:
      return "neutral";
  }
}

export function getStatusLabel(status: TransactionStatus): string {
  switch (status) {
    case "pending":
      return "Menunggu Pembayaran";
    case "escrow":
      return "Dalam Escrow";
    case "success":
      return "Sukses";
    case "failed":
      return "Gagal";
    case "refunded":
      return "Refunded / Dikembalikan";
    default:
      return status;
  }
}

export function getTypeLabel(type: TransactionType): string {
  switch (type) {
    case "deposit":
      return "Deposit / Bayar";
    case "withdrawal":
      return "Penarikan";
    case "fee":
      return "Platform Fee";
    case "refund":
      return "Refund";
    case "payout":
      return "Pencairan";
    case "escrow":
      return "Escrow";
    case "pencairan":
      return "Pencairan";
    case "adjustment":
      return "Penyesuaian";
    default:
      return type;
  }
}

export function getReferenceLabel(type: ReferenceType): string {
  switch (type) {
    case "campaign":
      return "Campaign Mode";
    case "rate_card":
      return "Rate Card Mode";
    default:
      return type;
  }
}
