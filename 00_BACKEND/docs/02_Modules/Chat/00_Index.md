# Modul Chat

Chat realtime antara UMKM dan Content Creator via Appwrite Realtime. Satu percakapan per pasangan UMKM+creator; pesan mendukung tipe text/image/file/offer/system. Modul ini memiliki data `conversations` dan `messages`.

## Daftar Dokumen

- `10_Overview.md` — Gambaran chat realtime & tipe pesan.
- `30_Business_Rules.md` — Aturan satu percakapan per pasangan, denormalisasi lastMessage, tipe pesan, realtime.
- `50_Database.md` — Skema, relasi (conversation 1—* messages), dan index koleksi `conversations`, `messages`.
- `60_API.md` — Kontrak Chat Service (createConversation, sendMessage) & alur realtime.
