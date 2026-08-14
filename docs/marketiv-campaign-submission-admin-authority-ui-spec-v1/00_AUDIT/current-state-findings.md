# Current-State Audit — Campaign Submission Validation

## Executive Finding

Campaign E2E pada `marketiv-web@staging` belum selesai karena **authority submission validation terpecah antara tiga sumber**:

- current Creator UI sebagian sudah memakai konsep Admin;
- current UMKM UI masih menyimpan legacy review mutation;
- current backend `review-submission` masih mengotorisasi pemilik UMKM;
- canonical `00_BACKEND/docs` masih mayoritas mendokumentasikan UMKM sebagai validator;
- newer `docs/marketiv-md/features/08` dan permissions matrix justru sudah menyatakan Admin sebagai validator.

Target yang perlu dikunci adalah:

```text
Creator
  submit public post URL
        ↓
Submission: pending
        ↓
AI precheck = risk signal only
        ↓
Admin Marketiv
  validate URL/content + capture final views + approve/reject
        ↓
Submission: approved | rejected
        ↓ approved
Backend reward calculation
        ↓
Creator pending balance / transaction

UMKM: read-only visibility throughout submission validation
```

## P0 — Product Authority Conflict

### P0.1 UMKM still owns review mutation in current frontend

Affected code:

- `src/components/features/umkm-dashboard/campaign/detail/CampaignDetailPage.tsx`
- `src/components/features/umkm-dashboard/campaign/modals/ReviewSubmissionModal.tsx`

Current implementation still imports `reviewSubmission`, maintains `activeReviewSubmission`, calls `handleReviewConfirm`, and renders a modal containing:

- “Keputusan Anda”
- “Setujui Pembayaran”
- “Tolak Konten”
- manual views input

This directly conflicts with the desired admin-authority model.

### P0.2 Backend still authorizes UMKM owner

`00_BACKEND/functions/review-submission/src/main.js` validates the caller by querying parent campaign with:

```text
campaign.umkmId === caller userId
```

Therefore, the new Admin dashboard cannot safely be wired by merely calling the existing Function. Authorization semantics must change later.

**UI phase rule:** do not modify this Function yet. Remove the obsolete UMKM mutation surface so frontend product behavior already matches the target authority model.

### P0.3 Canonical docs still describe UMKM review

Stale references exist in:

- `Campaigns/00_Index.md`
- `Campaigns/10_Overview.md`
- `Campaigns/30_Business_Rules.md`
- `Campaigns/40_User_Flow.md`
- `Campaigns/60_API.md`
- `Campaigns/80_Frontend.md`
- `Campaigns/95_Views_Tracking.md`
- `Campaigns/96_Views_Sprint_Plan.md`
- `Campaigns/100_Testing.md`
- `03_Workflows/20_Campaign_PPV.md`
- `03_Workflows/40_Submission_Fraud.md`

Because `00_BACKEND/docs/README.md` declares this tree the single source of truth, these documents must be corrected before future AI agents/code generators continue implementation.

## P1 — Fraud Documentation vs Actual Code

Canonical docs currently describe fraud routing as:

- low risk → auto-approve
- medium → admin review
- high → auto-reject

Actual `ai-fraud-precheck/src/main.js` does **not** mutate submission status. It only updates:

- `fraudScore`
- `fraudStatus`
- `fraud_checks`

Therefore target documentation should reflect current safe behavior:

> fraud result is advisory/routing information; Admin remains final authority for `pending → approved/rejected`.

This separation is safer and prevents AI scoring alone from triggering financial reward.

## P1 — Reward Presentation / Mapper Risk

`src/services/umkm/umkm-appwrite.service.ts` currently maps Campaign submission reward using:

```text
floor(views / 1000 * rate * (1 - PLATFORM_FEE_RATE))
```

This conflicts with ADR-008: Campaign PPV fee is buyer-side, so Creator receives the full Campaign reward. Additionally, the mapper reads legacy `d.views` instead of preferring locked `views_count` when `views_final` is true.

**UI phase decision:**

- do not present this computed value as “Dana Cair”;
- use neutral `Reward terhitung` only when an authoritative amount is available;
- pending state must show `— / Belum dihitung`;
- capture the mapper correction as a wiring/read-contract task, not as a financial mutation in the UI.

## P1 — Platform Contract Drift

Conflicting facts:

- `src/types/domain.ts` and canonical Campaign docs say Campaign MVP platform = TikTok.
- current `submit-campaign-proof` Function accepts TikTok and Instagram.
- current Creator form manually allows both TikTok and Instagram.
- before submission, `CreatorActiveWork.platform` is undefined because it is read from submission instead of campaign.

**Resolution for this spec:** campaign owns the platform. Creator must not choose an unrelated platform at submit time. Current product MVP renders TikTok from campaign data. The UI component remains data-driven for future multi-platform support.

## P2 — UMKM Observer UI Copy Still Implies Responsibility

Affected components:

- `CampaignSubmissionSection.tsx`: “Petunjuk Cara Memeriksa Konten”
- `CampaignQuickActionsCard.tsx`: “Periksa Bukti Konten Baru”
- `CampaignHealthChecklistCard.tsx`: “perlu Anda periksa”
- `CampaignOverviewCards.tsx`: “Perlu Diperiksa”

These should be transformed into monitoring language:

- `Menunggu Validasi Marketiv`
- `Lihat Bukti Konten`
- `Status Validasi Bukti`
- `Diproses Marketiv`

## P2 — Creator Copy Is Internally Inconsistent

`ActiveWorkDetailView.tsx` already has:

- timeline “Audit Validasi Admin”
- success message “sedang diverifikasi oleh admin”

but still says elsewhere:

- UMKM verifies views;
- UMKM approves proof;
- UMKM inputs views.

All active copy must use one actor name consistently: **Marketiv / Admin Marketiv**.

## E2E Verification Gap

`00_BACKEND/tests/e2e/critical-flows.spec.ts` still contains scaffolded `expect(true).toBe(true)` tests. Therefore no document or report should claim Campaign E2E complete until real browser scenarios cover:

`create/pay/publish → claim → submit → admin validate → reward → visible outcome`.

## Current Progress Classification

| Capability | Current status |
|---|---|
| Campaign create/edit | Implemented / previously hardened |
| Campaign payment/publish | Implemented, E2E verification incomplete |
| Creator claim | Implemented |
| Creator proof submission | Implemented through trusted Function |
| Submission pending state | Implemented |
| Fraud precheck risk fields | Implemented |
| UMKM read-only monitoring | Partially implemented |
| Admin validation UI | Concept implemented in separate repo |
| Admin validation backend authorization | Blocked / pending |
| Full Campaign E2E | Not complete |
