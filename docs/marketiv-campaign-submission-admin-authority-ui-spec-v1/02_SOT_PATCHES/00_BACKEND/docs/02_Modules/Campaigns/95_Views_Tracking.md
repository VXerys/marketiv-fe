# Campaigns — Views Tracking & Validation

> **Current product decision:** final Campaign views are captured/locked by Admin Marketiv during submission validation.  
> **Decision:** ADR-010.  
> **Backend wiring status:** Admin authorization pending on baseline 2026-08-14.

## 1. MVP Model

```text
Creator publishes content
↓
Creator submits public post URL
↓
Submission = pending
↓
Fraud precheck writes risk metadata
↓
Admin Marketiv opens review queue
↓
Admin checks post + supporting evidence
↓
Admin captures final views
↓
Admin approves/rejects
↓ approved
Backend calculates reward using locked views
```

UMKM can monitor results but does not capture views.

## 2. Locked View Fields

When available in current schema:

| Field | Meaning |
|---|---|
| `views_count` | final views used for reward |
| `views_captured_at` | capture timestamp |
| `views_source` | source metadata; MVP manual Admin = `manual_admin` |
| `views_final` | lock indicator |

Legacy `views` exists for compatibility. Reward/read mapper should prefer `views_count` when `views_final=true`.

## 3. Validation Rules

- Admin approval requires a valid non-negative integer views value according to backend contract.
- Submission must still be `pending`.
- Final views are locked with the approval transition.
- Creator and UMKM cannot edit locked views.
- `fraudStatus` remains separate supporting metadata.
- No UI may claim automatic TikTok/Instagram views sync unless that capability is deployed and enabled.

## 4. Reward Formula

Current backend semantics:

```text
reward = min(
  floor(verifiedViews / 1000) × rewardPer1000Views,
  remainingBudget
)
```

- Campaign platform fee is buyer-side UMKM (ADR-008).
- Creator Campaign reward must not have an extra 2% frontend deduction.
- Views below a complete thousand may result in zero reward under the floor rule.

## 5. Creator UI

Before submit:

- show Campaign platform read-only;
- public URL input;
- optional Marketiv note;
- no file upload;
- no final views input.

Pending:

- `Menunggu Validasi Marketiv`;
- Views `Belum diverifikasi`;
- Reward `Belum dihitung`.

Approved:

- show locked views if available;
- show `Diverifikasi Marketiv`;
- show calculated reward only when source is authoritative enough;
- do not label it `Dana Cair` unless transaction state proves settlement/payment.

Rejected:

- show rejection reason when available.

## 6. UMKM UI

UMKM sees:

- post URL;
- validation status;
- final views when available;
- validation time/source when available;
- result/reason.

UMKM does not see:

- editable views;
- approve/reject controls;
- “Anda perlu memeriksa” instructions.

## 7. Admin UI

Admin review workspace should display:

- Creator identity;
- Campaign + UMKM context;
- public post URL;
- submission timestamp;
- fraud/risk metadata;
- final views input;
- reward preview as non-authoritative preview;
- approve/reject confirmation;
- rejection reason.

## 8. Audit Requirement

Backend wiring must create an audit record containing at least:

- actor Admin ID;
- submission ID;
- decision;
- captured views when approved;
- reason/note;
- before/after status;
- timestamp.

## 9. Future Automatic Views

Automatic social-platform APIs remain future scope. If introduced:

- source metadata must distinguish API vs manual Admin;
- authorization and reward invariants remain server-side;
- UI may only say `otomatis` when actual production capability is enabled;
- historical manual validation remains auditable.

Do not tie future API rollout to undocumented thresholds in this file; roadmap/milestone decisions belong to the project roadmap/ADR when approved.
