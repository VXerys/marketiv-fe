# Implementation Plan — Refactor UI Campaigns Summary & Campaign Detail Layout

## Overview

Rencana pengerjaan difokuskan pada pengubahan susunan metrik grid di halaman utama Campaigns (3-3) dan restrukturisasi total tata letak halaman Detail Campaigns agar seimbang, tidak menyisakan ruang kosong, serta selaras dengan standar desain v5.8.

---

## Task List

- [ ] **1. Refactor Campaigns Summary Grid (3-3 Layout)**
  - Ubah class grid di `CampaignSummaryCards.tsx` menjadi `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5` agar di desktop tersusun 3-3 (2 baris).
  - Ubah grid di `CampaignSummaryCardsSkeleton` di `CampaignListSkeleton.tsx` agar sinkron (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
  - _Requirements: 1.1, 1.2, 1.3_
  - **File Target**: 
    - `src/components/features/umkm-dashboard/campaign/CampaignSummaryCards.tsx`
    - `src/components/features/umkm-dashboard/campaign/CampaignListSkeleton.tsx`

- [ ] **2. Refactor Spacing & Wrapping di Detail Page**
  - Hapus margin-bottom `mb-8` dari `CampaignDetailHeader.tsx` dan `CampaignOverviewCards.tsx`.
  - Bungkus halaman detail utama di `CampaignDetailPage.tsx` dengan `<UmkmPageWrapper maxWidth={1440}>`. Hapus div wrapper kustom yang memiliki inline styles padding.
  - _Requirements: 2.1, 3.2_
  - **File Target**:
    - `src/components/features/umkm-dashboard/campaign/detail/CampaignDetailHeader.tsx`
    - `src/components/features/umkm-dashboard/campaign/detail/CampaignOverviewCards.tsx`
    - `src/components/features/umkm-dashboard/campaign/detail/CampaignDetailPage.tsx`

- [ ] **3. Restrukturisasi Layout Bento Detail Page (Full-Width + Grid)**
  - Tumpuk `CampaignWorkspaceCard` dan `CampaignSubmissionSection` bertumpuk secara vertikal (col-span-12 / full-width).
  - Susun components pendukung (Budget, Quick Actions, Checklist, Timeline) dalam grid responsif 2 kolom (`grid grid-cols-1 lg:grid-cols-2 gap-6`) di bagian bawah `CampaignDetailPage.tsx`.
  - _Requirements: 2.2, 2.3, 2.4_
  - **File Target**: `src/components/features/umkm-dashboard/campaign/detail/CampaignDetailPage.tsx`

- [ ] **4. Standarisasi UI Controls & Filter Tabs (v5.8 Compliance)**
  - Refactor filter buttons dan badges di `CampaignSubmissionSection.tsx` agar menggunakan radius rectangular `rounded-xl` (12px) dan `rounded-md` untuk badges.
  - Refactor box panduan validasi agar menggunakan border radius `rounded-xl` (12px).
  - _Requirements: 3.1, 3.3_
  - **File Target**: `src/components/features/umkm-dashboard/campaign/detail/CampaignSubmissionSection.tsx`

- [ ] **5. Verifikasi & Pengujian Akhir**
  - Jalankan typecheck TypeScript (`npm run typecheck`) dan lint (`npm run lint`).
  - Uji responsivitas grid baru 3-3 Campaigns dan tata letak bento Detail Campaigns.
  - _Requirements: semua_

---

## Quality Gates

- [ ] Semua metrik Summary Cards tersusun 3 kolom pada desktop.
- [ ] Detail page terbungkus rapi menggunakan `UmkmPageWrapper`.
- [ ] Tidak ada ruang kosong horizontal asimetris di bagian kiri detail page.
- [ ] Seluruh filter buttons dan panduan validasi di detail page menggunakan radius `rounded-xl`.
- [ ] Build & Lint passing bebas error.
