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

## Ringkasan Perubahan MVP

| Area | Status | Keterangan |
|---|---|---|
| Appwrite CLI | ✅ Migrated v22 | `appwrite.config.json`, generator `.cjs`, push-columns fallback |
| Withdrawal | ✅ Auto-processed | Tanpa review admin, langsung `processed` |
| Chat | ✅ Attachment removed | Hanya `text/offer/system`, read receipt siap |
| Storage | ⏸️ DORMANT | `user_files`/`user_storage_usage` tidak aktif, kode siap diaktifkan |
| Docs | ✅ Synced | 30+ file dokumentasi sinkron dengan kode |
| Tests | ✅ 121/121 pass | Unit, integration, e2e |
| Functions | ✅ 16 functions | 2 legacy dihapus, sisanya runtime node-22 |
