# Chat — User Flow

## Memulai Percakapan

```text
UMKM buka profil Creator
↓
Klik "Chat"
↓
Cek: sudah punya conversation?
  ├─ Ya → buka conversation yang ada
  └─ Tidak → buat conversation baru
↓
Tampilkan chat screen
```

## Mengirim Pesan

```text
User (UMKM/Creator) ketik pesan
↓
Pilih tipe: text / image / file / offer
↓
Send → messages.create
↓
Realtime event → UI penerima update
↓
Update lastMessage + lastMessageAt pada conversation
```

## Membuat Offer dari Chat

```text
UMKM buka chat
↓
Klik "Buat Offer"
↓
Isi: title, description, price, deadline, revisionLimit
↓
Kirim → pesan tipe `offer` terkirim di chat + dokumen `offers` terbuat
```
