"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  FileText,
  Clock,
  Ban,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Search,
  X,
  BookOpen,
  Scale,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { UmkmPageWrapper } from "@/components/features/umkm-dashboard/shared/UmkmPageWrapper";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";

type TabType = "rules" | "faq" | "terms";

interface ChapterGroup {
  id: string;
  bab: string;
  title: string;
  pasalList: {
    pasalNumber: string;
    title: string;
    items: string[];
  }[];
}

const POPULAR_KEYWORDS = [
  "escrow",
  "2%",
  "withdraw",
  "collab",
  "auto-approve",
  "dispute",
  "pasal 9",
  "kyc",
];

const RULES_DATA = [
  {
    id: 1,
    title: "Dua Mode Kolaborasi Sesuai Kebutuhan Usaha",
    desc: "Marketiv menyediakan Campaign Mode (bayar per 1.000 views, tanpa chat/revisi) dan Rate Card Mode (harga tetap, nego via chat, wajib Collab Post). UMKM dapat memilih mode yang paling efisien.",
    Icon: Sparkles,
    color: "#ea580c",
    bg: "#fff8ef",
    border: "rgba(234, 88, 12, 0.12)",
  },
  {
    id: 2,
    title: "Campaign Mode Is Zero Chat",
    desc: "Dilarang meminta atau mencantumkan sarana komunikasi langsung (WhatsApp, Email, Telepon) di dalam brief atau deskripsi Campaign Mode. Seluruh proses berjalan otomatis tanpa drama revisi.",
    Icon: Ban,
    color: "#dc2626",
    bg: "#fee2e2",
    border: "rgba(220, 38, 38, 0.12)",
  },
  {
    id: 3,
    title: "Jaminan Transaksi Aman Lewat Sistem Escrow",
    desc: "Seluruh dana kampanye dan pesanan Rate Card disimpan aman di sistem Escrow Marketiv. Dana baru dirilis ke Kreator setelah pekerjaan tervalidasi atau disetujui.",
    Icon: ShieldCheck,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "rgba(22, 163, 74, 0.12)",
  },
  {
    id: 4,
    title: "Batas Waktu Peninjauan Rate Card (Auto-Approve 3 Hari)",
    desc: "UMKM memiliki waktu 3 hari kalender untuk meninjau hasil kerja Rate Card dari Kreator. Jika tidak ada tanggapan setelah 3 hari kalender, dana Escrow otomatis dirilis ke Kreator.",
    Icon: Clock,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "rgba(37, 99, 235, 0.12)",
  },
  {
    id: 5,
    title: "Perlindungan Sengketa (Dispute Resolution)",
    desc: "Jika terjadi ketidaksesuaian hasil kerja pada Rate Card Mode, UMKM dapat mengajukan Dispute via WhatsApp resmi Admin selambatnya 7 hari kalender sebelum dana Escrow cair.",
    Icon: MessageSquare,
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "rgba(124, 58, 237, 0.12)",
  },
  {
    id: 6,
    title: "Pengunggahan Aset Mentah Berukuran Besar",
    desc: "Aset video/foto mentah berukuran besar wajib dibagikan melalui tautan eksternal HTTPS (Google Drive/Dropbox) yang dapat diakses.",
    Icon: FileText,
    color: "#0891b2",
    bg: "#ecfeff",
    border: "rgba(8, 145, 178, 0.12)",
  },
  {
    id: 7,
    title: "Tidak Ada Manipulasi Views atau Engagement Palsu",
    desc: "Sistem deteksi kecurangan Marketiv secara otomatis memeriksa keaslian views. Pembelian views, bot, atau boosting ilegal dilarang keras.",
    Icon: ShieldAlert,
    color: "#db2777",
    bg: "#fdf2f8",
    border: "rgba(219, 39, 119, 0.12)",
  },
];

const FAQ_DATA = [
  {
    question: "Berapa biaya platform resmi Marketiv?",
    answer: "Biaya platform resmi Marketiv adalah 2% per transaksi (Pasal 9.1 S&K v3.1). Biaya 2% dibebankan ke UMKM di awal saat pembayaran. Kreator menerima pendapatan flat netto penuh (0% potongan).",
  },
  {
    question: "Apa bedanya Campaign Mode dan Rate Card Mode?",
    answer: "Campaign Mode adalah model pay-per-view (bayar per 1.000 views tervalidasi) tanpa fitur chat atau revisi. Rate Card Mode adalah model kolaborasi harga tetap dengan chat negosiasi, Custom Offer resmi, dan kewajiban Collab Post.",
  },
  {
    question: "Bagaimana cara kerja pembayaran dan Escrow di Marketiv?",
    answer: "Seluruh pembayaran diproses melalui payment gateway Midtrans (Pasal 8). Dana UMKM ditahan di sistem Escrow Marketiv dan tidak pernah diteruskan langsung ke Kreator sampai hasil pekerjaan disetujui atau tervalidasi.",
  },
  {
    question: "Berapa batas minimum budget campaign?",
    answer: "Budget minimum untuk membuat campaign di Marketiv adalah Rp 50.000 (lima puluh ribu Rupiah). Total budget dan biaya platform dibayar di muka melalui Escrow.",
  },
  {
    question: "Berapa lama batas waktu peninjauan hasil kerja Rate Card?",
    answer: "UMKM diberi waktu 3 hari kalender untuk meninjau deliverable dari Kreator (Pasal 7.2.g). Jika tidak ada aksi/tanggapan dari UMKM dalam 3 hari kalender, sistem secara otomatis merilis dana Escrow kepada Kreator (Auto-Approve).",
  },
  {
    question: "Apa itu fitur Collab Post?",
    answer: "Collab Post adalah fitur kolaborasi resmi Instagram & TikTok di mana satu postingan tampil secara bersamaan di akun Kreator DAN akun UMKM. Fitur ini wajib di Rate Card Mode agar UMKM mendapat direct traffic dari audiens Kreator.",
  },
  {
    question: "Bagaimana jika hasil kerja Kreator tidak sesuai di Rate Card Mode?",
    answer: "UMKM dapat memanfaatkan batas revisi paket atau mengajukan Sengketa (Dispute) ke Admin Marketiv melalui WhatsApp resmi sebelum dana Escrow dicairkan (Pasal 14). Admin akan meninjau bukti chat & deliverable untuk memberikan keputusan yang adil.",
  },
  {
    question: "Bagaimana ketentuan pengembalian dana (Refund)?",
    answer: "Jika kampanye dihentikan atau pesanan dibatalkan melalui keputusan Dispute (Pasal 15), sisa dana budget akan di-refund langsung ke Wallet UMKM. Dana di Wallet dapat digunakan kembali atau ditarik (Withdrawal) ke rekening bank.",
  },
  {
    question: "Berapa batas minimum penarikan dana (Withdrawal)?",
    answer: "Minimum penarikan dana dari Wallet adalah Rp 50.000 per transaksi, dengan batas maksimal 3 kali penarikan per hari (Pasal 11). Penarikan nominal Rp 5.000.000 atau lebih membutuhkan verifikasi KYC manual WhatsApp Admin.",
  },
];

const CHAPTERS_DATA: ChapterGroup[] = [
  {
    id: "bab-1",
    bab: "BAB I",
    title: "Ketentuan Umum & Peran Platform",
    pasalList: [
      {
        pasalNumber: "Pasal 1",
        title: "Ketentuan Penggunaan",
        items: [
          "Platform Marketiv (marketiv.id) dioperasikan oleh entitas usaha (PT Perorangan) dengan NIB sah, berkedudukan di Sukabumi, Indonesia.",
          "Dengan mendaftar, mengakses, atau menggunakan Marketiv, Pengguna menyatakan telah memahami dan menyetujui seluruh Syarat & Ketentuan ini beserta Kebijakan Privasi.",
          "Ketentuan berlaku bagi seluruh Pengguna, baik yang berperan sebagai UMKM maupun Konten Kreator.",
          "Apabila Pengguna tidak menyetujui Syarat & Ketentuan ini, Pengguna diwajibkan berhenti menggunakan layanan Marketiv.",
        ],
      },
      {
        pasalNumber: "Pasal 2",
        title: "Gambaran Umum Layanan",
        items: [
          "Marketiv adalah platform marketplace web penghubung UMKM daerah dengan Mikro-Kreator lokal untuk promosi berbayar melalui Campaign Mode (Pay-Per-View) dan Rate Card Mode.",
          "Marketiv berperan sebagai perantara independen (intermediary) yang menyediakan sarana transaksi, penahanan dana (Escrow), alat kolaborasi, dan sistem sengketa. Marketiv bukan agensi atau pemberi kerja.",
          "Pemrosesan pembayaran dilakukan via penyedia payment gateway pihak ketiga terlisensi (Midtrans). Marketiv tidak menyimpan data kartu kredit/debit Pengguna.",
        ],
      },
      {
        pasalNumber: "Pasal 3",
        title: "Perubahan Layanan dan Syarat Ketentuan",
        items: [
          "Marketiv berhak mengubah Syarat & Ketentuan, biaya platform, dan kebijakan layanan dari waktu ke waktu.",
          "Perubahan material (biaya platform / mekanisme escrow) diberitahukan via email/dashboard sekurang-kurangnya 14 hari sebelum berlaku.",
          "Pengguna diwajibkan menyetujui ulang saat ada pembaruan versi Syarat & Ketentuan secara eksplisit di aplikasi.",
          "Perubahan biaya platform tidak berlaku surut terhadap transaksi yang dananya telah masuk escrow sebelum perubahan.",
        ],
      },
      {
        pasalNumber: "Pasal 4",
        title: "Definisi Istilah Resmi Platform",
        items: [
          "Campaign Mode — Mode pemasaran berbasis performa (Pay-Per-View) di mana Kreator dibayar sesuai jumlah views tervalidasi, 100% tanpa fitur chat.",
          "Rate Card Mode — Mode kolaborasi berbasis harga tetap (fixed price) dengan paket jasa, negosiasi chat, dan Custom Offer.",
          "Rate Card — Etalase layanan Kreator berisi paket jasa, deskripsi, deliverable, harga, dan batas revisi (max 3 paket).",
          "Custom Offer — Penawaran resmi berisi lingkup kerja, harga final, dan tenggat waktu yang dikirim UMKM di ruang chat Rate Card.",
          "Collab Post — Konten dipublikasikan menggunakan fitur kolaborasi sosmed sehingga tampil di akun Kreator DAN akun UMKM sekaligus.",
          "Escrow — Mekanisme penahanan dana oleh sistem Marketiv sejak pembayaran diterima hingga hasil pekerjaan dinyatakan valid.",
          "Bukti Tayang (Submission) — Tautan URL publik konten pada sosial media (TikTok/Instagram) yang dikirim Kreator sebagai bukti tayang.",
          "Claim & Job Pool — Tindakan Kreator mengambil campaign aktif di daftar Job Pool dengan prinsip first come, first served.",
          "Wallet & Withdrawal — Dompet digital internal mencatat saldo tersedia/tertunda dan fasilitas penarikan dana ke rekening bank.",
          "Dispute — Sengketa atau banding yang diajukan Pengguna atas transaksi berjalan untuk ditangani admin.",
        ],
      },
      {
        pasalNumber: "Pasal 5",
        title: "Pendaftaran, Akun, dan Verifikasi",
        items: [
          "Ketentuan Umum: Wajib mendaftar satu peran (UMKM atau Kreator), berusia min 18 tahun/cakap hukum, dan bertanggung jawab penuh atas kredensial akun.",
          "Khusus UMKM: Wajib mencantumkan nama usaha, kategori usaha, email, dan nomor HP aktif. Pendaftaran via Google OAuth wajib melengkapi data profil usaha.",
          "Khusus Kreator: Wajib melengkapi profil dan menautkan akun media sosial milik pribadi yang aktif sebelum dapat melakukan Claim campaign.",
        ],
      },
      {
        pasalNumber: "Pasal 6",
        title: "Komunikasi Elektronik",
        items: [
          "Marketiv mengirimkan notifikasi elektronik (email & notifikasi aplikasi) terkait transaksi, status escrow, keputusan sengketa, dan keamanan.",
          "Komunikasi transaksional tidak dapat dinonaktifkan selama akun aktif demi perlindungan finansial Pengguna.",
        ],
      },
    ],
  },
  {
    id: "bab-2",
    bab: "BAB II",
    title: "Mekanisme Transaksi & Escrow",
    pasalList: [
      {
        pasalNumber: "Pasal 7",
        title: "Deskripsi Layanan & Jenis Transaksi",
        items: [
          "Campaign Mode (Pay-Per-View): Budget minimal Rp 50.000 + 2% biaya platform dibayar di muka ke escrow. First come first served. Strictly ZERO-CHAT (dilarang meminta/mencantumkan nomor WA atau kontak luar). Kreator submit URL publik HTTPS dalam 24 jam. Tanpa revisi & tanpa download video.",
          "Rate Card Mode (Harga Tetap): Maksimal 3 paket aktif per Kreator. Pesanan via Direct Order atau Chat Nego. Kesepakatan diikat Custom Offer. Auto-Approve 3 hari kalender jika UMKM tidak memberikan tanggapan review. Wajib diposting sebagai Collab Post.",
          "Custom Offer: Mengikat lingkup kerja & harga final secara mengunci setelah diterima Kreator.",
        ],
      },
      {
        pasalNumber: "Pasal 8",
        title: "Pembayaran & Pengamanan Escrow",
        items: [
          "Seluruh pembayaran diproses otomatis via Midtrans. Marketiv tidak menerima pembayaran tunai atau transfer luar platform.",
          "Escrow bersifat wajib untuk seluruh transaksi. Dana ditahan oleh sistem dan tidak diteruskan langsung ke Kreator di awal.",
          "Status escrow (Held, Released, Refunded) hanya diubah oleh sistem/admin Marketiv berdasarkan Notifikasi Webhook resmi Midtrans yang terverifikasi.",
          "Escrow dirilis jika: (a) Campaign Submission tervalidasi & disetujui; (b) Rate Card disetujui manual / auto-approve 3 hari; (c) Putusan dispute.",
          "Saldo Wallet & Escrow tidak dapat bernilai negatif dan tercatat dalam audit log transaksi.",
        ],
      },
    ],
  },
  {
    id: "bab-3",
    bab: "BAB III",
    title: "Biaya Platform, Wallet & Penarikan Dana",
    pasalList: [
      {
        pasalNumber: "Pasal 9",
        title: "Biaya Platform Resmi (2%)",
        items: [
          "Tarif resmi biaya platform Marketiv adalah 2% (dua persen) per transaksi bersifat tetap per snapshot transaksi:",
          "a. Campaign Mode: Biaya 2% dibebankan ke UMKM di awal dan ditambahkan saat pembayaran deposit budget. Kreator menerima reward 100% penuh tanpa potongan.",
          "b. Rate Card Mode: Biaya 2% dibebankan ke UMKM di awal saat pembayaran. Kreator menerima pendapatan flat netto penuh (0% potongan) saat pelepasan escrow.",
          "Rincian biaya dicatat secara transparan pada riwayat transaksi.",
        ],
      },
      {
        pasalNumber: "Pasal 10",
        title: "Wallet (Dompet Digital)",
        items: [
          "Setiap Pengguna memiliki satu Wallet yang mencatat: Saldo Tersedia, Saldo Tertunda, dan Dana Terkunci Escrow.",
          "Tidak ada fitur top-up reguler. Saldo UMKM murni berasal dari refund pembatalan, penyelesaian dispute, atau sisa budget campaign.",
          "Wallet bukan simpanan bank dan tidak memberikan bunga.",
        ],
      },
      {
        pasalNumber: "Pasal 11",
        title: "Penarikan Dana (Withdrawal)",
        items: [
          "Penarikan dana (Withdrawal) dapat dilakukan oleh Kreator (dari hasil kerja) dan UMKM (dari refund/sisa budget) ke rekening bank atau e-wallet.",
          "Jumlah minimum penarikan adalah Rp 50.000 per transaksi.",
          "Batasan Penarikan: Maksimal 3 (tiga) kali penarikan per hari. Masa cooling period berlaku jika terjadi perubahan rekening tujuan.",
          "Know Your Customer (KYC): Penarikan dengan nominal Rp 5.000.000 (lima juta Rupiah) atau lebih wajib melalui verifikasi manual via WhatsApp Admin Marketiv.",
          "Jika pengiriman dana gagal di bank/e-wallet, dana otomatis dikembalikan (reverse) ke Wallet Pengguna dalam 3 hari kerja.",
        ],
      },
      {
        pasalNumber: "Pasal 15",
        title: "Pembatalan & Pengembalian Dana (Refund)",
        items: [
          "Refund pembatalan, kemenangan dispute UMKM, atau sisa budget campaign direfund 100% ke Wallet UMKM.",
          "Biaya platform (fee) yang sudah terpakai proses administrasi sistem tidak dapat dikembalikan.",
          "Sisa budget campaign yang dihentikan otomatis direfund ke Wallet setelah seluruh submission aktif tervalidasi.",
        ],
      },
    ],
  },
  {
    id: "bab-4",
    bab: "BAB IV",
    title: "Larangan, Fraud & Penanganan Sengketa",
    pasalList: [
      {
        pasalNumber: "Pasal 12",
        title: "Kewajiban & Larangan Pengguna",
        items: [
          "Larangan UMKM: Dilarang meminta komunikasi luar platform pada Campaign Mode, wajib menyediakan brief/aset sah, dan meninjau submission secara adil.",
          "Larangan Kreator: Dilarang mengunggah file video mentah ke sistem Campaign Mode (hanya URL sosmed), dilarang menghapus video selama masa verifikasi (min 180 hari), wajib Collab Post di Rate Card.",
          "Transparansi AI: Penandaan buatan AI pada konten bersifat opsional dan tidak memblokir alur validasi.",
          "Larangan Umum: Dilarang circumvention (mengalihkan transaksi luar platform), bot/view farm, SARA, perjudian online, pornografi, atau scraping.",
        ],
      },
      {
        pasalNumber: "Pasal 13",
        title: "Deteksi Kecurangan (Fraud)",
        items: [
          "Setiap Bukti Tayang (Submission) dianalisis otomatis oleh sistem deteksi fraud Marketiv (validitas URL, privasi, duplikasi, platform, brief).",
          "Kategori Risiko: (a) Risiko Rendah — auto-approve; (b) Risiko Sedang — antrean peninjauan manual admin; (c) Risiko Tinggi — ditolak otomatis.",
          "Bukti Tayang yang ditolak otomatis dapat diajukan banding (appeal) melalui WhatsApp Admin Marketiv resmi.",
        ],
      },
      {
        pasalNumber: "Pasal 14",
        title: "Penanganan Sengketa (Dispute SLA)",
        items: [
          "Sengketa Rate Card atau penolakan submission diajukan via WhatsApp resmi Admin Marketiv selambatnya 7 hari kalender sejak kejadian.",
          "Selama sengketa berjalan, dana Escrow terkait dibekukan total dan tidak dapat dicairkan oleh pihak mana pun.",
          "Admin meninjau bukti chat & deliverable. Keputusan admin bersifat final di tingkat Platform dengan SLA penanganan maksimal 7 hari kalender.",
        ],
      },
      {
        pasalNumber: "Pasal 18",
        title: "Penangguhan & Penghentian Akun",
        items: [
          "Pelanggaran S&K, fraud, circumvention, atau transaksi ilegal menyebabkan penangguhan (suspended) atau pemblokiran permanen (terminated).",
          "Akun suspended diblokir dari Claim, penyerahan hasil kerja, penarikan dana, dan pesanan baru.",
          "Pengguna berhak mengajukan banding maksimal 14 hari kalender sejak penangguhan. Keputusan admin dikeluarkan maksimal dalam 7 hari.",
        ],
      },
    ],
  },
  {
    id: "bab-5",
    bab: "BAB V",
    title: "Hak Cipta, Privasi & Ketentuan Hukum",
    pasalList: [
      {
        pasalNumber: "Pasal 16",
        title: "Hak Kekayaan Intelektual",
        items: [
          "Merek, logo, desain, dan kode Marketiv adalah milik sah pengelola Platform Marketiv.",
          "Aset UMKM dilisensikan terbatas kepada Kreator semata-mata untuk pengerjaan kampanye.",
          "Hak cipta penuh atas konten beralih ke UMKM saat dana Escrow dirilis, dengan hak kreditasi merujuk username Kreator.",
        ],
      },
      {
        pasalNumber: "Pasal 17",
        title: "Privasi & Pelindungan Data (UU PDP)",
        items: [
          "Pengumpulan data pribadi diatur dalam Kebijakan Privasi Marketiv sesuai Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (PDP).",
          "Data pembayaran diproses langsung oleh payment gateway Midtrans tanpa disimpan di server Marketiv.",
        ],
      },
      {
        pasalNumber: "Pasal 19",
        title: "Ganti Rugi & Batasan Tanggung Jawab",
        items: [
          "Pengguna membebaskan Marketiv dari klaim kerugian akibat pelanggaran S&K atau konten buatan Pengguna.",
          "Marketiv menyediakan platform 'as is' dan tidak menjamin jumlah penjualan/views spesifik di luar mekanisme validasi.",
          "Total tanggung jawab Marketiv dibatasi maksimal sebesar nilai transaksi terkait.",
        ],
      },
      {
        pasalNumber: "Pasal 20",
        title: "Hukum yang Berlaku & Penyelesaian Perselisihan",
        items: [
          "Syarat & Ketentuan diatur menurut Hukum Republik Indonesia.",
          "Perselisihan diupayakan musyawarah 30 hari. Jika tidak tercapai, diselesaikan melalui Pengadilan Negeri Jakarta Selatan.",
        ],
      },
      {
        pasalNumber: "Pasal 21",
        title: "Ketentuan Lain-lain",
        items: [
          "Apabila salah satu pasal dinyatakan tidak sah, pasal lainnya tetap berlaku sepenuhnya.",
          "Hak penggunaan akun tidak dapat dialihkan kepada pihak lain tanpa persetujuan tertulis.",
        ],
      },
      {
        pasalNumber: "Pasal 22",
        title: "Pertanyaan & Layanan Bantuan Resmi",
        items: [
          "Email Resmi Support: marketiv.official@gmail.com",
          "Alamat Operasional: Sukabumi, Jawa Barat, Indonesia",
          "Komitmen Layanan (SLA): Respon dalam maksimal 3 hari kerja via Email / WhatsApp Admin.",
        ],
      },
    ],
  },
];

export default function FAQRulesDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("rules");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChapterId, setActiveChapterId] = useState<string>("bab-1");
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    getUmkmProfile()
      .then((res) => {
        if (res.success && res.data) setBusinessName(res.data.businessName);
      })
      .catch(() => {
        /* fallback without business name */
      });
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  // Global Keyword Search Calculations across all 3 domains
  const matchingRules = useMemo(() => {
    if (!searchQuery.trim()) return RULES_DATA;
    const q = searchQuery.toLowerCase();
    return RULES_DATA.filter(
      (r) => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const matchingFAQ = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_DATA;
    const q = searchQuery.toLowerCase();
    return FAQ_DATA.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const matchingPasalList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const result: { pasalNumber: string; title: string; itemText: string }[] = [];

    CHAPTERS_DATA.forEach((ch) => {
      ch.pasalList.forEach((p) => {
        const matchPasalName =
          p.pasalNumber.toLowerCase().includes(q) || p.title.toLowerCase().includes(q);
        const matchItem = p.items.filter((it) => it.toLowerCase().includes(q));

        if (matchPasalName || matchItem.length > 0) {
          result.push({
            pasalNumber: p.pasalNumber,
            title: p.title,
            itemText: matchItem.length > 0 ? matchItem.join(" | ") : p.items[0],
          });
        }
      });
    });

    return result;
  }, [searchQuery]);

  const matchingChapters = useMemo(() => {
    if (!searchQuery.trim()) return CHAPTERS_DATA;
    const q = searchQuery.toLowerCase();

    return CHAPTERS_DATA.map((ch) => {
      const matchingPasal = ch.pasalList.filter(
        (p) =>
          p.pasalNumber.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.items.some((it) => it.toLowerCase().includes(q))
      );
      return { ...ch, pasalList: matchingPasal };
    }).filter((ch) => ch.pasalList.length > 0);
  }, [searchQuery]);

  const totalMatches =
    matchingRules.length + matchingFAQ.length + matchingPasalList.length;

  const scrollToChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    const el = document.getElementById(chapterId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <UmkmPageWrapper>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[0.68rem] font-[800] text-orange-600 uppercase tracking-widest block mb-1">
              Pusat Informasi & Hukum Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-[850] text-ink-900 leading-tight tracking-tight font-display">
              FAQ, Aturan & Syarat Ketentuan
            </h1>
            <p className="text-xs sm:text-sm text-ink-500 font-medium mt-1">
              Pencarian kata kunci lintas Aturan Ringkas, FAQ Usaha, dan 22 Pasal S&K Versi 3.1.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-bold shrink-0 self-start md:self-auto">
            <CheckCircle2 size={14} className="text-orange-600" />
            <span>Versi Resmi 3.1 (Agustus 2026)</span>
          </div>
        </div>

        {/* Global Keyword Search Box */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-sm space-y-3">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kata kunci (misal: 'escrow', '2%', 'withdraw', 'collab', 'pasal 9')..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm font-semibold text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 p-1.5 rounded-lg bg-neutral-200/70 hover:bg-neutral-300 text-slate-600 transition-colors cursor-pointer"
                aria-label="Bersihkan pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Popular Search Suggestions */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-[11px] font-extrabold text-ink-400 uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} className="text-orange-500" />
              Kata Kunci Populer:
            </span>
            {POPULAR_KEYWORDS.map((kw) => (
              <button
                key={kw}
                onClick={() => setSearchQuery(kw)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                  searchQuery.toLowerCase() === kw
                    ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                    : "bg-neutral-100/80 hover:bg-orange-50 text-ink-700 hover:text-orange-700 border-neutral-200/80"
                )}
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Search Result Feedback Indicator */}
          {searchQuery && (
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-3 text-xs font-semibold">
              <p className="text-orange-800 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/60">
                Ditemukan <strong className="font-extrabold">{totalMatches}</strong> hasil pencarian kata kunci &quot;<span className="font-bold">{searchQuery}</span>&quot;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-500 hover:text-orange-600 font-bold underline cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>

        {/* Global Keyword Search Results Mode (When Search is Active) */}
        {searchQuery.trim() ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {totalMatches === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-neutral-200/80 space-y-2">
                <p className="text-base font-bold text-ink-900">
                  Kata kunci &quot;{searchQuery}&quot; tidak ditemukan.
                </p>
                <p className="text-xs text-ink-500 font-medium">
                  Coba kata kunci lain seperti <button onClick={() => setSearchQuery("escrow")} className="text-orange-600 font-bold underline cursor-pointer">escrow</button>, <button onClick={() => setSearchQuery("2%")} className="text-orange-600 font-bold underline cursor-pointer">2%</button>, atau <button onClick={() => setSearchQuery("withdraw")} className="text-orange-600 font-bold underline cursor-pointer">withdraw</button>.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Match Group 1: Aturan Ringkas */}
                {matchingRules.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-neutral-200/60 pb-2">
                      <ShieldCheck size={16} className="text-orange-600" />
                      <h2 className="text-sm font-extrabold text-ink-900 font-display uppercase tracking-wider">
                        Hasil di Aturan Ringkas ({matchingRules.length})
                      </h2>
                    </div>

                    <div className="grid gap-3">
                      {matchingRules.map((rule) => {
                        const RuleIcon = rule.Icon;
                        return (
                          <div
                            key={rule.id}
                            className="flex gap-4 p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-orange-300 transition-all"
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                              style={{ background: rule.bg, borderColor: rule.border }}
                            >
                              <RuleIcon size={16} color={rule.color} />
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-sm font-bold text-ink-900">
                                {rule.title}
                              </h3>
                              <p className="text-xs text-ink-600 font-semibold leading-relaxed">
                                {rule.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Match Group 2: FAQ Usaha */}
                {matchingFAQ.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-neutral-200/60 pb-2">
                      <HelpCircle size={16} className="text-orange-600" />
                      <h2 className="text-sm font-extrabold text-ink-900 font-display uppercase tracking-wider">
                        Hasil di FAQ Usaha ({matchingFAQ.length})
                      </h2>
                    </div>

                    <div className="grid gap-3">
                      {matchingFAQ.map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1.5"
                        >
                          <h3 className="text-sm font-extrabold text-ink-900 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            {faq.question}
                          </h3>
                          <p className="text-xs text-ink-600 font-semibold leading-relaxed pl-3.5">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Group 3: Syarat & Ketentuan (Pasal 1 - 22) */}
                {matchingPasalList.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-neutral-200/60 pb-2">
                      <Scale size={16} className="text-orange-600" />
                      <h2 className="text-sm font-extrabold text-ink-900 font-display uppercase tracking-wider">
                        Hasil di Syarat & Ketentuan Pasal ({matchingPasalList.length})
                      </h2>
                    </div>

                    <div className="grid gap-3">
                      {matchingPasalList.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-black font-mono">
                              {p.pasalNumber}
                            </span>
                            <h3 className="text-sm font-bold text-ink-900">
                              {p.title}
                            </h3>
                          </div>
                          <p className="text-xs text-ink-700 font-semibold leading-relaxed bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                            {p.itemText}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Standard Tabbed Mode (When Search Input is Empty) */
          <>
            {/* Navigation Tabs */}
            <div className="flex p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200/60 max-w-lg shadow-3xs">
              {[
                { id: "rules", label: "Aturan Ringkas", icon: ShieldCheck },
                { id: "faq", label: "FAQ Usaha", icon: HelpCircle },
                { id: "terms", label: "Syarat & Ketentuan (Pasal 1-22)", icon: Scale },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={cn(
                      "flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap",
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/10"
                        : "text-ink-600 hover:text-ink-900 hover:bg-white/60"
                    )}
                  >
                    <TabIcon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Rules Panel */}
            {activeTab === "rules" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center border-b border-neutral-200/60 pb-3">
                  <h2 className="text-[1.05rem] font-[800] text-ink-900 font-display">
                    Aturan Utama Operasional Platform
                  </h2>
                  <span className="text-[0.74rem] font-bold text-ink-400">
                    Versi Resmi 3.1
                  </span>
                </div>

                <div className="grid gap-4">
                  {RULES_DATA.map((rule) => {
                    const RuleIcon = rule.Icon;
                    return (
                      <div
                        key={rule.id}
                        className="flex gap-4 p-5 rounded-[26px] bg-white border border-neutral-200/60 shadow-[0_4px_16px_rgba(15,23,42,.05)] hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300/80 transition-all duration-300"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            background: rule.bg,
                            borderColor: rule.border,
                          }}
                        >
                          <RuleIcon size={18} color={rule.color} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-[0.92rem] font-bold text-ink-900">
                            {rule.id}. {rule.title}
                          </h3>
                          <p className="text-[0.84rem] text-ink-600 leading-relaxed font-semibold">
                            {rule.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: FAQ Panel */}
            {activeTab === "faq" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center border-b border-neutral-200/60 pb-3">
                  <h2 className="text-[1.05rem] font-[800] text-ink-900 font-display">
                    Pertanyaan Sering Diajukan (FAQ)
                  </h2>
                  <span className="text-[0.74rem] font-bold text-ink-400">
                    Versi Resmi 3.1
                  </span>
                </div>

                <div className="space-y-4">
                  <span className="block text-[0.66rem] font-[800] text-ink-400 uppercase tracking-widest mb-2.5">
                    Operasional & Keuangan (Biaya 2%, Escrow, Withdrawal)
                  </span>

                  <div className="grid gap-3.5">
                    {FAQ_DATA.map((faq, idx) => {
                      const isOpen = openFAQIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="rounded-[26px] border border-neutral-200/60 bg-white overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,.05)] hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300/80 transition-all duration-300"
                        >
                          <button
                            onClick={() => toggleFAQ(idx)}
                            className="w-full flex items-center justify-between p-5 text-left font-bold text-[0.9rem] text-ink-900 hover:bg-neutral-50/50 transition-all cursor-pointer"
                          >
                            <span>{faq.question}</span>
                            <ChevronDown
                              size={16}
                              className={cn(
                                "text-ink-400 transition-transform duration-200 shrink-0 ml-4",
                                isOpen && "rotate-180 text-orange-500"
                              )}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 pt-1 text-[0.84rem] text-ink-600 leading-relaxed font-semibold border-t border-neutral-100 bg-neutral-50/20 animate-in fade-in slide-in-from-top-1 duration-200">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Terms & Conditions (Clean 2-Column Reader View for Pasal 1 - 22) */}
            {activeTab === "terms" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Callout Summary Box */}
                <div className="p-5 rounded-2xl border border-orange-200 bg-orange-50/60 text-[0.84rem] leading-relaxed text-orange-900 relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-orange-500" />
                  <span className="block font-bold mb-1 text-orange-800 uppercase tracking-wider text-[0.72rem]">
                    Ketentuan Resmi Biaya Platform & Escrow (Versi 3.1)
                  </span>
                  (a) Biaya platform resmi Marketiv adalah 2% per transaksi (Pasal 9.1). Dibebankan ke UMKM di awal (baik Campaign maupun Rate Card Mode); Kreator menerima pendapatan flat netto penuh (0%). <br />
                  (b) Seluruh transaksi wajib melalui sistem Escrow Marketiv & Payment Gateway Midtrans. Dilarang bertransaksi atau mengalihkan pembayaran ke luar platform.
                </div>

                {/* 2-Column Reader Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Jump Navigation BAB (Sticky TOC) */}
                  <div className="lg:col-span-4 lg:sticky lg:top-6 bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-sm space-y-3">
                    <span className="text-[0.68rem] font-[800] text-ink-400 uppercase tracking-widest block px-2">
                      Daftar BAB S&K (Pasal 1 - 22)
                    </span>
                    <div className="space-y-1.5">
                      {CHAPTERS_DATA.map((ch) => {
                        const isActive = activeChapterId === ch.id;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => scrollToChapter(ch.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-2 border text-xs font-bold",
                              isActive
                                ? "bg-orange-50 border-orange-300 text-orange-900 shadow-xs"
                                : "bg-neutral-50/60 border-neutral-200/60 text-ink-700 hover:bg-neutral-100 hover:text-ink-900"
                            )}
                          >
                            <div className="min-w-0">
                              <span className="text-[10px] font-black text-orange-600 block uppercase font-mono">
                                {ch.bab}
                              </span>
                              <span className="truncate block font-extrabold">{ch.title}</span>
                            </div>
                            <ChevronRight
                              size={14}
                              className={cn("shrink-0 text-slate-400", isActive && "text-orange-600")}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Continuous Document Stream */}
                  <div className="lg:col-span-8 space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm">
                    {matchingChapters.map((ch) => (
                      <div id={ch.id} key={ch.id} className="space-y-6 pt-2 first:pt-0">
                        {/* Chapter Title Header */}
                        <div className="border-b-2 border-orange-500/20 pb-3">
                          <span className="text-xs font-black text-orange-600 tracking-wider font-mono uppercase">
                            {ch.bab}
                          </span>
                          <h2 className="text-lg sm:text-xl font-black text-ink-900 font-display">
                            {ch.title}
                          </h2>
                        </div>

                        {/* Pasal Stream */}
                        <div className="space-y-6">
                          {ch.pasalList.map((p, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 space-y-3"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="px-2.5 py-0.5 rounded-md bg-orange-600 text-white text-xs font-black font-mono">
                                  {p.pasalNumber}
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-ink-900">
                                  {p.title}
                                </h3>
                              </div>

                              <div className="space-y-2 text-xs sm:text-sm text-ink-700 leading-relaxed font-semibold pl-1">
                                {p.items.map((it, itIdx) => (
                                  <div key={itIdx} className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                                    <span>{it}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Support Card */}
        <div className="mt-8 p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold font-display flex items-center justify-center md:justify-start gap-2">
              <BookOpen size={18} className="text-orange-400" />
              Punya Pertanyaan Lain Seputar Kebijakan?
            </h4>
            <p className="text-xs text-slate-300 font-medium max-w-lg">
              Tim Support Marketiv siap membantu menjawab pertanyaan Anda melalui Email resmi di <strong className="text-white">marketiv.official@gmail.com</strong> atau WhatsApp resmi Admin.
            </p>
          </div>

          <a
            href="mailto:marketiv.official@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition-colors shrink-0 no-underline shadow-md shadow-orange-500/20"
          >
            <span>Hubungi Support</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </UmkmPageWrapper>
    </UmkmDashboardChrome>
  );
}
