# Implementation Plan — UMKM Dashboard Radix Refactor

## Overview

Dokumen rencana kerja ini memecah implementasi refaktorisasi UI konsistensi UMKM dashboard (3 tab utama) ke dalam langkah-langkah inkremental yang dapat diuji. Rencana ini berfokus pada transisi ke komponen berbasis Radix UI (melalui shadcn/ui) dan penyesuaian visual mengikuti Marketiv Studio System v5.8.

Pengerjaan dibagi ke dalam 5 fase terpisah:
- **Fase 1**: Shared Layout Wrapper
- **Fase 2**: Refaktorisasi Halaman Overview
- **Fase 3**: Refaktorisasi Halaman Campaign List
- **Fase 4**: Refaktorisasi Halaman Discover Creators
- **Fase 5**: Verifikasi Akhir & Quality Gates

Setiap tugas wajib mereferensikan nomor requirement dari `requirements.md` terkait.

---

## Tasks

### Fase 1: Shared Layout Wrapper

- [ ] **1. Buat Komponen `UmkmPageWrapper`**
  * Buat file baru: `src/components/features/umkm-dashboard/shared/UmkmPageWrapper.tsx`.
  * Terapkan interface prop `UmkmPageWrapperProps` (`children`, `maxWidth?`, `className?`).
  * Implementasikan visual style token Studio System:
    - Padding responsif: `clamp(16px, 3vw, 28px)`.
    - Spacing vertikal: `display: grid; gap: 26px; alignContent: start`.
    - Batas lebar: `maxWidth: 1400px` (secara default) atau nilai override dari prop `maxWidth`.
    - Posisi: Centered di tengah layar menggunakan `margin: 0 auto; width: 100%`.
  * Gabungkan class tambahan dari prop `className` menggunakan utility `cn()` dari `@/lib/utils.ts`.
  * _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] **2. Daftarkan dan Ekspor Komponen**
  * Daftarkan export named `UmkmPageWrapper` di dalam file index barrel: `src/components/features/umkm-dashboard/shared/index.ts`.
  * Hapus sisa-sisa import wrapper kustom lama yang tidak terpakai jika ada.
  * _Requirements: 2.1, 3.1, 4.1_

---

### Fase 2: Refaktorisasi Halaman Overview (Dashboard Utama)

- [ ] **3. Refaktor Page Container `UmkmOverviewClient.tsx`**
  * Buka file: `src/components/features/umkm-dashboard/overview/UmkmOverviewClient.tsx`.
  * Ganti div wrapper terluar (`w-full max-w-[1400px] mx-auto overflow-x-hidden` beserta inline style-nya) dengan `<UmkmPageWrapper>`.
  * Hapus overflow ganda (`overflow-y-auto` atau sejenisnya) agar scroll sepenuhnya ditangani oleh level shell utama dashboard.
  * _Requirements: 2.1, 5.2_

- [ ] **4. Migrasi `KPISection.tsx` ke shadcn/ui Card & Rule Grid**
  * Buka file: `src/components/features/umkm-dashboard/overview/KPISection.tsx`.
  * Ganti penggunaan `DashboardCard` atau `DashboardMetricCard` (deprecated wrapper) dengan `<Card>` dari `@/components/ui/card.tsx`.
  * Susun komponen metrik menggunakan grid class `.dashboard-rule-grid` (2→3→6 col).
  * Terapkan visual style Studio System pada card (background `--paper-2`, radius `--radius-2` (18px), border tipis, dan shadow `var(--shadow-1)`).
  * _Requirements: 1.1, 2.2, 5.1, 5.2_

- [ ] **5. Refaktor `CampaignSection.tsx` & Sub-Komponen Overview Lainnya**
  * Buka file: `src/components/features/umkm-dashboard/overview/CampaignSection.tsx` dan sub-komponen overview lainnya (`HeroOverview`, `InsightSection`, `QuickActions`, `FinancialOverview`, `ActivityTimeline`).
  * Ganti tombol kustom lama (`DashboardButton`, `DashboardBadge`) dengan komponen shadcn `<Button>` (`@/components/ui/button.tsx`) dan `<Badge>` (`@/components/ui/badge.tsx`).
  * Selaraskan style tombol primer (warna gradien jingga, radius 15px, shadow `0 14px 30px rgba(234, 88, 12, .24)`, hover state translate Y `-2px` dengan easing `var(--ease)`).
  * Selaraskan style tombol sekunder (warna latar putih-abu tipis, border 1px, shadow soft).
  * _Requirements: 1.2, 1.3, 2.1, 5.1, 5.2_

- [ ] **6. Penyesuaian Chart Container `UmkmViewsChartCard.tsx`**
  * Buka file: `src/components/features/dashboard/UmkmViewsChartCard.tsx` atau file chart overview terkait.
  * Pastikan card pembungkus chart menggunakan kelas `.chart-card-container`.
  * Tempatkan `<ResponsiveContainer>` Recharts di dalam div pembungkus dengan kelas `.chart-inner` untuk memastikan tinggi dinamis responsif berjalan tanpa menggunakan pixel statis.
  * _Requirements: 2.4_

---

### Fase 3: Refaktorisasi Halaman Campaign List

- [ ] **7. Refaktor Container `CampaignsPage.tsx`**
  * Buka file: `src/components/features/umkm-dashboard/campaign/CampaignsPage.tsx`.
  * Ganti div wrapper utama dengan `<UmkmPageWrapper maxWidth={1440}>`.
  * Hapus inline style layout manual seperti `gap: 0` dan class `overflow-y-auto`.
  * Ganti layout grid daftar campaign kustom dengan kelas `.responsive-card-grid`.
  * _Requirements: 3.1, 3.2, 5.2_

- [ ] **8. Refaktor `CampaignCard.tsx` ke Radix/shadcn `Card`**
  * Buka file: `src/components/features/umkm-dashboard/campaign/CampaignCard.tsx`.
  * Impor dan gunakan `<Card>` dari `@/components/ui/card.tsx` sebagai pembungkus utama kartu.
  * Terapkan visual classes `.campaign-card`, `.campaign-card-cover`, `.campaign-card-body`, dan `.campaign-card-title`.
  * Hapus inline style visual yang statis (border, radius, shadow) dan delegasikan sepenuhnya ke kelas CSS tersebut. Pertahankan hanya style yang dinamis (seperti persen progress bar).
  * Terapkan hover transition smooth (translateY `-4px` dengan easing `var(--ease)`).
  * _Requirements: 1.1, 1.3, 3.3, 5.1, 5.2_

---

### Fase 4: Refaktorisasi Halaman Discover Creators (Directory)

- [ ] **9. Refaktor Container Halaman `CreatorDirectoryPage.tsx`**
  * Buka file: `src/components/features/umkm-dashboard/creators/CreatorDirectoryPage.tsx`.
  * Bungkus seluruh halaman menggunakan `<UmkmPageWrapper maxWidth={1400}>`.
  * Ganti grid layout daftar kreator dengan `.responsive-card-grid`.
  * _Requirements: 4.1, 4.2_

- [ ] **10. Refaktor `CreatorCard.tsx` ke Radix/shadcn `Card`**
  * Buka file: `src/components/features/umkm-dashboard/creators/CreatorCard.tsx`.
  * Impor dan gunakan `<Card>` dari `@/components/ui/card.tsx` sebagai pembungkus kartu kreator.
  * Terapkan visual classes `.creator-card`, `.creator-card-header`, `.creator-card-avatar`, dan `.creator-card-stats`.
  * Konfigurasi avatar agar menggunakan ukuran `56x56px` dengan kelengkungan `var(--radius-2)` (18px) dan pastikan memiliki bayangan `var(--orange-glow)` saat aktif/hover.
  * Sesuaikan sel statistik menggunakan background warna `--ink-100` dengan font Sora/Jakarta Sans yang sesuai.
  * _Requirements: 1.1, 1.4, 4.3, 5.1, 5.2_

---

### Fase 5: Verifikasi Akhir & Quality Gates

- [ ] **11. Verifikasi Type Check & Build**
  * Jalankan perintah typecheck: `npx tsc --noEmit`.
  * Pastikan build production berhasil tanpa error/warning: `npm run build`.
  * _Requirements: Sukses Metrik_

- [ ] **12. Pengujian Kepatuhan Aturan Bisnis (Compliance Checklist)**
  * [ ] Verifikasi bahwa **TIDAK ADA** tombol chat, WhatsApp redirection, atau input chat di dalam view tab Overview dan Campaign (strict Campaign Mode zero-chat).
  * [ ] Verifikasi bahwa **TIDAK ADA** input credit card langsung (delegasikan ke Midtrans).
  * [ ] Verifikasi bahwa input upload divalidasi maks 100MB di frontend.
  * [ ] Verifikasi bahwa layout responsif berjalan lancar di resolusi minimum 375px hingga desktop tanpa ada horizontal scroll.
  * _Requirements: Kontra-Persyaratan & Constraints_
