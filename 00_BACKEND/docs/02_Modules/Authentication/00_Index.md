# Authentication

Modul registrasi, login, dan reset password Marketiv. Memakai **Appwrite Auth** sebagai sumber kredensial — modul ini **tidak memiliki collection sendiri**; data profil & wallet dimiliki modul lain (Users, Payments).

## Dokumen

- [10_Overview.md](10_Overview.md) — Ringkasan peran modul & ketergantungannya.
- [20_Concepts.md](20_Concepts.md) — Istilah & konsep autentikasi.
- [30_Business_Rules.md](30_Business_Rules.md) — Aturan role, OAuth, dan reset password.
- [40_User_Flow.md](40_User_Flow.md) — Alur register, login, dan forgot password.
- [60_API.md](60_API.md) — Kontrak Auth Service (register, login).
- [70_Backend.md](70_Backend.md) — Appwrite Auth SDK & Functions.
- [80_Frontend.md](80_Frontend.md) — Halaman & komponen autentikasi.
- [90_Events.md](90_Events.md) — Event registrasi dan efek lintas modul.
- [100_Testing.md](100_Testing.md) — Skenario uji register, login, reset password.
