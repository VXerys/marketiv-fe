# Modul Orders

Order adalah aggregate utama alur Rate Card: terbentuk dari offer (atau direct order) dan mengendalikan escrow, deliverable, revisi, dan completion. Modul ini memiliki data `orders`, `deliverables`, dan `revisions`.

## Daftar Dokumen

- `10_Overview.md` — Order sebagai pusat alur Rate Card.
- `20_Concepts.md` — Istilah & konsep domain Orders.
- `30_Business_Rules.md` — Status order, revisi, versi deliverable, approve→release escrow.
- `40_User_Flow.md` — Alur order dari pembayaran hingga completion.
- `50_Database.md` — Skema, relasi, dan index koleksi `orders`, `deliverables`, `revisions`.
- `60_API.md` — Kontrak Order Service (getOrders, uploadDeliverable, approveDeliverable, requestRevision).
- `70_Backend.md` — Appwrite Functions untuk escrow & deliverable.
- `80_Frontend.md` — Halaman & komponen order.
- `90_Events.md` — Event Offer Accepted→Order, Payment Success→Escrow, Deliverable Approved→Release Escrow.
- `100_Testing.md` — Skenario uji order, deliverable, revisi, approve.
