# P2 — Admin Authorization Boundary

**Trello:** `[SEC-P0] Admin routes belum punya guard role yang terbukti`

## Objective

Protect `/admin/*` with the current role/session architecture **before protected Admin data is loaded**.

## Inspect first

- `src/app/layout.tsx`
- `src/components/providers/AuthProvider.tsx`
- `src/components/auth/RoleGuard.tsx`
- `src/app/dashboard/umkm/layout.tsx`
- `src/app/dashboard/kreator/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/submissions/page.tsx`
- `src/components/admin/DashboardLayoutShell.tsx`
- `src/services/auth/session.service.ts`
- `src/types/domain.ts`

## Current architecture facts

- root already has `AuthProvider`;
- `UserRole` already includes `admin`;
- `RoleGuard` accepts `UserRole`;
- Admin has no profile collection and is treated profile-complete;
- current Admin layout/dashboard performs protected reads before any Admin RoleGuard.

## Required implementation

### 1. Reuse RoleGuard

Add an Admin boundary based on the existing `RoleGuard role="admin"` unless current code now has a stronger centralized mechanism.

Do not create a duplicate Admin-specific role system.

### 2. Move protected reads behind the effective guard

A client guard wrapping a server component that already fetched protected data is not sufficient.

For the current browser-session architecture, prefer:

```text
/admin layout
→ RoleGuard role=admin
→ client Admin shell/data loaders
→ protected page reads
```

Concretely:

- remove protected metric fetch from server `src/app/admin/layout.tsx`;
- do not let `src/app/admin/dashboard/page.tsx` fetch protected Appwrite data server-side before authorization;
- convert/split Admin data surfaces so reads happen after active Admin authorization.

If newer code contains an authenticated server-session mechanism, Codex may use it, but must prove it is tied to the user session and fail-closed.

### 3. Authorization matrix

Verify:

| Session | `/admin/dashboard` |
|---|---|
| none | login redirect / no protected render |
| UMKM active | denied / routed to UMKM dashboard |
| Creator active | denied / routed to Creator dashboard |
| Admin suspended | blocked |
| Admin active | allowed |

No flash of protected Admin data.

### 4. Admin shell pending count

If `DashboardLayoutShell` needs a pending count, obtain it after Admin authorization. While loading, use a neutral/no-count state rather than fixture data.

### 5. Tests

Add focused role/deep-link tests using the repository’s existing test style. Do not require a live Appwrite project for unit-level role matrix.

## Security constraints

- Do not add `APPWRITE_API_KEY` to frontend.
- Do not add new `NEXT_PUBLIC_*` secrets.
- Do not weaken Appwrite collection permissions to make the dashboard easier to read.
- Role hiding is not a substitute for backend Function authorization.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

Plus targeted auth/Admin tests.

## Done when

Protected Admin data does not load for non-Admin sessions, while active Admin access remains functional.
