# Campaigns — User Flow

## UMKM

```text
Create Campaign (draft)
↓
Set brief/assets/budget/quota/CPM
↓
Pay Campaign funding via Midtrans
↓
Backend verifies payment
↓
Publish → active
↓
Creator claims and works
↓
UMKM monitors:
  - Creator participation
  - Submitted post URLs
  - Menunggu Validasi Marketiv
  - Approved/rejected result
  - Validated views/reward information when available

UMKM DOES NOT approve/reject or input final views.
```

## Creator

```text
Browse active Job Pool
↓
Claim Campaign
↓
Produce content on Campaign platform
↓
Publish content publicly
↓
Submit public post URL + optional note
↓
Submission = pending
↓
Wait for Marketiv validation
├─ approved → backend calculates reward
└─ rejected → Creator sees Marketiv note/reason
```

## Admin Marketiv

```text
Open submission review queue
↓
Inspect Creator + Campaign + UMKM + post URL
↓
Review fraud/risk signal as supporting evidence
↓
Capture current/final views
↓
Decision
├─ Approve → status approved + locked views
└─ Reject → status rejected + reason + quota restoration rule
↓
Audit log + notification
```

## Backend

```text
Creator submit
→ trusted submit Function
→ pending submission
→ fraud precheck metadata
→ Admin review Function
→ approved/rejected
→ if approved: calculate reward idempotently
```

## Migration Note

Admin review UI exists conceptually in the separate Admin repository. Production `review-submission` authorization must still be migrated from UMKM ownership to Admin role before wiring is complete.
