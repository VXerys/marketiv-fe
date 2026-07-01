export const TRANSACTION_STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu Pembayaran" },
  { value: "escrow", label: "Dalam Escrow" },
  { value: "success", label: "Sukses" },
  { value: "failed", label: "Gagal" },
  { value: "refunded", label: "Refunded" },
] as const;

export const TRANSACTION_TYPE_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "deposit", label: "Deposit / Pembayaran" },
  { value: "refund", label: "Refund / Pengembalian" },
  { value: "payout", label: "Payout / Pencairan" },
  { value: "fee", label: "Platform Fee" },
] as const;

export const REFERENCE_TYPE_OPTIONS = [
  { value: "all", label: "Semua Fitur" },
  { value: "campaign", label: "Campaign Mode" },
  { value: "rate_card", label: "Rate Card Mode" },
] as const;

export const SORT_OPTIONS = [
  { value: "date_desc", label: "Terbaru" },
  { value: "date_asc", label: "Terlama" },
  { value: "amount_desc", label: "Nominal Terbesar" },
  { value: "amount_asc", label: "Nominal Terkecil" },
] as const;

export const EXPORT_FORMAT_OPTIONS = [
  { value: "csv", label: "CSV File (.csv)" },
  { value: "xlsx", label: "Excel Spreadsheet (.xlsx)" },
] as const;

export const EXPORT_TYPE_OPTIONS = [
  { value: "all", label: "Laporan Keuangan Lengkap" },
  { value: "campaign", label: "Laporan Campaign Mode" },
  { value: "rate_card", label: "Laporan Rate Card Mode" },
  { value: "refund", label: "Laporan Refund & Batalkan" },
] as const;
