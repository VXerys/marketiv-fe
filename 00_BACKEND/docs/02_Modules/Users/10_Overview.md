# Users — Overview

## Ringkasan

- Mengelola data profil pengguna setelah autentikasi: profil UMKM, profil Creator, akun sosial creator, dan portfolio.
- Sumber data utama untuk Creator Discovery (browse & filter creator) dan tampilan profil UMKM.

## Collection yang Dimiliki

- `users` — record identitas inti (mirror dari Appwrite Auth + role/status).
- `umkm_profiles` — profil bisnis UMKM.
- `creator_profiles` — profil creator.
- `creator_social_accounts` — akun sosial creator (1 creator → banyak akun).
- `creator_portfolios` — portfolio creator (1 creator → banyak portfolio).

⚠️ `user_storage_usage` & `user_files` dormant — tidak dipakai MVP. Skema lengkap di [50_Database.md](50_Database.md).

## Ketergantungan

- **Authentication** — membuat profil saat registrasi.
- **Notifications**, **Payments**, **Orders** — mereferensikan `userId` sebagai pemilik.

## Lihat Juga

- [Domain Model](../10_Domain_Model.md) — domain Identity.
