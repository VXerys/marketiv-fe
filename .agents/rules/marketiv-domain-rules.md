---
trigger: always_on
description: Strict business domain rules for Marketiv's Dual-Ecosystem isolation, shared component placement, and Campaign/Rate Card mode restrictions
---

# 🚨 STRICT RULES — MARKETIV DOMAIN LOGIC & ECOSYSTEM ISOLATION 🚨

Dokumen ini mengatur **logika bisnis dan batas-batas domain** yang **WAJIB** dipatuhi oleh AI Agent saat menulis kode di proyek Marketiv. Pelanggaran terhadap aturan ini **akan merusak arsitektur inti** produk.

> **Konteks:** Marketiv adalah platform *marketplace hybrid* yang menjembatani **UMKM** dengan **Mikro-Kreator**. Kedua pengguna ini beroperasi di **dua ekosistem yang terisolasi secara ketat**.

---

## 1. DUAL-ECOSYSTEM ISOLATION — LARANGAN KERAS CROSS-IMPORT

Marketiv memiliki dua ruang pengguna yang **WAJIB TERISOLASI** pada level routing, komponen, state, dan logika bisnis:

| Ekosistem | Route | Target User | Karakteristik UI |
|---|---|---|---|
| 🏪 **UMKM** | `src/app/dashboard/umkm/*` | Pemilik usaha mikro daerah | Super simpel, minimal interaksi, fokus efisiensi |
| 🎨 **Kreator** | `src/app/dashboard/kreator/*` | Mikro-Kreator konten | Lebih interaktif, dashboard portofolio & penghasilan |

### 🚫 LARANGAN MUTLAK: Cross-Import Antar Ekosistem

```
src/app/dashboard/umkm/**     ←✕→     src/app/dashboard/kreator/**
```

- Komponen, hooks, state, atau logika bisnis di `src/app/dashboard/umkm/` **DILARANG KERAS** di-import atau digunakan oleh komponen di `src/app/dashboard/kreator/`, dan **SEBALIKNYA**.
- Server Actions spesifik UMKM **TIDAK BOLEH** dipanggil dari halaman Kreator, dan sebaliknya.
- Zustand store yang dibuat untuk UI UMKM **TIDAK BOLEH** diakses dari halaman Kreator, dan sebaliknya.

### ❌ Contoh Pelanggaran

```tsx
// src/app/dashboard/kreator/page.tsx
// ❌ DILARANG — mengimport komponen dari domain UMKM
import { UmkmOrderForm } from "@/app/dashboard/umkm/components/UmkmOrderForm";
import { useUmkmStore } from "@/app/dashboard/umkm/stores/umkmStore";

export default function CreatorDashboard() {
  // ❌ Menggunakan state UMKM di halaman Kreator
  const umkmData = useUmkmStore();
  return <UmkmOrderForm />;
}
```

### ✅ Yang Benar

Jika kedua ekosistem membutuhkan fungsionalitas serupa, buat komponen **baru** yang terpisah di masing-masing domain, atau gunakan komponen bersama dari `src/components/` (lihat Bagian 2).

---

## 2. SHARED COMPONENTS — ATURAN PENEMPATAN

Komponen yang **boleh digunakan bersama** oleh kedua ekosistem **WAJIB** diletakkan di lokasi-lokasi berikut:

| Lokasi | Tujuan | Contoh |
|---|---|---|
| `src/components/ui/` | Komponen dasar yang **100% presentasional** dan reusable | `Button`, `Input`, `Card`, `Badge`, `Avatar` |
| `src/components/layouts/` | Komponen tata letak struktural | `Navbar`, `Footer`, `Sidebar` |
| `src/components/features/<nama>/` | Komponen fitur spesifik yang bisa di-share | `CampaignCard`, `CreatorProfileCard` |
| `src/lib/` | Utility functions & helpers | `cn()`, `formatCurrency()`, `formatDate()` |
| `src/types/` | Interface & type definitions | `Campaign`, `Creator`, `User` |
| `src/data/` | Konstanta konten & mock data | `NAVBAR_CONTENT`, `CARD_CONTENT` |

### 🚫 Yang DILARANG

- **JANGAN** membuat komponen bersama langsung di dalam `src/app/dashboard/umkm/` atau `src/app/dashboard/kreator/` lalu mengimportnya dari domain lain.
- **JANGAN** membuat file utility di dalam route-specific folder (`src/app/dashboard/umkm/utils/`) jika utility tersebut juga dibutuhkan di sisi Kreator — pindahkan ke `src/lib/`.
- **JANGAN** meletakkan shared types di dalam salah satu domain — selalu taruh di `src/types/`.

### ✅ Contoh Alur yang Benar

```tsx
// src/components/ui/StatusBadge.tsx — SHARED, bisa dipakai di mana saja
interface StatusBadgeProps {
  status: "active" | "pending" | "completed";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // ✅ Komponen presentasional murni, aman di-share
  return <span className={/* ... */}>{status}</span>;
}
```

```tsx
// src/app/dashboard/umkm/page.tsx — ✅ Import dari shared location
import { StatusBadge } from "@/components/ui/StatusBadge";
```

```tsx
// src/app/dashboard/kreator/page.tsx — ✅ Import dari shared location yang SAMA
import { StatusBadge } from "@/components/ui/StatusBadge";
```

---

## 3. CAMPAIGN MODE — ATURAN LOGIKA BISNIS

Campaign Mode adalah model pemasaran **pay-per-view** di mana Kreator mem-posting konten di akun sosial media **MEREKA SENDIRI**.

### Flow Bisnis Campaign Mode

```
UMKM buat brief & upload raw video
  → Kreator klaim job
    → Kreator edit video
      → KREATOR POSTING DI AKUN SOSMED KREATOR (bukan UMKM!)
        → Sistem hitung views → Pembayaran berbasis performa
```

### 🚫 RESTRICTION MUTLAK — Campaign Mode

| # | Larangan | Alasan |
|---|---|---|
| 1 | **DILARANG** membuat tombol "Download Video" untuk UMKM | Video **WAJIB** di-posting oleh Kreator di akun sosmed Kreator. UMKM **TIDAK** mem-posting sendiri |
| 2 | **DILARANG** membuat fitur Chat/Komunikasi | Mengeliminasi drama revisi dan mempercepat proses. Komunikasi **HANYA** via brief yang sudah ditentukan |
| 3 | **DILARANG** membuat fitur "Kirim Video ke UMKM" | Konten tidak pernah dikirim ke UMKM — Kreator langsung posting di platform sosmed-nya |
| 4 | **DILARANG** membuat fitur revisi/approval UMKM | Tidak ada loop revisi — Kreator klaim, edit, posting. Titik |

### ❌ Contoh Fitur yang DILARANG Dibuat

```tsx
// ❌ DILARANG — Tombol download video untuk UMKM di Campaign Mode
<Button onClick={downloadVideo}>Download Video Kreator</Button>

// ❌ DILARANG — Chat antara UMKM dan Kreator di Campaign Mode
<ChatRoom campaignId={id} umkmId={umkmId} creatorId={creatorId} />

// ❌ DILARANG — Approval/review loop
<Button onClick={requestRevision}>Minta Revisi</Button>
<Button onClick={approveContent}>Setujui Konten</Button>
```

### ✅ Yang BOLEH Dibuat di Campaign Mode

```tsx
// ✅ UMKM: Form pembuatan brief + upload raw asset
<CampaignBriefForm onSubmit={createCampaign} />

// ✅ UMKM: Dashboard metrik performa campaign (views, cost)
<CampaignMetrics campaignId={id} />

// ✅ Kreator: Daftar campaign yang bisa diklaim
<AvailableCampaignList />

// ✅ Kreator: Tombol klaim job
<Button onClick={claimCampaign}>Klaim Campaign</Button>

// ✅ Kreator: Interface untuk upload bukti posting (link sosmed)
<SubmitPostingProof campaignId={id} />
```

---

## 4. RATE CARD MODE — ATURAN LOGIKA BISNIS

Rate Card Mode adalah model kolaborasi premium **harga tetap** (*fixed price*) dengan komunikasi langsung.

### Flow Bisnis Rate Card Mode

```
UMKM browse katalog Kreator
  → UMKM inisiasi Chat
    → Negosiasi harga & deliverables
      → Deal via sistem Escrow
        → Kreator eksekusi konten
          → WAJIB gunakan "Collab Post" (IG/TikTok)
```

### ✅ REQUIREMENT WAJIB — Rate Card Mode

| # | Keharusan | Alasan |
|---|---|---|
| 1 | **WAJIB** ada fitur Chat Negosiasi | Komunikasi diperlukan untuk negosiasi harga dan deliverables |
| 2 | **WAJIB** ada sistem Escrow | Melindungi kedua belah pihak dari penipuan |
| 3 | **WAJIB** enforce "Collab Post" | UMKM harus mendapat *direct traffic* dari audiens Kreator |

---

## 5. DECISION TABLE — REFERENSI CEPAT

| Pertanyaan | Jawaban |
|---|---|
| Bolehkah import komponen UMKM dari halaman Kreator? | 🚫 **TIDAK — DILARANG KERAS** |
| Bolehkah import komponen Kreator dari halaman UMKM? | 🚫 **TIDAK — DILARANG KERAS** |
| Di mana meletakkan komponen yang dipakai bersama? | ✅ `src/components/ui/` atau `src/components/layouts/` |
| Bolehkah buat tombol Download Video di Campaign Mode? | 🚫 **TIDAK — Kreator yang posting** |
| Bolehkah buat fitur Chat di Campaign Mode? | 🚫 **TIDAK — Tidak ada komunikasi** |
| Bolehkah buat fitur Chat di Rate Card Mode? | ✅ **YA — WAJIB ada Chat Negosiasi** |
| Di mana meletakkan shared types? | ✅ `src/types/` |
| Di mana meletakkan shared utilities? | ✅ `src/lib/` |
