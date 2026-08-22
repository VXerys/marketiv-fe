# Phase 05 — Tasks

## A. Audit
- [ ] Confirm exact Phase 02 request response.
- [ ] Confirm Phase 03 transaction transitions.
- [ ] Re-read domain types.
- [ ] Re-read creator Appwrite service.
- [ ] Re-read finance UI.
- [ ] Re-read status badge mapping.

## B. Contract
- [ ] Update WithdrawalStatus.
- [ ] Update WithdrawalReceipt.
- [ ] Update mocks/service wrapper.
- [ ] Remove legacy processed assumptions.

## C. UI
- [ ] Apply authoritative `balanceAfter`.
- [ ] Create pending local transaction row.
- [ ] Change success modal to request-accepted state.
- [ ] Use 1–2 day non-hard SLA copy.
- [ ] Remove “Selesai” before admin transfer.
- [ ] Ensure filters/badges support new statuses.

## D. Tests
- [ ] request accepted UI.
- [ ] balanceAfter handling.
- [ ] pending transaction row.
- [ ] error path.
- [ ] duplicate/network retry does not invent success.
- [ ] status badges.
- [ ] existing transaction filters unaffected.

## E. Verification
- [ ] root typecheck.
- [ ] root lint.
- [ ] targeted tests.
- [ ] root build.
- [ ] exact results report.

## Acceptance Gate
Creator side wajib membedakan dengan jelas `withdrawal request accepted` vs `money successfully transferred`.
