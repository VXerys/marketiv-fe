# Workflow: Campaign Pay-Per-View (PPV)

## Purpose

End-to-end Campaign PPV from UMKM funding through Creator proof, Marketiv validation, and backend reward.

## Actors

- UMKM — create/fund/publish/monitor.
- Creator — claim/produce/publish/submit.
- Admin Marketiv — validate submission + lock views + approve/reject.
- Fraud Function — risk metadata.
- Payment/Reward Functions — financial authority.

## Flow

### 1. Create & Fund — UMKM

1. UMKM creates Campaign draft with product/brief/assets/budget/quota/rate.
2. Payment is created through trusted payment path.
3. Midtrans webhook/server verification confirms funding.
4. Campaign can be published `active` according to current funding guard.

### 2. Claim — Creator

5. Creator browses active Job Pool.
6. Creator claims available Campaign.
7. Backend validates campaign/creator/quota/duplicate rules.
8. Claim becomes `claimed` with deadline.

### 3. Produce & Submit — Creator

9. Creator produces content according to Campaign brief/platform.
10. Creator publishes content publicly.
11. Creator submits public post URL + optional note through `submit-campaign-proof`.
12. Trusted Function validates claim ownership/platform URL and creates submission `pending`.
13. Claim becomes `submitted`.

### 4. Risk Precheck — System

14. `ai-fraud-precheck` evaluates supporting risk signals.
15. It writes `fraudScore/fraudStatus` + history.
16. Submission remains governed by its independent `pending/approved/rejected` status lifecycle.

### 5. Validate — Admin Marketiv

17. Admin opens pending submission queue.
18. Admin sees Creator, Campaign, UMKM, post URL, timestamps, and risk evidence.
19. Admin captures final views.
20. Admin chooses:
   - approve → lock views + `approved`;
   - reject → reason + `rejected` + quota restoration rule.
21. Trusted backend writes audit log and notifications.

UMKM only monitors this stage.

### 6. Reward — Backend

22. Approved transition triggers reward processing.
23. Backend uses locked views when available.
24. Reward is calculated/capped by Campaign remaining budget.
25. Idempotency prevents duplicate reward.
26. Creator pending balance/transaction is updated.
27. Campaign financial counters are updated atomically.

## State Transitions

```text
CAMPAIGN:   draft → active → paused/completed
CLAIM:      claimed → submitted → approved | rejected
             └──────────────→ expired (before submission deadline rule)
SUBMISSION: pending → approved | rejected
FRAUD:      safe | review | rejected   (separate risk dimension)
```

## Important Invariants

- UMKM does not approve/reject Campaign submissions.
- Creator does not set final views.
- Fraud precheck does not directly create payout.
- Admin validation is a trusted Function operation.
- Payment/reward state is server-controlled.
- Campaign Creator reward has no seller-side 2% deduction.

## Migration Status

UI/SOT follows ADR-010. Backend `review-submission` still requires migration from UMKM ownership to Admin role before this workflow is fully operational E2E.
