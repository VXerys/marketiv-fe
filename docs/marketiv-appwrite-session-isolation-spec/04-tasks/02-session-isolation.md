# Task 02 — Session Isolation

## Objective

Give Admin its own Appwrite API hostname while preserving the same staging Appwrite project.

## Part A — Manual Appwrite/DNS operation

In the SAME staging Appwrite project:

1. Keep existing:
   ```text
   api-staging.marketiv.id
   ```

2. Add:
   ```text
   api-admin-staging.marketiv.id
   ```

3. Use exact DNS records Appwrite Console provides.

4. Verify custom domain.

5. Generate/confirm TLS certificate.

6. Verify API is reachable over HTTPS.

Do not change the user-app custom domain.

## Part B — Deployment environment

### Admin staging Site

Set:

```dotenv
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://api-admin-staging.marketiv.id/v1
```

Keep:

```dotenv
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<existing staging project>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=<existing staging database>
NEXT_PUBLIC_USER_APP_URL=https://staging.marketiv.id
```

### User staging Site

Keep:

```dotenv
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://api-staging.marketiv.id/v1
```

Do not alter if already correct.

## Part C — Repository changes

Inspect for hard-coded endpoint assumptions.

Change code only if current implementation prevents independent env configuration.

Preferred result:
- root continues to consume root deployment env;
- `admin/` continues to consume Admin deployment env;
- no endpoint constants duplicated in business logic.

Update `.env.example` comments only if they materially improve correct deployment and do not embed secrets.

## Part D — Deploy

Redeploy Admin staging after env changes.

Main staging redeploy is required only if its environment/code changed.

## Acceptance

Network requests after deploy:

```text
staging.marketiv.id
  -> https://api-staging.marketiv.id/v1/...

admin-staging.marketiv.id
  -> https://api-admin-staging.marketiv.id/v1/...
```

Both must still use the same staging project ID.
