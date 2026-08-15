# Master Task List

## P0 — Baseline and dependency audit

- [ ] Record current branch/HEAD/status.
- [ ] Inventory all Admin-owned directories.
- [ ] Inventory all files below Admin route tree.
- [ ] Build direct import graph from Admin-owned code.
- [ ] Classify dependency as move / copy / keep / external package.
- [ ] Record known Admin behavior debt.
- [ ] Do not modify behavior.

## P1 — Bootstrap `admin/`

- [ ] Create standalone Next.js app config manually using current root versions.
- [ ] Add minimal package scripts.
- [ ] Add Admin-local TypeScript alias.
- [ ] Add PostCSS/Tailwind config.
- [ ] Add standalone Admin root layout.
- [ ] Copy global CSS baseline.
- [ ] Create `.env.example` containing only public browser config.

## P2 — Migrate Admin-owned source

- [ ] `src/app/admin/** → admin/src/app/**`
- [ ] remove `/admin` route segment in target.
- [ ] `src/components/admin/** → admin/src/components/admin/**`
- [ ] `src/features/admin/** → admin/src/features/admin/**`
- [ ] `src/lib/admin/** → admin/src/lib/admin/**`
- [ ] Do not delete source originals yet.

## P3 — Close dependency closure

- [ ] Resolve every Admin `@/*` import locally.
- [ ] Copy exact generic UI primitives.
- [ ] Copy exact utility files.
- [ ] Copy exact asset chain.
- [ ] Copy/create Admin-local Appwrite client modules required by current code.
- [ ] Copy only required types.
- [ ] Install only required packages.
- [ ] Verify no `../src` dependency.

## P4 — Routes and cross-app destination

- [ ] Admin `/ → /dashboard`.
- [ ] internal route `/dashboard`.
- [ ] internal route `/submissions`.
- [ ] update Admin sidebar pathname logic.
- [ ] remove `/admin` prefix references from Admin app.
- [ ] add main-app Admin origin config.
- [ ] update Admin role destination away from local `/admin`.
- [ ] preserve UMKM/Creator routes.

## P5 — Environment/deployment contract

- [ ] Add `admin/.env.example`.
- [ ] document Staging Appwrite sharing.
- [ ] document Production Appwrite sharing.
- [ ] document Admin Site root directory = `admin`.
- [ ] document required Appwrite Web Platform origins.
- [ ] no server secret.

## P6 — Standalone Admin verification

- [ ] install dependencies in `admin/`.
- [ ] Admin lint.
- [ ] Admin typecheck.
- [ ] Admin build.
- [ ] smoke `/`, `/dashboard`, `/submissions`.
- [ ] visual parity check.
- [ ] no unresolved imports.

## P7 — Remove legacy Admin from user app

- [ ] Verify old code has no legitimate external import consumers.
- [ ] delete old Admin-specific routes/components/features/libs.
- [ ] search stale imports.
- [ ] search stale `/admin` internal links.
- [ ] root main app lint/typecheck/build.
- [ ] verify regular UMKM/Creator routes unaffected.

## P8 — Handoff

- [ ] document changed files.
- [ ] document deployment configuration required.
- [ ] label known behavior defects as unresolved.
- [ ] mark migration complete.
- [ ] hand control to Campaign/Admin bugfix pack.
