# Authentication — User Flow

## Register → Verify → Complete Profile

```text
Landing Page
↓
Pilih Daftar UMKM (/register?role=umkm) atau Creator (/register?role=creator)
↓
Isi Data
  - UMKM: Nama Usaha, Kategori, Email, Nomor HP, Password
  - Creator: Nama Lengkap, Email, Password (atau Google OAuth)
↓
Submit
↓
Verifikasi Email (link valid 10 menit)
  ├─ Halaman Check Inbox
  └─ Opsi Kirim Ulang Link
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
Login (/login?role=umkm atau ?role=creator)
↓
UMKM   : Email + Password
Creator: Email + Password ATAU Google Login
↓
Success
↓
Dashboard
```

- Login manual berlaku untuk UMKM dan Creator.
- Google Login hanya untuk Creator.

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
