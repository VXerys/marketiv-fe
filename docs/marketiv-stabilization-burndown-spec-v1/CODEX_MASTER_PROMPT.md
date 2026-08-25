# CODEX MASTER PROMPT — Marketiv Stabilization Burn-down v1

You are the primary engineering agent for a Marketiv stabilization run.

Repository:
`marketiv-id/marketiv-web`

Target branch:
`staging`

Specification root:
`docs/marketiv-stabilization-burndown-spec-v1/`

Read ALL of these before implementation:

1. `00_README.md`
2. `01_SOURCE_OF_TRUTH_AND_CURRENT_FINDINGS.md`
3. `02_SCOPE_AND_GUARDRAILS.md`
4. `03_BACKLOG_RECONCILIATION.md`
5. `04_EXECUTION_STRATEGY.md`
6. all files under `specs/01-admin-verified-views/`
7. all files under `specs/02-ratecard-collab-settlement/`
8. all files under `specs/03-fee-disclosure/`
9. all files under `specs/04-ratecard-specs-regression/`
10. all files under `specs/05-non-withdrawal-uat/`
11. all files under `specs/06-campaign-polish/`
12. all files under `specs/07-playwright-critical/`
13. `07_FINAL_VERIFICATION_MATRIX.md`
14. `08_DEPLOYMENT_HANDOFF.md`
15. `09_TRELLO_STATUS_MATRIX.md`

==================================================
MISSION
==================================================

Resolve as many CURRENT, REAL, non-withdrawal Marketiv bugs and correctness
gaps as possible in this stabilization run.

Trello is backlog/acceptance context.

CURRENT LOCAL REPOSITORY is implementation source of truth.

Do not blindly implement stale Trello descriptions.

==================================================
ABSOLUTE RULE — DO NOT TOUCH WITHDRAWAL
==================================================

Withdrawal is being developed by another backend teammate.

You MUST NOT modify withdrawal-specific:

- frontend
- backend
- Functions
- callback
- schema
- payout state machine
- Midtrans Iris
- tests
- docs/specs

The withdrawal P0 Trello card is OUT OF SCOPE.

The withdrawal portion of QA debt/UAT is OUT OF SCOPE.

Before edits record dirty files.

After every major batch run:

`git diff --name-only`

If this stabilization work has touched withdrawal-specific files:
remove only YOUR stabilization changes from those files and choose a narrower
solution.

Do not destroy pre-existing teammate changes.

==================================================
PHASE 0 — BASELINE AND RECONCILIATION
==================================================

Before editing, output:

- current branch
- current HEAD SHA
- git status --short
- dirty files
- package scripts relevant to verification

Then reconcile Trello candidate cards against current code.

Classification:

- OPEN
- ALREADY_FIXED
- VERIFY_ONLY
- BLOCKED
- OUT_OF_SCOPE_WITHDRAWAL

Keep this audit focused and time-bounded.

Do not perform unrelated architecture analysis.

==================================================
EXECUTION ORDER
==================================================

1. P0 Admin verified views
2. P0 Rate Card Collab Post settlement safety
3. P1 fee disclosure/config consistency
4. verify/fix SVG typecheck only if current failure exists
5. verify Rate Card Spec 01 payment idempotency
6. verify Rate Card Spec 02 room sync/payment handoff
7. verify Rate Card Spec 03 package provenance
8. run/fix non-withdrawal UAT gaps
9. Campaign correctness polish if higher priority work is stable
10. implement/update Playwright critical Campaign + Rate Card coverage
11. run full final verification
12. produce deployment handoff
13. produce Trello status proposal

==================================================
IMPLEMENTATION RULES
==================================================

Do not create one giant architecture rewrite.

For every real bug:

1. reproduce/confirm current failure;
2. identify root cause;
3. trace affected data flow;
4. implement smallest production-grade fix;
5. add regression test;
6. run targeted verification;
7. continue.

Preserve:
- current Appwrite architecture;
- current service/facade conventions;
- current auth boundaries;
- Campaign vs Rate Card separation.

Financial operations:
- server-authoritative;
- retry-safe;
- no client false success;
- no duplicate wallet mutation.

==================================================
BUSINESS RULE SAFETY
==================================================

DO NOT INVENT BUSINESS POLICY.

For Admin verified views:
do not invent a random maximum.

Find current documented/canonical policy.

If absent:
fix safe-number/objective validation and explicitly classify missing
business plausibility maximum as `BLOCKED_BY_BUSINESS_RULE`.

For Collab Post:
do not pretend URL regex proves collaboration.

If no trusted platform/provider/manual validation source exists:
do not fake it.

Implement only truthful guardrails and report
`BLOCKED_BY_PROVIDER_CAPABILITY` or `BLOCKED_BY_BUSINESS_RULE`
for the missing trust source.

==================================================
SCHEMA RULES
==================================================

If schema changes are needed:

- find canonical Appwrite schema source;
- edit canonical source;
- regenerate derived config using current repo workflow;
- do not manually fork generated files;
- preserve legacy rows intentionally;
- add minimum indexes only when required;
- document migration order.

Do not deploy automatically unless explicitly instructed.

==================================================
TEST STRATEGY
==================================================

User wants comprehensive testing AFTER fixes.

You MAY run targeted tests after each risky P0 batch.

Do not repeatedly run the full suite after every small edit.

At end execute the complete
`07_FINAL_VERIFICATION_MATRIX.md`.

If full suite has existing failures:
report them separately and prove touched-domain targeted tests pass.

Do not hide failures.

==================================================
UAT RULE
==================================================

UAT card != bug ticket.

If scenario passes:
do nothing.

If scenario fails:
- isolate root cause;
- fix minimally;
- regression test;
- re-run.

Provider/deployment-only scenario:
mark runtime pending.

Never claim staging runtime PASS if not actually run.

==================================================
PLAYWRIGHT
==================================================

Improve critical automated E2E for:

1. Campaign submission/Admin/fraud/verified views
2. Rate Card package→offer→payment→escrow→deliverable→settlement

Withdrawal is excluded.

Do not use production data.

Use isolated fixtures and cleanup.

Where provider Sandbox cannot be deterministic:
separate deterministic automation from manual staging smoke.

==================================================
TRELLO
==================================================

Do not automatically move/update Trello cards.

Final response must propose status changes.

User will approve Trello mutations separately.

==================================================
FINAL REPORT — REQUIRED FORMAT
==================================================

## 1. Baseline
- starting branch
- starting HEAD
- starting dirty files

## 2. Backlog Reconciliation
Table:
Trello card | classification | evidence | action

## 3. Fixed P0 Issues
For each:
- diagnosis
- root cause
- implementation
- changed files
- tests

## 4. Fixed P1 Issues
Same structure.

## 5. Already Fixed / Verify-only
Spec 01/02/03 and stale cards.

## 6. Blocked
- business rule
- provider
- environment
with exact reason.

## 7. UAT Findings
- scenario
- pass/fail
- bug fixed if any
- runtime pending

## 8. Changed Files
Grouped:
- root frontend
- Admin
- backend Functions
- schema/config
- tests
- docs

## 9. Withdrawal Protection
Explicit statement:
- whether any withdrawal-specific file changed
- if zero, state zero
- confirm withdrawal behavior untouched

## 10. Schema Changes
- collection
- attribute
- index
- compatibility
- deploy order

## 11. Functions to Redeploy
Exact names + reasons.

## 12. Frontend/Admin Deploy
Exact applications requiring redeploy.

## 13. Automated Verification
Exact commands + results.

## 14. Full Suite
Counts and failures.

## 15. Playwright
Exact scenarios + results.

## 16. Manual Staging Verification Remaining
Exact checklist.

## 17. Trello Status Proposal
Use statuses:
- FIXED_AND_AUTOMATED_VERIFIED
- ALREADY_FIXED_VERIFIED
- CODE_FIXED_RUNTIME_PENDING
- RUNTIME_VERIFIED
- BLOCKED_BY_BUSINESS_RULE
- BLOCKED_BY_PROVIDER_CAPABILITY
- BLOCKED_BY_ENV_DEPLOYMENT
- OUT_OF_SCOPE_WITHDRAWAL
- DEFERRED_POLISH

## 18. Remaining Risks
Only concrete unresolved risk.

==================================================
STOP CONDITION
==================================================

Stop after final report.

Do not begin withdrawal work.

Do not mutate Trello unless explicitly asked.

Do not deploy destructive Appwrite changes unless explicitly authorized.
