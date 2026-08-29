# Task 03 — Auth Hardening

## Objective

Ensure session isolation does not weaken authentication/authorization and that stale/wrong-role Admin sessions fail safely.

## Required rules

1. Preserve Admin role verification.
2. Preserve suspended Admin rejection.
3. Preserve anonymous-session rejection.
4. Preserve non-Admin rejection.
5. Logout Admin must operate through Admin's isolated Appwrite endpoint.
6. Logout user app must operate through user app's isolated Appwrite endpoint.
7. Do not add cross-domain cookie deletion logic.
8. Do not make user app aware of Admin credentials/session.
9. Do not make Admin app aware of UMKM/Creator credentials/session.

## Existing Admin behavior to preserve/review

Current sign-in:
1. `createEmailPasswordSession`
2. `resolveAdminSession`
3. if invalid role/status, delete current Admin-side session
4. throw typed auth error

With endpoint isolation, step 3 must affect only the Admin API session context.

## Existing-session edge case

Inspect actual Appwrite behavior and current UI bootstrap.

Test:
- valid Admin session already exists and login page is visited;
- stale/expired Admin session;
- non-Admin session somehow exists on Admin API origin;
- wrong password;
- suspended Admin.

Only add new recovery logic if a real reproducible failure exists.

Do not pre-emptively rewrite auth.

## Tests

At minimum preserve/update:
- `admin/src/lib/admin/auth.test.ts`

Add test cases only where they validate code behavior, not browser cookie isolation.

Browser host isolation belongs to Task 04/05.
