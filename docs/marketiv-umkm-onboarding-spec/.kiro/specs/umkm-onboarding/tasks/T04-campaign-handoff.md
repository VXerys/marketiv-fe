# T04 — Campaign route handoff
BASE: `staging@8166a810549b3c4f0ce0c24bda1a23283e9eed00`
DEP: T03

GOAL: safely continue onboarding from dashboard into the existing first Campaign creation route.

READ:
- T03 config/state
- existing UMKM Campaign navigation/create routes and their direct components

CHANGE: only onboarding state/config plus exact Campaign target owner(s).

DO:
- Confirm actual create-Campaign route from repo; do not guess path.
- Add stable Campaign anchor(s) only where needed.
- Save onboarding phase before navigation.
- Resume after destination target renders.
- If route/target unavailable, exit tour safely and preserve normal page.

AC:
- Uses existing Campaign flow; no duplicate form/navigation.
- Refresh during handoff cannot create redirect loop.
- Campaign and Rate Card remain separate.

VERIFY:
- `npm run typecheck`
- manual: dashboard → campaign destination → resume → skip/close.

STOP:
- Do not modify Campaign business rules/API/payment.
- No Rate Card onboarding.

OUTPUT: changed files; verification; blockers.
