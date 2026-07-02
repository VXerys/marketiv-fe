# 04_Decisions — Index

Folder ini berisi Architecture Decision Records (ADR) yang menjelaskan **WHY** di balik keputusan arsitektur Marketiv. Setiap ADR berformat: Status, Context, Decision, Consequences.

## Daftar ADR

- [ADR-001.md](ADR-001.md) — Pakai Appwrite BaaS, bukan backend custom (kecepatan; auth/storage/realtime/functions built-in).
- [ADR-002.md](ADR-002.md) — Service layer wajib (Route/Component → Service → SDK; jangan panggil SDK dari komponen route).
- [ADR-003.md](ADR-003.md) — `orders` sebagai aggregate utama alur Rate Card (Offer tidak mengelola Escrow langsung).
- [ADR-004.md](ADR-004.md) — Pisahkan `fraud_checks` dari `campaign_submissions` (histori fraud & ekspansi Phase 2).
- [ADR-005.md](ADR-005.md) — Simpan counter denormalisasi di `campaigns` (dashboard cepat).
- [ADR-006.md](ADR-006.md) — Pakai Zustand, bukan Redux (lebih ringan, tanpa boilerplate).
