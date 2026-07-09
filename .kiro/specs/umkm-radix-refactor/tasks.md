# Implementation Plan — UMKM Radix UI Refactor

## Overview

Rencana implementasi ini dirancang secara inkremental untuk melakukan audit dan migrasi seluruh dialog/modal manual dan menu aksi dropdown di dalam domain UMKM ke komponen berbasis Radix UI (`src/components/ui/`). Setiap task berfokus pada pemeliharaan logika bisnis yang ada sembari melakukan standarisasi presentasi antarmuka.

---

## Task List

- [ ] 1. Shared Components Refactor
  - Refaktorisasi komponen dropdown menu aksi bersama agar menggunakan primitive Radix UI.
  - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 1.1 Refaktorisasi `DashboardActionMenu`
    - Lokasi: `src/components/features/umkm-dashboard/shared/DashboardActionMenu.tsx`
    - Ubah logika penutupan dropdown dan deteksi click-outside menggunakan `@/components/ui/dropdown-menu`
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Campaign Modals Refactor
  - Refaktorisasi seluruh file modal konfirmasi dan detail yang berada di bawah modul Campaign management.
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 2.1 Refaktorisasi `AssetPreviewModal`
    - Lokasi: `src/components/features/umkm-dashboard/campaign/modals/AssetPreviewModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 2.2 Refaktorisasi `CancelCampaignModal`
    - Lokasi: `src/components/features/umkm-dashboard/campaign/modals/CancelCampaignModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 2.3 Refaktorisasi `DuplicateCampaignModal`
    - Lokasi: `src/components/features/umkm-dashboard/campaign/modals/DuplicateCampaignModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 2.4 Refaktorisasi `ExportReportModal`
    - Lokasi: `src/components/features/umkm-dashboard/campaign/modals/ExportReportModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 2.5 Refaktorisasi `ReviewSubmissionModal`
    - Lokasi: `src/components/features/umkm-dashboard/campaign/modals/ReviewSubmissionModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 2.6 Refaktorisasi `SubmissionDetailModal`
    - Lokasi: `src/components/features/umkm-dashboard/campaign/modals/SubmissionDetailModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

- [ ] 3. Create Campaign Wizard Modals Refactor
  - Refaktorisasi modal yang digunakan di dalam step-by-step wizard pembuatan campaign baru.
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 3.1 Refaktorisasi `CampaignCreatedModal`
    - Lokasi: `src/components/features/umkm-dashboard/create-campaign/modals/CampaignCreatedModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 3.2 Refaktorisasi `PaymentSimulationModal` (Wizard)
    - Lokasi: `src/components/features/umkm-dashboard/create-campaign/modals/PaymentSimulationModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 3.3 Refaktorisasi `SaveDraftModal`
    - Lokasi: `src/components/features/umkm-dashboard/create-campaign/modals/SaveDraftModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

- [ ] 4. Discover Creators Modals Refactor
  - Refaktorisasi modal yang dipicu dari direktori pencarian kreator.
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 4.1 Refaktorisasi `StartNegotiationModal`
    - Lokasi: `src/components/features/umkm-dashboard/creators/modals/StartNegotiationModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

- [ ] 5. Finance Modals Refactor
  - Refaktorisasi modal yang terkait transaksi keuangan, escrow tracker, dan deposit receipts.
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 5.1 Refaktorisasi `ExportFinanceReportModal`
    - Lokasi: `src/components/features/umkm-dashboard/finance/modals/ExportFinanceReportModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 5.2 Refaktorisasi `FinanceActionSuccessModal`
    - Lokasi: `src/components/features/umkm-dashboard/finance/modals/FinanceActionSuccessModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 5.3 Refaktorisasi `PaymentSimulationModal` (Keuangan)
    - Lokasi: `src/components/features/umkm-dashboard/finance/modals/PaymentSimulationModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 5.4 Refaktorisasi `TransactionDetailModal`
    - Lokasi: `src/components/features/umkm-dashboard/finance/modals/TransactionDetailModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

- [ ] 6. Negotiation Modals Refactor
  - Refaktorisasi modal penawaran harga premium (Rate Card Mode) di ruang chat/negosiasi.
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 6.1 Refaktorisasi `OrderSuccessModal`
    - Lokasi: `src/components/features/umkm-dashboard/negotiation/modals/OrderSuccessModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 6.2 Refaktorisasi `PaymentSimulationModal` (Negosiasi)
    - Lokasi: `src/components/features/umkm-dashboard/negotiation/modals/PaymentSimulationModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

  - [ ] 6.3 Refaktorisasi `SendCustomOfferModal`
    - Lokasi: `src/components/features/umkm-dashboard/negotiation/modals/SendCustomOfferModal.tsx`
    - Migrasikan ke wrapper `ResponsiveModal`
    - _Requirements: 1.1_

- [ ] 7. Verification & Build Quality
  - Memastikan integrasi tidak merusak typechecking dan build system.
  - _Requirements: semua_

  - [ ] 7.1 Typecheck verification
    - Jalankan `npm run typecheck`
    - Pastikan 0 type errors.

  - [ ] 7.2 Linting verification
    - Jalankan `npm run lint`
    - Pastikan semua file yang dimodifikasi bersih dari error linting.

---

## Quality Gates

- [ ] Seluruh komponen modal (18 file) berhasil bermigrasi ke `ResponsiveModal` / `Dialog`
- [ ] Komponen dropdown `DashboardActionMenu` berhasil menggunakan `DropdownMenu` Radix
- [ ] Tidak ada penambahan dependency baru pada `package.json`
- [ ] Build & Typecheck lolos dengan status sukses (Exit Code 0)
- [ ] Responsivitas modal di viewport mobile 375px terverifikasi dengan layout drawer yang rapi

---

## Implementation Sequence

1. **Fase 1 (Shared Dropdown):** Refaktorisasi menu aksi dropdown bersama agar memastikan integrasi Radix UI berjalan lancar.
2. **Fase 2 (Campaign & Wizard):** Migrasi modal-modal utama di Campaign page dan wizard pembuatan campaign baru.
3. **Fase 3 (Creators, Finance & Negotiation):** Migrasi sisa modal di area pencarian kreator, finansial, dan chat negosiasi.
4. **Fase 4 (Quality Control):** Typecheck dan linting untuk memastikan zero-regression.
