# T07 — Hardening and accessibility
BASE: `staging@8166a810549b3c4f0ce0c24bda1a23283e9eed00`
DEP: T06

GOAL: harden onboarding without expanding product scope.

READ:
- all onboarding files
- directly targeted dashboard/Campaign components

CHANGE: onboarding files; target files only if required for accessibility.

DO:
- Verify keyboard navigation and ESC close/skip behavior.
- Add correct dialog/popover semantics and usable focus behavior.
- Prevent overlay from trapping users when target disappears.
- Handle mobile viewport, resize, scroll, route latency, duplicate anchors.
- Respect reduced-motion if animation exists.

AC:
- Normal UMKM navigation remains usable.
- No inaccessible keyboard dead-end.
- No uncaught error for missing/unmounted targets.
- No broad CSS/layout rewrite.

VERIFY:
- `npm run typecheck`
- `npm run lint`
- targeted/manual desktop + mobile checks.

STOP:
- No new features/copy expansion.

OUTPUT: changed files; verification; blockers.
