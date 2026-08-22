# Phase 05 — Requirements: Creator Finance Contract & UX

## Objective
Menyelaraskan creator finance UI dengan manual-admin withdrawal contract.

## Current Problem
Current creator UI masih memiliki legacy assumptions: withdrawal dianggap processed/completed, success UI menyiratkan dana sedang diproses bank/selesai, dan receipt contract masih legacy.

## Contract Requirements

### WithdrawalStatus
Target backend values:
- `requested`
- `processing`
- `succeeded`
- `failed`
- `reversed`

Jangan reintroduce `processed` jika backend Phase 02/03 tidak memakainya.

### WithdrawalReceipt
Request receipt merepresentasikan request acceptance, bukan transfer final.
Expected shape:
```ts
{
  withdrawalId: string
  amount: number
  status: "requested"
  requestedAt: string
  balanceAfter: number
  transactionId: string | null
}
```
Adapt ke exact Phase 02 response jika current branch berbeda.

## UI Requirements
Setelah request accepted:
- available balance memakai authoritative `balanceAfter`,
- modal mengatakan `Pengajuan Penarikan Terkirim` / `Menunggu Diproses`,
- wording: `umumnya diproses dalam 1–2 hari kerja`,
- jangan mengatakan uang sudah ditransfer,
- jangan menampilkan status final `Selesai`.

New local transaction:
- `type = withdrawal`,
- pending/requested-compatible status,
- createdAt dari request timestamp.

## Transaction History
Saat reload, primary ledger harus mencerminkan perubahan admin. Completed withdrawal tampil berhasil; failed/reversal dapat dipahami. Jangan hitung authority uang client-side.

## Badge Requirements
Pastikan presentation dapat merender pending/requested, processing, completed/succeeded, failed, reversed tanpa mengubah canonical backend status.

## Acceptance Criteria
- Type contract matches backend.
- Request success UI tidak berarti payout success.
- Balance hanya memakai authoritative `balanceAfter`.
- New row pending, bukan completed.
- Copy memakai non-hard SLA 1–2 hari kerja.
- Creator dapat memahami final success/failure setelah reload.
- No direct wallet mutation.
- Existing Campaign/Rate Card transaction history tetap berfungsi.
