# Chat — API

## Service Layer (Client SDK)

Fungsi-fungsi berikut dipanggil langsung dari frontend Next.js via **Appwrite Client SDK (Database, Realtime)**. Berjalan di browser user.

---

### `createConversation()` — [Client SDK]

- **Input**: `{ umkmId, creatorId }`
- **Proses**: cek apakah pasangan sudah punya conversation; jika belum, buat dokumen `conversations` baru. Mengembalikan conversation yang ada/baru.
- **Akses**: Participant (UMKM / Creator).

### `sendMessage()` — [Client SDK]

- **Input**: `{ conversationId, type?, content?, offerId? }` — `type` default `text`.
- **Proses**: validasi participant, tipe pesan; buat dokumen `messages`; update `last_message` & `last_message_at` pada conversation induk.
- **Akses**: Participant.

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
