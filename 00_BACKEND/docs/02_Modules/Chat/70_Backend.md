# Chat — Backend

## Appwrite Realtime

- Subscriber UI mendengarkan channel `conversations.{id}.messages`.
- Saat `messages.create`, event realtime dikirim ke seluruh participant.

## Appwrite Functions

### update-conversation-on-message

- **Trigger**: `messages.create`.
- **Aksi**: update `lastMessage`, `lastMessageAt`, `unreadCount` pada conversation induk.

## Storage

- Bucket: `chat-files`.
- Permission: participant read/write.
- File gambar dan lampiran disimpan di sini; dokumen message hanya menyimpan `attachmentUrl`.

## Aturan Backend

- Validasi participant: hanya UMKM & creator yang terlibat dapat mengirim/membaca pesan.
- Unique constraint `umkmId + creatorId` pada conversation.
- Tipe `offer`: validasi bahwa pengirim adalah Creator.
