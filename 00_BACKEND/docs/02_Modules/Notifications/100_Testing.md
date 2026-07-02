# Notifications — Testing

## Pembuatan Notifikasi

- Setiap event domain yang terdaftar menghasilkan notifikasi yang sesuai.
- Notifikasi memiliki `userId` yang benar (penerima tepat).
- Notifikasi untuk user yang tidak ada → error (atau diabaikan).

## Status Baca

- Notifikasi baru memiliki `isRead = false`.
- `markAsRead()` → `isRead = true`.
- `markAllAsRead()` → semua notifikasi user terbaca.
- Unread count akurat.

## Pengiriman

- In-App notification muncul di notification center.
- Email notification terkirim ke alamat email penerima.
