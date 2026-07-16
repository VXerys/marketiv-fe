# Orders — Testing

## Service Layer (`order.service.ts`)

Catatan: Order **tidak dibuat** oleh service frontend. Order dibuat oleh Appwrite Function `create-order` (trigger: `offers.status` `pending → accepted`). Service layer hanya mengelola deliverable & revision.

### Get Orders (`getOrders`)

- User login → list order di mana `umkmId === user.$id` ATAU `creatorId === user.$id`.
- Filter `status` → `Query.equal('status', ...)`.
- Default urut `Query.orderDesc('$createdAt')`, limit 50.

### Deliverable (`uploadDeliverable`)

- `orderId` kosong → throw `OrderServiceError('validation', 'Order ID wajib diisi.')`.
- Creator (owner order) upload deliverable → version auto-increment (`currentVersion + 1`), status `submitted`.
- Upload berulang → version bertambah.
- Bukan owner order → throw `OrderServiceError('forbidden', 'Hanya creator pemilik order yang dapat mengunggah deliverable.')`.
- `source === 'storage'` tanpa `fileId` → throw `OrderServiceError('validation', 'fileId wajib diisi untuk source storage.')`.
- `source === 'storage'` dengan `fileId` milik user lain → throw `OrderServiceError('forbidden', 'File harus milik kamu.')`.
- `source === 'external_url'` tanpa `https://` → throw `OrderServiceError('validation', 'External URL harus menggunakan protokol HTTPS.')`.
- Order status berubah ke `in_progress` jika belum.

### Approve Deliverable (`approveDeliverable`)

- `orderId` kosong → throw `OrderServiceError('validation', 'Order ID wajib diisi.')`.
- `deliverableId` kosong → throw `OrderServiceError('validation', 'Deliverable ID wajib diisi.')`.
- UMKM (owner order) approve → deliverable status `approved`.
- Bukan owner order → throw `OrderServiceError('forbidden', 'Hanya UMKM pemilik order yang dapat menyetujui deliverable.')`.
- `deliverable.orderId !== input.orderId` → throw `OrderServiceError('validation', 'Deliverable tidak sesuai dengan order.')`.
- Deliverable sudah `approved` → throw `OrderServiceError('validation', 'Deliverable sudah disetujui.')`.
- Memicu event → Appwrite Function `release-escrow` → balance creator + transaksi `release` → order `completed`.

### Revision (`requestRevision`)

- `orderId` kosong → throw `OrderServiceError('validation', 'Order ID wajib diisi.')`.
- UMKM (owner order) request revision → dokumen `revisions` status `open`, order `revision`.
- Bukan owner → throw `OrderServiceError('forbidden', 'Hanya UMKM pemilik order yang dapat meminta revisi.')`.
- Order tidak dalam status `in_progress`/`revision` → throw `OrderServiceError('validation', 'Order tidak dalam status yang dapat direvisi.')`.
- Jumlah revision ≥ `revisionLimit` (dari offer atau package) → throw `OrderServiceError('validation', 'Batas revisi ... telah tercapai.')`.
- `revisionLimit` default 3 jika tidak ada offer/package.

## Status Flow

- Transisi status sesuai aturan: `pending_payment → escrow → in_progress → revision → approved → completed`.
- Transisi dihandle oleh Appwrite Functions (`create-escrow`, `release-escrow`), bukan service frontend.
- Transisi invalid (mis. pending_payment → completed) → ditolak.
