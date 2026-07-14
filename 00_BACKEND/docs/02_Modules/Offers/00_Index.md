# Modul Offers

Custom offer (penawaran khusus) yang dibuat creator di dalam sebuah percakapan untuk menyepakati harga, deadline, dan batas revisi. Saat di-accept, offer memicu pembuatan order. Modul ini memiliki data `offers`.

## Daftar Dokumen

- `10_Overview.md` — Gambaran custom offer dalam percakapan.
- `20_Concepts.md` — Istilah & konsep domain Offers.
- `30_Business_Rules.md` — Status offer, field, dan aturan accept→create order.
- `40_User_Flow.md` — Alur pembuatan offer hingga order.
- `50_Database.md` — Skema, relasi (ke conversation/creator/umkm), dan index koleksi `offers`.
- `60_API.md` — Kontrak Offer Service (createOffer, acceptOffer, rejectOffer).
- `70_Backend.md` — Appwrite Functions & validasi backend.
- `80_Frontend.md` — Komponen UI Offer (form, card, badge).
- `90_Events.md` — Event Offer Accepted → Create Order.
- `100_Testing.md` — Skenario uji pembuatan, accept, reject, order creation.
