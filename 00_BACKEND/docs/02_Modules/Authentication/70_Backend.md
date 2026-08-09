# Authentication — Backend

Dokumen ini khusus untuk Appwrite Auth SDK dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Auth SDK

Modul Authentication menggunakan Appwrite Auth SDK (client-side & server-side):

- `account.create()` — register user baru.
- `account.createEmailPasswordSession()` — login email + password.
- `account.createOAuth2Session()` — login Google OAuth.
- `account.updateRecovery()` — reset password.
- `account.createEmailToken()` — kirim OTP email 6 digit, valid 15 menit.
- `account.createSession()` — verifikasi OTP email.
- `users.updatePassword()` — server-side reset password setelah OTP valid.

## Appwrite Functions

Authentication memiliki dua Function khusus untuk reset password OTP:

- `request-password-otp` — public execute. Validasi email, rate limit server-side 3 request per 10 menit per email+IP di tabel `otp_rate_limits`, lookup Auth user via `users.read`, lalu kirim OTP via `account.createEmailToken()`. Response tidak pernah memuat OTP mentah.
- `reset-password-with-otp` — public execute. Validasi `userId`, OTP 6 digit, dan password. Function memverifikasi OTP via `account.createSession()`, lalu mengganti password lewat `users.updatePassword()`. Sesi OTP temporary dihapus best-effort via `users.deleteSession()`.

Provisioning profile tetap ditangani oleh `create-user-profile` di modul [Users](../Users/70_Backend.md), sedangkan pembuatan wallet ditangani oleh `create-user-wallet` di modul [Payments](../Payments/70_Backend.md).

Sinkronisasi verifikasi email ditangani oleh Function event `user-email-verified` pada `users.*.update`. Function hanya bertindak saat payload Auth berisi `emailVerification === true`, lalu mengisi `users.email_verified_at` secara idempoten.

## Aturan Implementasi

- Role diteruskan via query string; backend membaca `role` untuk routing form & pembuatan profil.
- Nomor HP UMKM wajib diisi; Creator tidak wajib.
- Data registrasi (businessName, category, phone, displayName) disimpan sementara ke Appwrite user `prefs` lewat `account.updatePrefs()` sebelum `create-user-profile` dipanggil, sehingga function dapat membaca data tersebut untuk membuat profil.
- Client-side state (`email`, `userId`, dan route query) bukan sumber kepercayaan untuk reset password. Reset hanya terjadi setelah Appwrite memvalidasi OTP terhadap `userId` di server.

## Lihat Juga

- Mekanisme provisioning profil: [Users/70_Backend.md](../Users/70_Backend.md).
- Pembuatan wallet: [Payments/70_Backend.md](../Payments/70_Backend.md).
