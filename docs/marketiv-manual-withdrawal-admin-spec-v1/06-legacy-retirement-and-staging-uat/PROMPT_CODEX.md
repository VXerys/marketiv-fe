# COPY-PASTE TO CODEX — PHASE 06 ONLY

Kerjakan **Phase 06 — Legacy Retirement + Staging UAT** saja.

Read:
- `docs/marketiv-manual-withdrawal-admin-spec-v1/README.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/MASTER_SPEC.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/SCOPE_AND_DEPENDENCIES.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/VERIFICATION_MATRIX.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/06-legacy-retirement-and-staging-uat/requirements.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/06-legacy-retirement-and-staging-uat/design.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/06-legacy-retirement-and-staging-uat/tasks.md`

Phase 01–05 harus code-complete di current branch. Jika belum, STOP.

Objective: audit legacy staging money state, retire maturation/Iris callback secara aman, update current docs, lalu prepare/execute staging UAT sesuai akses.

CRITICAL:
- jangan disable `mature-pending-balance` jika legacy pending balance masih bergantung;
- jangan disable `withdrawal-callback` jika ada Iris withdrawal masih processing;
- jangan disable `midtrans-webhook`;
- jangan zero/edit balance manual tanpa auditable reconciliation;
- jangan hapus source folder jika generator inventory rusak;
- jangan claim UAT PASS jika tidak runtime-tested.

Audit actual staging first. Jika Codex/CLI tidak punya akses Appwrite staging, jangan mengarang hasil: tulis exact commands/checklist untuk user dan tandai runtime UAT BLOCKED.

Setelah safe retirement, regenerate config dari canonical generator, run tests/build, update docs, report exact deployment steps/evidence.

Penuhi acceptance criteria. Setelah selesai **STOP dan berikan final rollout report.**
