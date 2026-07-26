# 02 — Modules

Daftar modul fungsional Marketiv (platform UMKM ↔ Content Creator untuk promosi digital: Campaign PPV & Rate Card/Order dengan Escrow, di atas Appwrite + Next.js). Setiap modul punya folder sendiri dengan dokumen Overview, Business Rules, Flow, Database, API, dan Events sesuai kebutuhan.

## Daftar Modul

- **Authentication** — Registrasi, login (manual & Google OAuth), dan reset password. Tidak memiliki collection sendiri (memakai Appwrite Auth).
- **Users** — Profil pengguna: UMKM, Creator, akun sosial creator, dan portfolio. Pemilik collection identitas non-Auth.
- **Campaigns** — Campaign Pay-Per-View (PPV): pembuatan, publish, claim oleh creator, dan submission konten.
- **RateCards** — Katalog layanan creator (rate card + paket) untuk model booking langsung.
- **Chat** — Percakapan realtime UMKM ↔ Creator sebagai kanal negosiasi.
- **Offers** — Custom offer hasil negosiasi di chat; menjadi pemicu pembuatan order.
- **Orders** — Aggregate utama jalur Rate Card: order, revisi, dan deliverable.
- **Payments** — Wallet, transaksi, escrow, dan withdrawal (domain finansial sensitif).
- **AI** — AI Brief Generator dan AI Fraud Detection (USP Marketiv).
- **Notifications** — Notifikasi in-app & email yang dipicu event dari modul lain.

## Lihat Juga

- [10_Domain_Model.md](10_Domain_Model.md) — ERD tingkat tinggi per domain & relasi antar modul.
