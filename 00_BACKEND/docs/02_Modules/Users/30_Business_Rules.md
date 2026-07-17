# Users — Business Rules

## Kelengkapan Profil

- Setiap profil memiliki flag `isProfileCompleted`.
  - UMKM: default-nya dapat dianggap lengkap setelah onboarding wizard, tanpa mewajibkan social media.
  - Creator: `isProfileCompleted` awalnya `false`; menjadi `true` setelah profil dilengkapi.
- Profil yang belum lengkap dapat memblokir aksi tertentu (mis. claim campaign membutuhkan profil lengkap).

## Atribut Opsional di Onboarding

- Upload logo UMKM bersifat opsional saat onboarding.
- Tambah portfolio Creator bersifat opsional saat onboarding.
- Kedua data tersebut dapat dilengkapi nanti dari halaman profil.

## Data Pre-filled dari Registrasi

- **UMKM**: `businessName`, `category`, dan `phone` diisi saat Register dan ditampilkan pre-filled di onboarding.

## Social Media UMKM

- Social media UMKM bersifat **opsional** karena tidak semua UMKM memiliki akun social media saat mendaftar.
- Untuk MVP, field social media UMKM yang tersedia hanya TikTok.
- Kelengkapan profil UMKM tidak boleh bergantung pada ada/tidaknya akun TikTok.
- Website tidak menjadi field profil UMKM pada MVP.

## Akun Sosial Creator

- Untuk MVP, satu creator hanya dapat memiliki **akun TikTok** pada `creator_social_accounts`.
- Platform selain TikTok (Instagram, Facebook, YouTube, dan lainnya) tidak dapat dipilih atau disimpan pada MVP; platform tersebut masuk future scope.
- Collection tetap menggunakan pola satu akun per platform agar ekspansi multi-platform setelah MVP tetap mudah.
- Tiap akun menyimpan `followers` dan `engagementRate`.

## Data Denormalisasi (disengaja)

Disimpan langsung di `creator_profiles` agar dashboard & browse cepat, walau bisa dihitung dari collection lain:

- `totalFollowers` — agregat followers seluruh akun sosial.
- `totalOrders` — jumlah order selesai.
- `rating` — rating creator.

## Storage Kuota [DORMANT — post-MVP]

- **Infrastruktur ini dormant.** File Manager berbasis `user_files` & `user_storage_usage` tidak diaktifkan di MVP. Semua aset menggunakan external URL (Google Drive). Infrastruktur siap diaktifkan jika feedback demo minggu pertama meminta file manager internal.
- Setiap user memiliki kuota penyimpanan default **100 MB** (104.857.600 bytes) untuk file yang diupload ke Appwrite Storage.
- Kuota dihitung dari total `sizeBytes` seluruh `user_files` berstatus `active`.
- Upload ditolak jika `usedBytes + file.size > quotaBytes`.
- Maks ukuran satu file: **20 MB**.
- Maks jumlah file: **100** file aktif.
- File yang dihapus (soft delete) tidak dihitung dalam kuota dan jumlah file.
- Kuota dapat dinaikkan berdasarkan plan/subscription di masa depan.
- External URL (Google Drive, Dropbox, dll.) tidak terikat kuota — dikelola via modul Campaigns (`campaign_assets.source = external_url`).

## Lihat Juga

- [50_Database.md](50_Database.md) — atribut & index.
- [60_API.md](60_API.md) — operasi profil, pencarian creator, & file manager.
