# Chat — API

## Frontend-facing Contracts

Service frontend mempertahankan public DTO, sementara mutasi sensitif dijalankan melalui Appwrite Function tepercaya.

---

### `createConversation()` — [Appwrite Function]

- **Input**: `{ umkmId, creatorId }`
- **Proses**: cek apakah pasangan sudah punya conversation; jika belum, buat dokumen `conversations` baru. Mengembalikan conversation yang ada/baru.
- **Akses**: Participant (UMKM / Creator).

### `sendMessage()` — [Appwrite Function]

- **Input**: `{ conversationId, type?, content?, offerId? }` — `type` default `text`.
- **Proses**: validasi participant, tipe pesan; buat dokumen `messages`; update `last_message` & `last_message_at` pada conversation induk.
- **Akses**: Participant.

### `getConversations()` — [Legacy Client SDK]

- **Input**: `{ limit?, includeArchived? }` — `includeArchived` default `false`.
- **Proses**: kontrak legacy. Layar negosiasi aktif membaca status archive dari Function DTO role-specific di bawah, bukan `is_archived`.
- **Output**: `Conversation[]` — tiap objek mencakup `id`, `umkmId`, `creatorId`, `lastMessage`, `lastMessageAt`, `isArchived`.
- **Akses**: Participant.

### `patch-conversation-archive` — [Appwrite Function]

- **Input frontend**: `{ conversationId: string, isArchived: boolean }`.
- **Caller**: `x-appwrite-user-id` dari Appwrite Function context/header authoritative.
- **Proses**: load conversation, verifikasi caller participant, lalu update hanya `umkm_archived` atau `creator_archived` sesuai ID caller.
- **Larangan**: tidak menerima role frontend dan tidak mengubah `is_archived`.
- **Akses**: participant; non-participant menerima `404` agar keberadaan conversation tidak bocor.

### DTO Negosiasi Archive

- `get-umkm-negotiations`: `isArchived = Boolean(conversation.umkm_archived)`.
- `get-creator-negotiations`: `isArchived = Boolean(conversation.creator_archived)`.
- Public DTO tetap memakai `isArchived: boolean`; frontend tidak menerima nama field internal per-participant.
- Legacy `is_archived` tidak digunakan sebagai fallback, termasuk saat nilainya `true`.

### `markConversationAsRead()` — [Client SDK]

- **Input**: `{ conversationId }`
- **Proses**: query semua pesan dalam conversation di mana `sender_id != currentUserId` dan `read_at IS NULL`, lalu update `read_at` dengan timestamp sekarang.
- **Akses**: Participant.

---

## Realtime

```text
Message Sent (messages.create)
↓
Realtime Event
↓
Receiver UI Update
```

UI penerima subscribe ke channel dokumen `messages` percakapan terkait; saat ada pesan baru, UI langsung ter-update tanpa polling.

## Push Notification

Pesan chat tidak dikirim lewat Appwrite Messaging sebagai data utama. Setelah `messages.create`, function `send-chat-notification` membuat notifikasi penerima dan mengirim push notification Appwrite Messaging jika target push user tersedia.

> Pesan bertipe `offer` merujuk custom offer yang dibuat UMKM — lihat `../Offers/`.

---

## Lihat Juga

- [50_Database.md](50_Database.md) — skema data
- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi
