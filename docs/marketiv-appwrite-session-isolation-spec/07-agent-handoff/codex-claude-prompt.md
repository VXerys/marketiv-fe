# Ready-to-Use Prompt for Codex / Claude Code

You are implementing a narrowly-scoped authentication isolation fix for Marketiv.

## Repository and branch

Repository:
`marketiv-id/marketiv-web`

Target:
`staging`

The repository contains two separate Next.js apps:
- root app => `staging.marketiv.id`
- `admin/` => `admin-staging.marketiv.id`

Read this entire spec directory before changing code.

## Objective

Allow a single browser profile to remain logged into:

1. `staging.marketiv.id` as UMKM/Creator; and
2. `admin-staging.marketiv.id` as Admin

at the same time, without either app overwriting or deleting the other's Appwrite browser session.

## Approved architecture

Keep the SAME Appwrite staging project/database.

Use separate Appwrite API custom hostnames:

```text
Main:
https://api-staging.marketiv.id/v1

Admin:
https://api-admin-staging.marketiv.id/v1
```

Do NOT create a new Appwrite project.

Do NOT migrate users/data.

Do NOT migrate to another auth provider.

Do NOT perform an SSR auth rewrite.

Do NOT change production.

## Source of truth

Inspect current `staging` code, especially:

Main:
- `.env.example`
- `src/config/auth.config.ts`
- `src/lib/appwrite/client.ts`
- `src/lib/appwrite/config.ts`
- `src/lib/appwrite/account.ts`
- `src/services/auth/auth.service.ts`
- `src/services/auth/session.service.ts`

Admin:
- `admin/.env.example`
- `admin/src/lib/admin/appwrite.ts`
- `admin/src/lib/admin/auth.ts`
- `admin/src/lib/admin/auth.test.ts`

Current implementation uses Appwrite Browser SDK.

Admin authorization must remain fail-closed.

## Google OAuth constraint

The main app has Google OAuth support.

If the main Appwrite endpoint remains:

```text
https://api-staging.marketiv.id/v1
```

do NOT modify Google OAuth redirect/callback configuration merely because Admin gets `api-admin-staging.marketiv.id`.

Verify the Appwrite-provided Google callback URL and Google Cloud Authorized Redirect URI. Only change if runtime evidence shows the main endpoint actually changed and explicitly report that scope change first.

Admin Google OAuth is out of scope.

## Execution order

Execute:

1. `04-tasks/00-preflight.md`
2. `04-tasks/01-runtime-confirmation.md`
3. `04-tasks/02-session-isolation.md`
4. `04-tasks/03-auth-hardening.md`
5. `04-tasks/04-regression-tests.md`
6. `04-tasks/05-deployment-and-verification.md`

For Appwrite Console/DNS/Site environment steps you cannot perform from the local repository:
- do not guess;
- output exact manual instructions and wait/mark as BLOCKED;
- continue only with code work that is safe without pretending infrastructure is complete.

## Important implementation rule

The repository is already env-driven. It is acceptable for the correct implementation to require mostly deployment/Appwrite configuration and only small code/test/doc changes.

Do not manufacture a large refactor.

Before modifying a file:
- trace its role/dependencies;
- explain why it must change.

## Stop conditions

Stop and report if:
- Appwrite does not allow the second API custom domain on the same project;
- runtime already uses separate API hosts yet sessions still collide;
- cookie scope remains shared across `.marketiv.id` and collision persists;
- fix requires production changes;
- fix requires a broader auth migration.

Do not silently choose another architecture.

## Verification

Run actual repository commands.

Main:
```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Admin:
```bash
cd admin
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Then execute the deployed browser test matrix in:
`05-acceptance/test-matrix.md`

## Required final response

Use:
`07-agent-handoff/completion-report-template.md`

Do not claim deployment/manual checks as completed unless you actually performed or were given evidence of them.
