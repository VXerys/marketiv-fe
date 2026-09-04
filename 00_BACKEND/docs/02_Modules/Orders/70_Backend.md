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

### request-ratecard-revision

- **Trigger**: POST sinkron dari frontend; executable `users`.
- **Authorization**: caller hanya dari `x-appwrite-user-id`; profile harus UMKM aktif dan `orders.umkmId` harus sama dengan caller. UMKM lain menerima 404 anti-enumeration; Creator menerima 403.
- **State**: order harus `in_progress` atau `revision`, dan latest deliverable harus `submitted`. Guard ini menolak double-click setelah latest menjadi `revision_requested`, tetapi membuka siklus baru setelah Creator mengirim versi berikutnya.
- **Aksi**: hitung total revision rows terhadap limit dari order/offer/package, create revision server-side dengan `read` UMKM + Creator, set latest deliverable `revision_requested`, set order `revision`, reset `review_deadline_at` dan `reminder_sent_at`.
- **Invariant**: tidak menulis `revision_count`, validation, escrow, wallet, atau payment. `revision_count` tetap dihitung `track-order-review` saat deliverable baru dibuat.
- **Scope**: `documents.read`, `documents.write`.

### sync-order-revision (retired)

- Tidak lagi dipicu `revisions.rows.*.create`.
- Function disabled; source dipertahankan sebagai historical audit.
- Tidak boleh menjadi writer transition revision.

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
- Revision hanya dapat diminta jika `jumlah revisi < revisionLimit` dan latest deliverable berstatus `submitted`.
- Validasi kepemilikan: hanya UMKM terkait yang dapat approve/reject.
- Deliverable `source = storage` wajib memiliki `fileId` yang valid dan milik creator seller.
- Deliverable `source = external_url` wajib protokol `https`.
- **Metadata Transparansi AI & Kreditasi**: Field `creatorCredit` dan `aiGenerated` pada `deliverables` merupakan metadata murni yang diisi oleh klien. Tidak ada validasi server maupun *guard* yang memblokir alur berdasarkan field ini.

## Functions
- `track-order-review`: Tracks deliverables and sets `review_deadline_at`; re-reads latest deliverable and no-ops when a synchronous revision request already marked it `revision_requested`, preventing a late event from overwriting order state or restarting the timer.
- `auto-approve-orders`: Cron function to auto-approve orders past deadline.
