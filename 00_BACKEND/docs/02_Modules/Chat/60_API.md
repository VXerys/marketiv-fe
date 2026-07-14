# Chat — API

Kontrak Chat Service. Skema di `50_Database.md`; aturan di `30_Business_Rules.md`.

---

## Chat Service

### createConversation()

- **Input**: `{ umkmId, creatorId }`
- **Proses**: cek apakah pasangan sudah punya conversation; jika belum, buat dokumen `conversations` baru. Mengembalikan conversation yang ada/baru.
- **Akses**: Participant (UMKM / Creator).

### sendMessage()

- **Input**: `{ conversationId, type?, content?, attachmentUrl? }` — `type` default `text`.
- **Proses**: buat dokumen `messages`; update `lastMessage` & `lastMessageAt` pada conversation induk.
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

> Pesan bertipe `offer` merujuk custom offer — lihat `../Offers/`.
