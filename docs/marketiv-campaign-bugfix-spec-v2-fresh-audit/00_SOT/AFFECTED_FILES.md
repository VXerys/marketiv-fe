# Current Affected Files

Inspect current versions before editing.

## Admin runtime/config
```text
admin/package.json
admin/package-lock.json
admin/tsconfig.json
admin/.env.example
admin/src/lib/admin/appwrite.ts
admin/src/lib/admin/auth.ts
admin/src/app/layout.tsx
admin/src/app/dashboard/page.tsx
admin/src/app/submissions/page.tsx
admin/src/components/admin/DashboardLayoutShell.tsx
admin/src/components/admin/AdminSidebar.tsx
admin/src/components/admin/AdminHeader.tsx
```

## Admin submissions/metrics
```text
admin/src/features/admin/submissions/services/submission.service.ts
admin/src/features/admin/submissions/types.ts
admin/src/features/admin/submissions/components/SubmissionReviewDialog.tsx
admin/src/features/admin/submissions/__tests__/submission.service.test.ts
admin/src/features/admin/submissions/fixtures/*
admin/src/features/admin/dashboard/fixtures/dashboard.fixtures.ts
```

## User app auth/routes
```text
src/components/features/auth/LoginForm.tsx
src/components/providers/AuthProvider.tsx
src/services/auth/auth.service.ts
src/services/auth/session.service.ts
src/lib/constants/routes.ts
src/components/auth/RoleGuard.tsx
```

## Creator Campaign
```text
src/components/features/creator-dashboard/PekerjaanAktifView.tsx
src/components/features/creator-dashboard/ActiveWorkDetailView.tsx
src/services/creator/creator-dashboard.service.ts
src/services/creator/creator-appwrite.service.ts
src/lib/appwrite/functions.ts
```

## Backend
```text
00_BACKEND/functions/submit-campaign-proof/src/main.js
00_BACKEND/functions/review-submission/src/main.js
00_BACKEND/functions/campaign-claimed/src/main.js
00_BACKEND/functions/expire-stale-claims/src/main.js
00_BACKEND/src/services/claim.service.ts
00_BACKEND/appwrite.config.json
00_BACKEND/appwrite.json
00_BACKEND/appwrite/generate_appwrite_json.cjs
```

## Expected missing trusted boundaries

Confirm no equivalent exists before creating:

```text
get-admin-submission-queue
get-admin-dashboard-summary
unclaim-campaign
```

## Do not touch automatically
- Rate Card;
- unrelated payment/withdrawal;
- generic design-system refactor.
