---
description: "Use when creating a server-first Next.js App Router data loader with Supabase or GitHub GraphQL, explicit cache strategy, and typed response mapping. Keywords: server data loader, app router fetch, supabase, graphql, revalidate, no-store."
argument-hint: "Data source + entity + freshness requirement"
agent: "agent"
---
Gunakan panduan global di [copilot instructions](../copilot-instructions.md), skill [backend data architect](../skills/backend-data-architect/SKILL.md), dan instruction [supabase graphql data layer](../instructions/supabase-graphql-data-layer.instructions.md).

Tugas:
- Buat fungsi data loader server-side untuk App Router.
- Pakai typing kuat (`Database` untuk Supabase atau domain type untuk GraphQL mapping).
- Terapkan early-return error handling.
- Tetapkan cache strategy eksplisit sesuai kebutuhan freshness.
- Jika loader dipakai lintas komponen pada route yang sama, gunakan `cache` dari `react`.

Format output:
1. Jika diminta sync manual tipe Supabase, tampilkan command satu baris yang siap dijalankan.
2. Berikan full code block TypeScript (`.ts` atau `.tsx`) siap pakai.
3. Jelaskan strategi cache dalam maksimal 2 kalimat.

Input user:
{{input}}
