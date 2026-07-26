# Authentication — Concepts

## Istilah

- **Appwrite Auth** — layanan autentikasi Appwrite yang mengelola kredensial, sesi, dan token.
- **Role** — tipe pengguna: `umkm`, `creator`, atau `admin`.
- **Google OAuth** — login satu klik via akun Google, tersedia untuk UMKM dan Creator.
- **Reset Password** — mekanisme pemulihan akses via link reset yang dikirim ke email.

## Konsep

- Role ditentukan sejak registrasi via query string `?role=umkm` atau `?role=creator`.
- Autentikasi hanya mengelola kredensial; data profil disimpan di modul Users.
- Wallet pengguna dibuat otomatis saat registrasi (event-driven).
