# Verification Plan

## Layer 1 — Static/code

- search for hard-coded endpoint leakage;
- verify root/admin clients read their own deployment env;
- review git diff;
- confirm no server secrets added.

## Layer 2 — Unit

Run existing auth tests.

Admin auth test coverage must include:
- anonymous fail-closed;
- UMKM/Creator denied;
- suspended Admin denied;
- active Admin allowed;
- invalid sign-in safe;
- logout current session.

## Layer 3 — Type/lint/build

Main:
```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Admin:
```bash
cd admin
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

## Layer 4 — Runtime API

Validate:
- main network host = `api-staging.marketiv.id`;
- Admin network host = `api-admin-staging.marketiv.id`;
- project header/id is intended staging project;
- no origin/CORS failure.

## Layer 5 — Browser session

Inspect:
- cookie host/domain;
- localStorage fallback origin if present;
- session persistence;
- logout isolation.

Never copy session token values into the report.

## Layer 6 — Product behavior

Execute all scenarios in `05-acceptance/test-matrix.md`.

## Required evidence table

| Check | Result | Evidence |
|---|---|---|
| Main endpoint | PASS/FAIL | |
| Admin endpoint | PASS/FAIL | |
| Same staging project | PASS/FAIL | |
| Main -> Admin simultaneous login | PASS/FAIL | |
| Admin -> Main simultaneous login | PASS/FAIL | |
| Main logout isolation | PASS/FAIL | |
| Admin logout isolation | PASS/FAIL | |
| Non-admin rejection | PASS/FAIL | |
| Google OAuth unchanged/verified | PASS/FAIL/N/A | |
| Main build | PASS/FAIL | |
| Admin build | PASS/FAIL | |
