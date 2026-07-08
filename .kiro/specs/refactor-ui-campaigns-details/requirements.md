# Requirements — Refactor UI Campaigns Summary & Campaign Detail Layout

## Introduction

Pemolesan UI lanjutan pada halaman manajemen campaign UMKM (`/dashboard/umkm/campaign`) dan penyusunan ulang total layout halaman detail campaign (`/dashboard/umkm/campaign/[campaignId]`) agar sepenuhnya mematuhi standar desain premium **Marketiv Studio System v5.8**. Fokus pengerjaan ini adalah mengubah susunan card ringkasan metrik dari 6 kolom menjadi 3-3 (3 kolom 2 baris), menata ulang detail page menggunakan full-width layout, meniadakan ruang kosong akibat kolom asimetris, serta menyelaraskan bentuk controls, inputs, dan buttons ke bentuk modern rectangular (`rounded-xl`).

---

## Requirements

### 1. Pembagian Kolom Summary Cards (3-3 Layout)
**User Story:** As a UMKM owner, I want the summary cards on the Campaign list page to be larger and stacked in rows of 3, so that each metric card is wide enough to show the metrics clearly without text wrapping.

#### Acceptance Criteria
1. WHERE summary cards di-render di halaman utama Campaigns, THE SYSTEM SHALL menyusunnya dalam layout grid 3 kolom pada layar desktop/tablet besar (`lg:grid-cols-3` atau `grid-cols-3`).
2. WHEN di-render dalam 3 kolom, THE SYSTEM SHALL menyejajarkan 6 cards menjadi 2 baris seimbang (Baris 1: Total, Aktif, Selesai; Baris 2: Views, Pending, Budget).
3. WHERE skeleton loading summary cards di-render, THE SYSTEM SHALL menyesuaikan layout grid-nya agar persis sama (`lg:grid-cols-3`).

---

### 2. Penataan Ulang Detail Page (Full-Width Bento Layout)
**User Story:** As a UMKM owner, I want the Campaign Detail page to fill the workspace area without empty columns or wasted white space at the bottom, so that the screen real estate is utilized efficiently.

#### Acceptance Criteria
1. WHERE halaman detail campaign dirender, THE SYSTEM SHALL membungkus seluruh konten menggunakan `UmkmPageWrapper` dengan `maxWidth={1440}` untuk standarisasi centering, margin, padding, dan gap vertikal 26px.
2. WHERE panel utama detail (Workspace Card dan Review Bukti Tayang Section) dirender, THE SYSTEM SHALL menampilkannya dalam lebar penuh (`w-full` / `col-span-12`), tidak menggunakan split layout 8-4.
3. WHERE panel sekunder (Budget Card, Quick Actions, Health Checklist, dan Activity Timeline) dirender, THE SYSTEM SHALL mengelompokkannya di bagian bawah dalam grid responsif 2 kolom (`grid grid-cols-1 lg:grid-cols-2 gap-6`).
   - Kolom Kiri: Budget Card + Quick Actions Card
   - Kolom Kanan: Health Checklist Card + Activity Timeline Card
4. WHEN di-render, THE SYSTEM SHALL meniadakan ruang kosong di bawah kolom, sehingga seluruh kartu sejajar dan mengisi area screen secara seimbang.

---

### 3. Penyelarasan UI Kontrol & Badges Detail Campaign (v5.8 System Compliance)
**User Story:** As a UMKM owner, I want the buttons, badges, tabs, and alerts in the detail page to match the rectangular premium styling of the design system, so that the look and feel is consistent with other page elements.

#### Acceptance Criteria
1. WHERE tombol aksi, tautan navigasi kembali, dan tab menu dirender di detail page, THE SYSTEM SHALL menggunakan border radius `rounded-xl` (12px), meniadakan visual rounded capsule (`rounded-full`) untuk tabs dan select inputs.
2. WHERE status badges dan category badges dirender, THE SYSTEM SHALL menyesuaikan formatnya agar konsisten menggunakan warna token v5.8 (`bg-primary-50` / `text-primary-600` untuk active/UMKM, `bg-success-soft` / `text-success` untuk completed, dst).
3. WHERE box/pills panduan validasi di bagian submissions dirender, THE SYSTEM SHALL menggunakan border radius `rounded-xl` (12px) dengan border tipis netral.

---

## Success Metrics

- Tidak ada ruang kosong horizontal/vertikal asimetris berukuran > 100px pada resolusi desktop 1280px ke atas.
- Grid metrik ringkasan terbagi rata 3-3 (3 kolom, 2 baris) pada viewport desktop.
- Seluruh controls/pills/inputs di detail page berbentuk rectangular (`rounded-xl` / 12px) menggantikan bentuk kapsul lama.

## Constraints

- Menjaga kepatuhan 100% terhadap design system tokens v5.8.
- Teks UI menggunakan Bahasa Indonesia yang ringkas dan profesional.

## Out of Scope

- Penambahan logic baru untuk validasi video/submission (hanya memperbaiki struktur tata letak visual dan refactor UI).
