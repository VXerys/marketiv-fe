# Campaigns — API / Frontend-Backend Contract

This document describes role-facing service contracts. Sensitive status/views/payment mutations use trusted Appwrite Functions.

## Campaign Read/Create Surface — UMKM

Existing create/edit/funding/publish service contracts remain owned by the Campaign/Payments implementation. Submission validation is no longer a UMKM command.

### UMKM submission read

```ts
getCampaignSubmissions(campaignId)
```

- Returns submission view models for a Campaign owned by the authenticated UMKM.
- Read-only.
- UI may filter/status-display locally.
- No approve/reject/views mutation is exposed to UMKM.

## Creator Submission

### `submitProof(input)` — frontend service

Public UI contract should remain compatible with the current trusted path:

```ts
type SubmitProofInput = {
  claimId: string;
  campaignId: string;
  platform: "tiktok"; // current MVP product contract; derive from Campaign
  postUrl: string;
  caption?: string;
};
```

Rules:

- platform is derived from the claimed Campaign, not arbitrary Creator choice;
- claim ownership and campaign match are checked;
- service calls Appwrite Function `submit-campaign-proof`;
- Function creates `campaign_submissions.status=pending` and changes claim to `submitted`;
- duplicate/invalid submission returns a typed failure; UI must not fabricate success.

## Admin Submission Validation — Target Command

> **Backend wiring pending on baseline 2026-08-14.** Existing `review-submission` still authorizes UMKM owner and must be migrated before Admin production wiring.

Desired command:

```ts
type ReviewSubmissionCommand =
  | {
      submissionId: string;
      decision: "approved";
      verifiedViews: number;
      note?: string;
    }
  | {
      submissionId: string;
      decision: "rejected";
      reason: string;
    };
```

Backend responsibilities:

- authenticate active Admin role;
- ensure submission is `pending`;
- lock views metadata on approval;
- update submission + claim consistently;
- restore quota once on rejection;
- write audit log;
- notify affected users;
- trigger reward only from authoritative approved transition.

## Prohibited Client Operations

Creator/UMKM clients must not directly:

- update submission final status;
- write final views;
- calculate/store payout as authoritative truth;
- update Campaign financial counters;
- update Creator wallet/transaction.

## Error Semantics

Use existing `ServiceResult` conventions. Known cases should be mapped distinctly:

- unauthorized/session invalid;
- forbidden role/ownership;
- not found;
- validation;
- conflict/already processed;
- server/network.

## Compatibility

No new database status values are introduced by this authority migration.
