# Spec 03 — Requirements: Persist Rate Card Package Context Through Negotiation

## Problem Statement

Current UI lets UMKM select a Rate Card package and shows it in `StartNegotiationModal`.

But current transition to chat creates/opens conversation using only `creatorId`.

The selected package is therefore not durable context.

Current Custom Offer stores final negotiated fields such as:
- title,
- description/scope,
- price,
- deadline,
- revisionLimit.

But it does not reliably preserve the selected package provenance. Current custom-offer order is created from offer and may not carry package context.

Result:
- package selection feels cosmetic,
- UMKM must reconstruct terms manually,
- both roles can lose the basis of negotiation,
- audit trail cannot clearly answer “this deal started from which package?”

## Product Model

**Rate Card Package = Paket Acuan**

**Custom Offer = Final Agreed Terms**

The package is not the final contract after negotiation. The accepted Custom Offer is authoritative for final:
- price,
- scope,
- deadline,
- revision limit.

Package context exists for:
- provenance,
- prefill,
- user comprehension,
- audit.

## Functional Requirements

### R1 — Preserve selected package into room entry
When UMKM starts negotiation from a specific package:
- carry stable package identifier into the negotiation route/context.

### R2 — Existing conversation remains reusable
Current conversation uniqueness is per UMKM ↔ Kreator pair.

Do not create a second conversation just because another package is selected.

Package context should apply to the **new negotiation/offer context**, not redefine the lifetime identity of the conversation.

### R3 — Prefill Custom Offer
If valid package context exists, prefill:
- price,
- scope/output/description,
- revision limit if available,
- suggested deadline based on estimated delivery only if existing domain semantics support it.

Fields remain editable.

### R4 — Persist provenance on offer
Offer must store an optional reference to the source package.

Backend must validate:
- package exists,
- package belongs to the target creator,
- package is eligible/published when used as new offer source.

Client-supplied package ownership must not be trusted.

### R5 — Copy provenance to order
When accepted offer creates order:
- copy source package reference/snapshot as appropriate,
- preserve final agreed `amount` from offer.

### R6 — Immutable historical meaning
Do not render historical final contract by dereferencing mutable current package values.

Final agreed terms come from accepted offer/order.

For package provenance, preserve at least enough immutable information to avoid misleading history if package later changes/deletes.

Preferred minimum after schema audit:
- `packageId` / `sourcePackageId`,
- package name snapshot,
- package base price snapshot.

Additional snapshot fields are allowed only if justified by UI/audit needs.

### R7 — Backward compatibility
Legacy conversation/offer/order without package context must continue to work.

UI fallback:
- show no package-acuan section,
- do not fabricate package data.

## UX Requirements

Before final offer:
- show `Paket Acuan`.
- distinguish `Harga Paket` from `Harga Kesepakatan`.

After accepted offer:
- show `Kesepakatan Final`.
- do not imply current package price can change the accepted order.

## Security Requirements

- Backend validates package ownership/publish state.
- UMKM cannot attach another creator's package to offer.
- Creator cannot alter package provenance while accepting.
- Final order amount comes from accepted offer, not current mutable package.
