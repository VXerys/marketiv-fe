# Users — Backend

## Appwrite Functions

### create-user-profile

- **Trigger**: `users.create` (dari modul Authentication).
- **Aksi**: buat `umkm_profiles` atau `creator_profiles` sesuai role.

## Aturan Backend

- Setiap user memiliki satu wallet (dibuat oleh modul Payments).
- `isProfileCompleted` diatur menjadi `true` setelah onboarding wizard selesai.
- Search creator menggunakan query terindeks pada `creator_profiles` (city, rating, totalFollowers) dan `creator_social_accounts` (platform, followers).
- Data denormalisasi (`totalFollowers`, `totalOrders`, `rating`) diperbarui oleh event dari modul terkait (Orders, Campaigns).
