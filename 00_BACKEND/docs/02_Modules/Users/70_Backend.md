# Users — Backend

Dokumen ini khusus untuk Appwrite Functions dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Functions

### create-user-profile

- **Trigger**: `users.create` (dari modul Authentication).
- **Aksi**: buat `umkm_profiles` atau `creator_profiles` sesuai role; inisialisasi `user_storage_usage` dengan `usedBytes = 0`, `quotaBytes = 104857600`, `fileCount = 0`.
- ⚠️ `user_storage_usage` dormant — tidak dipakai MVP.

### validate-and-upload ⚠️ DORMANT

- **Infrastruktur dormant — tidak aktif di MVP.** Diaktifkan jika feedback demo minggu pertama meminta file manager internal.
- **Trigger**: dipanggil API `uploadFile()`.
- **Execute**: authenticated users.
- **Input**: `{ fileName, mimeType, sizeBytes, contentBase64 }`.
- **Aksi**:
  1. Baca `user_storage_usage` milik user.
  2. Validasi kuota: `usedBytes + file.size ≤ quotaBytes`.
  3. Validasi batas file: `fileCount < 100`.
  4. Upload file ke Appwrite Storage bucket default File Manager.
  5. Buat metadata di `user_files` dengan `status = active`.
  6. Increment `usedBytes` dan `fileCount` di `user_storage_usage`.

### delete-file ⚠️ DORMANT

- **Infrastruktur dormant — tidak aktif di MVP.** Diaktifkan jika feedback demo minggu pertama meminta file manager internal.
- **Trigger**: dipanggil API `deleteFile()`.
- **Execute**: authenticated users.
- **Input**: `{ fileId }`.
- **Aksi**:
  1. Validasi `user_files.$id` milik user yang memanggil.
  2. Hapus file dari Appwrite Storage.
  3. Soft delete metadata `user_files` (`status = deleted`, set `deletedAt`).
  4. Decrement `usedBytes` dan `fileCount` di `user_storage_usage`.

## Aturan Backend

- Setiap user memiliki satu wallet (dibuat oleh modul Payments).
- `isProfileCompleted` diatur menjadi `true` setelah onboarding wizard selesai.
- Search creator menggunakan query terindeks pada `creator_profiles` (city, rating, totalFollowers) dan `rate_cards` (price) milik modul [RateCards](../RateCards/50_Database.md).
- Data denormalisasi (`totalFollowers`, `totalOrders`, `rating`) diperbarui oleh event dari modul terkait (Orders, Campaigns).

## Cross-Module Dependencies

| Modul | Collection | Digunakan Untuk |
| --- | --- | --- |
| RateCards | `rate_cards` | Filter & sort harga pada search creator |

## Lihat Juga

- [RateCards/50_Database.md](../RateCards/50_Database.md) — skema `rate_cards`.
