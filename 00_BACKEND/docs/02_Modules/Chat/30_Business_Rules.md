# Chat — Business Rules

## Satu Percakapan per Pasangan

- Hanya boleh ada **satu** `conversation` aktif per pasangan `umkmId` + `creatorId`.
- Sebelum membuat percakapan baru, cek apakah pasangan tersebut sudah punya conversation; jika ada, gunakan yang sudah ada.

## Denormalisasi

- `conversations` menyimpan `lastMessage` dan `lastMessageAt` (denormalisasi) agar daftar chat cepat di-query tanpa join ke `messages`.
- Setiap pesan baru memperbarui `lastMessage` & `lastMessageAt` pada conversation induk.

## Tipe Pesan

`text | offer | system`

- `text` → pesan negosiasi biasa.
- `offer` → pesan merujuk custom offer yang dibuat UMKM (lihat `../Offers/`).
- `system` → dibuat oleh sistem, bukan user.

## Read Receipt

- Setiap pesan yang telah dibaca oleh penerima ditandai dengan `read_at` timestamp.
- Saat user membuka chat room, semua pesan yang belum dibaca (dari lawan bicara) langsung ditandai sebagai telah dibaca.
- Frontend menampilkan indikator "Sudah dibaca" pada pesan milik pengirim.

## Archive

- Participant dapat mengarsipkan percakapan untuk menyembunyikannya dari inbox utama.
- Archive bersifat soft: hanya mengubah `is_archived = true`, tidak menghapus data.
- Percakapan yang diarsipkan tetap dapat diakses melalui tab/filter Arsip.
- Unarchive mengembalikan percakapan ke inbox utama (`is_archived = false`).
- Archive tidak memengaruhi participant lain — setiap participant memiliki status archive sendiri (opsi masa depan: per-user flag).
- Inbox default (daftar negosiasi) hanya menampilkan percakapan dengan `is_archived = false`.

## Realtime & Akses

- Pengiriman pesan menggunakan Appwrite Realtime sederhana: `messages.create` memicu update UI penerima.
- Hanya **participant** (UMKM & creator pemilik conversation) yang dapat membaca/menulis pesan.
