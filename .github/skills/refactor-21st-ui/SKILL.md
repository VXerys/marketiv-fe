---
name: refactor-21st-ui
description: "Use when refactoring raw 21st.dev TSX components into this workspace standards: Next.js App Router client boundaries, shadcn/ui import conventions, and hybrid animation policy (Framer Motion for micro only, GSAP+Lenis for scroll/macro)."
argument-hint: "Paste the raw 21st.dev TSX component code and target filename/context"
user-invocable: true
---

# Refactor 21st.dev UI To Workspace Standards

## Outcome
Skill ini mengubah kode raw komponen 21st.dev menjadi komponen `.tsx` yang siap dipakai di proyek ini, dengan standar:
- Next.js App Router
- shadcn/ui conventions
- Hybrid animation policy (GSAP + Lenis untuk macro-scroll, Framer Motion hanya micro-interactions)
- Output deterministik: full code block siap copy-paste + ringkasan perubahan singkat

## Use When
- User paste komponen 21st.dev berbasis Framer Motion + Tailwind.
- User meminta normalisasi import, path alias, dan style cleanup.
- User meminta output full code block siap copy-paste.

## Required Context
- Workspace rules utama: [copilot-instructions](../../copilot-instructions.md)
- Aturan tambahan repo: [global-rules](../../../.agents/rules/global-rules.md)

## Procedure
1. Intake input komponen
- Terima kode raw TSX apa adanya.
- Identifikasi: hooks yang dipakai, icon library, utility class merger, scroll animation APIs, inline style, dan potensi konflik z-index.
- Klasifikasikan animasi menjadi dua kategori:
  - macro (scroll progress, in-view reveal section-level, parallax, page/section transition)
  - micro (hover, tap, click feedback, local modal/card transitions)

2. Enforce Client Component boundary
- Tambahkan `"use client";` di baris paling atas file.
- Pastikan tidak ada statement/import di atas directive tersebut.

3. Normalize imports dan path resolution
- Ubah utility class merge menjadi:
  - `import { cn } from "@/lib/utils"`
- Jika ada helper `clsx`, `classnames`, atau util lokal yang redundant untuk class merge, sederhanakan ke `cn`.
- Jika ada icon eksternal selain shadcn/lucide (misalnya Radix Icons), ganti ke `lucide-react` dengan ikon paling dekat secara semantik.
- Jika ada import path relatif panjang untuk shared UI/util yang bisa memakai alias proyek, prioritaskan `@/` alias agar konsisten.

4. Apply hybrid animation policy (critical)
- Pertahankan Framer Motion hanya untuk micro-interactions:
  - hover, tap, press, modal pop-up, small layout transitions.
- Hapus atau blokir semua animasi berbasis scroll dari Framer Motion, termasuk pola seperti:
  - `useScroll`
  - `useTransform` yang berasal dari progress scroll
  - `whileInView`, `viewport`, dan trigger in-view sejenis untuk reveal macro
- Di lokasi penghapusan logic scroll, sisipkan komentar persis:
  - `// TODO: Replace with GSAP ScrollTrigger via useGSAP()`
- Jika `whileInView` dipakai hanya sebagai reveal saat elemen masuk viewport, tetap anggap macro dan migrasikan (default policy).

5. Clean code dan Tailwind alignment
- Konversi inline style non-dynamic menjadi utility Tailwind.
- Inline style boleh dipertahankan hanya jika nilainya benar-benar runtime-dynamic dan sulit direpresentasikan dengan utility class.
- Jika style campuran static+dynamic, pindahkan bagian static ke class Tailwind dan sisakan inline untuk bagian dynamic saja.
- Pastikan class composition rapi melalui `cn(...)` jika ada kondisi.
- Rapikan layering agar tidak ada z-index ekstrem/konflik (hindari angka arbitrer besar tanpa alasan).

6. Safety checks before output
- Pastikan komponen tetap compile secara sintaks TSX.
- Pastikan import tidak ada yang orphan/unused setelah refactor.
- Pastikan tidak ada API Framer scroll yang tertinggal.
- Pastikan directive `"use client"` tetap ada di paling atas.

7. Response contract ke user
- Jika butuh dependensi tambahan di luar `framer-motion`, `lucide-react`, `clsx`, tulis perintah install:
  - `npm install <package>`
- Berikan full code block hasil akhir siap copy-paste.
- Berikan bullet list singkat perubahan utama dari versi asli.
- Jika ada mapping icon yang tidak ekuivalen 1:1, sebutkan asumsi mapping di bullet list.

## Decision Rules
- Jika animasi terlihat macro (scroll progress, section reveal saat masuk viewport), migrasikan keluar dari Framer Motion dan beri TODO GSAP.
- Jika animasi hanya mikro pada elemen lokal (button/card/modal), Framer Motion boleh dipertahankan.
- Jika mapping icon tidak 1:1, gunakan ikon `lucide-react` paling mendekati intent dan sebutkan asumsi di ringkasan perubahan.
- Jika inline style campuran static + dynamic, ekstrak static ke Tailwind, sisakan dynamic minimal.

## Ambiguity Defaults (Best-Practice Decisions)
- `whileInView` default: dianggap macro dan harus dihapus/migrasi, bukan dipertahankan.
- Mapping icon default: semantic-nearest mapping ke `lucide-react`; jika tidak ada padanan dekat, gunakan icon generic paling netral dan jelaskan asumsi.
- Inline style default: minimalkan ketat; sisakan inline hanya untuk nilai runtime yang tidak praktis diutility-kan.
- Output default: tanpa penjelasan panjang, fokus pada kode final + perubahan inti.

## Completion Checklist
- `"use client"` di baris pertama
- `cn` import dari `@/lib/utils`
- Icon library seragam ke `lucide-react` saat perlu
- Tidak ada `useScroll`/`whileInView`/scroll-driven Framer Motion
- Komentar TODO GSAP ditambahkan di lokasi penggantian scroll logic
- Inline style static sudah dikonversi ke Tailwind
- Style campuran static+dynamic sudah dipisah dengan benar
- Full code block + ringkasan perubahan diberikan
