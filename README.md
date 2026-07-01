<div align="center">
  <img src="public/globe.svg" alt="Marketiv Logo" width="120" height="120" />

  # 🚀 Marketiv — Web Client Repository

  **Mendemokratisasi Pemasaran Digital Tanpa Risiko "Boncos" untuk UMKM Daerah.**

  [![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![P2MW 2025](https://img.shields.io/badge/P2MW-2025-FFD700?style=for-the-badge)](#-tim-pengembang-p2mw-2025--universitas-nusa-putra)
  [![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](#)

  <br/>

  [Tentang](#-tentang-proyek) · [Fitur Utama](#-mode-fitur-utama) · [Tech Stack](#%EF%B8%8F-tech-stack) · [Struktur Proyek](#-struktur-direktori-proyek) · [Memulai](#-panduan-memulai-getting-started) · [Tim](#-tim-pengembang-p2mw-2025--universitas-nusa-putra)

</div>

---

## 📖 Tentang Proyek

**Marketiv** adalah platform *marketplace hybrid* yang dirancang khusus untuk menjembatani **UMKM** (terutama di kota tier-2 seperti Sukabumi) dengan **Kreator Mikro** lokal. Proyek ini dikembangkan sebagai bagian dari **Program Pembinaan Mahasiswa Wirausaha (P2MW) 2025** — Universitas Nusa Putra.

### Masalah yang Diselesaikan

| # | Masalah UMKM | Solusi Marketiv |
|---|---|---|
| 1 | **Risiko Finansial Tinggi** — Bayar mahal di muka tanpa jaminan konten viral | Model **pay-per-view** — UMKM hanya bayar berdasarkan performa aktual |
| 2 | **Kualitas Buzzer Rendah** — Maraknya bot views dan engagement palsu | **Sistem deteksi fraud views** terintegrasi |
| 3 | **Literasi Digital Rendah** — Kesulitan menyusun *brief* pemasaran | **AI-Assisted Brief Builder** yang memandu UMKM langkah demi langkah |

### 🌟 Arsitektur *Dual-Ecosystem*

Sistem ini memisahkan dua ruang pengguna secara ketat pada level **routing**, **state management**, dan **UI/UX**:

| Ecosystem | Route | Karakteristik |
|---|---|---|
| 🏪 **Ruang UMKM** | `/dashboard/umkm/*` | UI *super-simple*, fokus pada efisiensi dan kemudahan penggunaan |
| 🎨 **Ruang Kreator** | `/dashboard/kreator/*` | Dashboard interaktif untuk manajemen pekerjaan dan portofolio |

> **Aturan Sistem:** Komponen dan *state* UMKM **tidak boleh bocor** atau digunakan di halaman Kreator, dan sebaliknya.

---

## 🎯 Mode Fitur Utama

Sistem pemesanan Marketiv memiliki dua *flow* yang diisolasi secara ketat:

### 1. 🔥 Campaign Mode — *Viral / Performance-Based*

Model pemasaran *pay-per-view* yang dirancang untuk efisiensi dan jangkauan massal.

```
UMKM upload brief & raw video ➜ Kreator klaim job ➜ Kreator edit video
➜ Kreator POSTING di akun sosmed MILIKNYA ➜ Pembayaran berbasis views
```

- **Pembayaran:** Berbasis performa aktual (*cost-per-view*)
- **🚫 Strict Rule:** **TIDAK ADA FITUR CHAT** — mengeliminasi drama revisi dan mempercepat proses

### 2. 🤝 Rate Card Mode — *Consultative / Influencer*

Model kolaborasi premium dengan harga tetap (*fixed price*).

```
UMKM browse katalog Kreator ➜ Inisiasi Chat ➜ Negosiasi
➜ Deal via Escrow ➜ Kreator eksekusi konten
```

- **Pembayaran:** Harga tetap yang disepakati melalui negosiasi
- **✅ Strict Rule:** Wajib menggunakan fitur **"Collab Post" (Instagram/TikTok)** agar UMKM mendapatkan *direct traffic*

---

## 🛠️ Tech Stack

Proyek ini dibangun dengan fokus pada performa web (*Core Web Vitals*), SEO, dan efisiensi *Time-to-Market* (MVP P2MW).

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js 16 | App Router, Server Components, Server Actions |
| **UI Library** | React 19 | Concurrent features, Suspense |
| **Styling** | Tailwind CSS v4 | Sintaks `@theme` modern, design tokens via CSS custom properties |
| **Language** | TypeScript 5 | Strict mode, type-safe codebase |
| **Utilities** | `clsx` + `tailwind-merge` | Via helper `cn()` untuk conditional class merging |
| **Backend** | Appwrite | Authentication, Database, Storage, Functions, Realtime |

---

## 📂 Struktur Direktori Proyek

Pemisahan *domain logic* dilakukan di tingkat routing untuk mencegah kebocoran state antara UMKM dan Kreator.

```
marketiv-web/
├── public/                     # Static assets (favicon, SVGs)
├── src/
│   ├── app/                    # 📱 Next.js App Router (Pages & Layouts)
│   │   ├── dashboard/          #    🔒 Protected dashboard area
│   │   │   ├── kreator/        #    🎨 Domain Eksklusif Mikro-Kreator
│   │   │   └── umkm/           #    🏪 Domain Eksklusif UMKM
│   │   ├── layout.tsx          #    Root Layout (Font Plus Jakarta Sans, Metadata)
│   │   ├── globals.css         #    Tailwind v4 @theme design tokens
│   │   └── page.tsx            #    Landing Page
│   ├── assets/
│   │   ├── icons/              # 🎯 Raw SVG icon files
│   │   └── images/             # 🖼️ Raster images (PNG, JPG, WebP)
│   ├── components/
│   │   ├── ui/                 # 🧩 Komponen dasar reusable (Button, Input, dll.)
│   │   ├── layouts/            # 📐 Komponen tata letak (Navbar, Footer, Sidebar)
│   │   └── features/           # ⚡ Komponen kompleks spesifik fitur
│   │       ├── dashboard/      #    Komponen dashboard (Hero, CampaignCard, Grid)
│   │       └── landing/        #    Komponen landing page (HeroSection)
│   ├── data/                   # 📦 Static content constants & mock data
│   ├── lib/                    # 🔧 Utility functions (cn, formatter, dll.)
│   └── types/                  # 📝 Shared TypeScript interfaces & types
├── .agents/                    # 🤖 AI Agent Rules & System Instructions
│   └── rules/                  #    Strict coding standards for AI Agents
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🚀 Panduan Memulai (*Getting Started*)

### Prasyarat

Pastikan Anda telah menginstal:

- **[Node.js](https://nodejs.org/)** — versi 20 atau lebih baru (direkomendasikan: v22 LTS)
- **Package Manager** — npm, yarn, pnpm, atau bun

### Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/VXerys/marketiv-web.git

# 2. Masuk ke direktori proyek
cd marketiv-web

# 3. Instal semua dependensi
npm install
```

### Menjalankan Development Server

```bash
npm run dev
```

Buka **[http://localhost:3000](http://localhost:3000)** di browser Anda untuk melihat hasilnya.

### Script yang Tersedia

| Script | Perintah | Keterangan |
|---|---|---|
| `dev` | `npm run dev` | Menjalankan development server dengan hot-reload |
| `build` | `npm run build` | Membuat production build yang dioptimasi |
| `start` | `npm run start` | Menjalankan production server |
| `lint` | `npm run lint` | Menjalankan ESLint untuk pengecekan kode |

---

## 🤖 Catatan untuk AI Developer Agents

> [!WARNING]
> Repositori ini dilengkapi dengan **Strict System Instructions** untuk AI Coding Agents.

Jika Anda menggunakan AI Agent (Cursor, Copilot, Gemini, dll.) untuk *coding* di repositori ini, AI tersebut **wajib** membaca dan mematuhi file-file berikut sebelum melakukan perubahan kode apa pun:

| File | Tujuan |
|---|---|
| `.agents/rules/strict-rules.md` | Aturan ketat coding standards & naming conventions |
| `.agents/rules/marketiv-context.md` | Konteks bisnis & domain knowledge produk |

Aturan ini memastikan kepatuhan terhadap standar **Next.js Server Components**, pemisahan *Dual-Ecosystem*, dan konsistensi arsitektur Marketiv.

---

## 👥 Tim Pengembang (P2MW 2025 — Universitas Nusa Putra)

<div align="center">

| Nama | Peran |
|---|---|
| **Panji Angkasa Putra** | Ketua / CEO |
| **Miftahudin** | CMO / UI-UX Designer |
| **M. Sechan Alfarisi** | CTO / Cloud & Web Developer |
| **Rendy Elang Lesmana** | CAIO / AI & Data Engineer |

<br/>

---

<sub>

**Marketiv** — *"Ciptakan Dampak, Mulai dari Daerah."*

Dibuat dengan ❤️ di Sukabumi, Jawa Barat.

</sub>

</div>
