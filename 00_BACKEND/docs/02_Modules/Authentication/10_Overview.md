# Authentication — Overview

## Ringkasan

- Mengelola identitas masuk pengguna Marketiv dengan dua role: **UMKM** dan **Creator**.
- Dibangun di atas **Appwrite Auth** — Authentication tidak memiliki collection database sendiri.
- Tanggung jawab: registrasi, verifikasi email, login (manual & Google OAuth), serta reset password.

## Batasan Kepemilikan

- **Tidak memiliki** collection apa pun. Kredensial disimpan oleh Appwrite Auth.
- Saat registrasi, modul ini **memicu** pembuatan record di modul lain:
  - Profil pengguna → milik [Users](../Users/50_Database.md).
  - Wallet → milik [Payments].

## Ketergantungan

- **Users** — profil UMKM/Creator dibuat sebagai bagian dari proses register.
- **Payments** — wallet dibuat otomatis lewat event `users.create`.
- **Notifications** — welcome notification dikirim setelah registrasi.

## Lihat Juga

- [90_Events.md](90_Events.md) — efek event registrasi.
