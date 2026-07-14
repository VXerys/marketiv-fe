# Chat — Concepts

## Istilah

- **Conversation** — ruang chat antara satu UMKM dan satu Content Creator.
- **Realtime** — mekanisme pengiriman pesan instan via Appwrite Realtime tanpa polling.
- **Message Type** — tipe pesan: `text`, `image`, `file`, `offer`, `system`.
- **Attachment** — lampiran (image/file) yang disimpan di Storage bucket `chat-files`.

## Konsep

- Satu percakapan per pasangan UMKM+Creator (unique constraint).
- Pesan `offer` merujuk ke custom offer di modul Offers.
- Pesan `system` dibuat otomatis oleh sistem (bukan user).
- Denormalisasi `lastMessage` dan `unreadCount` pada conversation untuk performa.
