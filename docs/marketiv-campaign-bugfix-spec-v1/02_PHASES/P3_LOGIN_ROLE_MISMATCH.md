# P3 — Login Portal Role Mismatch

**Trello:** `[BUG-P0] Login portal role mismatch tidak memberi error eksplisit`

## Objective

Remove UMKM↔Creator login bounce and make wrong-portal usage explicit.

## Inspect first

- `src/components/features/auth/LoginForm.tsx`
- `src/components/providers/AuthProvider.tsx`
- `src/services/auth/auth.service.ts`
- `src/services/auth/session.service.ts`
- `src/components/auth/RoleGuard.tsx`
- `src/lib/constants/routes.ts`

## Required behavior

### UMKM/Creator mismatch

After `login()` succeeds:

- Creator account + UMKM tab → end the newly-created session and show a Creator-role mismatch message.
- UMKM account + Creator tab → same inverse behavior.
- remain on login instead of bouncing through a dashboard guard.
- user can switch role tab and retry.

Suggested copy:

- `Akun ini terdaftar sebagai Kreator. Pilih tab Kreator untuk masuk.`
- `Akun ini terdaftar sebagai UMKM. Pilih tab UMKM untuk masuk.`

Use existing error/banner presentation.

### Admin exception

The current login UI has only UMKM/Creator tabs. Do **not** accidentally make Admin unable to log in.

For an active Admin result:

- allow the Admin canonical destination;
- do not require `activeRole === "admin"` because that tab does not exist.

### Safe `next`

Add a small route helper close to route constants or locally if truly single-use.

Accept only an internal role-compatible path:

```text
UMKM    → /dashboard/umkm...
Creator → /dashboard/kreator...
Admin   → /admin...
```

Reject:

- external URL/scheme;
- `//host`;
- other-role dashboard;
- unrelated privileged path.

Invalid/incompatible `next` → `dashboardByRole[role]`.

### Session cleanup

Use the existing AuthProvider/logout/session facade. Do not directly call Appwrite Account from `LoginForm`.

## Tests

Cover:

1. UMKM + UMKM tab → canonical success.
2. Creator + Creator tab → canonical success.
3. Creator + UMKM tab → explicit mismatch + logout + no redirect.
4. UMKM + Creator tab → explicit mismatch + logout + no redirect.
5. Admin login → `/admin` (or compatible Admin next).
6. safe compatible next honored.
7. cross-role next ignored.
8. external/protocol-relative next ignored.
9. suspended behavior remains unchanged.

## Constraints

- No new auth package.
- Do not change register/onboarding flow.
- `RoleGuard` remains defense-in-depth.

## Verification

Targeted auth tests + lint/typecheck/build.

## Done when

Wrong portal gives explicit feedback and cannot produce an authenticated redirect loop.
