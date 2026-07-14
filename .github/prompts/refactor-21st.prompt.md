---
description: "Use when refactoring raw 21st.dev TSX component code into workspace standards with Framer micro-only policy and GSAP-ready scroll migration notes. Keywords: 21st.dev refactor, shadcn, framer micro only, gsap migration, tsx cleanup."
argument-hint: "Paste raw 21st.dev TSX component + target filename"
agent: "agent"
---
Gunakan skill [refactor 21st ui](../skills/refactor-21st-ui/SKILL.md), aturan global [copilot instructions](../copilot-instructions.md), dan rules tambahan [refactor instruction](../instructions/refactor-21st.instructions.md).

Tugas:
- Refactor kode komponen 21st.dev yang diberikan.
- Terapkan "use client" di baris pertama.
- Normalisasi import `cn` ke `@/lib/utils`.
- Migrasikan icon non-lucide ke `lucide-react`.
- Hapus scroll animation Framer Motion dan sisipkan TODO GSAP di lokasi relevan.
- Pertahankan Framer Motion hanya untuk micro-interactions.
- Minimalkan inline style; pindahkan static style ke Tailwind classes.

Format output:
1. Jika perlu dependency baru, tampilkan `npm install <package>`.
2. Berikan satu full code block TSX siap copy-paste.
3. Berikan bullet list ringkas perubahan inti, termasuk asumsi mapping icon jika ada.

Input user:
{{input}}
