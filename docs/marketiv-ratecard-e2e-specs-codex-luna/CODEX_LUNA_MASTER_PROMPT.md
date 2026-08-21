# Codex Luna Master Prompt — Marketiv Rate Card E2E

You are working on `marketiv-id/marketiv-web`.

## Objective

Implement the Rate Card E2E fixes using the spec pack in this directory.

The implementation order is mandatory:

1. `01-payment-idempotency`
2. `02-room-sync-payment-handoff`
3. `03-package-context`

Do **not** combine all three into one large refactor.

## Source of Truth

Before editing:
1. checkout/read current `staging`,
2. record current HEAD,
3. inspect actual repository architecture and current files,
4. compare with the spec,
5. if code has changed after spec baseline `c75ec9b`, prefer current code and report conflicts before making a risky assumption.

Current repository is authoritative over old docs.

## Working Rules

- Trace data flow before changing code.
- Preserve existing architecture when still valid.
- Scope changes tightly to the active spec.
- No unrelated refactor.
- Do not mix Campaign flow into Rate Card.
- Do not trust browser success as payment finality.
- Keep all financial final states server-authoritative.
- Do not expose server secrets.
- Preserve seller-side Rate Card fee semantics.
- Loading/error/empty/retry states must be explicit.
- Preserve current auth/permission boundaries.
- Do not use broad private Appwrite realtime subscriptions.
- Add tests for each bug and regression path.

## Per-spec Procedure

For each spec:

### 1. Read-only audit
Read:
- `requirements.md`
- `design.md`
- `tasks.md`

Then inspect all referenced current files.

Output an audit containing:
- current behavior,
- confirmed root cause,
- exact files likely to change,
- schema/deployment impact,
- conflicts between spec and current code,
- implementation plan.

Do not edit until the audit is coherent.

### 2. Implement
Implement only that spec.

If a schema change is required:
- find canonical Appwrite schema source,
- update source of truth,
- regenerate derived files according to repo workflow,
- do not manually fork generated config.

### 3. Verify
Run project-appropriate:
- targeted tests,
- typecheck,
- lint,
- build.

For backend Functions also run syntax/unit/integration checks that exist in repo.

### 4. Report
Report:
- diagnosis,
- root cause,
- changed files,
- schema changes,
- behavioral changes,
- tests run + exact result,
- deployment steps still required,
- remaining risks.

Do not say “E2E PASS” unless actual staging runtime was tested.

### 5. Stop
After finishing one spec, STOP and wait for the user before starting the next spec.

## Spec 01 Critical Invariant

`one Rate Card order = max one active/successful payment path`

Frontend disable is not enough. Race safety must be server/database enforced.

## Spec 02 Critical Invariant

`UI payment success = authoritative backend progression, never redirect result`

Room state must self-refresh without manual reload while avoiding forbidden broad private realtime subscriptions.

## Spec 03 Critical Invariant

`Package = provenance/prefill; accepted Custom Offer = final contract`

Conversation remains one per UMKM–Kreator pair. Do not create conversation per package.

## Final Acceptance

After all three are code-complete, prepare staging UAT using `VERIFICATION_MATRIX.md`.
