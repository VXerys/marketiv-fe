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
                 create-user-profile
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
  B. Google OAuth: Klik "Daftar dengan Google" → Google Auth
                      ↓
                 create-user-profile
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
Appwrite Auth session aktif
↓
users mirror ditemukan
↓
Dashboard
```

- Login manual dan Google Login berlaku untuk kedua role.
- Appwrite Auth session saja belum cukup untuk dianggap siap masuk dashboard.
- `getSession()` wajib menemukan baris `users` berdasarkan `userId`.
- `not_found` setelah OAuth berarti profil Marketiv belum selesai dibuat, bukan credential Google salah.
- UMKM & Creator OAuth tanpa mirror simetris: `setOAuthAccountPrefs(role)` + `create-user-profile`, lalu `/onboarding`.
- Tidak ada form perantara: seluruh data usaha UMKM (termasuk Nomor WhatsApp) diisi sekali di wizard `/onboarding`.
- Provisioning gagal menampilkan recovery dengan tombol coba ulang dan keluar, bukan redirect diam-diam ke form login/register.

## Forgot Password

```text
Klik Lupa Password
↓
Input Email
↓
request-password-otp Function
↓ rate limit 3 request / 10 menit per email+IP
↓ Appwrite Email OTP dikirim
↓
Buka /reset-password dengan email + userId
↓
Input OTP 6 digit + password baru
↓
reset-password-with-otp Function
↓ verify OTP server-side
↓ users.updatePassword()
↓
Login
```

## Lihat Juga

- [30_Business_Rules.md](30_Business_Rules.md) — aturan yang mengikat flow ini.
- [60_API.md](60_API.md) — fungsi yang dipanggil tiap langkah.
