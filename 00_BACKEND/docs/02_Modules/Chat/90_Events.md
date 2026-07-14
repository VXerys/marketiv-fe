# Chat — Events

## Event yang Diterbitkan

| Event | Trigger | Efek |
| --- | --- | --- |
| `messages.create` | Pesan baru dikirim | Update conversation, realtime broadcast |

## Event yang Dikonsumsi

Chat tidak mengonsumsi event dari modul lain secara langsung.

## Lihat Juga

- Pesan tipe `offer` terhubung ke modul Offers → `../Offers/90_Events.md`.
- Notifikasi chat (opsional) → `../Notifications/90_Events.md`.
