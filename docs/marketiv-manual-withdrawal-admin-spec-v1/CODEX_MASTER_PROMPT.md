# Codex Master Prompt — Manual Admin Withdrawal

You are working at repository root `marketiv-id/marketiv-web`.

Implement the manual-admin withdrawal redesign using:
`docs/marketiv-manual-withdrawal-admin-spec-v1`

## Mandatory order
1. `01-reward-availability`
2. `02-manual-withdrawal-request`
3. `03-admin-withdrawal-backend`
4. `04-admin-withdrawal-ui`
5. `05-creator-finance-ui-contract`
6. `06-legacy-retirement-and-staging-uat`

Do NOT combine phases.

## Current-repo authority
Before editing:
- ensure current `staging`,
- record HEAD,
- baseline spec: `05da858b3537b86a170147ffb23d6ed34def2c33`,
- current code wins if different,
- report conflicts before risky assumptions,
- never undo newer unrelated work.

## Hard constraints
- No unrelated refactor.
- Preserve current 72h Campaign view observation rule.
- Preserve admin authority for final views.
- Do not merge Campaign and Rate Card logic.
- No automated payout provider in new withdrawal path.
- Midtrans payment for UMKM remains untouched.
- All wallet mutations remain server-side.
- Request withdrawal reserves/debits balance atomically.
- Admin is only authority for processing/final success.
- Reversal must be idempotent.
- `campaigns.spentAmount` tracks approved reward allocation, not withdrawal success.
- Do not invent merchant settlement state.
- Do not delete legacy data/functions before reconciliation.
- Do not expose secrets.
- Maintain loading/error/empty/validation/auth/edge states.
- Generated Appwrite config comes from canonical generator.

## Per-phase procedure
For ONE phase only:
1. Read top-level docs + active phase requirements/design/tasks.
2. Audit current code: behavior, root cause, exact files, schema/deployment impact, conflicts, plan.
3. Implement only active phase.
4. Run targeted tests/typecheck/lint/build/syntax as appropriate.
5. Report diagnosis, changed files, schema, behavior, exact verification, deployment steps, risks.
6. STOP and wait for user.

Do not claim staging runtime success unless actual deployment + UAT was performed.
