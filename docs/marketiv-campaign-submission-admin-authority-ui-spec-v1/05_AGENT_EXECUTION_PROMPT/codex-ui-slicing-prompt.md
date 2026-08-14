# Codex / Coding Agent Prompt — UI-Only Campaign Submission Authority Migration

## Objective

Implement the **UI-only** migration for Marketiv Campaign submission so the product flow becomes:

`Creator submits → Marketiv/Admin validates → UMKM observes`

Do not wire or modify backend authorization in this task.

## Repository / Branch

- Repository: `marketiv-id/marketiv-web`
- Base branch: `staging`
- Inspect current code before editing.

## Required Sources of Truth

Read first:

1. `00_BACKEND/docs/04_Decisions/ADR-010.md`
2. `00_BACKEND/docs/02_Modules/Campaigns/30_Business_Rules.md`
3. `00_BACKEND/docs/02_Modules/Campaigns/40_User_Flow.md`
4. `00_BACKEND/docs/02_Modules/Campaigns/60_API.md`
5. `00_BACKEND/docs/02_Modules/Campaigns/80_Frontend.md`
6. `00_BACKEND/docs/02_Modules/Campaigns/95_Views_Tracking.md`
7. `.kiro/specs/campaign-submission-admin-authority-ui/requirements.md`
8. `.kiro/specs/campaign-submission-admin-authority-ui/design.md`
9. `.kiro/specs/campaign-submission-admin-authority-ui/tasks.md`

Also inspect actual implementation files before changing them.

## Scope

### Creator

Audit and update:

- `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx`
- `src/services/creator/creator-appwrite.service.ts`
- `src/types/creator-dashboard.ts`

Requirements:

- platform comes from Campaign, not arbitrary Creator selector;
- current MVP platform = TikTok;
- retain existing `submitProof()` service contract and trusted Function path;
- CTA `Kirim untuk Diverifikasi`;
- all validation copy uses Marketiv/Admin, not UMKM;
- pending views = `Belum diverifikasi`;
- pending reward = `Belum dihitung`;
- never call approval-only reward `Dana Cair`;
- fraud status remains separate from submission status.

### UMKM

Audit and update:

- `CampaignDetailPage.tsx`
- `CampaignSubmissionSection.tsx`
- `CampaignSubmissionCard.tsx`
- `SubmissionDetailModal.tsx`
- `CampaignQuickActionsCard.tsx`
- `CampaignHealthChecklistCard.tsx`
- `CampaignOverviewCards.tsx`
- `CampaignWorkspaceCard.tsx`
- `CampaignActivityTimeline.tsx`
- relevant UMKM types/read mapper.

Requirements:

- remove `reviewSubmission()` call from Campaign detail UI;
- remove review modal state/handler/mount;
- delete `ReviewSubmissionModal.tsx` after proving there are no references;
- UMKM is read-only observer;
- convert review language to monitoring language;
- `Lihat Detail` is allowed; approve/reject/views input are prohibited.

### Read adapter correctness

- prefer `views_count` when `views_final=true`;
- preserve safe legacy fallback;
- do not subtract Campaign platform fee from Creator reward; ADR-008 says Campaign fee is buyer-side;
- do not add new persisted status values.

## Hard Constraints

DO NOT:

- modify `00_BACKEND/functions/review-submission`;
- modify Appwrite permissions/schema;
- add Admin backend wiring;
- change payment/Midtrans;
- change reward/wallet Function logic;
- add new packages;
- refactor unrelated Rate Card flow;
- add mock business data to make UI appear complete;
- claim E2E completion.

## Implementation Discipline

1. Trace existing data flow first.
2. Make the smallest coherent changes.
3. Prefer existing primitives/components.
4. Preserve responsive/mobile behavior.
5. Avoid unrelated refactor.
6. Handle loading/error/empty/disabled states honestly.
7. Do not hide request failures as empty data.

## Acceptance Criteria

Implementation must satisfy every non-deferred requirement in the Kiro spec.

Static checks must prove:

```bash
rg -n "ReviewSubmissionModal|handleReviewConfirm|Setujui Pembayaran|Tolak Konten|Keputusan Anda" src/components/features/umkm-dashboard/campaign
rg -n "UMKM.*(memverifikasi|verifikasi jumlah|menyetujui bukti|memasukkan jumlah views)" src/components/features/creator-dashboard
```

No active legacy authority copy should remain.

## Verification

Run repository-appropriate:

- lint;
- typecheck/build;
- relevant unit tests;
- responsive manual review at 375px and desktop.

Add/adjust focused unit tests for:

- campaign-owned platform mapping;
- locked views preference;
- Campaign reward display calculation without seller-side fee;
- read-only UMKM submission actions.

## Final Report Format

Return:

1. Diagnosis confirmed.
2. Changed files.
3. Behavior before → after.
4. Verification commands + results.
5. Anything intentionally deferred to backend.
6. Remaining risks/blockers.

Do not report backend wiring as complete.
