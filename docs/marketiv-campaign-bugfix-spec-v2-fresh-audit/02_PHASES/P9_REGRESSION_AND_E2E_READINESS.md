# P9 — Regression + Campaign 3-Role E2E Readiness

## Quality gates

### User app
Run current repository equivalents of:
```bash
npm test -- --run
npm run lint
npm run typecheck
npm run build
```

### Admin
```bash
cd admin
npm test -- --run
npm run lint
npm run typecheck
npm run build
```

## Revalidate QA

1. wrong portal login → explicit mismatch/no bounce.
2. active stop/pause Campaign → correct state, non-active no invalid action.
3. detail Unclaim → before submit only, slot returned correctly.
4. submit proof → trusted Function, duplicate conflict/no false success.
5. claim → permission fixed, exactly one counter increment, concurrency/reclaim consistent.

## Admin
- anonymous/non-admin cannot load queue;
- active Admin can securely load queue;
- review 401/403/409/5xx cannot create local success;
- approve locks views;
- reject no payout;
- summary factual.

## Golden path
```text
UMKM create/fund/publish
→ Creator discover/claim
→ Creator submit public URL
→ pending
→ Admin secure queue
→ Admin lock views + approve
→ backend reward/ledger
→ Creator outcome
→ UMKM read-only outcome
```

## Negative paths
wrong portal, non-admin Admin deep link, duplicate claim, unclaim before/after submit, duplicate submit, review error, reject, refresh/deep-link.

## Evidence
timestamp, role identifier without credential, viewport/browser, sanitized Function status, Campaign/claim/submission IDs, before/after state, wallet/ledger evidence if verified.

## Final status
Use only:
- `READY_FOR_STAGING_E2E`
- `STAGING_E2E_PASS`
- `STAGING_E2E_FAIL`
- `BLOCKED_BY_ENVIRONMENT`

No runtime PASS from code inspection alone.
