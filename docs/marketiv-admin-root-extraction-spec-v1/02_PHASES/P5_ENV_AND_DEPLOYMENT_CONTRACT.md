# P5 — Environment & Deployment Contract

## Objective

Make the extracted app deployable to the correct Appwrite Site/domain without creating new backend sources of truth.

## Admin `.env.example`

Document the public browser variables actually used by Admin.

Expected categories:

```text
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_USER_APP_URL=
```

Include any current public storage/bucket IDs only if Admin imports/use requires them.

Do not invent `NEXT_PUBLIC_APP_ENV` unless current implementation actually needs it.

Never include:

```text
APPWRITE_API_KEY
APPWRITE_SERVER_KEY
MIDTRANS_SERVER_KEY
webhook secret
```

## User app `.env.example`

Add/document:

```text
NEXT_PUBLIC_ADMIN_APP_URL=
```

if P4 uses it.

## Environment mapping

### Staging

User app:

```text
branch = staging
site root = /
domain = staging.marketiv.id
Appwrite = Staging project
```

Admin app:

```text
branch = staging
site root = admin
domain = admin-staging.marketiv.id
Appwrite = same Staging project
```

### Production

User app:

```text
branch = production
site root = /
domain = marketiv.id
Appwrite = Production project
```

Admin app:

```text
branch = production
site root = admin
domain = admin.marketiv.id
Appwrite = same Production project
```

## Appwrite Platform configuration checklist

Both Admin domains must be configured as allowed Web Platforms/origins in the corresponding Appwrite project where required by Appwrite browser SDK/Auth.

Do not solve origin errors by relaxing database permissions.

## Collections

No collection changes.

## Functions

No Function duplication.

## Acceptance

A deployment operator can configure all four frontend/domain combinations using this document without guessing which Appwrite project to use.
