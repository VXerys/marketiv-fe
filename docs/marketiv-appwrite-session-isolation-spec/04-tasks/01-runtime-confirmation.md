# Task 01 — Runtime Confirmation

## Objective

Confirm that the diagnosed collision matches deployed staging reality.

This task has **manual/console steps** that a local code agent may not be able to perform. If access is unavailable, the agent must produce a checklist for the CTO instead of guessing.

## A. Deployment environment

Record actual values without exposing secrets:

### Main Site
```text
NEXT_PUBLIC_APPWRITE_ENDPOINT = ?
NEXT_PUBLIC_APPWRITE_PROJECT_ID = ?
NEXT_PUBLIC_APPWRITE_DATABASE_ID = ?
```

### Admin Site
```text
NEXT_PUBLIC_APPWRITE_ENDPOINT = ?
NEXT_PUBLIC_APPWRITE_PROJECT_ID = ?
NEXT_PUBLIC_APPWRITE_DATABASE_ID = ?
```

Expected diagnosis:
- project IDs equal;
- database IDs equal;
- before fix, endpoints likely equal.

## B. Appwrite Console

Record:

```text
Staging project name/id:
Existing API custom domains:
Web platforms/origins:
Google provider enabled?:
Google provider callback URL shown by Appwrite:
```

Do not include client secret in notes.

## C. Browser DevTools — before change

Reproduce:

1. clear Marketiv staging/Appwrite session state only if safe;
2. login main app as UMKM/Creator;
3. inspect cookie/local storage for Appwrite endpoint;
4. login Admin;
5. inspect what changed;
6. repeat in reverse order.

Record:
- cookie name;
- host/domain;
- path;
- whether host-only;
- localStorage key/origin if fallback is used;
- Network API hostname for `account.get()` / session creation.

Do not record actual session secret values.

## Decision gate

Proceed to Task 02 only if evidence supports shared session context or clearly shows that separate API origins are required.

If runtime already uses separate API hosts yet collision persists, STOP and investigate rather than blindly applying this spec.
