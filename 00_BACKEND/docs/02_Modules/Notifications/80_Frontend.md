# Notifications — Frontend

## Halaman

### Notification Center

- Daftar notifikasi user (terbaru di atas).
- Setiap item: icon type, title, message, timestamp, isRead indicator.
- Tombol "Tandai Semua Dibaca".

## Komponen

- `NotificationBell` — ikon bell di navbar dengan badge unread count.
- `NotificationDropdown` — dropdown 5 notifikasi terbaru.
- `NotificationList` — daftar lengkap notifikasi.
- `NotificationItem` — satu item notifikasi (klik → navigasi).
