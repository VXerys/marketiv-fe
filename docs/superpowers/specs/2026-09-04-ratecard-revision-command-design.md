# Rate Card Revision Command Design

## Goal

Move UMKM Rate Card revision mutation into one trusted, synchronous Appwrite Function so browser callers cannot assign cross-user permissions or update protected collections.

## Architecture

`request-ratecard-revision` accepts only `{ orderId, message }`. It derives caller from Appwrite execution header, verifies active UMKM identity, loads order and latest deliverable authoritatively, then performs the revision row, latest deliverable, and order mutations with a server API key.

Eligible order states remain `in_progress` and `revision`, but latest deliverable must be `submitted`. This makes duplicate requests fail after first mutation (`latest.status = revision_requested`) while allowing another cycle after Creator submits next version. Revision limit uses total revision rows and authoritative order/offer/package limit. `revision_count` remains owned by `track-order-review` and is not changed here.

Function resets `review_deadline_at` and `reminder_sent_at`, but never writes escrow, wallet, payment, or validation rows. Revision row permissions are read-only for order UMKM and Creator.

`sync-order-revision` is retired from event execution: its revision-create event is removed and Function disabled. Source remains for historical audit. This leaves `request-ratecard-revision` as sole revision transition writer.

`track-order-review` remains active for deliverable-create review timers, but re-reads latest deliverable and no-ops when it is already `revision_requested`. This prevents its asynchronous event from undoing the synchronous revision command; its existing `revision_count` calculation remains unchanged.

## Version and money safety

Admin validation remains bound to deliverable ID, order ID, version, source, and evidence URL. Therefore validation for v1 cannot authorize v2. Existing `release-escrow` checks latest deliverable plus matching valid validation; no revision command changes financial state.

## Verification

Focused tests cover caller/ownership/state/message/limit/permissions, multiple revision cycles, forged order IDs, browser write removal, retired event config, and v1/v2 validation and escrow invariants. Run focused backend/frontend tests, typecheck, affected lint, build, function inventory, and `git diff --check`. No production deployment.
