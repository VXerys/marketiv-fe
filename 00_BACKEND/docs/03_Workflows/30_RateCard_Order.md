# Workflow: Rate Card Order (Escrow)

## Purpose

Alur pesanan rate card kustom dengan escrow: UMKM menemukan creator, chat, kirim custom offer, accept → order → payment → escrow hold → deliverable → approve → release escrow ke wallet creator.

## Modules Involved

- [RateCards](../02_Modules/RateCards/00_Index.md) — discovery creator & rate card.
- [Chat](../02_Modules/Chat/00_Index.md) — percakapan UMKM ↔ creator.
- [Offers](../02_Modules/Offers/00_Index.md) — custom offer & accept/reject.
- [Orders](../02_Modules/Orders/00_Index.md) — aggregate order, deliverable, revisi.
- [Payments](../02_Modules/Payments/00_Index.md) — payment, escrow, wallet.

## Trigger

UMKM `Creator Discovery` → buka profil → lihat rate card → mulai interaksi.

## Step-by-step Flow

1. **RateCards** — UMKM browse/search/filter creator, buka profil, lihat rate card aktif.
2. **Chat** — UMKM `createConversation()` & `sendMessage()` (realtime) untuk negosiasi.
3. **Offers** — UMKM `createOffer()` (judul campaign, brief, deadline, rate card, harga, catatan). Status `pending`.
4. **Offers** — Creator review → `acceptOffer()` atau `rejectOffer()`.
5. **Event `offers.status (pending→accepted)`** memicu `create-order`.
6. **Orders** — Buat `orders` status `awaiting_payment`; **Notifications** notify UMKM.
7. **Payments** — UMKM bayar via gateway → `payments.status pending → paid`.
8. **Event `payments.status (pending→paid)`** memicu `create-escrow`: buat `escrows` (`status: locked`), `wallets.escrowBalance += amount`, order → `in_progress`.
9. **Orders** — Creator `uploadDeliverable()` (draft). Event `deliverables.create` → `notify-client-review` → notify UMKM.
10. **Orders** — UMKM review: `approveDeliverable()` atau `requestRevision()` (creator reupload → review lagi).
11. Setelah draft approved, creator posting → submit URL → system verify URL → waiting final approval → UMKM approve final.
12. **Event `deliverables.status (revision_requested→approved)`** memicu `release-escrow`.
13. **Payments** — Release escrow: `escrowBalance → 0`, saldo masuk `available` creator, buat transaction history, order → `completed`.

## Events / Functions

- `offers.status (pending→accepted)` → `create-order`
- `payments.status (pending→paid)` → `create-escrow`
- `deliverables.create` → `notify-client-review`
- `deliverables.status (revision_requested→approved)` → `release-escrow`
- Lihat: [`../02_Modules/Orders/90_Events.md`](../02_Modules/Orders/00_Index.md), [`../02_Modules/Payments/90_Events.md`](../02_Modules/Payments/00_Index.md).

## Edge Cases

- Cancel sebelum bayar → order closed langsung.
- Request cancellation setelah bayar → admin review → refund/reject.
- Revisi berulang (lihat aturan limit di [Orders](../02_Modules/Orders/00_Index.md)).
- URL gagal diverifikasi → tidak lanjut ke final approval.
- Sengketa order → lihat [60_Dispute.md](60_Dispute.md).

## Links

- [RateCards](../02_Modules/RateCards/00_Index.md)
- [Chat](../02_Modules/Chat/00_Index.md)
- [Offers](../02_Modules/Offers/00_Index.md)
- [Orders](../02_Modules/Orders/00_Index.md)
- [Payments](../02_Modules/Payments/00_Index.md)
- [Dispute workflow](60_Dispute.md)
