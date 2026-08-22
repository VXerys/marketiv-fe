# Phase 06 — Tasks

## A. Staging Inventory
- [ ] Record deployed commit/config.
- [ ] Query wallets pending balance.
- [ ] Query legacy campaign release/mature ledgers.
- [ ] Query withdrawal processing rows.
- [ ] Query Iris reference rows.
- [ ] Record counts without PII.

## B. Reconcile
- [ ] Resolve/allow legacy pending rewards safely.
- [ ] Resolve/wait legacy Iris processing safely.
- [ ] Verify no money discrepancy.
- [ ] Do not zero balances manually.

## C. Retire
- [ ] Disable/remove maturation schedule safely.
- [ ] Disable legacy callback only after zero dependency.
- [ ] Keep Midtrans payment webhook.
- [ ] Regenerate Appwrite config.
- [ ] Redeploy affected config/Functions.

## D. Documentation
- [ ] Update current withdrawal workflow docs.
- [ ] Update current finance feature docs.
- [ ] Mark legacy Iris/maturation docs superseded where needed.

## E. Staging UAT Success
- [ ] approved Campaign reward → balance.
- [ ] creator request → requested.
- [ ] balance reserved.
- [ ] admin queue visible.
- [ ] start processing.
- [ ] manual transfer UAT.
- [ ] mark succeeded with reference.
- [ ] creator final state.
- [ ] ledger consistency.

## F. Staging UAT Failure
- [ ] controlled fail/reject.
- [ ] balance reversal exactly once.
- [ ] reversal ledger.
- [ ] repeated action no double-credit.

## G. Final Report
- [ ] changed files.
- [ ] schema/config deployment.
- [ ] deployed Function list.
- [ ] tests/build exact results.
- [ ] runtime UAT evidence.
- [ ] remaining risks.
- [ ] production rollout checklist.

## Final Acceptance
Hanya setelah seluruh gate terpenuhi redesign boleh disebut staging-ready.
