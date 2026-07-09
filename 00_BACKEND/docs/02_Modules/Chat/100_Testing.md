# Chat — Testing

## Conversation

- Membuat conversation baru untuk pasangan unik → berhasil.
- Membuat conversation untuk pasangan yang sudah ada → mengembalikan conversation existing.

## Pesan

- Kirim pesan text → tersimpan, realtime terkirim.
- Kirim pesan image/file → attachment tersimpan di Storage.
- Kirim pesan sebagai non-participant → ditolak.

## Offer dari Chat

- Creator membuat offer → pesan tipe `offer` terkirim + dokumen offers terbuat.
- UMKM tidak bisa membuat offer (tombol tidak tampil).

## Realtime

- UI penerima update dalam 1 detik setelah pesan dikirim.
- Unread count bertambah untuk penerima.
