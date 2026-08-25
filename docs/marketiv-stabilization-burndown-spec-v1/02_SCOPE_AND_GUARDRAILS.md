# Scope & Guardrails

## 1. Absolute protected area: Withdrawal

Withdrawal is owned by another backend teammate.

This stabilization agent MUST NOT:

- implement withdrawal features;
- fix withdrawal bugs;
- change withdrawal UI;
- change withdrawal backend;
- modify payout state machine;
- modify Midtrans Iris integration;
- change withdrawal reservation/idempotency;
- change withdrawal approval/review;
- change withdrawal callback handling;
- alter withdrawal-specific ledger behavior;
- alter withdrawal-specific schema;
- alter withdrawal docs/specs;
- add withdrawal Playwright tests in this run.

### Trello items explicitly excluded

- `[BUG-P0] Withdrawal Kreator UI masih menandai transaksi completed terlalu dini`
- withdrawal portions of `[UAT-KREATOR-06]`
- withdrawal portion of `[QA-DEBT] Implementasikan Playwright E2E untuk 3 critical flow`

### Protected paths

Treat these patterns as protected unless read-only inspection is absolutely required to understand a shared contract:

- `00_BACKEND/functions/request-withdrawal/**`
- `00_BACKEND/functions/review-withdrawal/**`
- `00_BACKEND/functions/*withdrawal*callback*/**`
- `00_BACKEND/docs/03_Workflows/50_Withdrawal.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/**`
- withdrawal-specific Creator finance UI
- withdrawal-specific service/facade files
- withdrawal-specific tests

If a shared file contains both withdrawal and non-withdrawal behavior:

- do not modify it unless necessary;
- make the smallest possible change;
- prove withdrawal behavior remains unchanged;
- if risk is non-trivial, stop that change and report the dependency.

---

## 2. Working-tree safety

Before implementation:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
```

Record all dirty files.

Rules:

- never discard unrelated local changes;
- never reset teammate work;
- never amend/rewrite history without explicit instruction;
- never force checkout over dirty files;
- use current working tree as reality.

After every major batch:

```bash
git diff --name-only
```

Confirm no withdrawal-specific file has been changed by the stabilization run.

---

## 3. Domain boundaries

### Campaign

Core Campaign flow:

UMKM campaign → Creator claim → Creator submit proof → Admin review/final views → reward/ledger.

Campaign submission authority is Admin Marketiv.

UMKM must remain observer/read-only for Campaign submission review.

### Rate Card

Creator package → UMKM select package → conversation → Custom Offer → Creator accept → order → payment → escrow → deliverable/revision → approve → release.

Do not merge these business flows.

---

## 4. Financial safety

For all touched financial paths:

- client success is never final authority;
- redirects are never final payment state;
- wallet credit happens only in trusted server path;
- idempotency must survive retry;
- duplicate event delivery must not duplicate money;
- final settlement requires business conditions, not only UI state.

---

## 5. Security

- never expose server/API secret;
- no `NEXT_PUBLIC_*` server secret;
- preserve existing auth/permission design;
- Admin-only operations remain Admin-only server-side;
- Creator/UMKM ownership validated server-side;
- do not make client-side validation the security boundary;
- do not broaden collection permissions as convenience.

---

## 6. No invented policy

If a Trello requirement requires a policy not defined anywhere current:

Examples:
- maximum verified views;
- exact definition of valid Collab Post;
- platform-specific creator identity verification;

do not invent values/rules.

Classify:

`BLOCKED_BY_BUSINESS_RULE`

or

`BLOCKED_BY_PROVIDER_CAPABILITY`

with exact evidence.

Implement only objectively correct safeguards that do not fabricate policy.

---

## 7. Scope prioritization

Priority:

1. P0 financial/security/correctness
2. P1 financial disclosure/build correctness
3. regression of already-fixed core flow
4. UAT-discovered correctness bug
5. QA automation
6. polish

Do not spend time on low-value visual refactor while P0 exists.

---

## 8. Testing strategy

User wants complete testing after fixes.

Interpretation:

- targeted tests after risky edits are allowed;
- do not run full suite after every tiny change;
- full root + backend + E2E verification runs at final gate;
- distinguish pre-existing suite failures from introduced failures.

---

## 9. Completion honesty

Allowed statuses:

- `FIXED_AND_AUTOMATED_VERIFIED`
- `ALREADY_FIXED_VERIFIED`
- `CODE_FIXED_RUNTIME_PENDING`
- `RUNTIME_VERIFIED`
- `BLOCKED_BY_BUSINESS_RULE`
- `BLOCKED_BY_PROVIDER_CAPABILITY`
- `BLOCKED_BY_ENV/DEPLOYMENT`
- `OUT_OF_SCOPE_WITHDRAWAL`
- `DEFERRED_POLISH`

Never say `PASS` if only code inspection was done.
