# Offers — User Flow

## Alur Creator → UMKM

```text
Creator & UMKM berdiskusi di Chat
↓
Creator klik "Buat Offer"
↓
Isi detail: title, description, price, deadline, revisionLimit
↓
Offer terkirim sebagai pesan tipe `offer` di chat
↓
UMKM melihat offer di chat
├─ Accept → Order dibuat (pending_payment)
└─ Reject → Offer ditolak
```
