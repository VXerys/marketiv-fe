# Requirements — P0 Rate Card Collab Post Settlement Safety

## Problem

Rate Card settlement is financially sensitive.

Current release path can release escrow after a deliverable becomes `approved`.

A generic deliverable URL/file is not automatically proof that contractual Collab Post requirements were satisfied.

## Objective

Ensure wallet release requires **trusted server-side evidence state** that satisfies the current Rate Card collaboration policy.

## Critical invariant

`deliverable approved` alone MUST NOT imply `financially releasable`.

Required conceptual chain:

deliverable submitted
→ evidence validated
→ UMKM approval / applicable review
→ release guard re-checks trusted validation
→ escrow released exactly once

## R1 Trusted validation state

Store or derive a server-owned validation state.

Examples:
- `pending`
- `valid`
- `invalid`
- `manual_review_required`

Exact states must fit current architecture.

Client cannot set `valid` directly.

## R2 Collab evidence structure

Use current product capability.

Potential fields only if justified:
- platform
- canonical URL
- external post ID
- creator identity
- partner/collaborator identity
- post timestamp
- validation status
- validatedAt
- validator source

Do not add fields merely because Trello lists them if current system cannot populate them truthfully.

## R3 No fake provider verification

Invalid solutions:

- `instagram.com` URL => valid Collab
- HTTPS URL => valid
- regex alone => proof of author identity
- client checkbox => valid
- UMKM approval alone => platform verification

URL normalization/allowlist may be one layer, not final proof.

## R4 Release guard

`release-escrow` must independently verify settlement eligibility.

Never rely only on:
- event payload;
- client state;
- previous UI check.

Before wallet credit:
- load authoritative deliverable/evidence;
- ensure evidence validation requirement satisfied;
- ensure order/escrow states valid;
- preserve idempotency.

## R5 Legacy behavior

Legacy deliverables without validation metadata must NOT silently become valid.

Choose explicit handling:
- block release and require validation/migration;
- or a trusted legacy/manual review path if current business workflow supports it.

## R6 Revision

Revision flow must preserve/replace evidence correctly.

A new deliverable version should not inherit `valid` from an old different URL unless intentionally designed.

## R7 Failure safety

If validation provider/service unavailable:
- fail closed for settlement;
- do not release because validation timed out.

## R8 Existing escrow idempotency preserved

Current deterministic ledger/releasing state protections must not regress.

## R9 User experience

Creator:
- sees evidence validation status;
- actionable invalid reason if available.

UMKM:
- cannot approve/release final money when evidence is not settlement-eligible;
- UI explains waiting/invalid state.

## Tests

- generic arbitrary HTTPS URL;
- malformed URL;
- allowed-platform URL but unverified;
- invalid/private evidence;
- validated evidence;
- retry validation;
- duplicate release event;
- legacy evidence;
- revision new URL resets validation;
- client attempts forged valid state.
