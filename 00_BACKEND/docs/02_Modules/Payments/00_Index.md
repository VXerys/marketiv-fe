# Modul Payments

Sistem finansial Marketiv: wallet per user, ledger transaksi, escrow (held/released/refunded), dan penarikan dana (withdrawal) dengan persetujuan admin. Modul ini memiliki data `wallets`, `transactions`, `escrows`, dan `withdrawals`.

## Daftar Dokumen

- `10_Overview.md` — Wallet, ledger transaksi, escrow, withdrawal.
- `20_Concepts.md` — Istilah & konsep domain Payments.
- `30_Business_Rules.md` — Balance vs pendingBalance, tipe transaksi, status escrow, aturan withdraw.
- `40_User_Flow.md` — Alur pembayaran order, withdrawal, top up.
- `50_Database.md` — Skema, relasi, dan index koleksi `wallets`, `transactions`, `escrows`, `withdrawals`.
- `60_API.md` — Kontrak Wallet Service (getWallet, requestWithdraw) & escrow functions.
- `70_Backend.md` — Appwrite Functions untuk escrow, wallet, withdrawal.
- `80_Frontend.md` — Halaman & komponen payments.
- `90_Events.md` — Event create-user-wallet, Escrow Hold, Release Escrow, Withdraw Requested.
- `100_Testing.md` — Skenario uji wallet, transaksi, escrow, withdrawal.
