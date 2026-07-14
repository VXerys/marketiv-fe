# Dashboard UI System Audit

## Executive Summary

Phase 1 audited the existing UMKM and Konten Kreator dashboard implementation against the Marketiv Studio System v5.8 UI kit.

The dashboard work is already broadly sliced and route-complete. The strongest areas are route coverage, state coverage on many list/detail pages, and the existence of UMKM shared primitives. The main gap is system consistency: UMKM, Kreator, and the optimized UMKM overview currently use overlapping but different card, badge, button, metric, skeleton, shell, and state patterns.

This audit is documentation-only. No UI refactor, business logic change, backend integration, or route change was performed.

## Source of Truth

Primary design reference:

```txt
docs/design-system/marketiv-studio-system-v5-8.html
```

Spec execution contract:

```txt
.kiro/specs/dashboard-ui-system-refinement/requirements.md
.kiro/specs/dashboard-ui-system-refinement/design.md
.kiro/specs/dashboard-ui-system-refinement/tasks.md
```

Relevant UI kit standards extracted from v5.8:

- Warm paper app background using cream/white surfaces.
- Orange primary CTA and active state.
- Deep navy emphasis for sidebar, wallet, escrow, and high-trust surfaces.
- Large rounded cards, subtle borders, and soft low-opacity shadows.
- Semantic pill badges with readable tones.
- Dashboard metric grid rule: 2 columns mobile, 3 tablet, 4 desktop where content allows.
- Marketplace card anatomy: identity, value, trust/status, availability, CTA.
- Screen states for loading, empty, filtered empty, error, not found, and success.
- Mobile-first baseline at 375px with no horizontal overflow.
- Campaign Mode is zero-chat. Rate Card Mode may contain chat/custom offer and must show Collab Post warning.

## Audited Route List

### UMKM

- `/dashboard/umkm`
- `/dashboard/umkm/campaign`
- `/dashboard/umkm/campaign/buat`
- `/dashboard/umkm/campaign/[id]` implemented as `[campaignId]`
- `/dashboard/umkm/kreator`
- `/dashboard/umkm/kreator/[id]`
- `/dashboard/umkm/negosiasi`
- `/dashboard/umkm/negosiasi/[id_order]`
- `/dashboard/umkm/keuangan`

### Konten Kreator

- `/dashboard/kreator`
- `/dashboard/kreator/job-pool`
- `/dashboard/kreator/job-pool/[id]`
- `/dashboard/kreator/pekerjaan-aktif`
- `/dashboard/kreator/pekerjaan-aktif/[id]`
- `/dashboard/kreator/negosiasi`
- `/dashboard/kreator/negosiasi/[id_order]`
- `/dashboard/kreator/profil`
- `/dashboard/kreator/rate-card`
- `/dashboard/kreator/keuangan`

## Design System Gap Summary

### Background System

- Global tokens in `src/app/globals.css` already define warm surfaces (`--bg-main`, `--bg-section`, `--surface-card`) and orange/navy tokens.
- `DashboardShell` applies the warm dashboard wrapper and shared sidebar/topbar CSS.
- Some creator route content still relies heavily on raw `bg-white`, `bg-neutral-*`, and custom shadow classes instead of shared surface variants.
- Some UMKM feature pages use `bg-white/70 backdrop-blur-md` cards while the optimized UMKM overview uses `bento-card`; these feel related but not governed by one source-of-truth primitive.

### Card System

- UMKM feature pages have a richer primitive set in `src/components/features/umkm-dashboard/shared`.
- The optimized UMKM overview added a second `DashboardCard` in `src/components/features/dashboard`, creating two competing dashboard card concepts.
- Creator pages use `CreatorMetricCard`, `CreatorEmptyState`, `CreatorErrorState`, and many one-off cards with repeated Tailwind classes.
- Finance mobile transaction cards are a good responsive example. Campaign table mode still uses a desktop table with `min-w-[900px]`.

### Typography

- UI kit recommends a consistent hierarchy: page title, section title, card title, metadata, metric value.
- Current implementation uses many local combinations of `font-black`, `font-extrabold`, `text-neutral-*`, `text-text-*`, and different label sizes.
- UMKM shared primitives better normalize metric typography than creator pages.

### Spacing and Layout

- Most dashboard pages use `p-4 sm:p-6 lg:p-8`, matching the intended page padding rhythm.
- Section gaps vary: `space-y-6`, `mb-8`, `mt-10`, `gap-8`, and `gap-6` are used per page rather than through a layout primitive.
- The creator shell is consistent with the UMKM shell, but creator content cards still use more page-local layout decisions.

### Border Radius and Shadow

- UI kit target is large card radius with subtle shadow and border.
- Current implementation often uses `rounded-2xl` and `rounded-3xl`, which is directionally correct.
- Shadow intensity is inconsistent: some older dashboard components use heavy `shadow-[0_8px_4px_0_rgba(0,0,0,0.25)]`, while newer cards use very soft shadows.

### Component Primitives

- UMKM shared primitives exist and should become the base normalization target.
- Creator primitives overlap but do not share the same API or token mapping.
- The optimized UMKM overview primitives are useful but should be reconciled with `umkm-dashboard/shared` rather than becoming a third pattern.

### Responsive Behavior

- Many pages include `min-w-0`, `truncate`, `line-clamp`, wrapping toolbars, and mobile card views.
- Highest risk areas are manual tables, fixed minimum widths, modal height behavior, and dense action rows.
- Finance transaction history already switches from table to cards on mobile.
- Campaign table mode uses horizontal scroll and `min-w-[900px]`, conflicting with the UI kit "no horizontal scroll at 375px" rule.

### Overflow Behavior

- Long text handling is present in many cards via `truncate` and `line-clamp`.
- Long URLs are partially handled in submission/detail modals, but raw public URL displays need a unified `break-all`/copy row pattern.
- Currency values use formatters in several places, but creator cards and manual metric tiles need normalization around compact/full currency rules.

## Component Inventory

### Existing Cross-Dashboard Shell/Overview Components

- `src/components/features/dashboard/DashboardShell.tsx`
- `src/components/features/dashboard/DashboardSidebar.tsx`
- `src/components/features/dashboard/DashboardTopbar.tsx`
- `src/components/features/dashboard/UmkmDashboardChrome.tsx`
- `src/components/features/dashboard/UmkmDashboardView.tsx`
- `src/components/features/dashboard/DashboardCard.tsx`
- `src/components/features/dashboard/MetricBlock.tsx`
- `src/components/features/dashboard/StatusBadge.tsx`
- `src/components/features/dashboard/ProgressBar.tsx`
- `src/components/features/dashboard/UmkmViewsChartCard.tsx`

### UMKM Shared Primitives

- `src/components/features/umkm-dashboard/shared/DashboardCard.tsx`
- `src/components/features/umkm-dashboard/shared/DashboardMetricCard.tsx`
- `src/components/features/umkm-dashboard/shared/DashboardBadge.tsx`
- `src/components/features/umkm-dashboard/shared/DashboardButton.tsx`
- `src/components/features/umkm-dashboard/shared/DashboardProgress.tsx`
- `src/components/features/umkm-dashboard/shared/DashboardActionMenu.tsx`
- `src/components/features/umkm-dashboard/shared/ResponsiveDataRow.tsx`
- `src/components/features/umkm-dashboard/shared/index.ts`

### Creator-Specific Primitives

- `src/components/features/creator-dashboard/CreatorDashboardChrome.tsx`
- `src/components/features/creator-dashboard/CreatorDashboardSidebar.tsx`
- `src/components/features/creator-dashboard/CreatorDashboardTopbar.tsx`
- `src/components/features/creator-dashboard/CreatorMetricCard.tsx`
- `src/components/features/creator-dashboard/CreatorStatusBadge.tsx`
- `src/components/features/creator-dashboard/CreatorEmptyState.tsx`
- `src/components/features/creator-dashboard/CreatorErrorState.tsx`
- `src/components/features/creator-dashboard/CreatorSkeleton.tsx`
- `src/components/features/creator-dashboard/CreatorFilterToolbar.tsx`
- `src/components/features/creator-dashboard/CreatorPageHeader.tsx`

### Base UI Primitives

- `src/components/ui/Button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/empty-state.tsx`

## Shared Primitive Usage Analysis

Pages using shared primitives relatively well:

- `/dashboard/umkm/campaign/[id]`: uses dashboard card, badge, button, skeleton, not-found, responsive data rows in submission cards.
- `/dashboard/umkm/keuangan`: uses finance skeleton/empty/error states, responsive transaction card fallback on mobile, shared buttons and badges.
- `/dashboard/umkm/negosiasi/[id_order]`: has Collab Post warning, chat room composition, skeleton, not-found, and shared card/button patterns.
- `/dashboard/umkm/campaign/buat`: uses wizard-specific cards, buttons, escrow/payment simulation, and skeleton state.

Pages with high one-off styling:

- `/dashboard/kreator`: large `CreatorDashboardView` contains many local cards, modal surfaces, alerts, and simulator controls.
- `/dashboard/kreator/job-pool`: manual job cards, raw image tags, manual filter toolbar, manual claim modal.
- `/dashboard/kreator/job-pool/[id]`: manual detail tiles, raw image tags, manual modal.
- `/dashboard/kreator/pekerjaan-aktif/[id]`: proof submission layout is domain-correct but has manual card/modal styling and raw images.
- `/dashboard/kreator/profil`: many manual modal, upload, portfolio, and image patterns.
- `/dashboard/kreator/rate-card`: manual package cards and CRUD modals.
- `/dashboard/kreator/keuangan`: has rich states but uses creator-specific primitives rather than the shared UMKM dashboard primitives.

Duplicated patterns across UMKM and Kreator:

- Shell/sidebar/topbar structure.
- Metric card anatomy.
- Empty/error/skeleton state cards.
- Badge tone mapping.
- Button variants and pill radius.
- Modal overlay/card/action footer patterns.
- Toast notification surface.
- Marketplace cards for campaign/job/creator/package/order.
- Transaction row/card patterns.

## Page-by-Page UI Inconsistency Notes

### `/dashboard/umkm`

- Optimized overview uses `features/dashboard` primitives rather than the richer `umkm-dashboard/shared` set.
- It visually aligns with warm paper/navy/orange direction, but it is not yet normalized with the rest of UMKM feature pages.
- Chart dropdown remains the correct isolated client island.

### `/dashboard/umkm/campaign`

- Default card view is mobile-safe, but table view uses `min-w-[900px]` inside horizontal overflow.
- `CampaignTable` still uses raw `<img>` for thumbnails.
- Several modal and card patterns are already using UMKM shared primitives.

### `/dashboard/umkm/campaign/buat`

- Wizard uses good campaign-domain flow, escrow simulation, external asset URL fields, and skeleton.
- Page wrapper itself is client-side only to load profile; this is inconsistent with the server-first route pattern used in creator routes.
- Modal/button/card treatment should be checked against final shared modal primitive.

### `/dashboard/umkm/campaign/[id]`

- Strong state coverage: skeleton and not-found exist.
- Campaign Mode domain is mostly respected: asset links are external and submission proof uses public URLs.
- Needs final audit for raw image usage in submission cards/modals and for action labels in quick actions.

### `/dashboard/umkm/kreator`

- Creator directory is a Rate Card discovery surface, so negotiation entry is domain-allowed.
- Several directory/detail components are client-marked even when purely presentational.
- Needs normalization to marketplace card anatomy from UI kit.

### `/dashboard/umkm/kreator/[id]`

- Creator profile/detail has skeleton and not-found state.
- Rate Card package cards include Collab Post deliverables, which is domain-aligned.
- Uses local creator-detail styling and modal patterns that should map to shared cards/buttons/modals.

### `/dashboard/umkm/negosiasi`

- Correctly represents Rate Card Mode, where chat/custom offer is allowed.
- Uses summary cards and toolbar patterns, but the page is client-only and should be checked for presentational components that can be server-rendered later.

### `/dashboard/umkm/negosiasi/[id_order]`

- Correctly includes chat, custom offer, escrow/payment simulation, and Collab Post warning for Rate Card Mode.
- Uses browser `alert()` in `NegotiationRoomHeader`, which violates modal/interaction quality.
- Needs unified chat/order card styling and scroll-safe mobile modal review.

### `/dashboard/umkm/keuangan`

- Finance page has good state coverage and mobile transaction cards.
- Escrow overview uses an internal `min-w-[640px]` scroller, which is a mobile overflow risk under the UI kit rule.
- Payment and export simulation copy exists, but should be consistently labeled as simulation.

### `/dashboard/kreator`

- Overview has strong feature coverage but a very large client component with local state, local modals, alerts, and repeated card classes.
- Uses browser `alert()` for withdrawal/proof validation.
- Should be normalized around shared metric/action/state/modal primitives.

### `/dashboard/kreator/job-pool`

- Domain rule is mostly correct: job pool is Campaign Mode and does not show chat/contact actions.
- Job cards use raw `<img>` and manual card/badge/progress/button classes.
- Mobile toolbar appears stacked, but action rows and claim modal need live 375px validation.

### `/dashboard/kreator/job-pool/[id]`

- Detail page includes external Drive/Dropbox asset link behavior and no final video upload to Marketiv.
- Uses raw `<img>` and manual detail tiles.
- Metric grid uses 5 columns on desktop and 2 on mobile, which may be acceptable but differs from 2-3-4 rule.

### `/dashboard/kreator/pekerjaan-aktif`

- Active work list appears domain-correct and uses creator empty/error/skeleton patterns.
- Needs card/button/badge normalization against shared primitives.

### `/dashboard/kreator/pekerjaan-aktif/[id]`

- Proof submission correctly validates TikTok and Instagram URL domains.
- Copy explicitly states no final video upload to Marketiv.
- A label says "Upload Video", which can confuse Campaign Mode even if the actual action is public URL submission.

### `/dashboard/kreator/negosiasi`

- Rate Card negotiation list is allowed to show chat/order concepts.
- Uses creator metric/state components and manual row/card styling.
- Needs Collab Post language consistency with UMKM negotiation.

### `/dashboard/kreator/negosiasi/[id_order]`

- Correctly includes Collab Post warning, chat composer, custom offer, and Collab URL validation.
- Large manual chat room component should be normalized into shared chat/order card primitives.
- Needs mobile height/scroll QA for chat pane and composer.

### `/dashboard/kreator/profil`

- Profile, portfolio, TikTok/Instagram URL validation, and portfolio modals exist.
- Raw `<img>` is used for profile/avatar/portfolio areas.
- Upload simulation and modal surfaces need shared modal/upload-card primitives.

### `/dashboard/kreator/rate-card`

- Rate Card package CRUD is domain-allowed and includes platform/deliverable data.
- Uses manual package cards and modals instead of shared dashboard card/button/badge/modal primitives.
- Needs consistent Collab Post warning/help copy in package creation/editing.

### `/dashboard/kreator/keuangan`

- Has loading, empty, filter-empty, error, and modal-like withdrawal states.
- Uses creator-specific cards and manual transaction rows.
- Currency handling should be reconciled with shared compact/full currency rules.

## Responsive Risk Summary

P0/P1 responsive risk candidates to validate in live QA:

- `/dashboard/umkm/campaign`: table mode uses `min-w-[900px]` and horizontal scroll.
- `/dashboard/umkm/keuangan`: escrow overview uses `min-w-[640px]` inside `overflow-x-auto`.
- `/dashboard/kreator/job-pool`: filter/action toolbar has dense controls and manual job card CTAs.
- `/dashboard/kreator/negosiasi/[id_order]`: chat pane/composer may create height pressure on 375px.
- `/dashboard/kreator/profil`: profile/portfolio modals and upload simulation areas may overflow on small screens.
- `/dashboard/kreator/rate-card`: create/edit package modals have dense form content.

## Domain Rule Risk Summary

Campaign Mode:

- No obvious chat/WhatsApp/direct-contact UI was found in creator job pool/detail or active work flows.
- Creator proof submission uses TikTok/Instagram public URL validation.
- Campaign assets are represented as external links in current job/detail flows.
- Risk: "Upload Video" wording in active work detail could confuse users even though the action is URL submission, not Marketiv-hosted video upload.

Rate Card Mode:

- UMKM and creator negotiation routes contain chat/custom offer/order summary, which is allowed.
- UMKM negotiation room includes `CollabPostWarningBanner`.
- Creator negotiation room includes Collab Post warning and URL validation.
- Risk: Collab Post warning/copy should be normalized so it appears consistently in all Rate Card room/package contexts.

Finance/Escrow:

- Escrow/payment simulation exists in UMKM finance and negotiation flows.
- Risk: some copy references Midtrans/payment processing strongly; Phase 2 should ensure all current payment UI is clearly simulation/dummy until backend integration.

## Prioritized Fix Recommendations

### P0

- Replace mobile horizontal-scroll table patterns with responsive rows/cards where users can trigger table mode.
- Validate and fix any modal or chat room overflow at 375px.

### P1

- Choose a single dashboard primitive source of truth and migrate UMKM overview, UMKM feature pages, and creator pages toward it.
- Replace raw `<img>` tags in dashboard feature components with `next/image` where dimensions/source rules are known.
- Replace browser `alert()` calls with shared modal/toast feedback.
- Normalize badge, metric, button, and card APIs across UMKM and creator.

### P2

- Normalize typography labels, section headings, and metric value sizes.
- Normalize toast, skeleton, empty, error, and not-found cards.
- Normalize Collab Post and escrow/simulation copy.

### P3

- Consolidate repeated SVG icon switchers and action menu icon patterns.
- Reduce one-off shadows/backdrop blur where they do not visibly add quality.
- Add route QA checklist screenshots in a future visual QA pass.
