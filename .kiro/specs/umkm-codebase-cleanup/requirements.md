# Requirements — UMKM Codebase Cleanup & Best Practices Alignment

## Introduction

Spec ini mencakup audit dan perbaikan kode seluruh fitur UMKM Dashboard
(`src/components/features/umkm-dashboard/`, `src/app/dashboard/umkm/`)
sebelum integrasi backend Appwrite dilakukan. Fokus utama adalah:
(1) konsistensi penggunaan Tailwind CSS v4 token vs inline style,
(2) pelanggaran pola navigasi Next.js (penggunaan `window.location.href`),
(3) duplikasi logika formatter di dalam komponen,
(4) duplikasi array konstanta (kategori, niche, dll),
(5) pola RSC/Client Component yang belum optimal,
(6) inkonsistensi status badge,
(7) kesiapan service layer Appwrite,
sehingga pada saat polish UI dan integrasi Appwrite dilakukan, kodebase
sudah bersih, konsisten, dan mudah disambungkan ke layanan nyata.

Mode terkait: **Campaign Mode & Rate Card Mode (keduanya)** — diperbaiki pada
layer UI dan service layer; logika bisnis tidak diubah.

---

## Requirements

### 1. Eliminasi Inline Style — Migrasi ke Tailwind Token

**User Story:** As a developer, I want all styling to use Tailwind v4 `@theme` tokens
so that the codebase is consistent, maintainable, and easy to retheme without
hunting raw hex values scattered across dozens of components.

#### Acceptance Criteria

1. WHEN sebuah file TSX di `src/components/features/umkm-dashboard/` mengandung
   `style={{ color: "#hex", background: "#hex" }}` atau nilai CSS hardcoded yang
   **memiliki padanan token** di `@theme` (`globals.css`), THEN nilai tersebut
   WAJIB diganti dengan Tailwind utility class (`text-ink-600`, `bg-orange-50`, dll).

2. WHEN sebuah style dinamis memerlukan nilai yang dihitung secara runtime (misal
   `style={{ width: \`${percent}%\` }}`), THE SYSTEM SHALL mempertahankan inline
   style hanya untuk properti yang tidak memiliki utilitas Tailwind statik equivalen
   — ini adalah pengecualian yang sah dan tidak perlu diganti.

3. WHEN sebuah komponen menggunakan `style={{ fontFamily: "inherit" }}` atau properti
   font yang sebenarnya sudah diatur di global body, THE SYSTEM SHALL menghapus
   inline style tersebut.

4. WHERE `ActivityTimeline.tsx`, `CampaignsHeader.tsx`, `CreatorToolbar.tsx`,
   `CampaignSummaryCards.tsx`, dan `AnalitikClient.tsx` — semua `style={{}}` yang
   menggunakan warna statik hardcoded WAJIB dimigrasi ke class Tailwind.

5. IF sebuah komponen menggunakan `style={{ display: "flex", alignItems: "center" }}`
   atau properti layout CSS yang memiliki class Tailwind setara, THEN WAJIB diganti
   ke Tailwind utility (`flex items-center`).

---

### 2. Perbaikan Navigasi — Ganti `window.location.href` dengan `useRouter` / `<Link>`

**User Story:** As a developer, I want all in-app navigation to use Next.js routing
primitives so that route transitions are client-side (no full page reload), prefetching
works, and the app feels snappy on mobile.

#### Acceptance Criteria

1. WHEN sebuah komponen melakukan navigasi menggunakan `window.location.href`,
   THE SYSTEM SHALL mengganti dengan `useRouter().push()` (untuk navigasi
   programatik di event handler) atau `<Link href="...">` (untuk anchor statis).

2. WHERE `CampaignCard.tsx` (baris 70), `CreatorCard.tsx` (baris 80), dan
   `StartNegotiationModal.tsx` (baris 83) menggunakan `window.location.href`,
   SEMUA WAJIB diganti dengan `useRouter`.

3. IF sebuah Client Component belum mengimport `useRouter` dari `next/navigation`
   saat membutuhkan navigasi programatik, THEN import WAJIB ditambahkan.

4. WHERE navigasi adalah tombol aksi sederhana yang bisa dibungkus `<Link>` tanpa
   kehilangan fungsionalitas, THE SYSTEM SHALL menggunakan `<Link>` bukan `push()`.

---

### 3. Eliminasi Duplikasi Formatter Lokal — Gunakan `@/lib/formatters`

**User Story:** As a developer targeting mobile performance, I want all number/currency/date
formatting to use shared utilities from `src/lib/formatters.ts` so that formatting
behavior is consistent and changes only need to happen in one place.

#### Acceptance Criteria

1. WHEN sebuah komponen mendefinisikan fungsi formatter lokal seperti `formatViews()`,
   `formatBudget()`, atau serupa yang fungsionalitasnya sudah ada di
   `src/lib/formatters.ts`, THE SYSTEM SHALL menghapus duplikat lokal dan mengimport
   dari `@/lib/formatters`.

2. WHERE `CampaignCard.tsx` (umkm-dashboard) mendefinisikan `formatViews()` dan
   `formatBudget()` secara lokal, THESE FUNCTIONS SHALL dihapus dan diganti dengan
   `formatCompactNumber` dan `formatCompactCurrency` dari `@/lib/formatters`.

3. IF `src/lib/formatters.ts` tidak memiliki fungsi yang dibutuhkan (misal format
   views dalam satuan "jt"/"rb" Bahasa Indonesia), THEN fungsi baru yang generik
   WAJIB ditambahkan ke `formatters.ts`, bukan dibuat inline di komponen.

4. WHEN sebuah komponen di `UmkmOverviewClient.tsx` melakukan format angka secara
   inline (`(num / 1_000_000).toFixed(1) + "jt"`), THE SYSTEM SHALL menggunakan
   fungsi formatter dari `formatters.ts`.

---

### 4. Konsolidasi Konstanta — Hilangkan Data Duplikat Antar File

**User Story:** As a developer, I want category, niche, tone, and CTA options to be
defined in a single location so that adding or renaming a category is a one-file change.

#### Acceptance Criteria

1. WHEN array kategori/niche didefinisikan lebih dari satu kali di file yang berbeda
   (misal: `ProductInfoStep.tsx` mendefinisikan array lokal `categories[]` yang
   identik dengan `NICHE_OPTIONS` di `create-campaign.constants.ts`),
   THE SYSTEM SHALL menghapus duplikat lokal dan mengimport dari konstanta terpusat.

2. WHERE `ProductInfoStep.tsx` mendefinisikan `const categories = [...]` secara lokal,
   WAJIB diganti dengan import `NICHE_OPTIONS` dari `create-campaign.constants.ts`.

3. IF sebuah step wizard mendefinisikan options array lokal yang juga ada di
   `create-campaign.constants.ts`, THEN array lokal WAJIB dihapus.

---

### 5. Optimasi RSC/Client Split — Pindahkan Data Mapping ke Server

**User Story:** As a developer targeting mobile performance, I want as few Client
Components as possible and for data mapping to happen server-side so that JavaScript
bundle size is minimized and initial page load is fast.

#### Acceptance Criteria

1. WHEN `UmkmOverviewClient.tsx` memetakan `data.campaign` ke array Campaign lokal
   secara hardcoded di dalam Client Component, THE SYSTEM SHALL memindahkan fungsi
   `getMappedCampaigns()` ke `page.tsx` (Server Component) sebagai pure transformation.

2. IF sebuah Client Component mendeklarasikan `"use client"` hanya karena
   menggunakan `useRouter` untuk satu navigasi handler sederhana, THE SYSTEM SHALL
   evaluate apakah handler bisa dipindah ke komponen child yang lebih kecil sehingga
   parent bisa tetap menjadi Server Component.

3. WHERE page.tsx route mengimport Client Component secara langsung tanpa memanfaatkan
   Server Component untuk data prefetching, THE SYSTEM SHALL memastikan struktur
   Server Component → Client Component yang benar.

---

### 6. Konsistensi Komponen UI — Eliminasi Duplikat Custom Status Config

**User Story:** As a developer, I want a single, unified status badge component for
campaign status so that I don't have parallel implementations of the same visual element.

#### Acceptance Criteria

1. WHEN lebih dari satu komponen mendefinisikan konfigurasi `STATUS_CONFIG` lokal
   yang memetakan string status ke warna/label (seperti di `CampaignCard.tsx` dan
   `CampaignSection.tsx`), THE SYSTEM SHALL mengkonsolidasi atau menghapus duplikat
   dengan menggunakan `DashboardBadge` yang sudah ada.

2. WHERE `CampaignCard.tsx` mendefinisikan `STATUS_CONFIG` lokal, WAJIB dievaluasi
   apakah `DashboardBadge` dengan `type="status"` bisa menggantikannya sepenuhnya.

3. IF `DashboardBadge` tidak mendukung semua use-case styling, THEN props tambahan
   WAJIB ditambahkan ke `DashboardBadge` — BUKAN membuat komponen badge baru.

---

### 7. Kesiapan Service Layer untuk Appwrite Integration

**User Story:** As a developer, I want the Appwrite service layer to have consistent
error handling, correct TypeScript types, and clean `console.warn` stubs replaced
with proper `TODO` markers so that connecting real Appwrite queries is straightforward
without console pollution.

#### Acceptance Criteria

1. WHEN `umkm-appwrite.service.ts` berisi `console.warn(...)` di setiap stub,
   THE SYSTEM SHALL mengganti dengan komentar `// TODO: implement — query Appwrite
   collection "[NAMA]" with RBAC check for role UMKM` agar jelas action-item-nya.

2. WHERE setiap fungsi stub hanya return hardcoded `{ success: false, error: "Not
   implemented" }`, THE SYSTEM SHALL memastikan return type sudah merefleksikan
   `ServiceResult<T>` yang benar dan konsisten.

3. IF `DATA_SOURCE_CONFIG.useMockData` adalah `true` (default), THE SYSTEM SHALL
   memastikan bahwa semua path mock data masih berfungsi dengan baik tanpa perubahan.

4. WHEN `umkm-dashboard.types.ts` tidak memiliki field `category` dan `location`
   yang dibutuhkan oleh Campaign Wizard, THE SYSTEM SHALL menambahkan field tersebut
   ke interface `Campaign` agar types sudah selaras dengan skema Appwrite collection.

---

### 8. Aksesibilitas Dasar — Atribut Interaktif & Semantik HTML

**User Story:** As a UMKM user on mobile, I want interactive elements to be accessible
(proper labels and keyboard support) so that the app works well with assistive technologies.

#### Acceptance Criteria

1. WHEN sebuah `<button>` icon-only tidak memiliki `aria-label`, THE SYSTEM SHALL
   menambahkan `aria-label` deskriptif dalam Bahasa Indonesia.

2. WHERE tombol ✕ hapus pencarian di toolbar tidak memiliki `aria-label`,
   WAJIB ditambahkan (sudah ada di beberapa file, perlu audit menyeluruh).

3. IF sebuah elemen interaktif menggunakan `<div onClick>` tanpa `role="button"`,
   THE SYSTEM SHALL menggantinya dengan `<button>` yang semantik.

4. WHERE form wizard campaign menggunakan `<label>` yang tidak terhubung ke input
   melalui `htmlFor` / `id`, THE SYSTEM SHALL memastikan koneksi yang benar.

---

## Success Metrics

- `npm run lint` menghasilkan 0 errors dan 0 warnings setelah perbaikan selesai.
- `npm run build` berhasil dengan 0 TypeScript errors.
- Tidak ada `style={{ color: "#hex" }}` statik hardcoded di area UMKM untuk warna
  yang memiliki padanan token Tailwind.
- Tidak ada `window.location.href` yang tersisa di codebase UMKM.
- Tidak ada fungsi formatter duplikat lokal di komponen UMKM.
- Tidak ada array konstanta (kategori, niche, CTA) didefinisikan lebih dari satu
  kali di domain UMKM.
- Setiap fungsi stub di `umkm-appwrite.service.ts` memiliki komentar TODO yang
  spesifik menyebut nama collection Appwrite yang relevan.
- Semua tombol icon-only memiliki `aria-label`.

## Constraints

- **DILARANG** mengubah UI secara visual — perubahan harus transparan dari perspektif user.
- **DILARANG** mengubah logika bisnis, business rule Campaign Mode / Rate Card Mode.
- **DILARANG** menginstall library baru; gunakan yang sudah ada.
- **DILARANG** memindahkan file ke direktori yang berbeda dari struktur saat ini.
- Mobile-first mulai 375px, teks UI Bahasa Indonesia sederhana (tidak diubah).
- Setiap perubahan di service layer harus backward-compatible dengan mock data flow.

## Out of Scope

- Implementasi aktual query Appwrite (menggantikan stub dengan real queries).
- Migrasi visual UI / perubahan desain (dijadwalkan setelah integrasi Appwrite).
- Penambahan fitur baru.
- Integrasi Midtrans / payment gateway.
- Perubahan pada area Kreator dashboard (`/dashboard/kreator/`).
- Penambahan unit tests.
