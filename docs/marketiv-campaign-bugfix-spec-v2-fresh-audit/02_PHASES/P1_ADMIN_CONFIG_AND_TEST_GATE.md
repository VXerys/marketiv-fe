# P1 — Admin Config Fail-Closed + Standalone Test Gate

## Inspect
```text
admin/package.json
admin/package-lock.json
admin/.env.example
admin/src/lib/admin/appwrite.ts
src/lib/constants/routes.ts
.env.example
admin/src/features/admin/submissions/__tests__/*
```

## Implement
- Remove hardcoded runtime staging project/database fallback from Admin Appwrite config.
- Validate required public env.
- No server/API secret.
- Main user app Admin origin must not silently select staging on production misconfig.
- Keep `.env.example` documentation-only.
- Add self-contained Admin `test` script + Vitest dependency/config/alias if needed.
- Update lockfile.

Existing unsafe submission test:
- do not treat it as real integration evidence;
- either temporarily isolate/skip with precise P4 TODO or make only minimal harness adjustment;
- full rewrite happens P4.

## Verify
```bash
cd admin
npm test -- --run
npm run lint
npm run typecheck
npm run build
```

STOP.
