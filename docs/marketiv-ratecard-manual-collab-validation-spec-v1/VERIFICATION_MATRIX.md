# Verification Matrix

## Admin auth
- unauthenticated review → reject
- Creator → reject
- UMKM → reject
- inactive Admin → reject
- active Admin → allowed

## Decision
- current valid deliverable → one validation
- invalid without notes → reject
- invalid with notes → final invalid record
- duplicate review → conflict
- unknown deliverable → 404
- superseded deliverable → reject
- non-Rate-Card order → reject

## Financial eligibility

| Deliverable | Validation | Latest | Release |
|---|---|---|---|
| submitted | none | yes | NO |
| approved | none | yes | NO |
| approved | invalid | yes | NO |
| submitted | valid | yes | NO |
| approved | valid | no | NO |
| approved | valid | yes | YES once |

## Event order A
Admin valid → no release → UMKM approve → release once.

## Event order B
UMKM approve → no validation → no release → Admin valid → validation event → release once.

## Versioning
v1 valid → v2 created → v1 cannot release → v2 needs own validation.

## Invalid/resubmit
invalid v1 → no release → Creator sends v2 → v2 pending → separate Admin review.

## Forgery
direct user validation create/update attempt cannot establish trusted eligibility.

## Idempotency
duplicate deliverable event, validation event, or release retry:
- one wallet credit
- one release ledger
- one fee ledger
- one completed order

## Regression
- payment idempotency unchanged
- room sync unchanged
- package provenance unchanged
- revision limit unchanged
- Campaign unchanged
- withdrawal unchanged

## Runtime staging after deploy

Use 3 sessions:
Creator + UMKM + Admin.

Happy path:
Creator submit → Admin pending queue → valid → UMKM sees valid → approve → escrow release → wallet reconciliation.

Reverse-order:
UMKM approval/bypass before Admin → no release → Admin valid → automatic reevaluation → one release.

Invalid:
Admin invalid → Creator sees reason → new version → old validation not inherited.
