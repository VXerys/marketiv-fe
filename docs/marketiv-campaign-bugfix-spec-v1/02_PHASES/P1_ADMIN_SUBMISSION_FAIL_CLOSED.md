# P1 — Admin Submission Mutation: Fail-Closed

**Trello:** `[BUG-P0] Admin submission service dapat false-success dan bypass authority`

## Objective

Make Admin review state truthful: trusted Function success is required; browser fallback/direct mutation cannot create success.

## Inspect first

- `src/features/admin/submissions/services/submission.service.ts`
- `src/features/admin/submissions/components/SubmissionReviewDialog.tsx`
- `src/app/admin/submissions/page.tsx`
- `src/lib/appwrite/functions.ts`
- `src/lib/admin/appwrite.ts`
- `src/config/data-source.config.ts`
- `00_BACKEND/functions/review-submission/src/main.js`
- `src/services/__tests__/campaign-submission-e2e-flow.integration.test.ts`

## Required implementation

### 1. Real reads vs mock reads

In real mode:

- Appwrite read error → throw/return explicit error; **never fixtures**.
- zero documents → `[]`.
- do not merge in-memory store into real results.

In `DATA_SOURCE_CONFIG.useMockData === true`:

- fixture/store behavior may remain for local test/demo.

### 2. Review mutation

For real mode:

- call canonical `executeFunction(FUNCTION_IDS.reviewSubmission, payload)`;
- remove feature-local manual `createExecution` parsing;
- on Function failure, propagate meaningful error;
- remove direct browser `databases.updateDocument()` for approval/rejection fields;
- remove any local mutation that makes the decision look successful before backend success.

### 3. Post-success refresh

After Function success, UI must re-read authoritative data.

Preferred pattern:

- review service reports trusted mutation success;
- Admin submissions page reloads list;
- if reload fails after mutation success, show a **refresh warning**, not “review failed” and do not re-submit automatically.

Do not rely on `adminId: "Admin Ops 1"` as authority metadata; backend derives actor from authenticated request.

### 4. Error state

`src/app/admin/submissions/page.tsx` must distinguish:

- loading;
- fetch error + retry;
- valid empty;
- data.

### 5. Tests

Rewrite/remove any test that uses `addSubmissionToStore/resetSubmissionsStore` as proof of a real authoritative path.

Add focused tests covering:

- Function success;
- Function 401;
- 403;
- 409 already reviewed;
- 5xx;
- Function/SDK exception;
- real read failure is not fixtures;
- real empty is `[]`;
- mock mode can still use fixtures;
- direct `updateDocument()` is never called for review.

## Constraints

- Preserve `review-submission` backend logic.
- No Appwrite schema change.
- No Rate Card changes.
- Do not rewrite every service in the repository to a new result pattern.

## Verification

Run the smallest targeted Vitest set first, then:

```bash
npm run lint
npm run typecheck
npm run build
```

If typecheck hits only the known pre-existing SVG issue, report it separately.

## Done when

A failed trusted Function can no longer produce UI/local “success”, and real mode never hides a data failure with fixtures.
