# Marketiv — Platform Marketplace Hibrida UMKM & Kreator Mikro

> **Untuk AI Coding Assistant (GitHub Copilot / Cursor / dll):**
> Dokumen ini adalah **entry point** proyek Marketiv. Baca dokumen ini terlebih dahulu, kemudian lanjut ke dokumen spesifik sesuai kebutuhan. Semua keputusan arsitektur, logika bisnis, batasan fitur, dan struktur database **wajib mengacu pada dokumen-dokumen ini**.

---

## Navigasi Dokumentasi

| Dokumen | Isi |
|---------|-----|
| **README.md** ← (kamu di sini) | Gambaran umum, tech stack, arsitektur, struktur folder, env vars |
| **[docs/FEATURES.md](docs/FEATURES.md)** | Semua modul fitur: Auth, Campaign Mode, Rate Card Mode, Keuangan & Escrow, AI, Admin |
| **[docs/DATABASE.md](docs/DATABASE.md)** | Skema database lengkap (ERD, DDL SQL, relasi antar tabel) |
| **[docs/TECHNICAL_GUIDELINES.md](docs/TECHNICAL_GUIDELINES.md)** | Non-fungsional, UI/UX, navigasi halaman, batasan sistem, integrasi eksternal, model bisnis |

---

## 1. Gambaran Umum Proyek

### 1.1 Deskripsi Produk

**Marketiv** adalah platform **Software as a Service (SaaS) berbasis web** dengan model bisnis **Hybrid Marketplace**. Platform ini menghubungkan dua sisi pasar:

- **Sisi Demand → UMKM (Usaha Mikro, Kecil, Menengah):** Pelaku usaha daerah yang membutuhkan jasa pemasaran digital berbasis konten video pendek (TikTok/Instagram Reels), namun memiliki literasi digital terbatas dan rentan tertipu oleh "buzzer bodong".
- **Sisi Supply → Kreator Mikro:** Generasi Z / mahasiswa yang memiliki keahlian editing video dan literasi media sosial tinggi, namun kesulitan mendapat monetisasi awal karena follower belum memenuhi syarat platform agensi besar.

### 1.2 Tiga Masalah yang Diselesaikan

| # | Masalah | Solusi Marketiv |
|---|---------|-----------------|
| 1 | UMKM sering tertipu buzzer bodong (bayar mahal di muka, tidak ada hasil nyata) | Sistem **Escrow** — dana UMKM ditahan, baru cair ke kreator setelah views tervalidasi |
| 2 | UMKM tidak bisa menyusun naskah kampanye / brief pemasaran | Fitur **AI Brief Assistant** — UMKM cukup upload foto/deskripsi singkat, AI otomatis susun brief |
| 3 | Kreator Mikro (follower terbatas) sulit dapat job dari agensi | **Job Pool (Bursa Kerja)** — siapa cepat dia dapat, tidak ada syarat minimum follower |

### 1.3 Dua Mode Operasional Utama

```
MARKETIV
├── Campaign Mode (Viral / Performance-Based)
│   ├── UMKM upload brief + aset → masuk Job Pool
│   ├── Kreator klaim job → edit video → posting di akun pribadi
│   ├── Kreator submit URL TikTok/IG → sistem validasi views
│   ├── Dana Escrow cair ke kreator (tiered by views)
│   └── ❌ TIDAK ADA fitur Chat sama sekali di mode ini
│
└── Rate Card Mode (Premium / Fixed Price / Consultative)
    ├── UMKM cari kreator via direktori + filter
    ├── UMKM & Kreator negosiasi via Live Chat
    ├── Kesepakatan dikunci via "Custom Offer" widget
    ├── UMKM deposit ke Escrow
    ├── Kreator eksekusi konten → publikasi via Collab Post
    └── ✅ Live Chat AKTIF hanya di mode ini
```

### 1.4 Target Pasar

- **Beachhead Market:** Kabupaten & Kota Sukabumi, Jawa Barat
- **SOM (Serviceable Obtainable Market):** 10.000 UMKM di Sukabumi (F&B, Fashion, Pariwisata)
- **Target Tahun Pertama:** 500 UMKM aktif bertransaksi (5% market share SOM)
- **Target Kreator:** 2.000 kreator mikro/nano terverifikasi

### 1.5 Fase Pengembangan Saat Ini

Proyek berada di fase **MVP (Minimum Viable Product)**. Homepage sudah live. Fokus sekarang:
- Membangun dashboard fitur inti (Campaign Mode + Rate Card Mode)
- Mematangkan arsitektur backend AI

---

## 2. Tech Stack & Arsitektur

### 2.1 Stack yang Digunakan

```
Frontend     : Next.js (App Router) + React
Styling      : Tailwind CSS (konfigurasi via tailwind.config.ts + Design Tokens)
Backend/DB   : Supabase (PostgreSQL + Auth + Realtime)
Auth         : Supabase Auth + JWT (JSON Web Token)
Payment      : Midtrans (Payment Gateway — Virtual Account & e-Wallet)
AI / LLM     : OpenAI API (GPT) — untuk Brief Assistant
Deployment   : Vercel atau Netlify (Serverless/Free Tier)
Storage      : Supabase Storage (maks 100MB per file) + URL eksternal (Google Drive/Dropbox)
```

### 2.2 Arsitektur Sistem (Decoupled Architecture)

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│   Browser UMKM (Mobile/Desktop) | Browser Kreator           │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTPS / JSON
┌───────────────────────▼──────────────────────────────────────┐
│                   FRONTEND LAYER                             │
│              Next.js App Router (Vercel)                     │
└──────────┬────────────────────────────┬─────────────────────┘
           │ REST API                   │ API Request
┌──────────▼─────────────┐    ┌─────────▼──────────────────────┐
│   BACKEND & DATABASE   │    │      EXTERNAL SERVICES         │
│  Supabase (PostgreSQL  │    │  - Midtrans (Payment Gateway)  │
│  + Auth + Realtime)    │    │  - Google Drive/Dropbox (File) │
└────────────────────────┘    │  - TikTok/Instagram (URL only) │
                              │  - OpenAI API (AI Brief)       │
                              └────────────────────────────────┘
```

### 2.3 Paradigma Desain

- **Mobile-First:** Semua UI dioptimalkan untuk smartphone (rasio 16:9) terlebih dahulu, baru scale-up ke tablet & desktop
- **Responsive:** Wajib responsif di Chrome, Edge, Safari (termasuk Safari iOS), versi 2 tahun terakhir
- **Decoupled:** Frontend dan Backend terpisah secara logis. Frontend hanya berkomunikasi dengan Backend via RESTful API + JSON
- **Serverless/BaaS:** Tidak boleh menggunakan Dedicated Server fisik berbayar pada fase MVP. Wajib maksimalkan Free Tier (Supabase, Vercel)

### 2.4 Prinsip API

- Protocol: RESTful API
- Format: JSON
- Auth Header: `Authorization: Bearer <JWT_TOKEN>`
- HTTP Status Standard:
  - `200 OK` — Berhasil
  - `201 Created` — Data baru dibuat
  - `400 Bad Request` — Validasi gagal (contoh: file > 100MB)
  - `401 Unauthorized` — Token tidak valid/expired
  - `403 Forbidden` — Akses ditolak (role tidak sesuai)
  - `404 Not Found` — Data tidak ditemukan
  - `500 Internal Server Error` — Error server

---

## 3. Struktur Folder Proyek

```
marketiv/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Route group: halaman publik (tanpa layout dashboard)
│   │   ├── tentang-kami/
│   │   ├── page.tsx              # Landing Page
│   │   ├── panduan/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/
│   │   ├── umkm/                 # Dashboard UMKM (protected)
│   │   │   ├── page.tsx          # Ringkasan / Home Dashboard UMKM
│   │   │   ├── campaign/
│   │   │   │   ├── page.tsx      # Daftar Campaign
│   │   │   │   ├── buat/
│   │   │   │   │   └── page.tsx  # Form Wizard Buat Campaign
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Detail Campaign
│   │   │   ├── kreator/
│   │   │   │   ├── page.tsx      # Direktori Kreator
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Profil Kreator
│   │   │   ├── negosiasi/
│   │   │   │   ├── page.tsx      # Daftar Obrolan Rate Card
│   │   │   │   └── [id_order]/
│   │   │   │       └── page.tsx  # Room Chat + Custom Offer
│   │   │   └── keuangan/
│   │   │       └── page.tsx      # Riwayat Transaksi
│   │   │
│   │   └── kreator/              # Dashboard Kreator (protected)
│   │       ├── page.tsx          # Ringkasan / Home Dashboard Kreator
│   │       ├── job-pool/
│   │       │   ├── page.tsx      # Job Pool
│   │       │   └── [id]/
│   │       │       └── page.tsx  # Detail Campaign + Klaim
│   │       ├── pekerjaan-aktif/
│   │       │   ├── page.tsx      # Daftar Pekerjaan Aktif
│   │       │   └── [id]/
│   │       │       └── page.tsx  # Submit Bukti Tayang
│   │       ├── negosiasi/
│   │       │   ├── page.tsx
│   │       │   └── [id_order]/
│   │       │       └── page.tsx
│   │       ├── profil/
│   │       │   └── page.tsx      # Edit Profil Publik
│   │       ├── rate-card/
│   │       │   └── page.tsx      # Manajemen Rate Card
│   │       └── keuangan/
│   │           └── page.tsx      # Saldo + Withdrawal
│   │
│   ├── admin/                    # Panel Admin (protected, role=ADMIN)
│   │   ├── page.tsx
│   │   ├── disputes/
│   │   ├── submissions/
│   │   ├── users/
│   │   └── reports/
│   │
│   └── api/                      # API Routes (Server-side)
│       ├── auth/
│       ├── campaigns/
│       ├── submissions/
│       ├── rate-cards/
│       ├── orders/
│       ├── messages/
│       ├── transactions/
│       ├── ai/
│       │   └── generate-brief/   # POST — AI Brief Assistant
│       ├── payment/
│       │   ├── create/           # POST — Buat transaksi Midtrans
│       │   └── webhook/          # POST — Handler webhook Midtrans
│       └── admin/
│
├── components/                   # Komponen React yang bisa dipakai ulang
│   ├── ui/                       # Komponen UI dasar (Button, Input, Card, Modal, dll)
│   ├── layout/                   # Layout komponen (Navbar, Sidebar, Footer)
│   ├── campaign/                 # Komponen spesifik Campaign Mode
│   ├── rate-card/                # Komponen spesifik Rate Card Mode
│   ├── chat/                     # Komponen Live Chat
│   └── admin/                    # Komponen Admin Panel
│
├── lib/                          # Utilities & helpers
│   ├── supabase/
│   │   ├── client.ts             # Supabase browser client
│   │   └── server.ts             # Supabase server client (service role)
│   ├── midtrans.ts               # Midtrans client & helpers
│   ├── openai.ts                 # OpenAI client
│   ├── validations.ts            # Fungsi validasi (file size, URL, dll)
│   └── utils.ts                  # General utilities
│
├── types/                        # TypeScript type definitions
│   ├── database.ts               # Types untuk tabel database
│   └── api.ts                    # Types untuk request/response API
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Hook autentikasi
│   ├── useRealtime.ts            # Hook untuk Supabase Realtime (chat)
│   └── useCampaign.ts
│
├── docs/                         # Dokumentasi teknis lengkap
│   ├── FEATURES.md               # Spesifikasi semua modul fitur
│   ├── DATABASE.md               # Skema database & ERD
│   └── TECHNICAL_GUIDELINES.md  # Non-fungsional, UI/UX, integrasi, batasan
│
├── middleware.ts                 # Next.js middleware untuk proteksi route
├── tailwind.config.ts            # Konfigurasi Tailwind + Design Tokens
├── .env.local                    # Environment variables (TIDAK di-commit)
├── .env.example                  # Template environment variables (di-commit)
└── README.md                     # Dokumen ini
```

---

## 4. Environment Variables

```bash
# .env.example — Copy file ini menjadi .env.local dan isi dengan nilai nyata

# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here   # JANGAN expose ke client!

# ===== MIDTRANS =====
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxx           # Sandbox key untuk development
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxx  # Public (untuk Snap di browser)
MIDTRANS_IS_PRODUCTION=false                            # Ganti true untuk production

# ===== OPENAI =====
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxx            # JANGAN expose ke client!

# ===== APP =====
NEXT_PUBLIC_BASE_URL=http://localhost:3000              # Ganti dengan domain production

# ===== STORAGE (opsional jika pakai Supabase Storage) =====
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=marketiv-uploads
```

---

*Dokumen ini dihasilkan dari: SKPL Marketiv v5.0, Marketiv Final PPT, dan Proposal P2MW Marketiv — Universitas Nusa Putra, Sukabumi, 2026.*
