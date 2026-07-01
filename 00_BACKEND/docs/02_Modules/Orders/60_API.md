# Orders — API

Kontrak Order Service. Skema di `50_Database.md`; aturan di `30_Business_Rules.md`.

---

## Order Service

### getOrders()

- **Input**: `{ umkmId }` (dashboard UMKM) atau `{ creatorId }` (dashboard creator).
- **Proses**: list order milik user terkait.
- **Akses**: Buyer / Seller (own) · Admin.

### uploadDeliverable()

- **Input**: `{ orderId, fileUrl, notes? }`
- **Proses**: buat dokumen `deliverables` (versi berikutnya, `status = submitted`); set order `in_progress`. Notify UMKM untuk review.
- **Akses**: Creator (seller).

### approveDeliverable()

- **Input**: `{ orderId, deliverableId }`
- **Proses**: set deliverable `approved` → **release escrow** → saldo masuk wallet creator → order `completed`.
- **Akses**: UMKM (buyer).
- **Link**: escrow release via function `release-escrow` (lihat `90_Events.md` & `../Payments/`).

### requestRevision()

- **Input**: `{ orderId, message }`
- **Proses**: buat dokumen `revisions` (`status = open`); set order `revision`. Creator mengunggah deliverable versi berikutnya.
- **Akses**: UMKM (buyer).

> Pembayaran & escrow ditangani modul Payments (functions `create-escrow`/`release-escrow`) — lihat `90_Events.md`.
