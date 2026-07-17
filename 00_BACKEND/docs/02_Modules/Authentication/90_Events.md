# Authentication — Events

## User Registered

```text
users.create
↓
Function: create-user-profile
↓
Create User Profile
↓
Function: create-user-wallet
↓
Create Wallet
↓
Send Welcome Notification
```

| Aspek | Detail |
| --- | --- |
| Trigger | `users.create` |
| Function | `create-user-profile` → `create-user-wallet` |
| Efek 1 | `create-user-profile` membuat profil sesuai role + `user_storage_usage` — milik [Users](../Users/70_Backend.md) |
| Efek 2 | `create-user-wallet` membuat record di `wallets` (saldo 0) — milik [Payments](../Payments/70_Backend.md) |
| Efek 3 | `create-user-wallet` mengirim Welcome Notification (`type: system`) — milik [Notifications](../Notifications/90_Events.md) |

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
