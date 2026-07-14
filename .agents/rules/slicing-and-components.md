---
trigger: always_on
description: Standardized directory structure, route map restrictions, component inventory, and slicing roadmap checkpoints for Marketiv.
---

# 🚨 STRICT RULES — SLICING ROADMAP & COMPONENT INVENTORY 🚨

Dokumen ini mengatur **penempatan folder komponen, peta rute (Route Map), inventaris komponen, dan tahapan roadmap slicing UI/UX** di proyek Marketiv.

---

## 1. COMPONENT FOLDER PLACEMENT RULES

Untuk menjaga kebersihan dan skalabilitas arsitektur, penempatan file komponen baru **wajib** mengikuti aturan berikut:

| Direktori Penempatan | Jenis Komponen | Karakteristik & Contoh |
|---|---|---|
| `src/components/ui/` | Reusable / Dumb UI | Presentasional murni, tidak ada business logic, reusable secara global. Contoh: `Button.tsx`, `Card.tsx`, `Input.tsx`, `StatusBadge.tsx`, `Skeleton.tsx`. |
| `src/components/layouts/` | Structural Page Primitives | Penataan layout structural, shell navigasi, sidebar, topbar. Contoh: `DashboardShell.tsx`, `DashboardSidebar.tsx`, `DashboardTopbar.tsx`, `Navbar.tsx`. |
| `src/components/features/<name>/` | Feature-specific / Smart UI | Komponen yang membawa business knowledge atau context domain spesifik. Contoh: `features/campaign/CampaignWizard.tsx`, `features/rate-card/CreatorCard.tsx`, `features/chat/ChatRoom.tsx`, `features/finance/EscrowStatusCard.tsx`. |
| `src/types/` | TypeScript Types | Seluruh file deklarasi type/interface domain data. Contoh: `campaign.ts`, `creator.ts`, `status.ts`. |
| `src/data/` | Content & Mock Data | File content static text, dummy lists, dan static navigation links. Contoh: `content.ts`, `navigation.ts`. |

- **DILARANG** meletakkan komponen bisnis (misal: wizard campaign) di dalam `src/components/ui/`.
- **DILARANG** melakukan default export. Semua komponen wajib memakai **named export**.
- Setiap komponen wajib memiliki `interface Props` eksplisit jika menerima data.

---

## 2. OFFICIAL ROUTE MAP RESTRICTIONS

Semua halaman baru wajib diletakkan mengikuti Next.js App Router structure berikut. Jangan mengarang route baru:

### 2.1 Public Routes
- Landing Page: `/`
- Auth Pages: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
- Legal & Panduan: `/panduan`, `/tentang-kami`, `/kebijakan-privasi`, `/syarat-ketentuan`

### 2.2 UMKM Dashboard Area (`/dashboard/umkm`)
- Dashboard Overview: `/dashboard/umkm`
- Campaign Management: `/dashboard/umkm/campaign` (List) & `/dashboard/umkm/campaign/buat` (Wizard) & `/dashboard/umkm/campaign/[campaignId]` (Detail)
- Discover Creator & Rate Cards: `/dashboard/umkm/kreator` (Directory) & `/dashboard/umkm/kreator/[creatorId]` (Profile)
- Rate Card Negotiations: `/dashboard/umkm/negosiasi` & `/dashboard/umkm/negosiasi/[orderId]` (Chat Negosiasi & Custom Offer)
- Finance & Escrow Tracker: `/dashboard/umkm/keuangan` & `/dashboard/umkm/keuangan/transaksi/[transactionId]`

### 2.3 Kreator Dashboard Area (`/dashboard/kreator`)
- Dashboard Overview: `/dashboard/kreator`
- Job Pool / Claim Area: `/dashboard/kreator/job-pool` & `/dashboard/kreator/job-pool/[campaignId]` (Claim Job)
- Pekerjaan Aktif & Proof Submit: `/dashboard/kreator/pekerjaan-aktif` & `/dashboard/kreator/pekerjaan-aktif/[claimId]` (Upload TikTok/Instagram URL)
- Rate Card Package Creator: `/dashboard/kreator/rate-card`
- Rate Card Negotiations: `/dashboard/kreator/negosiasi` & `/dashboard/kreator/negosiasi/[orderId]` (Terima/tolak Offer & Submit Collab Post URL)
- Finance & Withdrawal: `/dashboard/kreator/keuangan` & `/dashboard/kreator/keuangan/withdrawal`

### 2.4 Admin Operations Area (`/admin`)
- Admin Overview: `/admin`
- Verification Queue: `/admin/submissions` & `/admin/submissions/[submissionId]`
- Disputes Room: `/admin/disputes` & `/admin/disputes/[disputeId]`
- User Management: `/admin/users`
- Reports (P2MW data export): `/admin/reports`

---

## 3. SLICING ROADMAP BATCHES SEQUENCE

Frontend slicing wajib mengikuti urutan batch berikut secara inkremental:

- **Batch 1 — Foundation UI System:** Redesign CSS tokens (orange/navy), component primitives (`Button`, `Card`, `StatusBadge`, `MetricCard`, `EmptyState`, loading indicators, formatter utils).
- **Batch 2 — Dashboard Shell & Navigation:** responsive shell, sidebar desktop, topbar page title, mobile navigation bar, active route highlights.
- **Batch 3 — UMKM Dashboard Overview:** Metrics (campaign active, budget escrow), campaign list previews, skeleton state.
- **Batch 4 — Kreator Dashboard Overview:** Metrics (earnings, active claimed jobs), job pool previews, withdrawal launcher.
- **Batch 5 — Campaign Mode Slicing:** Campaign wizard (step-by-step), job pool directory with claim buttons (disabled when quota is full), submit proof form.
- **Batch 6 — Rate Card Mode Slicing:** Creator directory cards, creator profile detailing packages (max 3), chat negotiation room with Custom Offer widgets, Collab Post notices.
- **Batch 7 — Finance, Admin & Laporan P2MW:** Wallet payouts ledger, admin queue table, disputes resolution page, P2MW excel/CSV mockup exporter.

---

## 4. GLOBAL DEFINITION OF DONE (DoD)

Halaman atau komponen baru hanya dianggap selesai jika:
1. Tidak ada warna HEX manual (wajib memakai tailwind token `@theme` seperti `bg-primary` atau `text-neutral-900`).
2. CSS responsive penuh dari layar mobile **375px**, tablet **768px**, sampai desktop.
3. Halaman yang mengambil data asynchronous menyediakan **Loading State**, **Empty State** (jika data kosong), dan **Error State** (jika fetch gagal).
4. Tidak ada link chat atau tombol komunikasi visual di area Campaign Mode.
5. Mutasi data finansial dibatasi berupa visual read-only dan diarahkan ke secure API triggers (tidak boleh update wallet state langsung di client).
6. TypeScript lulus strict check, dan `npm run lint` bebas error.
