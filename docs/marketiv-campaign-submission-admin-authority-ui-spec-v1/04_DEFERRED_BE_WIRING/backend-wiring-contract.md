# Deferred Backend Wiring Contract — Campaign Submission Admin Validation

**Do not implement as part of UI slicing.** This is the handoff contract for the backend/Admin integration phase.

## 1. Objective

Replace legacy `review-submission` UMKM-owner authorization with a secure Admin Marketiv validation command while preserving:

- pending-only transition;
- locked views semantics;
- rejection quota restoration;
- claim synchronization;
- reward idempotency;
- Campaign budget integrity.

## 2. Current Blocker

Current Function validates caller by querying parent Campaign with `umkmId = caller`. An Admin user who is not the Campaign owner therefore cannot review the submission.

This must be considered a security/business-authority migration, not a frontend workaround.

## 3. Required Authorization

Server must:

1. derive caller identity from trusted Appwrite context/header;
2. load current user/domain role server-side;
3. require `role=admin`;
4. require account status active;
5. reject UMKM, Creator, unauthenticated, suspended actors;
6. never accept `adminId` from client as authorization proof.

## 4. Suggested Command Contract

```json
// approve
{
  "submissionId": "...",
  "decision": "approved",
  "verifiedViews": 15800,
  "note": "optional"
}
```

```json
// reject
{
  "submissionId": "...",
  "decision": "rejected",
  "reason": "URL tidak dapat diverifikasi"
}
```

Compatibility adapter may temporarily accept existing `status/views/notes` payload, but canonical service naming should migrate to clear decision semantics.

## 5. Approval Transaction Semantics

For a pending submission:

- validate verifiedViews integer/non-negative according to approved rule;
- set final submission status `approved`;
- write `views_count`;
- write `views_captured_at` server timestamp;
- write `views_source=manual_admin`;
- write `views_final=true`;
- persist note if provided;
- sync claim `approved`;
- write audit log;
- notify Creator + UMKM as needed.

Do not calculate authoritative wallet values in the Admin browser. Existing reward Function remains downstream.

## 6. Rejection Semantics

For pending submission:

- set `rejected`;
- require/validate reason according to product rule;
- sync claim `rejected`;
- restore exactly one Campaign slot using existing atomic/idempotent logic;
- do not double-decrement on retry;
- audit + notify using `Marketiv`, not legacy `UMKM` actor copy.

## 7. Fraud Input

Admin list/detail may read fraud metadata and fraud_checks history.

Rules:

- fraud signal is evidence only;
- do not make client submit an editable fraud score;
- do not let fraud score alone create reward;
- raw reason/score exposure to Creator/UMKM should follow product/legal policy.

## 8. Admin Read Path

Do not solve Admin dashboard reads by granting broad update/read permissions to all authenticated users.

Preferred options, in order:

1. Admin-specific trusted Function returns paginated review DTO.
2. Carefully-scoped collection read permissions for Admin role/team if Appwrite model supports it safely.

DTO should include only review-required data:

```ts
AdminSubmissionReviewDTO {
  id
  status
  submittedAt
  platform
  postUrl
  caption?
  creator { id, name, username?, avatarUrl? }
  campaign { id, title, rewardPer1000Views }
  umkm { id, businessName }
  fraud { status?, score?, reasons? }
  verifiedViews?
  viewsCapturedAt?
  rejectionReason?
}
```

Lists must be paginated. Pending-first sorting/filtering is acceptable.

## 9. Audit Log

Each review must record at least:

```json
{
  "actorId": "admin-user-id",
  "actorRole": "admin",
  "action": "campaign_submission_reviewed",
  "targetId": "submission-id",
  "before": { "status": "pending" },
  "after": { "status": "approved", "views_count": 15800 },
  "reason": null,
  "timestamp": "server-time"
}
```

Use actual audit schema; do not invent a second audit collection if one already exists.

## 10. Admin Dashboard Integration Rules

The separate Admin repo may reuse its existing information architecture but must remove production fixture assumptions:

- staging/production fetch failure → error state, never fixture fallback;
- mapper must use real current field names;
- current product platform contract must not inherit `youtube` just because Admin types contain it;
- review mutation must call trusted Function;
- server response must be re-fetched after sensitive mutation.

## 11. Security Tests — Mandatory

- Admin success.
- UMKM forbidden even when owner.
- Creator forbidden.
- non-admin forbidden.
- suspended Admin forbidden.
- already reviewed conflict.
- guessed submission ID does not leak protected data.
- invalid views rejected.
- rejection retry does not restore quota twice.
- approval retry does not reward twice.

## 12. E2E Gate

Replace placeholder critical-flow tests with a real scenario:

```text
UMKM create + fund + publish
Creator claim + submit
Admin list pending + approve with views
Creator sees approved + reward transaction/pending balance
UMKM sees approved read-only
```

Also test rejection path and unauthorized UMKM review attempt.

Only after these pass should the Campaign E2E milestone be called complete.
