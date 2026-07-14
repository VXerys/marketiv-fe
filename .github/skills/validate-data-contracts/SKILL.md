---
name: validate-data-contracts
description: "Use when validating consistency between Supabase schema types, GraphQL response mapping, and TypeScript domain contracts before merge."
argument-hint: "Provide target files or data flow to validate"
user-invocable: true
---

# Validate Data Contracts

## Outcome
Skill ini memvalidasi konsistensi kontrak data dari layer sumber data ke layer presentasi agar runtime mismatch dapat dicegah sebelum merge.

## When To Use
- Sebelum merge PR yang mengubah schema/query/mapping data.
- Setelah sinkronisasi tipe Supabase.
- Saat ada bug karena field undefined/null mismatch di UI.

## Procedure
1. Discover data flow
- Identifikasi sumber data (Supabase/GraphQL/hybrid).
- Identifikasi file query, mapper, dan type contracts yang dipakai UI.

2. Validate schema-to-type alignment
- Cek tipe `Database` terbaru dari `src/types/supabase.ts` terhadap query yang ditulis.
- Cek field yang dipilih pada query memang ada dan tipe kompatibel.
- Jika schema drift terdeteksi, tandai dan sarankan sync tipe ulang.

3. Validate GraphQL contract mapping
- Cek query string terpisah di module/konstanta.
- Cek mapper meng-handle optional/null fields dengan aman.
- Cek hasil mapping sesuai domain type yang dipakai komponen.

4. Validate server boundary and cache contract
- Cek data fetching utama berada di server boundary.
- Cek cache strategy eksplisit (revalidate/no-store) sesuai sifat data.
- Cek dedup request dipakai saat loader digunakan berulang di route sama.

5. Validate error contract
- Cek early-return pattern untuk error/fallback.
- Cek tidak ada error sensitif yang bocor ke UI.
- Cek UI consumer menerima shape data yang stabil meski error parsial.

6. Produce result
- Laporkan status: pass, warning, fail.
- Cantumkan mismatch kontrak per file/area.
- Berikan patch recommendation singkat dan urutan prioritas.

## Decision Rules
- Query memilih field yang tidak ada di schema/type: fail.
- Mapper melewatkan handling null/optional kritikal: warning/fail.
- Fetch sensitif di client boundary: fail.
- Cache strategy tidak eksplisit untuk data penting: warning.
- Error handling tanpa fallback shape: warning/fail.

## Completion Checklist
- Alignment schema-query-type tervalidasi
- Mapping GraphQL ke domain type tervalidasi
- Server boundary dan cache contract tervalidasi
- Error contract tervalidasi
- Status pass/warning/fail dan rekomendasi prioritas diberikan
