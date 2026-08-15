# Fresh Audit Snapshot — `staging` @ `ecb0348`

## Admin extraction status

Admin is now standalone:

```text
admin/src/app/
admin/src/components/
admin/src/features/
admin/src/lib/
```

Legacy runtime Admin implementation in main `src/` has been removed.

## Confirmed Admin blockers

### A. Protected reads before auth
`admin/src/app/layout.tsx` calls dashboard metrics before any effective Admin session/role check.

`admin/src/app/dashboard/page.tsx` also performs protected data reads as an async server page.

### B. Fail-open Admin session helper
`admin/src/lib/admin/auth.ts` catches errors and returns a synthetic active Admin (`admin-ops-01` / `ops@marketiv.id`).

### C. Config fallback can select staging
`admin/src/lib/admin/appwrite.ts` falls back to hardcoded staging endpoint/project/database IDs.

Main user `src/lib/constants/routes.ts` can also default Admin origin to staging if deployment env/config is incomplete.

### D. No secure cross-user Admin submission read
`submit-campaign-proof` grants submission read only to:
- Creator;
- campaign UMKM owner.

Admin browser cannot rely on direct collection reads for a cross-user queue.

Expected: Admin-only server read Function/DTO, not broad collection permissions.

### E. Review service false success
Admin submission service currently:
- falls back to fixture/in-memory data after real read failure/empty;
- swallows Function failures;
- mutates local store after failure;
- directly calls browser `updateDocument()` for review fields;
- can return success despite trusted backend failure.

### F. Metrics/operational UI not factual
Current examples:
- fallback active Campaign count `15`;
- default pending count `12`;
- `verifiedTodayCount` is not truly today-scoped;
- `+12% vs Kemarin`;
- `99.8%`;
- `SLA < 2 Jam`;
- fixed progress bars;
- hardcoded `Appwrite Staging`, `Online`, and Admin identity;
- fixture operational notifications presented as live.

### G. Admin tests are not standalone
There is a Vitest test file under `admin/src`, but standalone Admin package does not declare its own test script/Vitest dependency. The existing test also blesses the unsafe in-memory flow.

## Fresh Campaign claim/unclaim defect

### Claim
Browser `claimCampaignInAppwrite()`:
1. creates a claim row;
2. browser-increments `campaign.totalClaims`.

Event Function `campaign-claimed` also atomically increments `totalClaims`.

This creates split authority and possible double-count / permission-dependent behavior.

### Unclaim
Browser currently:
1. deletes claim;
2. attempts direct atomic decrement;
3. swallows decrement failure and still returns success.

This can remove a claim while leaving quota stale.

### Expired reclaim drift
Frontend rejects any previous claim row including `expired`.

Current backend `claim.service.ts` permits reclaim when only expired claims exist.

## QA 1–5 fresh status

| QA | Current result |
|---|---|
| #1 Wrong portal role login | OPEN |
| #2 Stop/pause Campaign | CODE FIXED, runtime pending |
| #3 Detail Unclaim | OPEN |
| #4 Submit proof | CODE/CONFIG FIXED, runtime pending |
| #5 Claim 401 | permission portion fixed, overall flow PARTIAL due counter/reclaim defect |
