# Orders — Testing

## Service Layer (`order.service.ts`)

Catatan: Order **tidak dibuat** oleh service frontend. Order dibuat oleh Appwrite Function `create-order` (trigger: `offers.status` `pending → accepted`). Service layer hanya mengelola deliverable & revision.

### Get Orders (`getOrders`)

- User login → list order di mana `umkmId === user.$id` ATAU `creatorId === user.$id`.
- Filter `status` → `Query.equal('status', ...)`.
- Default urut `Query.orderDesc('$createdAt')`, limit 50.

### Deliverable (`submit-ratecard-deliverable`)

- Caller tanpa sesi → HTTP 401.
- Method selain POST → HTTP 405.
- `orderId` kosong/tidak valid → HTTP 400; order tidak ditemukan → HTTP 404.
- Creator (owner order) upload deliverable → version auto-increment (`currentVersion + 1`), status `submitted`.
- Upload berulang → version bertambah.
- UMKM order atau Creator lain memanggil Function → HTTP 403.
- Order bukan `in_progress`/`revision` → HTTP 409.
- `source === 'storage'` tanpa `fileId` → HTTP 400; metadata tidak ditemukan → HTTP 404.
- `source === 'storage'` dengan `fileId` milik user lain → HTTP 403; file non-active atau belum memberi UMKM read → HTTP 409.
- Semua `fileUrl`, termasuk source storage, wajib URL HTTPS valid → HTTP 400.
- Submit paralel untuk versi sama memakai document ID sama; satu create berhasil, lainnya HTTP 409.
- Submit tidak mengubah status order, escrow, wallet, atau payment.
- Dokumen memberi `read` ke Creator + UMKM, `update` hanya ke UMKM.
- Collection `deliverables` tidak memberi browser `create/read/update`; direct Creator `updateDocument(..., { status: 'approved' })` ditolak Appwrite.

### Approve Deliverable (`approveDeliverable`)

- `orderId` kosong → throw `OrderServiceError('validation', 'Order ID wajib diisi.')`.
- `deliverableId` kosong → throw `OrderServiceError('validation', 'Deliverable ID wajib diisi.')`.
- UMKM (owner order) approve → deliverable status `approved`.
- Bukan owner order → throw `OrderServiceError('forbidden', 'Hanya UMKM pemilik order yang dapat menyetujui deliverable.')`.
- `deliverable.orderId !== input.orderId` → throw `OrderServiceError('validation', 'Deliverable tidak sesuai dengan order.')`.
- Deliverable sudah `approved` → throw `OrderServiceError('validation', 'Deliverable sudah disetujui.')`.
- Memicu event → Appwrite Function `release-escrow` → balance creator + transaksi `release` → order `completed`.

### Revision (`request-ratecard-revision`)

- `orderId` kosong → throw `OrderServiceError('validation', 'Order ID wajib diisi.')`.
- Caller tanpa execution identity → HTTP 401.
- Creator caller → HTTP 403; UMKM lain pada order → HTTP 404 anti-enumeration.
- UMKM owner pada order `in_progress` atau `revision` dengan latest deliverable `submitted` → revision `open`, latest deliverable `revision_requested`, order `revision`.
- Latest deliverable selain `submitted` → HTTP 409 untuk logical request baru; matching deterministic row pada `revision_requested` harus recovery 200. Ini menolak double-click tanpa memblokir siklus berikutnya setelah Creator submit v2.
- Jumlah revision rows ≥ `revisionLimit` authoritative → HTTP 409; status `open`/`resolved` sama-sama dihitung.
- Revision row hanya memberi `read` ke UMKM + Creator; tidak ada browser create/update permission.
- Timer review di order di-reset: `review_deadline_at = null`, `reminder_sent_at = null`.
- Retry setelah revision create/deliverable/order partial failure menyelesaikan missing side effect tanpa row kedua.
- Concurrent request pada latest deliverable yang sama menghasilkan satu logical revision dan satu pemakaian limit.
- Revision ID deterministik dari `orderId + latestDeliverableId`; matching row yang sedang direcover bukan duplicate error.
- `revision_count`, validation, escrow, wallet, dan payment tidak berubah; `revision_count` tetap dihitung `track-order-review` saat deliverable baru dibuat.
- v1 validation tidak berlaku untuk v2: release hanya menerima validation yang cocok dengan latest deliverable ID, order ID, version, source, dan evidence URL.
- `sync-order-revision` retired: event `revisions.rows.*.create` dilepas dan Function disabled.

## Status Flow

- Transisi status sesuai aturan: `pending_payment → escrow → in_progress → revision → approved → completed`.
- Transisi dihandle oleh Appwrite Functions (`create-escrow`, `release-escrow`), bukan service frontend.
- Transisi invalid (mis. pending_payment → completed) → ditolak.
