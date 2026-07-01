# Offers — Overview

Custom offer adalah penawaran khusus yang dibuat di dalam sebuah **conversation** (lihat `../Chat/`) untuk menyepakati detail pekerjaan sebelum order dibuat.

## Inti

- Hanya **Content Creator** yang dapat membuat custom offer.
- Offer berisi kesepakatan: judul, deskripsi, harga, deadline, dan batas revisi.
- UMKM menerima (`accept`) atau menolak (`reject`) offer.
- Saat di-accept, offer langsung memicu pembuatan **order** (lihat `../Orders/`).

## Alur

```text
Creator buat custom offer (dalam conversation)
↓
UMKM Accept / Reject
↓
Accept → Create Order (status pending_payment)
```

## Tautan

- Percakapan tempat offer dibuat → `../Chat/`.
- Order yang terbentuk dari accept → `../Orders/`.
- Skema & relasi → `50_Database.md`.
