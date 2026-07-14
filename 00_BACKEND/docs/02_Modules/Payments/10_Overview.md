# Payments — Overview

Modul Payments mengelola seluruh aliran dana Marketiv.

## Komponen

- **Wallet** — satu wallet per user; menyimpan `balance` (tersedia) dan `pendingBalance` (belum cair).
- **Transactions** — ledger seluruh mutasi saldo (deposit, withdrawal, payment, refund, release, fee).
- **Escrow** — dana ditahan saat pembayaran order, dirilis saat deliverable di-approve, atau dikembalikan (refund). Status `held | released | refunded`.
- **Withdrawals** — permintaan pencairan dana ke bank/e-wallet, perlu **persetujuan admin**.

## Prinsip

- Satu user = satu wallet.
- Escrow dan transactions disimpan **terpisah** (jangan digabung) — escrow domain sensitif, transactions adalah ledger.
- User tidak dapat mengubah saldonya sendiri; mutasi dilakukan sistem/admin.

## Tautan

- Escrow dipicu oleh alur order → `../Orders/`.
- Wallet dibuat saat user register → `../Authentication/`.
- Keputusan order sebagai aggregate (escrow tidak dikelola offer langsung) → `../../04_Decisions/ADR-003.md`.
- Skema & relasi → `50_Database.md`.
