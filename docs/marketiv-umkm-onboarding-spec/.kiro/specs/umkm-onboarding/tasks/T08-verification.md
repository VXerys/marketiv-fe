# T08 — Regression verification
BASE: `staging@8166a810549b3c4f0ce0c24bda1a23283e9eed00`
DEP: T07

GOAL: verify final implementation and fix only defects caused by T01–T07.

READ:
- git diff from T01–T07
- onboarding files
- directly affected UMKM dashboard/Campaign/Panduan files

CHANGE: only defects attributable to this feature.

DO:
- Review diff for unrelated changes, unstable selectors, route loops, duplicated state, unsafe DOM access.
- Run repo verification.
- Fix discovered onboarding regressions only.

AC:
- `npm run typecheck` passes.
- `npm run lint` passes or pre-existing failures are identified precisely.
- relevant tests pass.
- `npm run build` passes, or exact pre-existing/environment blocker is reported.
- manual flow: first run; next/back; skip; close; refresh; dashboard→Campaign handoff; Panduan replay; mobile.

STOP:
- No cleanup/refactor unrelated to onboarding.
- Do not hide pre-existing failures.

OUTPUT:
- changed files
- command results
- manual-flow result
- remaining blockers/risks
