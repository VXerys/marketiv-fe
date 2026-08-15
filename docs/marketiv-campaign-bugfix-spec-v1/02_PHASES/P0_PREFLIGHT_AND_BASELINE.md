# P0 — Preflight & Baseline

## Goal

Protect current work and verify that the spec still matches current `staging`.

## Read only

- `git status --short`
- `git branch --show-current`
- current HEAD/log around `staging`
- `00_BACKEND/docs/04_Decisions/ADR-010.md`
- Trello SOT summary from `00_SOT/AUDIT_SNAPSHOT.md`

## Tasks

1. Do not reset, stash, discard, or overwrite user changes.
2. Record:
   - current branch;
   - current HEAD SHA;
   - dirty files relevant to this phase pack.
3. If not based on `staging`, report before editing.
4. Inspect whether these defects still exist:
   - Admin false-success/direct-write;
   - Admin route guard/data-before-guard;
   - login mismatch;
   - Creator detail missing Unclaim.
5. If a defect is already fixed in newer code:
   - do not reimplement it;
   - run/inspect its verification;
   - report it as superseded.
6. Do not edit code in this phase unless required solely to preserve an already-started user change.

## Exit criteria

- Baseline recorded.
- No user work lost.
- Phase P1 still valid or its drift documented.

## Return

Use the final report format from README.
