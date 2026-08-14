# Tasks — Campaign Submission Admin Authority UI

> **Execution mode:** UI-first. Do not execute `[DEFERRED-BE]` tasks in the same change set.

## Scope Gates

Before starting:

- [ ] Confirm working branch is based on `marketiv-web/staging`.
- [ ] Do not refactor unrelated Campaign/Rate Card architecture.
- [ ] Do not change Appwrite schema or Function authorization.
- [ ] Do not add a new package/library unless absolutely required (none is expected).
- [ ] Keep `submitProof()` public UI contract stable.

---

## U0 — Update Source of Truth First

- [ ] **U0.1** Add `ADR-010 — Campaign Submission Validation Authority = Admin Marketiv`.
  - Requirements: R-01, R-15.
- [ ] **U0.2** Update Campaign overview/business/user-flow docs so UMKM is observer and Admin is validator.
  - Requirements: R-01, R-15.
- [ ] **U0.3** Rewrite views-tracking doc from “manual UMKM” to “manual Admin Marketiv”.
  - Requirements: R-11, R-15.
- [ ] **U0.4** Rewrite fraud workflow to advisory precheck + Admin final decision.
  - Requirements: R-10, R-15.
- [ ] **U0.5** Mark `96_Views_Sprint_Plan.md` superseded.
  - Requirements: R-15.

Verification:

```bash
rg -n "UMKM.*(approve|reject|verifikasi|validasi|memverifikasi|menyetujui)" 00_BACKEND/docs/02_Modules/Campaigns 00_BACKEND/docs/03_Workflows
```

Every remaining match must be intentionally historical or unrelated.

---

## U1 — Creator Submission UI Slicing

**Primary file:** `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx`

- [ ] **U1.1** Replace Creator platform selector with read-only platform context derived from `work/campaign`.
  - Do not silently default if platform cannot be resolved.
  - Requirements: R-03.
- [ ] **U1.2** Preserve URL input and optional note; rename note actor to Marketiv.
  - Requirements: R-02, R-04.
- [ ] **U1.3** Change main CTA to `Kirim untuk Diverifikasi`.
  - Requirements: R-02.
- [ ] **U1.4** Keep confirmation modal with exact URL and campaign platform.
  - Requirements: R-02, R-04.
- [ ] **U1.5** Update success message to a single canonical Admin/Marketiv validation message.
  - Requirements: R-02, R-05.
- [ ] **U1.6** Replace all copy claiming UMKM verifies/inputs views.
  - Requirements: R-05, R-06.
- [ ] **U1.7** Change submitted reward/views presentation:
  - pending views → `Belum diverifikasi`;
  - pending reward → `Belum dihitung`;
  - remove `Total Reward Cair` from pending/approval-only semantics.
  - Requirements: R-05, R-11.
- [ ] **U1.8** Update timeline to `Campaign Diklaim → Bukti Tayang Dikirim → Verifikasi Marketiv → Hasil Validasi`.
  - Requirements: R-06.
- [ ] **U1.9** Keep fraud status separate from final submission status.
  - Requirements: R-10.

No backend mutation changes in this task.

---

## U2 — Creator Read Adapter for Platform / Locked Views

**Files:**

- `src/services/creator/creator-appwrite.service.ts`
- `src/types/creator-dashboard.ts`

- [ ] **U2.1** Map pre-submit platform from campaign-owned platform data where available, with submission platform taking precedence only for existing submissions.
  - Requirements: R-03, R-14.
- [ ] **U2.2** Add optional locked-view metadata to Creator view model only if fields exist in current data/schema.
  - Requirements: R-11, R-12.
- [ ] **U2.3** Prefer `views_count` when `views_final=true`; maintain backward-compatible fallback for legacy rows.
  - Requirements: R-11, R-12.
- [ ] **U2.4** Add unit tests for mapping:
  - campaign TikTok + no submission → platform TikTok;
  - approved locked views → uses `views_count`;
  - legacy row → safe fallback;
  - unresolved platform → no fabricated value.

Do not add database fields in this task.

---

## U3 — Remove UMKM Review Authority from Campaign Detail

**File:** `src/components/features/umkm-dashboard/campaign/detail/CampaignDetailPage.tsx`

- [ ] **U3.1** Remove `reviewSubmission` import.
- [ ] **U3.2** Remove `SubmissionStatus` import if no longer needed.
- [ ] **U3.3** Remove `activeReviewSubmission` state.
- [ ] **U3.4** Remove `handleReviewConfirm` and its local optimistic status/reward path.
- [ ] **U3.5** Remove `ReviewSubmissionModal` import/mount.
- [ ] **U3.6** Stop passing `onReviewClick` into submission section.
- [ ] **U3.7** Rename quick-action callback from review semantics to view/scroll semantics.

Requirements: R-01, R-07, R-14.

---

## U4 — Convert UMKM Submission Components to Observer UX

### U4.1 `CampaignSubmissionSection.tsx`

- [ ] Remove `onReviewClick` prop.
- [ ] Keep filters `Semua / Menunggu Validasi / Disetujui / Ditolak`.
- [ ] Replace “Petunjuk Cara Memeriksa Konten” with three-step Marketiv validation explanation.
- [ ] Keep empty state informational, not action-oriented.

Requirements: R-07, R-09.

### U4.2 `CampaignSubmissionCard.tsx`

- [ ] Remove unused `onReviewClick` interface prop.
- [ ] Rename action `Detail Validasi` → `Lihat Detail`.
- [ ] Pending views = `Belum diverifikasi`.
- [ ] Rename `Dana Cair` to `Reward` / `Reward Terhitung` semantics.
- [ ] Pending reward = `—`.

Requirements: R-07, R-11.

### U4.3 `SubmissionDetailModal.tsx`

- [ ] Keep modal strictly read-only.
- [ ] Refine information hierarchy: identity → posting → validation result → note.
- [ ] Show validation time/source only when available.
- [ ] Rename `Dana Dibayarkan` to non-settlement wording unless financial source is authoritative.

Requirements: R-08, R-11, R-12.

### U4.4 Delete legacy modal

- [ ] Verify `ReviewSubmissionModal.tsx` has no remaining imports/references.
- [ ] Delete file.
- [ ] Verify `rg -n "ReviewSubmissionModal" src` returns no result.

Requirements: R-01.

---

## U5 — Update Supporting UMKM Campaign Cards/Copy

### `CampaignQuickActionsCard.tsx`

- [ ] Rename callback `onReviewPending` → `onViewSubmissions` (or equivalent).
- [ ] Primary label `Lihat Bukti Konten` / `Lihat Status Validasi`.

### `CampaignHealthChecklistCard.tsx`

- [ ] `Pemeriksaan Bukti Konten` → `Status Validasi Bukti Konten`.
- [ ] Pending copy → `N bukti sedang menunggu validasi Marketiv.`

### `CampaignOverviewCards.tsx`

- [ ] `Perlu Diperiksa` → `Menunggu Validasi`.
- [ ] helper → `Bukti diproses Marketiv`.

### `CampaignWorkspaceCard.tsx`

- [ ] Replace misleading `Data Otomatis` badge.
- [ ] Use `Data Kampanye` or `Data Tervalidasi` only when the latter is true.

### `CampaignActivityTimeline.tsx`

- [ ] Normalize validation copy to `Validasi Bukti Selesai` / Marketiv actor where actor is mentioned.

Requirements: R-09, R-11.

---

## U6 — UMKM Read Mapper / Type Semantics

**Files:**

- `src/types/umkm-dashboard.types.ts`
- `src/services/umkm/umkm-appwrite.service.ts`

- [ ] **U6.1** Replace stale comment `keputusan UMKM` with `hasil validasi submission` / Admin authority semantics.
- [ ] **U6.2** Prefer locked `views_count` when `views_final=true`.
- [ ] **U6.3** Remove Campaign creator fee deduction from frontend reward calculation. ADR-008 says Campaign reward is full Creator reward.
- [ ] **U6.4** Do not rename backend status unions or introduce new status values.
- [ ] **U6.5** Add tests for mapper locked views + full Campaign reward.

Requirements: R-10, R-11, R-14.

---

## U7 — UI Verification

- [ ] **U7.1** Run formatting/lint command used by repository.
- [ ] **U7.2** Run TypeScript/Next build.
- [ ] **U7.3** Run relevant unit tests.
- [ ] **U7.4** Manual responsive validation at 375, 390, 768, desktop.
- [ ] **U7.5** Verify Creator states: no submission / pending / approved / rejected.
- [ ] **U7.6** Verify UMKM states: empty / pending / approved / rejected.
- [ ] **U7.7** Search for stale product copy:

```bash
rg -n "UMKM.*(memverifikasi|verifikasi jumlah views|menyetujui bukti|approve submission|reject submission)" src/components/features/creator-dashboard src/components/features/umkm-dashboard/campaign
rg -n "Setujui Pembayaran|Tolak Konten|Keputusan Anda|Periksa Bukti Konten Baru|Perlu Diperiksa" src/components/features/umkm-dashboard/campaign
```

- [ ] **U7.8** Verify no direct Appwrite mutation was added to UI components.
- [ ] **U7.9** Record changed files and verification result.

---

# [DEFERRED-BE] B0 — Admin Backend Wiring

**Do not execute in UI change set.**

- [ ] Change `review-submission` authorization from campaign UMKM owner to active Admin role.
- [ ] Ensure Admin can securely list/read review queue without broad client write permissions.
- [ ] Write admin audit log with actor, before/after, views, decision, reason.
- [ ] Preserve atomic rejection quota restoration.
- [ ] Preserve locked views + reward event behavior.
- [ ] Update notifications to “Marketiv/Admin”, not “UMKM”.
- [ ] Remove fixture fallback in admin staging/production.
- [ ] Add authorization/security tests.
- [ ] Replace critical E2E placeholders with real Campaign scenario.

See `04_DEFERRED_BE_WIRING/backend-wiring-contract.md`.
