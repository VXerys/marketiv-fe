# Implementation Plan: UMKM Layout System

## Overview

Refactor arsitektur layout seluruh halaman UMKM dashboard dengan membuat komponen `UmkmPageWrapper` terpusat, menghapus *double overflow-y-auto*, dan menstandardisasi padding/maxWidth/gap di setiap halaman secara inkremental — satu halaman per task.

## Tasks

- [ ] 1. Buat komponen `UmkmPageWrapper` dan daftarkan di shared index
  - Buat file `src/components/features/umkm-dashboard/shared/UmkmPageWrapper.tsx`
  - Implementasi interface dengan prop `children`, `maxWidth` (default 1400), `className`
  - Gunakan inline style: `padding: clamp(16px, 3vw, 28px)`, `display: grid`, `gap: 26`, `alignContent: start`, `marginLeft: auto`, `marginRight: auto`, `width: 100%`
  - Gabungkan `className` via `cn()` dari `@/lib/utils`
  - Tambahkan export named `UmkmPageWrapper` dan type `UmkmPageWrapperProps` ke `src/components/features/umkm-dashboard/shared/index.ts`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 14.1_

  - [ ] 1.1 Buat file `UmkmPageWrapper.tsx` dengan implementasi lengkap
    - Pastikan prop `maxWidth` override bekerja (digunakan sebagai `style.maxWidth`)
    - Pastikan tidak ada `overflow-y-auto` di komponen ini
    - _Requirements: 1.1–1.8_

  - [ ]* 1.2 Tulis property test untuk `UmkmPageWrapper` (Property 1)
    - **Property 1: maxWidth prop override diterapkan dengan tepat**
    - **Validates: Requirements 1.6**
    - Gunakan library `fast-check` — `fc.integer({ min: 100, max: 3000 })`
    - Assert `el.style.maxWidth === `${maxWidth}px``
    - File: `src/components/features/umkm-dashboard/shared/UmkmPageWrapper.pbt.test.tsx`
    - Tag: `Feature: umkm-layout-system, Property 1: maxWidth prop override diterapkan dengan tepat`

  - [ ]* 1.3 Tulis unit tests untuk nilai style default `UmkmPageWrapper`
    - Test padding `clamp(16px, 3vw, 28px)`, gap `26px`, display `grid`, maxWidth default `1400px`
    - Test `className` prop digabungkan via `cn()`
    - File: `src/components/features/umkm-dashboard/shared/UmkmPageWrapper.test.tsx`
    - _Requirements: 1.2, 1.3, 1.4, 1.8_

- [ ] 2. Perbaiki `UmkmOverviewClient` (halaman Dashboard / Overview)
  - Buka `src/components/features/umkm-dashboard/overview/UmkmOverviewClient.tsx`
  - Ganti wrapper `div` terluar (`w-full max-w-[1400px] mx-auto overflow-x-hidden` + inline style) dengan `<UmkmPageWrapper>` (maxWidth default 1400)
  - Fix gap kolom kiri: `gap: 20` → `gap: 26`
  - Fix gap outer grid (`umkm-dash-grid`): `24` → `26`
  - Pertahankan kolom kanan gap `22px`
  - Pastikan tidak ada `overflow-y-auto` tersisa di wrapper ini
  - Update CSS `umkm-dash-grid`: breakpoint tetap 1100px, `grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr)`
  - _Requirements: 3.1, 4.1, 5.3, 6.1–6.7, 2.9_

  - [ ] 2.1 Replace wrapper div dengan `UmkmPageWrapper` dan fix gap values
    - Import `UmkmPageWrapper` dari `@/components/features/umkm-dashboard/shared`
    - _Requirements: 3.1, 4.1, 5.3_

  - [ ] 2.2 Update `umkm-dash-grid` CSS dan kolom kiri/kanan gap
    - Gap outer: 26px, kolom kiri: 26px, kolom kanan: 22px
    - _Requirements: 6.4, 6.5, 6.6, 6.7_

  - [ ]* 2.3 Tulis smoke test: Overview tidak ada `overflow-y-auto` di wrapper content
    - Render `UmkmOverviewClient` (dengan mock data), assert tidak ada class `overflow-y-auto` di wrapper content
    - _Requirements: 2.9_

- [ ] 3. Checkpoint — Verifikasi UmkmPageWrapper dan Overview
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Perbaiki `CampaignsPage` (halaman Campaign)
  - Buka `src/components/features/umkm-dashboard/campaign/CampaignsPage.tsx`
  - Ganti wrapper `div` dengan inline style `gap: 0` dan `overflow-y-auto relative` → `<UmkmPageWrapper maxWidth={1440}>`
  - Hapus `gap: 0` dari inline style (tidak perlu di-pass ke `UmkmPageWrapper`)
  - Perbaiki campaign card grid: ganti `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` → inline style `display: grid; gap: 18px` + `<style>` tag dengan breakpoints 640/1100/1400px
  - Fix `CampaignSummaryCards`: gunakan `gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))"` dengan `gap: 14px`
  - _Requirements: 2.8, 3.2, 4.1, 4.2, 8.1–8.6, 12.1–12.4_

  - [ ] 4.1 Ganti wrapper `div` dengan `UmkmPageWrapper maxWidth={1440}`, hapus `overflow-y-auto`
    - _Requirements: 12.1, 12.2, 2.8_

  - [ ] 4.2 Perbaiki campaign card grid breakpoints dan gap
    - Grid: 1fr → 2col@640px → 3col@1100px → 4col@1400px, gap 18px
    - _Requirements: 8.1–8.5_

  - [ ] 4.3 Perbaiki `CampaignSummaryCards` grid (`auto-fit minmax(170px,1fr)`, gap 14px)
    - _Requirements: 12.4_

  - [ ]* 4.4 Tulis smoke test: CampaignsPage tidak ada `overflow-y-auto` di wrapper, gap section 26px
    - _Requirements: 12.2, 12.3_

- [ ] 5. Perbaiki halaman Keuangan (`page.tsx` + `FinanceOverviewPage`)
  - Buka `src/app/dashboard/umkm/keuangan/page.tsx`
  - Ganti `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">` → `<UmkmPageWrapper>`
  - Buka `src/components/features/umkm-dashboard/finance/FinanceOverviewPage.tsx`
  - Hapus wrapper `div` terluar `space-y-6 max-w-7xl mx-auto pb-20` — ubah return menjadi fragment `<>`
  - _Requirements: 2.2, 3.3, 4.3, 5.1, 5.2, 11.1, 11.5, 11.6_

  - [ ] 5.1 Update `keuangan/page.tsx`: ganti div wrapper → `<UmkmPageWrapper>`
    - Import `UmkmPageWrapper`
    - _Requirements: 11.1, 2.2, 5.2_

  - [ ] 5.2 Update `FinanceOverviewPage.tsx`: hapus outer wrapper div, return fragment
    - _Requirements: 11.5, 11.6, 3.3, 4.3_

  - [ ]* 5.3 Tulis smoke test: Keuangan page tidak ada `overflow-y-auto`, tidak ada double padding
    - _Requirements: 2.2, 11.6_

- [ ] 6. Perbaiki halaman Kreator (`page.tsx` + `CreatorDirectoryPage`)
  - Buka `src/app/dashboard/umkm/kreator/page.tsx`
  - Ganti `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">` → `<UmkmPageWrapper>`
  - Buka `src/components/features/umkm-dashboard/creators/CreatorDirectoryPage.tsx`
  - Hapus wrapper `div` terluar `space-y-6 max-w-7xl mx-auto` — ubah return menjadi fragment `<>`
  - _Requirements: 2.3, 3.4, 4.4, 5.2, 11.2, 11.5, 11.6_

  - [ ] 6.1 Update `kreator/page.tsx`: ganti div wrapper → `<UmkmPageWrapper>`
    - _Requirements: 11.2, 2.3, 5.2_

  - [ ] 6.2 Update `CreatorDirectoryPage.tsx`: hapus outer wrapper div, return fragment
    - _Requirements: 11.5, 11.6, 3.4, 4.4_

  - [ ]* 6.3 Tulis smoke test: Kreator page tidak ada `overflow-y-auto`, tidak ada double padding
    - _Requirements: 2.3, 11.6_

- [ ] 7. Perbaiki halaman Negosiasi (`page.tsx` + `NegotiationListPage`)
  - Buka `src/app/dashboard/umkm/negosiasi/page.tsx`
  - Ganti `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">` → `<UmkmPageWrapper>`
  - Buka `src/components/features/umkm-dashboard/negotiation/NegotiationListPage.tsx`
  - Hapus wrapper `div` terluar `space-y-6 max-w-7xl mx-auto pb-24` — ubah return menjadi fragment `<>`
  - _Requirements: 2.4, 3.5, 4.7, 4.8, 5.2, 11.3, 11.5, 11.6_

  - [ ] 7.1 Update `negosiasi/page.tsx`: ganti div wrapper → `<UmkmPageWrapper>`
    - _Requirements: 11.3, 2.4, 5.2_

  - [ ] 7.2 Update `NegotiationListPage.tsx`: hapus outer wrapper div (termasuk `pb-24`), return fragment
    - _Requirements: 11.5, 11.6, 3.5, 4.7, 4.8_

  - [ ]* 7.3 Tulis smoke test: Negosiasi page tidak ada `overflow-y-auto`, tidak ada `pb-24`
    - _Requirements: 2.4, 4.8_

- [ ] 8. Checkpoint — Verifikasi semua page wrapper halaman Keuangan, Kreator, Negosiasi
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Refactor halaman Analitik (pindah Chrome ke `page.tsx` + update `AnalitikClient`)
  - Buka `src/app/dashboard/umkm/analitik/page.tsx`
  - Tambahkan import `UmkmDashboardChrome` dan `AnalitikClient`
  - Bungkus `<AnalitikClient />` dengan `<UmkmDashboardChrome businessName="Dapur Sehat Sukabumi">`
  - Buka `src/components/features/umkm-dashboard/analytics/AnalitikClient.tsx`
  - Hapus import dan penggunaan `UmkmDashboardChrome`
  - Hapus prop `businessName` dari interface dan parameter
  - Ganti `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">` → `<UmkmPageWrapper maxWidth={1400}>`
  - Pertahankan chart grid breakpoint 900px dengan gap 20px
  - _Requirements: 2.6, 3.6, 4.5, 9.1–9.5_

  - [ ] 9.1 Update `analitik/page.tsx`: tambah Chrome wrapper, render `<AnalitikClient />` tanpa props
    - _Requirements: 9.4_

  - [ ] 9.2 Update `AnalitikClient.tsx`: hapus Chrome, hapus `businessName` prop, ganti wrapper → `<UmkmPageWrapper maxWidth={1400}>`
    - _Requirements: 9.1, 9.2, 9.3, 2.6, 3.6, 4.5_

  - [ ]* 9.3 Tulis smoke test: AnalitikClient tidak ada `overflow-y-auto`, tidak menggunakan `UmkmDashboardChrome`
    - _Requirements: 2.6, 9.1_

- [ ] 10. Refactor halaman Pengaturan (pindah Chrome ke `page.tsx` + update `PengaturanClient`)
  - Buka `src/app/dashboard/umkm/pengaturan/page.tsx`
  - Tambahkan import `UmkmDashboardChrome` dan `PengaturanClient`
  - Bungkus `<PengaturanClient />` dengan `<UmkmDashboardChrome businessName="Dapur Sehat Sukabumi">`
  - Buka `src/components/features/umkm-dashboard/settings/PengaturanClient.tsx`
  - Hapus import dan penggunaan `UmkmDashboardChrome`
  - Hapus prop `businessName` dari interface dan parameter
  - Ganti `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-3xl mx-auto w-full">` → `<UmkmPageWrapper maxWidth={768}>`
  - _Requirements: 2.7, 3.7, 4.6, 10.1–10.4_

  - [ ] 10.1 Update `pengaturan/page.tsx`: tambah Chrome wrapper, render `<PengaturanClient />` tanpa props
    - _Requirements: 10.3_

  - [ ] 10.2 Update `PengaturanClient.tsx`: hapus Chrome, hapus `businessName` prop, ganti wrapper → `<UmkmPageWrapper maxWidth={768}>`
    - _Requirements: 10.1, 10.2, 10.4, 2.7, 3.7, 4.6_

  - [ ]* 10.3 Tulis smoke test: PengaturanClient tidak ada `overflow-y-auto`, tidak menggunakan `UmkmDashboardChrome`
    - _Requirements: 2.7, 10.1_

- [ ] 11. Perbaiki halaman Campaign Buat (`campaign/buat/page.tsx`)
  - Buka `src/app/dashboard/umkm/campaign/buat/page.tsx`
  - Ganti `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">` → `<UmkmPageWrapper>`
  - Pastikan import `UmkmPageWrapper` dari `@/components/features/umkm-dashboard/shared`
  - _Requirements: 2.5, 5.2, 11.4_

  - [ ] 11.1 Update `campaign/buat/page.tsx`: ganti div wrapper → `<UmkmPageWrapper>`
    - _Requirements: 11.4, 2.5, 5.2_

  - [ ]* 11.2 Tulis smoke test: Campaign Buat page tidak ada `overflow-y-auto`
    - _Requirements: 2.5_

- [ ] 12. Verifikasi akhir dan cleanup
  - [ ] 12.1 Jalankan build TypeScript untuk memverifikasi tidak ada error kompilasi
    - Periksa bahwa tidak ada prop `businessName` yang masih dikirim ke `AnalitikClient` atau `PengaturanClient` setelah refactor
    - Periksa bahwa semua import `UmkmPageWrapper` menggunakan path yang benar
    - _Requirements: 15.1, 15.2, 15.3_

  - [ ]* 12.2 Tulis smoke tests batch — scan source file untuk `overflow-y-auto` di wrapper content
    - Verifikasi setiap file yang diubah tidak mengandung `overflow-y-auto` di wrapper content-nya
    - File target: `keuangan/page.tsx`, `kreator/page.tsx`, `negosiasi/page.tsx`, `campaign/buat/page.tsx`, `AnalitikClient.tsx`, `PengaturanClient.tsx`, `CampaignsPage.tsx`, `UmkmOverviewClient.tsx`
    - _Requirements: 2.1–2.8_

  - [ ]* 12.3 Verifikasi `UmkmPageWrapper` tidak digunakan di luar scope UMKM dashboard
    - Scan `src/` untuk import `UmkmPageWrapper` — pastikan hanya dari `umkm-dashboard` dan `app/dashboard/umkm`
    - _Requirements: 15.1_

- [ ] 13. Checkpoint Final — Ensure all tests pass, ask the user if questions arise.

## Notes

- Task bertanda `*` bersifat opsional dan dapat diskip untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk traceability
- **Jangan ubah** `DashboardShell`, `SidebarInset`, atau komponen di luar `/dashboard/umkm` (Requirements 15.2–15.5)
- `UmkmDashboardChrome` tidak boleh diubah; hanya pola penggunaannya yang dipindahkan ke `page.tsx`
- Halaman detail campaign (`/dashboard/umkm/campaign/[campaignId]/**`) dan negosiasi detail room **tidak di-scope** dalam refactor ini (Requirements 15.5)
- Untuk KPI Grid (`KPISection.tsx`): implementasi breakpoint sudah benar, pertahankan — hanya pastikan gap tetap 12px (Requirements 7.6)
- Urutan task dirancang agar setiap halaman bisa diverifikasi secara independen sebelum melanjutkan ke halaman berikutnya

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "4.1", "5.1", "6.1", "7.1", "9.1", "10.1", "11.1"] },
    { "id": 3, "tasks": ["2.2", "4.2", "4.3", "5.2", "6.2", "7.2", "9.2", "10.2"] },
    { "id": 4, "tasks": ["2.3", "4.4", "5.3", "6.3", "7.3", "9.3", "10.3", "11.2"] },
    { "id": 5, "tasks": ["12.1"] },
    { "id": 6, "tasks": ["12.2", "12.3"] }
  ]
}
```
