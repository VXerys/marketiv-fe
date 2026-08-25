# Phase 06 — Tasks

## A. Staging Inventory
- [x] Record deployed commit/config.
- [x] Query wallets pending balance.
- [x] Query legacy campaign release/mature ledgers.
- [x] Query withdrawal processing rows.
- [x] Query Iris reference rows.
- [x] Record counts without PII.

## B. Reconcile
- [x] Resolve/allow legacy pending rewards safely (inventory zero; no mutation required).
- [x] Resolve/wait legacy Iris processing safely (inventory zero; no mutation required).
- [x] Verify no legacy dependency discrepancy.
- [x] Do not zero balances manually.

## C. Retire
- [x] Disable/remove maturation schedule safely.
- [x] Disable legacy callback only after zero dependency.
- [x] Keep Midtrans payment webhook.
- [x] Regenerate Appwrite config.
- [x] Apply affected runtime Function config and verify live.

## D. Documentation
- [x] Update current withdrawal workflow docs.
- [x] Update current finance feature docs.
- [x] Mark legacy Iris/maturation docs superseded where needed.

## E. Staging UAT Success

> BLOCKED: authenticated Creator/Admin sessions, confirmed web deployments, and authorized manual-transfer procedure unavailable in this run. See `STAGING_UAT_REPORT.md`.
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

> BLOCKED for the same runtime-access reasons. No PASS claimed.
- [ ] controlled fail/reject.
- [ ] balance reversal exactly once.
- [ ] reversal ledger.
- [ ] repeated action no double-credit.

## G. Final Report
- [x] changed files.
- [x] schema/config deployment.
- [x] deployed Function list.
- [x] tests/build exact results.
- [ ] runtime UAT evidence (BLOCKED).
- [x] remaining risks.
- [x] production rollout checklist.

## Final Acceptance
Hanya setelah seluruh gate terpenuhi redesign boleh disebut staging-ready.
