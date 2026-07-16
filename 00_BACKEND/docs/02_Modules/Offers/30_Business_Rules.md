# Offers — Business Rules

## Status Offer

`pending | accepted | rejected`

- Offer dibuat sebagai `pending`.
- Creator dapat `accept` → status `accepted`, memicu pembuatan order.
- Creator dapat `reject` → status `rejected`.

## Kepemilikan

- Hanya **UMKM** yang dapat membuat custom offer.
- Hanya **Content Creator** (peserta percakapan) yang dapat accept/reject.

## Field

Setiap offer memiliki:

- `title` — judul penawaran.
- `description` — detail pekerjaan.
- `price` — harga yang disepakati.
- `deadline` — tenggat pengerjaan.
- `revisionLimit` — batas jumlah revisi.

## Accept → Create Order

- Saat status berubah `pending → accepted`, sistem membuat **order** baru (status awal `pending_payment`).
- Order menjadi aggregate utama alur selanjutnya (escrow, deliverable, revisi). Lihat `../Orders/` dan `../../04_Decisions/ADR-003.md`.
- Detail event ada di `90_Events.md`.
