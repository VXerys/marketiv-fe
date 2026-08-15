# P5 — Claim / Unclaim Counter Consistency

## Trello
`[BUG-P0] Campaign claim/unclaim counter authority masih split client + Function`

## Inspect
```text
src/services/creator/creator-appwrite.service.ts
src/services/creator/creator-dashboard.service.ts
src/lib/appwrite/functions.ts
00_BACKEND/functions/campaign-claimed/src/main.js
00_BACKEND/functions/expire-stale-claims/src/main.js
00_BACKEND/src/services/claim.service.ts
00_BACKEND/appwrite.config.json
```

## Claim
Current `campaign-claimed` event is server counter authority.

Therefore:
- remove browser `incrementDocumentAttribute(totalClaims,+1)`;
- claim success depends on actual claim creation, not local counter;
- align duplicate query with backend current rule:
  - non-expired prior claim blocks;
  - expired prior claim does not.

## Unclaim
Search equivalent Function first.

If none exists, add `unclaim-campaign`:
1. authenticate;
2. verify Creator/active account as current user model requires;
3. load claim;
4. verify owner;
5. require `status=claimed`;
6. remove/cancel claim server-side;
7. atomically return one Campaign slot;
8. return explicit failure if consistency cannot be guaranteed.

Frontend becomes Function-backed.
Remove direct browser claim delete + counter decrement authority.

No broad collection permission.

## Tests
- no client counter increment;
- expired previous claim can be reclaimed;
- owner unclaim success;
- wrong owner denied;
- submitted denied;
- missing claim;
- counter failure cannot report success;
- retry/idempotency behavior documented/tested.

## Verify
Root targeted tests + lint/typecheck/build.

STOP.
