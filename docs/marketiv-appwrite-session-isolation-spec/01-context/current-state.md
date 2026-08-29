# Current State — Verified from `staging`

## Repository topology

Marketiv is one repository with two separate Next.js applications:

```text
marketiv-web/
├── src/        # user-facing app
├── admin/      # standalone admin app
└── 00_BACKEND/ # backend/config material
```

The admin application is not a `/admin` route inside the main app.

## Main application auth

The main application creates an Appwrite browser `Client` using:

```ts
NEXT_PUBLIC_APPWRITE_ENDPOINT
NEXT_PUBLIC_APPWRITE_PROJECT_ID
```

Relevant files:

- `src/lib/appwrite/client.ts`
- `src/lib/appwrite/config.ts`
- `src/lib/appwrite/account.ts`

Main email/password login uses Appwrite Account:

```ts
account.createEmailPasswordSession(...)
```

Current session resolution uses:

```ts
account.get()
```

Logout removes the current Appwrite session:

```ts
account.deleteSession({ sessionId: "current" })
```

Relevant files:

- `src/services/auth/auth.service.ts`
- `src/services/auth/session.service.ts`

## Main Google OAuth

Current code contains Google OAuth support using:

```ts
account.createOAuth2Session({
  provider: OAuthProvider.Google,
  success,
  failure,
})
```

The success/failure URL is built from the runtime frontend origin and `AUTH_CONFIG`.

Current `AUTH_CONFIG`:

- `oauthSuccessPath = "/auth/callback"`
- `oauthFailurePath = "/login?error=oauth"`
- provider visibility controlled by `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH`

Important distinction:

- the `success`/`failure` URLs are Marketiv frontend return URLs;
- the Google **Authorized Redirect URI** is the Appwrite provider callback URL shown by Appwrite Console.

## Admin auth

Admin also creates an Appwrite browser `Client` from:

```ts
NEXT_PUBLIC_APPWRITE_ENDPOINT
NEXT_PUBLIC_APPWRITE_PROJECT_ID
NEXT_PUBLIC_APPWRITE_DATABASE_ID
```

Relevant files:

- `admin/src/lib/admin/appwrite.ts`
- `admin/src/lib/admin/auth.ts`

Admin email/password login:

```ts
account.createEmailPasswordSession(...)
```

It then calls `resolveAdminSession()` and enforces Admin role/status.

If a newly-created session is not an active Admin, current code attempts:

```ts
account.deleteSession("current")
```

Admin logout also deletes `"current"`.

## Environment intent already present in repo

`admin/.env.example` explicitly says the admin backend configuration is shared with the user application, which means the project/database are intentionally the same.

This spec changes only the **API hostname used by the browser**, not the backend project/data ownership.
