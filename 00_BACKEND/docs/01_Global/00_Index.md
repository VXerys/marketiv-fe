# 01_Global — Index

Standar global lintas-modul untuk Marketiv (platform UMKM ↔ Content Creator untuk promosi digital: Campaign PPV & Rate Card/Order dengan Escrow, di atas Appwrite + Next.js). Dokumen di sini adalah pemilik tunggal (single owner) untuk istilah, konvensi, struktur, keamanan, dan design token. Modul tidak boleh menduplikasi isinya — cukup cross-link.

## Daftar Dokumen

- [`10_Glossary.md`](10_Glossary.md) — Definisi istilah inti domain (UMKM, Creator, Campaign, Escrow, dll), satu baris per istilah.
- [`20_Coding_Standards.md`](20_Coding_Standards.md) — Standar coding: feature-based module, wajib service layer, Zustand store, Zod schema, penamaan.
- [`30_Naming_Convention.md`](30_Naming_Convention.md) — Konvensi penamaan collection, attribute, file/komponen, route, dan Appwrite Function.
- [`40_Folder_Structure.md`](40_Folder_Structure.md) — Pemilik struktur folder frontend: arsitektur `src/`, `functions/`, `storage/`, `tests/`, env vars.
- [`50_Security_Guidelines.md`](50_Security_Guidelines.md) — Pemilik permission: matrix CRUD per collection per role, document-level permission, scope API key function.
- [`60_Error_Handling.md`](60_Error_Handling.md) — Konvensi error handling service layer dan bentuk error/return standar.
- [`70_Testing_Strategy.md`](70_Testing_Strategy.md) — Strategi testing: Vitest, Playwright, struktur `tests/`, fokus per layer.
- [`80_Deployment.md`](80_Deployment.md) — Deployment: Frontend → Vercel, Backend → Appwrite Cloud, env vars, function deploy.
- [`90_Design_System.md`](90_Design_System.md) — Pemilik design token: warna, tipografi, spacing, radius, shadow, inventaris komponen, layout dashboard.
