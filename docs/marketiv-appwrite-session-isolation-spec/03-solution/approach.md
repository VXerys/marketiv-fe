# Recommended Approach

## Target architecture

Keep the Appwrite staging project shared, isolate only browser-facing API origins.

```text
┌──────────────────────────────┐
│       Browser Profile        │
└──────────────┬───────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
staging.marketiv.id   admin-staging.marketiv.id
     │                   │
     ▼                   ▼
api-staging.          api-admin-staging.
marketiv.id/v1        marketiv.id/v1
     │                   │
     └─────────┬─────────┘
               ▼
       SAME Appwrite
       Staging Project
               │
      ┌────────┼─────────┐
      ▼        ▼         ▼
     Auth   Database  Functions
```

## Environment target

### User Site

```dotenv
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://api-staging.marketiv.id/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<SAME_STAGING_PROJECT_ID>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=<SAME_STAGING_DATABASE_ID>
```

### Admin Site

```dotenv
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://api-admin-staging.marketiv.id/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<SAME_STAGING_PROJECT_ID>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=<SAME_STAGING_DATABASE_ID>
NEXT_PUBLIC_USER_APP_URL=https://staging.marketiv.id
```

Do not put literal project/database IDs into source code if deployment already supplies them via env.

## Expected code impact

The repository is already environment-driven.

Therefore the primary fix may require **little or no production code change** beyond:

- documentation/env examples where useful;
- tests/hardening needed to prevent regressions;
- any discovered hard-coded endpoint that violates the environment boundary.

Do not manufacture code changes just to produce a commit.
