# Environment Contract

This file documents categories, not real credentials.

## User App

```dotenv
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=

# Cross-app destination
NEXT_PUBLIC_ADMIN_APP_URL=
```

Retain other existing user-app variables separately.

## Admin App

```dotenv
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=

# Optional navigation back to public/user application
NEXT_PUBLIC_USER_APP_URL=
```

Add only the public storage IDs actually required by extracted Admin imports.

## Staging values conceptually

```text
User origin:
https://staging.marketiv.id

Admin origin:
https://admin-staging.marketiv.id

Both Appwrite IDs:
STAGING project/database
```

## Production values conceptually

```text
User origin:
https://marketiv.id

Admin origin:
https://admin.marketiv.id

Both Appwrite IDs:
PRODUCTION project/database
```

## Forbidden browser variables

Never place:

```text
APPWRITE_API_KEY
APPWRITE_SERVER_KEY
MIDTRANS_SERVER_KEY
SENTRY_AUTH_TOKEN
any webhook secret
```

behind `NEXT_PUBLIC_*`.
