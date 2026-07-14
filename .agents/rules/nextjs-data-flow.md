---
trigger: always_on
description: Strict rules for React Server Components, "use client" directive, and data flow patterns in the Marketiv Next.js project
---

# 🚨 STRICT RULES — NEXT.JS DATA FLOW & COMPONENT BOUNDARIES 🚨

Aturan ini mengatur **bagaimana AI Agent harus menulis komponen React dan mengelola aliran data** di proyek Marketiv. Aturan ini bersifat **MUTLAK** dan tidak boleh dilanggar dalam kondisi apa pun.

> **Konteks Arsitektur:** Marketiv menggunakan **Next.js 16 (App Router)** dengan **React 19**. App Router secara default menjadikan semua komponen sebagai **React Server Components (RSC)**. Pahami perbedaan ini sebelum menulis kode apa pun.

---

## 1. DEFAULT: SEMUA KOMPONEN ADALAH SERVER COMPONENTS

- **Setiap file `.tsx` di dalam `src/` adalah Server Component secara default.** Jangan menambahkan `"use client"` kecuali ada alasan eksplisit yang tercantum di Bagian 2.
- Server Components memiliki keunggulan:
  - **Zero client-side JavaScript** — tidak menambah bundle size
  - **Direct data access** — bisa langsung `await` fetch data dari database/API
  - **SEO-friendly** — HTML di-render di server, langsung dikirim ke browser
  - **Streaming & Suspense** — mendukung progressive rendering

### Contoh Server Component yang Benar

```tsx
// src/components/features/dashboard/CampaignStats.tsx
// ✅ BENAR: Tidak ada "use client", ini adalah Server Component

import { getCampaignStats } from "@/lib/actions/campaign";

interface CampaignStatsProps {
  campaignId: string;
}

export async function CampaignStats({ campaignId }: CampaignStatsProps) {
  const stats = await getCampaignStats(campaignId);

  return (
    <div className="rounded-2xl bg-surface p-6">
      <h3 className="text-heading-3 text-text-primary">{stats.title}</h3>
      <p className="text-body-base text-text-muted">{stats.totalViews} views</p>
    </div>
  );
}
```

### ❌ Kesalahan yang DILARANG

```tsx
// ❌ SALAH: Menambahkan "use client" tanpa alasan
"use client";

export function CampaignStats({ stats }: CampaignStatsProps) {
  // Komponen ini tidak pakai hooks, onClick, atau state apa pun
  // TIDAK PERLU "use client"
  return <div>{stats.title}</div>;
}
```

---

## 2. KAPAN BOLEH MENGGUNAKAN `"use client"`

Directive `"use client"` **HANYA** boleh ditambahkan jika komponen memenuhi **minimal satu** dari kondisi berikut:

| # | Kondisi | Contoh |
|---|---|---|
| 1 | Menggunakan **React hooks** (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, `useReducer`) | Form input dengan state, dropdown toggle |
| 2 | Menggunakan **event handlers** (`onClick`, `onChange`, `onSubmit`, `onKeyDown`, dll.) | Button click, form submission |
| 3 | Menggunakan **Zustand store** (client-side UI state) | `useStore()`, `useMobileMenuStore()` |
| 4 | Menggunakan **Browser APIs** (`window`, `document`, `localStorage`, `navigator`, `IntersectionObserver`) | Scroll detection, responsive breakpoint detection |
| 5 | Menggunakan **third-party client libraries** yang membutuhkan DOM access | Animation libraries, chart libraries yang butuh canvas |
| 6 | Komponen membutuhkan **interaktivitas real-time** | Live search input, auto-complete, drag-and-drop |

### ✅ Contoh Penggunaan `"use client"` yang Benar

```tsx
// src/components/layouts/Navbar.tsx
// ✅ BENAR: Menggunakan useState untuk mobile menu toggle
"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // ...
}
```

### 🚫 Kondisi yang BUKAN Alasan untuk `"use client"`

- Komponen menerima props → **BUKAN alasan** (Server Components juga menerima props)
- Komponen menggunakan `cn()` → **BUKAN alasan** (ini utility function biasa)
- Komponen menggunakan `next/image` atau `next/link` → **BUKAN alasan** (keduanya kompatibel dengan RSC)
- Komponen menampilkan data statis dari `src/data/` → **BUKAN alasan**
- Komponen menggunakan `async/await` → **BUKAN alasan** (justru ini keunggulan RSC)

---

## 3. LARANGAN KERAS: DATA FETCHING DI CLIENT COMPONENT

### 🚫 DILARANG: Fetch Data Langsung di Client Component

Client Component **TIDAK BOLEH** melakukan data fetching langsung ke database, Appwrite, atau API eksternal. Ini melanggar prinsip keamanan dan arsitektur Next.js App Router.

```tsx
// ❌ DILARANG KERAS
"use client";

import { databases } from "@/lib/appwrite";

export function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    // ❌ JANGAN PERNAH fetch data langsung dari Client Component
    const fetchData = async () => {
      const { documents } = await databases.listDocuments(databaseId, collectionId);
      setCampaigns(documents);
    };
    fetchData();
  }, []);

  return <div>{/* ... */}</div>;
}
```

### ✅ Yang HARUS Dilakukan: Gunakan Pola Berikut

#### Pola A: Server Component (Data Fetching Langsung) — **DIUTAMAKAN**

```tsx
// src/app/dashboard/umkm/page.tsx
// ✅ BENAR: Server Component langsung fetch data
import { getCampaigns } from "@/lib/actions/campaign";
import { CampaignGrid } from "@/components/features/dashboard/CampaignGrid";

export default async function UmkmDashboardPage() {
  const campaigns = await getCampaigns();

  return <CampaignGrid campaigns={campaigns} />;
}
```

#### Pola B: Server Actions (Untuk Mutasi Data) — **WAJIB untuk Create/Update/Delete**

```tsx
// src/lib/actions/campaign.ts
"use server";

export async function createCampaign(formData: FormData) {
  // Validasi & sanitasi data di server
  const title = formData.get("title") as string;
  // Insert ke database via Appwrite
  // Revalidate cache jika perlu
}

export async function getCampaigns() {
  // Query database langsung di server
  // Return data yang sudah di-serialize
}
```

#### Pola C: Komposisi Server + Client (Untuk UI Interaktif yang Butuh Data)

```tsx
// src/app/dashboard/umkm/page.tsx (Server Component — parent)
import { getCampaigns } from "@/lib/actions/campaign";
import { CampaignFilter } from "@/components/features/dashboard/CampaignFilter";

export default async function UmkmDashboardPage() {
  const campaigns = await getCampaigns(); // ✅ Fetch di Server

  return <CampaignFilter campaigns={campaigns} />; // ✅ Pass sebagai props
}

// src/components/features/dashboard/CampaignFilter.tsx (Client Component — child)
"use client";

import { useState } from "react";

interface CampaignFilterProps {
  campaigns: Campaign[]; // ✅ Data diterima via props, BUKAN di-fetch sendiri
}

export function CampaignFilter({ campaigns }: CampaignFilterProps) {
  const [filter, setFilter] = useState("all");

  const filtered = campaigns.filter(/* ... */);

  return (/* UI interaktif dengan filter */);
}
```

---

## 4. ATURAN ZUSTAND (CLIENT-SIDE UI STATE ONLY)

Zustand di Marketiv **HANYA** digunakan untuk menyimpan **UI state yang bersifat client-side**. Zustand **BUKAN** pengganti server-side data fetching.

### ✅ Boleh Disimpan di Zustand

- State toggle UI (sidebar open/close, mobile menu, modal visibility)
- State filter/sort yang **tidak memerlukan re-fetch data dari server**
- Theme preference (dark/light mode)
- Temporary form draft sebelum submit

### 🚫 DILARANG Disimpan di Zustand

- Data dari database (campaigns, creators, users)
- Authentication state (gunakan server-side session)
- Data yang harus di-share antar page routes

---

## 5. BOUNDARY RULES — DUAL-ECOSYSTEM ISOLATION

Aturan data flow ini harus **mematuhi pemisahan Dual-Ecosystem** Marketiv:

- **Data `/dashboard/umkm/*`** tidak boleh di-fetch atau di-share oleh komponen di `/dashboard/kreator/*`, dan sebaliknya
- Server Actions untuk UMKM harus diletakkan terpisah dari Server Actions untuk Kreator jika domain logic-nya berbeda
- Shared utilities (seperti `cn()`, formatter) tetap boleh dipakai bersama dari `src/lib/`

---

## 6. DECISION FLOWCHART (REFERENSI CEPAT)

Gunakan alur berikut **setiap kali** akan membuat komponen baru:

```
Apakah komponen ini butuh hooks, event handlers, atau Browser API?
│
├── TIDAK → ✅ Buat sebagai Server Component (tanpa "use client")
│           → Boleh langsung async/await fetch data
│
└── YA → Apakah komponen ini juga butuh data dari database?
         │
         ├── YA → ✅ Gunakan POLA C (Komposisi):
         │         1. Parent = Server Component (fetch data)
         │         2. Child = Client Component (terima data via props)
         │
         └── TIDAK → ✅ Buat sebagai Client Component ("use client")
                     → Data statis boleh diimpor dari src/data/
                     → Untuk mutasi, gunakan Server Actions
```

---

## 7. RINGKASAN ATURAN

| Aturan | Status |
|---|---|
| Default semua komponen adalah Server Components | ✅ **WAJIB** |
| `"use client"` hanya jika ada hooks/events/browser API | ✅ **WAJIB** |
| Data fetching langsung di Client Component | 🚫 **DILARANG** |
| Gunakan Server Actions untuk mutasi (create/update/delete) | ✅ **WAJIB** |
| Zustand hanya untuk client-side UI state | ✅ **WAJIB** |
| Dual-Ecosystem isolation tetap berlaku di level data flow | ✅ **WAJIB** |
| Komposisi Server + Client untuk UI interaktif + data | ✅ **POLA UTAMA** |