# Implementation Plan

## Task Overview

This task plan refines the existing Marketiv UMKM and Konten Kreator dashboard UI using the UI kit source of truth:

```txt
docs/design-system/marketiv-studio-system-v5-8.html
```

The dashboard UI and flows are assumed to be mostly sliced already. This plan focuses on audit, consistency, responsive behavior, component normalization, state coverage, and final QA.

---

## Phase 1 — Audit and Baseline

- [ ] 1. Create dashboard UI audit matrix
  - Create a route-by-route audit table for UMKM and Kreator dashboards.
  - Include route, breakpoint, issue, severity, affected component, expected fix, and status.
  - Use `docs/design-system/marketiv-studio-system-v5-8.html` as the visual reference.
  - _Requirements: 1.1, 3.1, 9.1, 9.6_

- [ ] 1.1 Audit UMKM dashboard routes
  - Check `/dashboard/umkm`.
  - Check `/dashboard/umkm/campaign`.
  - Check `/dashboard/umkm/campaign/buat`.
  - Check `/dashboard/umkm/campaign/[id]` with valid and invalid IDs.
  - Check `/dashboard/umkm/kreator`.
  - Check `/dashboard/umkm/kreator/[id]` with valid and invalid IDs.
  - Check `/dashboard/umkm/negosiasi`.
  - Check `/dashboard/umkm/negosiasi/[id_order]` with valid and invalid IDs.
  - Check `/dashboard/umkm/keuangan`.
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 1.2 Audit Konten Kreator dashboard routes
  - Check `/dashboard/kreator`.
  - Check `/dashboard/kreator/job-pool`.
  - Check `/dashboard/kreator/job-pool/[id]` with valid and invalid IDs.
  - Check `/dashboard/kreator/pekerjaan-aktif`.
  - Check `/dashboard/kreator/pekerjaan-aktif/[id]` with valid and invalid IDs.
  - Check `/dashboard/kreator/negosiasi`.
  - Check `/dashboard/kreator/negosiasi/[id_order]` with valid and invalid IDs.
  - Check `/dashboard/kreator/profil`.
  - Check `/dashboard/kreator/rate-card`.
  - Check `/dashboard/kreator/keuangan`.
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 1.3 Audit responsive breakpoints
  - Check each route at 375px, 430px, 768px, 1024px, 1280px, and 1440px.
  - Record horizontal scroll, card overflow, toolbar overflow, modal overflow, and broken grids.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 1.4 Audit domain rule violations
  - Search Campaign Mode pages for chat/contact/WhatsApp/direct message/comment/final upload actions.
  - Search Rate Card Mode pages for missing Collab Post warning.
  - Record violations before fixing.
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

---

## Phase 2 — Design Token and Global Visual Normalization

- [ ] 2. Normalize dashboard color tokens
  - Map UI kit colors to project CSS variables or Tailwind tokens.
  - Ensure warm paper background, orange primary, navy emphasis, and semantic tones are available.
  - Avoid random gray or unrelated color usage in dashboard surfaces.
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2.1 Normalize dashboard background
  - Apply a consistent warm dashboard background based on the UI kit.
  - Ensure both UMKM and Kreator dashboards share the same visual atmosphere.
  - Avoid per-page background inconsistency.
  - _Requirements: 1.1, 1.2_

- [ ] 2.2 Normalize typography hierarchy
  - Ensure page titles, section titles, card titles, metadata, and metric values follow consistent size/weight hierarchy.
  - Preserve readable Indonesian dashboard copy.
  - _Requirements: 8.1, 8.4, 8.5_

- [ ] 2.3 Normalize spacing rhythm
  - Align page padding, section gaps, card gaps, toolbar gaps, and inner card padding.
  - Fix pages that feel too cramped or too empty.
  - _Requirements: 1.7, 4.6_

---

## Phase 3 — Shared Primitive Normalization

- [ ] 3. Audit existing dashboard primitives
  - Locate current shared dashboard primitives such as card, badge, button, metric card, progress, action menu, and responsive row.
  - Identify duplicate or page-specific variants that should be consolidated.
  - _Requirements: 2.1, 2.8, 2.9_

- [ ] 3.1 Normalize DashboardCard
  - Ensure card radius, border, shadow, surface, spacing, and overflow behavior match UI kit direction.
  - Add variants only if needed: default, featured, subtle, warning, danger, dark.
  - _Requirements: 2.1, 4.6, 4.7_

- [ ] 3.2 Normalize DashboardMetricCard
  - Ensure metric cards support icon, label, value, note, trend/status badge, and compact formatting.
  - Ensure metric grid works with 2–3–4 responsive rule.
  - _Requirements: 2.2, 3.6_

- [ ] 3.3 Normalize DashboardBadge
  - Ensure semantic tones are consistent: gray, orange, green, yellow, red, blue, navy, purple.
  - Ensure badges do not overflow and remain readable on mobile.
  - _Requirements: 2.3, 4.7_

- [ ] 3.4 Normalize DashboardButton
  - Ensure primary, secondary, outline, ghost/subtle, danger, icon, and full-width mobile behavior.
  - Replace inconsistent manual buttons in dashboard pages.
  - _Requirements: 2.4, 7.4, 7.5_

- [ ] 3.5 Normalize DashboardProgress
  - Ensure progress bars share consistent height, radius, background, tone, and label behavior.
  - Use it for quota, campaign progress, validation progress, and earning progress where relevant.
  - _Requirements: 2.5, 4.3_

- [ ] 3.6 Normalize responsive row/table primitives
  - Ensure desktop row layout transforms safely on mobile.
  - Fix tables that overflow at 375px.
  - _Requirements: 2.6, 3.7_

---

## Phase 4 — Card System Refinement

- [ ] 4. Refine campaign cards
  - Align campaign cards with UI kit marketplace card anatomy: identity, value, trust/status, availability, and CTA.
  - Fix title, badge, budget, quota, progress, and CTA layout on mobile.
  - _Requirements: 4.1, 4.6, 4.7, 4.8_

- [ ] 4.1 Refine creator cards
  - Align creator cards with avatar/profile, niche, trust signal, starting price/rate, portfolio preview, and CTA.
  - Ensure cards are balanced in grid and safe on mobile.
  - _Requirements: 4.2, 4.6, 4.7, 4.8_

- [ ] 4.2 Refine job pool cards
  - Align job cards with campaign title, UMKM, reward per views, escrow/budget, quota, deadline, and CTA.
  - Enforce no chat/contact actions in Job Pool.
  - _Requirements: 4.3, 6.1_

- [ ] 4.3 Refine order and negotiation cards
  - Align order cards with package, scope, deadline, price, escrow/payment status, and CTA.
  - Ensure Rate Card order cards do not appear as Campaign Mode cards.
  - _Requirements: 4.4, 6.4_

- [ ] 4.4 Refine finance cards
  - Ensure currency formatting is compact in summary cards and full in detail cards.
  - Prevent currency overflow on mobile.
  - _Requirements: 4.5, 4.7_

- [ ] 4.5 Refine dashboard overview cards
  - Ensure UMKM and Kreator overview pages use consistent metric card shapes and responsive grid.
  - Ensure quick action cards use consistent CTA and icon style.
  - _Requirements: 1.5, 2.2, 3.6_

---

## Phase 5 — Responsive Layout Fixes

- [ ] 5. Fix 375px mobile overflow globally
  - Remove horizontal overflow from all dashboard routes.
  - Add `min-w-0`, `overflow-hidden`, `truncate`, `line-clamp`, and responsive stacking where needed.
  - _Requirements: 3.1, 4.7_

- [ ] 5.1 Fix mobile toolbars
  - Stack, wrap, or convert toolbar filters to safe mobile layout.
  - Ensure reset filter remains accessible.
  - _Requirements: 3.9, 9.3_

- [ ] 5.2 Fix mobile card CTAs
  - Stack multiple buttons vertically or make them full-width on mobile.
  - Ensure icon actions remain reachable and labeled.
  - _Requirements: 4.8, 7.5_

- [ ] 5.3 Fix tablet layouts
  - Audit and adjust 768px layouts where grids are too cramped or visually unbalanced.
  - _Requirements: 3.3_

- [ ] 5.4 Fix desktop whitespace
  - Audit 1024px–1440px layouts for excessive empty space or cramped sidebar layouts.
  - _Requirements: 3.4, 3.5_

- [ ] 5.5 Fix detail page main/sidebar grids
  - Use safe 1-column mobile, 2-column desktop layout.
  - Ensure sidebar stacks below main content on mobile/tablet where needed.
  - _Requirements: 3.8, 4.6_

---

## Phase 6 — Screen States and Modal QA

- [ ] 6. Add or normalize loading skeletons
  - Ensure every data-driven page has shimmer/skeleton matching final layout.
  - Avoid generic full-page spinner as primary loading state.
  - _Requirements: 5.1_

- [ ] 6.1 Add or normalize empty states
  - Ensure list pages show helpful empty state with CTA.
  - Use consistent state card styling from UI kit.
  - _Requirements: 5.2_

- [ ] 6.2 Add or normalize filtered empty states
  - Ensure search/filter pages show reset filter CTA when no filtered results exist.
  - _Requirements: 5.3, 9.3_

- [ ] 6.3 Add or normalize error states
  - Ensure error states provide retry CTA and actionable copy.
  - _Requirements: 5.4, 8.3_

- [ ] 6.4 Add or normalize not-found states
  - Ensure detail pages handle invalid campaign, creator, job, work, order, and transaction IDs.
  - _Requirements: 5.5, 9.4_

- [ ] 6.5 Fix modal consistency
  - Ensure every modal has title, description, primary action, secondary action, close behavior, and mobile-safe layout.
  - Replace browser alert with custom confirmation modal.
  - _Requirements: 7.1, 7.2, 5.7_

- [ ] 6.6 Fix success feedback
  - Ensure dummy claim, submit, payment, withdrawal, save, and delete actions show consistent success feedback.
  - _Requirements: 5.6, 7.3_

---

## Phase 7 — Domain Rule Enforcement

- [ ] 7. Remove forbidden Campaign Mode actions
  - Remove or hide chat, WhatsApp, contact, direct message, comments, and final video upload from Campaign Mode pages.
  - _Requirements: 6.1_

- [ ] 7.1 Validate proof submission flow
  - Ensure creator proof submission only accepts public TikTok/Instagram URL in dummy validation.
  - Ensure no final video upload UI appears.
  - _Requirements: 6.2_

- [ ] 7.2 Validate external asset handling
  - Ensure large campaign assets are represented as Google Drive/Dropbox external URLs.
  - _Requirements: 6.3_

- [ ] 7.3 Validate Rate Card chat boundaries
  - Ensure chat/custom offer UI appears only in Rate Card negotiation pages.
  - _Requirements: 6.4_

- [ ] 7.4 Add Collab Post warning in Rate Card rooms
  - Ensure UMKM and Kreator negotiation room detail pages show Collab Post warning.
  - _Requirements: 6.5_

- [ ] 7.5 Label finance/payment as simulation
  - Ensure payment, escrow, top-up, and withdrawal UI clearly communicates dummy/simulation state in this phase.
  - _Requirements: 6.6_

---

## Phase 8 — Route Flow Testing

- [ ] 8. Test UMKM primary flows
  - Overview to create campaign.
  - Campaign list to detail.
  - Campaign wizard through review/payment simulation.
  - Kreator directory to creator profile.
  - Creator profile to negotiation.
  - Negotiation list to room.
  - Keuangan to top-up/payment simulation.
  - _Requirements: 7.4, 9.1_

- [ ] 8.1 Test Kreator primary flows
  - Overview to Job Pool.
  - Job Pool to detail.
  - Job detail to claim modal and success.
  - Active work to submit proof.
  - Submit proof validation and success.
  - Negotiation list to room.
  - Profile save and portfolio modals.
  - Rate Card create/edit/delete/toggle.
  - Finance withdrawal simulation.
  - _Requirements: 7.4, 9.1_

- [ ] 8.2 Test filter/search flows
  - Validate search, filter, sort, reset behavior on all relevant list pages.
  - Validate filtered empty state.
  - _Requirements: 5.3, 9.3_

- [ ] 8.3 Test modal flows
  - Open, close, confirm, cancel, and success states for all dashboard modals.
  - Check at 375px and 768px.
  - _Requirements: 7.1, 7.2, 9.5_

---

## Phase 9 — Accessibility and Copy Pass

- [ ] 9. Add missing accessibility labels
  - Add `aria-label` to icon-only buttons.
  - Ensure external links use safe attributes.
  - _Requirements: 7.5, 7.6_

- [ ] 9.1 Normalize dashboard status labels
  - Ensure Indonesian status labels are consistent across pages.
  - Normalize badge tone mapping.
  - _Requirements: 8.5_

- [ ] 9.2 Improve finance and escrow copy
  - Explain escrow safely and clearly for UMKM and Kreator.
  - Avoid technical copy without explanation.
  - _Requirements: 8.1_

- [ ] 9.3 Improve AI helper copy
  - Ensure AI copy positions AI as assistant/draft support.
  - _Requirements: 8.2_

- [ ] 9.4 Improve error copy
  - Make error messages actionable.
  - _Requirements: 8.3_

- [ ] 9.5 Improve CTA labels
  - Replace vague labels with specific actions such as “Lanjut ke Pembayaran Escrow”, “Submit Bukti Tayang”, “Buat Paket Rate Card”, and “Klaim Job Ini”.
  - _Requirements: 8.4_

---

## Phase 10 — Final Build and Regression

- [ ] 10. Run build
  - Run `npm run build`.
  - Fix build errors.
  - _Requirements: 9.7_

- [ ] 10.1 Run lint/typecheck if available
  - Run `npm run lint` if available.
  - Run `npm run typecheck` if available.
  - Document missing scripts if not available.
  - _Requirements: 9.8_

- [ ] 10.2 Final responsive screenshot pass
  - Recheck high-risk routes at 375px, 768px, and 1280px.
  - Confirm no horizontal overflow.
  - _Requirements: 3.1, 9.2_

- [ ] 10.3 Final domain rule pass
  - Confirm Campaign Mode remains zero-chat.
  - Confirm Rate Card Mode contains chat/custom offer only in negotiation routes.
  - Confirm Collab Post warnings exist.
  - _Requirements: 6.1, 6.4, 6.5_

- [ ] 10.4 Document backend TODOs
  - Create or update TODO notes for Appwrite, Midtrans, AI, realtime chat, and validation integration.
  - Do not implement backend in this spec.
  - _Requirements: 10.5_

- [ ] 10.5 Final report
  - Summarize files changed.
  - Summarize routes verified.
  - Summarize responsive fixes.
  - Summarize remaining known issues.
  - Summarize build/lint/typecheck result.
  - _Requirements: 9.7, 9.8, 10.1_
