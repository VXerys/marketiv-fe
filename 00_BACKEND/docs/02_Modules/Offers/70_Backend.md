# Offers — Backend

Dokumen ini khusus untuk Appwrite Functions dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Functions

### create-order

- **Trigger**: `offers.status` `pending → accepted`.
- **Aksi**: buat dokumen `orders` (status `pending_payment`), notifikasi UMKM untuk pembayaran.

## Aturan Backend

- Validasi: hanya UMKM yang dapat membuat offer.
- Validasi: hanya Creator (peserta percakapan) yang dapat accept/reject.
- Saat accept, value `price` dari offer digunakan sebagai `amount` order.
