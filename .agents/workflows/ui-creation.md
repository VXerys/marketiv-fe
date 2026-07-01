---
description: Step-by-step SOP workflow for creating new UI features or pages
---

# 📋 SOP — WORKFLOW PEMBUATAN UI BARU (FITUR / HALAMAN)

Dokumen ini adalah **Standard Operating Procedure (SOP)** yang **WAJIB** diikuti oleh AI Agent setiap kali user meminta pembuatan fitur UI atau halaman baru. Ikuti setiap step secara **berurutan** — jangan lompati langkah apa pun.

> **⚠️ ATURAN UTAMA:** Agent **DILARANG** menulis lebih dari **150 baris kode sekaligus** tanpa meminta konfirmasi dari user terlebih dahulu. Jika implementasi membutuhkan lebih dari 150 baris, pecah menjadi beberapa tahap dan tanyakan persetujuan user di setiap tahap.

---

## Step 1: ANALISIS KEBUTUHAN & STRUKTUR KOMPONEN

**Tujuan:** Pahami apa yang diminta user dan tentukan arsitektur komponen sebelum menulis satu baris kode pun.

### Yang Harus Dilakukan

1. **Baca & Pahami Permintaan User**
   - Apa fitur/halaman yang diminta?
   - Apakah ini untuk domain **UMKM** (`/dashboard/umkm/`) atau **Kreator** (`/dashboard/kreator/`)?
   - Apakah ada referensi visual (Figma, screenshot, mockup)?

2. **Identifikasi Komponen yang Dibutuhkan**
   - Komponen apa saja yang perlu dibuat?
   - Apakah ada komponen yang **sudah ada** di `src/components/` yang bisa di-reuse?
   - Apakah komponen ini perlu `"use client"` atau cukup sebagai Server Component?

3. **Identifikasi Data & State**
   - Apakah fitur ini membutuhkan data dari database/API?
   - Apakah ada state UI yang perlu dikelola (filter, toggle, modal)?
   - Apakah perlu membuat Server Actions baru?

4. **Tentukan Lokasi File**
   - Halaman → `src/app/dashboard/<domain>/`
   - Komponen fitur → `src/components/features/<nama-fitur>/`
   - Komponen UI reusable → `src/components/ui/`
   - Komponen layout → `src/components/layouts/`
   - Types → `src/types/`
   - Content/data → `src/data/`
   - Server Actions → `src/lib/actions/`

### Output Step 1

Buat **ringkasan analisis** dalam format berikut dan sampaikan ke user:

```
📊 Analisis Kebutuhan:
- Fitur: [nama fitur]
- Domain: [UMKM / Kreator / Shared]
- Komponen baru: [daftar komponen & lokasi file]
- Komponen reuse: [komponen existing yang bisa dipakai]
- Server/Client: [mana yang RSC, mana yang "use client"]
- Data: [sumber data & Server Actions yang dibutuhkan]
```

---

## Step 2: KONFIRMASI STRUKTUR KE USER

**Tujuan:** Pastikan pemahaman agent sudah benar sebelum mulai coding.

### Yang Harus Dilakukan

1. **Sajikan Rencana Struktur** ke user:
   - Daftar file yang akan dibuat/dimodifikasi
   - Hierarki komponen (parent-child)
   - Mana yang Server Component vs Client Component
   - Props interface yang akan digunakan

2. **Tanyakan Konfirmasi Eksplisit:**
   ```
   Apakah struktur di atas sudah sesuai? Bolehkah saya mulai implementasi?
   ```

3. **Tunggu Jawaban User** — jangan langsung mulai coding.

### ❌ Yang DILARANG

- Langsung menulis kode tanpa konfirmasi struktur
- Mengasumsikan kebutuhan yang tidak disebutkan user
- Menambahkan fitur bonus yang tidak diminta

---

## Step 3: BUAT KERANGKA JSX DASAR (SKELETON)

**Tujuan:** Bangun struktur HTML/JSX yang benar terlebih dahulu, tanpa styling rumit.

### Yang Harus Dilakukan

1. **Buat file komponen** sesuai rencana yang sudah dikonfirmasi
2. **Tulis JSX skeleton** dengan:
   - Struktur semantik HTML yang benar (`section`, `article`, `nav`, `main`, dll.)
   - Named export (bukan `export default`, kecuali untuk halaman di `app/`)
   - Interface props yang lengkap di atas komponen
   - Placeholder untuk konten (`{/* TODO: ... */}`)
3. **Gunakan konvensi proyek:**
   - PascalCase untuk nama komponen & file
   - Import dari `@/` alias
   - `cn()` dari `@/lib/utils` untuk class names

### Contoh Output Step 3

```tsx
// src/components/features/campaign/CampaignCard.tsx

import Image from "next/image";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  title: string;
  thumbnail: string;
  budget: number;
  status: "active" | "pending" | "completed";
}

export function CampaignCard({ title, thumbnail, budget, status }: CampaignCardProps) {
  return (
    <article>
      {/* Thumbnail */}
      <div>
        <Image src={thumbnail} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" />
      </div>

      {/* Content */}
      <div>
        <h3>{title}</h3>
        <p>{budget}</p>
        <span>{status}</span>
      </div>
    </article>
  );
}
```

### Checkpoint: Tanyakan User

```
Kerangka JSX sudah siap. Apakah strukturnya sudah benar sebelum saya tambahkan styling?
```

---

## Step 4: TAMBAHKAN TAILWIND v4 STYLING

**Tujuan:** Terapkan visual design menggunakan design system Marketiv.

### Aturan Styling yang WAJIB Diikuti

1. **Gunakan Design Tokens** dari `@theme` di `globals.css`:
   - Warna: `text-text-primary`, `text-text-secondary`, `text-text-muted`, `bg-background`, `bg-background-card`, `bg-primary`, `bg-secondary`
   - Font: `font-sans` (Plus Jakarta Sans)

2. **Gunakan Typography Utilities** yang sudah tersedia:
   - `text-hero`, `text-hero-subtitle` → Hero sections
   - `text-heading-1`, `text-heading-2` → Heading
   - `text-body-base`, `text-body-medium` → Body text
   - `text-caption` → Small text
   - `text-nav-link` → Navigation links

3. **Gunakan `cn()` untuk conditional classes:**
   ```tsx
   className={cn(
     "rounded-2xl p-6 transition-all",
     isActive ? "bg-primary-500 text-neutral-0" : "bg-background-card text-text-primary"
   )}
   ```

4. **Responsive design** — mobile-first approach:
   ```tsx
   className="px-4 md:px-8 lg:px-16"
   ```

5. **Tailwind CSS v4 syntax** — Jangan gunakan syntax v3:
   - ✅ `@theme`, `@layer utilities`, `@import "tailwindcss"`
   - ❌ `tailwind.config.js`, `@tailwind base`

### Contoh Output Step 4

```tsx
export function CampaignCard({ title, thumbnail, budget, status }: CampaignCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-background-card shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-heading-2 text-text-primary truncate">{title}</h3>
        <p className="text-body-base text-text-muted mt-1">
          Rp {budget.toLocaleString("id-ID")}
        </p>
        <span className={cn(
          "text-caption mt-2 inline-block rounded-full px-3 py-1",
          status === "active" && "bg-green-100 text-green-700",
          status === "pending" && "bg-yellow-100 text-yellow-700",
          status === "completed" && "bg-gray-100 text-gray-500"
        )}>
          {status}
        </span>
      </div>
    </article>
  );
}
```

---

## Step 5: IMPLEMENTASI INTERAKTIVITAS (JIKA DIPERLUKAN)

**Tujuan:** Tambahkan interaktivitas client-side hanya jika komponen membutuhkannya.

### Checklist Sebelum Menambahkan `"use client"`

- [ ] Apakah komponen ini menggunakan `useState`, `useEffect`, atau hooks lain?
- [ ] Apakah ada event handlers (`onClick`, `onChange`, `onSubmit`)?
- [ ] Apakah komponen mengakses Zustand store?
- [ ] Apakah komponen menggunakan Browser API (`window`, `document`)?

**Jika SEMUA jawaban "Tidak"** → Jangan tambahkan `"use client"`. Biarkan sebagai Server Component.

### Jika Perlu `"use client"`, Ikuti Pola Ini:

1. **Push `"use client"` ke leaf component terkecil** — jangan di parent/container
2. **Pisahkan bagian interaktif** dari bagian statis
3. **Data dari server → kirim via props**, jangan fetch di client
4. **Mutasi data → gunakan Server Actions**, bukan fetch langsung

### Contoh: Menambahkan Filter Interaktif

```tsx
// src/components/features/campaign/CampaignFilter.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CampaignFilterProps {
  categories: string[];
  onFilterChange: (category: string) => void;
}

export function CampaignFilter({ categories, onFilterChange }: CampaignFilterProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleFilter = (category: string) => {
    setActiveCategory(category);
    onFilterChange(category);
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
          className={cn(
            "rounded-full px-4 py-2 text-caption font-medium transition-colors whitespace-nowrap",
            activeCategory === cat
              ? "bg-primary-500 text-neutral-0"
              : "bg-background-card text-text-muted hover:bg-gray-100"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
```

---

## ⚠️ ATURAN CHECKPOINT — BATAS 150 BARIS

### Kapan Harus Berhenti & Tanya User

| Situasi | Aksi |
|---|---|
| Kode sudah mencapai **~150 baris** | ⏸️ Berhenti, tampilkan progres, tanya konfirmasi |
| Membuat **lebih dari 3 file baru** sekaligus | ⏸️ Berhenti setelah 3 file, tanya konfirmasi |
| Ada **keputusan desain yang ambigu** | ⏸️ Tanya user, jangan berasumsi |
| Perlu **mengubah file existing** yang krusial | ⏸️ Jelaskan perubahan, minta persetujuan |

### Format Checkpoint

```
✅ Progres saat ini:
- [x] Step 1: Analisis ✓
- [x] Step 2: Konfirmasi ✓
- [x] Step 3: Kerangka JSX ✓
- [ ] Step 4: Styling (sedang berjalan)
- [ ] Step 5: Interaktivitas

📝 File yang sudah dibuat:
1. src/components/features/campaign/CampaignCard.tsx (45 baris)
2. src/components/features/campaign/CampaignGrid.tsx (32 baris)

Total: 77 baris. Bolehkah saya lanjutkan ke styling?
```

---

## RINGKASAN WORKFLOW

```
Step 1: ANALISIS    → Pahami kebutuhan, identifikasi komponen & data
         ↓
Step 2: KONFIRMASI  → Sajikan rencana struktur, tunggu persetujuan user
         ↓
Step 3: SKELETON    → Buat kerangka JSX dasar tanpa styling
         ↓
Step 4: STYLING     → Terapkan Tailwind v4 dengan @theme design tokens
         ↓
Step 5: INTERAKSI   → Tambahkan "use client" HANYA jika dibutuhkan
         ↓
      ✅ SELESAI     → Review akhir & konfirmasi ke user
```

> **Prinsip Utama:** Selalu **tanya dulu, koding kemudian**. Jangan pernah membuat asumsi sendiri tentang apa yang diinginkan user.