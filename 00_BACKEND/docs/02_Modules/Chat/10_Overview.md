# Chat — Overview

Chat menghubungkan UMKM dan Content Creator secara realtime menggunakan **Appwrite Realtime**. Ini adalah ruang negosiasi sebelum kesepakatan dibuat lewat custom offer.

## Inti

- Komunikasi dua arah UMKM ↔ Creator dalam satu **conversation** (ruang chat).
- Pesan dikirim realtime: saat `messages.create`, subscriber UI penerima langsung ter-update tanpa polling.
- Lampiran (image/file) disimpan di **Storage** (bucket `chat-files`), bukan langsung di dokumen pesan.

## Tipe Pesan

- `text` — pesan teks biasa.
- `image` — gambar (URL ke Storage).
- `file` — berkas (URL ke Storage).
- `offer` — referensi custom offer yang dikirim creator di dalam chat (lihat `../Offers/`).
- `system` — pesan sistem (mis. notifikasi status).

## Tautan

- Custom offer yang dibuat di dalam percakapan → `../Offers/`.
- Skema & relasi koleksi → `50_Database.md`.
