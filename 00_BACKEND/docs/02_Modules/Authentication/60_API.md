# Authentication — API (Auth Service)

Semua fungsi berjalan via Appwrite SDK / Functions.

## Register

### `registerUMKM()`

Input:

```json
{
  "businessName": "",
  "category": "",
  "email": "",
  "phone": "",
  "password": ""
}
```

### `registerCreator()`

Input:

```json
{
  "name": "",
  "email": "",
  "password": ""
}
```

### Register Process (kedua role)

```text
Create Appwrite Auth User   (Creator boleh via Google OAuth)
↓
Create Profile              (umkm_profiles / creator_profiles)
↓
Create Wallet
```

> Pembuatan Wallet juga dipicu otomatis oleh event `users.create` — lihat [90_Events.md](90_Events.md).

## Login

```typescript
loginUser(email, password, role)
loginWithGoogle()   // Khusus Creator
```

Return data login:

```json
{
  "user": {},
  "profile": {},
  "wallet": {}
}
```

## Auth Utilities

```typescript
verifyEmailToken(token)         // verifikasi link email (valid 10 menit)
resendVerificationLink(email)   // kirim ulang link verifikasi
forgotPassword(email)           // kirim link reset password
```

## Lihat Juga

- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi input & verifikasi.
- Skema profil: [Users/50_Database.md](../Users/50_Database.md).
