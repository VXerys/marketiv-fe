# Authentication — Frontend

## Halaman

### Landing Page

- Tombol "Daftar UMKM" → `/register?role=umkm`
- Tombol "Daftar Creator" → `/register?role=creator`
- Tombol "Login" → `/login`

### Register

- Form dinamis berdasarkan role.
- UMKM:
  - Manual: Nama Usaha, Kategori, Email, Nomor HP, Password.
  - Google OAuth: setelah redirect, isi Nama Usaha, Kategori, Nomor HP.
- Creator:
  - Manual: Nama Lengkap, Email, Password.
  - Google OAuth: langsung jadi.

### Login

- Form email + password atau "Login dengan Google" untuk kedua role.

### Forgot Password

- Input email → submit → cek email untuk link reset.

## Komponen

- `AuthForm` — form registrasi/login dinamis sesuai role.
- `GoogleButton` — tombol OAuth Google untuk kedua role.

