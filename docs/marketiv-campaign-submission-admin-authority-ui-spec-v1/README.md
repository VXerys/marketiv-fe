# Marketiv Campaign Submission — Admin Validation Authority UI Spec v1

**Status:** Proposed / UI-first / backend wiring deferred  
**Prepared:** 2026-08-14  
**Primary repository:** `marketiv-id/marketiv-web` (`staging`)  
**Audit baseline:** `48661d1b042cd075f518b82d65194d292b699379`  
**Admin concept repository:** `VXerys/admin-dashboard-marketiv` (`main`)  
**Admin baseline:** `7cb60e9d019922a8f42255bc9f39e81836b16549`

## Objective

Paket ini mengunci perubahan konsep Campaign submission Marketiv dari model lama:

`Creator submit → UMKM review/approve/reject`

menjadi model target:

`Creator submit → Marketiv/Admin validate → UMKM observe → backend calculate reward`

Fokus implementasi tahap ini adalah **slicing UI dan konsistensi source-of-truth documentation**. Perubahan authorization Appwrite Function, admin role guard, audit log, dan wiring backend **sengaja ditunda** dan dipisahkan dalam kontrak backend agar tahap berikutnya dapat dilakukan plug-and-play tanpa mendesain ulang UI.

## Non-negotiable Product Rules

1. **Creator** adalah satu-satunya user-facing actor yang mengirim bukti tayang untuk claim miliknya.
2. **Admin Marketiv** adalah authority yang memvalidasi submission, mengunci jumlah views, dan mengambil keputusan `approved` / `rejected`.
3. **UMKM** bersifat **read-only observer** terhadap submission campaign miliknya. UMKM tidak mendapat CTA approve, reject, input views, atau keputusan payout.
4. **AI fraud precheck** adalah risk signal (`safe | review | rejected`), bukan authority keputusan final submission pada UI target ini.
5. Semua mutation sensitif harus melalui trusted backend/Appwrite Function. UI tidak boleh menulis status, views final, payout, wallet, atau transaksi secara langsung.
6. Status database tetap mengikuti enum aktual repository: submission `pending | approved | rejected`; fraud `safe | review | rejected`.
7. Platform submit harus berasal dari campaign, bukan dipilih bebas oleh Creator. **MVP product contract saat ini TikTok**; komponen dibuat data-driven agar multi-platform dapat ditambahkan tanpa redesign.
8. UI tidak boleh menyebut reward **“cair/dibayarkan”** jika sumber data hanya submission approval. Gunakan istilah `Reward terhitung/tervalidasi` sampai state finansial authoritative tersedia.

## Source Hierarchy Used

1. Current code in `marketiv-web@staging` for implementation facts.
2. `00_BACKEND/docs` because its README explicitly declares it the project single source of truth.
3. Newer supporting feature docs under `docs/marketiv-md` where they agree with current product direction.
4. `admin-dashboard-marketiv` only as admin information-architecture / UI-flow reference; its mock/fallback/data assumptions are not authoritative.

## Package Structure

```text
00_AUDIT/
  current-state-findings.md
  affected-files-matrix.md
  source-conflicts.md

01_SPEC/
  requirements.md
  design.md
  tasks.md
  acceptance-test-matrix.md

02_SOT_PATCHES/
  README.md
  00_BACKEND/docs/02_Modules/Campaigns/...
  00_BACKEND/docs/03_Workflows/...
  00_BACKEND/docs/04_Decisions/...

03_LEGACY_RECONCILIATION/
  marketiv-md-reconciliation.md

04_DEFERRED_BE_WIRING/
  backend-wiring-contract.md

05_AGENT_EXECUTION_PROMPT/
  codex-ui-slicing-prompt.md
```

## Recommended Execution Order

1. Review `00_AUDIT/current-state-findings.md`.
2. Approve the product contract in `01_SPEC/requirements.md`.
3. Apply SOT documentation changes first.
4. Execute UI tasks only through Task Group U0–U6.
5. Run verification gates.
6. Stop before `[DEFERRED-BE]` tasks.
7. Once backend team is ready, use `04_DEFERRED_BE_WIRING/backend-wiring-contract.md` as handoff contract.

## Definition of Done for UI Phase

The UI phase is done only when:

- Creator can understand submit → Marketiv validation without any UMKM-review copy.
- UMKM campaign detail has zero approve/reject/views-input mutation surface.
- Pending/approved/rejected states render consistently on Creator and UMKM.
- Platform is derived from campaign instead of arbitrary Creator selection.
- Reward copy does not imply payout before finance truth exists.
- `ReviewSubmissionModal` is no longer reachable from UMKM UI.
- No backend Function behavior is changed in this phase.
- build/typecheck/tests pass.
- repository search no longer finds active UI copy stating UMKM verifies/approves Campaign submissions.
