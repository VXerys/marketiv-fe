# Chat — Frontend

## Halaman

### Chat List (Inbox)

- Daftar percakapan milik user, difilter lewat public DTO `isArchived = false`.
- Tampilkan: nama lawan bicara, lastMessage, dan waktu pesan terakhir.
- Urut berdasarkan `lastMessageAt` DESC.
- Setiap item chat memiliki tombol **Arsipkan** (icon/action) untuk memindahkan ke tab Arsip.

### Tab Arsip

- Daftar percakapan yang sudah diarsipkan menurut public DTO `isArchived = true`.
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

- Layar negosiasi UMKM memakai `get-umkm-negotiations`; layar Creator memakai `get-creator-negotiations`.
- Kedua Function mengembalikan `isArchived` tanpa mengekspos `umkm_archived` atau `creator_archived`.
- Filter inbox/arsip dilakukan di klien terhadap public DTO `isArchived`.

### `setConversationArchived(conversationId, archived)`

- Panggil trusted Function `patch-conversation-archive` dengan `{ conversationId, isArchived: archived }`.
- Jangan memanggil browser `updateDocument` untuk collection `conversations`.
- Update state lokal tanpa reload halaman.
