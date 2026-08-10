# 01 — Findings Registry

Format: `ID — severity / priority`.

## UMKM-SEC-01 — C / P0 — Order client-mutable
Source:
- `00_BACKEND/functions/create-order/src/main.js`
- `00_BACKEND/functions/release-escrow/src/main.js`

Problem: `orders` memberi participant `Permission.update`; field `creatorId`, `umkmId`, `amount`, `status`, `offerId` dipakai backend sebagai authority.

Fix:
- participant read-only;
- transition via Function;
- participant/amount/offer immutable;
- backend enforce role + ownership + valid transition.

Acceptance:
- direct SDK update order dari UMKM/kreator ditolak;
- Rate Card flow tetap jalan;
- payout recipient tidak client-controlled.

---
## UMKM-SEC-03 — H / P0 — Backend role enforcement
Source:
- `create-conversation/src/main.js`
- `create-offer/src/main.js`

Problem: UMKM-only path belum konsisten check `users.role === "umkm"`.

Fix: shared `requireActiveRole` + ownership.

Acceptance: wrong role/suspended ditolak; UMKM owner sukses.

---
## UMKM-SEC-04 — H / P0 — Conversation/message broad update
Source:
- `create-conversation/src/main.js`
- `send-message/src/main.js`
- `src/services/shared/conversation-appwrite.service.ts`

Problem: participant dapat update whole conversation/message document.

Fix:
- participant IDs, sender, content immutable;
- archive/read receipt via Function atau per-user state.

Acceptance: direct edit content/sender/participant ditolak; archive/unread tetap bekerja.

---
## UMKM-FIN-01 — H / P0 — Escrow release split-brain
Source: `00_BACKEND/functions/release-escrow/src/main.js`

Problem: escrow menjadi `released` sebelum wallet/ledger selesai; retry normal tidak recover jika gagal di tengah.

Fix:
- recoverable state/saga;
- deterministic settlement + ledger;
- reconciliation.

Acceptance:
`released => wallet credited exactly once + release ledger exists`.

---
## UMKM-OPS-01 — C / P0 — Campaign patch Function live vars
Source:
- `00_BACKEND/audit/2026-08-09-function-env-live-audit.md`
- `patch-campaign-draft/src/main.js`
- `patch-campaign-status/src/main.js`

Problem: snapshot 2026-08-09 mencatat 0 live env vars pada kedua Function.

Fix: sync env + activate correct deployment + smoke test.

Acceptance: edit/publish/pause/resume sukses di staging dan execution ID disimpan.

---
## UMKM-SEC-02 — H / P1 — Draft campaign public
Source:
- `src/services/umkm/umkm-appwrite.service.ts`
- `00_BACKEND/appwrite/ops/harden-permissions.mjs`

Problem: draft campaign/brief/asset memakai `read(any)`.

Fix: draft owner-only; grant audience read saat publish; child docs ikut lifecycle.

Acceptance: anonymous/other user tidak bisa baca draft; published tetap terbaca audience valid.

---
## UMKM-FIN-02 — H / P1 — Campaign funding mismatch
Source:
- `patch-campaign-draft/src/main.js`
- `patch-campaign-status/src/main.js`
- campaign payment/escrow Functions

Problem: budget dapat berubah setelah funding; publish guard hanya `remainingBudget > 0`.

Fix: lock financial fields atau dedicated rebudget/top-up; publish require funded >= target.

Acceptance: campaign tidak publish bila funding kurang dari target.

---
## UMKM-CAM-01 — H / P1 — Rejected submission quota
Source:
- `review-submission/src/main.js`
- `src/services/umkm/umkm-appwrite.service.ts`

Problem: server reject tidak restore quota; client decrement dapat gagal lalu error ditelan.

Fix: server-side idempotent quota restore.

Acceptance: 1 rejection = tepat 1 slot kembali; retry tidak double-decrement.

---
## UMKM-FIN-03 — H / P1 — Pending campaign payment total
Source:
- `PendingPaymentModal.tsx`
- transaction mapper/service
- campaign payment Function

Problem: UI memakai base `amount` sebagai total; campaign gateway menagih `amount + fee_amount`.

Fix DTO: `baseAmount`, `feeAmount`, `totalAmount`, `purpose`.

Acceptance: campaign tampil base + 2% fee; Rate Card tetap seller-side.

---
## UMKM-LEGAL-01 — H / P1 — UMKM guide wrong domain/fee
Source:
- `src/app/dashboard/umkm/panduan/page.tsx`
- `src/types/domain.ts`

Problem: UMKM route berisi Creator T&C + fee 20%; current code fee 2%.

Fix: split audience, version content, align approved current fee.

Acceptance: UMKM guide hanya UMKM rules/current fee.

---
## UMKM-PERF-01 — M / P2 — Campaign N+1
Problem: submission count request per campaign.
Fix: backend aggregate counts.
Acceptance: no 1-request-per-campaign pattern.

## UMKM-UX-01 — M / P2 — Payment confirmation unreachable
Source: `CreateCampaignWizard.tsx`.
Fix: step 5 -> open confirm modal -> confirm -> payment.

## UMKM-DATA-01 — M / P2 — Creator directory max 100
Source: creator directory Function + `CreatorSummaryCards.tsx`.
Fix: `items + total + nextCursor`.

## UMKM-DATA-02 — M / P2 — Partial failure shown empty
Area: creator detail, finance, analytics.
Fix: section-level error; request failure != empty data.

## UMKM-DATA-03 — M / P2 — Aggregate cap 5000
Source: UMKM dashboard/finance summary Functions.
Fix short-term: return `truncated`; long-term aggregate/materialized data.

## UMKM-NOTIF-01 — M / P2 — Notifications first 100 only
Source: `NotificationView.tsx`, notification service.
Fix: cursor pagination + batch mark-read Function.

## UMKM-SET-01 — M / P2 — Hardcoded verified badge
Source: `DashboardSidebar.tsx`, `PengaturanClient.tsx`.
Fix: explicit backend verification state.

## UMKM-SET-02 — M / P2 — WhatsApp not hydrated
Source: `PengaturanClient.tsx`.
Fix: safe account DTO includes phone.

## UMKM-FILE-01 — M / P2 — Public SVG upload
Source: `src/lib/appwrite/storage.ts`.
Fix beta: raster-only; or server sanitize/MIME/content validation.

## UMKM-PRIV-01 — M / P2 — `umkm_profiles read(any)`
Source: `00_BACKEND/appwrite.config.json`.
Fix: public projection; private owner fields separate.

## UMKM-SUP-01 — L / P2 — Dead support link
Source: `DashboardSidebar.tsx`.
Fix: real support route/contact.

## UMKM-PROC-01 — INFO / P3 — No SECURITY.md
Fix: document auth/payment/storage invariants + required security tests.
