# Notifications — API

## Service Layer (Client SDK)

Fungsi-fungsi berikut dipanggil langsung dari frontend Next.js via **Appwrite Client SDK (Database)**. Berjalan di browser user.

---

### `getNotifications()` — [Client SDK]

- **Input**: `{ userId }`
- **Proses**: ambil daftar notifikasi milik user, urut `createdAt DESC`.
- **Akses**: Owner.

### `markAsRead()` — [Client SDK]

- **Input**: `{ notificationId }`
- **Proses**: set `isRead = true`.
- **Akses**: Owner.

### `markAllAsRead()` — [Client SDK]

- **Input**: `{ userId }`
- **Proses**: set `isRead = true` untuk seluruh notifikasi user.
- **Akses**: Owner.

---

## System (Internal)

### `createNotification()` — [Internal/System]

- Dipanggil oleh **Appwrite Functions** dari modul lain saat event terjadi.
- Input: `{ userId, title, message, type }`
- **Akses**: System only.

---

## Appwrite Functions (Server-side)

Module ini tidak memiliki REST API publik sendiri. Notifikasi dibuat oleh Appwrite Functions dari modul lain (Chat, Campaigns, Orders, Payments) yang memanggil `createNotification()` atau menulis langsung ke collection `notifications` dengan API key.

---

## Lihat Juga

- [50_Database.md](50_Database.md) — skema data
- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi
