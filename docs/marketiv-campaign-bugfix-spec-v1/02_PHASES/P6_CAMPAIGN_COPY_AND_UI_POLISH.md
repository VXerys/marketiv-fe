# P6 — Campaign Copy & Focused UI Polish

**Trello:** stale reviewer copy + `[POLISH-CAMPAIGN]`

## Objective

Clean authority wording and polish only Campaign surfaces already touched by blocker work.

## Inspect first

- `00_BACKEND/functions/review-submission/src/main.js`
- changed Admin surfaces from P1/P2/P5
- `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx`
- UMKM Campaign detail/submission components
- existing Marketiv shared dashboard components/tokens

## Required copy fix

Change the rejection fallback that currently says:

`Bukti kerja Anda ditolak oleh UMKM...`

to Marketiv/Admin-neutral wording, for example:

`Bukti kerja Anda ditolak setelah validasi Marketiv. Periksa catatan review.`

Also update stale comments/header wording in the same Function if they now incorrectly describe UMKM as reviewer. Do not change business logic.

## Search for stale Campaign authority wording

Use focused `rg`, not a repository-wide copy rewrite.

Look for terms such as:

- `ditolak oleh UMKM`
- UMKM + `approve`
- UMKM + `reject`
- UMKM + `verifikasi views`
- `Periksa Bukti`
- stale “automatic” claims where Admin locks views manually.

Every remaining match must be historical/documentation or semantically valid.

## Focused UI polish

### Creator Campaign

- clear hierarchy for claimed → pending → approved/rejected;
- Unclaim remains secondary to submit;
- mutation loading/error text fits mobile;
- no wording that implies reward already paid merely because submission is approved.

### UMKM Campaign

- submission remains read-only;
- no approve/reject/final-views input;
- pending result uses “Menunggu Validasi Marketiv” semantics;
- loading/empty/error states clear.

### Admin

- explicit load errors and retry;
- no false success;
- validation modal remains usable at 375px;
- success and refresh-warning semantics from P1 remain clear.

## Constraints

- No visual redesign unrelated to Campaign.
- No Rate Card.
- Use existing tokens/primitives; no new design library.
- No generated fake metrics.

## Verification

- responsive manual check at 375 / 390 / 768 / desktop where available;
- focused stale-copy `rg`;
- lint/typecheck/build.

## Done when

All active Campaign surfaces communicate the same Creator → Admin → UMKM observer authority model.
