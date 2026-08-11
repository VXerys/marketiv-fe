# T05 — Panduan replay
BASE: `staging@8166a810549b3c4f0ce0c24bda1a23283e9eed00`
DEP: T03

GOAL: let UMKM users replay onboarding from the existing Panduan surface.

READ:
- `src/app/dashboard/umkm/panduan/page.tsx` or actual route owner
- onboarding public API from T03
- existing Panduan UI patterns

CHANGE: Panduan page + minimal onboarding API if required.

DO:
- Add/reuse a clear action to replay Dashboard onboarding.
- Replay resets runtime position but must not corrupt persisted version/status.
- Navigate to correct start route using existing router pattern.

AC:
- No new Help Center route.
- Existing Panduan content/behavior preserved.
- Replaying works after completed/skipped state.

VERIFY:
- `npm run typecheck`
- manual replay from Panduan.

STOP:
- No documentation redesign.
- No new tutorial domains.

OUTPUT: changed files; verification; blockers.
