# Workflow: Registration & Onboarding

## Purpose

Membawa user baru (UMKM atau Creator) dari form pendaftaran sampai akun siap pakai: terverifikasi, punya profil, punya wallet, dan menerima welcome notification.

## Modules Involved

- [Authentication](../02_Modules/Authentication/00_Index.md) — pembuatan akun, verifikasi email, role.
- [Users](../02_Modules/Users/00_Index.md) — profil UMKM/Creator.
- [Payments](../02_Modules/Payments/00_Index.md) — pembuatan wallet (owner: Payments).
- [Notifications](../02_Modules/Notifications/00_Index.md) — welcome notification.

## Trigger

User submit form `Daftar UMKM` (`/register?role=umkm`) atau `Daftar Creator` (`/register?role=creator`, opsi Google OAuth).

## Step-by-step Flow

1. **Authentication** — Buat Appwrite Auth user dari input (UMKM: businessName, category, email, phone, password; Creator: name, email, password atau Google OAuth).
2. **Authentication** — Kirim link verifikasi email, **valid 10 menit**. Halaman Check Inbox + opsi kirim ulang link.
3. User klik link → email terverifikasi → `Account Created`.
4. **Event `users.create`** memicu function `create-user-wallet` (lihat Events).
5. **Users** — Buat profil sesuai role (UMKM/Creator), pre-fill data dari registrasi.
6. **Payments** — Buat dokumen `wallets` (`availableBalance=0`, `pendingBalance=0`, `escrowBalance=0`).
7. **Notifications** — Buat notifikasi `type: system` "Selamat datang di Marketiv".
8. User login → masuk wizard onboarding (detail wizard ada di [Users](../02_Modules/Users/00_Index.md)).

## Events / Functions

- Trigger: `users.create`
- Function: `create-user-wallet` → create wallet + create profile + send welcome notification.
- Lihat: [`../02_Modules/Authentication/90_Events.md`](../02_Modules/Authentication/90_Events.md).

## Edge Cases

- Link verifikasi kedaluwarsa (>10 menit) → user pakai opsi kirim ulang.
- Email sudah terdaftar → registrasi ditolak (aturan di Authentication).
- Google OAuth hanya untuk Creator (bukan UMKM).
- Wallet/profil idempoten — function tidak boleh membuat duplikat jika dipicu ulang.

## Links

- [Authentication](../02_Modules/Authentication/00_Index.md)
- [Users](../02_Modules/Users/00_Index.md)
- [Payments](../02_Modules/Payments/00_Index.md)
- [Notifications](../02_Modules/Notifications/00_Index.md)
