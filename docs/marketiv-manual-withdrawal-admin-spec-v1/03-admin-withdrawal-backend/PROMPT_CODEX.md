# COPY-PASTE TO CODEX — PHASE 03 ONLY

Kerjakan **Phase 03 — Admin Withdrawal Backend** saja.

Read:
- `docs/marketiv-manual-withdrawal-admin-spec-v1/README.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/MASTER_SPEC.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/SCOPE_AND_DEPENDENCIES.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/03-admin-withdrawal-backend/requirements.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/03-admin-withdrawal-backend/design.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/03-admin-withdrawal-backend/tasks.md`

Current repo/staging authoritative. Baseline spec: `05da858b3537b86a170147ffb23d6ed34def2c33`.

Objective: buat trusted admin backend untuk queue + manual withdrawal state transitions + idempotent reversal.

Expected additions:
- `00_BACKEND/functions/get-admin-withdrawal-queue/**`
- `00_BACKEND/functions/review-withdrawal/**`

Expected changes:
- canonical withdrawal schema in `00_BACKEND/appwrite/generate_appwrite_json.cjs`
- `00_BACKEND/appwrite/function-scopes.json`
- regenerate `00_BACKEND/appwrite.config.json`

Reuse current admin authority pattern dari `get-admin-submission-queue` / `review-submission`.

Hard constraints:
- admin-only server authority;
- no payout API;
- no sensitive collection-wide browser read;
- success only from processing and requires transfer reference;
- failure/rejection reverses balance exactly once;
- append reversal ledger;
- preserve `iris_reference` legacy field;
- no unrelated refactor.

Do audit first, implement, run Function/schema/tests verification, report exact results + exact schema/function redeploy requirements.

Penuhi acceptance criteria. Setelah selesai **STOP. Jangan mulai Phase 04.**
