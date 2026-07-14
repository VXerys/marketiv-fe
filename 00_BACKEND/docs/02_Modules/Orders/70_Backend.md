# Orders — Backend

## Appwrite Functions

### create-escrow-on-payment

- **Trigger**: `payments.status` `pending → paid`.
- **Aksi**: buat escrow, set order `escrow`, notifikasi Creator.

### release-escrow-on-approve

- **Trigger**: `deliverables.status` → `approved`.
- **Aksi**: rilis escrow, saldo ke wallet Creator, order `completed`, catat transaksi.

## Aturan Backend

- Deliverable version di-auto-increment per upload.
- Revision hanya dapat diminta jika `jumlah revisi < revisionLimit`.
- Validasi kepemilikan: hanya UMKM terkait yang dapat approve/reject.
- Upload file deliverable disimpan di Storage bucket `deliverables`.
