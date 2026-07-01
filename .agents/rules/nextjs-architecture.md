---
trigger: manual
description: Strict architectural rules for Next.js 16 App Router — Server Components, "use client" boundaries, Server Actions, and component composition patterns
---

# 🚨 STRICT INSTRUCTIONS — NEXT.JS 16 APP ROUTER ARCHITECTURE 🚨

Dokumen ini mengatur **standar arsitektur** yang **WAJIB** dipatuhi oleh AI Agent saat menulis kode di proyek Marketiv. Aturan ini tidak boleh dilanggar dalam kondisi apa pun.

> **Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4.
> **Referensi Domain:** Lihat `marketiv-context.md` untuk konteks bisnis Dual-Ecosystem (UMKM vs Kreator).

---

## 1. DEFAULT TO SERVER COMPONENTS (RSC)

**Semua komponen di dalam direktori `app/` dan `components/` adalah React Server Components secara default.** Ini adalah perilaku bawaan Next.js App Router dan merupakan fondasi arsitektur proyek ini.

### Aturan Mutlak

- **JANGAN PERNAH** menambahkan `"use client"` kecuali komponen tersebut **benar-benar membutuhkannya** (lihat Bagian 2).
- Jika komponen hanya menerima props dan me-render JSX statis, itu adalah **Server Component** — titik.
- Server Components **boleh** bersifat `async` dan langsung melakukan `await` untuk data fetching.

### Keunggulan RSC yang Harus Dimanfaatkan

| Keunggulan | Penjelasan |
|---|---|
| **Zero Bundle Size** | Kode Server Component tidak dikirim ke browser — tidak menambah JavaScript bundle |
| **Direct Data Access** | Bisa langsung query database/API tanpa membuat API endpoint terpisah |
| **SEO Optimal** | HTML di-render di server, mesin pencari langsung mendapat konten lengkap |
| **Streaming** | Mendukung progressive rendering via `<Suspense>` untuk UX yang lebih cepat |

### ❌ Anti-Pattern: Menandai Semua Komponen Sebagai Client

```tsx
// ❌ DILARANG — Menjadikan komponen presentasional sebagai Client Component
"use client";

interface StatCardProps {
  title: string;
  value: number;
}

// Komponen ini TIDAK menggunakan hooks, events, atau Browser API
// HAPUS "use client" di atas!
export function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-surface p-6">
      <h3 className="text-heading-3">{title}</h3>
      <p className="text-body-base text-text-muted">{value}</p>
    </div>
  );
}
```

```tsx
// ✅ BENAR — Tanpa "use client", ini Server Component yang ringan
interface StatCardProps {
  title: string;
  value: number;
}

export function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-surface p-6">
      <h3 className="text-heading-3">{title}</h3>
      <p className="text-body-base text-text-muted">{value}</p>
    </div>
  );
}
```

---

## 2. KAPAN MENGGUNAKAN `"use client"` — LEAF COMPONENTS ONLY

Directive `"use client"` menandai **batas (boundary)** antara dunia server dan dunia client. Gunakan **hanya** pada komponen **terkecil** (*leaf components*) yang benar-benar membutuhkannya.

### Kondisi yang MEMBOLEHKAN `"use client"`

| # | Kondisi | Contoh Komponen |
|---|---|---|
| 1 | Menggunakan **React Hooks** (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`) | Form input, dropdown toggle, modal |
| 2 | Menggunakan **Event Handlers** (`onClick`, `onChange`, `onSubmit`, `onKeyDown`) | Button interaktif, form submission |
| 3 | Menggunakan **Zustand Store** untuk UI state | `useMobileMenuStore()`, `useThemeStore()` |
| 4 | Menggunakan **Browser APIs** (`window`, `document`, `localStorage`, `IntersectionObserver`) | Scroll detection, theme persistence |

### Kondisi yang BUKAN Alasan untuk `"use client"`

- ❌ Komponen menerima props → Server Components juga menerima props
- ❌ Komponen menggunakan `cn()` → Ini utility function biasa, bukan hook
- ❌ Komponen menggunakan `next/image` atau `next/link` → Kompatibel dengan RSC
- ❌ Komponen mengimport data dari `src/data/` → Import statis, bukan interaksi browser
- ❌ Komponen menggunakan `async/await` → Justru ini keunggulan RSC

### Prinsip: Push `"use client"` Sejauh Mungkin ke Bawah

```
Page (Server) ──── Layout (Server) ──── Container (Server)
                                           │
                                           ├── StatCard (Server) ✅
                                           ├── InfoPanel (Server) ✅
                                           └── FilterDropdown (Client) ← "use client" hanya di sini
```

Jangan pernah menandai komponen **parent/container** sebagai Client Component hanya karena **satu child** membutuhkan interaktivitas. Pisahkan bagian interaktif ke komponen tersendiri.

---

## 3. DATA MUTATION — WAJIB SERVER ACTIONS

### 🚫 LARANGAN KERAS

**Dilarang keras** melakukan pemanggilan API (`fetch`, `axios`, `supabase client`) langsung di dalam Client Component untuk operasi **Create, Update, atau Delete**.

```tsx
// ❌ DILARANG KERAS — fetch langsung di Client Component
"use client";

export function CreateCampaignForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ❌ JANGAN lakukan ini!
    await fetch("/api/campaigns", { method: "POST", body: formData });
  };
}
```

### ✅ POLA YANG BENAR: Server Actions

Semua mutasi data **WAJIB** menggunakan **Next.js Server Actions** yang diletakkan di file terpisah dengan directive `"use server"`.

**Lokasi file:** `src/lib/actions/<domain>.ts`

```tsx
// src/lib/actions/campaign.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createCampaign(formData: FormData) {
  const title = formData.get("title") as string;
  const budget = Number(formData.get("budget"));

  // ✅ Validasi & sanitasi di server
  if (!title || budget <= 0) throw new Error("Invalid input");

  // ✅ Insert ke database via Appwrite (server-side only)
  // await databases.createDocument(databaseId, collectionId, ID.unique(), { title, budget });

  // ✅ Revalidate halaman terkait
  revalidatePath("/dashboard/umkm");
}
```

```tsx
// src/components/features/dashboard/CreateCampaignForm.tsx
"use client";

import { createCampaign } from "@/lib/actions/campaign";

export function CreateCampaignForm() {
  return (
    // ✅ Server Action dipanggil via form action
    <form action={createCampaign}>
      <input name="title" placeholder="Nama Campaign" required />
      <input name="budget" type="number" placeholder="Budget" required />
      <button type="submit">Buat Campaign</button>
    </form>
  );
}
```

### Konvensi Penamaan Server Actions

| Operasi | Prefix | Contoh |
|---|---|---|
| Create | `create` | `createCampaign`, `createOrder` |
| Read | `get` / `fetch` | `getCampaigns`, `fetchCreatorById` |
| Update | `update` | `updateCampaignStatus` |
| Delete | `delete` / `remove` | `deleteCampaign`, `removeCreator` |

---

## 4. SERVER VS CLIENT BOUNDARY — POLA KOMPOSISI

### Masalah Umum

Sering kali sebuah halaman membutuhkan **data dari server** DAN **interaktivitas di client** secara bersamaan. Jangan pernah "menaikkan" `"use client"` ke komponen parent hanya untuk menggabungkan keduanya.

### ✅ POLA UTAMA: Komposisi via Props

**Server Component** fetch data → kirim ke **Client Component** via props.

```tsx
// src/app/dashboard/umkm/page.tsx (SERVER — fetch data)
import { getCampaigns } from "@/lib/actions/campaign";
import { CampaignFilter } from "@/components/features/dashboard/CampaignFilter";

export default async function UmkmPage() {
  const campaigns = await getCampaigns();

  // ✅ Data di-fetch di server, dikirim ke client via props
  return <CampaignFilter campaigns={campaigns} />;
}
```

```tsx
// src/components/features/dashboard/CampaignFilter.tsx (CLIENT — interaktif)
"use client";

import { useState } from "react";
import type { Campaign } from "@/types/campaign";

interface CampaignFilterProps {
  campaigns: Campaign[];
}

export function CampaignFilter({ campaigns }: CampaignFilterProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = campaigns.filter(
    (c) => activeCategory === "all" || c.category === activeCategory
  );

  return (/* UI filter interaktif */);
}
```

### ✅ POLA LANJUTAN: Children Pattern

Kirim **Server Component** sebagai `children` prop ke dalam **Client Component** agar konten statis tetap di-render di server.

```tsx
// src/components/layouts/Sidebar.tsx (CLIENT — interaktif toggle)
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode; // ← Server Components dikirim di sini
}

export function Sidebar({ children }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={cn("transition-all", isOpen ? "w-64" : "w-16")}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {/* ✅ children tetap di-render sebagai Server Component */}
      {isOpen && children}
    </aside>
  );
}
```

```tsx
// src/app/dashboard/umkm/layout.tsx (SERVER — komposisi)
import { Sidebar } from "@/components/layouts/Sidebar";
import { SidebarNav } from "@/components/layouts/SidebarNav"; // Server Component

export default function UmkmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar>
        {/* ✅ SidebarNav adalah Server Component, di-render di server */}
        <SidebarNav />
      </Sidebar>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### ❌ Anti-Pattern: Menaikkan "use client" ke Parent

```tsx
// ❌ SALAH — Menjadikan layout sebagai Client Component
"use client"; // ← INI SALAH! Seluruh tree di bawahnya menjadi client

export default function UmkmLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex">
      <aside>
        <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
        <SidebarNav /> {/* Ini sekarang jadi Client Component juga! */}
      </aside>
      <main>{children}</main> {/* Semua page di bawahnya juga client! */}
    </div>
  );
}
```

---

## 5. RINGKASAN DECISION TABLE

Gunakan tabel ini **setiap kali** membuat komponen baru:

| Pertanyaan | Jawaban | Aksi |
|---|---|---|
| Butuh hooks/events/browser API? | **Tidak** | → Server Component (tanpa `"use client"`) |
| Butuh hooks/events/browser API? | **Ya** | → Client Component (`"use client"`) di leaf terkecil |
| Butuh data dari DB + interaktivitas? | **Ya** | → Komposisi: Parent RSC fetch data → Child CC via props |
| Butuh layout interaktif + konten statis? | **Ya** | → Children Pattern: CC wrapper, RSC sebagai `children` |
| Butuh mutasi data (CUD)? | **Ya** | → Server Actions di `src/lib/actions/` |
| Butuh API call dari client? | **STOP** | → 🚫 DILARANG — gunakan Server Actions |
