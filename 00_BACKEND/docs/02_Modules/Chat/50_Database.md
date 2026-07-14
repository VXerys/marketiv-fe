# Chat — Database

Sumber kebenaran skema koleksi milik modul Chat. Satu fakta = satu lokasi.

---

## conversations

Ruang chat antara satu UMKM dan satu creator. Relasi: Conversation (1) → Messages (N).

| Attribute          | Type    | Required | Catatan                              |
| ------------------ | ------- | -------- | ------------------------------------ |
| umkmId             | string  | yes      | FK → users                           |
| creatorId          | string  | yes      | FK → users                           |
| lastMessage        | string  | no       | denormalisasi pesan terakhir         |
| lastMessageAt      | string  | no       | denormalisasi waktu pesan terakhir   |
| unreadCountUMKM    | integer | no       | badge unread untuk UMKM              |
| unreadCountCreator | integer | no       | badge unread untuk creator           |

**Index**: `umkmId`, `creatorId`, `lastMessageAt DESC`.

**Constraint**: kombinasi `umkmId + creatorId` unik (satu percakapan per pasangan — lihat `30_Business_Rules.md`).

**Permission**: Participant only.

---

## messages

Pesan dalam sebuah percakapan. Relasi: Conversation (1) → Messages (N).

| Attribute      | Type   | Required | Catatan                            |
| -------------- | ------ | -------- | ---------------------------------- |
| conversationId | string | yes      | FK → conversations                 |
| senderId       | string | yes      | FK → users                         |
| type           | enum   | yes      | `text\|image\|file\|offer\|system` |
| content        | string | no       | isi pesan (untuk `text`/`system`)  |
| attachmentUrl  | string | no       | URL Storage untuk `image`/`file`   |
| isRead         | bool   | no       | status dibaca                      |

**Index**: `conversationId`, `createdAt DESC`, `senderId`.

**Permission**: Participant only.

> Lampiran disimpan di Storage (bucket `chat-files`), bukan di dokumen. Tipe pesan dijelaskan di `30_Business_Rules.md`.
