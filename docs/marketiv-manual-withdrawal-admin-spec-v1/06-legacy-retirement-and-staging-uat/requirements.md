# Phase 06 — Requirements: Legacy Retirement, Documentation, Staging UAT

## Objective
Meretire fixed maturation dan Iris callback dengan aman setelah memastikan tidak ada legacy money state yang bergantung padanya, lalu menjalankan staging UAT end-to-end.

## Critical Rule
**Jangan disable legacy mechanism hanya karena code baru sudah selesai. Audit data staging terlebih dahulu.**

## Legacy Inventory Required

### Campaign pending
Periksa:
- wallets dengan `pendingBalance > 0`,
- campaign reward transactions yang belum matured,
- mature ledger state.

### Iris withdrawal
Periksa:
- withdrawals `processing`,
- rows dengan `iris_reference`,
- callback dependencies.

Evidence wajib berasal dari actual staging Appwrite, bukan asumsi.

## Maturation Retirement
Jika masih ada legacy `pendingBalance > 0`:
- jangan nol-kan manual,
- jangan delete ledger,
- keep maturation temporarily atau implement separately audited one-time reconciliation jika benar-benar dibutuhkan.

Default conservative option: biarkan legacy maturation drain, baru disable schedule setelah aman.

## Iris Callback Retirement
Jika ada legacy Iris `processing` withdrawal, keep callback sampai terminal. Setelah nol dependency, disable callback execution/public entry sesuai current Appwrite config. Jangan disable `midtrans-webhook` payment Function.

## Documentation
Audit/update current docs yang masih menyebut 7-day maturation atau Iris payout sebagai current, minimal:
- `00_BACKEND/docs/03_Workflows/50_Withdrawal.md`
- `docs/marketiv-md/features/11-finance-escrow-wallet-and-withdrawal.md`
- relevant current payment/backend docs
- current ADR/docs yang mengklaim legacy behavior

Historical artifacts jangan ditulis ulang tanpa alasan; tandai superseded bila relevan.

## Staging UAT Success
1. creator memiliki available balance dari approved Campaign reward,
2. creator request withdrawal,
3. balance reserved/debited,
4. withdrawal muncul requested di admin,
5. admin starts processing,
6. admin menjalankan UAT manual transfer procedure,
7. admin marks succeeded dengan transfer reference,
8. creator melihat final transaction setelah reload,
9. no Iris call,
10. rows/ledger konsisten.

## Staging UAT Failure
1. controlled test withdrawal,
2. admin fail/reject,
3. wallet balance restored sekali,
4. reversal ledger ada,
5. repeated action tidak double-credit.

## Acceptance Criteria
- Legacy pending reward inventory zero atau explicitly reconciled.
- Legacy Iris processing zero sebelum callback disable.
- Maturation schedule retired safely.
- Callback retired safely.
- `midtrans-webhook` tetap active.
- Current docs menjelaskan manual admin flow.
- Success + failure UAT evidence tercatat.
- No E2E-pass claim tanpa runtime evidence.
