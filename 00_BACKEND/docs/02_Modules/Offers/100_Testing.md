# Offers — Testing

## Pembuatan Offer

- Creator membuat offer dalam conversation → offer tersimpan.
- UMKM mencoba membuat offer → ditolak (hanya Creator).
- Offer dengan field wajib kosong → error validasi.

## Accept / Reject

- UMKM accept → status `accepted`, order terbuat.
- UMKM reject → status `rejected`.
- Creator accept/reject offer milik sendiri → ditolak (hanya UMKM).

## Order Creation

- Offer accepted → otomatis membuat order dengan `amount = price`.
- Order memiliki referensi `offerId` yang benar.
