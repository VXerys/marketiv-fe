# Spec 01 — Tasks

## A. Audit before edit

- [ ] Re-read current `create-payment`, `midtrans-webhook`, `cancel-payment`.
- [ ] Inspect current `payments` attributes and indexes.
- [ ] Identify canonical Appwrite schema generator/source.
- [ ] Inspect current `PaymentIntent` type and error mapping.
- [ ] Confirm all payment statuses used in repository.

## B. Schema

- [ ] Add optional server-owned order payment lock/idempotency field.
- [ ] Add unique index/constraint for the lock key.
- [ ] Preserve legacy rows.
- [ ] Regenerate derived Appwrite config if required.
- [ ] Document staging schema deployment requirement.

## C. create-payment

- [ ] Preserve ownership guard.
- [ ] Preserve exact amount guard.
- [ ] Add existing pending lookup/reuse.
- [ ] Add already-paid reject path.
- [ ] Add unique-race recovery.
- [ ] Ensure only winning request creates Midtrans transaction.
- [ ] On gateway creation failure, mark failed and unlock retry safely.
- [ ] Return actionable response.

## D. webhook + cancellation

- [ ] Keep key on pending/paid.
- [ ] Clear key on failed/expired/cancelled.
- [ ] Preserve webhook signature validation.
- [ ] Preserve terminal-state idempotency.
- [ ] Align `cancel-payment` with retry lock semantics.

## E. Tests

Required automated cases:

- [ ] first create → one payment.
- [ ] sequential retry while pending → existing intent reused.
- [ ] concurrent double request → one payment winner.
- [ ] paid → new payment rejected.
- [ ] expired → new attempt allowed.
- [ ] failed → new attempt allowed.
- [ ] cancelled → new attempt allowed.
- [ ] duplicate webhook → no duplicate transition.
- [ ] wrong owner → 403.
- [ ] wrong amount → 409.
- [ ] Campaign payment regression.

## F. Verification

Run project-appropriate commands after inspecting `package.json`:

- [ ] targeted unit/integration tests.
- [ ] typecheck.
- [ ] lint touched files.
- [ ] build if project gate expects it.
- [ ] report exact results.
- [ ] do not claim staging runtime PASS before deployment.

## Acceptance Gate

Do not proceed to Spec 02 until:
- one-order-one-active-payment invariant is verified in automated tests,
- schema/deployment impact is documented,
- no Campaign regression is observed.
