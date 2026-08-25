# Implementation Tasks

## Phase 0 — Read-only audit

- [ ] branch / HEAD / git status
- [ ] identify dirty teammate files
- [ ] confirm withdrawal protected
- [ ] inspect deliverable service
- [ ] inspect release-escrow
- [ ] inspect deliverables schema/permissions
- [ ] inspect UMKM/Creator negotiation Functions
- [ ] inspect Admin auth + submissions pattern
- [ ] inspect Appwrite schema generator/config
- [ ] inspect current Function event syntax
- [ ] inspect Rate Card/T&C Collab wording

Output concise implementation plan, then proceed.

## Phase 1 — Schema

- [ ] add trusted validation collection
- [ ] add required fields
- [ ] unique deliverableId
- [ ] required query indexes only
- [ ] no broad user mutation
- [ ] regenerate derived Appwrite config correctly

## Phase 2 — Admin backend

- [ ] get-admin-ratecard-deliverable-queue
- [ ] review-ratecard-deliverable
- [ ] server Admin auth
- [ ] latest deliverable check
- [ ] duplicate decision guard
- [ ] invalid notes validation
- [ ] snapshot authoritative evidence
- [ ] deterministic notifications
- [ ] tests

## Phase 3 — Settlement guard

- [ ] refactor release eligibility into testable helper
- [ ] reload authoritative deliverable
- [ ] latest check
- [ ] exact trusted validation
- [ ] evidence/version/order match
- [ ] keep existing fee snapshot
- [ ] keep deterministic release/fee transaction
- [ ] keep wallet idempotency
- [ ] add validation event settlement trigger
- [ ] event order A test
- [ ] event order B test
- [ ] duplicate event test
- [ ] no side effects on invalid/pending

## Phase 4 — DTO

- [ ] UMKM negotiation validation projection
- [ ] Creator negotiation validation projection
- [ ] no row => pending
- [ ] safe notes only

## Phase 5 — Admin UI

- [ ] route/nav following current design
- [ ] no withdrawal changes
- [ ] queue
- [ ] filters
- [ ] review dialog
- [ ] manual disclaimer
- [ ] conflict/errors
- [ ] authoritative refetch
- [ ] tests

## Phase 6 — Marketiv UI

- [ ] UMKM pending/valid/invalid states
- [ ] block final Approve in normal UI until valid
- [ ] keep revision path
- [ ] Creator states/reason
- [ ] tests

## Phase 7 — Docs

- [ ] update current Rate Card workflow
- [ ] approved alone no longer means releasable
- [ ] document Admin manual validation
- [ ] provider automation marked future/not implemented

## Phase 8 — Verification

- [ ] backend targeted integration
- [ ] root targeted tests
- [ ] Admin targeted tests
- [ ] root typecheck
- [ ] Admin typecheck
- [ ] root lint
- [ ] Admin lint
- [ ] root build
- [ ] Admin build
- [ ] node --check changed Functions
- [ ] git diff --check
- [ ] git diff --name-only confirms zero withdrawal-specific changes
