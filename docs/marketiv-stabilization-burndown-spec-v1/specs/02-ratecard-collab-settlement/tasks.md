# Tasks — Collab Settlement

## Audit
- [ ] Search current Collab Post terminology.
- [ ] Read current Rate Card workflow.
- [ ] Read deliverable create/submit service.
- [ ] Read UMKM approve/revision path.
- [ ] Read `release-escrow`.
- [ ] Inspect deliverables schema.
- [ ] Search provider/social validation code.
- [ ] Search Admin/manual review capability.
- [ ] Read active T&C relevant section.

## Decision
- [ ] Identify trusted validator source.
- [ ] If absent, classify exact blocker.
- [ ] Do not fake validation.

## Schema if justified
- [ ] Add minimal validation fields.
- [ ] Use canonical schema source.
- [ ] Preserve legacy compatibility explicitly.
- [ ] Add indexes only if query requires them.

## Server implementation
- [ ] Validation path server-owned.
- [ ] New deliverable begins pending/unvalidated.
- [ ] Client cannot write final validity.
- [ ] Approval eligibility checks validation.
- [ ] Release independently re-checks.
- [ ] Revision invalidates/restarts evidence validation.
- [ ] Duplicate events safe.

## UI
- [ ] Creator validation status.
- [ ] UMKM cannot final-approve invalid/unverified evidence.
- [ ] error/loading state actionable.
- [ ] no fake success.

## Tests
- [ ] arbitrary HTTPS rejected/not releasable.
- [ ] unverified platform URL not releasable.
- [ ] valid evidence releasable.
- [ ] forged client validity rejected.
- [ ] legacy evidence guarded.
- [ ] revision resets eligibility.
- [ ] duplicate release remains exactly once.
- [ ] wallet/fee ledger reconciliation.

## Targeted verification
- [ ] related frontend tests.
- [ ] backend integration tests.
- [ ] Function syntax checks.
