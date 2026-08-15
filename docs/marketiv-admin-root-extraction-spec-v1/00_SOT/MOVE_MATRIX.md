# Move / Copy Matrix

This matrix is a starting point. Codex must calculate the real direct-import closure before editing.

## Move: Admin-owned code

| Current | Target |
|---|---|
| `src/app/admin/**` | `admin/src/app/**` with route prefix removed |
| `src/components/admin/**` | `admin/src/components/admin/**` |
| `src/features/admin/**` | `admin/src/features/admin/**` |
| `src/lib/admin/**` | `admin/src/lib/admin/**` |

## Copy initially: exact shared dependency closure

Only copy files actually imported by Admin.

Likely categories:

```text
src/components/ui/<used primitives>
src/lib/utils.ts
src/assets/icons/<logo dependency>
selected Appwrite browser helpers
selected shared types required by Admin
selected formatter/schema utility dependencies
```

Target examples:

```text
admin/src/components/ui/*
admin/src/lib/utils.ts
admin/src/assets/icons/*
admin/src/lib/appwrite/*
admin/src/types/*
```

## Do NOT move out of user app

Generic UI, assets, or utility files still used by the user app stay in root `src/`.

If Admin needs them during this extraction, COPY the minimal dependency into Admin.

This is deliberate for application independence.

Do not create a shared package/workspace in this migration.

## Do not copy user-only app chrome

Do not migrate merely because it exists in `src/app/layout.tsx`:

- Beta tester modal
- user chatbot FAB
- UMKM/Kreator dashboard providers
- user onboarding components
- public landing components

## Delete only after verification

Do not delete old Admin-owned paths until:

- standalone Admin typecheck passes;
- standalone Admin build passes;
- route smoke tests pass;
- import audit shows no Admin file depends on main `src`.

Then remove:

```text
src/app/admin/**
src/components/admin/**
src/features/admin/**
src/lib/admin/**
```

only if no user-app code still legitimately imports them.
