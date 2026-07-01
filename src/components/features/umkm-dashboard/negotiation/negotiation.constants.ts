import { ToolbarStatusFilterOption, ToolbarSortOption, EscrowStep } from "./negotiation.types";

export const NEGOTIATION_STATUS_FILTERS: ToolbarStatusFilterOption[] = [
  { id: "all", label: "Semua" },
  { id: "negotiation", label: "Negosiasi" },
  { id: "waiting_payment", label: "Menunggu Pembayaran" },
  { id: "escrow", label: "Escrow" },
  { id: "revision", label: "Revisi" },
  { id: "waiting_verification", label: "Menunggu Verifikasi" },
  { id: "completed", label: "Selesai" },
  { id: "dispute", label: "Dispute" },
];

export const NEGOTIATION_SORT_OPTIONS: ToolbarSortOption[] = [
  { id: "newest", label: "Terbaru" },
  { id: "deadline", label: "Deadline Terdekat" },
  { id: "price_desc", label: "Harga Tertinggi" },
  { id: "unread", label: "Belum Dibaca" },
];

export const ESCROW_STEPS: EscrowStep[] = [
  { label: "Offer Dibuat", desc: "Tawaran kolaborasi diajukan" },
  { label: "Pembayaran UMKM", desc: "UMKM mentransfer dana via VA/QRIS" },
  { label: "Dana Terkunci Escrow", desc: "Sistem mengamankan budget" },
  { label: "Kreator Eksekusi", desc: "Produksi & pengiriman draf video" },
  { label: "Verifikasi Collab Post", desc: "URL tayang divalidasi sistem" },
  { label: "Dana Cair ke Kreator", desc: "Pembayaran diselesaikan" },
];
