export const NAVBAR_CONTENT = {
  links: [
    { label: "BERANDA", href: "/" },
    { label: "JELAJAH", href: "/jelajah" },
    { label: "PANDUAN", href: "/panduan" },
    { label: "TENTANG KAMI", href: "/tentang-kami" },
  ],
  cta: {
    masuk: "MASUK",
    daftar: "DAFTAR",
    daftarKreator: "DAFTAR SEBAGAI KREATOR",
    daftarUmkm: "DAFTAR SEBAGAI UMKM",
  },
};

export const LANDING_CONTENT = {
  hero: {
    tagline: "Platform Marketing No. 1 Indonesia",
    titleAccent: "Kolaborasi Hebat,",
    titleMain: "Bisnis Melesat.",
    subtitle:
      "Marketiv menghubungkan UMKM dengan Mikro-Kreator lokal. Promosi produk berbasis performa — bayar sesuai views, bukan janji.",
    ctaUmkm: "Saya Pemilik UMKM",
    ctaCreator: "Saya Konten Kreator",
    toggleUmkm: "UMKM",
    toggleKreator: "Kreator",
    trustLine: "Dipercaya Oleh Ratusan UMKM Di Seluruh Indonesia",
    mockupCard: {
      payoutId: "Payout #2047",
      views: "250K",
      amount: "Rp1.400.000",
      label: "Saldo Masuk",
      date: "24 Jul, 19:00",
      status: "Approved",
    },
  },
  howItWorks: {
    badge: "Gimana Cara Kerjanya?",
    titleAccent: "3 langkah mudah.",
    titleMain: "Tinggal kolaborasi, bisnis melesat.",
    steps: [
      {
        id: 1,
        title: "Buat Campaign atau Temukan Kreator",
        description: "UMKM buat campaign dengan brief — bisa dibantu AI — lalu tentukan budget dan tarif per views. Atau langsung browse katalog kreator dan pilih paket yang sesuai.",
        mockupLabel: "Buat Campaign",
      },
      {
        id: 2,
        title: "Kreator Klaim & Eksekusi",
        description: "Kreator klaim campaign, buat konten sesuai brief, lalu posting di TikTok dan kirim link ke sistem. Atau terima pesanan Rate Card dan upload hasil kerjanya.",
        accounts: [
          { name: "TikTok", connected: true, count: "Akun TikTok terhubung" }
        ],
      },
      {
        id: 3,
        title: "Konten Diverifikasi & Bayaran Aman",
        description: "Sistem secara otomatis mengecek keaslian konten. Setelah UMKM menyetujui, reward langsung masuk ke dompet kreator. Dana Rate Card baru dilepas begitu hasil kerja disetujui.",
        mockupViews: "250K",
        mockupPayout: "Rp1.500.000",
        mockupStatus: "Disetujui",
      },
    ],
  },
  features: {
    badge: "Dua Mode Kolaborasi",
    titleAccent: "Pilih cara kolaborasi",
    titleMain: "yang paling cocok untukmu.",
    campaign: {
      tag: "Campaign Mode",
      title: "Bayar Berdasarkan Views",
      description:
        "UMKM buat brief campaign — bisa dibantu AI — lalu kreator pilih dan klaim. Kreator posting konten di TikTok, sistem mengecek keaslian views, dan reward masuk ke dompet kreator setelah disetujui. Tanpa negosiasi, tanpa revisi.",
      points: [
        "Bayar sesuai jumlah views nyata",
        "Tanpa komunikasi langsung — efisien",
        "Keaslian konten dicek secara otomatis",
        "Budget terkontrol & transparan",
      ],
    },
    rateCard: {
      tag: "Rate Card Mode",
      title: "Pesan Jasa Kreator dengan Dana Terjamin",
      description:
        "UMKM browse katalog kreator, pilih paket langsung atau ajukan penawaran harga via chat. Dana UMKM langsung diamankan sistem begitu deal terjadi. Kreator upload hasil kerja, UMKM review — bisa minta revisi. Dana baru dilepas ke kreator setelah UMKM setuju.",
      points: [
        "Pilih paket langsung atau negosiasi via chat",
        "Dana diamankan sistem — bukan langsung ke kreator",
        "Bisa minta revisi sesuai batas paket yang dipilih",
        "Pembayaran aman melalui Midtrans",
      ],
    },
  },
  estimator: {
    badge: "Hitung Potensi Kamu",
    titleAccent: "Berapa yang bisa kamu dapat?",
    titleMain: "Geser slider untuk estimasi penghasilan.",
    totalBudgetText: "Total budget campaign aktif",
    totalBudget: "Rp 500 Juta+",
    cpmLabel: "Estimasi CPM",
    cpmValue: "Rp 5.000 – Rp 7.500",
    cpmNote: "per 1.000 views (tergantung campaign)",
    sliderMin: 1000,
    sliderMax: 1000000,
    sliderDefault: 250000,
    resultPrefix: "Kalau konten kamu dapet",
    resultSuffix: "views, kamu dapat estimasi",
    cpmRate: 6, // Rp 6.000 per 1.000 views (midpoint estimasi)
  },
  transparency: {
    badge: "Transparan & Real-Time",
    titleAccent: "Semua serba terbuka,",
    titleMain: "tidak ada yang disembunyikan.",
    budgetCard: {
      title: "Budget Campaign",
      totalLabel: "Total Budget",
      totalValue: "Rp 10.000.000",
      remainingLabel: "Sisa Budget",
      remainingPercent: 64,
      minViewLabel: "Min. Views",
      minViewValue: "1.000",
      cpmLabel: "CPM Rate",
      cpmValue: "Rp 6.000 / 1K views",
    },
    trackingCard: {
      title: "Live Submission Kreator",
      tabs: ["Semua", "Pending", "Approved", "Rejected"],
      rows: [
        { username: "@kopi_budi_tt", views: "320K", payout: "Rp 1.920.000", status: "Approved" },
        { username: "@sari_clips_tt", views: "180K", payout: "Rp 1.080.000", status: "Approved" },
        { username: "@andi_tiktok", views: "95K", payout: "Rp 570.000", status: "Pending" },
        { username: "@dina_creator", views: "55K", payout: "Rp 330.000", status: "Pending" },
      ],
    },
  },
  faq: {
    badge: "FAQ",
    title: "Pertanyaan yang Sering Ditanyakan",
    items: [
      {
        q: "Apa itu Marketiv?",
        a: "Marketiv adalah platform yang menghubungkan UMKM dengan Kreator Konten lokal Indonesia. UMKM bisa mempromosikan produk melalui dua cara: Campaign (bayar sesuai jumlah views nyata) dan Rate Card (pesan jasa kreator langsung dengan sistem yang mengamankan dana hingga pekerjaan selesai).",
      },
      {
        q: "Bagaimana UMKM membuat campaign?",
        a: "UMKM daftar, lalu buat campaign dengan mengisi informasi produk dan upload aset video — bisa upload langsung ke platform atau pakai link dari Google Drive atau Dropbox. Ada fitur AI yang membantu membuat panduan konten otomatis. Setelah ditentukan budget dan tarif per views, campaign langsung bisa diklaim oleh kreator.",
      },
      {
        q: "Bagaimana Kreator mendapat bayaran?",
        a: "Di Campaign: Kreator posting konten di TikTok dan kirim link postingan ke sistem. Sistem mengecek keaslian konten secara otomatis. Setelah UMKM menyetujui, reward masuk ke dompet kreator. Di Rate Card: begitu UMKM menyetujui hasil kerja yang dikirimkan kreator, dana yang sudah dipegang sistem langsung dilepas ke dompet kreator.",
      },
      {
        q: "Bagaimana cara menarik saldo?",
        a: "Kreator bisa mengajukan penarikan saldo dari halaman Dompet kapan saja, dengan minimum penarikan Rp50.000. Isi data rekening bank, lalu tim Marketiv akan memproses dan mentransfer dana. Perlu diingat: saldo dari Campaign yang masih dalam tahap verifikasi belum bisa langsung ditarik.",
      },
      {
        q: "Apa bedanya Campaign Mode dan Rate Card Mode?",
        a: "Campaign: UMKM buka campaign publik, kreator posting konten di TikTok, bayar sesuai views yang terverifikasi — cocok untuk promosi luas tanpa perlu komunikasi langsung. Rate Card: UMKM memilih kreator tertentu, bisa langsung pesan paket atau negosiasi harga via chat, ada proses revisi, dan sistem menjamin dana aman — cocok jika butuh konten dengan kualitas spesifik.",
      },
      {
        q: "Apakah dana saya aman?",
        a: "Ya. Di Rate Card, dana UMKM tidak langsung masuk ke kreator — melainkan dipegang sistem hingga hasil kerja disetujui, lalu baru dilepas. Di Campaign, reward hanya dihitung dan dibayar setelah konten terverifikasi nyata oleh sistem, bukan dari views palsu atau konten duplikat.",
      },
    ],
  },
  footer: {
    tagline: "Platform kolaborasi UMKM & Kreator terpercaya di Indonesia.",
    nav: {
      title: "Navigasi",
      links: [
        { label: "Beranda", href: "/" },
        { label: "Panduan", href: "/panduan" },
        { label: "Tentang Kami", href: "/tentang-kami" },
        { label: "Jelajah Kreator", href: "/jelajah" },
      ],
    },
    legal: {
      title: "Legal",
      links: [
        { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
        { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
      ],
    },
    contact: {
      title: "Kontak",
      email: "hello@marketiv.id",
      whatsapp: "+62 812-3456-7890",
    },
    copyright: "© 2026 Marketiv.",
  },
};

export const UMKM_CONTENT = {
  hero: {
    title: "Temukan Kolaborasi Bisnis Impianmu",
    subtitle: "Jelajahi berbagai campaign konten kreator untuk promosi produk yang lebih berdampak",
    searchPlaceholder: "Cari Campaign.........",
  },
  grid: {
    title: "Temuan Campaign UMKM",
  },
};

export const CREATOR_CONTENT = {
  hero: {
    title: "Temukan Campaign untuk Konten Kreator",
    subtitle: "Jelajahi campaign dari UMKM dan dapatkan kesempatan kolaborasi yang menguntungkan",
    searchPlaceholder: "Search Campaign...",
  },
  grid: {
    title: "Temuan Campaign Konten Kreator",
  },
};

export const CARD_CONTENT = {
  labels: {
    rate: "Rate",
    minView: "Min. View",
    budgetUsed: "Budget Terpakai",
    from: "dari",
    ctaPrimary: "Ambil Campaign",
    ctaSecondary: "Detail",
  },
};

