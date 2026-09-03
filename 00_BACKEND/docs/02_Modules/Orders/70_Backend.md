# Orders — Backend

Dokumen ini khusus untuk Appwrite Functions dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Functions

### create-escrow

- **Trigger**: `payments.status` `pending → paid`.
- **Aksi**: buat escrow, set order `escrow`, notifikasi Creator.

### release-escrow

- **Trigger**: `deliverables.status` → `approved`.
- **Aksi**: rilis escrow, saldo ke wallet Creator, order `completed`, catat transaksi.

### submit-ratecard-deliverable

- **Trigger**: POST sinkron dari frontend melalui Appwrite Functions SDK; executable `users`.
- **Authorization**: caller berasal dari `x-appwrite-user-id`, bukan request body; harus sama dengan `orders.creatorId`.
- **State**: order hanya `in_progress` atau `revision`.
- **Aksi**: validasi URL HTTPS/file ownership + share permission UMKM, baca versi terbaru, create deliverable `submitted` dengan `version + 1` memakai dynamic API key.
- **Concurrency**: document ID deterministik dari `(orderId, version)` mengubah race versi menjadi conflict 409.
- **Permission dokumen**: Creator `read`; UMKM order `read` + `update`; tanpa `update` Creator.
- **Scope**: `documents.read`, `documents.write`.
- **Tidak menyentuh**: approval, order status, escrow, wallet, payment.

## Backend Helpers

### uploadDeliverable

- **Trigger**: wrapper frontend memanggil `submit-ratecard-deliverable`.
- **Aksi**:
  - Jika `source = storage`: panggil File Manager (`Users/validate-and-upload`) hanya dengan file, lalu catat `fileId` di deliverable.
  - Jika `source = external_url`: simpan URL langsung, tidak terikat kuota.
  - Buat deliverable dengan version auto-increment.
- **Catatan**: create deliverable bukan lagi mutation Database SDK dari browser.

## Aturan Backend

- Deliverable version di-auto-increment per upload.
- Revision hanya dapat diminta jika `jumlah revisi < revisionLimit`.
- Validasi kepemilikan: hanya UMKM terkait yang dapat approve/reject.
- Deliverable `source = storage` wajib memiliki `fileId` yang valid dan milik creator seller.
- Deliverable `source = external_url` wajib protokol `https`.
- **Metadata Transparansi AI & Kreditasi**: Field `creatorCredit` dan `aiGenerated` pada `deliverables` merupakan metadata murni yang diisi oleh klien. Tidak ada validasi server maupun *guard* yang memblokir alur berdasarkan field ini.

## Functions
- `track-order-review`: Tracks deliverables and sets review_deadline_at.
- `auto-approve-orders`: Cron function to auto-approve orders past deadline.
