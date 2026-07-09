# Rate Cards — Backend

## Appwrite Functions

Modul Rate Cards tidak memiliki Appwrite Functions khusus. Operasi CRUD dilakukan langsung via Appwrite SDK.

## Aturan Backend

- Validasi kepemilikan: hanya Creator pemilik yang dapat mengubah rate card.
- Saat publish, validasi minimal satu paket telah ditambahkan.
- Search creators memanfaatkan index pada `creator_profiles` (city, rating, totalFollowers) dan `creator_social_accounts` (platform, followers).
- Direct order dari paket: `packageId` direferensi oleh order (lihat `../Orders/50_Database.md`).
