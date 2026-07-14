---
name: scaffold-gsap-scrolltrigger
description: "Use when generating a new React/Next.js TSX component scaffold with GSAP ScrollTrigger that is memory-safe, React Strict Mode friendly, and compatible with Lenis smooth scroll setup."
argument-hint: "Provide component name and short description/intent"
user-invocable: true
---

# Scaffold GSAP ScrollTrigger Component

## Outcome
Skill ini menghasilkan kerangka komponen `.tsx` siap pakai untuk Next.js App Router dengan:
- `"use client"` di baris pertama
- GSAP + ScrollTrigger + `useGSAP` pattern yang aman dari memory leak
- Scope selector berbasis `containerRef`
- Contoh timeline ScrollTrigger dengan `markers: false`
- Styling dasar via Tailwind CSS

## When To Use
- User ingin generate komponen baru dengan animasi scroll.
- User ingin boilerplate GSAP yang aman untuk React Strict Mode.
- User butuh output cepat berupa full code block siap copy-paste.

## Required Rules
- Jangan gunakan `useEffect` atau `useLayoutEffect` untuk lifecycle GSAP.
- Wajib pakai `useGSAP(() => { ... }, { scope: containerRef })`.
- Wajib register plugin di luar function component:
  - `gsap.registerPlugin(ScrollTrigger);`
- Wajib scoping dengan `containerRef` pada root element.

## Procedure
1. Parse input
- Ambil nama komponen dari user.
- Jika nama belum diberikan, pakai placeholder `ScrollSection`.

2. Build mandatory imports and setup
- Tambahkan `"use client";` di baris pertama.
- Tambahkan import wajib:
  - `useRef` dari `react`
  - `gsap` dari `@/lib/gsap` sebagai default utama proyek
  - `ScrollTrigger` dari `gsap/ScrollTrigger`
  - `useGSAP` dari `@gsap/react`
- Jika `@/lib/gsap` tidak tersedia di workspace target, fallback ke `gsap` dari package langsung.
- Tambahkan registrasi plugin di luar komponen:
  - `gsap.registerPlugin(ScrollTrigger);`

3. Build safe component scaffold
- Buat `containerRef` dan tempel ke root element.
- Di dalam `useGSAP`, buat timeline contoh dengan `scrollTrigger` + `markers: false`.
- Gunakan selector class yang scoped (mis. `.reveal-item`) agar aman antar komponen.
- Gunakan struktur default yang konsisten bila user tidak minta struktur khusus:
  - root `section`
  - satu heading block
  - tiga item `.reveal-item` untuk demo stagger

4. Provide editable placeholders
- Sisipkan komentar singkat pada area yang user biasa modifikasi:
  - target selector
  - nilai animation config (duration, stagger, start/end)
  - struktur konten JSX

5. Enforce output format
- Output utama harus satu full code block `.tsx` yang siap dijalankan.
- Jangan tambahkan penjelasan panjang di luar kode.
- Jika dependency baru diperlukan di luar baseline (`gsap`, `@gsap/react`), sertakan `npm install <package>` sebelum code block.

## Decision Rules
- Jika user minta animasi scroll: gunakan ScrollTrigger timeline di `useGSAP`.
- Jika user minta interaksi hover/tap saja tanpa kebutuhan scroll:
  - jangan paksa ScrollTrigger,
  - berikan scaffold GSAP non-scroll sederhana,
  - dan jelaskan singkat kenapa mode non-scroll dipilih.
- Jika user minta style custom: gunakan utility Tailwind, bukan file CSS eksternal.
- Jika ada indikator integrasi Lenis di project, tambahkan komentar singkat bahwa ScrollTrigger harus mengikuti provider Lenis aktif (tanpa duplikasi setup provider).

## Completion Checklist
- `"use client"` di paling atas
- Import wajib lengkap dan benar
- `gsap.registerPlugin(ScrollTrigger)` di luar komponen
- Tidak ada `useEffect`/`useLayoutEffect` untuk GSAP
- `containerRef` ada dan terpasang ke root
- `useGSAP` memakai `{ scope: containerRef }`
- Ada contoh timeline ScrollTrigger dengan `markers: false`
- Default JSX berisi heading + 3 `.reveal-item` jika user tidak memberi struktur
- Output berupa full code block `.tsx`
