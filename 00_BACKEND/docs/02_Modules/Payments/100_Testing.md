# Payments — Testing

## Service Layer (`payment.service.ts`, `wallet.service.ts`)

### Create Payment (`createPayment`)

- Input valid → panggil function `create-payment` → return `{ paymentId, gateway: 'midtrans', snapToken, redirectUrl, status }`.
- `amount` bukan integer >0 → throw `PaymentServiceError('validation', 'Jumlah pembayaran tidak valid.')`.
- `purpose` bukan `order`/`topup`/`campaign` → throw `PaymentServiceError('validation', 'Tujuan pembayaran tidak valid.')`.
- `purpose === 'order'` tanpa `orderId` → throw `PaymentServiceError('validation', 'Order wajib diisi untuk pembayaran order.')`.
- `purpose === 'campaign'` tanpa `campaignId` → throw `PaymentServiceError('validation', 'Campaign wajib diisi untuk top-up campaign.')`.
- `purpose === 'topup'` dengan `orderId` → throw `PaymentServiceError('validation', 'Top up tidak boleh memakai order.')`.
- `purpose === 'campaign'` → `totalAmount = amount + floor(amount ×5%)` (fee 5% via `calculateTotalPayment`).
- `purpose === 'order'` → `totalAmount = amount` (tanpa fee, fee dipotong saat release escrow).
- Function gagal → throw `PaymentServiceError('server', 'Gagal membuat pembayaran. Coba lagi.')`.
- Response tidak lengkap (tanpa `paymentId`/`gateway`/`status`) → throw `PaymentServiceError('server', 'Response pembayaran tidak lengkap.')`.

> ✅ **Sudah diperbaiki**: Function `create-payment` sekarang menerima `purpose: 'campaign'`
> (ditambah ke `PURPOSES`), dan `create-escrow` menjalankan `purpose: 'campaign'`
> melalui jalur `completeTopup` yang mengkredit **wallet.balance** (sama seperti `topup`).
> Model dompet: UMKM top-up campaign → saldo wallet bertambah (besaran `amount`/budget bersih,
> fee 5% menjadi pendapatan platform karena `totalAmount = amount + fee` yang dibayar ke Midtrans);
> saat UMKM membeli order → saldo berkurang via `create-escrow` → `release-escrow` mencairkan
> ke wallet creator. Sesuai dengan `60_API.md` (`purpose: order|topup|campaign`).

### Get Payment (`getPayment`, `getPayments`)

- `getPayment(paymentId)` → return `Payment` milik user; bukan owner → throw `forbidden`.
- `getPayments()` → list payment milik user, filter `status`/`purpose` opsional.
- `paymentId` kosong → throw `PaymentServiceError('validation', 'Payment ID wajib diisi.')`.

### Pure Functions (`wallet.service.ts`)

- `calculatePlatformFee(nominal)` = `Math.floor(nominal × 0.05)`.
- `calculateTotalPayment(nominal)` = `nominal + calculatePlatformFee(nominal)`.
- `calculateCreatorPayout(nominal)` = `nominal - calculatePlatformFee(nominal)`.
- `MINIMUM_WITHDRAW` = 50000; `MINIMUM_CAMPAIGN_BUDGET` = 50000; `PLATFORM_FEE_RATE` = 0.05.
- `WITHDRAW_PAYOUT_METHODS` = `['bank', 'ewallet']`.

### Wallet (`getWallet`, `getTransactions`, `getWithdrawals`, `requestWithdraw`)

- `getWallet()` → return `Wallet` (balance, pendingBalance); tidak ada → throw `not_found`.
- `getTransactions()` → list `transactions` urut terbaru, filter `type` opsional.
- `getWithdrawals()` → list `withdrawals` urut terbaru, filter `status` opsional.
- `requestWithdraw()` valid (amount ≥ 50000, balance cukup, payout lengkap) → dokumen `withdrawals` status `processed`, balance berkurang, transaksi tercatat.
- `requestWithdraw()` amount <50000 → throw `WalletServiceError('validation', 'Minimum penarikan Rp50.000')`.
- `requestWithdraw()` balance < amount → throw `WalletServiceError('validation', 'Saldo tidak mencukupi')`.
- `requestWithdraw()` payout method invalid → throw `WalletServiceError('validation', 'Metode penarikan tidak valid')`.
- `requestWithdraw()` data tujuan kosong → throw `WalletServiceError('validation', 'Lengkapi data penarikan')`.

## Midtrans Payment Gateway (Appwrite Function `create-payment`, `midtrans-webhook`)

- `create-payment` membuat dokumen `payments` status `pending` dan mengembalikan `snapToken`/`redirectUrl` Midtrans.
- Frontend tidak menerima atau menyimpan Midtrans secret key.
- Webhook Midtrans dengan signature valid mengubah status payment menjadi `paid`.
- Webhook Midtrans dengan signature/amount invalid ditolak dan tidak mengubah payment.
- Webhook berulang untuk `gateway_reference` yang sama tidak menggandakan escrow, deposit, atau ledger transaction.
- Webhook untuk payment yang sudah final tidak menurunkan status payment.

## Wallet (Appwrite Function `create-user-wallet`)

- Wallet terbuat otomatis saat user register (trigger `users.create`).
- Satu user hanya punya satu wallet (idempotent).
- Balance tidak bisa negatif.

## Transaction

- Setiap mutasi saldo tercatat di `transactions`.
- Tipe transaksi sesuai definisi (`deposit`, `withdrawal`, `payment`, `refund`, `release`, `fee`).
- ReferenceId mengarah ke dokumen terkait.

## Escrow (Appwrite Function `create-escrow`, `release-escrow`)

- Escrow terbuat saat payment sukses (status `held`) → trigger `payments.status` `pending → paid`.
- Release escrow → balance Creator bertambah (via `release-escrow` trigger `deliverables.status → approved`).
- Refund escrow → balance UMKM kembali.
- Escrow tidak bisa diubah oleh user (admin/system only).

## Withdrawal (`requestWithdraw`)

- Withdrawal valid (balance cukup, min amount terpenuhi) → balance langsung berkurang, status `processed`, transaksi tercatat.
- Withdrawal invalid (balance kurang) → error.
- Withdrawal invalid (payout method tidak valid atau data tujuan pencairan tidak lengkap) → error.
- Withdrawal bank dan e-wallet menyimpan `payoutMethod`, `providerName`, `accountNumber`, dan `accountName`.
- Withdrawal langsung diproses tanpa review admin.
