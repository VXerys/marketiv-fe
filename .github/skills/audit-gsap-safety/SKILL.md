---
name: audit-gsap-safety
description: "Use when acting as a performance profiler and memory leak detector for animated Next.js/React components (GSAP lifecycle safety, Lenis/ScrollTrigger risks, jank root-cause analysis, and refactor-ready code fixes)."
argument-hint: "Provide TSX code or file path(s) to audit for leaks, jank, and GSAP safety"
user-invocable: true
---

# Performance Profiler And Memory Leak Detector

## Outcome
Skill ini melakukan audit ketat terhadap komponen animasi Next.js/React, menemukan akar masalah frame drop atau memory leak, lalu memberi patch kode refactor siap pakai.

## When To Use
- Saat ada jank/frame drop pada section animasi.
- Saat curiga memory leak karena lifecycle animasi tidak aman di React Strict Mode.
- Saat ingin audit cepat terhadap kode 21st.dev/shadcn yang sudah diadaptasi.

## Procedure
1. Ingest target
- Terima input dari user berupa selection code atau path file.
- Jika path diberikan, baca file terkait dan konteks import yang relevan.

2. Audit GSAP lifecycle (critical)
- Deteksi penggunaan `useEffect` atau `useLayoutEffect` untuk setup GSAP.
- Jika ditemukan, tandai sebagai pelanggaran kritikal dan migrasikan ke `useGSAP`.
- Pastikan `useGSAP` memakai `{ scope: containerRef }`.
- Audit callback GSAP (`onUpdate`, `onRepeat`, `onComplete`) untuk `setState` yang dapat memicu render loop.

3. Audit Lenis and ScrollTrigger interaction
- Cek potensi bentrok CSS global yang mengganggu scroll metrics (contoh `overflow-x: hidden` atau overflow rules yang tidak tepat pada root/global wrappers).
- Perlakukan `overflow-x: hidden` sebagai warning kondisional: tandai issue hanya jika ditemukan bukti efek samping pada perhitungan scroll, pin spacing, atau trigger offsets.
- Cek `markers` pada ScrollTrigger; untuk mode produksi harus `false`.
- Cek setup Lenis tidak diduplikasi di komponen leaf.

4. Audit Next.js and DOM usage
- Jika ada media besar pada area animasi hero/above-the-fold, rekomendasikan/terapkan `next/image` dengan konfigurasi yang tepat termasuk `priority` bila relevan.
- Terapkan `priority` hanya pada media hero yang benar-benar berada di first viewport dan berpotensi menjadi LCP; hindari `priority` berlebihan pada banyak image.
- Cek akses `window`/`document` tidak dipanggil langsung di server context atau di luar lifecycle aman.

5. Prioritize findings
- Kelompokkan temuan menjadi high/medium/low.
- Jelaskan dampak performa atau memory risk dari tiap temuan.

6. Build fix
- Berikan action plan per temuan.
- Refactor kode menjadi versi aman Strict Mode dengan `useGSAP` + scope + cleanup kontekstual.
- Jaga behavior visual sebisa mungkin tetap setara.

7. Format response (mandatory)
- Bagian 1: Root Cause Analysis (RCA) dalam bullet singkat.
- Bagian 2: Action Plan yang langsung bisa dieksekusi.
- Bagian 3: Code Fix utuh siap copy-paste.

## Decision Rules
- `useEffect`/`useLayoutEffect` untuk GSAP setup: high severity.
- `useGSAP` tanpa `scope`: high severity.
- `setState` di `onUpdate` GSAP yang berjalan per frame: high severity.
- ScrollTrigger markers aktif pada code produksi: medium severity.
- `overflow-x: hidden` global: low severity secara default, naik ke medium jika ada gejala trigger offset/pin mismatch/jitter.
- Akses `window`/`document` tanpa guard environment: medium/high tergantung konteks.
- Media hero besar tanpa `next/image` strategy: medium severity.
- `priority` pada banyak image non-LCP: low/medium severity karena berisiko merusak performa loading.

## Ambiguity Defaults (Resolved)
- CSS overflow global tidak otomatis dianggap bug; wajib berbasis bukti dampak pada Lenis/ScrollTrigger metrics.
- `next/image` dengan `priority` hanya diwajibkan untuk kandidat LCP di hero first viewport.
- Jika bukti tidak cukup, laporkan sebagai risk hypothesis dengan langkah verifikasi, bukan sebagai root cause final.

## Completion Checklist
- RCA tersedia dan langsung ke akar masalah
- Action plan jelas dan berurutan
- Code fix lengkap dan bisa ditempel langsung
- Tidak ada pelanggaran GSAP lifecycle tersisa
- Risiko residual (jika ada) disebutkan singkat
