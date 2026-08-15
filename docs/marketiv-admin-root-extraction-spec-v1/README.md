# Marketiv Admin Root Extraction — Spec-Driven Pack v1

**Repository:** `marketiv-id/marketiv-web`  
**Target branch:** `staging`  
**Task type:** structural migration / application extraction  
**Primary goal:** move the current Admin dashboard out of the main user app and make it a standalone Next.js app at repository root `admin/`.

## Final target

```text
marketiv-web/
├── src/                     # existing Marketiv user app
├── public/
├── package.json
├── next.config.ts
├── admin/                   # standalone Marketiv Admin Next.js app
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── assets/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── postcss.config.mjs
└── 00_BACKEND/              # shared backend / Appwrite Functions
```

The Admin application SHALL NOT remain under `src/app/admin` in the user application.

## Why this migration exists

The current staging repository still places Admin routing under:

- `src/app/admin`
- `src/components/admin`
- `src/features/admin`
- `src/lib/admin`

The approved architecture is different: Marketiv Admin is a **separate frontend/deployment target** in `admin/`, while still sharing the same Appwrite project, collections, Auth system, and Functions for the same environment.

## Important: this is NOT the bugfix phase

This pack intentionally runs before the Campaign bugfix pack.

Do not mix the migration with the pending Admin/Campaign behavior fixes unless a change is strictly required to make the standalone app compile/run.

Known issues such as:
- Admin auth fallback behavior,
- Admin route authorization hardening,
- false-success submission review,
- fabricated dashboard metrics,

must be preserved as known follow-up defects unless this structural extraction would otherwise be impossible.

The objective here is **safe separation with behavior parity**, not broad cleanup.

## Migration principles

1. **Copy/establish first, verify second, delete old paths last.**
2. Preserve current Admin UI and behavior as much as possible.
3. Admin app must build from `admin/` independently.
4. Admin app must not import source files from `../src`.
5. Do not duplicate backend collections or business Functions.
6. User app and Admin app use the same Appwrite project for the same environment.
7. No monorepo/workspace refactor unless it becomes provably necessary.
8. No Rate Card or Campaign behavior changes.
9. No new package unless required by actual Admin dependency closure.
10. No secret/server key may be exposed in `NEXT_PUBLIC_*`.

## Route migration

### Before

```text
User app:
  /admin
  /admin/dashboard
  /admin/submissions
```

### After

```text
Admin app:
  /
  /dashboard
  /submissions
```

Recommended:

```text
/ → redirect("/dashboard")
```

The user app must no longer own `/admin/*`.

## Deployment mapping

### Staging

```text
staging.marketiv.id
  branch: staging
  root directory: repository root

admin-staging.marketiv.id
  branch: staging
  root directory: admin
```

### Production

```text
marketiv.id
  branch: production
  root directory: repository root

admin.marketiv.id
  branch: production
  root directory: admin
```

## Token-efficient Codex execution

Execute one phase at a time.

For each phase provide only:

1. this `README.md`
2. `00_SOT/SOURCE_PRECEDENCE.md`
3. the requested file from `02_PHASES/`

Codex should then inspect only files named by that phase and their direct imports.

## Recommended order

| Phase | Purpose |
|---|---|
| P0 | baseline + dependency inventory |
| P1 | bootstrap standalone `admin/` app |
| P2 | migrate Admin routes and Admin-owned source |
| P3 | close shared frontend dependency closure |
| P4 | normalize routes and cross-app navigation |
| P5 | environment/deployment contract |
| P6 | verify standalone Admin app |
| P7 | remove legacy Admin code from user app |
| P8 | final regression + handoff to bugfix pack |

## Completion status

This migration is complete only when:

- root user app builds without `src/app/admin`;
- `admin/` builds independently;
- Admin internal routes work without `/admin` prefix;
- no `admin/**` import reaches into `../src`;
- no backend collection/Function duplication was introduced;
- deployment/env mapping is documented;
- existing Admin behavior issues are recorded for the next bugfix phase.
