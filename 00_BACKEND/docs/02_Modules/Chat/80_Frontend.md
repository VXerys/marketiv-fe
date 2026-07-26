# Chat — Frontend

## Halaman

### Chat List

- Daftar percakapan milik user.
- Tampilkan: nama lawan bicara, lastMessage, dan waktu pesan terakhir.
- Urut berdasarkan `lastMessageAt` DESC.

### Chat Room

- Riwayat pesan (infinite scroll / pagination).
- Input pesan teks.
- Tombol "Buat Offer" (khusus UMKM).
- Real-time update saat pesan baru masuk.
- Read receipt: tampilkan indikator "Sudah dibaca" pada pesan milik pengirim.

## Komponen

- `ConversationList` — sidebar daftar chat.
- `MessageBubble` — bubble pesan dengan tipe (text/offer/system) + indikator read receipt.
- `ChatInput` — input pesan teks + tombol offer.
- `OfferMessageCard` — kartu offer di dalam chat (tap untuk detail).
