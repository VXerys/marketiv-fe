---
description: "Use when generating a premium Awwwards-style portfolio section for Next.js App Router with server-first architecture and GSAP-ready interaction boundaries. Keywords: awwwards section, portfolio section, app router, gsap, server-first."
argument-hint: "Section name + purpose + visual direction"
agent: "agent"
---
Gunakan standar global dari [copilot instructions](../copilot-instructions.md), aturan animasi dari [frontend animations instruction](../instructions/frontend-animations.instructions.md), dan aturan data dari [app router data fetching instruction](../instructions/app-router-data-fetching.instructions.md).

Tugas:
- Generate satu section portfolio premium yang production-minded.
- Terapkan arsitektur server-first:
  - Server Component untuk struktur, data, SEO.
  - Leaf Client Component hanya jika butuh state/browser API/animasi.
- Gunakan Tailwind utility classes dan komposisi class yang rapi.
- Jika butuh macro animation, siapkan boundary GSAP yang aman (`useGSAP`, scoped ref, markers false).
- Jika ada adopsi 21st.dev style/component, pertahankan semantics dan aksesibilitas.

Output wajib:
1. Struktur file yang direkomendasikan (route-level + komponen pendukung).
2. Full code block untuk file utama section (`.tsx`).
3. Jika perlu, full code block untuk leaf client animation component (`.tsx`).
4. Bullet list keputusan arsitektur (server/client split, animation choice, caching/data decisions).
5. Checklist singkat test manual (desktop + mobile + reduced motion sanity check).

Input user:
{{input}}
