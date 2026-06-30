# Rate Cards — Business Rules

## Status Rate Card

`draft | published`

- Rate card dibuat sebagai `draft`.
- Hanya rate card `published` yang tampil di profil & discovery.

## Kepemilikan

- Hanya **creator** yang dapat memiliki dan mengubah rate card miliknya sendiri.
- UMKM hanya dapat membaca (read) untuk discovery & order.

## Field Wajib Paket

Setiap paket (`rate_card_packages`) **wajib** memiliki:

- `description` — deskripsi paket.
- `output` / deliverable — hasil yang didapat UMKM bila memilih paket.
- `deliveryDays` — estimasi lama hari pengerjaan.
- `price` — harga paket.
- `revisionLimit` — batas jumlah revisi.

> Sumber: `docs/notes/domain_breakdown.md` (description, output, estimasi hari). Skema field ada di `50_Database.md`.
