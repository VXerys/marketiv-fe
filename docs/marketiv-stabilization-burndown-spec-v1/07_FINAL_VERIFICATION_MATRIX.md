# Final Verification Matrix

Run after implementation batches are stable.

Do not repeatedly run this full matrix after every tiny change.

---

## 1. Git hygiene

```bash
git branch --show-current
git rev-parse HEAD
git status --short
git diff --check
git diff --name-only
```

Pass conditions:
- no accidental withdrawal-specific changes;
- no conflict markers;
- no whitespace errors;
- no unrelated mass refactor.

---

## 2. Root static gates

Inspect scripts first, then where still available:

```bash
npm run typecheck
npm run lint
npm run validate-data-contracts
npm run build
```

Pass:
- typecheck exit 0;
- build exit 0;
- no lint errors introduced;
- existing warnings separately reported.

---

## 3. Root unit/integration

```bash
npm test -- --run
```

If current repo test runner syntax differs, use actual script.

Report:
- passed;
- failed;
- skipped;
- pre-existing failure evidence;
- newly introduced failures.

Do not call full suite PASS if failures remain.

---

## 4. Backend tests

```bash
npm --prefix 00_BACKEND run test:unit
npm --prefix 00_BACKEND run test:integration
npm --prefix 00_BACKEND test
```

For changed JS Functions:

```bash
node --check <function files>
```

---

## 5. Appwrite drift/inventory

Safe read/dry-run only:

```bash
npm --prefix 00_BACKEND run fn:inventory
npm --prefix 00_BACKEND run fn:drift
npm --prefix 00_BACKEND run fn:sync:dry
```

Do not run real destructive sync without explicit approval.

Produce:
- drift summary;
- Functions needing redeploy;
- schema attributes/indexes;
- event wiring changes;
- environment variables.

---

## 6. Playwright

Root:

```bash
npm run test:e2e
```

Backend if relevant:

```bash
npm --prefix 00_BACKEND run test:e2e
```

Withdrawal scenarios excluded.

---

## 7. Campaign automated regression

Verify:
- role boundaries;
- claim authority;
- submit proof;
- observation eligibility;
- verified view validation;
- Admin-only review;
- rejection;
- approval;
- reward/ledger consistency.

---

## 8. Rate Card automated regression

Verify:
- package provenance;
- Custom Offer;
- Creator accept;
- order idempotency;
- one active payment;
- payment return semantics;
- one escrow;
- room sync;
- deliverable/revision;
- Collab evidence guard;
- release idempotency;
- creator net settlement.

---

## 9. Manual staging smoke — Auth

Only if environment supports:
- UMKM login;
- Creator login;
- wrong-role login;
- logout;
- refresh/deep-link.

Recovery/OAuth only if provider/env available.

---

## 10. Manual staging smoke — Rate Card + Midtrans

Two independent sessions.

1. Creator publishes/has published package.
2. UMKM selects exact package.
3. Package Acuan visible.
4. UMKM sends negotiated offer.
5. Creator accepts.
6. UMKM sees `pending_payment` without F5.
7. Click `Bayar dengan Midtrans`.
8. Ensure one payment.
9. Complete Sandbox transaction.
10. Return shows verification, not immediate client success.
11. Webhook confirms.
12. Exactly one escrow held.
13. Order `in_progress`.
14. Creator room updates.
15. Creator submits required evidence.
16. Evidence validation reaches trusted valid state.
17. UMKM approves/revises according to state.
18. Release occurs exactly once.
19. Creator wallet delta = escrow amount - fee snapshot.
20. Fee ledger reconciles.
21. Order completed.

Negative:
- payment duplicate request;
- refresh before webhook;
- local cancel;
- invalid Collab evidence;
- unverified evidence;
- duplicate release;
- revision limit.

---

## 11. Manual staging smoke — Campaign

1. UMKM creates/funds/publishes campaign.
2. Creator claims.
3. Creator submits proof.
4. Observation window respected.
5. Admin enters valid final views.
6. absurd/invalid views rejected.
7. Admin approves/rejects.
8. Creator outcome/reward consistent.

No withdrawal.

---

## 12. Responsive checks

Critical routes at:
- 375px
- tablet width
- desktop

Look for:
- horizontal overflow;
- hidden CTA;
- modal clipping;
- stale action;
- misleading status.

---

## 13. Final classification

Every tracked item gets one:

- FIXED_AND_AUTOMATED_VERIFIED
- ALREADY_FIXED_VERIFIED
- CODE_FIXED_RUNTIME_PENDING
- RUNTIME_VERIFIED
- BLOCKED_BY_BUSINESS_RULE
- BLOCKED_BY_PROVIDER_CAPABILITY
- BLOCKED_BY_ENV_DEPLOYMENT
- OUT_OF_SCOPE_WITHDRAWAL
- DEFERRED_POLISH
