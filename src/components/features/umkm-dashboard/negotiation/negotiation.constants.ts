import { ToolbarStatusFilterOption, ToolbarSortOption, EscrowStep } from "./negotiation.types";

export const NEGOTIATION_STATUS_FILTERS: ToolbarStatusFilterOption[] = [
  { id: "all", label: "Semua" },
  { id: "chatting", label: "Diskusi" },
  { id: "offer_pending", label: "Penawaran Dikirim" },
  { id: "offer_rejected", label: "Ditolak Kreator" },
  { id: "awaiting_order", label: "Menyiapkan Order" },
  { id: "pending_payment", label: "Menunggu Pembayaran" },
  { id: "escrow", label: "Dana Aman" },
  { id: "in_progress", label: "Sedang Dikerjakan" },
  { id: "revision", label: "Revisi" },
  { id: "approved", label: "Disetujui" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

export const NEGOTIATION_SORT_OPTIONS: ToolbarSortOption[] = [
  { id: "newest", label: "Terbaru" },
  { id: "deadline", label: "Batas Waktu Terdekat" },
  { id: "price_desc", label: "Harga Tertinggi" },
  { id: "unread", label: "Belum Dibaca" },
];

export const ESCROW_STEPS: EscrowStep[] = [
  { label: "Penawaran Dibuat", desc: "Tawaran kolaborasi diajukan" },
  { label: "Pembayaran Anda", desc: "Anda membayar via Virtual Account atau QRIS" },
  { label: "Dana Tersimpan Aman", desc: "Sistem menyimpan anggaran Anda" },
  { label: "Kreator Mengerjakan Konten", desc: "Kreator membuat dan mengirim video" },
  { label: "Verifikasi Postingan Bersama", desc: "Sistem memeriksa tautan video yang diunggah" },
  { label: "Dana Cair ke Kreator", desc: "Pembayaran diselesaikan" },
];
