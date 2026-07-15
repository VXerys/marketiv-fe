# Rate Cards — Frontend

## Halaman Creator

### My Rate Cards

- Daftar rate card milik Creator.
- Status badge (draft/published).
- Tombol Tambah Rate Card, Edit, Publish.

### Create/Edit Rate Card

- Form: title, description.
- Dynamic package list: tambah/hapus paket.
- Tiap paket: name, description, output, deliveryDays, price, revisionLimit.

## Halaman UMKM

### Creator Profile

- Tampilkan rate card yang dipublikasi.
- Pilih paket → tombol "Pesan Sekarang".

### Discovery / Browse Creators

- Filter: kota, range harga (minPrice — maxPrice).
- Sort by: harga terendah, harga tertinggi, rating tertinggi, pesanan terbanyak.
- List creator dengan rating, totalFollowers, city, harga termurah dari paket rate card.
- Klik → lihat profil + rate card.

## Komponen

- `RateCardList` — daftar rate card Creator.
- `PackageCard` — detail satu paket.
- `PackageForm` — form tambah/edit paket.
- `CreatorCard` — ringkasan Creator di halaman discovery.
