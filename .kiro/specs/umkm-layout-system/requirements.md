# Requirements Document

## Introduction

Fitur ini melakukan standardisasi dan perbaikan layout system seluruh halaman UMKM dashboard di marketiv-web agar sesuai dengan UI Kit prototype Marketiv. Saat ini terdapat inkonsistensi padding, maxWidth, gap vertikal, scroll architecture, dan breakpoint grid yang menyebabkan tampilan tidak konsisten antar halaman dan tidak sesuai prototype. Solusi utama adalah membuat komponen `UmkmPageWrapper` terpusat sebagai standar layout, menghapus `overflow-y-auto` ganda di page-level, dan memperbaiki grid responsiveness di setiap halaman.

## Glossary

- **UmkmPageWrapper**: Komponen React baru yang membungkus konten halaman UMKM dengan standar padding, maxWidth, dan gap vertikal yang konsisten.
- **DashboardShell**: Komponen yang mengelola scroll utama dashboard melalui satu `overflow-y-auto` di `SidebarInset`.
- **UmkmDashboardChrome**: Komponen pembungkus shell + sidebar + topbar yang digunakan di halaman UMKM. Tidak boleh punya scroll tambahan.
- **PageWrapper**: Sebutan umum untuk `UmkmPageWrapper`.
- **KPI Grid**: Grid 6 kartu metrik utama di halaman Overview.
- **Campaign Grid**: Grid kartu campaign di halaman Campaign.
- **Kreator Grid**: Grid kartu kreator di halaman Kreator.
- **2-Column Layout**: Layout dua kolom di halaman Overview dengan rasio 1.85fr:1fr aktif di ≥ 1100px.
- **Design Token**: Nilai CSS yang disepakati dari `globals.css` dan UI Kit prototype sebagai standar visual.
- **Double overflow-y-auto**: Kondisi ketika ada dua elemen `overflow-y-auto` bersarang — satu di `DashboardShell` dan satu lagi di page-level wrapper — menyebabkan scroll tidak berfungsi dengan benar.
- **gap**: Jarak vertikal antar section dalam satu halaman, diimplementasikan melalui CSS `gap` pada grid container atau class Tailwind `space-y-*`.
- **clamp padding**: Nilai padding responsif `clamp(16px, 3vw, 28px)` dari prototype yang menyesuaikan diri dengan lebar viewport.
- **Prototype**: File UI Kit di `C:\Users\user\Downloads\Implement PRD with UI Kits\` yang menjadi acuan visual.
- **Orphan card**: Kartu yang terpisah sendiri di baris baru karena jumlah kolom tidak habis dibagi jumlah item.

## Requirements

---

### Requirement 1: Komponen UmkmPageWrapper

**User Story:** Sebagai developer, saya ingin ada komponen `UmkmPageWrapper` yang terpusat, sehingga semua halaman UMKM bisa menerapkan layout standar (padding, maxWidth, gap) hanya dengan satu komponen tanpa menulis ulang style yang sama di setiap halaman.

#### Acceptance Criteria

1. THE `UmkmPageWrapper` SHALL menerima prop `children` bertipe `ReactNode`.
2. THE `UmkmPageWrapper` SHALL menerapkan padding `clamp(16px, 3vw, 28px)` secara horizontal dan vertikal menggunakan inline style.
3. THE `UmkmPageWrapper` SHALL menerapkan `display: grid` dan `gap: 26px` sebagai container vertikal antar section.
4. THE `UmkmPageWrapper` SHALL menerapkan `maxWidth: 1400px` sebagai batas lebar konten dan `marginLeft: auto; marginRight: auto` untuk centering.
5. THE `UmkmPageWrapper` SHALL menerapkan `width: 100%` dan `alignContent: start` agar konten tidak memanjang mengisi sisa ruang.
6. THE `UmkmPageWrapper` SHALL menerima prop opsional `maxWidth?: number` yang meng-override nilai default 1400px, untuk mengakomodasi halaman Campaign yang menggunakan 1440px.
7. THE `UmkmPageWrapper` SHALL ditempatkan di `src/components/features/umkm-dashboard/shared/UmkmPageWrapper.tsx` dan diekspor dari `src/components/features/umkm-dashboard/shared/index.ts`.
8. WHERE prop `className` diberikan, THE `UmkmPageWrapper` SHALL menggabungkan class tambahan tersebut dengan class default menggunakan utility `cn()`.

---

### Requirement 2: Perbaikan Scroll Architecture (Hapus Double overflow-y-auto)

**User Story:** Sebagai pengguna, saya ingin scroll halaman dashboard berjalan mulus dan hanya dari satu tempat, sehingga tidak ada scroll yang terjebak di dalam konten atau halaman yang tidak bisa di-scroll sampai bawah.

#### Acceptance Criteria

1. THE `DashboardShell` SHALL menjadi satu-satunya elemen yang memiliki `overflow-y-auto` di level shell dashboard (sudah ada di `SidebarInset` — tidak boleh diubah).
2. WHEN halaman Keuangan (`/dashboard/umkm/keuangan/page.tsx`) di-render, THE page wrapper div SHALL tidak memiliki class `overflow-y-auto`.
3. WHEN halaman Kreator (`/dashboard/umkm/kreator/page.tsx`) di-render, THE page wrapper div SHALL tidak memiliki class `overflow-y-auto`.
4. WHEN halaman Negosiasi (`/dashboard/umkm/negosiasi/page.tsx`) di-render, THE page wrapper div SHALL tidak memiliki class `overflow-y-auto`.
5. WHEN halaman Campaign Buat (`/dashboard/umkm/campaign/buat/page.tsx`) di-render, THE page wrapper div SHALL tidak memiliki class `overflow-y-auto`.
6. WHEN halaman Analitik (`AnalitikClient.tsx`) di-render, THE page wrapper div SHALL tidak memiliki class `overflow-y-auto`.
7. WHEN halaman Pengaturan (`PengaturanClient.tsx`) di-render, THE page wrapper div SHALL tidak memiliki class `overflow-y-auto`.
8. WHEN halaman Campaign (`CampaignsPage.tsx`) di-render, THE page wrapper div SHALL tidak memiliki class `overflow-y-auto`.
9. IF konten halaman melebihi tinggi viewport, THEN THE `DashboardShell` SHALL menangani scroll secara keseluruhan sehingga seluruh halaman dapat di-scroll.

---

### Requirement 3: Standardisasi maxWidth Semua Halaman

**User Story:** Sebagai pengguna, saya ingin konten di setiap halaman UMKM dashboard memiliki lebar maksimum yang konsisten, sehingga konten tidak bergeser atau tampak berbeda ukurannya saat berpindah antar halaman.

#### Acceptance Criteria

1. THE `UmkmOverviewClient.tsx` SHALL menerapkan `maxWidth: 1400px` pada wrapper konten utamanya (sesuai prototype `DashboardPage`).
2. THE `CampaignsPage.tsx` SHALL menerapkan `maxWidth: 1440px` pada wrapper konten utamanya (sesuai prototype `CampaignPage`).
3. THE `FinanceOverviewPage` SHALL menerapkan `maxWidth: 1400px` pada wrapper konten utamanya (menggantikan tidak ada maxWidth).
4. THE `CreatorDirectoryPage` SHALL menerapkan `maxWidth: 1400px` pada wrapper konten utamanya (menggantikan tidak ada maxWidth).
5. THE `NegotiationListPage` SHALL menerapkan `maxWidth: 1400px` pada wrapper konten utamanya (menggantikan `max-w-7xl` = 1280px).
6. THE `AnalitikClient.tsx` SHALL menerapkan `maxWidth: 1400px` pada wrapper konten utamanya (menggantikan `max-w-7xl` = 1280px).
7. THE `PengaturanClient.tsx` SHALL mempertahankan `maxWidth: 768px` (`max-w-3xl`) karena halaman pengaturan adalah form sempit yang memang didesain lebih kecil.
8. WHEN pengguna berpindah dari halaman Overview ke halaman Campaign, THE lebar area konten SHALL tidak tampak bergeser secara visual lebih dari perbedaan 40px.

---

### Requirement 4: Standardisasi Gap Vertikal Antar Section

**User Story:** Sebagai pengguna, saya ingin jarak vertikal antar section di setiap halaman terasa konsisten dan sesuai desain, sehingga halaman tidak terlihat terlalu rapat atau terlalu longgar.

#### Acceptance Criteria

1. THE `UmkmPageWrapper` SHALL menerapkan `gap: 26px` sebagai nilai default gap vertikal antar section, sesuai nilai prototype `DashboardPage` dan `CampaignPage`.
2. WHEN `CampaignsPage.tsx` menggunakan `UmkmPageWrapper`, THE nilai `gap: 0` yang ada di inline style SHALL dihapus dan digantikan dengan `gap: 26px` dari `UmkmPageWrapper`.
3. WHEN halaman Keuangan menggunakan `UmkmPageWrapper`, THE `space-y-6` (24px) SHALL digantikan oleh `gap: 26px` dari komponen wrapper.
4. WHEN halaman Kreator menggunakan `UmkmPageWrapper`, THE `space-y-6` (24px) SHALL digantikan oleh `gap: 26px` dari komponen wrapper.
5. WHEN halaman Analitik menggunakan `UmkmPageWrapper`, THE `space-y-6` (24px) SHALL digantikan oleh `gap: 26px` dari komponen wrapper.
6. WHEN halaman Pengaturan menggunakan `UmkmPageWrapper`, THE `space-y-6` (24px) SHALL digantikan oleh `gap: 26px` dari komponen wrapper.
7. THE `NegotiationListPage` SHALL menggunakan `gap: 26px` melalui `UmkmPageWrapper` dan menghapus `space-y-6` serta `pb-24` (96px) yang ada.
8. WHEN `NegotiationListPage` menggunakan `UmkmPageWrapper`, THE `pb-24` yang ada di wrapper div SHALL dihapus karena padding bottom sudah dikelola oleh `UmkmPageWrapper`.

---

### Requirement 5: Standardisasi Padding Semua Halaman

**User Story:** Sebagai pengguna, saya ingin padding konten di setiap halaman terasa sama besar dan responsif, sehingga tidak ada halaman yang terlihat terlalu sempit atau terlalu lebar dibanding halaman lain.

#### Acceptance Criteria

1. THE `UmkmPageWrapper` SHALL menerapkan padding `clamp(16px, 3vw, 28px)` pada semua sisi (top, right, bottom, left), sesuai dengan nilai prototype.
2. WHEN halaman Keuangan, Kreator, Negosiasi, atau Campaign Buat menggunakan `UmkmPageWrapper`, THE class `p-4 sm:p-6 lg:p-8` (yang menghasilkan max padding 32px) SHALL dihapus dari page wrapper div.
3. WHEN halaman Overview menggunakan `UmkmPageWrapper`, THE inline style `padding: "clamp(16px, 3vw, 32px)"` (max 32px) SHALL digantikan dengan `clamp(16px, 3vw, 28px)` (max 28px) sesuai prototype.
4. WHEN viewport lebar ≥ 1024px, THE `UmkmPageWrapper` SHALL menerapkan padding horizontal minimal 24px dan maksimal 28px.
5. WHEN viewport lebar ≤ 640px (mobile), THE `UmkmPageWrapper` SHALL menerapkan padding minimal 16px.

---

### Requirement 6: Perbaikan 2-Column Layout di Halaman Overview

**User Story:** Sebagai pengguna, saya ingin layout dua kolom di halaman Overview berpindah ke single column di layar kecil dan menjadi dua kolom di layar lebar, sehingga tampilan selalu proporsional di semua ukuran layar.

#### Acceptance Criteria

1. THE `UmkmOverviewClient.tsx` SHALL menerapkan layout 2-kolom dengan breakpoint 1100px menggunakan CSS `grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr)` sesuai prototype.
2. WHEN viewport lebar < 1100px, THE 2-column layout SHALL runtuh menjadi 1 kolom (`grid-template-columns: 1fr`).
3. WHEN viewport lebar ≥ 1100px, THE 2-column layout SHALL menampilkan kolom kiri dan kanan secara berdampingan.
4. THE gap antara kolom kiri dan kolom kanan SHALL menggunakan nilai `26px` (menggantikan `24px` yang ada saat ini).
5. THE kolom kiri SHALL berisi `CampaignSection` dan `ActivityTimeline` dengan gap internal `26px`.
6. THE kolom kiri SHALL menggunakan `gap: 26px` (menggantikan `gap: 20px` yang ada saat ini) di antara komponen-komponennya.
7. THE kolom kanan SHALL menggunakan `gap: 22px` di antara komponen-komponennya, sesuai prototype (`FinancialOverview`, `InsightSection`, `QuickActions`).

---

### Requirement 7: Perbaikan KPI Grid di Halaman Overview

**User Story:** Sebagai pengguna, saya ingin 6 kartu KPI di halaman Overview tampil rapi dalam grid yang selalu seimbang tanpa ada kartu yang terisolasi di baris baru (orphan card), sehingga tampilan terasa terstruktur dan profesional.

#### Acceptance Criteria

1. THE `KPISection` dalam `UmkmOverviewClient` SHALL menerapkan `grid-template-columns: repeat(2, minmax(0, 1fr))` sebagai breakpoint terkecil (mobile).
2. WHEN viewport lebar ≥ 640px, THE KPI grid SHALL menampilkan `repeat(3, minmax(0, 1fr))` — 3 kolom × 2 baris untuk 6 kartu.
3. WHEN viewport lebar ≥ 1280px, THE KPI grid SHALL menampilkan `repeat(6, minmax(0, 1fr))` — 6 kartu dalam satu baris.
4. THE KPI grid SHALL menggunakan `gap: 12px` antar kartu.
5. IF grid menggunakan `auto-fill` atau `auto-fit` dengan `minmax`, THEN THE minimum column size SHALL menggunakan nilai yang memastikan 6 kartu pas di desktop tanpa menghasilkan orphan card (gunakan fixed column count bukan auto-fill).
6. THE KPI grid implementation saat ini di `KPISection.tsx` SUDAH memenuhi requirements 1-4 (sudah menggunakan fixed breakpoints). WHEN perbaikan dilakukan, THE implementasi tersebut SHALL dipertahankan dan gap-nya disesuaikan jika diperlukan.

---

### Requirement 8: Perbaikan Campaign Card Grid Breakpoints

**User Story:** Sebagai pengguna, saya ingin grid kartu campaign di halaman Campaign menampilkan 2 kolom di tablet dan 4 kolom di layar sangat lebar, sehingga lebih banyak campaign bisa terlihat sekaligus di layar besar.

#### Acceptance Criteria

1. THE campaign card grid di `CampaignsPage.tsx` SHALL menerapkan `grid-template-columns: 1fr` sebagai default (mobile, < 640px).
2. WHEN viewport lebar ≥ 640px, THE campaign card grid SHALL menampilkan `repeat(2, 1fr)` (sesuai prototype, bukan md:768px).
3. WHEN viewport lebar ≥ 1100px, THE campaign card grid SHALL menampilkan `repeat(3, 1fr)` (sesuai prototype, bukan lg:1024px).
4. WHEN viewport lebar ≥ 1400px, THE campaign card grid SHALL menampilkan `repeat(4, 1fr)` (breakpoint baru sesuai prototype).
5. THE gap antar campaign card SHALL menggunakan nilai `18px` sesuai prototype.
6. WHEN grid view mode aktif, THE breakpoints tersebut SHALL diterapkan. WHEN table view mode aktif, THE breakpoints tidak berlaku (tampilan tetap sebagai table full-width).

---

### Requirement 9: Perbaikan Halaman Analitik — Refactor ke UmkmPageWrapper

**User Story:** Sebagai developer, saya ingin halaman Analitik menggunakan pola halaman yang sama dengan halaman lain, sehingga tidak ada inkonsistensi struktur komponen yang menyebabkan bug layout di masa depan.

#### Acceptance Criteria

1. THE `AnalitikClient.tsx` SHALL memanggil `UmkmDashboardChrome` hanya dari dalam komponen page route (`/dashboard/umkm/analitik/page.tsx`), bukan dari dalam client component itu sendiri.
2. THE `AnalitikClient.tsx` SHALL menggunakan `UmkmPageWrapper` sebagai wrapper konten utamanya menggantikan `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ...">`.
3. THE halaman Analitik SHALL menerapkan `maxWidth: 1400px` melalui `UmkmPageWrapper`.
4. WHEN `AnalitikClient.tsx` direfactor, THE `/dashboard/umkm/analitik/page.tsx` SHALL membungkus `AnalitikClient` dengan `UmkmDashboardChrome`.
5. THE chart grid di `AnalitikClient.tsx` SHALL menerapkan breakpoint 900px untuk layout 2 kolom (sesuai implementasi saat ini yang sudah benar) dengan nilai gap `20px`.

---

### Requirement 10: Perbaikan Halaman Pengaturan — Refactor ke UmkmPageWrapper

**User Story:** Sebagai developer, saya ingin halaman Pengaturan menggunakan pola halaman yang sama dengan halaman lain, sehingga shell dan scroll dikelola secara konsisten.

#### Acceptance Criteria

1. THE `PengaturanClient.tsx` SHALL memanggil `UmkmDashboardChrome` hanya dari dalam komponen page route (`/dashboard/umkm/pengaturan/page.tsx`), bukan dari dalam client component itu sendiri.
2. THE `PengaturanClient.tsx` SHALL menggunakan `UmkmPageWrapper` dengan `maxWidth={768}` sebagai wrapper konten utamanya menggantikan `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-3xl mx-auto w-full">`.
3. WHEN `PengaturanClient.tsx` direfactor, THE `/dashboard/umkm/pengaturan/page.tsx` SHALL membungkus `PengaturanClient` dengan `UmkmDashboardChrome`.
4. THE jarak antar section form di `PengaturanClient.tsx` SHALL menggunakan `gap: 26px` dari `UmkmPageWrapper` menggantikan `space-y-6`.

---

### Requirement 11: Standardisasi Page-Level Wrapper Halaman Keuangan, Kreator, Negosiasi, dan Campaign Buat

**User Story:** Sebagai developer, saya ingin semua page route UMKM yang menggunakan pola `UmkmDashboardChrome > div.flex-1.overflow-y-auto` digantikan dengan pola yang bersih menggunakan `UmkmPageWrapper`, sehingga kode lebih mudah dipelihara.

#### Acceptance Criteria

1. THE `/dashboard/umkm/keuangan/page.tsx` SHALL menggantikan `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">` dengan `<UmkmPageWrapper>` yang membungkus `<FinanceOverviewPage />`.
2. THE `/dashboard/umkm/kreator/page.tsx` SHALL menggantikan `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">` dengan `<UmkmPageWrapper>` yang membungkus `<CreatorDirectoryPage />`.
3. THE `/dashboard/umkm/negosiasi/page.tsx` SHALL menggantikan `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">` dengan `<UmkmPageWrapper>` yang membungkus `<NegotiationListPage />`.
4. THE `/dashboard/umkm/campaign/buat/page.tsx` SHALL menggantikan `<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">` dengan `<UmkmPageWrapper>` yang membungkus kontennya.
5. THE `FinanceOverviewPage`, `CreatorDirectoryPage`, dan `NegotiationListPage` SHALL tidak memiliki padding luar sendiri karena padding sudah dikelola oleh `UmkmPageWrapper` di page route.
6. IF komponen seperti `FinanceOverviewPage` memiliki wrapper `div` paling luar dengan padding sendiri, THEN THE padding tersebut SHALL dihapus agar tidak double-padding dengan `UmkmPageWrapper`.

---

### Requirement 12: Perbaikan Komponen CampaignsPage — Gunakan UmkmPageWrapper

**User Story:** Sebagai developer, saya ingin `CampaignsPage` menggunakan `UmkmPageWrapper` sehingga layout standar diterapkan dan `gap: 0` yang menyebabkan semua section menempel dihapus.

#### Acceptance Criteria

1. THE `CampaignsPage.tsx` SHALL menggantikan wrapper div dengan inline style `gap: 0` dan `overflow-y-auto` dengan `UmkmPageWrapper` berparameter `maxWidth={1440}`.
2. THE `CampaignsPage.tsx` SHALL tidak lagi memiliki `overflow-y-auto` di level wrapper-nya.
3. WHEN `CampaignsPage` di-render, THE section Header, Summary Cards, Toolbar, dan Campaign Grid SHALL memiliki jarak vertikal `26px` di antara masing-masing section.
4. THE `CampaignSummaryCards` SHALL menggunakan `gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))"` dengan `gap: 14px` sesuai prototype.

---

### Requirement 13: Konsistensi Visual Antar Halaman

**User Story:** Sebagai pengguna, saya ingin saat berpindah antar halaman UMKM dashboard, tampilan terasa konsisten dan terpadu, sehingga pengalaman menggunakan dashboard terasa profesional dan tidak membingungkan.

#### Acceptance Criteria

1. WHEN pengguna berpindah antar halaman Overview, Campaign, Kreator, Keuangan, Analitik, Negosiasi, dan Pengaturan, THE padding horizontal konten SHALL konsisten menggunakan nilai `clamp(16px, 3vw, 28px)` di semua halaman.
2. WHEN pengguna berpindah antar halaman, THE jarak vertikal antar section pertama dari atas SHALL konsisten ≤ 5px perbedaan visual.
3. THE halaman yang tidak memiliki 2-column layout (Kreator, Keuangan, Analitik, Negosiasi, Pengaturan, Campaign) SHALL menggunakan single-column layout melalui `UmkmPageWrapper`.
4. THE page header section (judul halaman + subtitle + tombol aksi) di setiap halaman SHALL memiliki margin bawah yang konsisten, dikelola melalui gap dari `UmkmPageWrapper`.
5. WHEN halaman dimuat ulang (refresh) atau diakses langsung via URL, THE layout SHALL tampil identik seperti saat diakses via navigasi sidebar.

---

### Requirement 14: Design Token Compliance

**User Story:** Sebagai developer, saya ingin semua nilai layout (padding, gap, maxWidth, border-radius, shadow) yang digunakan dalam perbaikan ini mengacu pada design token yang sudah didefinisikan, sehingga nilai-nilai tersebut mudah diubah secara global di masa depan.

#### Acceptance Criteria

1. THE `UmkmPageWrapper` SHALL menggunakan nilai design token berikut dari `globals.css`: padding `clamp(16px, 3vw, 28px)`, gap `26px`, maxWidth `1400px`.
2. THE shadow pada kartu di setiap halaman SHALL menggunakan `var(--shadow-1)` = `0 8px 24px rgba(15,23,42,.06)` sebagai shadow default.
3. THE border-radius pada card container besar SHALL menggunakan nilai 22–28px sesuai prototype.
4. THE border warna di card container SHALL menggunakan `var(--border)` = `rgba(17, 24, 39, 0.10)` sebagai standar.
5. IF nilai padding, gap, atau maxWidth baru ditambahkan ke `globals.css` sebagai CSS custom property, THEN THE `UmkmPageWrapper` SHALL menggunakan CSS custom property tersebut bukan hardcoded value.

---

### Requirement 15: Backward Compatibility dan Tidak Merusak Halaman Lain

**User Story:** Sebagai developer, saya ingin perubahan layout system ini tidak memengaruhi halaman di luar UMKM dashboard (halaman kreator dashboard, landing page, dll.), sehingga perbaikan ini aman untuk di-deploy.

#### Acceptance Criteria

1. THE `UmkmPageWrapper` SHALL hanya digunakan di dalam direktori komponen dan halaman UMKM dashboard (`/dashboard/umkm/**` dan `src/components/features/umkm-dashboard/**`).
2. THE `DashboardShell` SHALL tidak mengalami perubahan selama proses perbaikan ini.
3. THE komponen yang digunakan oleh creator dashboard (`/dashboard/kreator/**`) SHALL tidak terpengaruh oleh perubahan ini.
4. WHEN `UmkmDashboardChrome` digunakan tanpa `UmkmPageWrapper` (contoh: halaman negosiasi detail room), THE shell SHALL tetap berfungsi normal.
5. IF ada halaman UMKM yang tidak di-scope dalam requirement ini (contoh: `/dashboard/umkm/campaign/[campaignId]/**`), THEN THE halaman tersebut SHALL tidak mengalami perubahan layout.
