# Notifications — Overview

## Ringkasan

- Menyampaikan pemberitahuan ke pengguna lewat kanal **in-app** dan **email**.
- Bersifat reaktif: dipicu oleh event domain dari modul lain (Auth, Offers, Payments, Orders, Campaigns, AI), bukan diinisiasi sendiri.
- Rencana: memakai satu function global `send-notification` agar tiap function tidak mengirim notifikasi secara terpisah. (Belum diimplementasikan)

## Collection yang Dimiliki

- `notifications` — lihat [50_Database.md](50_Database.md).

## Arsitektur

```text
Domain Event (modul lain)
↓
notifications.create
↓
Function: send-notification (future — belum diimplementasikan)
↓
Kanal: In-App + Email   (WhatsApp / Push = future)
```

## Lihat Juga

- [90_Events.md](90_Events.md) — daftar event sumber notifikasi.
