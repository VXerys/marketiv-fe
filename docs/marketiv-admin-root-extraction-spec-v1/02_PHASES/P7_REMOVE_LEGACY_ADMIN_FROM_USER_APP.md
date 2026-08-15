# P7 — Remove Legacy Admin Source from User App

## Objective

Complete the separation after the new Admin app has passed P6.

## Precondition

P6 must be green.

If Admin build is not green: STOP. Do not delete old code.

## Import consumer check

Before delete, search the entire main app for imports from:

```text
@/components/admin
@/features/admin
@/lib/admin
```

Classify every hit.

If a non-Admin user surface unexpectedly imports Admin code, determine whether it is:
- stale;
- shared generic logic that should have been copied/extracted;
- a true dependency blocker.

Do not blindly delete.

## Delete legacy Admin-owned code

When safe:

```text
src/app/admin/**
src/components/admin/**
src/features/admin/**
src/lib/admin/**
```

Delete directories only if no valid root-app consumer remains.

## Keep shared generic root files

Do NOT delete:

```text
src/components/ui/*
src/lib/utils.ts
src/assets/*
generic Appwrite modules
generic types
```

merely because copies now exist in Admin.

## Main app stale route audit

Search:

```text
/admin
src/app/admin
components/admin
features/admin
lib/admin
```

Remaining `/admin` strings must be:
- deliberate historical docs,
- external Admin URL configuration,
- or explicitly justified.

There must be no runtime internal link to the deleted route tree.

## Main app verification

Run root:

```bash
npm run lint
npm run typecheck
npm run build
```

Run targeted auth/navigation tests that cover Admin destination plus existing UMKM/Creator destination.

## Exit criteria

The main user app contains no operational Admin implementation and still builds.
