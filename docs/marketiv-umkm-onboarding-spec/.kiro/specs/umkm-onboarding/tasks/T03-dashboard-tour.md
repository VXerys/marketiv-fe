# T03 — Dashboard first-run tour
BASE: `staging@8166a810549b3c4f0ce0c24bda1a23283e9eed00`
DEP: T02

GOAL: configure and run the first UMKM dashboard onboarding sequence.

READ:
- T01 anchors
- T02 onboarding module
- `src/app/dashboard/umkm/page.tsx`

CHANGE: onboarding config + minimal dashboard integration.

DO:
- Create concise Dashboard → Campaign steps using existing anchors.
- Start only when user is eligible and no in-session completion/skip exists.
- Keep normal dashboard usable after skip/close.
- Final dashboard step should prepare Campaign handoff, not implement cross-route logic here.

AC:
- No auto-start loop on rerender.
- Refresh/navigation does not create duplicate overlays in same session.
- Copy is short Indonesian and explains actions, not marketing copy.

VERIFY:
- `npm run typecheck`
- manually validate next/back/skip/close and missing-anchor behavior.

STOP:
- No Rate Card tutorial.
- No Appwrite schema changes.

OUTPUT: changed files; verification; blockers.
