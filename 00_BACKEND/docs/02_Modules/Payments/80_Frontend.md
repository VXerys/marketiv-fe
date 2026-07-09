# Payments — Frontend

## Halaman

### Wallet Dashboard

- Tampilkan `balance` (tersedia) dan `pendingBalance`.
- Riwayat transaksi (type, amount, date, status).
- Tombol Top Up (UMKM) / Tarik Dana (Creator).

### Top Up

- Form input amount.
- Integrasi payment gateway.

### Withdrawal

- Form: amount, bank name, account number, account name.
- Validasi: min amount, balance cukup.
- Riwayat withdrawal.

### Admin: Withdrawal Review

- Daftar withdrawal pending.
- Approve / Reject dengan catatan.

## Komponen

- `WalletCard` — ringkasan saldo.
- `TransactionList` — daftar transaksi.
- `WithdrawForm` — form tarik dana.
- `AdminWithdrawReview` — panel admin untuk review withdrawal.
