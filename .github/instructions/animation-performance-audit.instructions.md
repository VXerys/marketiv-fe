---
description: "Use when auditing animated React/Next.js components for frame drops, memory leaks, GSAP lifecycle violations, and Lenis/ScrollTrigger integration risks."
applyTo: "src/app/**/*.tsx, src/components/**/*.tsx"
---
# Animation Performance Audit Rules

## Scope
- Fokus pada komponen TSX yang memiliki animasi, scroll effects, atau heavy visual transitions.

## Critical Checks
- PELANGGARAN jika setup GSAP dilakukan di `useEffect`/`useLayoutEffect`; wajib pindah ke `useGSAP`.
- Wajib `scope` pada `useGSAP` agar selector terlokalisasi di root ref.
- Waspadai `setState` di callback per-frame (`onUpdate`) yang memicu render loop.

## Lenis + ScrollTrigger
- `markers` harus `false` untuk mode produksi.
- Jangan duplikasi setup Lenis di komponen leaf.
- `overflow-x: hidden` global hanya dianggap isu jika ada bukti trigger/pin offset atau jitter.

## Next.js Performance
- Untuk hero/above-the-fold media yang menjadi kandidat LCP, gunakan `next/image` dan `priority`.
- Hindari memberi `priority` pada banyak image non-LCP.
- Pastikan akses `window`/`document` hanya di lifecycle aman client-side.

## Output Quality
- Audit harus menghasilkan:
  - RCA singkat berbasis bukti
  - Action plan konkret dan berurutan
  - Code fix siap tempel
- Jika evidence belum cukup, tulis sebagai hipotesis + langkah validasi, bukan klaim final.
