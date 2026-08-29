# Root Cause

## Primary diagnosis

The current architecture does not create an explicit Marketiv-owned session namespace for each frontend.

Instead, both applications delegate browser authentication to Appwrite Browser SDK.

When both applications use the same Appwrite API hostname and same Appwrite project, they can resolve/manipulate the same current Appwrite browser session context.

This explains the bidirectional symptom:

```text
User app login
    ↓
Appwrite current browser session becomes user A
    ↓
Admin reads current session
    ↓
role validation sees user A instead of Admin
```

and:

```text
Admin login
    ↓
Appwrite current browser session becomes Admin
    ↓
User app reads current session
    ↓
user-facing flow sees Admin/current session instead of the expected UMKM/Creator
```

## Why the proposed fix targets API hostname

Appwrite recommends using a custom API endpoint under the same parent domain as the web application so session cookies can be first-party.

By giving each Marketiv frontend its own Appwrite API hostname while retaining the same project ID, the intended browser boundary becomes:

```text
api-staging.marketiv.id
└── user-app Appwrite browser session

api-admin-staging.marketiv.id
└── admin-app Appwrite browser session
```

The project/data remain shared; the browser API origins differ.

## Runtime proof required

Do not treat this diagnosis as complete until Task 01 verifies in DevTools:

- actual deployed endpoint of each app;
- actual session cookie/storage origin;
- cookie Domain/HostOnly behavior;
- project ID equality.

If runtime evidence contradicts this diagnosis, stop and report the evidence before changing architecture.
