---
description: "Use when creating or modifying React TSX components that implement GSAP/ScrollTrigger animations in Next.js App Router."
applyTo: "src/app/**/*.tsx, src/components/**/*.tsx"
---
# GSAP Component Rules

- Gunakan Server Components sebagai default. Tambahkan "use client" hanya untuk leaf component yang benar-benar membutuhkan GSAP/browser APIs.
- Jangan gunakan useEffect atau useLayoutEffect untuk lifecycle GSAP. Gunakan useGSAP dari @gsap/react.
- Selalu gunakan scope ref:
  - const containerRef = useRef<HTMLDivElement>(null)
  - useGSAP(() => { ... }, { scope: containerRef })
- Register plugin di luar function component:
  - gsap.registerPlugin(ScrollTrigger)
- Untuk proyek ini, prioritaskan import gsap dari util terpusat:
  - import gsap from "@/lib/gsap"
- Hindari selector global tanpa scope. Targetkan class di dalam root container komponen.
- Gunakan markers: false sebagai default. Aktifkan markers hanya saat debugging.
- Styling harus Tailwind utility classes. Hindari inline style kecuali nilai benar-benar dinamis runtime.
- Jika menemukan animasi scroll berbasis Framer Motion (useScroll, whileInView), arahkan ke GSAP ScrollTrigger dan sisipkan TODO migrasi bila perlu.
- Pastikan aksesibilitas dasar tetap ada: semantic tags, heading hierarchy, dan focus state untuk elemen interaktif.
