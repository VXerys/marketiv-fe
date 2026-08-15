# Known Debt — Do Not Accidentally Close During Extraction

These findings are intentionally separated from this structural migration.

## 1. Admin auth helper fallback

Current Admin auth helper may return a synthetic Admin session when session/data read throws.

Structural migration should move/preserve the current behavior unless a compile/runtime extraction blocker requires a minimal adaptation.

Security fix belongs to subsequent bugfix work.

## 2. Admin route authorization

Standalone architecture does not itself prove route authorization is correct.

The Admin app still needs the follow-up hardening described by the Admin bugfix spec.

## 3. Admin submission false-success

Moving the service does not fix:
- swallowed Function failure;
- fixture/in-memory fallback;
- direct submission mutation.

Do not report it resolved by relocation.

## 4. Admin metrics truthfulness

Moving dashboard fixtures does not make them operationally truthful.

Carry this issue into the next phase.

## 5. Campaign E2E

Do not run or claim Campaign E2E as part of folder extraction unless requested separately.

## Required handoff language

At the end of migration:

```text
Architecture extraction is complete.
Behavior/security defects remain open and are ready for the dedicated Admin/Campaign bugfix spec against the new admin/src paths.
```
