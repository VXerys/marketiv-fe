# Affected Files Matrix — UI-First Scope

Legend:

- **MODIFY-UI** — in scope now.
- **MODIFY-ADAPTER** — lightweight frontend contract/read mapping allowed to support correct UI; no sensitive mutation.
- **DELETE-LEGACY** — remove obsolete user-facing mutation surface once references are gone.
- **SOT-UPDATE** — documentation source-of-truth change.
- **REFERENCE** — inspect only; do not copy as authority.
- **DEFER-BE** — explicitly out of current UI phase.

## `marketiv-id/marketiv-web@staging`

| File | Action | Reason |
|---|---|---|
| `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx` | MODIFY-UI | Main Creator submit + validation status surface; remove UMKM-verifier copy, derive platform, state-aware reward/views. |
| `src/types/creator-dashboard.ts` | MODIFY-ADAPTER | Add optional read-only validation metadata if mapper already has fields; do not change domain enums. |
| `src/services/creator/creator-appwrite.service.ts` | MODIFY-ADAPTER | Derive work platform from campaign, prefer locked views metadata where available. Keep `submitProof()` contract intact. |
| `src/components/features/umkm-dashboard/campaign/detail/CampaignDetailPage.tsx` | MODIFY-UI | Remove UMKM review state, mutation handler, modal wiring. |
| `src/components/features/umkm-dashboard/campaign/detail/CampaignSubmissionSection.tsx` | MODIFY-UI | Remove review callback; convert instructional copy to Marketiv-validation explanation. |
| `src/components/features/umkm-dashboard/campaign/detail/CampaignSubmissionCard.tsx` | MODIFY-UI | Remove unused review prop; read-only status/detail; neutral reward label. |
| `src/components/features/umkm-dashboard/campaign/modals/SubmissionDetailModal.tsx` | MODIFY-UI | Read-only hierarchy; Marketiv validation source/time/reason where available. |
| `src/components/features/umkm-dashboard/campaign/modals/ReviewSubmissionModal.tsx` | DELETE-LEGACY | UMKM must not validate. Delete after all imports/references are removed. |
| `src/components/features/umkm-dashboard/campaign/detail/CampaignQuickActionsCard.tsx` | MODIFY-UI | Rename review semantics to view/monitor semantics. |
| `src/components/features/umkm-dashboard/campaign/detail/CampaignHealthChecklistCard.tsx` | MODIFY-UI | Pending submission is Marketiv responsibility, not UMKM task. |
| `src/components/features/umkm-dashboard/campaign/detail/CampaignOverviewCards.tsx` | MODIFY-UI | “Perlu Diperiksa” → “Menunggu Validasi”. |
| `src/components/features/umkm-dashboard/campaign/detail/CampaignWorkspaceCard.tsx` | MODIFY-UI | Remove misleading “Data Otomatis” for manually/admin-validated views. |
| `src/components/features/umkm-dashboard/campaign/detail/CampaignActivityTimeline.tsx` | MODIFY-UI | Clarify validation actor/status language. |
| `src/types/umkm-dashboard.types.ts` | MODIFY-ADAPTER | Remove stale comment “keputusan UMKM”; optionally add read-only validation metadata without new enum values. |
| `src/services/umkm/umkm-appwrite.service.ts` | MODIFY-ADAPTER | Fix read mapper to prefer locked views; do not deduct Campaign fee from Creator reward; do not add mutation. |
| `src/services/umkm/umkm-dashboard.service.ts` | OPTIONAL-CLEANUP | `reviewSubmission()` export may remain temporarily if unused; no UI should call it. Remove only if safe and no other references. |
| `src/lib/appwrite/functions.ts` | NO CHANGE UI PHASE | Function IDs/contracts remain until backend handoff. |

## Backend files — inspect only now

| File | Action | Deferred requirement |
|---|---|---|
| `00_BACKEND/functions/review-submission/src/main.js` | DEFER-BE | Replace UMKM owner authorization with active Admin authorization; audit logs; copy. |
| `00_BACKEND/functions/submit-campaign-proof/src/main.js` | DEFER-BE | Keep current trusted submit path; later align platform contract if product expands. |
| `00_BACKEND/functions/ai-fraud-precheck/src/main.js` | DEFER-BE | Preserve fraud as risk signal; no automatic financial status change. |
| `00_BACKEND/functions/calculate-campaign-reward/src/main.js` | DEFER-BE | Preserve idempotent reward processing based on approved + locked views. |
| `00_BACKEND/appwrite.config.json` | DEFER-BE | Admin read/write permissions only when backend design is approved. |
| `00_BACKEND/tests/e2e/critical-flows.spec.ts` | DEFER-BE/E2E | Replace placeholder with real end-to-end scenario after wiring. |

## `VXerys/admin-dashboard-marketiv@main`

| File | Action | Notes |
|---|---|---|
| `src/app/dashboard/submissions/page.tsx` | REFERENCE | Good pending-first list/search/responsive pattern. |
| `src/features/submissions/components/SubmissionReviewDialog.tsx` | REFERENCE | Good information architecture for admin review + views capture. |
| `ApproveSubmissionDialog.tsx` / `RejectSubmissionDialog.tsx` | REFERENCE | Confirmation pattern only. |
| `src/features/submissions/types.ts` | REFERENCE | Conceptual DTO only; contains `youtube`, not current Campaign MVP truth. |
| `src/features/submissions/services/submission.service.ts` | REFERENCE | Contains fixtures/default assumptions; not production source of truth. |

## Documentation files

See `02_SOT_PATCHES/README.md` for exact canonical documents that must change.
