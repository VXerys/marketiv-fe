# Tasks — UMKM Codebase Cleanup & Best Practices Alignment

Breakdown tugas ini dirancang untuk dijalankan secara inkremental, mengikuti alur dependensi dari utilitas dasar ke komponen fitur, hingga integrasi halaman utama.

---

## 🛠️ Batch 1: Utilitas Dasar & Konstanta (Fondasi)

### Task 1.1: Tambah Formatter Kompak ke `@/lib/formatters.ts`
- [x] Buka [formatters.ts](file:///c:/Users/user/marketiv-web/src/lib/formatters.ts).
- [x] Tambahkan fungsi `formatCompactViews(value: number): string` yang memformat angka ke representasi ringkas (misal: "1.2jt", "45rb").
- [x] Verifikasi format output menggunakan browser console atau pengujian sederhana.

### Task 1.2: Tambah Tipe Opsional ke Interface `Campaign` di `@/types/umkm-dashboard.types.ts`
- [x] Buka [umkm-dashboard.types.ts](file:///c:/Users/user/marketiv-web/src/types/umkm-dashboard.types.ts).
- [x] Tambahkan field optional pendukung wizard campaign (`category`, `location`, `videoStyle`, `callToAction`, `hashtags`, `requiredPoints`, `assetNotes`) ke interface `Campaign` agar selaras dengan skema database Appwrite.

---

## 🎨 Batch 2: Refactoring Komponen Domain Campaign (Campaign Mode)

### Task 2.1: Refactor `CampaignCard.tsx`
- [x] Buka [CampaignCard.tsx](file:///c:/Users/user/marketiv-web/src/components/features/umkm-dashboard/campaign/CampaignCard.tsx).
- [x] Ganti `window.location.href` dengan `useRouter()` dari `next/navigation`.
- [x] Hapus fungsi lokal `formatViews` dan `formatBudget`. Gunakan `formatCompactViews` and `formatCompactCurrency` dari `@/lib/formatters`.
- [x] Hapus `STATUS_CONFIG` lokal dan ganti penggunaan span badge manual dengan komponen `DashboardBadge` (`type="status"`).

### Task 2.2: Refactor `CampaignSummaryCards.tsx`
- [x] Buka [CampaignSummaryCards.tsx](file:///c:/Users/user/marketiv-web/src/components/features/umkm-dashboard/campaign/CampaignSummaryCards.tsx).
- [x] Hapus fungsi lokal `formatViews`. Gunakan `formatCompactViews` dari `@/lib/formatters`.
- [x] Ganti formatting budget manual di card escrow menggunakan `formatCompactCurrency` dari `@/lib/formatters`.

### Task 2.3: Refactor `CampaignsHeader.tsx`
- [x] Buka [CampaignsHeader.tsx](file:///c:/Users/user/marketiv-web/src/components/features/umkm-dashboard/campaign/CampaignsHeader.tsx).
- [x] Migrasikan seluruh style inline statik (`style={{ ... }}`) ke class Tailwind CSS v4.

---

## 🎨 Batch 3: Refactoring Komponen Domain Creator (Rate Card Mode)

### Task 3.1: Refactor `CreatorCard.tsx`
- [x] Buka [CreatorCard.tsx](file:///c:/Users/user/marketiv-web/src/components/features/umkm-dashboard/creators/CreatorCard.tsx).
- [x] Ganti `window.location.href` untuk navigasi chat negosiasi dengan `useRouter().push()`.

### Task 3.2: Refactor `CreatorToolbar.tsx`
- [x] Buka [CreatorToolbar.tsx](file:///c:/Users/user/marketiv-web/src/components/features/umkm-dashboard/creators/CreatorToolbar.tsx).
- [x] Migrasikan semua style inline statik pada wrapper panel, search container, select sort, dan kategori pills ke class Tailwind CSS v4.

### Task 3.3: Refactor `StartNegotiationModal.tsx`
- [x] Buka [StartNegotiationModal.tsx](file:///c:/Users/user/marketiv-web/src/components/features/umkm-dashboard/creators/modals/StartNegotiationModal.tsx).
- [x] Ganti redirect mockup `window.location.href` dengan `useRouter().push()`.

---

## 🎨 Batch 4: Refactoring Komponen Wizard Campaign

### Task 4.1: Refactor `ProductInfoStep.tsx`
- [x] Buka [ProductInfoStep.tsx](file:///c:/Users/user/marketiv-web/src/components/features/umkm-dashboard/create-campaign/steps/ProductInfoStep.tsx).
- [x] Hapus array `categories` lokal. Import dan gunakan `NICHE_OPTIONS` dari `create-campaign.constants.ts`.

---

## 🏠 Batch 5: Refactoring Dashboard Overview & Halaman Utama

### Task 5.1: Refactor `ActivityTimeline.tsx`
- [x] Buka [ActivityTimeline.tsx](file:///c:/Users/user/marketiv-web/src/components/features/umkm-dashboard/overview/ActivityTimeline.tsx).
- [x] Migrasikan style inline statik pada shell, header, list item, dan skeleton shimmer ke class Tailwind CSS v4.

### Task 5.2: Pemisahan RSC/Client di Dashboard Page & Overview Client
- [x] Buka [UmkmOverviewClient.tsx](file:///c:/Users/user/marketiv-web/src/components/features/umkm-dashboard/overview/UmkmOverviewClient.tsx).
- [x] Hapus fungsi mapping data `getMappedCampaigns()`. Terima data campaign ter-map langsung dari props (`mappedCampaigns: Campaign[]`).
- [x] Ganti format views statik manual (seperti `.toFixed(1) + "jt"`) dengan formatter generik.
- [x] Buka [page.tsx](file:///c:/Users/user/marketiv-web/src/app/dashboard/umkm/page.tsx) (Server Component).
- [x] Pindahkan fungsi pemetaan data ke level server dan kirimkan `mappedCampaigns` sebagai props ke `<UmkmOverviewClient>`.

---

## 🔌 Batch 6: Pembersihan Service Layer Appwrite

### Task 6.1: Bersihkan `umkm-appwrite.service.ts`
- [x] Buka [umkm-appwrite.service.ts](file:///c:/Users/user/marketiv-web/src/services/umkm/umkm-appwrite.service.ts).
- [x] Hapus semua baris `console.warn(...)`.
- [x] Tambahkan komentar `// TODO:` rinci di setiap fungsi stub, menjelaskan koleksi Appwrite target dan aturan RBAC yang akan diintegrasikan.

---

## 🧪 Batch 7: Verifikasi Akhir (DoD)

### Task 7.1: Build & Linter Check
- [x] Jalankan linter check: `npm run lint`. Pastikan output menghasilkan 0 error dan 0 warning.
- [x] Jalankan build produksi: `npm run build`. Pastikan build berhasil tanpa error TypeScript.

### Task 7.2: Verifikasi Alur Fungsional
- [x] Buka antarmuka lokal, lakukan pengetesan pada wizard campaign langkah demi langkah.
- [x] Pastikan navigasi modal negosiasi dan menu aksi pada campaign card berjalan mulus tanpa reload halaman.
- [x] Pastikan rendering status badge campaign menggunakan component `DashboardBadge` menampilkan warna yang sesuai.
