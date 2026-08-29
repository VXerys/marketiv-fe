# Architecture Detail

## Session boundary

Desired:

```text
USER AUTH CONTEXT
Frontend: staging.marketiv.id
API:      api-staging.marketiv.id
Project:  Marketiv Staging
Role:     umkm | creator

ADMIN AUTH CONTEXT
Frontend: admin-staging.marketiv.id
API:      api-admin-staging.marketiv.id
Project:  Marketiv Staging
Role:     admin
```

Project equality is intentional.

API-origin equality is NOT desired.

## Authorization boundary

Session isolation is not authorization.

Admin access must still require existing role/status checks.

The session fix must not remove:

- database role lookup;
- Appwrite Auth label/prefs fallback if current implementation relies on it;
- suspended account denial;
- fail-closed behavior;
- server-side Function authorization.

## Data boundary

No data separation is introduced.

Both API endpoints should access the same:
- Auth accounts;
- database;
- collections/tables;
- storage;
- functions;
- transaction state.

## Cross-app navigation

`NEXT_PUBLIC_ADMIN_APP_URL` and `NEXT_PUBLIC_USER_APP_URL` are navigation origins, not Appwrite endpoints.

Do not conflate:

```text
NEXT_PUBLIC_ADMIN_APP_URL
NEXT_PUBLIC_USER_APP_URL
```

with:

```text
NEXT_PUBLIC_APPWRITE_ENDPOINT
```
