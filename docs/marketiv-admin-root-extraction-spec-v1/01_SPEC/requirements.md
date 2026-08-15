# Requirements — Standalone Admin Root Extraction

## R1 — Separate application boundary

**As the Marketiv engineering team, we want Admin to be a standalone application so user and operational control-plane deployments can evolve independently.**

1. THE repository SHALL contain a root-level `admin/` Next.js application.
2. THE main user application SHALL NOT own the Admin route tree after migration.
3. THE final user source tree SHALL NOT contain `src/app/admin`.
4. THE Admin app SHALL build independently from its own root directory.
5. THE migration SHALL preserve one repository.

## R2 — Route migration

1. WHEN the Admin app root `/` is visited, THE SYSTEM SHALL navigate/redirect to `/dashboard`.
2. THE Admin dashboard SHALL be available at `/dashboard`.
3. THE Campaign submission queue SHALL be available at `/submissions`.
4. Admin internal navigation SHALL NOT contain `/admin/*` prefixes.
5. Main user app SHALL NOT claim `/admin/*` as an internal operational UI.

## R3 — Source ownership

1. Admin-specific routes/components/features/libs SHALL move under `admin/src/`.
2. Generic dependencies needed by Admin SHALL be copied only as required for a self-contained build.
3. Admin SHALL NOT import runtime/build source from main `../src`.
4. Main user app generic/shared source SHALL NOT be moved away merely because Admin uses it.
5. No shared package/workspace SHALL be introduced in this migration unless independent build proves impossible without it.

## R4 — Visual and behavioral parity

1. Existing Admin layout and major UI states SHALL remain visually equivalent after extraction.
2. This migration SHALL NOT redesign Admin.
3. Existing known behavior bugs SHALL NOT be broadly refactored here.
4. Route-prefix changes and standalone-root changes MAY modify navigation code where required.
5. User-only root-layout features SHALL NOT appear in Admin merely through inheritance.

## R5 — Independent package/config

Admin SHALL own:

- `package.json`;
- `tsconfig.json`;
- `next.config.ts`;
- `postcss.config.mjs`;
- `src/app/layout.tsx`;
- `src/app/globals.css`;
- `.env.example`.

Dependencies SHALL be derived from actual Admin imports.

## R6 — Appwrite environment sharing

1. Staging user app and staging Admin SHALL use the same Appwrite Staging project.
2. Production user app and production Admin SHALL use the same Appwrite Production project.
3. The migration SHALL NOT create an Admin-specific database project.
4. The migration SHALL NOT duplicate business collections.
5. The migration SHALL NOT duplicate an existing Function solely because Admin runs on a different subdomain.

## R7 — Auth compatibility

1. Admin SHALL continue using the existing Appwrite Auth environment.
2. Admin identity SHALL remain based on the existing `users.role = admin` concept.
3. No public Admin registration SHALL be introduced.
4. No server/API secret SHALL be exposed in browser environment variables.
5. Security hardening beyond what is required for standalone compilation belongs to the subsequent bugfix phase.

## R8 — Cross-application destination

1. Main user app SHALL use an environment-aware Admin application origin instead of `/admin`.
2. Production and staging Admin destinations SHALL be configurable.
3. External application redirects SHALL reject malformed/untrusted arbitrary URLs if any user-controlled `next` value is involved.
4. No hardcoded production Admin domain shall be used for staging.

## R9 — Build isolation

`admin/` SHALL pass its own:

```text
lint
typecheck
build
```

Main app SHALL also pass its existing gates after old Admin sources are removed.

## R10 — Deletion safety

1. Original Admin code SHALL NOT be deleted before the extracted app builds.
2. Import/search checks SHALL prove no required source is orphaned.
3. User modifications unrelated to migration SHALL not be reset or overwritten.

## R11 — Deployment readiness

Documentation SHALL record:

```text
staging branch + root admin → admin-staging.marketiv.id
production branch + root admin → admin.marketiv.id
```

and the corresponding user-app root mappings.

## R12 — Scope isolation

The migration SHALL NOT:

- fix Rate Card;
- change Campaign business state;
- migrate Appwrite schema;
- create duplicate backend resources;
- perform unrelated folder cleanups;
- reformat the entire repository.
