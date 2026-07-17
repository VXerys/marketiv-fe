# Notifications — User Flow

## Menerima Notifikasi

```text
Event terjadi di modul lain (mis. Campaign Published)
↓
notifications.create (by system)
↓
Function send-notification (future — belum diimplementasikan)
├─ In-App: muncul di notification center
└─ Email: terkirim ke email penerima
```

## Membaca Notifikasi

```text
User buka Notification Center
↓
Lihat daftar notifikasi (terbaru di atas)
↓
Klik notifikasi → navigasi ke halaman terkait
↓
Notifikasi otomatis ditandai isRead = true
```
