# P3 — Close Standalone Dependency Closure

## Objective

Make every Admin-local import resolve without importing main-app source.

## Process

For each unresolved local import from `admin/src`:

1. inspect the source file;
2. copy only the required dependency;
3. recursively inspect its imports;
4. stop when the closure contains only Admin-local files or npm packages.

## Expected shared dependency categories

### UI primitives

Current Admin uses generic `@/components/ui/*`.

Copy only the exact files referenced by Admin.

Do not copy the full UI library by default.

### Utilities

Likely:

```text
src/lib/utils.ts
```

Copy to:

```text
admin/src/lib/utils.ts
```

### Logo/assets

Known current chain:

```text
AdminSidebar
→ MarketivLogo
→ assets/icons
→ logo-marketiv.png
```

Copy exact required asset and module(s).

If an asset barrel imports unused SVG/PNG files, either:
- copy its full required barrel dependency safely, or
- make the Admin asset module narrower.

Do not weaken TypeScript globally with broad `any` declarations.

### Appwrite browser client/config

If Admin-specific code currently relies on `src/lib/admin/appwrite.ts`, move it.

If it depends on other root browser Appwrite helpers, create/copy an Admin-local equivalent.

Maintain matching:
- endpoint;
- project ID;
- database ID;
- Function IDs used by Admin.

No server key.

### Types

If Admin uses generic domain types from root, copy the minimum canonical type definition required.

Avoid moving user-domain files out of root.

## npm dependency audit

Derive `admin/package.json` dependencies from imports.

Do not copy the entire root dependency list.

## Strict isolation checks

Run:

```bash
rg -n 'from ["'\'']\.\./.*src|from ["'\'']@/' admin/src
```

The second search is fine only if `@/*` resolves locally.

Also inspect Admin tsconfig resolution.

No import may target repository root `src`.

## Verification

```bash
cd admin
npm run typecheck
```

Fix dependency errors only.

Do not begin behavioral bugfixes.

## Exit criteria

TypeScript dependency graph is fully self-contained under `admin/`.
