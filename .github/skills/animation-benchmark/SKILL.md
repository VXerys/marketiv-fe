---
name: animation-benchmark
description: "Use when running a lightweight pre-merge benchmark for animated sections (FPS stability, long-task hotspots, layout-shift risk, and ScrollTrigger sanity checks)."
argument-hint: "Provide component path/route and target device profile"
user-invocable: true
---

# Animation Benchmark

## Outcome
Skill ini memberikan benchmark praktis sebelum merge untuk menilai kestabilan animasi dan mengurangi regressions performa.

## When To Use
- Sebelum merge PR yang menyentuh animasi.
- Setelah refactor GSAP/ScrollTrigger/Lenis.
- Saat QA menemukan jank pada device tertentu.

## Procedure
1. Define benchmark scope
- Tentukan route/section target.
- Tentukan profil device minimal:
  - desktop baseline
  - mobile mid-range

2. Run runtime sanity checks
- Verifikasi tidak ada error runtime dari animation lifecycle.
- Verifikasi ScrollTrigger markers off untuk mode produksi.
- Verifikasi trigger points tidak menyebabkan jump/glitch saat scroll cepat.

3. Collect performance indicators
- Estimasi kestabilan FPS saat section animasi aktif.
- Cari long-task hotspot yang menahan main thread.
- Identifikasi potensi layout shift (CLS risk) selama animasi dan loading media.

4. Inspect asset and rendering pressure
- Cek media besar di hero/above-the-fold sudah memakai strategi `next/image` yang sesuai.
- Cek penggunaan properti animasi berat (layout thrashing risk).
- Cek jumlah elemen yang dianimasikan bersamaan pada viewport.

5. Report and gate
- Laporkan status benchmark: pass, warning, fail.
- Sertakan bottleneck utama dan rekomendasi optimisasi terukur.
- Jika fail, berikan prioritas perbaikan sebelum merge.

## Decision Rules
- Long task berulang saat animasi berjalan: warning/fail tergantung dampak UX.
- Trigger misalignment atau jitter konsisten: fail.
- CLS risk pada hero karena media loading/size instability: warning/fail.
- Markers aktif di mode produksi: warning wajib perbaikan.

## Completion Checklist
- Scope benchmark jelas (route + device profile)
- Hasil pass/warning/fail tersedia
- Bottleneck utama teridentifikasi
- Rekomendasi optimisasi actionable disediakan
