---
description: "Use when implementing server-first data fetching, caching, revalidation, and error boundaries in Next.js App Router routes."
applyTo: "src/app/**/*.tsx"
---
# App Router Data Fetching Standards

## Server-First Policy
- Lakukan data fetching utama di Server Components, bukan di Client Components.
- Client Components hanya menerima data via props atau memanggil endpoint yang memang interaktif.

## Caching & Revalidation
- Tetapkan strategi cache eksplisit untuk setiap fetch penting.
- Gunakan revalidation berbasis kebutuhan data:
  - static-like data: interval revalidate
  - frequently changing data: no-store atau revalidate rendah
- Hindari campuran strategi cache yang tidak jelas dalam satu flow.

## Route Contracts
- Route yang melakukan fetch data harus mempertimbangkan:
  - `loading.tsx` untuk skeleton/loading state
  - `error.tsx` untuk error boundary route-level
- `page.tsx` wajib memiliki metadata atau `generateMetadata`.

## Error Handling
- Bungkus integrasi API eksternal dengan handling error yang jelas.
- Untuk data parsial, tampilkan fallback UI yang tetap usable.
- Jangan melempar raw error message sensitif ke UI.

## Supabase & GraphQL
- Supabase server queries gunakan client server-side dari `src/lib/supabase/server.ts`.
- Supabase browser queries gunakan client browser dari `src/lib/supabase/client.ts` hanya bila diperlukan interaktivitas.
- GitHub GraphQL akses lewat modul `src/lib/graphql` dan gunakan wrapper error handling konsisten.

## Type Safety
- Gunakan tipe dari `src/types` untuk response contracts.
- Jangan gunakan `any`; gunakan `unknown` + narrowing jika tipe belum pasti.

## Boundaries
- Hindari menaruh logic data orchestration berat di component presentational.
- Ekstrak utility bila dipakai berulang lintas route.
