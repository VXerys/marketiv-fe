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

- `[x] UMKM-SEC-02` draft permissions
  Note: Menambahkan kondisi di `harden-permissions.mjs` dan `patch-campaign-status` agar campaign draft tidak dapat dibaca publik.
- `[x] UMKM-FIN-02` campaign funding mismatch
  Note: Mengunci `budget` di `patch-campaign-draft` jika `remainingBudget > 0`. Menambahkan validasi `remainingBudget >= budgetTarget` di `patch-campaign-status` sebelum publish.
- `[x] UMKM-CAM-01` rejected submission quota restore
  Note: Restorasi kuota `totalClaims` dipindah ke server (atomic `decrementColumn`) lewat `review-submission` untuk menghindari race condition dari client.
- `[x] UMKM-FIN-03` pending campaign payment total DTO
  Note: Update antarmuka DTO `Transaction` (baseAmount, feeAmount, totalAmount) via `mapTransaction`. UI modal payment sekarang menampilkan breakdown platform fee (2%).
- `[x] UMKM-LEGAL-01` UMKM guide wrong domain/fee
  Note: Memperbarui Buku Panduan UMKM lintas FAQ dan Syarat & Ketentuan dari "komisi 10%/5%" menjadi "Platform Fee 2% di awal" serta mempertegas "Kreator mendapat flat netto 0% potongan".

## P2

- `[x] UMKM-PERF-01` campaign N+1
  Note: Tambah `getSubmissionCountsFromAppwrite(campaignIds[])` di `umkm-appwrite.service.ts` — satu
  `listDocuments` dengan `Query.equal("campaignId", campaignIds)` lalu aggregate in-memory.
  `CampaignsPage.tsx` diganti dari N+1 `Promise.all(campaigns.map(c => getCampaignSubmissions(c.id)))`
  menjadi satu panggilan `getSubmissionCounts(campaignIds)`. Wrapper `getSubmissionCounts` ditambah di
  `umkm-dashboard.service.ts` (mock path + appwrite path). `MockClient.setLocale()` ditambah ke test mock.
  `@/` alias ditambah ke `00_BACKEND/vitest.config.ts`.
- `[x] UMKM-UX-01` payment modal
  Note: Di `CreateCampaignWizard.tsx`, ubah aksi `handleNext` pada langkah terakhir dari memanggil
  `handleConfirmPayment()` secara langsung menjadi `setIsPaymentOpen(true)` agar PaymentSimulationModal
  terbuka terlebih dahulu, sesuai desain.
- `[x] UMKM-DATA-01` creator directory max 100
  Note: Memperbaiki fungsi `get-creator-directory` agar mengembalikan `{ items, total, nextCursor }` menggunakan `listPaged`.
  Di frontend, `PaginatedCreators` type ditambahkan, lalu service serta `CreatorDirectoryPage.tsx`
  diperbarui untuk memakai paginasi dan melempar `total` yang akurat ke `CreatorSummaryCards`.
- `[x] UMKM-DATA-02` partial failure shown empty
  Note: Pada halaman `CreatorDetailPage.tsx`, `FinanceOverviewPage.tsx`, dan `AnalitikClient.tsx`,
  ditambahkan penanganan state error di level komponen (section-level) alih-alih me-fallback data ke `[]` atau `null`
  secara diam-diam. Tombol "Coba Lagi" disisipkan untuk area yang error tanpa merusak data section lainnya.
- `[x] UMKM-DATA-03` Aggregate cap 5000
  Note: Memodifikasi Appwrite Functions (`get-umkm-finance-summary` & `get-umkm-dashboard-summary`)
  agar mengembalikan `isTruncated: true` jika jumlah data menyentuh `MAX_DOCS` (5000).
  Di sisi frontend, type diperbarui dan komponen `FinanceSummaryCards`, `UmkmOverviewClient`, serta `AnalitikClient`
  menampilkan banner warning bahwa "Sebagian data adalah estimasi" ketika flag tersebut bernilai `true`.
- `[x] UMKM-NOTIF-01`
  Note: Memperbaiki batas 100 notifikasi dengan menerapkan metode cursor pagination (loop cursor sampai data habis) di `getNotificationsFromAppwrite`. Selain itu, merombak `markAllNotificationsRead` menjadi Function baru `mark-notifications-read` yang menerima `ids: string[]` untuk melakukan iterasi baca + update di server, sehingga menghindari multiple API calls yang gagal dari frontend.
- `[x] UMKM-SET-01` Hardcoded verified badge (isVerified state injected into chrome and sidebar)
- `[x] UMKM-SET-02` WhatsApp not hydrated (added phone parsing from session)
- `[x] UMKM-FILE-01`
  Note: Public SVG upload (removed svg from allowed extensions in storage.ts and PengaturanClient.tsx)
- `[x] UMKM-PRIV-01`
  Note: Moved `address` from `umkm_profiles` to `users` collection to separate private owner fields. `users` already stores private fields like `phone`, and `umkm_profiles` remains the public projection (`read("any")`). Updated `create-user-profile` function and `umkm-appwrite.service.ts` to query/update `address` in `users`.
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
- `UMKM-SEC-02`
  Verification:
  `rtk npx vitest run tests/integration/functions.test.ts -t "patch-campaign-status"`
- `UMKM-FIN-02`
  Verification:
  `rtk npx vitest run tests/integration/functions.test.ts -t "patch-campaign-draft|patch-campaign-status"`
- `UMKM-CAM-01`
  Verification:
  `rtk npx vitest run tests/integration/functions.test.ts -t "review-submission function"`
- `UMKM-FIN-03`
  Verification:
  `src/components/features/umkm-dashboard/finance/modals/PendingPaymentModal.tsx` now uses `totalAmount` and shows `feeAmount` breakdown. `mapTransaction` updated.
- `UMKM-LEGAL-01`
  Verification:
  `src/app/dashboard/umkm/panduan/page.tsx` updated 5% to 2% and creator flat netto 0%.
- `UMKM-PERF-01`
  Verification:
  `cd 00_BACKEND && npx vitest run tests/unit/perf-01-submission-counts.test.ts`
  Result: 3/3 tests pass — empty-map short-circuit, batch aggregation correct counts, missing campaignId absent.
  Key assertion: `expect(mockListDocuments).toHaveBeenCalledTimes(1)` confirms no N+1.
  Files changed:
  - `src/services/umkm/umkm-appwrite.service.ts` (+`getSubmissionCountsFromAppwrite`)
  - `src/services/umkm/umkm-dashboard.service.ts` (+`getSubmissionCounts` wrapper)
  - `src/components/features/umkm-dashboard/campaign/CampaignsPage.tsx` (replace N+1 loop)
  - `00_BACKEND/src/test-mocks/appwrite.ts` (+`MockClient.setLocale`)
  - `00_BACKEND/vitest.config.ts` (+`@/` alias)
  - `00_BACKEND/tests/unit/perf-01-submission-counts.test.ts` (new test file)
- `UMKM-UX-01`
  Verification:
  `src/components/features/umkm-dashboard/create-campaign/CreateCampaignWizard.tsx` (handleNext).
  Klik tombol "Lanjut Pembayaran" di Step 5 akan memanggil `setIsPaymentOpen(true)` dan memunculkan `PaymentSimulationModal`.
- `UMKM-DATA-01`
  Verification:
  Cek fungsi appwrite `get-creator-directory` mengembalikan `{ items, total, nextCursor }`.
  Di frontend, `CreatorDirectoryPage.tsx` diubah menggunakan `res.data.items` dan `res.data.total` dilempar ke `CreatorSummaryCards`.
  Test dengan `npm run lint` & `tsc` menghasilkan 0 error TypeScript.

## Update rule

- ubah status hanya jika root cause fixed;
- test target pass;
- negative auth/security test pass bila relevan;
- tidak ada refactor tidak terkait;
- evidence command/test dicatat.
