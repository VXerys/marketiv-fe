# Campaigns — Events

## Submission Created

**Trigger:** `campaign_submissions.create`  
**Source:** `submit-campaign-proof`  
**Initial status:** `pending`

Effects:

- claim becomes `submitted`;
- notification is created;
- fraud precheck runs.

## Fraud Precheck Completed

**Function:** `ai-fraud-precheck`

Current behavior:

- writes `fraudScore` and `fraudStatus`;
- writes `fraud_checks` history;
- does **not** make final `approved/rejected` decision on current baseline.

The result is supporting risk metadata for Admin review.

## Submission Reviewed

**Trigger:** trusted Admin review command/function.  
**Target actor:** active Admin Marketiv.

Transition:

```text
pending → approved | rejected
```

On approval:

- lock final views metadata;
- sync claim status;
- create audit log;
- downstream approved event can calculate reward.

On rejection:

- persist reason;
- sync claim status;
- restore Campaign slot exactly once according to backend rule;
- create audit log + notifications.

## Submission Approved → Reward

**Function:** `calculate-campaign-reward`

- idempotent transaction check;
- read locked views;
- calculate/cap reward;
- update Creator pending balance;
- create transaction;
- update Campaign financial counters.

## Migration Status

The event model above is the product target. Baseline `review-submission` caller authorization is still UMKM-owner based and must be migrated before Admin wiring is production-ready.
