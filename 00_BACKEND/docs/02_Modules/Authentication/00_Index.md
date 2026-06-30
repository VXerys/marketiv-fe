# Authentication

Modul registrasi, login, verifikasi email, dan reset password Marketiv. Memakai **Appwrite Auth** sebagai sumber kredensial — modul ini **tidak memiliki collection sendiri**; data profil & wallet dimiliki modul lain (Users, Payments).

## Dokumen

- [10_Overview.md](10_Overview.md) — Ringkasan peran modul & ketergantungannya.
- [30_Business_Rules.md](30_Business_Rules.md) — Aturan role, verifikasi, OAuth, dan reset password.
- [40_User_Flow.md](40_User_Flow.md) — Alur register, login, dan forgot password.
- [60_API.md](60_API.md) — Kontrak Auth Service (register, login, verifikasi).
- [90_Events.md](90_Events.md) — Event registrasi dan efek lintas modul.
