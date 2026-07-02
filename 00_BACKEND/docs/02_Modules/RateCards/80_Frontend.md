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

- Filter: platform social account, kota.
- List creator dengan rating, totalFollowers, city.
- Klik → lihat profil + rate card.

## Komponen

- `RateCardList` — daftar rate card Creator.
- `PackageCard` — detail satu paket.
- `PackageForm` — form tambah/edit paket.
- `CreatorCard` — ringkasan Creator di halaman discovery.
