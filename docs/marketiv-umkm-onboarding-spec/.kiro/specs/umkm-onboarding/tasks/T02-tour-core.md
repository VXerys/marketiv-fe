# T02 — Driver.js onboarding core

BASE: staging@8166a810549b3c4f0ce0c24bda1a23283e9eed00
DEP: T01

GOAL:
Integrate Driver.js as the reusable tour engine for UMKM onboarding.

READ:
- package.json
- T01 changed files
- UmkmDashboardChrome
- existing shared UI/style utilities

DO:
- Install `driver.js`.
- Create minimal UMKM onboarding module.
- Create typed Marketiv step config.
- Map steps to stable `data-onboarding` anchors from T01.
- Create thin Driver.js adapter/config.
- Apply Marketiv styling through Driver.js configuration/CSS.
- Handle missing anchors safely.
- Keep DOM access client-side.

AC:
- Driver.js is the tour rendering/positioning engine.
- No custom tooltip/overlay engine.
- Business onboarding state stays separate from Driver.js.
- No first-run auto-start yet.
- No persistence yet.
- No Campaign route handoff yet.
- No business/data changes.

VERIFY:
- npm run typecheck
- relevant lint
- verify dependency appears in package.json/lockfile

STOP:
Do not continue to T03.

OUTPUT:
changed files; verification; blockers.