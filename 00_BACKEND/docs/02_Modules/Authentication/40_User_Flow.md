# Authentication — User Flow

## Register → Complete Profile

### UMKM

```text
Landing Page
↓
Daftar UMKM (/register?role=umkm)
↓
Pilih metode:
  A. Manual: Isi Nama Usaha, Kategori, Email, Nomor HP, Password
  B. Google OAuth: Klik "Daftar dengan Google" → Google Auth
                      ↓
                 Isi data tambahan: Nama Usaha, Kategori, Nomor HP
↓
Submit
↓
Account Created
↓
Login
↓
Lengkapi Profil (Onboarding Wizard)
↓
Dashboard
```

### Creator

```text
Landing Page
↓
Daftar Creator (/register?role=creator)
↓
Pilih metode:
  A. Manual: Isi Nama Lengkap, Email, Password
  B. Google OAuth: Klik "Daftar dengan Google" → langsung jadi
↓
Submit
↓
Account Created
↓
Login
↓
Lengkapi Profil (Onboarding Wizard)
↓
Dashboard
```

## Login

```text
Login (/login)
↓
Email + Password ATAU Google Login
↓
Success
↓
Dashboard
```

- Login manual dan Google Login berlaku untuk kedua role.

## Forgot Password

```text
Klik Lupa Password
↓
Input Email
↓
Kirim Link Reset
↓
Buka Email
↓
Reset Password
↓
Login
```

## Lihat Juga

- [30_Business_Rules.md](30_Business_Rules.md) — aturan yang mengikat flow ini.
- [60_API.md](60_API.md) — fungsi yang dipanggil tiap langkah.
