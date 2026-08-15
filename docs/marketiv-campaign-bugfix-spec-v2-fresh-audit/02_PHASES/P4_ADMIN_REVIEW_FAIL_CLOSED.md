# P4 — Admin Review Mutation Fail-Closed

## Trello
`[BUG-P0] Admin submission service dapat false-success dan bypass authority`

## Inspect
```text
admin/src/features/admin/submissions/services/submission.service.ts
admin/src/features/admin/submissions/components/SubmissionReviewDialog.tsx
admin/src/app/submissions/page.tsx
admin/src/features/admin/submissions/__tests__/submission.service.test.ts
00_BACKEND/functions/review-submission/src/main.js
```

## Implement
- Create/reuse one Admin-local typed Function execution wrapper.
- Parse JSON safely.
- Treat failed execution/non-2xx as failure.
- Preserve safe backend error message.
- Remove swallowed review errors.
- Remove direct browser `databases.updateDocument()` for final review fields.
- Remove local fixture/store mutation as real success path.
- Remove `adminId` as authorization identity.
- After trusted success, refresh through P3 secure read Function.
- If mutation succeeds but refresh fails, show “saved, refresh failed”; do not automatically re-submit.

## Tests
- approve/reject success;
- 401/403/409/500;
- malformed/non-JSON;
- direct DB write never called;
- Function failure cannot change local success state;
- success triggers authoritative refresh.

Do not invent persistent audit-log collection if current schema has none.

## Verify
Admin test/lint/typecheck/build.

STOP.
