# Acceptance Criteria

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
