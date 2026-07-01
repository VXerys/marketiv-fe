# Modul Offers

Custom offer (penawaran khusus) yang dibuat creator di dalam sebuah percakapan untuk menyepakati harga, deadline, dan batas revisi. Saat di-accept, offer memicu pembuatan order. Modul ini memiliki data `offers`.

## Daftar Dokumen

- `10_Overview.md` — Gambaran custom offer dalam percakapan.
- `30_Business_Rules.md` — Status offer, field, dan aturan accept→create order.
- `50_Database.md` — Skema, relasi (ke conversation/creator/umkm), dan index koleksi `offers`.
- `60_API.md` — Kontrak Offer Service (createOffer, acceptOffer, rejectOffer).
- `90_Events.md` — Event Offer Accepted → Create Order.
