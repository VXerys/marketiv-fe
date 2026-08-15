# Marketiv Campaign Bugfix — Spec-Driven Pack v1

**Target:** `marketiv-id/marketiv-web`  
**Branch:** `staging`  
**Audit anchor:** `878d48e2db1d25e8154176719c95b8d216c641be`  
**Prepared:** 2026-08-15  
**Execution target:** Codex — GPT-5.6 Terra Medium

## Objective

Close the remaining Campaign blockers and harden the current UMKM ↔ Creator ↔ Admin flow without expanding into Rate Card.

Release order:

1. Admin submission mutation must be authoritative and fail-closed.
2. `/admin/*` must be protected by the existing auth/role architecture before protected data is loaded.
3. Login must handle UMKM/Creator portal-role mismatch explicitly.
4. Creator active-work detail must support unclaim before submission.
5. Admin metrics must stop presenting fixture/static values as operational facts.
6. Campaign wording/UI states must match the current Admin-authority concept.
7. Revalidate the three backend/code fixes already reported as fixed.
8. Prepare the Campaign E2E handoff; live E2E can be run afterward.

## Product invariant

```text
Creator = submitter
Admin Marketiv = submission validator / final-views decision authority
UMKM = read-only Campaign observer
Fraud precheck = advisory risk signal
Backend trusted Function = authoritative mutation boundary
Backend financial state = reward / ledger authority
```

Campaign remains **zero-chat / no negotiation**.

## Token-efficient Codex workflow

Do **one phase per Codex session**.

For each phase, give Codex only:

1. this `README.md`;
2. `00_SOT/SOURCE_PRECEDENCE.md`;
3. the single file under `02_PHASES/` being executed.

Do not preload every spec file. The phase file already tells Codex which repository files to inspect.

After a phase is complete, start the next phase with a fresh session if context has become large.

## Recommended execution order

| Phase | Scope | Priority |
|---|---|---|
| P0 | Preflight & baseline | Gate |
| P1 | Admin authoritative mutation / false-success | P0 |
| P2 | Admin auth boundary & protected data loading | SEC-P0 |
| P3 | Login portal role mismatch | P0 |
| P4 | Creator detail unclaim parity | P1 |
| P5 | Admin metrics truthfulness | P1 |
| P6 | Campaign copy + focused UI polish | P2 / polish |
| P7 | Revalidate code-fixed #2/#4/#5 | Regression gate |
| P8 | Campaign E2E readiness handoff | Final handoff |

## Global constraints

- Current checked-out code wins over this snapshot if `staging` moved.
- Do not reset or overwrite unrelated user changes.
- Do not refactor Rate Card.
- Do not change Appwrite schema unless a phase explicitly proves it is required.
- Do not add packages unless unavoidable; none are expected.
- Do not expose Appwrite API keys/server credentials in browser code.
- Do not directly mutate `campaign_submissions.status`, locked views, wallet, reward, or ledger from the browser.
- Do not mark runtime/E2E as passed unless it was actually executed.
- Prefer existing services, `RoleGuard`, `executeFunction`, route constants, UI primitives, and data-source switches.
- Keep responsive behavior usable from 375px upward.
- Preserve loading, error, empty, disabled, and success states.

## Known unrelated pre-existing issue

Trello still tracks a TypeScript SVG declaration failure. If `npm run typecheck` fails only for that known pre-existing issue, report it as an external blocker and **do not fix it inside Campaign phases** unless explicitly asked.

## Final implementation report format

Each Codex phase must return:

```text
Phase:
Diagnosis:
Root cause:
Files changed:
Behavior changed:
Tests/verification:
Pre-existing failures:
Remaining risks/blockers:
Next phase:
```
