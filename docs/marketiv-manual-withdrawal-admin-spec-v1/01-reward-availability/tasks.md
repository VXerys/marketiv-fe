# Phase 01 — Tasks

## A. Audit
- [ ] Record current staging HEAD.
- [ ] Re-read `calculate-campaign-reward`.
- [ ] Confirm current 72h rule via `review-submission`.
- [ ] Re-read `mature-pending-balance`.
- [ ] Inspect reward tests.
- [ ] Confirm Rate Card path separate.

## B. Implement
- [ ] Credit Campaign reward to `wallet.balance`.
- [ ] Do not increment `pendingBalance` for new reward.
- [ ] Update comments/logs/notification.
- [ ] Preserve idempotency guard.
- [ ] Preserve `remainingBudget` / `spentAmount`.

## C. Tests
- [ ] approved reward → balance increases.
- [ ] pendingBalance unchanged.
- [ ] duplicate event → no duplicate reward.
- [ ] rejected → no reward.
- [ ] budget accounting exact.
- [ ] 72h eligibility unaffected.
- [ ] Rate Card regression not introduced.

## D. Verification
- [ ] targeted backend tests.
- [ ] Function syntax check.
- [ ] relevant lint/test commands.
- [ ] report exact results.

## Acceptance Gate
Do not continue to Phase 02 until new Campaign reward is directly withdrawable balance, budget remains correct, and legacy maturation remains available for old pending data.
