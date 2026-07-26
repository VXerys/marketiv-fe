# Chat — Frontend

## Halaman

### Chat List (Inbox)

- Daftar percakapan milik user, difilter hanya yang `is_archived = false`.
- Tampilkan: nama lawan bicara, lastMessage, dan waktu pesan terakhir.
- Urut berdasarkan `lastMessageAt` DESC.
- Setiap item chat memiliki tombol **Arsipkan** (icon/action) untuk memindahkan ke tab Arsip.

### Tab Arsip

- Daftar percakapan yang sudah diarsipkan (`is_archived = true`).
- Tampilan dan urutan sama dengan inbox.
- Setiap item chat memiliki tombol **Batalkan Arsip** untuk mengembalikan ke inbox.

### Chat Room

- Riwayat pesan (infinite scroll / pagination).
- Input pesan teks.
- Tombol "Buat Offer" (khusus UMKM).
- Real-time update saat pesan baru masuk.
- Read receipt: tampilkan indikator "Sudah dibaca" pada pesan milik pengirim.

## Komponen

- `ConversationList` — sidebar daftar chat (mendukung filter inbox/arsip).
- `MessageBubble` — bubble pesan dengan tipe (text/offer/system) + indikator read receipt.
- `ChatInput` — input pesan teks + tombol offer.
- `OfferMessageCard` — kartu offer di dalam chat (tap untuk detail).
- `ArchiveToggleButton` — tombol arsip/batal arsip pada item daftar chat.

## Service

### `getMyConversations()`

- Query `conversations` langsung via Appwrite SDK untuk kedua role (UMKM & Kreator).
- Hasil dijodohkan dengan daftar negosiasi (di-key oleh `orderId`) via constraint `umkmId + creatorId`.
- Mengembalikan semua percakapan milik user (inbox + arsip). Filter arsip dilakukan di klien.

### `setConversationArchived(conversationId, archived)`

- Panggil `archiveConversation` atau `unarchiveConversation` tergantung nilai `archived`.
- Update state lokal tanpa reload halaman.
