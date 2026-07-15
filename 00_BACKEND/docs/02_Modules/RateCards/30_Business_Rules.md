# Rate Cards — Business Rules

## Status Rate Card

`draft | published`

**Draft:**
- Status awal saat rate card dibuat.
- Rate card dapat diedit (title, description, packages).
- **Tidak tampil** di profil Creator & discovery UMKM.
- Creator dapat menyimpan draft tanpa wajib memiliki paket.

**Published:**
- Transisi dari draft → published via aksi "Publish" oleh creator.
- **Syarat publish:** minimal 1 paket telah ditambahkan.
- Setelah published, rate card **tampil** di profil Creator & discovery UMKM.
- Creator masih bisa mengedit rate card yang sudah published (paket bisa ditambah/diubah).
- Tidak ada mekanisme auto-publish; publish selalu manual oleh creator.

## Kepemilikan

- Hanya **creator** yang dapat memiliki dan mengubah rate card miliknya sendiri.
- UMKM hanya dapat membaca (read) untuk discovery & order.

## Platform Fee

Fee platform **5%** dipotong dari pendapatan creator saat escrow release.

```text
UMKM bayar: hargaPaket (sesuai rate card)
Creator terima: hargaPaket - floor(hargaPaket × 5%)
Platform: floor(hargaPaket × 5%) sebagai fee
```

- UMKM membayar **persis sesuai harga paket** — tidak ada biaya tambahan.
- Creator menerima harga paket **dikurangi fee 5%**.
- Fee dicatat sebagai transaksi `fee` di ledger.
- Creator perlu mempertimbangkan fee 5% saat menentukan harga paket rate card.

## Field Wajib Paket

Setiap paket (`rate_card_packages`) **wajib** memiliki:

- `description` — deskripsi paket.
- `output` / deliverable — hasil yang didapat UMKM bila memilih paket.
- `deliveryDays` — estimasi lama hari pengerjaan.
- `price` — harga paket.
- `revisionLimit` — batas jumlah revisi.

> Sumber: `docs/notes/domain_breakdown.md` (description, output, estimasi hari). Skema field ada di `50_Database.md`.
