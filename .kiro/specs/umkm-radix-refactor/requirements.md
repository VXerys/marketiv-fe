# Requirements — UMKM Radix UI Refactor

## Introduction

Iterasi ini bertujuan untuk mengaudit dan melakukan refaktorisasi terhadap seluruh komponen antarmuka (UI) pada halaman dashboard UMKM (`src/components/features/umkm-dashboard/`) yang masih menggunakan logika *state toggle* manual (misal: custom absolute overlay divs) ke komponen berbasis **Radix UI** yang telah disediakan di `src/components/ui/` (seperti `Dialog`, `DropdownMenu`, `Select`, `ResponsiveModal`). Refaktorisasi ini fokus pada peningkatan konsistensi desain, efisiensi kode, aksesibilitas, performa rendering yang mulus, serta responsivitas optimal pada perangkat mobile (375px).

---

## Requirements

### 1. Standarisasi Modul Modal & Dialog UMKM ke Radix UI

**User Story:** As a UMKM Owner, I want all confirmation popups, previews, and modals to look consistent and load smoothly, so that I can manage my campaigns and payments with confidence.

#### Acceptance Criteria

1. WHERE komponen modal UMKM (seperti `CancelCampaignModal`, `DuplicateCampaignModal`, `ExportReportModal`, `AssetPreviewModal`, `ReviewSubmissionModal`, `SubmissionDetailModal`, `CampaignCreatedModal`, `PaymentSimulationModal`, `SaveDraftModal`, `StartNegotiationModal`, `ExportFinanceReportModal`, `FinanceActionSuccessModal`, `TransactionDetailModal`, `OrderSuccessModal`, `SendCustomOfferModal`) dirender, THE SYSTEM SHALL menggunakan wrapper `ResponsiveModal` (`src/components/ui/responsive-modal.tsx`) atau `Dialog` (`src/components/ui/dialog.tsx`) dari folder `src/components/ui/`.
2. WHEN modal diaktifkan atau dinonaktifkan, THE SYSTEM SHALL menjamin animasi transisi backdrop dan panel modal berjalan dengan performa tinggi (60fps) tanpa menyebabkan lag pada rendering halaman.
3. IF modal dibuka pada resolusi mobile (< 768px), THEN the system SHALL merender dialog sebagai *Drawer* yang bergeser ke atas dari bawah layar demi kenyamanan jempol pengguna (thumb-zone friendly).
4. WHERE modal ditutup, THE SYSTEM SHALL mengembalikan fokus keyboard secara otomatis ke elemen pemicu sebelumnya (keyboard focus restoration) untuk kenyamanan aksesibilitas.

---

### 2. Refaktorisasi Dropdown Aksi ke Radix UI Dropdown Menu

**User Story:** As a UMKM Owner, I want action menu dropdowns to be highly interactive and open instantly, so that I can trigger quick actions on campaigns and negotiations without delay.

#### Acceptance Criteria

1. WHERE komponen menu aksi `DashboardActionMenu` (`src/components/features/umkm-dashboard/shared/DashboardActionMenu.tsx`) dirender, THE SYSTEM SHALL mengganti implementasi *click-outside* manual dengan komponen `DropdownMenu` (`src/components/ui/dropdown-menu.tsx`) berbasis Radix UI.
2. WHEN dropdown dibuka di layar dengan area terbatas, THE SYSTEM SHALL melakukan kalkulasi posisi secara otomatis (collision detection) agar panel menu tidak terpotong tepi layar.
3. IF salah satu item menu aksi diklik, THEN the system SHALL menutup panel dropdown secara otomatis dan menjalankan aksi callback yang ditentukan.

---

## Success Metrics

- **Performa Rendering:** Waktu render modal pasca-refaktor harus stabil di kisaran < 16ms (60fps) saat animasi transisi dibuka/tutup.
- **Responsivitas Mobile:** 100% modal UMKM teruji responsif pada resolusi 375px (Mobile) tanpa terjadi pemotongan teks atau overflow horizontal.
- **Aksesibilitas & Keyboard Navigation:** Dukungan penuh navigasi keyboard (Tab, Enter, Space, Escape) pada seluruh dialog dan dropdown pasca-refaktorisasi.

## Constraints

- Mobile-first mulai dari resolusi 375px, menggunakan bahasa Indonesia yang ramah bagi pelaku usaha mikro daerah.
- Wajib menggunakan komponen UI yang sudah terpasang di `src/components/ui/` untuk mencegah penambahan paket ketergantungan (dependencies) baru pada `package.json`.
- Tidak boleh mengubah atau merusak logika bisnis (*business logic*) yang ada di dalam masing-masing modal (seperti validasi input, pemrosesan API, dan state internal).

## Out of Scope

- Refaktorisasi komponen pada halaman dashboard milik Kreator (`src/components/features/creator-dashboard/`).
- Penambahan fitur fungsional baru (seperti sistem pembayaran baru atau integrasi API baru).
