# Audit Findings

## Finding 1 — The apps are separate, but auth backend context is shared

`staging.marketiv.id` and `admin-staging.marketiv.id` are separate Next.js apps.

However both use Appwrite Browser SDK `Account` against environment-defined Appwrite endpoint/project values.

## Finding 2 — Both rely on Appwrite's browser session state

Both use `createEmailPasswordSession()` and `account.get()`.

Both logout paths remove the Appwrite `"current"` session.

Therefore, if both browser apps reach the same Appwrite API origin/project session context, the applications are not independently namespaced at the Marketiv code layer.

## Finding 3 — Admin authorization is not the root problem

`resolveAdminSession()` correctly checks whether the authenticated Appwrite account is an active Admin.

That role check should remain.

The problem is that the session context arriving at Admin can be the wrong application's current browser session.

## Finding 4 — Parent domain alone is not sufficient diagnosis

The issue is not simply:

```text
staging.marketiv.id + admin-staging.marketiv.id
=> same parent .marketiv.id
=> automatically same cookie
```

Subdomains do not automatically share host-only cookies.

The relevant boundary is the Appwrite API/session origin and actual cookie/storage behavior in the browser.

## Finding 5 — Google OAuth exists only in main auth flow

Main application supports Google OAuth.

Current Admin auth implementation is email/password-based and has no requirement to add Google OAuth in this task.
