# Notifications — API

Kontrak Notification Service. Skema di `50_Database.md`; aturan di `30_Business_Rules.md`.

---

## Notification Service

### getNotifications()

- **Input**: `{ userId }`
- **Proses**: ambil daftar notifikasi milik user, urut `createdAt DESC`.
- **Akses**: Owner.

### markAsRead()

- **Input**: `{ notificationId }`
- **Proses**: set `isRead = true`.
- **Akses**: Owner.

### markAllAsRead()

- **Input**: `{ userId }`
- **Proses**: set `isRead = true` untuk seluruh notifikasi user.
- **Akses**: Owner.

---

## System (Internal)

### createNotification()

- Dipanggil oleh function dari modul lain saat event terjadi.
- Input: `{ userId, title, message, type }`
- **Akses**: System only.
