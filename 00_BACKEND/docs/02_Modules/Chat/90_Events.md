# Chat — Events

## Event yang Diterbitkan

| Event | Trigger | Efek |
| --- | --- | --- |
| `messages.create` | Pesan baru dikirim | Update conversation, realtime broadcast, buat notifikasi chat |

## Event yang Dikonsumsi

Chat tidak mengonsumsi event dari modul lain secara langsung.

## Integrasi Notifications

`messages.create` memicu function `send-chat-notification` untuk membuat record `notifications` penerima dan mengirim push notification lewat Appwrite Messaging jika target push tersedia.

## Lihat Juga

- Pesan tipe `offer` terhubung ke modul Offers → `../Offers/90_Events.md`.
- Notifikasi chat (opsional) → `../Notifications/90_Events.md`.
