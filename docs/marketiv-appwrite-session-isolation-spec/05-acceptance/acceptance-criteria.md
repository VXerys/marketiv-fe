# Acceptance Criteria

## Staging verification status — 2026-08-29

Status below combines repository verification and manual staging evidence supplied
after deployment. `BLOCKED` means required deployed evidence was not supplied; it
does not override passing unit coverage.

| ID | Status | Evidence |
|---|---|---|
| AC-01 | PASS | Deployed bundle audit confirmed both applications use the same staging project/database. |
| AC-02 | PASS | Main uses `https://api-staging.marketiv.id/v1`; Admin uses `https://api-admin-staging.marketiv.id/v1`. |
| AC-03 | PASS | Main-then-Admin and Admin-then-Main login both passed in one browser profile. |
| AC-04 | PASS | Refreshing both authenticated applications passed. |
| AC-05 | PASS | Main logout left Admin authenticated. |
| AC-06 | PASS | Admin logout left Main authenticated. |
| AC-07 | BLOCKED | Deployed wrong-password/non-Admin isolation evidence was not supplied. |
| AC-08 | BLOCKED | Fail-closed unit tests pass, but deployed non-Admin and suspended-Admin evidence was not supplied. |
| AC-09 | PASS | No project, data, user, Function, bucket, or provider migration was performed. |
| AC-10 | BLOCKED | Main hostname/config remained unchanged, but deployed Google OAuth and provider callback verification was not supplied. |
| AC-11 | PASS | Repository diff contains no API key, OAuth secret, or Appwrite session secret. |
| AC-12 | PASS | Changes and manual verification were limited to staging. |
| AC-13 | PASS | Main and Admin typecheck, lint, test, and build commands passed; lint retained pre-existing warnings. |
| AC-14 | PASS | Browser requests carried Appwrite session cookies through separate Main/Admin API origins, and independent login/logout behavior passed. |

Overall specification status: **BLOCKED** pending AC-07, AC-08, and AC-10
deployed evidence.

## AC-01 — Same backend project

Both apps use the same intended Appwrite staging project and database.

## AC-02 — Separate Appwrite API origins

Main:

```text
https://api-staging.marketiv.id/v1
```

Admin:

```text
https://api-admin-staging.marketiv.id/v1
```

## AC-03 — Simultaneous login

One browser profile can have an authenticated UMKM/Creator main session and authenticated Admin session at the same time.

## AC-04 — Refresh persistence

Refreshing either app does not replace/invalidate the other app's session.

## AC-05 — Independent main logout

Main logout does not logout Admin.

## AC-06 — Independent Admin logout

Admin logout does not logout main.

## AC-07 — Invalid Admin attempt isolation

Wrong Admin credentials or a rejected non-Admin login attempt does not alter the existing main session.

## AC-08 — Admin authorization preserved

UMKM/Creator cannot access protected Admin data/routes.

Suspended Admin remains rejected.

## AC-09 — No data migration

No Auth user, database document, function, storage bucket, or transaction is duplicated/migrated to solve this issue.

## AC-10 — Google OAuth preserved

If main stays on `api-staging.marketiv.id`, its current valid Google OAuth provider callback remains unchanged.

## AC-11 — No secrets

No API key, Google client secret, Appwrite session secret, or server credential is committed/logged.

## AC-12 — Production untouched

No production domain/environment/project is modified.

## AC-13 — Verification green

Required typecheck/lint/test/build commands pass, or any pre-existing failure is explicitly identified with proof and separated from this change.

## AC-14 — Browser storage proof

DevTools confirms separate API-origin session storage behavior. If cookie Domain unexpectedly broadens to `.marketiv.id` and collisions persist, acceptance fails.
