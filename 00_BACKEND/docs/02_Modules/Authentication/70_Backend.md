# Authentication — Backend

## Appwrite Auth SDK

Modul Authentication menggunakan Appwrite Auth SDK (client-side & server-side):

- `account.create()` — register user baru.
- `account.createEmailPasswordSession()` — login email + password.
- `account.createOAuth2Session()` — login Google OAuth.
- `account.updateVerification()` — verifikasi email.
- `account.updateRecovery()` — reset password.

## Appwrite Functions

### create-user-profile

- **Trigger**: `users.create` (Auth).
- **Proses**: buat profil sesuai role (`umkm_profiles` / `creator_profiles`) + wallet.

## Aturan Implementasi

- Role diteruskan via query string; backend membaca `role` untuk routing form & pembuatan profil.
- Token verifikasi email valid 10 menit.
- Nomor HP UMKM wajib diisi; Creator tidak wajib.
