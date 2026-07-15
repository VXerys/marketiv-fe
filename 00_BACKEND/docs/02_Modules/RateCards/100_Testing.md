# Rate Cards — Testing

## Service Layer (`creator.service.ts`)

### Create Rate Card (`createRateCard`)

- Creator membuat rate card dengan ≥1 paket valid → dokumen `rate_cards` status `draft` + `rate_card_packages` terbuat.
- `title` kosong → throw `CreatorServiceError('validation', 'Judul rate card wajib diisi.')`.
- Paket kosong (`packages.length === 0`) → throw `CreatorServiceError('validation', 'Minimal satu paket wajib ditambahkan.')`.
- Paket dengan `name` kosong → throw `CreatorServiceError('validation', 'Paket #N: nama wajib diisi.')`.
- Paket dengan `description` kosong → throw `CreatorServiceError('validation', 'Paket #N: deskripsi wajib diisi.')`.
- Paket dengan `output` kosong → throw `CreatorServiceError('validation', 'Paket #N: output wajib diisi.')`.
- Paket dengan `deliveryDays` ≤0 → throw `CreatorServiceError('validation', 'Paket #N: deliveryDays harus angka > 0.')`.
- Paket dengan `price` ≤0 → throw `CreatorServiceError('validation', 'Paket #N: price harus angka > 0.')`.
- Paket dengan `revisionLimit` <0 → throw `CreatorServiceError('validation', 'Paket #N: revisionLimit tidak valid.')`.

### Update Rate Card (`updateRateCard`)

- Owner update → field `title`/`description`/`status` ter-update.
- Bukan owner → throw `CreatorServiceError('forbidden', 'Kamu bukan pemilik rate card ini.')`.
- `rateCardId` kosong → throw `CreatorServiceError('validation', 'Rate card ID wajib diisi.')`.
- Update dengan paket kosong → throw `CreatorServiceError('validation', 'Minimal satu paket wajib ditambahkan.')`.
- Update menghapus paket lama & buat baru (replace).

### Get Rate Cards (`getRateCards`)

- `creatorId` valid → list rate card `status === 'published'` + paketnya.
- `creatorId` kosong → throw `CreatorServiceError('validation', 'Creator ID wajib diisi.')`.

### Access Control

- Creator A tidak bisa `updateRateCard` rate card Creator B (→ `forbidden`).
- UMKM hanya bisa membaca (read-only, permission `Role.any()`).

## Publish (via Flag Status)

- Set `status: 'published'` → muncul di discovery / profil Creator.
- Publish tanpa paket → error (minimal 1 paket, divalidasi di `createRateCard`/`updateRateCard`).

## Discovery (via `user.service.ts` `searchCreators`)

- UMKM mencari Creator → hasil sesuai filter.
- Creator dengan rate card published muncul di pencarian.
- Creator tanpa rate card published tidak muncul.
- Filter harga (`minPrice`/`maxPrice`) → query `rate_card_packages` collection (bukan `rate_cards`), field `price`.
- Sort `price_asc`/`price_desc` → urut via `rate_card_packages.price`.

Catatan: Di source code (`user.service.ts` `getCreatorIdsByRateCardPrice`), filter price sekarang menggunakan `COLLECTIONS.rateCardPackages` dengan field `price` (bukan `rate_cards`/`is_active`). Hasil `rateCardId` dipetakan ke `creatorId` lewat koleksi `rate_cards`, lalu difilter di `searchCreators` berdasarkan `creator.userId`.
