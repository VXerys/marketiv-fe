# Authentication — Frontend

## Halaman

### Landing Page

- Tombol "Daftar UMKM" → `/register?role=umkm`
- Tombol "Daftar Creator" → `/register?role=creator`
- Tombol "Login" → `/login`

### Register

- Form dinamis berdasarkan role.
- UMKM: Nama Usaha, Kategori, Email, Nomor HP, Password.
- Creator: Nama Lengkap, Email, Password — atau tombol "Daftar dengan Google".

### Check Inbox

- Ditampilkan setelah register berhasil.
- Informasi "Cek emailmu untuk verifikasi".
- Link "Kirim ulang link" (resend verification).

### Login

- Form email + password.
- UMKM login manual.
- Creator: manual atau "Login dengan Google".

### Forgot Password

- Input email → submit → cek email untuk link reset.

## Komponen

- `AuthForm` — form registrasi/login dinamis sesuai role.
- `GoogleButton` — tombol OAuth Google (hanya creator).
- `VerificationBanner` — banner peringatan verifikasi email.
