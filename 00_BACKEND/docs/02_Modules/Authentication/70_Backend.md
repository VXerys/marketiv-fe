# Authentication — Backend

Dokumen ini khusus untuk Appwrite Auth SDK dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Auth SDK

Modul Authentication menggunakan Appwrite Auth SDK (client-side & server-side):

- `account.create()` — register user baru.
- `account.createEmailPasswordSession()` — login email + password.
- `account.createOAuth2Session()` — login Google OAuth.
- `account.updateRecovery()` — reset password.

## Appwrite Functions

Authentication tidak mendefinisikan Appwrite Functions khusus di modul ini.
Provisioning profile ditangani oleh `create-user-profile` di modul [Users](../Users/70_Backend.md), sedangkan pembuatan wallet ditangani oleh `create-user-wallet` di modul [Payments](../Payments/70_Backend.md).

## Aturan Implementasi

- Role diteruskan via query string; backend membaca `role` untuk routing form & pembuatan profil.
- Nomor HP UMKM wajib diisi; Creator tidak wajib.
- Data registrasi (businessName, category, phone, displayName) disimpan sementara ke Appwrite user `prefs` lewat `account.updatePrefs()` sebelum `create-user-profile` dipanggil, sehingga function dapat membaca data tersebut untuk membuat profil.

## Lihat Juga

- Mekanisme provisioning profil: [Users/70_Backend.md](../Users/70_Backend.md).
- Pembuatan wallet: [Payments/70_Backend.md](../Payments/70_Backend.md).
