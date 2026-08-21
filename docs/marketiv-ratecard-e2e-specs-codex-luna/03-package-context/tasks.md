# Spec 03 — Tasks

## A. Audit schema + types

- [ ] Confirm package stable ID availability in UI view type.
- [ ] Inspect offers attributes.
- [ ] Inspect orders attributes, especially existing `packageId`.
- [ ] Inspect rate_card_packages attributes.
- [ ] Identify canonical schema generator.
- [ ] Inspect current offer validation schema.

## B. Entry context

- [ ] Preserve package ID in rate-card presentation view.
- [ ] Pass packageId into `StartNegotiationModal`.
- [ ] Reuse current createConversation behavior.
- [ ] Navigate to room with optional package context.
- [ ] Preserve deep-link/refresh behavior.

## C. Room UX

- [ ] Resolve package context safely.
- [ ] Show `Paket Acuan`.
- [ ] Prefill custom offer.
- [ ] Keep final fields editable.
- [ ] Handle invalid/unpublished/deleted package without crashing.
- [ ] Avoid fabricating fallback values.

## D. Offer backend

- [ ] Extend input contract with optional packageId.
- [ ] Validate package belongs to conversation creator.
- [ ] Validate package eligibility/status.
- [ ] Persist source package reference.
- [ ] Persist minimal immutable package snapshot required for history.
- [ ] Preserve UMKM-only create authority.
- [ ] Preserve active pending-offer guard.

## E. Order backend

- [ ] Copy package provenance from accepted offer.
- [ ] Keep `amount = offer.price`.
- [ ] Do not recompute final price from package.
- [ ] Preserve unique offer→order idempotency.

## F. DTOs

- [ ] Expose package context to UMKM.
- [ ] Expose same package context to Kreator.
- [ ] Keep final terms authoritative.
- [ ] Legacy no-package rows map safely.

## G. Tests

- [ ] select package → room query context.
- [ ] refresh room → package context persists.
- [ ] same creator, different selected package → same conversation, different new offer context.
- [ ] custom offer prefilled then edited.
- [ ] backend rejects package owned by another creator.
- [ ] backend rejects invalid package.
- [ ] accepted offer copies package provenance to order.
- [ ] final order amount equals negotiated offer, not package base price.
- [ ] package edited later → historical final terms remain unchanged.
- [ ] legacy offer/order without package context.
- [ ] Campaign regression none.

## H. Verification

- [ ] targeted tests.
- [ ] typecheck.
- [ ] lint.
- [ ] build.
- [ ] staging two-role manual test.
