# Master Tasks

Execute phases in order. Each phase has detailed instructions under `02_PHASES/`.

## P0 — Preflight

- [ ] Confirm branch/base and preserve local work.
- [ ] Inspect current files listed by the phase.
- [ ] Record baseline SHA.
- [ ] Identify drift from this spec.

## P1 — Admin authoritative mutation

- [ ] Gate fixtures/store to explicit mock mode.
- [ ] Real reads fail closed; empty is empty.
- [ ] Replace manual Function execution with canonical `executeFunction`.
- [ ] Remove direct review decision DB writes from browser.
- [ ] Remove false-success path.
- [ ] Refresh authoritative state after successful mutation.
- [ ] Rewrite tests that currently bless in-memory real flow.
- [ ] Add Function failure/status tests.

## P2 — Admin authorization boundary

- [ ] Reuse `RoleGuard role="admin"`.
- [ ] Ensure protected Admin data is not fetched before guard.
- [ ] Handle anonymous, UMKM, Creator, suspended Admin, active Admin.
- [ ] Add/load error states after auth.
- [ ] No admin/server secrets in browser.

## P3 — Login role mismatch

- [ ] Detect UMKM↔Creator mismatch immediately after login.
- [ ] Clear wrong-role session.
- [ ] Explicit feedback.
- [ ] Preserve Admin login.
- [ ] Validate/ignore incompatible `next`.
- [ ] Add tests.

## P4 — Creator Unclaim detail

- [ ] Add conditional CTA.
- [ ] Add confirmation.
- [ ] Use existing service facade.
- [ ] Handle pending/error/success.
- [ ] Navigate away after success.
- [ ] Add tests.

## P5 — Admin metrics truth

- [ ] Remove real-mode fallback `15`.
- [ ] Fix/remove unsupported “today”, growth, accuracy, SLA, progress values.
- [ ] Separate error vs empty.
- [ ] Gate mock metrics.

## P6 — Copy + focused UI polish

- [ ] Remove stale UMKM-reviewer rejection wording.
- [ ] Search Campaign surfaces for stale authority copy.
- [ ] Keep UMKM observer-only.
- [ ] Polish changed error/loading/empty states and responsive behavior.
- [ ] No Rate Card work.

## P7 — Revalidate reported fixes

- [ ] Stop Campaign state/action.
- [ ] Submit proof trusted Function path.
- [ ] Claim/unclaim permission path.
- [ ] Patch only if regression is reproduced.

## P8 — E2E readiness handoff

- [ ] Confirm all Campaign blockers closed/code-verified.
- [ ] Produce staging test matrix and evidence checklist.
- [ ] Do not claim live E2E pass unless executed.
