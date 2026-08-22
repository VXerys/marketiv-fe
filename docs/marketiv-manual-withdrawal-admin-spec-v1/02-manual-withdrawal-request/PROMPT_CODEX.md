# COPY-PASTE TO CODEX — PHASE 02 ONLY

Kerjakan **Phase 02 — Manual Withdrawal Request** saja.

Read:
- `docs/marketiv-manual-withdrawal-admin-spec-v1/README.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/MASTER_SPEC.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/SCOPE_AND_DEPENDENCIES.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/02-manual-withdrawal-request/requirements.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/02-manual-withdrawal-request/design.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/02-manual-withdrawal-request/tasks.md`

Audit current `staging` first. Baseline spec: `05da858b3537b86a170147ffb23d6ed34def2c33`.

Objective: refactor `00_BACKEND/functions/request-withdrawal/src/main.js` agar request valid berhenti pada `withdrawal=requested` setelah balance di-reserve/debit atomik dan ledger pending dibuat. Hapus automated Midtrans Iris call dari NEW request path.

Hard constraints:
- preserve auth/TOS/email/KYC/rate-limit/cooling/idempotency/role guards;
- no payout provider replacement;
- no automatic `processing`;
- no premature success message;
- keep legacy `withdrawal-callback` untouched;
- jangan kerjakan Phase 03 schema/admin;
- no unrelated refactor.

Audit → implement → targeted tests/syntax verification → report exact results/deployment impact.

Penuhi acceptance criteria. Setelah selesai, **STOP. Jangan mulai Phase 03.**
