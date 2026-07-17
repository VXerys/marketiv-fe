# Chat — Concepts

## Istilah

- **Conversation** — ruang chat antara satu UMKM dan satu Content Creator.
- **Realtime** — mekanisme pengiriman pesan instan via Appwrite Realtime tanpa polling.
- **Message Type** — tipe pesan MVP: `text`, `offer`, `system`.
- **Read Receipt** — timestamp saat penerima membaca pesan, ditampilkan sebagai indikator "Sudah dibaca".

## Konsep

- Satu percakapan per pasangan UMKM+Creator (unique constraint).
- Pesan `offer` merujuk ke custom offer di modul Offers.
- Pesan `system` dibuat otomatis oleh sistem (bukan user).
- Denormalisasi `lastMessage` pada conversation untuk performa daftar chat.
- Read receipt diupdate otomatis saat penerima membuka chat room.
