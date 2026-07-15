# Authentication — Business Rules

## Role & Routing

- Role ditentukan lewat parameter `role` saat register di service layer (`auth.service.ts`): `registerUser({ role: 'umkm', ... })` atau `registerUser({ role: 'creator', ... })`.
  - Register: `/register?role=umkm`, `/register?role=creator` — frontend membaca query string dan meneruskannya ke service.
- Login page tidak perlu query param — role sudah tersimpan di database.
- `loginUser()` API menerima parameter `role` opsional untuk validasi tambahan (memastikan role sesuai & status akun aktif).

## Data Registrasi per Role

- **UMKM** wajib mengisi:
  - Manual: Nama Usaha, Kategori Usaha, Email, **Nomor HP**, Password.
  - Google OAuth: Nama Usaha, Kategori Usaha, **Nomor HP** (email & nama dari Google).
  - Nomor HP **wajib** untuk UMKM (tidak wajib untuk Creator).
- **Creator** mengisi:
  - Manual: Nama Lengkap, Email, Password.
  - Google OAuth: langsung jadi (data dari Google).

### Alur Data Registrasi → Profil

Data registrasi dialirkan ke modul Users melalui mekanisme berikut:

1. Input `name` (Creator) → disimpan ke Appwrite user prefs sebagai `displayName`
2. Input `businessName`, `category`, `phone` (UMKM) → disimpan ke Appwrite user prefs
3. Function `create-user-profile` membaca data dari Appwrite user + prefs → membuat profil sesuai role
4. Hasil akhir: `creator_profiles.displayName` = input `name`, `umkm_profiles.businessName` = input `businessName`, dsb.

## Google OAuth

- Google OAuth tersedia untuk **UMKM** dan **Creator**.
- UMKM via Google OAuth tetap harus mengisi data tambahan (Nama Usaha, Kategori, Nomor HP) setelah redirect.
- Creator via Google OAuth langsung jadi tanpa isi data tambahan.

## Reset Password

- Forgot Password: pengguna memasukkan email → sistem mengirim link reset → pengguna membuka email → reset password → login.

## Status Akun

- Setiap user memiliki status: `active` atau `suspended`.
- User baru selalu dibuat dengan status `active`.
- Login akan ditolak jika status bukan `active`.

## Lihat Juga

- [40_User_Flow.md](40_User_Flow.md) — urutan langkah lengkap.
- Alur data ke profil: [Users/70_Backend.md](../Users/70_Backend.md).
