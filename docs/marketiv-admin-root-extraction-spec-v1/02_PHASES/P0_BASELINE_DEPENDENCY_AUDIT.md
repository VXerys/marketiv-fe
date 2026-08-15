# P0 — Baseline & Dependency Audit

## Objective

Produce an exact dependency map before any structural move.

## Commands / inspection

Start with:

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

Do not reset/stash/discard user changes.

Inventory:

```text
src/app/admin
src/components/admin
src/features/admin
src/lib/admin
```

Then inspect all imports reachable from those files.

## Classification

For every imported local file classify:

### MOVE
Admin-owned code.

Examples:
```text
src/components/admin/*
src/features/admin/*
src/lib/admin/*
```

### COPY
Generic frontend file used by both apps.

Examples may include:
```text
src/components/ui/*
src/lib/utils.ts
src/assets/icons/*
shared Appwrite browser helper
shared type
```

### KEEP ROOT ONLY
User-only code not needed by Admin.

### PACKAGE
npm dependency.

## Deliverable

Create a temporary migration checklist or report with:

```text
Admin-owned files:
Shared local dependencies:
npm dependencies:
assets:
route references:
env variables:
known behavior debt:
```

## Critical check

Search Admin files for:

```text
@/
../
/admin
process.env
```

Do not proceed to P1 until every local Admin dependency has an ownership decision.

## Scope

No functional code changes in P0.

## Exit criteria

The dependency closure is known well enough that `admin/` can be built without reaching back into main `src`.
