# Design — Admin Verified Views

## Audit targets

Likely:
- `00_BACKEND/functions/review-submission/src/main.js`
- Admin `SubmissionReviewModal.tsx`
- Admin `submission.service.ts`
- current validation helpers
- Campaign domain constants
- current T&C/business-rule docs
- integration tests

Do not assume paths; search current repo.

## Recommended architecture

Create/reuse a small canonical helper for verified-view validation if server tests and UI can share semantics safely.

If frontend/admin is in a separate package runtime and sharing would create coupling:
- define a canonical server constant/policy in backend;
- mirror a frontend constant with a comment/reference;
- add contract test to prevent drift.

## Parsing

Prefer strict input:

UI:
- digits only;
- parse only after non-empty;
- `Number.isSafeInteger`;
- no exponent notation;
- no decimal separators.

Function:
- require actual integer number if current executeFunction serialization yields number;
- do not `parseInt("123abc")`;
- do not silently round.

## Storage boundary

Inspect Appwrite attribute max.

If schema has a max, it is a technical maximum.

Do not automatically label that number as “business plausibility” unless docs say so.

## Error contract

Return actionable domain reason/code, e.g.:

- `invalid_verified_views`
- `verified_views_out_of_range`
- `verified_views_unsafe_integer`
- `views_observation_pending`

Follow existing Function error conventions.

## UI

Admin modal:
- immediate validation;
- confirmation summary;
- server error retained;
- no false success;
- submit disabled only for clearly invalid local values;
- backend remains authority.

## Non-goals

- no new analytics model;
- no automated scraping;
- no reward formula redesign;
- no campaign budget redesign.
