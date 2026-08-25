# Tasks — Rate Card Regression

## Code verification
- [ ] Locate current Spec 01 implementation/tests.
- [ ] Locate current Spec 02 implementation/tests.
- [ ] Locate current Spec 03 implementation/tests.
- [ ] Compare current code with expected invariants.

## Targeted tests
- [ ] payment idempotency tests.
- [ ] negotiation room sync tests.
- [ ] package provenance tests.
- [ ] create-offer package validation.
- [ ] create-order provenance copy.

## No-refactor rule
If tests pass and code aligns:
- classify corresponding Trello bug `ALREADY_FIXED_VERIFIED`.
- do not change implementation.

If test fails:
- isolate regression;
- make smallest fix;
- add/adjust regression coverage.
