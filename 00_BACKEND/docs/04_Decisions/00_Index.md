# 04_Decisions — Index

Folder ini berisi Architecture Decision Records (ADR) yang menjelaskan **WHY** di balik keputusan arsitektur Marketiv. Setiap ADR berformat: Status, Context, Decision, Consequences.

## Daftar ADR

- [ADR-001.md](ADR-001.md) — Pakai Appwrite BaaS, bukan backend custom (kecepatan; auth/storage/realtime/functions built-in).
- [ADR-002.md](ADR-002.md) — Service layer wajib (Route/Component → Service → SDK; jangan panggil SDK dari komponen route).
- [ADR-003.md](ADR-003.md) — `orders` sebagai aggregate utama alur Rate Card (Offer tidak mengelola Escrow langsung).
- [ADR-004.md](ADR-004.md) — Pisahkan `fraud_checks` dari `campaign_submissions` (histori fraud & ekspansi Phase 2).
- [ADR-005.md](ADR-005.md) — Simpan counter denormalisasi di `campaigns` (dashboard cepat).
- [ADR-006.md](ADR-006.md) — Pakai Zustand, bukan Redux (lebih ringan, tanpa boilerplate).
- [ADR-007.md](ADR-007.md) — Minimum withdraw dipasang sebagai konstanta sistem `Rp50.000` (hardcode di Function; tanpa UI admin).
- [ADR-008.md](ADR-008.md) — Platform fee 5% dari buyer side (UMKM) untuk Rate Card Order dan Campaign Top-Up.
- [ADR-009.md](ADR-009.md) — Minimum budget campaign Rp50.000 agar reward creator layak.
