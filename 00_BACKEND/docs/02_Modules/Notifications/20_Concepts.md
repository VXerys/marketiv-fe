# Notifications — Concepts

## Istilah

- **In-App Notification** — notifikasi yang muncul di notification center aplikasi.
- **Email Notification** — notifikasi yang dikirim ke email pengguna.
- **Trigger Event** — event domain dari modul lain yang memicu pembuatan notifikasi.
- **send-notification** — function global yang mengirim notifikasi ke seluruh kanal (future — belum diimplementasikan).

## Konsep

- Notifikasi bersifat reaktif (dipicu event), tidak pernah diinisiasi sendiri.
- Satu service global mencegah duplikasi pengiriman dari multiple functions.
- Setiap notifikasi memiliki flag `isRead` untuk status baca.
- Di MVP: in-app + email; WhatsApp & Push = future.
