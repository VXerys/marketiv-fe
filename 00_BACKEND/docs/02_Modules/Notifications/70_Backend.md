# Notifications — Backend

Dokumen ini khusus untuk Appwrite Functions dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Functions

### send-notification

- **Trigger**: `notifications.create`.
- **Proses**: baca data notifikasi → kirim in-app (via Realtime/query) + kirim email/push sesuai tipe event.
- **Kanal**:
  - In-App: user melihat di notification center.
  - Email: dikirim ke alamat email user untuk event non-chat yang membutuhkan email.
  - Push: dikirim via Appwrite Messaging untuk chat dan event realtime penting jika user punya target push.
- **Catatan**: **Belum diimplementasikan** — kode function belum dibuat di `functions/send-notification/`.

### send-chat-notification

- **Trigger**: `messages.create` dari modul Chat.
- **Proses**: buat record `notifications` untuk penerima chat dan kirim Appwrite Messaging push ke user penerima.
- **Ketahanan**: kegagalan push tidak membatalkan record notifikasi in-app.

## Arsitektur

```text
Modul X → notifications.create
↓
Function: send-notification (future) / send-chat-notification
↓
In-App + Email/Push
```

## Integrasi Eksternal

- **SMTP / Email Service** — untuk pengiriman email notifikasi.
- **Appwrite Messaging** — untuk push notification, terutama pesan chat baru.
- **WhatsApp** — future, belum diimplementasikan di MVP.
