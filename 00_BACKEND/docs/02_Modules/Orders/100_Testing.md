# Orders — Testing

## Create Order

- Order terbuat dari accepted offer → field sesuai data offer.
- Order terbuat dari direct order paket → field sesuai data paket.
- Order tanpa offerId atau packageId → valid (salah satu boleh null).

## Deliverable

- Creator upload deliverable → version auto-increment.
- Upload berulang → version bertambah.
- File deliverable tersimpan di Storage.

## Revision

- UMKM request revision → order `revision`, revision dicatat.
- Request revisi melebihi `revisionLimit` → ditolak.
- Creator upload setelah revisi → deliverable versi baru.

## Approve

- UMKM approve → escrow release → order `completed`.
- Creator approve deliverable milik sendiri → ditolak.

## Status Flow

- Transisi status sesuai aturan: `pending_payment → escrow → in_progress → revision → approved → completed`.
- Transisi invalid (mis. pending_payment → completed) → ditolak.
