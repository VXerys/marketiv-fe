import { ReactNode } from "react";

export interface OptionItem {
  id: string;
  label: string;
  desc: string;
}

export const NICHE_OPTIONS: OptionItem[] = [
  { id: "kuliner", label: "Kuliner", desc: "Makanan & Minuman" },
  { id: "fesyen", label: "Fesyen", desc: "Pakaian & Aksesoris" },
  { id: "pariwisata", label: "Pariwisata", desc: "Travel & Liburan" },
  { id: "edukasi", label: "Edukasi", desc: "Kursus & Pengetahuan" },
  { id: "kecantikan", label: "Kecantikan", desc: "Kosmetik & Skin Care" },
  { id: "lainnya", label: "Lainnya", desc: "Umum & Jasa" },
];

export const TONE_OPTIONS: OptionItem[] = [
  { id: "natural", label: "Natural / Kasual", desc: "Santai & apa adanya" },
  { id: "edukatif", label: "Edukasi / Review", desc: "Penjelasan detail produk" },
  { id: "enerjik", label: "Enerjik & Fun", desc: "Penuh semangat & musik up-beat" },
  { id: "storytelling", label: "Storytelling", desc: "Memakai format cerita/narasi" },
  { id: "soft_selling", label: "Soft Selling", desc: "Promosi halus & estetik" },
];

export const CTA_OPTIONS: OptionItem[] = [
  { id: "kunjungi_toko", label: "Kunjungi Toko", desc: "Arahkan ke lapak offline/online" },
  { id: "follow_akun", label: "Follow Akun", desc: "Arahkan ke akun medsos brand" },
  { id: "coba_produk", label: "Coba Produk", desc: "Rekomendasikan mencoba produk" },
  { id: "pesan_sekarang", label: "Pesan Sekarang", desc: "Arahkan pembelian langsung" },
];

export const PRICE_TIERS = [
  { id: 3000, label: "Rp 3.000", desc: "Niche Rendah / Pemula" },
  { id: 5000, label: "Rp 5.000", desc: "Niche Menengah / Standar" },
  { id: 8000, label: "Rp 8.000", desc: "Niche Tinggi / Premium" },
];

export const PAYMENT_METHODS = [
  { id: "va", name: "Bank Transfer Virtual Account", desc: "BNI, Mandiri, BCA, BRI" },
  { id: "qris", name: "QRIS Cashback", desc: "Gopay, OVO, Dana, LinkAja, ShopeePay" },
  { id: "wallet", name: "Saldo Dompet Marketiv", desc: "Bayar instan via saldo platform" },
];

export const STEP_TIPS: Record<number, string> = {
  1: "Gunakan nama campaign yang mudah dikenali kreator.",
  2: "Brief yang jelas mempercepat kreator memahami gaya video.",
  3: "Pastikan link Drive bisa diakses publik.",
  4: "Rate lebih tinggi biasanya menarik lebih banyak kreator.",
  5: "Periksa kembali semua data sebelum simulasi pembayaran.",
};

export const BRIEF_SUGGESTIONS = [
  "Tampilkan proses pembuatan produk secara higienis",
  "Highlight 3 manfaat utama menggunakan produk ini",
  "Gunakan gaya daily vlog santai saat mengonsumsi produk",
  "Tutup video dengan call-to-action promosi yang jelas",
];
