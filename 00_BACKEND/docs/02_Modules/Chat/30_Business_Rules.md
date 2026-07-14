# Chat — Business Rules

## Satu Percakapan per Pasangan

- Hanya boleh ada **satu** `conversation` aktif per pasangan `umkmId` + `creatorId`.
- Sebelum membuat percakapan baru, cek apakah pasangan tersebut sudah punya conversation; jika ada, gunakan yang sudah ada.

## Denormalisasi

- `conversations` menyimpan `lastMessage` dan `lastMessageAt` (denormalisasi) agar daftar chat cepat di-query tanpa join ke `messages`.
- Setiap pesan baru memperbarui `lastMessage` & `lastMessageAt` pada conversation induk.
- `unreadCountUMKM` / `unreadCountCreator` boleh disimpan untuk badge unread.

## Tipe Pesan

`text | image | file | offer | system`

- `image`/`file` → konten disimpan di Storage, dokumen pesan hanya menyimpan `attachmentUrl`.
- `offer` → pesan merujuk custom offer (lihat `../Offers/`).
- `system` → dibuat oleh sistem, bukan user.

## Realtime & Akses

- Pengiriman pesan menggunakan Appwrite Realtime: `messages.create` memicu update UI penerima.
- Hanya **participant** (UMKM & creator pemilik conversation) yang dapat membaca/menulis pesan.
