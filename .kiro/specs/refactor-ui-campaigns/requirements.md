# Requirements — Refactor UI Campaigns & Campaign Detail

## Introduction

Refactoring dan pemolesan UI pada halaman manajemen campaign UMKM (`/dashboard/umkm/campaign`) dan detail campaign (`/dashboard/umkm/campaign/[campaignId]`) agar sepenuhnya mematuhi standar desain premium **Marketiv Studio System v5.8**. Fokus utama iterasi ini adalah menata ulang spacing antarseksi, mendesain ulang summary cards agar tidak sempit, dan menstandarkan komponen input pencarian serta filter ke bentuk modern rectangular (`rounded-xl`) menggunakan Radix UI / standard dashboard primitives.

---

## Requirements

### 1. Optimalisasi Grid & Desain Summary Cards
**User Story:** As a UMKM owner, I want the campaign dashboard metrics to be clean and readable, so that I can monitor my budget, views, and active campaigns at a glance without text clipping or awkward wrapping.

#### Acceptance Criteria
1. WHERE halaman berada pada resolusi desktop (lebar layar >= 1280px), THE SYSTEM SHALL menampilkan 6 summary cards dalam grid 1 baris (`grid-cols-6`).
2. WHERE halaman berada pada resolusi tablet/medium screen (768px <= lebar layar < 1280px), THE SYSTEM SHALL menyusun summary cards dalam grid 3 kolom (`grid-cols-3` 2 baris) untuk menghindari penyempitan card (lebar minimal card dipertahankan di atas 200px).
3. WHERE halaman berada pada resolusi mobile (< 768px), THE SYSTEM SHALL menyusun summary cards dalam grid 2 kolom (`grid-cols-2` 3 baris).
4. WHEN menampilkan nilai nominal uang seperti `Rp 12.6jt`, THE SYSTEM SHALL menggunakan ukuran font responsif (`text-xl sm:text-2xl lg:text-[1.75rem] font-black text-neutral-900`) dan format flex wrap/break-all agar label mata uang dan angka tetap berada dalam 1 baris yang sama.
5. WHEN di-hover, THE SYSTEM SHALL memberikan umpan balik mikro-animasi pada card (`hover:-translate-y-1 hover:shadow-md transition-all duration-300`).

---

### 2. Standarisasi Input Controls & Filter Toolbar (Consistency)
**User Story:** As a UMKM owner, I want the search bar and filter dropdowns to have a consistent shape and design matching the rest of the dashboard pages, so that the platform interface feels professional and unified.

#### Acceptance Criteria
1. WHERE input search dan select dropdown dirender di Toolbar, THE SYSTEM SHALL mengganti bentuk kapsul (`rounded-full`) menjadi rectangular modern dengan sudut tumpul (`rounded-xl` / 12px) sesuai panduan v5.8.
2. WHERE input search dirender, THE SYSTEM SHALL memperluas lebar input search (min-width `280px` dan menggunakan `flex-grow`) serta meniadakan separator spacer flex kosong yang mengompresi kotak pencarian.
3. WHEN input search memiliki nilai teks pencarian, THE SYSTEM SHALL menampilkan tombol "X" untuk menghapus pencarian secara instan.
4. WHEN filter aktif diterapkan (search/kategori/sortir tidak default), THE SYSTEM SHALL menampilkan indikator "Filter aktif" berwarna oranye dan tombol "Reset" dengan border dashed merah (`border-red-200`) dan latar belakang soft red (`bg-red-50`).
5. WHERE view mode switcher dirender, THE SYSTEM SHALL menggunakan container rectangular (`rounded-xl`) dengan tombol mode grid/list rectangular (`rounded-lg`).

---

### 3. Pembenahan Spacing (Anti-Double Spacing)
**User Story:** As a UMKM owner, I want the spacing between dashboard sections to be balanced and uniform, so that the visual flow of the page is cohesive and premium.

#### Acceptance Criteria
1. WHERE halaman dibungkus oleh komponen `UmkmPageWrapper`, THE SYSTEM SHALL menghapus semua properti margin-bottom bawaan (`mb-6`, `mb-7`, `marginBottom: 26`) dari komponen anak (`CampaignsHeader`, `CampaignSummaryCards`, `CampaignToolbar`).
2. WHEN me-render seksi-seksi utama di dalam wrapper, THE SYSTEM SHALL hanya mengandalkan gap default vertical grid dari `UmkmPageWrapper` sebesar `26px` untuk menjaga konsistensi jarak vertikal.

---

### 4. Transformasi Status Tabs (Pills Layout)
**User Story:** As a UMKM owner, I want the status category filters to be displayed as clean individual pills, so that I can easily switch between campaign states.

#### Acceptance Criteria
1. WHERE status tabs dirender di Toolbar, THE SYSTEM SHALL menyusun opsi status sebagai tombol pill individual (`rounded-full border px-3 py-1.5`) dengan garis pembatas atas (`border-t border-neutral-100 pt-3`).
2. IF status tab aktif dipilih, THEN the system SHALL menerapkan latar belakang soft orange (`bg-primary-50`), border oranye tipis (`border-primary-500/30`), dan teks oranye gelap (`text-primary-600 font-extrabold`).
3. IF status tab tidak aktif, THEN the system SHALL menggunakan latar belakang putih (`bg-white`) dengan border abu-abu tipis (`border-neutral-200/60`) dan transisi hover yang halus.

---

## Success Metrics

- Nilai metrik pada summary card tidak boleh terpotong atau dibungkus ke baris baru pada resolusi minimum desktop 1024px.
- Kotak pencarian (search input) memiliki area ketik yang 50% lebih lebar dari desain lama pada viewport desktop.
- Jarak antarseksi vertikal konsisten secara visual (26px) di seluruh resolusi.

## Constraints

- Menggunakan design tokens warna dan radius dari **Marketiv Studio System v5.8** (radius `rounded-xl` untuk controls, warna `neutral` untuk teks, `primary` untuk aksen oranye).
- Teks UI menggunakan Bahasa Indonesia yang ringkas dan profesional.

## Out of Scope

- Fungsionalitas Supabase backend integration (fokus murni pada layout frontend dan local state data).
- Modifikasi atau integrasi menu WhatsApp/chat apa pun pada Campaign Mode (sesuai aturan bisnis inti Marketiv).
