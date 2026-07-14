# Users — Business Rules

## Kelengkapan Profil

- Setiap profil memiliki flag `isProfileCompleted`.
  - UMKM: default-nya dapat dianggap lengkap setelah onboarding wizard.
  - Creator: `isProfileCompleted` awalnya `false`; menjadi `true` setelah profil dilengkapi.
- Profil yang belum lengkap dapat memblokir aksi tertentu (mis. claim campaign membutuhkan profil lengkap).

## Data Pre-filled dari Registrasi

- **UMKM**: `businessName`, `category`, dan `phone` diisi saat Register dan ditampilkan pre-filled di onboarding.

## Akun Sosial Creator

- Satu creator dapat memiliki **banyak** akun sosial (`creator_social_accounts`), satu per platform (tiktok, instagram, youtube, dst.).
- Tiap akun menyimpan `followers`, `engagementRate`, dan flag `isVerified`.

## Data Denormalisasi (disengaja)

Disimpan langsung di `creator_profiles` agar dashboard & browse cepat, walau bisa dihitung dari collection lain:

- `totalFollowers` — agregat followers seluruh akun sosial.
- `totalOrders` — jumlah order selesai.
- `rating` — rating creator.

## Lihat Juga

- [50_Database.md](50_Database.md) — atribut & index.
- [60_API.md](60_API.md) — operasi profil & pencarian creator.
