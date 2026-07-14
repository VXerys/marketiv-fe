# Requirements — Refactor UI Job Pool & Job Detail Kreator

## Introduction

Refactoring keseluruhan UI/UX pada halaman Job Pool Kreator (`/dashboard/kreator/job-pool`) dan Detail Job (`/dashboard/kreator/job-pool/[id]`) agar konsisten dengan gaya desain premium modern **Marketiv Studio System** yang diterapkan pada halaman Dashboard Overview Kreator (`CreatorDashboardView.tsx`). Iterasi ini memoles metrik summary, card campaign, toolbar filter, detail brief, panel aset, dan modal persetujuan klaim, sekaligus menyelaraskan struktur data model frontend dengan skema database Appwrite resmi di folder `00_BACKEND`.

---

## Requirements

### 1. Refactor Summary Metrics Halaman Job Pool
**User Story:** As a Creator, I want the summary metric cards in the Job Pool to match the aesthetic style and hover response of the main dashboard, so that the experience is consistent and premium.

#### Acceptance Criteria
1. WHERE summary metrics dirender di halaman Job Pool, THE SYSTEM SHALL mengganti pemakaian `CreatorMetricCard` biasa dengan desain `MetricTile` yang ada di dashboard overview.
2. WHERE card metrik bertipe biasa dirender, THE SYSTEM SHALL menggunakan border `border-neutral-200/60`, latar belakang `bg-white/70 backdrop-blur-md`, sudut `rounded-[22px]`, dan micro-animation `hover:-translate-y-1 hover:shadow-lg transition-all duration-300`.
3. WHERE card metrik "Reward Tertinggi" dirender, THE SYSTEM SHALL menandainya sebagai `highlight` dengan gradien latar belakang `bg-gradient-to-br from-blue-50/20 to-white/95`, border `border-blue-200/50`, bayangan biru lembut, dan chip kecil bertuliskan "UTAMA" di sudut kanan atas.
4. WHEN metrik dirender, THE SYSTEM SHALL menggunakan font display berukuran besar (`text-[1.3rem] sm:text-[1.4rem] font-black text-[#1e1b4b]`) dengan icon Lucide modern di dalam container rounded `rounded-[12px]` yang membesar saat di-hover.

---

### 2. Refactor Grid & Desain Campaign Cards (Aesthetic Match)
**User Story:** As a Creator, I want to browse campaigns using visual cards that highlight cover images, brand profiles, and clear payouts, so that I can make quick decisions on which job to claim.

#### Acceptance Criteria
1. WHERE daftar campaign dirender dalam grid, THE SYSTEM SHALL mengganti bentuk card lama dengan visual `CampaignCard` premium dari dashboard overview.
2. WHERE card campaign dirender, THE SYSTEM SHALL memiliki rasio aspek gambar sampul 4:3 dengan overlay gradien hitam di bagian bawah untuk menampung baris nama brand dan logo brand.
3. IF campaign tidak memiliki cover image (`thumbnailUrl`), THEN the system SHALL merender cover dengan gradien warna acak/kustom berdasarkan kategori (`niche`) menggunakan peta `NICHE_GRADIENTS`.
4. WHERE platform campaign didukung, THE SYSTEM SHALL menyertakan chip platform transparan blur di atas cover, misalnya bertuliskan "PPV" (Pay Per View).
5. WHEN campaign berstatus hampir penuh (kuota tersisa <= 1) atau memiliki reward tinggi (CPM >= Rp6.000), THE SYSTEM SHALL menampilkan chip status absolute di sudut kiri atas cover (`bg-amber-50/90` atau `bg-violet-600/90` dengan efek blur backdrop).
6. WHERE info pembayaran dirender, THE SYSTEM SHALL memformat teks harga per 1000 views dengan warna ungu tebal (`text-[#7c3aed] font-black text-[1.1rem]`) diikuti teks `/ 1K views`.
7. WHERE kuota kreator ditampilkan, THE SYSTEM SHALL merender progress bar premium dengan warna gradien oranye-ungu (`linear-gradient(90deg, #7c3aed, #4f46e5)`) yang menunjukkan sisa kuota yang belum diklaim.
8. WHERE tombol aksi dirender di bagian bawah card, THE SYSTEM SHALL menyediakan tombol "Detail" berbentuk outline minimalis dan tombol "Klaim Job" berwarna ungu gradien dengan drop shadow premium (`box-shadow: 0 4px 14px rgba(124,58,237,.30)`).

---

### 3. Standarisasi Filter Toolbar
**User Story:** As a Creator, I want the search input and filtering controls to have standard rounded-xl shapes and clear visual state feedback, so that filtering is easy and consistent.

#### Acceptance Criteria
1. WHERE filter toolbar dirender, THE SYSTEM SHALL mengubah seluruh control input (kotak pencarian, dropdown kategori, dropdown sorting, tombol kuota) menjadi rectangular modern (`rounded-xl` / 12px) dengan latar belakang `bg-neutral-50/50` dan border tipis.
2. WHEN input pencarian diaktifkan, THE SYSTEM SHALL memperluas lebar input pencarian menggunakan properti `flex-grow` dan menambahkan icon Search Lucide di sisi kiri dalam.
3. WHEN salah satu filter (search, niche, sorting, kuota tersedia) diubah dari nilai default, THE SYSTEM SHALL merender tombol reset filter di sebelah kanan kontrol dengan transisi hover yang halus.

---

### 4. Refactor Halaman Detail Job (`JobDetailView`)
**User Story:** As a Creator, I want the campaign details page to have a clean two-column layout separating the product brief from assets and action panels, so that I can read instructions clearly and trigger claims easily.

#### Acceptance Criteria
1. WHERE seksi utama detail job dirender, THE SYSTEM SHALL membungkus setiap blok info (Header, Metrik, Brief, Aset, Aturan Pembayaran) dengan style card premium `bg-white/70 border border-neutral-200/60 rounded-[22px] shadow-sm`.
2. WHERE metrik detail dirender, THE SYSTEM SHALL memformat 5 card metrik (Rate, Budget Escrow, Target Views, Batas Waktu, Kuota) dalam satu baris dengan visual yang bersih dan label uppercase.
3. WHERE panel Do's & Don'ts panel dirender, THE SYSTEM SHALL membaginya menjadi dua kolom horizontal berlatar belakang soft green (`bg-green-50/20` dengan teks hijau) dan soft red (`bg-red-50/20` dengan teks merah) untuk memisahkan instruksi boleh/tidak boleh secara visual.
4. WHERE panel kanan dirender, THE SYSTEM SHALL menyusun:
   - Thumbnail produk dengan link Google Drive / Dropbox menggunakan tombol hijau tua premium (`bg-green-950 hover:bg-green-900`).
   - Kartu Aturan Pembayaran dengan latar belakang indigo soft (`bg-indigo-50/20`) dan teks panduan tebal.
   - Tombol "Klaim Kampanye Ini" berukuran besar dengan gradien warna oranye/ungu cerah yang otomatis disabled jika kuota campaign penuh.
5. WHERE tombol kembali (`Kembali ke Job Pool`) dirender, THE SYSTEM SHALL menggunakan gaya minimalis dengan mikro-animasi geser kiri pada icon panah ketika di-hover (`group-hover:-translate-x-1`).

---

### 5. Penyelarasan Skema Data Model (Database Alignment)
**User Story:** As a Developer, I want the UI data contract to match the Appwrite collection schema properties, so that backend API integration does not require complex object mapping.

#### Acceptance Criteria
1. WHERE data model campaign digunakan di frontend (`CreatorJob` dan `CreatorActiveWork`), THE SYSTEM SHALL menyelaraskan tipe datanya dengan koleksi `campaigns` dan `campaign_briefs` dari Appwrite:
   - UI `niche` / `category` harus merujuk ke field `category` di database.
   - UI `ratePerThousandViews` harus merujuk ke field `rewardPer1000Views` (integer CPM).
   - UI `quota` harus merujuk ke field `claimLimit`.
   - UI `usedQuota` harus merujuk ke field `totalClaims` (denormalisasi).
   - UI `totalBudget` harus merujuk ke field `budget`.
   - UI `externalAssetUrl` harus merujuk ke field `asset_external_url` (atau `campaign_briefs.materialsJson` jika berupa payload).
2. WHERE detail instruksi di-render pada detail page, THE SYSTEM SHALL memetakan struktur data dari tabel `campaign_briefs` resmi:
   - `productDescription` -> `campaign_briefs.goal` atau `campaigns.description`.
   - `contentInstruction` -> `campaign_briefs.requiredElements`.
   - `doAndDont.do` -> `campaign_briefs.allowedContent` (parsing array/string).
   - `doAndDont.dont` -> `campaign_briefs.forbiddenContent` (parsing array/string).
   - `targetAudience` -> `campaign_briefs.targetAudience`.
   - `ctaInstruction` -> `campaign_briefs.cta`.
3. WHERE operasi klaim dipicu, THE SYSTEM SHALL mencatat data claim baru ke dalam koleksi `campaign_claims` dengan atribut `campaignId`, `creatorId`, `status: "claimed"`, dan `claimedAt: datetime`.

---

## Success Metrics

- Tampilan visual Job Pool dan Detail Job 100% konsisten dari segi radius border (`rounded-[22px]`), skema warna, dan typography dengan halaman Dashboard Overview Kreator.
- Tidak ada clipping teks nominal mata uang pada layar mobile (lebar minimum 375px).
- Transisi status klaim campaign (Claimed -> Aktif di Pekerjaan Aktif) terintegrasi secara semantik dengan simulasi data model Appwrite.

## Constraints

- Mobile-first, responsif dari 375px hingga 1440px+.
- Bahasa Indonesia yang santun, ringkas, dan jelas pada seluruh copy UI.
- Menerapkan arsitektur zero-chat dan zero-download video di tingkat frontend sesuai business rules Campaign Mode.

## Out of Scope

- Setup database server riil dan API route controller fungsional (fokus terbatas pada penyesuaian tipe data kontrak model dan slicing UI premium).
