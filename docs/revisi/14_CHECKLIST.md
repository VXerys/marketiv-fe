# 14 — Checklist

Date: `2026-08-10`
Repo: `marketiv-id/marketiv-web`
Branch: `staging`
Audit baseline: `fd833d387324a6d279a7b2f88cc4c1c45b86a5bf`

## Legend

- `[x]` selesai
- `[ ]` belum selesai
- `[-]` parsial / sedang dikerjakan / perlu verifikasi lanjutan

## P0

- `[x] UMKM-SEC-01` lock orders
  Note: order row tetap read-only untuk participant; client order transition dicabut dari browser dan dialihkan ke Function/event backend (`cancel-order`, `track-order-review`, `sync-order-revision`).
- `[x] UMKM-SEC-03` backend role guard
  Note: helper shared `requireActiveRole` sudah dipakai `create-conversation` dan `create-offer`. Unit test helper + flow pass.
- `[x] UMKM-SEC-04` lock conversation/message
  Note: create/send/read/archive chat dipindah ke Function. Permission row conversation/message diturunkan jadi participant read-only.
- `[x] UMKM-FIN-01` escrow recovery
  Note: `release-escrow` pakai saga `held -> releasing -> released`, ledger deterministic per escrow, retry menyelesaikan state `releasing`, dan ada function `reconcile-release-escrow` untuk finalize/review state tertahan.
- `[x] UMKM-OPS-01` live Function env/deployment
  Note: audit live `00_BACKEND/audit/2026-08-09-function-env-live-audit.md` + verifikasi staging `2026-08-10` menunjukkan
  `patch-campaign-draft` dan `patch-campaign-status` punya env/deployment live yang bekerja.
  Smoke test staging sukses pada campaign `ops01smoke20260810`: `edit -> publish -> pause -> resume`.

## P1

- `[ ] UMKM-SEC-02`
- `[ ] UMKM-FIN-02`
- `[ ] UMKM-CAM-01`
- `[ ] UMKM-FIN-03`
- `[ ] UMKM-LEGAL-01`

## P2

- `[ ] UMKM-PERF-01`
- `[ ] UMKM-UX-01`
- `[ ] UMKM-DATA-01`
- `[ ] UMKM-DATA-02`
- `[ ] UMKM-DATA-03`
- `[ ] UMKM-NOTIF-01`
- `[ ] UMKM-SET-01`
- `[ ] UMKM-SET-02`
- `[ ] UMKM-FILE-01`
- `[ ] UMKM-PRIV-01`
- `[ ] UMKM-SUP-01`

## P3

- `[ ] UMKM-PROC-01`

## Evidence tracked

- `UMKM-SEC-01`
  Verification:
  `rtk npx vitest run tests/integration/functions.test.ts -t "creates order with status pending_payment on offer accepted"`
  `rtk npx vitest run tests/integration/services.test.ts -t "order.service — integration"`
  `rtk npx vitest run tests/integration/functions.test.ts -t "create-order function|sync-order-revision function|track-order-review function|cancel-order function"`
- `UMKM-SEC-03`
  Verification:
  `rtk npx vitest run tests/unit/require-active-role.test.ts`
  `rtk npx vitest run tests/unit/sec-03-role-guard.test.ts`
- `UMKM-SEC-04`
  Verification:
  `rtk npx vitest run tests/integration/services.test.ts -t "chat.service — integration"`
  `rtk npx vitest run tests/integration/functions.test.ts -t "create-conversation function|send-message function|mark-conversation-read function|patch-conversation-archive function"`
- `UMKM-FIN-01`
  Verification:
  `rtk npx vitest run tests/integration/functions.test.ts -t "release-escrow function|reconcile-release-escrow function"`
- `UMKM-OPS-01`
  Verification:
  Evidence repo:
  `00_BACKEND/audit/2026-08-09-function-env-live-audit.md`
  Live audit command:
  `rtk node appwrite/ops/audit-live.mjs`
  Smoke setup:
  create campaign row `ops01smoke20260810`
  top-up staging payment `manualfund55e8393916c514f685802c` until `remainingBudget=50000`
  Execution IDs:
  `patch-campaign-draft` draft edit → `6a79e0dd7460cf3d6ec2` (`deploymentId=6a772ba77be96146f4f6`)
  `patch-campaign-status` publish → `6a79e0f0012d29934a44` (`deploymentId=6a772b8a61980c3bbe29`)
  `patch-campaign-status` pause → `6a79e0f796388f7a3e36` (`deploymentId=6a772b8a61980c3bbe29`)
  `patch-campaign-status` resume → `6a79e0f7c77aad0df667` (`deploymentId=6a772b8a61980c3bbe29`)
  Final state:
  `rtk node 00_BACKEND/appwrite/ops/inspect-campaign.mjs --campaign ops01smoke20260810`

## Update rule

- ubah status hanya jika root cause fixed;
- test target pass;
- negative auth/security test pass bila relevan;
- tidak ada refactor tidak terkait;
- evidence command/test dicatat.
