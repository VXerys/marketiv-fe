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
- Archive bersifat per-participant: UMKM hanya mengubah `umkm_archived`, Creator hanya mengubah `creator_archived`.
- Archive bersifat soft: tidak menghapus conversation, messages, offers, atau orders, dan tidak mengubah state bisnis/order.
- Percakapan yang diarsipkan tetap dapat diakses melalui tab/filter Arsip.
- Unarchive hanya mengembalikan percakapan ke inbox participant yang melakukan aksi.
- Archive atau unarchive satu participant tidak boleh mengubah status archive participant lain.
- `is_archived` deprecated dan dipertahankan sementara hanya untuk kompatibilitas skema; field ini bukan sumber status archive.
- Nilai legacy `is_archived = true` tidak dapat dimigrasikan secara akurat karena actor awal tidak tersimpan. Jangan menebak actor atau menyalin nilai ke kedua participant.
- Field per-participant baru selalu mulai dari default `false`, termasuk untuk conversation lama.
- Mutasi archive hanya melalui `patch-conversation-archive`; Function menentukan participant dari caller Appwrite authoritative, bukan role dari payload browser.

## Realtime & Akses

- Pengiriman pesan menggunakan Appwrite Realtime sederhana: `messages.create` memicu update UI penerima.
- Hanya **participant** (UMKM & creator pemilik conversation) yang dapat membaca/menulis pesan.
