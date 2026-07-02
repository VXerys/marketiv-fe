# Payments — User Flow

## Alur Pembayaran Order

```text
UMKM checkout order (pending_payment)
↓
Bayar → payment success
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
Input: amount, bank, account number, account name
↓
Submit → status pending (tunggu admin review)
↓
Admin approve → dana transfer → status processed
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
Bayar via payment gateway
↓
Saldo bertambah (deposit transaction)
```
