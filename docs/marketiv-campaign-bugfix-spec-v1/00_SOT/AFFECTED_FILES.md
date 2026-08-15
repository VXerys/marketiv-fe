# Affected Files Matrix

Inspect current versions before editing.

| Area | Primary files | Expected change |
|---|---|---|
| Login role mismatch | `src/components/features/auth/LoginForm.tsx` | role mismatch handling, safe redirect |
| Auth state | `src/components/providers/AuthProvider.tsx` | reuse `logout`; change only if strictly needed |
| Role guard | `src/components/auth/RoleGuard.tsx` | reuse for Admin; avoid duplicate guard |
| Routes | `src/lib/constants/routes.ts` | helper/comment only if required |
| Admin root guard | `src/app/admin/layout.tsx` | remove pre-guard protected fetch; add Admin guard |
| Admin shell | `src/components/admin/DashboardLayoutShell.tsx` | pending count loading strategy if required |
| Admin dashboard | `src/app/admin/dashboard/page.tsx` | protected client load + truthful metrics/states |
| Admin submissions page | `src/app/admin/submissions/page.tsx` | explicit load errors; authoritative refresh |
| Admin submission service | `src/features/admin/submissions/services/submission.service.ts` | fail-closed real mode, canonical Function wrapper, no direct mutation |
| Admin review dialog | `src/features/admin/submissions/components/SubmissionReviewDialog.tsx` | no hardcoded authority metadata; refresh pattern |
| Admin Appwrite wrapper | `src/lib/admin/appwrite.ts` | reduce drift/reuse canonical modules if needed |
| Canonical Function wrapper | `src/lib/appwrite/functions.ts` | reuse; do not duplicate |
| Data switch | `src/config/data-source.config.ts` | reuse explicit mock gate |
| Dashboard metrics | `src/features/admin/dashboard/fixtures/dashboard.fixtures.ts` | remove fake fallback / correct semantics |
| Creator detail | `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx` | add unclaim before submission |
| Creator list reference | `src/components/features/creator-dashboard/PekerjaanAktifView.tsx` | behavior reference; change only if parity requires |
| Creator facade | `src/services/creator/creator-dashboard.service.ts` | reuse `unclaimCampaign`; normally no behavior change |
| Creator Appwrite service | `src/services/creator/creator-appwrite.service.ts` | regression inspection only |
| Review Function | `00_BACKEND/functions/review-submission/src/main.js` | stale copy/comment cleanup only; preserve logic |
| ADR | `00_BACKEND/docs/04_Decisions/ADR-010.md` | optional status wording update if current code supersedes stale status |
| Existing integration test | `src/services/__tests__/campaign-submission-e2e-flow.integration.test.ts` | stop blessing fake in-memory real flow |
| Submit proof test | `src/services/creator/__tests__/creator-appwrite.service.submit-proof.test.ts` | regression run; patch only if required |

## Do not automatically edit

- Rate Card services/components.
- payment/escrow settlement logic unrelated to Campaign review.
- Appwrite schema/config unless a failing current contract proves it is needed.
- old documentation packs simply to make them visually consistent.
- unrelated TypeScript SVG declaration bug.
