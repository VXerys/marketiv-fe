# COPY-PASTE TO CODEX — PHASE 04 ONLY

Kerjakan **Phase 04 — Admin Withdrawal UI** saja.

Read:
- `docs/marketiv-manual-withdrawal-admin-spec-v1/README.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/MASTER_SPEC.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/SCOPE_AND_DEPENDENCIES.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/04-admin-withdrawal-ui/requirements.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/04-admin-withdrawal-ui/design.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/04-admin-withdrawal-ui/tasks.md`

Pastikan Phase 03 backend contract sudah ada di current branch. Jika belum, STOP dan laporkan dependency.

Objective: buat halaman `/withdrawals` di aplikasi `admin/` untuk manual queue dan actions requested→processing→succeeded / failure-reversal via trusted Functions.

Ikuti architecture existing `admin/src/features/admin/submissions/**`, `execute-function.ts`, `appwrite.ts`, dan sidebar.

Hard constraints:
- no direct browser mutation ke wallets/transactions/withdrawals;
- no payout API;
- account masked di table;
- full destination hanya di detail;
- success requires transfer reference;
- fail requires reason;
- authoritative re-fetch after mutation;
- loading/error/empty/conflict states;
- no unrelated visual redesign.

Audit first, implement, run admin tests/typecheck/lint/build, report exact results.

Penuhi acceptance criteria. Setelah selesai **STOP. Jangan mulai Phase 05.**
