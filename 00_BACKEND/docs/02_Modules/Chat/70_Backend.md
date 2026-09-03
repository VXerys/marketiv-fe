# Chat — Backend

Dokumen ini khusus untuk Appwrite Functions, Realtime, dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Realtime

- Subscriber UI mendengarkan channel `conversations.{id}.messages`.
- Saat `messages.create`, event realtime dikirim ke seluruh participant.

## Appwrite Functions

### send-chat-notification

- **Trigger**: `messages.create`.
- **Aksi**: identifikasi penerima dari `conversations.umkm_id`/`creator_id`, buat record `notifications`, lalu kirim push notification via Appwrite Messaging jika user memiliki target push.
- **Catatan**: isi percakapan tetap bersumber dari collection `messages`; Messaging hanya kanal notifikasi.

### patch-conversation-archive

- **Trigger**: eksekusi authenticated dari frontend dengan `{ conversationId, isArchived }`.
- **Otorisasi**: caller diambil dari header Appwrite authoritative; role dari frontend tidak diterima.
- **Aksi UMKM**: update hanya `conversations.umkm_archived`.
- **Aksi Creator**: update hanya `conversations.creator_archived`.
- **Non-participant**: `404`, tanpa mutasi.
- **Keamanan**: conversation row hanya memberi participant read permission. Mutasi archive berjalan dengan dynamic Function key dan scope `documents.read`/`documents.write`.
- **Non-efek**: tidak menghapus data dan tidak mengubah messages, offers, orders, escrow, atau state bisnis.

## Read Receipt

- Read receipt diimplementasikan via client-side: saat user membuka chat room, panggil `markConversationAsRead(conversationId)` yang mengupdate field `read_at` pada semua pesan dari lawan bicara yang belum dibaca.
- Tidak ada Appwrite Function khusus untuk read receipt — murni operasi database dari client.

## Aturan Backend

- Validasi participant: hanya UMKM & creator yang terlibat dapat mengirim/membaca pesan.
- Unique constraint `umkm_id + creator_id` pada conversation.
- `is_archived` deprecated; `umkm_archived` dan `creator_archived` authoritative sesuai sisi pembaca.
- Tipe `offer`: validasi bahwa pengirim adalah UMKM dan `offerId` merujuk offer dalam conversation yang sama.
- Tipe pesan hanya: `text`, `offer`, `system`.
