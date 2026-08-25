# Security & Technical Design

## A. Threat Model

### Creator self-validates
Prevented by separate server-only validation collection.

### UMKM directly sets deliverable approved
Current row permissions may allow this. That must not release money without trusted validation.

### UMKM/Creator forges `validationStatus`
Do not use a user-writable deliverable field as trusted source.

### Old version replay
Require latest deliverable and exact validation binding.

### Duplicate Admin review
Unique deliverableId + conflict.

### Duplicate event
Preserve deterministic ledger and escrow/release guards.

### Race: approval vs validation
Settlement evaluator must be callable by both events and always reload DB state.

## B. Schema

Codex must find canonical Appwrite schema source first. Do not fork generated `appwrite.json`.

Recommended collection:
`ratecard_deliverable_validations`

Indexes:
- UNIQUE `deliverableId`
- `orderId`
- `status`
- add `reviewedAt` only if actual Admin query needs it

No speculative indexes.

## C. Functions

### `get-admin-ratecard-deliverable-queue`
- Admin auth
- pagination
- joins deliverable/order/profile/package/final offer summary
- validation join
- pending = no final validation row
- safe DTO

### `review-ratecard-deliverable`
- Admin auth
- latest-row check
- Rate Card order check
- final decision
- snapshots
- deterministic notifications
- no wallet mutation

### `release-escrow` modification
Resolve event source:
- deliverable event → get deliverable ID
- validation event → get validation.deliverableId

Then always:
1. reload authoritative deliverable
2. reload order
3. query latest deliverable
4. load validation
5. evaluate eligibility
6. if eligible continue EXISTING release path
7. otherwise return ignored/blocked with reason

Do not trust event payload status alone.

## D. Event wiring

Keep current deliverable update trigger.

Add trusted validation create/final-decision trigger so Sequence B can recover automatically.

Codex must inspect current Appwrite config for exact event syntax rather than copying guessed event names.

## E. Admin UI

Current standalone Admin already has protected routes including submissions. Add a dedicated Rate Card validation surface using current auth/service conventions.

Recommended route:
`/rate-card-validations`

Do NOT touch `/withdrawals`.

Queue states:
- loading
- empty
- error
- pending
- reviewed
- superseded conflict

Review dialog:
- order context
- Creator/UMKM
- version
- evidence link
- notes
- manual-review disclaimer
- Valid / Invalid
- invalid notes mandatory

Confirmation:
`Jika ditandai Valid, bukti ini memenuhi validasi manual Marketiv. Dana tetap hanya dirilis setelah UMKM menyetujui hasil kerja dan server memverifikasi settlement.`

## F. UMKM / Creator UI

Reuse existing negotiation room and shared DTO synchronization.

Do not add broad private realtime.

Validation status should arrive through authoritative DTO polling already used by Rate Card room sync.

## G. Current Direct Approval

Current browser approval can remain temporarily for compatibility, but it is NOT a financial authority after this change because `release-escrow` independently requires trusted validation.

If Codex can safely introduce a trusted approve Function without widening scope, it may propose it, but it must not perform an unrelated large migration. The mandatory P0 is financial release gating.

## H. Latest Version

Important query rule:
- load deliverables for order ordered version desc
- selected deliverable must equal latest

Validation of v1 cannot authorize v2.
Validation of v1 cannot authorize later replay of v1 once v2 exists.

## I. Legacy Rows

Existing deliverables with no validation are treated as `pending`, NOT valid.

No implicit migration to valid.

## J. Auditability

Log safely:
- deliverableId
- orderId
- Admin userId
- decision
- reviewedAt

No secrets/session tokens.
