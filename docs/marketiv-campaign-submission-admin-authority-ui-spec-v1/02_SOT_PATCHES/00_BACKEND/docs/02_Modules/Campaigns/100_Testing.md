# Campaigns — Testing

This document lists acceptance/security scenarios for Campaign submission authority. Existing campaign create/fund/publish/claim tests remain applicable and should be retained in the repository.

## Creator Submit Proof

- valid owned `claimed` claim + matching Campaign → trusted `submit-campaign-proof` succeeds;
- campaign mismatch → validation failure before Function call where frontend guard exists, and server still validates;
- claim not owned → forbidden/not found according to security contract;
- claim not `claimed` → conflict;
- duplicate submission → conflict;
- wrong platform URL → validation failure;
- success creates pending submission + claim submitted;
- frontend performs no direct `createDocument` for proof.

## Admin Review — Target Backend Tests

> Required before Admin wiring is production-ready.

### Authorization

- active Admin → may review pending submission;
- UMKM owner → forbidden;
- Creator → forbidden;
- normal authenticated user → forbidden;
- suspended Admin → forbidden;
- unauthenticated → unauthorized.

### Approval

- pending + valid views → approved;
- locked views fields written consistently;
- claim status synchronized;
- audit log records actor and decision;
- notification created;
- reward transaction created exactly once downstream;
- retry does not duplicate reward.

### Rejection

- pending + reason → rejected;
- claim synchronized;
- Campaign slot restored exactly once;
- retry does not restore slot twice;
- audit/notification recorded.

### Invalid transition

- approved/rejected submission cannot be reviewed again.

## Fraud Precheck

- valid submission writes fraud score/status/history;
- `safe` does not itself set submission approved;
- `review` leaves submission pending;
- `rejected` risk signal does not by itself create a reward or financial mutation;
- Admin decision remains required for final status under ADR-010.

## Views/Reward

- if `views_final=true`, reward uses `views_count`;
- legacy fallback remains safe for historical rows;
- reward uses `floor(views/1000) × rate` and remaining-budget cap;
- Campaign reward does not deduct Creator platform fee;
- transaction idempotency prevents double credit.

## UMKM UI Contract

- no ReviewSubmissionModal reachable;
- no approve/reject/views input;
- pending shows observer status;
- submission read failure is shown as error, not empty.

## Creator UI Contract

- platform derived from Campaign;
- pending state says Marketiv validates;
- pending views/reward not fabricated;
- no UMKM-verifier copy remains.

## E2E Gate

Campaign E2E cannot be called complete until browser test covers:

```text
UMKM create/fund/publish
→ Creator claim
→ Creator submit proof
→ Admin validate
→ backend reward
→ Creator/UMKM observe final state
```

Placeholder `expect(true).toBe(true)` tests are not E2E evidence.
