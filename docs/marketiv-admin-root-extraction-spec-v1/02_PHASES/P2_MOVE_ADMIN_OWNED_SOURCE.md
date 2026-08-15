# P2 — Migrate Admin-Owned Source

## Objective

Relocate Admin-owned source into the standalone application without deleting old source yet.

## Source → Target

```text
src/app/admin/dashboard/**
→ admin/src/app/dashboard/**

src/app/admin/submissions/**
→ admin/src/app/submissions/**

src/app/admin/loading.tsx
→ admin/src/app/loading.tsx

src/components/admin/**
→ admin/src/components/admin/**

src/features/admin/**
→ admin/src/features/admin/**

src/lib/admin/**
→ admin/src/lib/admin/**
```

Do NOT copy old `src/app/admin/layout.tsx` blindly as the global root layout.

Its shell behavior should be integrated beneath the standalone Admin root layout.

Old `src/app/admin/page.tsx` semantics become:

```text
admin/src/app/page.tsx
→ redirect("/dashboard")
```

## Preserve behavior

Do not rewrite:
- submission business behavior;
- metric logic;
- auth fallback logic;
- Campaign state handling.

Only adapt:
- imports;
- route prefixes;
- standalone-app boundaries.

## Duplicate period

At this phase both old and new Admin code may temporarily coexist.

That is intentional.

Do not delete originals until P6 passes.

## Import rule

Moved files may temporarily have unresolved `@/*` imports at the end of P2, but P3 must close all of them.

Do not solve unresolved imports using `../../../../src`.

## Exit criteria

All Admin-owned source has a corresponding target location in `admin/src`.
