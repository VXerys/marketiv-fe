# Tasks — Admin Verified Views

## Audit
- [ ] Locate current admin review UI/service.
- [ ] Inspect current Function validation.
- [ ] Inspect schema max.
- [ ] Search current Campaign rules/T&C for max views.
- [ ] Determine current observation-window rule.
- [ ] Record policy source.

## Implement
- [ ] Add strict server validation.
- [ ] Add explicit domain error reason/code if conventions support it.
- [ ] Mirror validation in Admin UI.
- [ ] Prevent silent coercion.
- [ ] Ensure confirmation displays normalized value.
- [ ] Preserve reject path.
- [ ] Preserve Admin auth.
- [ ] Preserve reward calculation.

## Tests
- [ ] Function normal boundary cases.
- [ ] unsafe integer.
- [ ] huge value.
- [ ] decimal.
- [ ] negative.
- [ ] malformed.
- [ ] non-admin.
- [ ] already-reviewed.
- [ ] observation-window pending.
- [ ] UI validation.
- [ ] server rejection UI propagation.

## Documentation
- [ ] Update canonical current Campaign review rule only.
- [ ] If max not defined, document business-rule blocker instead of inventing.

## Targeted verification
- [ ] targeted admin review tests.
- [ ] node --check touched JS Functions.
- [ ] relevant TypeScript typecheck if touched.
