# Payments — Testing

## Wallet

- Wallet terbuat otomatis saat user register.
- Satu user hanya punya satu wallet.
- Balance tidak bisa negatif.

## Transaction

- Setiap mutasi saldo tercatat di `transactions`.
- Tipe transaksi sesuai definisi (deposit, withdrawal, dll).
- ReferenceId mengarah ke dokumen terkait.

## Escrow

- Escrow terbuat saat payment sukses (status `held`).
- Release escrow → balance Creator bertambah.
- Refund escrow → balance UMKM kembali.
- Escrow tidak bisa diubah oleh user.

## Withdrawal

- Withdrawal valid (balance cukup, min amount terpenuhi) → status `pending`.
- Withdrawal invalid (balance kurang) → error.
- Admin approve → balance berkurang, status `processed`.
- Admin reject → balance dikembalikan, status `rejected`.
