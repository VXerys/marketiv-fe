# Phase 02 — Tasks

## A. Audit
- [ ] Record current HEAD.
- [ ] Re-read full `request-withdrawal`.
- [ ] Identify Iris-specific helpers/env.
- [ ] Inspect idempotency + atomic helper.
- [ ] Inspect transaction statuses.
- [ ] Inspect tests.

## B. Implement
- [ ] Preserve current validation/security gates.
- [ ] Keep deterministic requestKey behavior.
- [ ] Create withdrawal `requested`.
- [ ] Debit balance atomically.
- [ ] Create pending transaction.
- [ ] Remove Iris call from new request path.
- [ ] Do not auto-set `processing`.
- [ ] Return requested receipt + requested timestamp.
- [ ] Update notification wording.
- [ ] Keep legacy callback untouched.

## C. Tests
- [ ] valid request → requested.
- [ ] balance debit once.
- [ ] transaction pending.
- [ ] duplicate requestKey → no second debit.
- [ ] insufficient balance.
- [ ] unauthorized/role/KYC/TOS/email gates.
- [ ] daily limit/cooling gates.
- [ ] confirm provider helper not invoked.
- [ ] concurrent/debit safety.

## D. Verification
- [ ] targeted tests.
- [ ] Function syntax check.
- [ ] search confirms no active Iris call in request path.
- [ ] exact result report.

## Acceptance Gate
Do not continue until request safely reserves balance and ends in `requested`, with no provider payout.
