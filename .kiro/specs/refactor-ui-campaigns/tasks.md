# Implementation Plan — Refactor UI Campaigns & Campaign Detail

## Overview

Rencana pengerjaan pemolesan UI Campaigns difokuskan pada perbaikan visual layout, border radius, spacing, dan penyelarasan kontrol filter. Pengerjaan akan dibagi secara bertahap dari komponen header, summary cards, skeleton loader, hingga komponen toolbar filter yang kompleks.

---

## Task List

- [ ] **1. Refactor Spacing & Spacing Header**
  - Hapus margin-bottom inline pada wrapper utama `CampaignsHeader` agar menyatu dengan gap bawaan dari `UmkmPageWrapper`.
  - Sesuaikan border radius tombol aksi ("Export Laporan", "Buat Campaign") menjadi `rounded-xl` (12px) dan weight `font-bold` sesuai dengan style v5.8.
  - _Requirements: 3.1, 3.2, 2.1_
  - **File Target**: `src/components/features/umkm-dashboard/campaign/CampaignsHeader.tsx`

- [ ] **2. Re-layout Grid & Value summary metrics**
  - Ganti container class `dashboard-rule-grid mb-7` pada `CampaignSummaryCards` dengan grid responsif Tailwind: `grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4`.
  - Tulis ulang markup dan style `SummaryCard` agar menggunakan variable border-radius `rounded-[22px]` dan border netral modern `border-neutral-200/80` serta linear background.
  - Ubah class value metrics dari `.metric-value` menjadi custom Tailwind classes: `font-display text-xl sm:text-2xl lg:text-[1.75rem] font-black text-neutral-900 tracking-tight leading-none mt-1.5` agar nominal panjang seperti `Rp 12.6jt` tetap dalam satu baris.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1_
  - **File Target**: `src/components/features/umkm-dashboard/campaign/CampaignSummaryCards.tsx`

- [ ] **3. Sinkronisasi Grid Skeleton Loader**
  - Perbarui class grid pada `CampaignSummaryCardsSkeleton` agar sejalan dengan grid baru: `grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4` dan hilangkan `mb-6`.
  - _Requirements: 1.1, 1.2, 1.3, 3.1_
  - **File Target**: `src/components/features/umkm-dashboard/campaign/CampaignListSkeleton.tsx`

- [ ] **4. Redesign Toolbar Controls & Status Tabs**
  - Hilangkan inline style (background, border, shadow, gap) dan class `mb-6` dari wrapper `CampaignToolbar`. Ganti dengan kelas Tailwind: `bg-white border border-neutral-200/60 rounded-2xl p-4 shadow-3xs flex flex-col gap-4`.
  - Lebarkan input search dengan mengganti style container-nya menjadi `flex-grow min-w-[280px]` dan mengubah class `rounded-full` menjadi `rounded-xl`. Hapus spacer `<div className="flex-1" />` yang mengompresi search bar.
  - Terapkan `rounded-xl` pada select dropdowns kategori & sorting, ganti custom inline select styles dengan border Tailwind netral, dan sesuaikan chevron icon agar rapi.
  - Standarkan active filter indicator dan reset button menjadi rectangular modern (`rounded-xl`), sesuaikan warna background dan teksnya (Reset: bg merah muda soft `bg-red-50` / border `border-red-200` / teks `text-red-600`).
  - Layout ulang view mode switcher menggunakan container rectangular `rounded-xl` dengan internal buttons `rounded-lg`. Posisikan switcher di sisi kanan menggunakan `md:ml-auto`.
  - Layout ulang Row 2 (status pill tabs) di bawah garis pembatas tipis (`border-t border-neutral-100 pt-3`). Ganti continuous grey bar menjadi deretan tombol pill individual (`rounded-full border px-3 py-1.5 text-xs font-bold`) dengan visual state aktif/tidak aktif yang kontras.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 4.1, 4.2, 4.3_
  - **File Target**: `src/components/features/umkm-dashboard/campaign/CampaignToolbar.tsx`

- [ ] **5. Integrasi Akhir & Quality Assurance**
  - Validasi tampilan halaman `/dashboard/umkm/campaign` di resolusi mobile (375px), tablet/laptop (1024px), dan desktop lebar (1440px).
  - Pastikan tidak ada visual jump saat loading skeleton berganti ke data asli.
  - Pastikan in-memory search dan filter status tab bekerja 100% dengan data dummy.
  - _Requirements: semua_

---

## Quality Gates

- [ ] Semua acceptance criteria di requirements.md tervalidasi.
- [ ] Jarak antarseksi vertikal konsisten 26px di seluruh resolusi (tidak ada margin tumpang tindih).
- [ ] Nilai metrik `Rp 12.6jt` tidak terpotong atau wrap di resolusi desktop laptop (1024px).
- [ ] Border radius untuk input, select, tombol filter, dan reset adalah 12px (`rounded-xl`).
- [ ] Search input membesar leluasa di desktop (min-width 280px).
- [ ] Status tabs menggunakan visual pill individual, bukan continuous solid grey bar.
- [ ] Lulus pengujian responsive penuh dari layar mobile 375px sampai desktop.
- [ ] `npm run lint` bebas error.

---

## Implementation Sequence

1. **Header Spacing Fix**: Selesaikan perubahan spacing di `CampaignsHeader.tsx` terlebih dahulu.
2. **Metrics Grid Fix**: Modifikasi layout metrik di `CampaignSummaryCards.tsx` dan sync di `CampaignListSkeleton.tsx`.
3. **Toolbar Overhaul**: Modifikasi `CampaignToolbar.tsx` (Search size, dropdown shapes, reset buttons, status tabs, and view modes).
4. **End-to-End Validation**: Jalankan pengecekan responsivitas layout dan fungsionalitas filter.
