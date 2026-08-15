# Audit Snapshot — 2026-08-15

## Current staging anchor

Latest commit returned during audit:

`878d48e2db1d25e8154176719c95b8d216c641be`  
`fix umkm campaign detail status actions`

Relevant recent commits also include:

- `93ebe2dc` — Admin authority dashboard/service/tests
- `4d337419` — UMKM Campaign observer wiring
- `d7506ef6` — Creator claim modal UX
- `abb1eb2c` — ADR-010 Admin authority spec
- `7e4d311` — Appwrite Function runtime keys
- `cb6f45c` — Function inventory sync

## QA findings 1–5

| QA | Current code-level result |
|---|---|
| #1 Creator account used on UMKM login portal | **OPEN** |
| #2 Stop active Campaign | **CODE FIXED; runtime revalidation pending** |
| #3 No Unclaim action in active-work detail | **OPEN** |
| #4 submit-campaign-proof returned 201 but UI showed error | **CODE/CONFIG FIXED; runtime revalidation pending** |
| #5 Claim Campaign 401 | **CODE FIXED; runtime revalidation pending** |

## Additional blockers found

### Admin submission mutation is not fail-closed

Current `src/features/admin/submissions/services/submission.service.ts`:

- falls back to fixture/in-memory data when real reads fail or are empty;
- swallows `review-submission` execution errors;
- still mutates an in-memory store after backend failure;
- attempts direct browser `databases.updateDocument()` on submission decision fields.

This can present a false success even when the trusted Function failed.

### Admin authorization boundary is incomplete

`src/app/admin/layout.tsx` currently fetches metrics then renders the shell; no `RoleGuard role="admin"` is present.

More importantly, protected Admin data is fetched from server-rendered Admin surfaces before a browser-session role guard could run. Do not solve this by cosmetically hiding UI after the fetch.

### Admin dashboard displays unsupported operational facts

Current dashboard includes:

- fallback active Campaign count `15`;
- `+12% vs Kemarin`;
- `99.8%` validation accuracy;
- `SLA Validasi < 2 Jam`;
- fixed progress-bar percentages.

Unless backed by current data, these are not operational facts.

### Stale reviewer wording

Current `review-submission` has an Admin role guard, but one rejection notification fallback still says the proof was rejected by UMKM.

## Current authority

- `review-submission` now checks authenticated `users.role === "admin"`.
- It rejects non-Admin with 403.
- It rejects already-reviewed submission with 409.
- Approval locks final views.
- Rejection restores Campaign quota.
- Claim status is synchronized to the review outcome.
