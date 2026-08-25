# Requirements

## 1. Trusted validation persistence

Create a server-controlled model, recommended collection:

`ratecard_deliverable_validations`

Minimum fields:
- `deliverableId` string, required, UNIQUE
- `orderId` string, required
- `deliverableVersion` integer, required
- `sourceSnapshot` string, required
- `evidenceUrlSnapshot` string, required
- `status` enum/string: `valid | invalid`
- `reviewedBy` string, required
- `reviewNotes` string, optional but REQUIRED when invalid
- `reviewedAt` datetime, required

`pending` should preferably be represented by absence of a final validation row. If current architecture strongly prefers explicit pending rows, they must still be server-owned.

No broad user create/update/delete permission on this collection.

## 2. Final decision

One deliverable gets at most one final Admin decision.

Use unique `deliverableId`.

MVP decision should be immutable. Do not silently flip `invalid → valid` and destroy audit history. If an Admin makes an operational mistake, report need for an explicit override workflow instead of casual editing.

## 3. Exact evidence binding

Validation must belong to:
- exact deliverable ID;
- exact order;
- exact version;
- exact reviewed source/URL snapshot.

A validation for another deliverable or older version cannot authorize settlement.

## 4. Latest deliverable

Before financial release, query the latest deliverable for the order and require:

`latestDeliverable.$id === approvedDeliverable.$id`

This prevents a validated old version from releasing after a newer version exists.

## 5. Admin queue

Admin needs a queue with enough context:
- deliverable ID/version;
- order ID;
- Creator;
- UMKM/business;
- package/final deal summary where available;
- evidence URL/file;
- notes;
- submittedAt;
- current deliverable status;
- validation status;
- whether row is latest/current.

Default filter: pending validation.

## 6. Admin review Function

Suggested name:
`review-ratecard-deliverable`

Client input should be minimal:

```json
{
  "deliverableId": "...",
  "decision": "valid",
  "notes": "..."
}
```

Function MUST derive server-side:
- orderId;
- Creator/UMKM relation;
- version;
- evidence snapshot;
- reviewedBy;
- reviewedAt.

Function MUST:
- authenticate;
- authorize current active Admin server-side using current canonical Admin pattern;
- reject non-Admin;
- load deliverable/order;
- ensure Rate Card order;
- ensure latest deliverable;
- reject duplicate final decision;
- require notes for invalid;
- create trusted validation row;
- send deterministic notification(s);
- return authoritative result.

Admin validation itself MUST NOT credit wallet.

## 7. Admin queue Function

Suggested:
`get-admin-ratecard-deliverable-queue`

Admin-only server read.

Do not give Admin browser raw broad database permission merely to implement the queue.

## 8. Settlement eligibility

`release-escrow` must independently require ALL:

1. order status releasable;
2. escrow status releasable;
3. authoritative deliverable exists;
4. deliverable belongs to order;
5. deliverable is latest;
6. deliverable status is `approved`;
7. validation exists for exact deliverable;
8. validation status is `valid`;
9. validation order/version/evidence snapshot matches;
10. existing release idempotency guard succeeds.

If any condition fails:
- no wallet increment;
- no release transaction completion;
- no fee transaction side effect;
- no order completed.

## 9. Order-independent events

Both sequences must work.

### A — Admin first
Admin valid → no release yet → UMKM approve → deliverable event → release exactly once.

### B — UMKM first
UMKM/direct mutation approves → release event sees no validation → NO MONEY → Admin later validates → validation event re-evaluates → release exactly once.

Therefore settlement must be re-evaluated when:
- deliverable approval event occurs;
- trusted validation final-valid event occurs.

Keep current release logic idempotent.

## 10. Invalid evidence

If Admin marks invalid:
- no release;
- Creator receives reason;
- UMKM cannot final approve for settlement in normal UI;
- Creator may send new version according to current order/revision rules;
- new version requires independent validation;
- old invalid/valid result never inherits.

## 11. DTO

UMKM and Creator negotiation DTO should expose only safe projection:

```ts
deliverableValidation: {
  status: "pending" | "valid" | "invalid";
  reviewedAt?: string;
  reviewNotes?: string;
}
```

Do not expose sensitive Admin internals unnecessarily.

## 12. UX

UMKM:
- Pending: `Menunggu Validasi Marketiv`
- Valid: `Bukti Lolos Validasi Marketiv`
- Invalid: `Bukti Belum Lolos Validasi`
- final Approve hidden/disabled until valid
- revision remains available where business state permits

Creator:
- Pending: `Bukti dikirim — menunggu validasi Marketiv`
- Valid: `Bukti lolos validasi Marketiv dan menunggu review UMKM`
- Invalid: show safe review reason and resubmit path

Admin:
- clearly show: `Validasi dilakukan secara manual oleh Marketiv. Sistem belum melakukan verifikasi otomatis dari platform sosial.`

Never say “verified by Instagram/TikTok”.

## 13. Notifications

Recommended:
- Valid → UMKM: ready for review
- Valid → Creator: validated, waiting UMKM approval
- Invalid → Creator: validation failed, show note

Use existing deterministic notification convention.

## 14. No fake provider verification

HTTPS/domain/regex checks are input hygiene only.

They do NOT prove:
- post ownership;
- collaborator identity;
- public availability;
- platform Collab feature;
- content existence.

Trusted MVP authority = Admin manual decision.
