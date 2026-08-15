# Codex Runbook

## Minimal-context execution

Run each phase independently.

### Session 1

```text
Execute P0 from 02_PHASES/P0_PREFLIGHT_AND_BASELINE.md.
```

### Session 2

```text
Execute P1 from 02_PHASES/P1_ADMIN_SUBMISSION_FAIL_CLOSED.md.
Do not start P2.
```

Continue the same pattern.

## Before every phase

Codex should run/inspect:

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

Never auto-clean the worktree.

## During implementation

Use this decision rule:

```text
Need to change another file?
├─ direct dependency needed for the phase → inspect, then change if necessary
├─ unrelated bug/refactor → do not change
└─ source conflict → stop that portion and report
```

## Verification strategy

1. targeted test for changed boundary;
2. targeted neighboring regression tests;
3. `npm run lint`;
4. `npm run typecheck`;
5. `npm run build`;
6. live/manual staging only when requested/environment is available.

Do not burn tokens reading long historical docs unless a current contract is ambiguous.

## Commit strategy

Prefer one logical commit per phase if the user asks Codex to commit.

Suggested titles:

- `fix(admin): make campaign review mutations fail closed`
- `fix(admin): protect admin routes before data loading`
- `fix(auth): handle login portal role mismatch`
- `fix(creator): add unclaim action to active work detail`
- `fix(admin): remove fabricated dashboard metrics`
- `fix(campaign): align validation copy and states`

Do not commit generated artifacts, logs, secrets, test credentials, or unrelated formatting.
