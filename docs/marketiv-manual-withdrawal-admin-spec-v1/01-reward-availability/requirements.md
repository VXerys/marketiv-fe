# Phase 01 — Requirements: Campaign Reward Becomes Available After Admin Approval

## Objective
Menghapus fixed 7-day maturation untuk **reward Campaign baru** tanpa merusak current Campaign budget accounting atau Rate Card.

## Current Behavior
`calculate-campaign-reward` saat ini menambah reward ke `wallet.pendingBalance`; `mature-pending-balance` baru memindahkannya ke `balance` setelah 7 hari.

## Desired Behavior
Untuk reward Campaign baru setelah admin approval:
```text
wallet.balance += reward
wallet.pendingBalance unchanged
```
Budget accounting tetap:
```text
remainingBudget -= reward
spentAmount += reward
```

## Functional Requirements

### R1 — Direct available balance
Reward Campaign baru langsung menambah `wallet.balance`.

### R2 — Pending balance untouched
Jangan menghapus field `pendingBalance` dan jangan memindahkan legacy pending data pada fase ini.

### R3 — Existing reward idempotency preserved
Existing guard berdasarkan transaction/reference submission harus tetap mencegah duplicate reward.

### R4 — Campaign budget invariant preserved
Reward hanya boleh mengurangi budget sekali.

### R5 — Current admin validation preserved
Jangan mengubah `review-submission`, `views_final`, `views_count`, `views_source = manual_admin`, atau current 72-hour observation eligibility.

### R6 — Rate Card unaffected
`release-escrow` dan Rate Card wallet behavior tidak boleh berubah.

### R7 — Notification aligned
Notification tidak boleh menyebut “pending balance” untuk reward baru.

## Acceptance Criteria
- Approved Campaign submission menambah `wallet.balance` tepat sebesar reward.
- `wallet.pendingBalance` tidak bertambah untuk reward baru.
- `transactions` tetap punya satu authoritative reward ledger per submission.
- `campaign.remainingBudget` turun tepat sekali.
- `campaign.spentAmount` naik tepat sekali.
- Duplicate event tidak duplicate reward.
- Rejected submission tidak menghasilkan reward.
- Current 72h observation behavior tetap pass.
- Rate Card tidak regress.
- `mature-pending-balance` belum dihapus/dimatikan pada fase ini.
