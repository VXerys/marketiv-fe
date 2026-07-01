# Workflow: Withdrawal

## Purpose

Creator menarik saldo available dari wallet ke bank/e-wallet, dengan validasi saldo & minimum dan review admin sebelum dana ditransfer.

## Modules Involved

- [Payments](../02_Modules/Payments/00_Index.md) — wallet, withdrawal, transaksi.
- Admin — review & eksekusi transfer.

## Trigger

Creator submit `Withdraw Request` dari Wallet (bank, account name, account number, amount).

## Step-by-step Flow

1. **Payments** — `requestWithdraw()` divalidasi: `availableBalance >= amount` dan `amount >= min withdraw`.
2. **Event `withdrawals.create`** memicu `create-withdrawal`: buat `withdrawals` (`status: pending`), kurangi available balance (hold).
3. **Admin** — Withdraw Queue → review request.
4. **Admin** — Keputusan:
   - **Approve** → transfer manual ke bank/e-wallet → `withdrawals.status pending → completed`.
   - **Reject** → beri alasan → saldo dikembalikan ke available balance.
5. **Event `withdrawals.status (pending→completed)`** memicu `complete-withdrawal`: mark completed, catat transaksi, kirim notifikasi.
6. **Payments** — Update wallet (`withdrawn` bertambah) & transaction history.

## Events / Functions

- `withdrawals.create` → `create-withdrawal`
- `withdrawals.status (pending→completed)` → `complete-withdrawal`
- Lihat: [`../02_Modules/Payments/90_Events.md`](../02_Modules/Payments/00_Index.md).

## Edge Cases

- Saldo kurang dari amount → ditolak saat validasi (sebelum buat record).
- Amount di bawah minimum withdraw → ditolak.
- Reject admin → saldo wajib dikembalikan penuh (invariant: tidak ada saldo hilang).
- Hanya saldo **available** yang bisa ditarik (pending & escrow tidak).

## Links

- [Payments](../02_Modules/Payments/00_Index.md)
