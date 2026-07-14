# Authentication — Events

## User Registered

```text
users.create
↓
Function: create-user-wallet
↓
Create Wallet
↓
Create User Profile
↓
Send Welcome Notification
```

| Aspek | Detail |
| --- | --- |
| Trigger | `users.create` |
| Function | `create-user-wallet` |
| Efek 1 | Membuat record di `wallets` (saldo 0) — milik [Payments] |
| Efek 2 | Mengirim Welcome Notification (`type: system`) — milik [Notifications](../Notifications/90_Events.md) |

Contoh notifikasi welcome:

```json
{
  "userId": "user_xxx",
  "title": "Selamat datang di Marketiv",
  "type": "system"
}
```

## Lihat Juga

- [Notifications/90_Events.md](../Notifications/90_Events.md) — daftar lengkap event yang memicu notifikasi.
- Skema `wallets` & `notifications` ada di modul pemiliknya (Payments, Notifications).
