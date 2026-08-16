type ChatbotAudience = "landing" | "umkm" | "creator";

export interface ChatbotPageKnowledge {
  label: string;
  purpose: string;
  features: string[];
  questions?: string[];
}

interface PageRule extends ChatbotPageKnowledge {
  path: string;
  match: "exact" | "prefix";
}

const LANDING_CONTEXT: ChatbotPageKnowledge = {
  label: "Beranda Marketiv",
  purpose: "Mengenalkan Marketiv dan membantu pengunjung memilih layanan untuk UMKM atau Kreator.",
  features: ["informasi platform", "Campaign Mode", "Rate Card Mode", "pendaftaran akun"],
};

const UMKM_OVERVIEW: ChatbotPageKnowledge = {
  label: "Dashboard UMKM",
  purpose: "Memberikan ringkasan aktivitas promosi, campaign, kolaborasi Kreator, dan kondisi keuangan UMKM.",
  features: ["ringkasan campaign", "aktivitas Kreator", "status kolaborasi", "ringkasan performa"],
  questions: [
    "Apa fungsi utama Dashboard UMKM?",
    "Apa yang perlu saya lakukan pertama kali sebagai UMKM?",
    "Bagaimana cara mulai membuat campaign?",
    "Di mana saya bisa melihat progres campaign?",
    "Bagaimana cara mencari Kreator yang sesuai?",
    "Di mana saya bisa memantau transaksi UMKM?",
    "Bagaimana cara membaca performa promosi?",
    "Apa perbedaan Campaign Mode dan Rate Card Mode untuk UMKM?",
  ],
};

const CREATOR_OVERVIEW: ChatbotPageKnowledge = {
  label: "Dashboard Kreator",
  purpose: "Memberikan ringkasan peluang kerja, pekerjaan aktif, penghasilan, dan aktivitas Kreator.",
  features: ["ringkasan job", "pekerjaan aktif", "ringkasan penghasilan", "aktivitas terbaru"],
  questions: [
    "Apa fungsi utama Dashboard Kreator?",
    "Apa yang perlu saya lakukan pertama kali sebagai Kreator?",
    "Bagaimana cara mencari campaign yang tersedia?",
    "Di mana saya melihat pekerjaan yang sedang aktif?",
    "Bagaimana cara mengatur rate card?",
    "Di mana saya bisa memantau penghasilan?",
    "Bagaimana cara mengirim bukti konten?",
    "Apa perbedaan Campaign Mode dan Rate Card Mode untuk Kreator?",
  ],
};

const PAGE_RULES: Record<"umkm" | "creator", PageRule[]> = {
  umkm: [
    {
      path: "/dashboard/umkm/campaign/buat",
      match: "prefix",
      label: "Buat Campaign UMKM",
      purpose: "Menyusun dan menerbitkan campaign promosi baru untuk Kreator.",
      features: ["tipe campaign", "detail produk", "brief dan arahan konten", "aset", "budget", "review sebelum publish"],
    },
    {
      path: "/dashboard/umkm/campaign/",
      match: "prefix",
      label: "Detail Campaign UMKM",
      purpose: "Melihat detail, status, budget, performa, dan aktivitas Kreator pada satu campaign.",
      features: ["status campaign", "budget", "brief", "submission atau klaim", "performa campaign"],
    },
    {
      path: "/dashboard/umkm/campaign",
      match: "prefix",
      label: "Campaign UMKM",
      purpose: "Membuat, mencari, dan memantau seluruh campaign milik UMKM.",
      features: ["daftar campaign", "status campaign", "budget", "buat campaign baru", "filter dan pencarian"],
      questions: [
        "Bagaimana cara membuat campaign baru?",
        "Apa arti setiap status campaign?",
        "Bagaimana cara melihat campaign yang masih aktif?",
        "Bagaimana budget campaign digunakan?",
        "Apa perbedaan campaign UGC dan Clipping?",
        "Bagaimana cara mencari campaign tertentu?",
        "Kenapa campaign saya belum aktif?",
        "Bisakah campaign yang sudah dibuat diedit?",
        "Bagaimana cara memantau Kreator yang mengklaim campaign?",
        "Apa yang terjadi ketika budget campaign habis?",
      ],
    },
    {
      path: "/dashboard/umkm/kreator/",
      match: "prefix",
      label: "Profil Kreator untuk UMKM",
      purpose: "Menilai profil, portofolio, niche, dan rate card Kreator sebelum memulai kolaborasi.",
      features: ["profil Kreator", "portofolio", "niche", "rate card", "inisiasi negosiasi"],
    },
    {
      path: "/dashboard/umkm/kreator",
      match: "prefix",
      label: "Direktori Kreator UMKM",
      purpose: "Mencari dan membandingkan Kreator yang sesuai dengan kebutuhan promosi UMKM.",
      features: ["pencarian Kreator", "filter niche", "portofolio", "rate card", "profil Kreator"],
    },
    {
      path: "/dashboard/umkm/negosiasi/",
      match: "prefix",
      label: "Ruang Negosiasi UMKM",
      purpose: "Berkomunikasi dengan Kreator, menyepakati deliverables, dan mengirim Custom Offer.",
      features: ["chat", "negosiasi harga", "deliverables", "Custom Offer", "status order"],
    },
    {
      path: "/dashboard/umkm/negosiasi",
      match: "prefix",
      label: "Negosiasi UMKM",
      purpose: "Memantau seluruh percakapan, penawaran, dan progres kolaborasi Rate Card.",
      features: ["daftar percakapan", "status penawaran", "status order", "lanjutkan negosiasi"],
    },
    {
      path: "/dashboard/umkm/keuangan",
      match: "prefix",
      label: "Keuangan UMKM",
      purpose: "Memantau arus dana kolaborasi dan seluruh transaksi UMKM di Marketiv.",
      features: [
        "total pengeluaran",
        "dana aman tersimpan di escrow",
        "pembayaran yang perlu diselesaikan",
        "pengembalian dana",
        "biaya platform",
        "pencarian, filter, detail, dan riwayat transaksi",
        "ekspor laporan keuangan",
      ],
      questions: [
        "Apa fungsi halaman Keuangan UMKM?",
        "Apa arti total pengeluaran di halaman ini?",
        "Apa maksud dana aman tersimpan di escrow?",
        "Di mana saya melihat pembayaran yang belum selesai?",
        "Bagaimana cara melihat detail transaksi?",
        "Bagaimana cara mencari atau memfilter transaksi?",
        "Apa fungsi pengembalian dana?",
        "Bagaimana biaya platform dihitung?",
        "Bagaimana cara mengekspor laporan keuangan?",
        "Kapan dana escrow dicairkan kepada Kreator?",
      ],
    },
    {
      path: "/dashboard/umkm/analitik",
      match: "prefix",
      label: "Analitik UMKM",
      purpose: "Menganalisis performa campaign dan efektivitas promosi berbasis data.",
      features: ["views", "performa campaign", "tren", "perbandingan hasil", "insight promosi"],
    },
    {
      path: "/dashboard/umkm/notifikasi",
      match: "prefix",
      label: "Notifikasi UMKM",
      purpose: "Melihat pembaruan penting tentang campaign, pembayaran, negosiasi, dan kolaborasi.",
      features: ["daftar notifikasi", "status terbaca", "pembaruan campaign", "pembaruan transaksi"],
    },
    {
      path: "/dashboard/umkm/panduan",
      match: "prefix",
      label: "Panduan UMKM",
      purpose: "Mempelajari aturan dan cara memakai fitur Marketiv sebagai UMKM.",
      features: ["FAQ", "aturan platform", "panduan Campaign Mode", "panduan Rate Card Mode"],
    },
    {
      path: "/dashboard/umkm/pengaturan",
      match: "prefix",
      label: "Pengaturan UMKM",
      purpose: "Mengelola profil bisnis dan pengaturan akun UMKM.",
      features: ["identitas bisnis", "kontak", "logo", "preferensi akun"],
    },
    { path: "/dashboard/umkm", match: "exact", ...UMKM_OVERVIEW },
  ],
  creator: [
    {
      path: "/dashboard/kreator/job-pool/",
      match: "prefix",
      label: "Detail Job Kreator",
      purpose: "Menilai detail campaign sebelum Kreator mengklaim pekerjaan.",
      features: ["brief", "syarat campaign", "reward", "deadline", "klaim job"],
    },
    {
      path: "/dashboard/kreator/job-pool",
      match: "prefix",
      label: "Job Pool Kreator",
      purpose: "Mencari campaign tersedia yang cocok dengan niche dan kemampuan Kreator.",
      features: ["daftar campaign", "filter", "reward", "tipe UGC atau Clipping", "klaim job"],
    },
    {
      path: "/dashboard/kreator/pekerjaan-aktif/",
      match: "prefix",
      label: "Detail Pekerjaan Kreator",
      purpose: "Mengerjakan campaign yang sudah diklaim dan mengirim bukti hasil konten.",
      features: ["brief kerja", "deadline", "status pekerjaan", "tautan konten", "submission bukti"],
    },
    {
      path: "/dashboard/kreator/pekerjaan-aktif",
      match: "prefix",
      label: "Pekerjaan Aktif Kreator",
      purpose: "Memantau seluruh campaign yang sedang dikerjakan Kreator.",
      features: ["daftar pekerjaan", "deadline", "status klaim", "status submission", "lanjutkan pekerjaan"],
    },
    {
      path: "/dashboard/kreator/rate-card",
      match: "prefix",
      label: "Rate Card Kreator",
      purpose: "Mengatur paket layanan dan harga tetap yang ditawarkan kepada UMKM.",
      features: ["paket layanan", "harga", "deliverables", "status tayang", "edit rate card"],
    },
    {
      path: "/dashboard/kreator/negosiasi/",
      match: "prefix",
      label: "Ruang Negosiasi Kreator",
      purpose: "Berkomunikasi dengan UMKM dan meninjau atau merespons Custom Offer.",
      features: ["chat", "deliverables", "harga", "Custom Offer", "terima atau tolak penawaran"],
    },
    {
      path: "/dashboard/kreator/negosiasi",
      match: "prefix",
      label: "Negosiasi Kreator",
      purpose: "Memantau percakapan, penawaran, dan progres kolaborasi Rate Card.",
      features: ["daftar percakapan", "status penawaran", "status order", "lanjutkan negosiasi"],
    },
    {
      path: "/dashboard/kreator/keuangan",
      match: "prefix",
      label: "Keuangan Kreator",
      purpose: "Memantau penghasilan dan mengelola saldo Kreator di Marketiv.",
      features: [
        "saldo tersedia",
        "total dan sumber penghasilan",
        "penghasilan Campaign dan Rate Card",
        "pencarian, filter, detail, dan riwayat transaksi",
        "penarikan dana ke bank atau e-wallet",
      ],
      questions: [
        "Apa fungsi halaman Keuangan Kreator?",
        "Apa arti saldo tersedia?",
        "Di mana saya melihat sumber penghasilan?",
        "Bagaimana cara melihat riwayat transaksi?",
        "Bagaimana cara menarik penghasilan Kreator?",
        "Berapa minimum penarikan dana?",
        "Apakah penarikan dana dikenakan biaya?",
        "Bagaimana cara memilih bank atau e-wallet tujuan?",
        "Apa perbedaan penghasilan Campaign dan Rate Card?",
        "Kenapa saldo saya belum bertambah?",
      ],
    },
    {
      path: "/dashboard/kreator/profil",
      match: "prefix",
      label: "Profil Kreator",
      purpose: "Melihat dan mengelola identitas profesional Kreator yang ditampilkan kepada UMKM.",
      features: ["identitas Kreator", "niche", "portofolio", "status verifikasi", "informasi profil yang terlihat UMKM"],
    },
    {
      path: "/dashboard/kreator/notifikasi",
      match: "prefix",
      label: "Notifikasi Kreator",
      purpose: "Melihat pembaruan job, submission, negosiasi, dan penghasilan Kreator.",
      features: ["daftar notifikasi", "status terbaca", "pembaruan pekerjaan", "pembaruan transaksi"],
    },
    {
      path: "/dashboard/kreator/panduan",
      match: "prefix",
      label: "Panduan Kreator",
      purpose: "Mempelajari aturan dan cara memakai fitur Marketiv sebagai Kreator.",
      features: ["FAQ", "aturan platform", "panduan klaim campaign", "panduan Rate Card"],
    },
    {
      path: "/dashboard/kreator/settings",
      match: "prefix",
      label: "Pengaturan Kreator",
      purpose: "Mengelola profil, payout, dan pengaturan akun Kreator.",
      features: ["identitas akun", "portofolio", "rekening atau e-wallet", "preferensi akun"],
    },
    { path: "/dashboard/kreator", match: "exact", ...CREATOR_OVERVIEW },
  ],
};

function normalizePath(path: string): string {
  const normalized = path.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  return normalized || "/";
}

export function resolveChatbotPageKnowledge(
  audience: ChatbotAudience,
  currentPath: string,
): ChatbotPageKnowledge {
  if (audience === "landing") return LANDING_CONTEXT;

  const path = normalizePath(currentPath);
  const match = PAGE_RULES[audience].find((rule) =>
    rule.match === "exact" ? path === rule.path : path.startsWith(rule.path),
  );

  return match ?? (audience === "umkm" ? UMKM_OVERVIEW : CREATOR_OVERVIEW);
}
