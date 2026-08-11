# T01 — Stable dashboard anchors
BASE: `staging@8166a810549b3c4f0ce0c24bda1a23283e9eed00`
DEP: none

GOAL: expose stable onboarding targets on existing UMKM dashboard UI with zero visual/behavior change.

READ:
- `src/app/dashboard/umkm/page.tsx`
- component(s) directly rendered by that page
- `UmkmDashboardChrome` implementation

CHANGE: only files that own the exact target elements.

DO:
- Identify 3–5 high-value Dashboard → Campaign targets from existing UI.
- Add semantic `data-onboarding` attributes.
- Use stable names, e.g. `dashboard-overview`, `campaign-nav`, `create-campaign`.
- Reuse existing elements; do not wrap/restructure unless required.

AC:
- No visual diff intended.
- No changed navigation/business logic.
- No CSS/class/nth-child based onboarding contract.
- Anchors are unique on rendered page.

VERIFY:
- `npm run typecheck`
- targeted lint if available; otherwise `npm run lint` only if practical.

STOP:
- No tour UI/state yet.
- No dependency install.
- No unrelated refactor.

OUTPUT: changed files; verification; blockers.
