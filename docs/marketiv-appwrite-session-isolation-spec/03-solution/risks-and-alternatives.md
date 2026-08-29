# Risks and Alternatives

## Risk R1 — Second custom API domain unsupported

Mitigation:
- verify in Appwrite Console before code/env mutation;
- stop if unsupported.

Do not automatically create a second Appwrite project.

## Risk R2 — Cookie still scopes to parent `.marketiv.id`

Mitigation:
- inspect cookie Domain/HostOnly in DevTools;
- run simultaneous-login matrix.

If collision remains, stop and report.

### Alternative requiring separate approval

A server-side auth architecture with explicitly named HttpOnly host-only cookies could isolate sessions at each frontend origin.

This is a larger migration and **not part of this task**.

## Risk R3 — Main Google OAuth accidentally broken

Mitigation:
- do not change `api-staging.marketiv.id`;
- verify Appwrite-provided callback and Google Authorized Redirect URI;
- test Google login after admin endpoint change if Google OAuth is enabled on staging.

## Risk R4 — Admin role checks weakened

Mitigation:
- preserve `resolveAdminSession()` behavior;
- retain tests for forbidden/suspended/non-admin users.

## Risk R5 — Agent over-refactors

Mitigation:
- strict file/scope discipline;
- no unrelated auth rewrite;
- every changed file must be explained in completion report.
