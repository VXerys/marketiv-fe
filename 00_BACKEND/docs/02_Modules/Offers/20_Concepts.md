# Offers — Concepts

## Istilah

- **Custom Offer** — penawaran khusus yang dibuat Creator untuk UMKM dalam percakapan chat.
- **Accept** — aksi UMKM menyetujui offer, memicu pembuatan order.
- **Reject** — aksi UMKM menolak offer.

## Status Offer

`pending → accepted | rejected`

## Konsep

- Hanya Content Creator yang dapat membuat offer.
- Offer menjadi jembatan antara negosiasi (chat) dan eksekusi (order).
- Saat di-accept, sistem otomatis membuat Order dengan status `pending_payment`.
- Field offer: title, description, price, deadline, revisionLimit.
