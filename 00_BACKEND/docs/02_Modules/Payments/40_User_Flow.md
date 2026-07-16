# Payments — User Flow

## Alur Pembayaran Order

```text
UMKM checkout order (pending_payment)
↓
Buat payment Midtrans → redirect/Snap token
↓
UMKM bayar di Midtrans
↓
Webhook Midtrans tervalidasi → payment success
↓
Escrow hold → dana ditahan
↓
Creator selesaikan pekerjaan → UMKM approve
↓
Escrow release → saldo masuk wallet Creator
```

## Alur Withdrawal

```text
Creator buka Wallet
↓
Klik "Tarik Dana"
↓
Pilih metode: bank atau e-wallet
↓
Input: amount, provider name, account number/phone, account name
↓
Submit → status pending (tunggu admin review)
↓
Admin approve → dana ditransfer manual → status processed
   atau Admin reject → status rejected
```

## Alur Top Up (UMKM)

```text
UMKM buka Wallet
↓
Klik "Top Up"
↓
Input amount
↓
Buat payment Midtrans → redirect/Snap token
↓
UMKM bayar di Midtrans
↓
Webhook Midtrans tervalidasi
↓
Saldo bertambah (deposit transaction)
```
