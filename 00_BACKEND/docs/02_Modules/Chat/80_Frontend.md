# Chat — Frontend

## Halaman

### Chat List

- Daftar percakapan milik user.
- Tampilkan: nama lawan bicara, lastMessage, waktu, unread badge.
- Urut berdasarkan `lastMessageAt` DESC.

### Chat Room

- Riwayat pesan (infinite scroll / pagination).
- Input pesan dengan opsi: text, image, file.
- Tombol "Buat Offer" (khusus Creator).
- Real-time update saat pesan baru masuk.

## Komponen

- `ConversationList` — sidebar daftar chat.
- `MessageBubble` — bubble pesan dengan tipe (text/image/file/offer/system).
- `ChatInput` — input dengan attachment picker.
- `OfferMessageCard` — kartu offer di dalam chat (tap untuk detail).
