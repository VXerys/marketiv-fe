# Command Checklist

Adapt package manager if the repository uses something other than npm.

## Preflight

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

## Dependency audit

Examples:

```bash
rg -n '^import ' src/app/admin src/components/admin src/features/admin src/lib/admin
rg -n '@/|/admin|process\.env' src/app/admin src/components/admin src/features/admin src/lib/admin
```

## Admin verification

```bash
cd admin
npm install
npm run lint
npm run typecheck
npm run build
```

## Isolation

From repository root:

```bash
rg -n '\.\./.*src/' admin
rg -n '"/admin|'\''/admin' admin/src
```

After route normalization, the second command should return no active internal Admin route references except an explicitly documented reason.

## Legacy consumer audit

```bash
rg -n '@/components/admin|@/features/admin|@/lib/admin' src
```

## Root app after cleanup

```bash
npm run lint
npm run typecheck
npm run build
```

## Git diff

```bash
git status --short
git diff --stat
```

Review that the diff is limited to:
- new `admin/`;
- Admin route destination config;
- removal of old Admin-specific source;
- required env/docs/config changes.

No broad unrelated formatting.
