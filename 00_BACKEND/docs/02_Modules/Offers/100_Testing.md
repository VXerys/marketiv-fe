# Offers — Testing

## Service Layer (`offer.service.ts`)

### Pembuatan Offer (`createOffer`)

- UMKM membuat offer dalam conversation → dokumen `offers` status `pending` tersimpan.
- Creator mencoba membuat offer (`conversation.umkm_id !== user.$id`) → throw `OfferServiceError('forbidden', 'Hanya UMKM yang dapat membuat offer.')`.
- `conversationId` kosong → throw `OfferServiceError('validation', 'Conversation ID wajib diisi.')`.
- `title` kosong → throw `OfferServiceError('validation', 'Judul offer wajib diisi.')`.
- `price` bukan integer >0 → throw `OfferServiceError('validation', 'Harga harus angka > 0.')`.
- `deadline` kosong → throw `OfferServiceError('validation', 'Deadline wajib diisi.')`.
- `revisionLimit` bukan integer ≥0 → throw `OfferServiceError('validation', 'Revision limit tidak valid.')`.

### Accept / Reject (`acceptOffer`, `rejectOffer`)

- Creator (owner offer) accept → status `accepted`, memicu Appwrite Function `create-order` (bikin order `pending_payment`).
- Creator (owner offer) reject → status `rejected`.
- `offerId` kosong → throw `OfferServiceError('validation', 'Offer ID wajib diisi.')`.
- Bukan creator owner → throw `OfferServiceError('forbidden', 'Hanya creator yang dapat menerima offer.')`.
- Status bukan `pending` → throw `OfferServiceError('validation', 'Offer hanya bisa diterima saat status pending.')`.
- UMKM accept/reject offer milik sendiri → ditolak (hanya Creator).

### Order Creation (via Appwrite Function `create-order`)

- Offer accepted → otomatis membuat order dengan `amount = price`.
- Order memiliki referensi `offerId` yang benar.
