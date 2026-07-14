---
description: "Use when refactoring imported 21st.dev TSX components to workspace standards (App Router client boundary, shadcn/lucide imports, and Framer-to-GSAP scroll policy)."
applyTo: "src/app/**/*.tsx, src/components/**/*.tsx"
---
# Refactor 21st Component Rules

- Tambahkan "use client" hanya pada leaf component interaktif hasil adopsi 21st.dev.
- Normalisasi class utility ke `cn` dari `@/lib/utils`.
- Normalisasi ikon ke `lucide-react` untuk konsistensi dengan ekosistem shadcn/ui.
- Framer Motion hanya untuk micro-interactions (hover/tap/local transitions).
- Semua pola scroll Framer (`useScroll`, `whileInView`, viewport reveal section-level) harus dimigrasikan ke GSAP ScrollTrigger.
- Saat menghapus scroll logic Framer, sisipkan komentar:
  - `// TODO: Replace with GSAP ScrollTrigger via useGSAP()`
- Konversi inline style static ke Tailwind utility classes.
- Jika style campuran static+dynamic, simpan inline hanya untuk bagian dynamic.
- Hindari z-index arbitrer ekstrem; gunakan layering yang konsisten.
- Output refactor harus menjaga aksesibilitas dasar: semantic tags, heading hierarchy, keyboard focus.
