# Payments — Concepts

## Istilah

- **Wallet** — dompet digital setiap user, menyimpan `balance` (tersedia) dan `pendingBalance` (belum cair).
- **Transaction** — ledger mutasi saldo (deposit, withdrawal, payment, refund, release, fee).
- **Escrow** — mekanisme penahanan dana hingga deliverable disetujui.
- **Withdrawal** — pencairan dana dari wallet ke rekening bank/e-wallet.

## Status Escrow

`held → released | refunded`

## Status Withdrawal

`pending → processed | rejected`

## Konsep

- Satu user = satu wallet.
- Escrow & transactions dipisah secara skema (domain sensitif vs ledger).
- User tidak bisa mengubah saldo sendiri; mutasi hanya oleh sistem/admin.
- Withdrawal perlu persetujuan admin (admin gate).
