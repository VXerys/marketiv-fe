# Requirements — Playwright Critical Regression

## Goal

Convert critical flow tests from placeholder/insufficient coverage into meaningful deterministic release checks where feasible.

## Included

### Flow A — Campaign authority/fraud review

Cover:
- UMKM cannot approve Creator Campaign submission;
- Creator submits proof;
- Admin review authority;
- observation window state if fixture allows;
- verified views validation;
- approve/reject;
- fraud signal does not become final authority;
- reward/ledger outcome only after trusted review.

### Flow B — Rate Card escrow

Cover:
- Creator package published;
- UMKM package selection;
- package provenance;
- Custom Offer;
- Creator accept;
- pending payment;
- payment simulation/stub or Sandbox strategy;
- webhook signature/transition if controllable;
- one escrow;
- deliverable;
- revision/approval;
- Collab validation;
- release exactly once;
- wallet reconciliation.

## Excluded

Withdrawal.

No payout/Iris/withdrawal UI scenario.

## Environment strategy

Never run against production.

Prefer:
- isolated test project/database;
- deterministic seeded fixtures;
- sandbox/stub;
- cleanup.

## External providers

Where real Midtrans Sandbox makes deterministic CI difficult:
- separate local deterministic E2E from runtime staging smoke;
- do not fake a production PASS.

## Failure artifacts

Enable:
- trace on retry/failure;
- screenshot;
- video where current config supports it.

No secrets in artifacts.

## Assertions

Assert business state, not only visible toast.

Bad:
`expect(successToast).toBeVisible()`

Better:
- server order status;
- payment count;
- escrow count;
- wallet delta;
- visible UI matches authoritative state.
