---
description: "Use when scaffolding a memory-safe GSAP ScrollTrigger React/Next.js TSX section that follows workspace standards and Lenis-compatible structure. Keywords: gsap scaffold, scrolltrigger, usegsap, lenis, animation starter."
argument-hint: "Component name + short section purpose"
agent: "agent"
---
Gunakan standar workspace di [copilot instructions](../copilot-instructions.md) dan aturan GSAP di [gsap components instruction](../instructions/gsap-components.instructions.md).

Tugas:
- Buat scaffold komponen TSX baru untuk Next.js App Router.
- Wajib "use client" di baris pertama.
- Wajib pakai useRef + useGSAP (tanpa useEffect/useLayoutEffect untuk GSAP).
- Wajib register ScrollTrigger di luar function component.
- Wajib `markers: false`.
- Gunakan Tailwind utility classes.
- Sertakan komentar singkat pada titik customisasi utama.

Format output:
1. Jika ada dependency tambahan, tampilkan `npm install <package>`.
2. Tampilkan satu full code block TSX siap copy-paste.
3. Tampilkan 3-5 bullet ringkas tentang keputusan scaffold.

Input user:
{{input}}
