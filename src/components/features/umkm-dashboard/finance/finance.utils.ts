import { TransactionStatus, TransactionType, ReferenceType } from "./finance.types";

export function getStatusBadgeVariant(status: TransactionStatus): "warning" | "info" | "success" | "danger" | "neutral" {
  switch (status) {
    case "pending":
      return "warning";
    case "held":
      return "info";
    case "paid":
    case "released":
    case "completed":
    case "matured":
      return "success";
    case "failed":
      return "danger";
    case "expired":
    case "cancelled":
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
    case "held":
      return "Dana Tersimpan Aman";
    case "paid":
      return "Pembayaran Berhasil";
    case "released":
      return "Dana Dicairkan";
    case "completed":
    case "matured":
      return "Selesai";
    case "failed":
      return "Gagal";
    case "expired":
      return "Kedaluwarsa";
    case "cancelled":
      return "Dibatalkan";
    case "refunded":
      return "Dana Dikembalikan";
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
    case "payment":
      return "Pembayaran";
    case "fee":
      return "Biaya Layanan";
    case "refund":
      return "Pengembalian Dana";
    case "release":
      return "Pencairan";
    default:
      return type;
  }
}

export function getReferenceLabel(type: ReferenceType): string {
  switch (type) {
    case "campaign":
      return "Mode Kampanye";
    case "rate_card":
      return "Mode Paket Harga";
    default:
      return type;
  }
}
