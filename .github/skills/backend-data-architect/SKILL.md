---
name: backend-data-architect
description: "Use when implementing Supabase MCP integration, TypeScript schema synchronization, and server-first data fetching (including GitHub GraphQL) for Next.js App Router."
argument-hint: "Describe schema/query needs, target route, and whether Supabase MCP is connected"
user-invocable: true
---

# Backend And Data Architect

## Outcome
Skill ini menghasilkan implementasi backend/data layer yang konsisten untuk proyek ini:
- Sinkronisasi tipe Supabase ke TypeScript.
- Fungsi fetch server-first untuk Next.js App Router.
- Integrasi query GitHub GraphQL yang rapi, typed, dan aman.
- Error handling early-return agar UI tidak crash.

## When To Use
- Saat membuat atau mengubah query Supabase.
- Saat membuat modul data fetching untuk route App Router.
- Saat menghubungkan data GitHub GraphQL ke model portfolio.
- Saat perlu validasi cache/revalidate behavior di Next.js 15.

## Required Rules
- Prioritaskan Supabase MCP untuk baca schema terbaru sebelum menulis query.
- Jika sync manual diminta, gunakan perintah:
  - `npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/supabase.ts`
- Selalu gunakan tipe `Database` hasil generate pada client/query layer.
- Data fetching utama wajib di Server Components atau Server Actions.
- Client Component hanya boleh fetch untuk kebutuhan interaktif khusus (pagination realtime/subscription).
- Untuk data statis-ish di Next.js 15, cache harus eksplisit (`revalidate` atau strategy lain yang setara).
- Gunakan `cache` dari `react` untuk deduplikasi request lintas pemanggilan dalam route yang sama.

## Procedure
1. Intake requirement
- Identifikasi sumber data: Supabase, GitHub GraphQL, atau hybrid.
- Identifikasi kebutuhan freshness data: static-like, semi-dynamic, highly-dynamic.

2. Resolve schema source
- Jika MCP Supabase tersedia:
  - baca schema aktif lewat tool MCP sebelum menulis query.
- Jika MCP tidak tersedia atau user meminta manual:
  - berikan command sync type Supabase yang siap run.
- Pastikan output tipe mengacu ke `src/types/supabase.ts`.

3. Design fetching strategy (Next.js 15)
- Tentukan lokasi fetch pada server boundary:
  - Server Component loader function, atau
  - Server Action bila terkait mutation.
- Tentukan cache strategy eksplisit:
  - static-like: `next: { revalidate: 3600 }` (atau sesuai kebutuhan domain)
  - frequently changing: `cache: "no-store"` atau revalidate rendah
- Bungkus function fetch reusable dengan `cache` jika dipakai berulang di route yang sama.

4. Implement Supabase query layer
- Gunakan query strongly-typed dengan `Database`.
- Gunakan early return pada error:
  - return fallback terkontrol atau error object aman
  - hindari throw mentah yang memecah UI

5. Implement GitHub GraphQL layer
- Simpan GraphQL query string pada konstanta/file terpisah.
- Jalankan request lewat modul `src/lib/graphql`.
- Mapping response ke tipe TypeScript domain portfolio sebelum dipakai UI.
- Terapkan early return jika response invalid/partial.

6. Produce output by request type
- Jika user minta command terminal: keluarkan satu baris command siap jalankan.
- Jika user minta fungsi/komponen: berikan code block TypeScript utuh (`.ts`/`.tsx`) dengan import type relevan.
- Tambahkan penjelasan strategi cache maksimal dua kalimat.

## Decision Rules
- Jika requirement data tidak jelas: default ke server-first + revalidate konservatif, lalu jelaskan asumsi.
- Jika query dipanggil di banyak komponen satu route: wajib pakai `cache` untuk deduplikasi.
- Jika endpoint sensitif atau tergantung secret: tetap di server layer, jangan expose ke client.
- Jika GraphQL response tidak stabil: gunakan narrowing + fallback mapping, jangan asumsi semua field selalu ada.

## Completion Checklist
- Schema source tervalidasi (MCP atau sync manual)
- Query layer typed dengan `Database`
- Fetch berada di server boundary
- Cache/revalidate ditetapkan eksplisit
- Early-return error handling diterapkan
- GraphQL query dipisah ke konstanta/module
- Output format sesuai permintaan (command atau full TS code)
- Penjelasan cache <= 2 kalimat
