# Problem Statement

## Observed symptom

Current staging behavior:

1. User logs into `admin-staging.marketiv.id`.
2. User then cannot remain/use login normally on `staging.marketiv.id`.

And conversely:

1. User logs into `staging.marketiv.id`.
2. User then cannot remain/use login normally on `admin-staging.marketiv.id`.

The expected product behavior is different because the two applications serve distinct roles and are deployed as separate Next.js applications.

## Product requirement

The browser must support independent simultaneous authentication contexts:

```text
Browser profile
├── staging.marketiv.id
│   └── UMKM / Creator session
└── admin-staging.marketiv.id
    └── Admin session
```

A user should not need:
- different browsers;
- private/incognito mode;
- manual cookie clearing;
- logout-login switching between applications.

Those are workarounds, not acceptable product behavior.

## Impact

The conflict makes operational admin work unreliable because an Admin may need to monitor/review Marketiv while the user-facing staging application is also open for testing or validation.

The fix must preserve:
- one Appwrite staging backend;
- one identity/user store;
- current role authorization rules;
- current business data and functions.
