# Offers — User Flow

## Alur UMKM → Creator

```text
Creator & UMKM berdiskusi di Chat
↓
UMKM klik "Buat Offer"
↓
Isi detail: title, description, price, deadline, revisionLimit
↓
Offer terkirim sebagai pesan tipe `offer` di chat
↓
Creator melihat offer di chat
├─ Accept → Order dibuat (pending_payment)
└─ Reject → Offer ditolak
```
