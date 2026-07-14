---
description: "Use when building or refactoring Supabase and GitHub GraphQL data-layer modules in Next.js App Router with strong typing, server-first boundaries, and explicit caching."
applyTo: "src/lib/**/*.ts, src/lib/**/*.tsx, src/app/**/*.ts, src/app/**/*.tsx"
---
# Supabase And GraphQL Data-Layer Rules

## Scope
- Berlaku untuk helper data fetching, repository layer, server actions, dan route-level data orchestration.

## Server-First Boundaries
- Data fetching utama harus di server boundary (Server Component/Server Action/Route Handler).
- Jangan fetch data sensitif langsung dari Client Components.

## Supabase Typing
- Gunakan tipe `Database` dari `src/types/supabase.ts`.
- Query harus strongly-typed dan eksplisit pada tabel/kolom.
- Jika skema berubah, sinkronkan tipe sebelum menambah query baru.

## GraphQL Standards
- Simpan query string sebagai konstanta terpisah (hindari inline query berulang).
- Jalankan request lewat modul `src/lib/graphql` agar auth dan error handling konsisten.
- Mapping response GraphQL ke domain type lokal sebelum dipakai UI.

## Caching Strategy (Next.js 15)
- `fetch` tidak cached by default, jadi tetapkan strategy secara eksplisit.
- Static-like data: gunakan `next: { revalidate: 3600 }` atau interval domain-appropriate.
- Frequently changing data: gunakan `cache: "no-store"` atau revalidate rendah.
- Jika loader dipakai lintas komponen di route yang sama, gunakan `cache` dari `react` untuk deduplikasi.

## Error Handling
- Terapkan early-return untuk error/fallback agar UI tetap resilient.
- Hindari throw raw error message sensitif ke layer presentasi.
- Jika response parsial, mapping ke bentuk aman/default object.

## Output Contract
- Jika user meminta command: beri satu baris command siap run.
- Jika user meminta implementasi: beri full code block TypeScript dengan import type relevan.
- Sertakan penjelasan cache maksimal dua kalimat.
