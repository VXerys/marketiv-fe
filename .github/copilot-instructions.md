# Copilot Workspace Instructions - Awwwards Portfolio

## Scope
Instruksi ini bersifat global untuk seluruh workspace.
Semua output agent harus mengikuti aturan di bawah ini tanpa pengecualian.

## Tech Stack Baseline
- Gunakan Next.js App Router (15+), React 18+, TypeScript strict, dan Tailwind CSS.
- Jangan tawarkan Pages Router, Webpack custom legacy, atau class-based components.
- Prioritaskan solusi modern yang kompatibel dengan arsitektur App Router.

## Next.js Architecture Rules
- Default ke Server Components untuk rendering, data fetching, dan SEO.
- Gunakan use client hanya pada leaf component yang benar-benar butuh state, browser API, atau animasi.
- Dilarang menaruh use client di level page/layout kecuali benar-benar unavoidable dan disertai alasan teknis.
- Terapkan colocation: file yang spesifik satu route diletakkan di folder route terkait.
- Setiap page.tsx wajib memiliki metadata atau generateMetadata untuk SEO.
- Untuk route yang fetch data, sediakan loading.tsx dan error.tsx saat relevan.

## Animation System (Hybrid)
- Makro-animasi (scroll reveal, parallax, section transitions, page transitions) wajib menggunakan GSAP + Lenis.
- Dilarang memakai useEffect murni untuk lifecycle GSAP. Wajib pakai useGSAP dari @gsap/react.
- Semua animasi GSAP wajib memakai scope ref agar cleanup aman dan selector terisolasi.
- ScrollTrigger harus diregister eksplisit jika digunakan.
- Hard rule: import GSAP wajib melalui util terpusat proyek (src/lib/gsap.ts), bukan import langsung dari package di komponen.
- Fallback hanya boleh jika util terpusat belum tersedia, dan harus disertai TODO untuk konsolidasi ke src/lib/gsap.ts.

## Micro-interactions Policy
- Mikro-animasi boleh memakai Framer Motion hanya jika berasal dari komponen 21st.dev atau shadcn/ui.
- Untuk custom mikro-animasi di luar ekosistem tersebut, prioritaskan GSAP/CSS transitions agar bahasa visual tetap konsisten.

## UI Component Policy
- Selalu cek dan prioritaskan komponen shadcn/ui yang sudah ada sebelum membuat komponen custom.
- Komponen dari 21st.dev diperlakukan sebagai sumber UI premium berbasis shadcn/ui dan boleh diadopsi.
- Saat mengadopsi komponen 21st.dev, pertahankan aksesibilitas, semantics, dan konsistensi design token.
- Policy adaptasi 21st.dev: struktur base shadcn/ui harus dipertahankan; modifikasi visual diperbolehkan untuk branding proyek selama tidak merusak API komponen, semantics, dan aksesibilitas.
- Jika perlu refactor besar, prioritaskan perubahan bertahap (incremental) agar behavior tetap stabil dan mudah di-review.

## Styling Rules
- Gunakan utility classes Tailwind, hindari inline style untuk warna/spacing/layout.
- Inline style hanya boleh untuk nilai dinamis yang dibutuhkan animasi runtime.
- Terapkan mobile-first responsive strategy: base, sm, md, lg, xl, 2xl.
- Gunakan helper cn untuk conditional class composition.

## Data and API Rules
- Supabase client wajib dipisah untuk server dan browser, mengikuti struktur src/lib/supabase.
- Gunakan typed queries berdasarkan tipe di src/types/supabase.ts.
- Jangan membuat solusi yang berpotensi bypass RLS di sisi client.
- Integrasi GitHub GraphQL harus melalui modul di src/lib/graphql dengan error handling yang jelas.

## TypeScript Conventions
- Strict typing wajib. Jangan gunakan any.
- Gunakan unknown jika tipe belum diketahui, lalu narrowing eksplisit.
- Gunakan interface untuk props object dan type untuk union/utility types.
- Shared types harus berada di src/types kecuali tipe lokal yang sangat spesifik komponen.

## File and Naming Conventions
- Komponen: PascalCase.
- Hook: camelCase dengan prefix use.
- Utility: camelCase.
- Folder: kebab-case.
- Type files: camelCase.

## Execution Rules for Agent
- Saat memberi saran implementasi, utamakan arsitektur server-first dan performa animasi halus.
- Hindari duplikasi logic; ekstrak utility jika dipakai berulang.
- Sertakan fallback/error state pada fitur async dan integrasi API.
- Saat membuat komponen interaktif, pertahankan aksesibilitas keyboard dan ARIA dasar.

## Explicit Anti-Patterns (Forbidden)
- useEffect sebagai mekanisme utama animasi GSAP.
- use client di level tinggi tanpa justifikasi kuat.
- Data fetching utama di Client Component jika bisa dilakukan di Server Component.
- Inline string GraphQL query tersebar di banyak komponen.
- Solusi usang: Pages Router, class component, atau setup bundler legacy.

Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
