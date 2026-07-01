# Orders — Overview

Order adalah **aggregate utama** alur Rate Card. Semua status transaksi dan referensi finansial (escrow, deliverable, revisi) berpusat pada order.

## Inti

- Order terbentuk dari **custom offer** yang di-accept (lihat `../Offers/`) atau dari **direct order** atas sebuah paket rate card.
- Order menggerakkan: escrow (hold dana) → deliverable (hasil kerja creator) → revisi → completion.
- Saat deliverable di-approve UMKM, escrow dirilis ke wallet creator.

## Alur

```text
Offer Accepted (atau Direct Order)
↓
Order (pending_payment)
↓
Payment Success → Escrow Hold → in_progress
↓
Creator upload Deliverable
↓
UMKM Approve → Release Escrow → completed
   atau Request Revision → revision
```

## Tautan

- Keputusan order sebagai aggregate utama → `../../04_Decisions/ADR-003.md`.
- Offer pemicu → `../Offers/`; escrow & wallet → `../Payments/`.
- Skema & relasi → `50_Database.md`.
