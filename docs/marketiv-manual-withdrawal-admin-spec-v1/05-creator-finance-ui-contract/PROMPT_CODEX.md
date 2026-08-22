# COPY-PASTE TO CODEX — PHASE 05 ONLY

Kerjakan **Phase 05 — Creator Finance UI Contract** saja.

Read:
- `docs/marketiv-manual-withdrawal-admin-spec-v1/README.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/MASTER_SPEC.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/SCOPE_AND_DEPENDENCIES.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/05-creator-finance-ui-contract/requirements.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/05-creator-finance-ui-contract/design.md`
- `docs/marketiv-manual-withdrawal-admin-spec-v1/05-creator-finance-ui-contract/tasks.md`

Pastikan current branch sudah memiliki Phase 02/03 backend contract. Jika response/status berbeda dari baseline spec, current backend wins dan laporkan adaptation.

Objective: ubah creator withdrawal UX dari legacy processed/success menjadi request manual admin dengan status awal requested/pending.

Primary files:
- `src/types/domain.ts`
- `src/services/creator/creator-appwrite.service.ts`
- `src/services/creator/creator-dashboard.service.ts`
- `src/components/features/creator-dashboard/KeuanganView.tsx`
- status badge hanya jika perlu.

Hard constraints:
- use authoritative `balanceAfter`;
- new transaction row pending, not completed;
- copy “umumnya 1–2 hari kerja”, bukan hard max;
- jangan mengatakan dana sudah ditransfer;
- no direct DB wallet mutation;
- no payout API;
- no broad realtime addition;
- no unrelated UI redesign.

Audit first, implement, run tests/typecheck/lint/build, report exact results.

Penuhi acceptance criteria. Setelah selesai **STOP. Jangan mulai Phase 06.**
