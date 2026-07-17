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

## Read Receipt

- Read receipt diimplementasikan via client-side: saat user membuka chat room, panggil `markConversationAsRead(conversationId)` yang mengupdate field `read_at` pada semua pesan dari lawan bicara yang belum dibaca.
- Tidak ada Appwrite Function khusus untuk read receipt — murni operasi database dari client.

## Aturan Backend

- Validasi participant: hanya UMKM & creator yang terlibat dapat mengirim/membaca pesan.
- Unique constraint `umkm_id + creator_id` pada conversation.
- Tipe `offer`: validasi bahwa pengirim adalah UMKM dan `offerId` merujuk offer dalam conversation yang sama.
- Tipe pesan hanya: `text`, `offer`, `system`.
