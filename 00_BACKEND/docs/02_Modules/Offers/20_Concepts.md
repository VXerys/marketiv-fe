# Offers — Concepts

## Istilah

- **Custom Offer** — penawaran khusus yang dibuat UMKM untuk Creator dalam percakapan chat.
- **Accept** — aksi Creator menyetujui offer, memicu pembuatan order.
- **Reject** — aksi Creator menolak offer.

## Status Offer

`pending → accepted | rejected`

## Konsep

- Hanya UMKM yang dapat membuat offer.
- Offer menjadi jembatan antara negosiasi (chat) dan eksekusi (order).
- Saat di-accept, sistem otomatis membuat Order dengan status `pending_payment`.
- Field offer: title, description, price, deadline, revisionLimit.
