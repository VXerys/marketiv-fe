# Phase 02 — Requirements: Withdrawal Request Stops at Manual Queue

## Objective
Mengubah `request-withdrawal` dari automated payout menjadi **manual-admin request creation**.

## Desired Behavior
Function berhenti setelah:
1. validasi selesai,
2. withdrawal row `requested` dibuat,
3. available balance di-debit atomik,
4. withdrawal ledger dibuat pending,
5. notification “pengajuan diterima” dibuat,
6. response dikembalikan.

Tidak ada payout network call.

## Requirements

### R1 — Preserve existing guards
Jangan mengurangi current authenticated user, eligible role, active account, TOS, first-withdraw email verification, KYC threshold, minimum withdrawal, daily limit, account cooling, duplicate/requestKey, dan sufficient balance checks tanpa alasan.

### R2 — Atomic reserve
Accepted request harus mengurangi `wallet.balance` atomik.

### R3 — Requested state
Row tetap `status = requested`; jangan langsung set `processing`.

### R4 — Ledger pending
Primary transaction withdrawal merepresentasikan dana reserved tetapi belum dikirim, sehingga status awal bukan final `completed`.

### R5 — No payout provider
Remove active Iris call dari Function ini. Jangan ganti dengan provider lain.

### R6 — No premature success
Response merepresentasikan request acceptance, bukan transfer final. Recommended response:
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

### R7 — Notification
Wording: pengajuan diterima, saldo sudah dialokasikan/reserved, withdrawal **umumnya** diproses 1–2 hari kerja. Jangan menyebut bank sedang memproses.

### R8 — Failure before persistence
Jika atomic debit gagal, jangan tinggalkan authoritative requested row yang terlihat valid.

### R9 — Preserve legacy callback temporarily
Jangan delete/disable `withdrawal-callback` pada fase ini karena legacy Iris withdrawal mungkin masih processing.

## Acceptance Criteria
- Valid request menghasilkan `withdrawals.status = requested`.
- Balance turun sekali.
- Primary transaction pending/non-final.
- Tidak ada call Iris/provider.
- Duplicate request tidak double-debit.
- Insufficient balance tidak sukses.
- No `processing` auto-transition.
- No payout-success copy.
- Existing UMKM withdrawal eligibility, jika masih current, tidak diremove sebagai collateral regression.
- Legacy callback tetap tersedia.
