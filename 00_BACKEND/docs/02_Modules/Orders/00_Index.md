# Modul Orders

Order adalah aggregate utama alur Rate Card: terbentuk dari offer (atau direct order) dan mengendalikan escrow, deliverable, revisi, dan completion. Modul ini memiliki data `orders`, `deliverables`, dan `revisions`.

## Daftar Dokumen

- `10_Overview.md` — Order sebagai pusat alur Rate Card.
- `30_Business_Rules.md` — Status order, revisi, versi deliverable, approve→release escrow.
- `50_Database.md` — Skema, relasi, dan index koleksi `orders`, `deliverables`, `revisions`.
- `60_API.md` — Kontrak Order Service (getOrders, uploadDeliverable, approveDeliverable, requestRevision).
- `90_Events.md` — Event Offer Accepted→Order, Payment Success→Escrow, Deliverable Approved→Release Escrow.
