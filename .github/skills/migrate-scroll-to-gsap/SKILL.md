---
name: migrate-scroll-to-gsap
description: "Use when replacing Framer Motion scroll-driven animations with GSAP ScrollTrigger + useGSAP in React/Next.js TSX components."
argument-hint: "Provide file path(s) or paste TSX code with scroll animation logic"
user-invocable: true
---

# Migrate Framer Scroll To GSAP

## Outcome
Skill ini memigrasikan animasi berbasis scroll dari Framer Motion ke GSAP ScrollTrigger dengan pola aman (scope ref + useGSAP), tanpa mengganggu micro-interactions Framer.

## When To Use
- Ada `useScroll`, `useTransform` berbasis scroll progress, `whileInView`, atau `viewport` reveal section-level.
- Komponen mengalami jank saat smooth scroll/Lenis aktif.
- Dibutuhkan konsistensi macro animation policy proyek.

## Procedure
1. Identify scroll-driven Framer APIs
- Temukan semua pola scroll Framer yang harus dimigrasikan.
- Pisahkan logic micro-interaction Framer yang boleh dipertahankan.

2. Prepare GSAP-safe structure
- Pastikan file memiliki `"use client"` jika memakai browser animation APIs.
- Tambahkan `containerRef` pada root component.
- Pastikan `useGSAP` dipakai dengan `{ scope: containerRef }`.

3. Replace behavior with ScrollTrigger
- Konversi reveal/parallax/progress behavior ke timeline atau tween GSAP dengan `scrollTrigger`.
- Gunakan `markers: false`.
- Hindari selector global; gunakan selector scoped.

4. Preserve allowed Framer micro-interactions
- Biarkan hover/tap/click/local modal transitions tetap menggunakan Framer Motion.
- Hapus hanya bagian yang scroll-driven.

5. Annotate migration points
- Jika ada bagian yang belum dipetakan penuh, sisipkan:
  - `// TODO: Replace with GSAP ScrollTrigger via useGSAP()`

6. Validate output
- Cek tidak ada API Framer scroll tersisa.
- Cek import bersih (tanpa orphan).
- Cek struktur JSX tetap berfungsi.

## Decision Rules
- `whileInView` default dianggap scroll-driven macro dan dimigrasikan.
- Jika replacement visual 1:1 sulit, prioritaskan parity perilaku utama (timing, stagger, trigger point) daripada detail easing minor.
- Jika konflik dengan layout, prioritaskan stabilitas layout dulu, lalu refinement motion di iterasi berikutnya.

## Completion Checklist
- Scroll APIs Framer sudah dihapus/migrasi
- GSAP ScrollTrigger aktif via useGSAP + scope ref
- markers default false
- Micro-interactions Framer tetap aman
- TODO migrasi ditambahkan untuk gap yang belum selesai
