---
description: "Use when implementing or refactoring complex frontend animations (GSAP timelines, ScrollTrigger strategy, Lenis integration, and motion performance budget) in Next.js TSX."
applyTo: "src/app/**/*.tsx, src/components/**/*.tsx"
---
# Frontend Animation Standards

## Scope
- Berlaku untuk macro animations: scroll reveal, parallax, pinned sections, section transitions, dan page transitions.

## Core Rules
- Gunakan GSAP + ScrollTrigger untuk macro animation. Jangan gunakan Framer Motion scroll APIs untuk macro.
- Gunakan `useGSAP` dengan `scope` ref. Hindari `useEffect`/`useLayoutEffect` untuk lifecycle GSAP.
- Import GSAP dari util terpusat proyek (`@/lib/gsap`) agar konfigurasi plugin konsisten.
- Registrasi plugin dilakukan di level module, bukan di dalam function component.

## ScrollTrigger Strategy
- Gunakan trigger points yang konservatif terlebih dahulu:
  - `start: "top 80%"`
  - `end: "bottom 60%"`
- Default `markers: false`.
- Gunakan `scrub` hanya jika benar-benar diperlukan untuk narasi scroll.
- Hindari nested pinning kecuali ada alasan kuat dan sudah diuji di mobile.

## Timeline Orchestration
- Gunakan satu master timeline per section kompleks, lalu pecah ke sequence kecil untuk maintainability.
- Gunakan selector scoped (`.reveal-item`) di dalam root ref komponen.
- Simpan constants timing/duration agar mudah tuning.

## Lenis Integration
- Jangan membuat instance Lenis baru di komponen section.
- Asumsikan smooth scroll provider global sudah aktif; komponen hanya mendaftarkan ScrollTrigger yang dibutuhkan.

## Performance Budget
- Utamakan transform + opacity; hindari animasi properti layout berat secara berulang.
- Batasi jumlah elemen animasi simultan pada viewport.
- Gunakan `will-change` secara selektif, bukan massal.
- Pastikan animasi tetap smooth pada mobile mid-range.

## Accessibility & UX
- Pastikan konten tetap terbaca saat animasi gagal dijalankan.
- Hormati reduced motion preference ketika memungkinkan.
- Fokus keyboard dan urutan semantik tidak boleh rusak karena animasi.
