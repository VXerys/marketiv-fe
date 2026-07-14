# Notifications — Events

Notifikasi tidak memicu event; ia **dipicu** oleh event domain dari modul lain. Tabel berikut memetakan event → modul sumber. Detail event ada di modul sumber (tidak diduplikasi di sini).

| Event Domain | Modul Sumber | Penerima | Contoh Notifikasi |
| --- | --- | --- | --- |
| User Registered (`users.create`) | [Authentication](../Authentication/90_Events.md) | User baru | "Selamat datang di Marketiv" |
| Campaign Published | Campaigns | Eligible creators | "Campaign baru tersedia" |
| Campaign Claimed | Campaigns | UMKM pemilik | Creator mengklaim campaign |
| Offer Received | Offers | Creator | Offer baru masuk |
| Offer Accepted | Offers | UMKM | Offer diterima → order dibuat |
| Payment Success | Payments | UMKM/Creator | Pembayaran berhasil / escrow terkunci |
| Submission Created | Campaigns / AI | UMKM | Submission masuk untuk direview |
| Revision Requested | Orders | Creator | UMKM minta revisi |
| Submission/Deliverable Approved | Orders / Campaigns | Creator | Hasil disetujui |
| Withdraw (requested/approved/rejected) | Payments | Creator | Status penarikan dana |

## Pola Implementasi

```text
Domain event di modul X
↓
buat record di `notifications`  (notifications.create)
↓
Function send-notification → kirim In-App + Email
```

## Lihat Juga

- [Authentication/90_Events.md](../Authentication/90_Events.md) — welcome notification saat register.
- Skema record: [50_Database.md](50_Database.md).
