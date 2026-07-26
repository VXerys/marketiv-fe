# Modul Payments

Sistem finansial Marketiv: payment gateway Midtrans, wallet per user, ledger transaksi, escrow (held/released/refunded), dan penarikan dana (withdrawal) langsung cair tanpa review admin. Modul ini memiliki data `payments`, `wallets`, `transactions`, `escrows`, dan `withdrawals`.

## Daftar Dokumen

- `10_Overview.md` — Midtrans, wallet, ledger transaksi, escrow, withdrawal.
- `20_Concepts.md` — Istilah & konsep domain Payments.
- `30_Business_Rules.md` — Midtrans payment, balance vs pendingBalance, tipe transaksi, status escrow, aturan withdraw.
- `40_User_Flow.md` — Alur pembayaran order, withdrawal, top up.
- `50_Database.md` — Skema, relasi, dan index koleksi `wallets`, `transactions`, `escrows`, `withdrawals`.
- `60_API.md` — Kontrak Payment Service, Wallet Service, webhook Midtrans, dan escrow functions.
- `70_Backend.md` — Appwrite Functions untuk Midtrans payment, escrow, wallet, withdrawal.
- `80_Frontend.md` — Halaman & komponen payments.
- `90_Events.md` — Event create-user-wallet, Escrow Hold, Release Escrow, Withdraw Requested.
- `100_Testing.md` — Skenario uji wallet, transaksi, escrow, withdrawal.
