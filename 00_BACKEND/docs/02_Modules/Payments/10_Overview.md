# Payments — Overview

Modul Payments mengelola seluruh aliran dana Marketiv.

## Komponen

- **Midtrans Payment Gateway** — gateway resmi untuk menerima pembayaran order/top up dari UMKM. Frontend hanya menerima payment token/redirect URL; server memegang secret key dan memproses webhook Midtrans.
- **Payments** — catatan payment intent dan status pembayaran dari Midtrans sebelum dana masuk escrow atau wallet.
- **Wallet** — satu wallet per user; menyimpan `balance` (tersedia) dan `pendingBalance` (belum cair).
- **Transactions** — ledger seluruh mutasi saldo (deposit, withdrawal, payment, refund, release, fee).
- **Escrow** — dana ditahan saat pembayaran order, dirilis saat deliverable di-approve, atau dikembalikan (refund). Status `held | released | refunded`.
- **Withdrawals** — pencairan dana ke bank/e-wallet langsung diproses tanpa review admin.

## Prinsip

- Satu user = satu wallet.
- Midtrans adalah satu-satunya payment gateway yang digunakan untuk MVP.
- Secret key Midtrans hanya boleh berada di Appwrite Function environment, tidak di frontend.
- Status payment internal harus berasal dari webhook/notifikasi Midtrans yang tervalidasi signature-nya.
- Escrow dan transactions disimpan **terpisah** (jangan digabung) — escrow domain sensitif, transactions adalah ledger.
- User tidak dapat mengubah saldonya sendiri; mutasi dilakukan sistem/admin.

## Tautan

- Escrow dipicu oleh alur order → `../Orders/`.
- Wallet dibuat saat user register → `../Authentication/`.
- Keputusan order sebagai aggregate (escrow tidak dikelola offer langsung) → `../../04_Decisions/ADR-003.md`.
- Skema & relasi → `50_Database.md`.
