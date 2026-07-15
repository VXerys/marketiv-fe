# Payments — Concepts

## Istilah

- **Wallet** — dompet digital setiap user, menyimpan `balance` (tersedia) dan `pendingBalance` (belum cair).
- **Payment Gateway** — penyedia pembayaran eksternal. Marketiv menggunakan **Midtrans** untuk menerima pembayaran UMKM.
- **Payment** — payment intent/order pembayaran yang dibuat ke Midtrans dan disimpan lokal untuk melacak status.
- **Transaction** — ledger mutasi saldo (deposit, withdrawal, payment, refund, release, fee).
- **Escrow** — mekanisme penahanan dana hingga deliverable disetujui.
- **Withdrawal** — pencairan dana dari wallet ke rekening bank/e-wallet.

## Status Payment

`pending → paid | failed | expired | cancelled`

## Status Escrow

`held → released | refunded`

## Status Withdrawal

`pending → processed | rejected`

## Konsep

- Satu user = satu wallet.
- Satu pembayaran order/top up = satu dokumen `payments` dengan `gateway = midtrans`.
- `gateway_reference` menyimpan `order_id` Midtrans dan harus unik.
- Payment dianggap sukses hanya setelah webhook Midtrans tervalidasi dan status internal berubah menjadi `paid`.
- Escrow & transactions dipisah secara skema (domain sensitif vs ledger).
- User tidak bisa mengubah saldo sendiri; mutasi hanya oleh sistem/admin.
- Withdrawal perlu persetujuan admin (admin gate).
