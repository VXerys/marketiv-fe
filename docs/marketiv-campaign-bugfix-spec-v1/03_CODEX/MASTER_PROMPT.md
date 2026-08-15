# Codex Master Prompt — Token-Efficient

Use this as the initial instruction for **one phase only**.

```text
Implement exactly one Marketiv Campaign bugfix phase.

Model target: GPT-5.6 Terra Medium.
Optimize for correctness and low token usage.

Read only:
1) README.md
2) 00_SOT/SOURCE_PRECEDENCE.md
3) the requested 02_PHASES/<PHASE>.md

Then inspect only the repository files listed by that phase plus direct dependencies needed to trace the call/data flow.

Rules:
- Current checked-out staging code is implementation source of truth.
- Preserve user changes; never reset/stash/discard them.
- Trace the current flow before editing.
- Implement the smallest production-ready change satisfying the phase.
- Reuse existing architecture/services/components.
- No Rate Card changes.
- No unrelated refactor.
- No direct client mutation of Campaign submission final state/views/reward/ledger.
- No new secret or server key in NEXT_PUBLIC env.
- Add/update focused tests.
- Run the phase verification commands.
- If an expected issue is already fixed in newer code, do not reimplement it; verify and report the drift.
- Do not claim staging/E2E success unless actually executed.

Final response:
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
