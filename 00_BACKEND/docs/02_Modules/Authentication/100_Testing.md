# Authentication — Testing

## Service Layer (`auth.service.ts`)

### Register UMKM (`registerUMKM`)

- Input valid (businessName, category, email, phone, password) → akun terbuat, `account.create()` + `account.createEmailPasswordSession()` dipanggil, `provisionUserProfile()` jalan, return `{ user, profile, wallet }`.
- Input tanpa `businessName` → throw `AuthServiceError('validation', 'Nama bisnis wajib diisi.')`.
- Input tanpa `category` → throw `AuthServiceError('validation', 'Kategori bisnis wajib diisi.')`.
- Input tanpa `phone` → throw `AuthServiceError('validation', 'Nomor HP wajib diisi.')`.
- Input email duplikat → Appwrite throw code 409 → `AuthServiceError('conflict', 'Email sudah terdaftar.')`.
- Input tanpa email → throw `AuthServiceError('validation', 'Email wajib diisi.')`.
- Input tanpa password → throw `AuthServiceError('validation', 'Password wajib diisi.')`.

### Register Creator (`registerCreator`)

- Input valid (name, email, password) → akun terbuat, `account.updatePrefs({ role: 'creator', displayName })` dipanggil, profil terisi.
- Input tanpa `name` → throw `AuthServiceError('validation', 'Nama creator wajib diisi.')`.

### Register by Role (`registerUser`)

- `data.role === 'umkm'` → delegasi ke `registerUMKM()`.
- `data.role === 'creator'` → delegasi ke `registerCreator()`.
- `data.role` tidak valid → throw `AuthServiceError`.

### Login (`loginUser`)

- Email & password valid → session terbuat, `{ user, profile, wallet }` dikembalikan.
- Email & password valid + role cocok → sukses.
- Role tidak cocok dengan stored role → throw `AuthServiceError('forbidden', 'Role akun tidak sesuai.')`.
- Akun tidak aktif → throw `AuthServiceError('forbidden', 'Akun tidak aktif.')`.
- Email/password salah → Appwrite error 401 → `AuthServiceError('auth', 'Email atau password tidak sesuai.')`.
- Input tanpa email → throw `AuthServiceError('validation', 'Email wajib diisi.')`.

### Google OAuth (`loginWithGoogle`)

Catatan: Login Google OAuth via `account.createOAuth2Session()` dipanggil langsung dari komponen frontend, bukan dari service layer.

- UMKM login via Google → redirect ke OAuth → setelah redirect, form data tambahan tampil.
- Creator login via Google → redirect ke OAuth → langsung jadi tanpa data tambahan.
- Role diteruskan via query string.

### Logout (`logoutUser`)

- Logout → `account.deleteSession('current')` dipanggil.
- Gagal logout → throw `AuthServiceError` dengan pesan sesuai.

### Get Current User (`getCurrentUser`)

- User login → return `{ user }` dari `account.get()`.
- User tidak login → return `null` (code 401 ditangani).

### Forgot Password (`forgotPassword`)

- Email terdaftar → `account.createRecovery()` dipanggil.
- Email kosong → throw `AuthServiceError('validation', 'Email wajib diisi.')`.

### Reset Password (`resetPassword`)

- Input valid (userId, secret, password) → `account.updateRecovery()` sukses.
- UserId kosong → throw `AuthServiceError('validation', 'User ID wajib diisi.')`.
- Secret kosong → throw `AuthServiceError('validation', 'Secret reset password wajib diisi.')`.
- Password kosong → throw `AuthServiceError('validation', 'Password baru wajib diisi.')`.

### Error Mapping (`mapError`)

- Error dengan `code 401` → `AuthServiceError('auth', ...)`.
- Error dengan `code 409` → `AuthServiceError('conflict', ...)`.
- Error unknown → `AuthServiceError('unknown', ...)`.
- Instance of `AuthServiceError` langsung dikembalikan tanpa remapping.
