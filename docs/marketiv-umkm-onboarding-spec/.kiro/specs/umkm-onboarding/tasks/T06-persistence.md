# T06 — Versioned persistence
BASE: `staging@8166a810549b3c4f0ce0c24bda1a23283e9eed00`
DEP: T04,T05

GOAL: persist onboarding completion/skip/resume with minimal infrastructure.

READ:
- onboarding module
- repository utilities for browser storage/user preferences, if any

CHANGE: onboarding persistence layer only.

DO:
- First inspect whether repo already has a suitable preference/storage abstraction.
- Reuse it if appropriate; otherwise use guarded `localStorage` for MVP.
- Store namespaced version + status + resumable phase only.
- Handle malformed/old storage safely.
- Version bump must allow a future onboarding revision.

AC:
- SSR/hydration safe.
- No Appwrite collection/schema migration unless an existing preference model clearly supports this with no schema change.
- Storage failure cannot break dashboard.

VERIFY:
- `npm run typecheck`
- manual refresh, completed, skipped, malformed-storage cases.

STOP:
- No analytics tracking.
- No backend migration.

OUTPUT: changed files; verification; blockers.
