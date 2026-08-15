# P6 — Verify Standalone Admin Before Deletion

## Objective

Prove the new application works before touching the legacy Admin paths.

## Install/build

From `admin/`:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

Use the package manager/lock strategy consistent with repository policy.

Do not create competing lockfiles blindly; inspect current repository package management first.

## Route smoke matrix

Verify:

| Route | Expected |
|---|---|
| `/` | redirects to `/dashboard` |
| `/dashboard` | renders Admin dashboard |
| `/submissions` | renders queue |
| unknown route | standard Next not-found behavior |

## UI parity

Compare old vs new for:

- sidebar;
- header;
- dashboard layout;
- submissions table/cards;
- review dialog;
- mobile navigation.

No redesign required.

## Import isolation

Search:

```bash
rg -n '\.\./.*src/' admin
```

Expected: no source coupling to main app.

Review alias mapping.

## Package isolation

Confirm the Admin build does not rely on root `node_modules` accidentally as the only reason it passes.

If using normal npm nested resolution during local development, ensure deployment from `admin` can install dependencies declared by `admin/package.json`.

## Behavior-debt sanity

Known bugs may still reproduce. That is acceptable for this phase.

Do not mark them fixed.

## Exit criteria

Standalone Admin can install/build/render its existing surfaces independently.

Only then proceed to P7 deletion.
