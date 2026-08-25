# Design — Collab Post Settlement

## Phase 1: Capability audit

Before schema changes, answer:

1. What platforms does Rate Card currently support?
2. Does current repo have any social post validator?
3. Is there existing Admin manual review capability?
4. Is UMKM approval intended as acceptance only, or also evidence verification?
5. What does current T&C define as Collab Post?
6. Does product require actual platform collaborator feature, mention/tag, or only published content?
7. Can current backend retrieve post metadata from provider?

If these cannot be answered from source:
do not invent a verification algorithm.

## Preferred trust model

The final settlement guard should depend on a server-owned `validationStatus`.

Source of that status may be:
- trusted provider API;
- trusted backend validator;
- Admin review;
- another current authoritative workflow.

UMKM client is not sufficient to assert platform validity.

## Suggested data model

Only if needed:

Deliverable/evidence:
- `platform`
- `canonicalUrl`
- `externalPostId`
- `validationStatus`
- `validationReason`
- `validatedAt`
- `validatorSource`

Potential identity fields if current provider/workflow supports them.

Use canonical Appwrite schema generator.

## Validation lifecycle

Example:

submitted
→ validation_pending
→ valid | invalid | manual_review_required

UMKM approval should be blocked or separated from final settlement until `valid`.

If product intentionally supports manual Admin approval:
`manual_review_required → valid` only via trusted Admin Function.

## Release flow

In `release-escrow`:

1. load current order;
2. verify releasable order state;
3. load authoritative current approved deliverable;
4. verify correct order ownership/version;
5. verify trusted evidence validation status;
6. load escrow;
7. preserve existing `releasing/released` idempotency;
8. create deterministic release/fee ledgers;
9. wallet credit;
10. complete order;
11. release escrow.

## Important race

Do not trust event deliverable body for validation status.

Reload database row.

## Revision semantics

When a creator submits a new version:
- new evidence validation starts fresh;
- old validation cannot authorize new evidence.

## Manual fallback

If there is no provider API and current business allows manual verification:
implement explicit Admin validation rather than pretending URL parsing is verification.

If no trusted validator exists and manual review is not defined:
classify provider/business blocker.

## Non-goals

- no full social scraping platform;
- no AI fraud model invention;
- no new unrelated admin dashboard;
- no withdrawal changes.
