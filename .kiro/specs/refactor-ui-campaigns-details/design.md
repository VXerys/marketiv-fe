# Design — Refactor UI Campaigns Summary & Campaign Detail Layout

## Overview

Desain ini merancang ulang tata letak grid untuk summary cards pada daftar campaign dan menyusun ulang struktur layout halaman detail campaign agar menggunakan layout bertumpuk (stacked) yang leluasa (full-width) dikombinasikan dengan grid 2 kolom di bagian bawah. Hal ini memecahkan masalah ruang kosong asimetris dan memastikan seluruh komponen mematuhi radius dan warna **Marketiv Studio System v5.8**.

---

## Page Layout Architecture

```mermaid
graph TD
    subgraph Daftar Campaign [/dashboard/umkm/campaign]
        A[UmkmPageWrapper] --> B[CampaignSummaryCards - grid-cols-3]
        A --> C[CampaignToolbar]
        A --> D[CampaignList / Table]
    end

    subgraph Detail Campaign [/dashboard/umkm/campaign/id]
        E[UmkmPageWrapper] --> F[CampaignDetailHeader]
        E --> G[CampaignOverviewCards]
        E --> H[CampaignWorkspaceCard - full-width]
        E --> I[CampaignSubmissionSection - full-width]
        E --> J[Secondary Grid - grid-cols-2]
        J --> K[Left: Budget & Quick Actions]
        J --> L[Right: Checklist & Timeline]
    end
```

---

## Components and Interfaces

### 1. `CampaignSummaryCards` (`src/components/features/umkm-dashboard/campaign/CampaignSummaryCards.tsx`)
- **Tanggung jawab**: Menampilkan metrik ringkasan.
- **Perubahan Desain**:
  - Grid container diubah dari `grid-cols-2 md:grid-cols-3 xl:grid-cols-6` menjadi `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5`.
  - Hal ini menghasilkan layout 3-3 (3 kolom di baris atas, 3 kolom di baris bawah) pada layar laptop/desktop, sehingga card memiliki lebar yang ideal (~400px) untuk menampilkan data angka dan teks tanpa wrapping.

### 2. `CampaignListSkeleton` (`src/components/features/umkm-dashboard/campaign/CampaignListSkeleton.tsx`)
- **Tanggung jawab**: Skeleton loading.
- **Perubahan Desain**:
  - `CampaignSummaryCardsSkeleton` diubah menggunakan grid class `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` agar sinkron dengan layout baru.

### 3. `CampaignDetailPage` (`src/components/features/umkm-dashboard/campaign/detail/CampaignDetailPage.tsx`)
- **Tanggung jawab**: Main detail container.
- **Perubahan Desain**:
  - Bungkus konten halaman menggunakan `<UmkmPageWrapper maxWidth={1440}>` menggantikan div `flex-1 p-4 sm:p-6 lg:p-8 pb-32...` kustom. Ini menstandarkan vertical gap (26px), horizontal padding, dan centering otomatis.
  - Hilangkan layout 2 kolom asimetris (`lg:grid-cols-12` dengan col-span-8 dan col-span-4).
  - Tumpuk `CampaignWorkspaceCard` dan `CampaignSubmissionSection` secara vertikal dengan lebar penuh (`w-full`).
  - Bungkus komponen pendukung (Budget, Quick Actions, Checklist, Timeline) di dalam grid 2 kolom di bagian bawah:
    ```tsx
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <CampaignBudgetCard campaign={campaign} />
        <CampaignQuickActionsCard ... />
      </div>
      <div className="space-y-6">
        <CampaignHealthChecklistCard ... />
        <CampaignActivityTimeline campaign={campaign} />
      </div>
    </div>
    ```

### 4. `CampaignDetailHeader` & `CampaignOverviewCards`
- **Tanggung jawab**: Merender header dan kartu ringkasan metrik detail.
- **Perubahan Desain**:
  - Hapus margin-bottom `mb-8` dari kedua file agar layout bersandar sepenuhnya pada vertical grid gap default (`gap: 26px`) dari `UmkmPageWrapper`.

### 5. `CampaignSubmissionSection` (`src/components/features/umkm-dashboard/campaign/detail/CampaignSubmissionSection.tsx`)
- **Tanggung jawab**: Mengelola tabel bukti tayang dan panduan validasi.
- **Perubahan Desain**:
  - Ubah tab filter buttons dari `rounded-full` menjadi `rounded-xl` (12px).
  - Ubah `DashboardBadge` di dalam tombol tab agar menggunakan border-radius rectangular `rounded-md` atau `rounded-lg` (tidak bulat penuh).
  - Ubah box panduan validasi di bagian bawah (`Tautan Publik`, `Kesesuaian Data`, `Audit Anti-Fraud`) agar border radius-nya `rounded-xl` (12px) dengan border netral soft.

---

## Design Tokens (Marketiv Studio System v5.8)

Komponen-komponen detail akan disesuaikan dengan token berikut:
- **Radius**: Semua buttons, tabs, input fields, dan nested cards di-refactor menggunakan kelas Tailwind `rounded-xl` (12px) atau `rounded-2xl` (18px) untuk card luar/wrapper.
- **Warna**: Latar belakang panel tetap menggunakan `bg-white` dengan border `border-neutral-200/80` dan background body utama diatur oleh Chrome dashboard (`#F7F3EE`).

---

## Testing Strategy

- **Bento Grid Layout Check**: Memastikan tidak ada ruang kosong tersisa pada resolusi desktop lebar (1440px) dan tinggi kolom kiri dan kanan di grid bawah seimbang.
- **Responsive Layout Verification**: Memverifikasi grid 2 kolom di bawah bertransisi menjadi 1 kolom secara mulus di tablet (< 1024px) dan mobile (< 768px).
