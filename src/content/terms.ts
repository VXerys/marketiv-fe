export interface TermsChapter {
  id: string;
  bab: string;
  title: string;
  pasalList: {
    pasalNumber: string;
    title: string;
    items: string[];
  }[];
}

export const TERMS_VERSION = "v3.1";

export const TERMS_CHAPTERS: TermsChapter[] = [
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
          "b. Rate Card Mode: UMKM membayar tepat sesuai harga paket/Custom Offer tanpa biaya tambahan. Biaya platform 2% dipotong dari pendapatan Kreator saat pelepasan escrow.",
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
