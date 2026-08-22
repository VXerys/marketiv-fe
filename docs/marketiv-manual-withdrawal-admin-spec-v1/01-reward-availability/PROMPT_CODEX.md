# COPY-PASTE TO CODEX — PHASE 01 ONLY

Kerjakan **Phase 01 — Reward Availability** saja pada current `staging`.

WAJIB baca:
- `docs/marketiv-manual-withdrawal-admin-spec-v1/README.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/MASTER_SPEC.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/SCOPE_AND_DEPENDENCIES.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/01-reward-availability/requirements.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/01-reward-availability/design.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/01-reward-availability/tasks.md`

Baseline spec: `05da858b3537b86a170147ffb23d6ed34def2c33`. Current HEAD lebih authoritative.

Objective: ubah reward Campaign baru agar setelah submission di-approve admin, reward masuk langsung ke `wallet.balance`, bukan `pendingBalance`, tanpa mengubah current 72h observation window dan tanpa merusak budget accounting.

Scope utama:
- `00_BACKEND/functions/calculate-campaign-reward/src/main.js`
- tests terkait Campaign reward/wallet.

Constraints:
- preserve 72h observation behavior;
- jangan disable/delete `mature-pending-balance` pada fase ini;
- jangan ubah Rate Card;
- jangan menambah merchant settlement state;
- no unrelated refactor;
- preserve reward idempotency dan campaign budget accounting.

Sebelum edit, tampilkan audit singkat: current behavior, files, conflicts, plan. Setelah itu implementasikan, jalankan targeted tests/syntax/lint, dan laporkan exact results + deployment impact.

Penuhi seluruh acceptance criteria. Setelah selesai, **STOP. Jangan mulai Phase 02.**
