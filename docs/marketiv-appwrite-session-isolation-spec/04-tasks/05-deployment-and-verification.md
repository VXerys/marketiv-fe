# Task 05 — Deployment and Verification

## Code verification

From repository root:

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

If root test command behaves differently, use the repository's actual script semantics and report the exact command/result.

Admin:

```bash
cd admin
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Do not report PASS unless each command was actually executed successfully.

## Deployment verification

Confirm:
- Admin Site deployed from `admin/`;
- target branch `staging`;
- Admin env points at `api-admin-staging.marketiv.id/v1`;
- main env remains `api-staging.marketiv.id/v1`;
- HTTPS valid;
- no `general_unknown_origin`;
- no CORS/origin errors;
- no Appwrite session collision in required matrix.

## Google OAuth verification

If user API endpoint remains `api-staging.marketiv.id`:

- verify callback in Appwrite Console;
- verify matching Authorized Redirect URI in Google Cloud;
- **do not edit it if already correct**.

If the runtime audit proves the main API endpoint actually changed as part of this work, report this as an unexpected scope change before modifying Google OAuth.

## Completion evidence

Return:
- changed files;
- env changes (names/hosts only, no secrets);
- Appwrite/DNS steps performed;
- commands/results;
- deployed test matrix results;
- remaining risks/blockers.
