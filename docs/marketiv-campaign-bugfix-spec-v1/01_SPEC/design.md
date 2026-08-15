# Design — Campaign E2E Blocker Hardening

## Architecture principle

Keep the current architecture and remove unsafe exceptions rather than introducing a parallel system.

### Existing reusable boundaries

```text
Auth:
LoginForm → auth.service.login
          → AuthProvider.refresh/logout
          → RoleGuard
          → dashboard route

Trusted mutation:
UI → feature/service facade
   → executeFunction(FUNCTION_IDS.*)
   → Appwrite Function
   → Appwrite Database

Campaign review:
Admin UI
→ review-submission
→ campaign_submissions + claim sync + quota/reward downstream
```

## D1 — Admin mutation becomes fail-closed

Current anti-pattern:

```text
Function fails
→ warning swallowed
→ local store changed
→ direct DB update attempted
→ UI reports success
```

Target:

```text
Admin action
→ executeFunction(reviewSubmission)
   ├─ failure → throw/show error; no success state
   └─ success → reload authoritative submission/queue
                → UI reflects backend result
```

Implementation guidance:

- Prefer canonical `@/lib/appwrite/functions` `executeFunction`.
- Do not hand-roll `createExecution` parsing in Admin feature code.
- Do not call `databases.updateDocument` for review decision fields.
- Real-mode read failures propagate.
- Explicit mock mode may use fixtures/store.
- Avoid a global service-contract rewrite solely for this fix. Preserve public APIs where practical, but authoritative refresh is mandatory.

### Success vs refresh failure

Do not mislabel a successful mutation as failed merely because a subsequent UI refresh failed.

Preferred component behavior:

1. trusted Function succeeds → mutation success is real;
2. reload authoritative list;
3. if reload fails → show a warning such as “Keputusan tersimpan, tetapi data terbaru gagal dimuat. Segarkan halaman.”;
4. do not automatically retry the review mutation, which could return 409.

## D2 — Admin guard before protected data load

Current auth is browser-session based and globally wrapped by `AuthProvider`.

Use `RoleGuard role="admin"` rather than inventing a second role system.

Important: current Admin layout/dashboard server components read Admin data before a client guard could execute. The fix must move protected Admin reads behind the effective authorization boundary.

Minimal design for the current architecture:

```text
Root AuthProvider
→ /admin layout
  → RoleGuard role="admin"
    → client Admin shell/data loaders
      → Admin dashboard/submissions
```

Do not add a server Appwrite admin key to solve browser session lookup.

If current `staging` has gained a proper server-side authenticated-session helper after this spec snapshot, Codex may use it instead, but it must remain fail-closed and document the newer path.

## D3 — Role-aware login

After `login()` returns authenticated role:

```text
if role = admin:
  allow Admin canonical destination (no Admin role tab exists)

else if role != activeRole:
  terminate the just-created session
  show explicit mismatch banner
  remain on login UI

else:
  use safe compatible `next` OR canonical dashboard
```

### Safe `next`

Accept only local application paths:

- begins with `/`;
- does not begin with `//`;
- is compatible with role prefix:
  - UMKM: `/dashboard/umkm`
  - Creator: `/dashboard/kreator`
  - Admin: `/admin`

Otherwise use `dashboardByRole[role]`.

This is authorization-safe navigation, not a replacement for `RoleGuard`.

## D4 — Creator Unclaim detail

Match list behavior rather than inventing another contract.

```text
canUnclaim =
  work.status === "claimed"
  AND no submitted content/submission

CTA
→ confirm
→ creator-dashboard.service.unclaimCampaign(work.id)
→ success toast
→ router.replace(routes.kreatorActiveWorks)
→ optional refresh
```

No backend/API changes are expected.

## D5 — Admin metric truthfulness

Use only data whose semantics are provable.

- `pendingSubmissionsCount`: actual pending records/total.
- `activeCampaignsCount`: actual active Campaign query.
- “verified today”: only keep if truly date-scoped.
- Remove or replace unsupported accuracy/growth/SLA metrics.
- Static progress bars must not imply measured performance.

If a metric cannot be computed reliably with the current client query and schema, prefer removing/renaming it over inventing a value.

## D6 — UI state model

Admin submission list:

```text
loading → spinner/skeleton
error   → explicit retry state
empty   → valid “no submissions”
data    → table/cards
```

Mutation:

```text
idle → confirming → submitting
failure → error + retain item
success → refresh authoritative data
```

## D7 — Tests

Prioritize focused tests around behavioral boundaries.

Required categories:

- login mismatch + correct-role + admin exception + safe next;
- Admin service Function success/fail + no direct write + mock gating;
- Admin role guard matrix;
- Creator unclaim visibility/success/failure;
- Admin metric empty/error/truth semantics;
- regression for stop Campaign, submit proof trusted path, claim permission if testable locally.

Do not use an in-memory “E2E” test as evidence that real Appwrite wiring succeeded.
