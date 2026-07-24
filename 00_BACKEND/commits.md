# Commits

Daftar commit yang telah dilakukan pada proyek BackendMarketiv.

Format: [Hash] [Waktu] [Pesan] — [Deskripsi perubahan & file affected]

---

## 2026-07-15 — MVP Sync Batch (12 commits, 121/121 ✅)

### 1. Infrastruktur: Appwrite CLI v22 Migration
**`77641a6`** 21:05 — `chore: migrasi generator ke .cjs + appwrite.config.json CLI v22`

Migrasi dari `appwrite.json` (CLI v21) ke `appwrite.config.json` (CLI v22).
Generator diubah dari `.js` ke `.cjs` (CommonJS) karena project type `module`.

- `appwrite.config.json` — new, format CLI v22 (single source of truth untuk tabel/functions/buckets)
- `appwrite/generate_appwrite_json.cjs` — new, generator rewrite untuk output CLI v22
- `appwrite/generate_appwrite_json.js` — deleted (legacy)
- `appwrite/appwrite.json` — legacy backup, auto-generated
- `scripts/push-columns.cjs` — new, fallback push kolom satu per satu (workaround race condition `push tables --all --force`)

**Critical knowledge**: `push tables --all --force` rentan race condition — kolom dihapus karena `encrypt` mismatch, recreate gagal karena column belum available. Workaround: jalankan `node scripts/push-columns.cjs`.

### 2. Feature: Withdrawal Auto-Processed
**`bd9449d`** 21:00 — `feat: withdrawal auto-processed tanpa review admin`

Withdrawal langsung `status: 'processed'` tanpa tahap `pending` / review admin.
Keputusan MVP #6 — withdrawal otomatis diproses, admin hanya notifikasi via WhatsApp.

Files:
- `src/services/wallet.service.ts` — `WithdrawalStatus` dari `'pending' → 'processed'`, hapus logika review admin
- `docs/02_Modules/Payments/00_Index.md` + `10_Overview.md` + `60_API.md` — sinkron docs

### 3. Feature: Chat — Hapus Attachment + Read Receipt
**`168a6e0`** 21:00 — `feat: chat hapus attachment, tambah read receipt`

Chat MVP hanya support `text | offer | system` (tanpa image/file).
Read receipt (`readAt`) ditambahkan sebagai persiapan MVP.

Files:
- `src/services/chat.service.ts` — hapus attachment fields (fileId, fileName, fileSize, mimeType), tambah `readAt` di schema & service
- `docs/02_Modules/Chat/10_Overview.md` — sinkron docs

### 4. Docs: Storage Dormant (User Files)
**`70c19e3`** 21:00 — `docs: tandai user_storage_usage & user_files dormant (post-MVP)`

`user_storage_usage` table dan `user_files` collection ditandai ⚠️ DORMANT — kode & fungsi tetap ada, tidak dipanggil flow aktif. Diaktifkan jika feedback demo minta file manager internal.

Files (semua di `docs/02_Modules/Users/`):
- `00_Index.md`, `10_Overview.md`, `30_Business_Rules.md`, `50_Database.md`, `60_API.md`, `70_Backend.md`

### 5. Docs: Storage Dormant (Cross-Module)
**`096bc82`** 21:00 — `docs: tandai storage dormant di cross-module & folder structure`

Storage dormant di dokumen lintas modul.

Files:
- `docs/01_Global/40_Folder_Structure.md` — `user-files/` bucket marked dormant
- `docs/02_Modules/10_Domain_Model.md` — storage entities marked dormant
- `docs/02_Modules/Campaigns/30_Business_Rules.md` — campaign brief file upload marked dormant
- `docs/02_Modules/Orders/50_Database.md` — file references marked dormant

### 6. Test: Sinkron Withdrawal Flow
**`dc8b45c`** 21:01 — `test: sinkronkan withdrawal flow dengan auto-processed`

Sinkron test dengan withdrawal auto-processed. Hapus test yang menunggu status `pending`.

Files:
- `tests/e2e/critical-flows.spec.ts:30` — ubah test withdrawal e2e: pending/admin → auto processed
- `tests/integration/functions.test.ts` — hapus block test complete-withdrawal (fungsi sudah dihapus)
- `tests/integration/services.test.ts:159` — ubah title "pending withdrawal" → "auto processed"

### 7. Chore: Hapus Fungsi Legacy
**`e5fb60b`** 21:05 — `chore: hapus fungsi legacy complete-withdrawal & upload-chat-attachment`

Hapus Appwrite Functions yang tidak dipakai.

Files:
- `functions/complete-withdrawal/package.json` + `src/main.js` — deleted
- `functions/upload-chat-attachment/package.json` + `src/main.js` — deleted

### 8. Docs: Sinkronisasi Modul (Chat, Payments, Campaigns)
**`ca63f6c`** 21:05 — `docs: sinkronisasi Chat, Payments, Campaigns`

Update 17 file dokumentasi modul untuk sinkron dengan keputusan MVP:
- **Chat** (8 files): hapus attachment, tambah read receipt, update konsep & business rules
- **Payments** (5 files): hapus pending/review admin, update business rules, testing, frontend
- **Campaigns** (4 files): update database, API, backend, asset tutorial — storage dormant

### 9. Docs: Sinkronisasi Workflows & ADR
**`4890258`** 21:05 — `docs: sinkronisasi Workflows & ADR`

Update 6 file workflow dan ADR:
- `03_Workflows/00_Index.md` — sesuaikan index
- `20_Campaign_PPV.md` — hapus referensi file upload
- `40_Submission_Fraud.md` — sinkron flow
- `50_Withdrawal.md` — hapus tahap pending/review
- `60_Dispute.md` — sinkron flow
- `04_Decisions/ADR-007.md` — keputusan MVP #6–10 formalized

### 10. Docs: Sinkronisasi Global
**`2c03b4a`** 21:05 — `docs: sinkronisasi Global docs`

Update 3 file dokumentasi global:
- `01_Global/30_Naming_Convention.md` — naming convention terkini
- `01_Global/50_Security_Guidelines.md` — security guidelines update
- `01_Global/80_Deployment.md` — deployment config sync

### 11. Chore: Constants & Commits Tracker
**`56fd0fc`** 21:06 — `chore: tambah commits.md, src/constants`

- `commits.md` — new, tracker commit ini
- `src/constants/index.ts` — new, konstanta project (`ADMIN_WHATSAPP_NUMBER`, dll)

### 12. Chore: Update Graphify
**`8e0a2b3`** + **`7df5f8c`** 21:06-21:07 — `chore: update graphify knowledge graph`

Update knowledge graph setelah semua perubahan. Hanya affect `graphify-out/`.

---

## 2026-07-18 — Platform Fee 5%→2% + Config Sync

### 13. Feature: Platform Fee 2%

### 13. Feature: Platform Fee 2%
**`2ab8113`** 20:13 — `feat: turunkan platform fee 5%→2%`

Platform fee diturunkan dari 5% ke 2% untuk semua modul:
- Rate Card Order (seller side) — fee dipotong dari pendapatan creator
- Campaign Top-Up (buyer side) — fee ditambahkan ke total pembayaran UMKM
- Konstanta `PLATFORM_FEE_RATE` diubah 0.05→0.02, kalkulasi fee otomatis menyesuaikan

Files:
- `src/services/wallet.service.ts` — PLATFORM_FEE_RATE 0.05→0.02
- `src/services/payment.service.ts` — comment sinkron "Fee 5%"→"Fee 2%"
- `tests/unit/wallet.service.test.ts` — expect 0.05→0.02, nilai kalkulasi recalc (5000→2000, 2500→1000, 4999→1999, 105000→102000, 52500→51000, 95000→98000, 47500→49000)
- `tests/integration/services.test.ts` — test name "5% fee"→"2% fee"
- `docs/04_Decisions/ADR-008.md` — judul, fee 2%, PLATFORM_FEE_RATE=2, formula ×2%
- `docs/04_Decisions/00_Index.md` — deskripsi sinkron "fee 2%"
- `docs/03_Workflows/30_RateCard_Order.md` — fee 2% di release escrow & notifikasi
- `docs/03_Workflows/20_Campaign_PPV.md` — fee 2% di top-up budget
- `docs/02_Modules/RateCards/30_Business_Rules.md` — fee 2% di potongan creator
- `docs/02_Modules/Campaigns/30_Business_Rules.md` — fee 2% UMKM, formula ×2/100
- `docs/02_Modules/Campaigns/60_API.md` — formula ×2% di topUpCampaign()
- `docs/02_Modules/Campaigns/40_User_Flow.md` — fee 2% di flow top-up
- `docs/02_Modules/Payments/30_Business_Rules.md` — fee 2%, angka contoh recalc (Rp10.000→Rp4.000, Rp5.000→Rp2.000)
- `docs/02_Modules/Payments/100_Testing.md` — fee 2%, 0.05→0.02
- `docs/02_Modules/Payments/50_Database.md` — fee 2% di deskripsi kolom fee_amount

**Verifikasi**: ✅ Unit test PASS (7/7), Integration test PASS (24/24). Tidak ada sisa "5%" atau "0.05" di `src/` dan `docs/`.

### 14. Chore: Config Sync
**`649b630`** 20:13 — `chore: sinkron appwrite.config.json key tablesDB→databasesDB, tables→databases`

Appwrite CLI v22 rename key `tablesDB` → `databasesDB`, `tables` → `databases`. Isi identik (hanya rename key).

Files:
- `appwrite.config.json` — 3466 insert/delete, pure key rename

---

## 2026-07-23 (pagi) — Sprint 1 Frontend Integration

> Batch ini sempat terlewat dari tracker. Dicatat menyusul agar urutan hari ini utuh:
> pagi = perubahan dari sisi frontend, siang = respons backend atas dokumen handoff-nya.

### 0. Refactor: Dashboard UMKM + 4 Function DTO
**`b31f6e2`** 09:13 — `refactor: restructure dashboards, add backend functions, consolidate services`

Sprint 1 memindahkan dashboard UMKM dari mock ke service layer. Empat field view-model
tidak punya sumber data, dan sebagian butuh join lintas collection yang tidak bisa
dilakukan klien — maka lahir 4 Function DTO read-only.

Files (66 berkas, +2393/−1418):
- `00_BACKEND/functions/get-umkm-profile/` — new
- `00_BACKEND/functions/get-umkm-dashboard-summary/` — new
- `00_BACKEND/functions/get-umkm-finance-summary/` — new
- `00_BACKEND/functions/get-creator-directory/` — new
- `00_BACKEND/appwrite.config.json` + generator — kolom `creator_profiles.niche` + index `idx_niche`, enum `fesyen` → `fashion`
- `00_BACKEND/integration-context/2026-07-23-frontend-sprint1-appwrite-changes.md` — new, dokumen handoff berisi 4 pertanyaan keputusan
- `src/services/umkm/umkm-appwrite.service.ts` — 16 fungsi read
- `src/lib/appwrite/functions.ts` — `executeFunction` + `FUNCTION_IDS`
- `src/components/features/dashboard/*` — dihapus, digantikan `umkm-dashboard/*`

**Bug yang ditemukan**: id kreator sempat dipetakan dari `creator_profiles.$id`. Salah —
`orders.creatorId`, `rate_cards.creatorId`, dan `wallets.userId` semuanya memakai `userId`.
Pencarian rate card akan selalu kosong tanpa error. `get-creator-directory` mengembalikan `userId`.

---

## 2026-07-23 (siang) — Appwrite Config Cleanup

> Respons tim backend atas §7 dokumen handoff Sprint 1: pertanyaan #1 (generator divergen)
> dan #2 (data contract usang) tuntas; #3 (`campaigns.category` jadi enum) dan #4 (scope API
> key `users.read`) belum dijawab.

### 1. Chore: Hapus Generator Legacy
**`787ed59`** 14:27 — `chore: hapus generator legacy js`

Hapus dua file generator `.js` yang sudah digantikan oleh `generate_appwrite_json.cjs`.

Files:
- `00_BACKEND/generate_appwrite_json.js` — deleted (legacy V1, DB ID beda, flat `profiles`, 6 functions)
- `00_BACKEND/appwrite/generate_appwrite_json.js` — deleted (stale copy, node-18.0 target)

### 2. Chore: Hapus appwrite.json Legacy
**`a04612e`** 14:27 — `chore: hapus appwrite.json legacy`

Hapus file `appwrite.json` legacy yang sudah tidak dipakai. CLI v22 hanya baca `appwrite.config.json`.

Files:
- `00_BACKEND/appwrite.json` — deleted (legacy V1 output)
- `00_BACKEND/appwrite/appwrite.json` — deleted (duplikat dari `appwrite.config.json`, hanya beda path prefix)

### 3. Chore: Simplify Generator ke Output Tunggal
**`1d65ded`** 14:27 — `chore: simplify generator ke output tunggal appwrite.config.json`

Generator `.cjs` hanya output `appwrite.config.json` (CLI v22). Hapus output legacy `appwrite/appwrite.json`. Hapus blok try/catch baca existing `appwrite.json`.

Files:
- `00_BACKEND/appwrite/generate_appwrite_json.cjs` — hapus legacy output, hardcode projectId/name
- `00_BACKEND/appwrite.config.json` — regenerated (output identik)

### 4. Docs: Sinkron Referensi Appwrite Config
**`bc6b506`** 14:27 — `docs: sinkron referensi appwrite.config.json`

Update dokumentasi yang masih merujuk `appwrite/appwrite.json` → `appwrite.config.json`.

Files:
- `00_BACKEND/AGENTS.md` — `appwrite/appwrite.json` → `appwrite.config.json`
- `00_BACKEND/docs/01_Global/40_Folder_Structure.md` — urutan dan path disesuaikan

### 5. Docs: Update Data Contract Frontend
**`9205f37`** 14:27 — `docs: update data contract frontend`

Rewrite `08-frontend-data-contract.md` dari snake_case Indonesian ke camelCase English, sinkron dengan `src/types/domain.ts` dan `src/types/*.ts`.

Files:
- `docs/marketiv-md/database/08-frontend-data-contract.md` — rewrite 1102 line

---

## 2026-07-23 (sore) — Sprint 2 Fondasi Read-only Kreator

> Belum di-commit saat catatan ini ditulis. Dokumen handoff:
> `integration-context/2026-07-23-frontend-sprint2-appwrite-changes.md`

### 1. Fix: `Query` tidak di-import di 5 Function

Kelima Function memakai `Query.equal`/`Query.limit` tanpa meng-import-nya —
`ReferenceError` begitu dijalankan. Seluruh pipeline Campaign Mode (PPV) terdampak;
tidak terlihat selama ini karena frontend masih memakai mock.

Files: `ai-fraud-precheck`, `calculate-campaign-reward`, `campaign-claimed`,
`campaign-published`, `expire-stale-claims` — masing-masing `src/main.js` baris import.

### 2. Fix: Notifikasi ditulis tanpa permission baris

`notifications` punya `$permissions: []` + `rowSecurity`, tapi 4 dari 5 Function penulisnya
tidak memasang `Permission.read` — baris tercipta tapi tidak akan pernah terbaca pemiliknya.
Gagal senyap tanpa error.

Files: `calculate-campaign-reward` (creatorId), `campaign-claimed` (campaign.umkmId),
`campaign-published` (creator.userId), `expire-stale-claims` (claim.creatorId).
`calculate-campaign-reward` juga kini memasang permission baris pada `transactions`.

### 3. Feature: 3 Function DTO Kreator

Read-only, pola sama dengan 4 Function Sprint 1. Wajib lewat Function karena `escrows`
tidak terbaca klien dan agregasi uang melanggar kontrak §9/§26.

Files:
- `00_BACKEND/functions/get-creator-profile/` — new, 15s
- `00_BACKEND/functions/get-creator-dashboard-summary/` — new, 30s
- `00_BACKEND/functions/get-creator-negotiations/` — new, 30s, dual-mode list/single
- `00_BACKEND/appwrite/generate_appwrite_json.cjs` + `appwrite.config.json` — +48/−0, murni 3 blok Function

### 4. Feature: Service layer Kreator (`s2-appwrite-read`)

Files:
- `src/services/creator/creator-appwrite.service.ts` — 12 stub → implementasi (4 via Function, 8 query langsung)
- `src/lib/appwrite/functions.ts` — 3 id baru di `FUNCTION_IDS`

### 5. Fix: Drift kanon frontend

Files:
- `src/types/domain.ts` — `PLATFORM_FEE_RATE` 0.05 → 0.02 (tertinggal sejak `2ab8113`); `TransactionStatus` + `"completed"` (nilai yang benar-benar ditulis backend)
- `src/types/creator-dashboard.ts` — `CreatorActivityType` diperluas dengan nilai `notifications.type` nyata
- `src/lib/creator-status.ts`, `src/lib/umkm-status.ts` — label & variant untuk `completed`

**Verifikasi**: ✅ `tsc --noEmit` bersih, ✅ `node --check` bersih untuk 8 Function tersentuh.
Lint: 8 error pre-existing di komponen view kreator (target wiring Sprint 2), nol di berkas yang disentuh.

---

## 2026-07-24 — Function Standardization + Security Hardening (7 commits)

### 15. Fix: Env Var Naming Convention di Semua Function
**`1f6e3ec`** 07:56 — `fix: ganti var APPWRITE_API_KEY → APPWRITE_FUNCTION_API_KEY di semua function`

Appwrite Function runtime meng-inject key dengan prefix `FUNCTION_`; pakai
`APPWRITE_API_KEY` sebagai fallback di `getEnv()` berisiko baca env kosong
saat autocomplete tidak ketat. Standarisasi ke nama kanonik `APPWRITE_FUNCTION_API_KEY`
supaya sinkron injeksi runtime dan env var manual.

20 function tersentuh (masing-masing `.env.example` + `src/main.js`, 40 file):
`ai-fraud-precheck`, `campaign-claimed`, `campaign-published`, `create-escrow`,
`create-order`, `create-payment`, `create-user-profile`, `create-user-wallet`,
`delete-file`, `expire-stale-claims`, `get-creator-dashboard-summary`,
`get-creator-directory`, `get-creator-negotiations`, `get-creator-profile`,
`get-umkm-dashboard-summary`, `get-umkm-finance-summary`, `get-umkm-profile`,
`midtrans-webhook`, `release-escrow`, `send-chat-notification`, `validate-and-upload`

### 16. Fix: Standarisasi Client Init ai-brief
**`466fc08`** 07:56 — `fix: ganti client init ai-brief dari req.variables ke process.env`

ai-brief adalah satu-satunya function yang memakai `req.variables?.APPWRITE_*`
untuk init Client; 22 function lain sudah pakai `process.env.APPWRITE_FUNCTION_*`.
Standarisasi agar inject runtime seragam dan bisa di-repro env local.

Files:
- `00_BACKEND/functions/ai-brief/src/main.js` — 3 baris `.setEndpoint`/`.setProject`/`.setKey`

### 17. Fix: Permission Baris di Auto-Create Wallet
**`17d5241`** 07:57 — `fix: tambah Permission.read di auto-create wallet calculate-campaign-reward`

Wallets collection punya `rowSecurity=true`. `findOrCreateWallet` membuat
dokumen wallet baru tanpa `Permission.read` — baris tercipta tapi
tidak akan terbaca pemiliknya. Gagal senyap tanpa error.

Files:
- `00_BACKEND/functions/calculate-campaign-reward/src/main.js` — `[Permission.read(Role.user(userId))]`

### 18. Fix: Hapus Collection-Level Read Users
**`c222063`** 07:57 — `fix: hapus collection-level read users dari wallets & transactions`

Permission `read("users")` di level collection membuka semua baris ke
semua user auth. Wallets & transactions sudah pakai `rowSecurity=true`
dengan permission per-baris — collection-level `read("users")` redudan
dan melanggar isolasi data.

Files:
- `00_BACKEND/appwrite.config.json` — hapus `"read(\"users\")"` dari `wallets` & `transactions`

### 19. Fix: Platform Fee 0.15→0.02 di Dashboard UMKM
**`c649de7`** 07:57 — `fix: koreksi platform fee 0.15→0.02 di create-campaign utils`

Platform fee kanon sudah 2% sejak `2ab8113` di backend. Frontend masih
pakai `0.15` (15%) — mismatch menyebabkan perhitungan budget tidak akurat
di UI dashboard UMKM.

Files:
- `src/components/features/umkm-dashboard/create-campaign/create-campaign.utils.ts` — `0.15 → 0.02`

### 20. Feature: Sync Function Scopes
**`c5467ec`** 07:57 — `feat: tambah script sync function scopes ke Appwrite`

Script `sync-scopes.ts` membaca mapping scope dari `function-scopes.json`,
membandingkan dengan scope existing di Appwrite, lalu update yang berbeda.
Jalan dengan `npx tsx appwrite/sync-scopes.ts` + 3 env var.

23 function tercakup:
- 16 function read-write: `databases.read`, `databases.write`
- 2 function read-write + users: `get-creator-profile`, `get-umkm-profile`
- 2 function read-only: `get-creator-directory`, `get-creator-negotiations`
- 1 function read-write + files: `validate-and-upload`
- 1 function read-write + files + storage: `delete-file`
- 1 function read-write + messages: `send-chat-notification`

Files:
- `00_BACKEND/appwrite/function-scopes.json` — new, mapping 23 function → scopes
- `00_BACKEND/appwrite/sync-scopes.ts` — new, script sync via Appwrite Functions API

### 21. Chore: DevDependencies untuk Sync Script
**`d178521`** 07:57 — `chore: tambah node-appwrite + tsx ke devDependencies`

`node-appwrite` (SDK v14) dibutuhkan `sync-scopes.ts` untuk panggil
Appwrite Functions API. `tsx` dibutuhkan untuk jalankan script TypeScript
tanpa kompilasi manual.

Files:
- `00_BACKEND/package.json` — `+ node-appwrite ^14.1.0`, `+ tsx ^4.19.0`
- `00_BACKEND/package-lock.json` — 540+ lines deps baru

---

## Ringkasan Perubahan MVP

| Area | Status | Keterangan |
|---|---|---|
| Appwrite CLI | ✅ Migrated v22 | `appwrite.config.json`, generator `.cjs`, push-columns fallback |
| Withdrawal | ✅ Auto-processed | Tanpa review admin, langsung `processed` |
| Chat | ✅ Attachment removed | Hanya `text/offer/system`, read receipt siap |
| Storage | ⏸️ DORMANT | `user_files`/`user_storage_usage` tidak aktif, kode siap diaktifkan |
| Docs | ✅ Synced | 30+ file dokumentasi sinkron dengan kode |
| Tests | ✅ 121/121 pass | Unit, integration, e2e |
| Functions | ✅ 23 functions | 16 asal + 4 DTO UMKM (Sprint 1) + 3 DTO Kreator (Sprint 2), semua node-22 |

---

## 2026-07-24 — Security & Data Integrity Investigation (6 items)

> Investigasi menyeluruh dari dokumen handoff Sprint 2 + audit skema Appwrite. Temuan utama:

| # | Item | Temuan | Tindakan / Status |
|---|------|--------|-------------------|
| 1 | Notifikasi lama backfill | 0 baris — frontend masih mock, notifikasi belum pernah ditulis | Skip (tidak perlu backfill) |
| 2 | `$permissions` `wallets` & `transactions` | **KRITIS** — collection-level `read("users")` membuka semua baris ke semua user login. Sudah **di-fix** di config (`c222063`), row-level permission sudah pasang di 5 penulis utama. Perlu **deploy** `appwrite.config.json` ke Appwrite. |
| 3 | `transactions.status = "completed"` | Sengaja — frontend (`TransactionStatus` di `domain.ts:77`) sudah handle nilai ini. Aman. |
| 4 | `fesyen` → `fashion` backfill | Enum `creator_profiles.niche` sudah `fashion`. `campaigns.category` string bebas tapi **0 data** `fesyen` di DB. Skip. |
| 5 | Scope API key `users.read` | `get-creator-profile` & `get-umkm-profile` pakai `users.get().catch(() => null)` — graceful degradation. Cek Console Appwrite: API key kedua function **harus** punya scope `users.read` agar nama user dari Auth terbaca (fallback `displayName` dari collection). |
| 6 | Fee rate 2% UI | Seller-side (backend + domain.ts) sudah 2% sejak `2ab8113`. Buyer-side `create-campaign.utils.ts` sudah fix `0.15→0.02` di `c649de7`. Seluruh stack seragam 2%. |

**Next step prioritas**: Deploy `appwrite.config.json` (hapus `read("users")` dari `wallets` & `transactions`) + set scope `users.read` di Console untuk 2 function profile.
