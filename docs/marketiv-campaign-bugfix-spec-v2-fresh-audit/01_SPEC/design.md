# Design — Fresh Bugfix v2

## Admin read flow

```text
Admin browser session
→ AdminAuthGate
→ Admin-only read Function
→ Function validates users.role=admin + active
→ server SDK cross-user reads
→ minimal DTO
→ Admin UI
```

Do **not** make `campaign_submissions` readable by all users.

## Admin mutation flow

```text
Admin UI
→ admin service
→ typed Function execution wrapper
→ review-submission
→ backend validates active Admin
→ backend updates authoritative state
→ success
→ secure queue refresh
```

No local store is authoritative.

## Admin auth

Current browser Appwrite Auth means protected data must not be fetched by server-rendered Admin pages using a browser SDK before user-session validation.

Preferred current-architecture shape:

```text
Admin client auth bootstrap
→ role/status check
→ authorized shell
→ protected client data loader / Function call
```

If current code has gained a genuine server-session/JWT path, Codex may use it instead if it proves the same browser user and fails closed.

## Secure read Functions

### `get-admin-submission-queue`
Suggested input:
```ts
{ status?: "pending"|"approved"|"rejected"|"all"; limit?: number }
```

Output: minimal Admin submission DTO + total.

Requirements:
- authenticated caller;
- users.role=`admin`;
- active status;
- server-side joins;
- bounded query;
- read-only.

### `get-admin-dashboard-summary`
Return only factual:
```ts
{
  pendingSubmissionsCount: number,
  reviewedSubmissionsCount: number,
  activeCampaignsCount: number
}
```

Do not call a value “today” unless actually date-scoped.

## Claim counter

Keep `campaign-claimed` as the single increment authority unless current code has a newer trusted claim Function.

Remove browser counter increment.

## Unclaim

If no equivalent exists, add trusted `unclaim-campaign` Function:

```text
authenticate Creator
→ load own claim
→ require status=claimed
→ delete/cancel claim
→ atomic totalClaims -1
→ explicit success/failure
```

Avoid silent partial success; compensate/reconcile if a multi-step operation partially fails.

## Safe login destination

Allowed:
- UMKM → `/dashboard/umkm...`
- Creator → `/dashboard/kreator...`
- Admin → configured Admin app origin/path

Reject arbitrary external/cross-role `next`.

## Testing

Admin gets self-contained Vitest tooling because tests already live inside `admin/src`.

Target focused boundary tests instead of broad E2E mocks.

## Runtime status labels

Use:
- `CODE_VERIFIED`
- `READY_FOR_STAGING_E2E`
- `STAGING_E2E_PASS`
- `STAGING_E2E_FAIL`
- `BLOCKED_BY_ENVIRONMENT`
