# Goals and Non-Goals

## Goals

### G1 — Independent session contexts

Allow simultaneous login:

```text
staging.marketiv.id        => UMKM/Creator
admin-staging.marketiv.id  => Admin
```

in one browser profile.

### G2 — Same Appwrite staging project

Keep both apps connected to:
- the same staging Appwrite project;
- the same database;
- the same Auth users;
- the same Functions;
- the same Storage resources.

### G3 — Keep existing main API hostname

Preferred user-app endpoint:

```text
https://api-staging.marketiv.id/v1
```

Do not rename it as part of this task.

### G4 — Add isolated Admin API hostname

Admin target endpoint:

```text
https://api-admin-staging.marketiv.id/v1
```

### G5 — Preserve Google OAuth

If the main app still uses `api-staging.marketiv.id`, preserve its Google OAuth callback configuration.

Verify it; do not rewrite it unnecessarily.

## Non-goals

- production migration;
- production custom domains;
- new Appwrite project;
- database migration;
- user migration;
- OAuth implementation for Admin;
- redesign login UI;
- SSO between Admin and user app;
- replacing Appwrite auth;
- changing authorization policy;
- moving Admin into the root Next.js app;
- broad SSR auth migration;
- Campaign/Rate Card/payment refactors.
