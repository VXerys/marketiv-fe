# Dashboard Phase 2 Implementation Notes

## Scope Implemented

- Added shared dashboard primitives under `src/components/features/dashboard/shared/`.
- Fixed mobile overflow risk in `/dashboard/umkm/campaign` by replacing the mobile table with stacked responsive data rows while keeping the desktop table.
- Fixed mobile overflow risk in `/dashboard/umkm/keuangan` by replacing the mobile escrow horizontal timeline with stacked steps while keeping the desktop timeline.
- Normalized scoped campaign/job surfaces with shared badges, buttons, progress, responsive rows, and action menu primitives.
- Replaced scoped browser `alert()` usage in creator overview and UMKM negotiation verification.

## Shared Primitives

- `DashboardCard`
- `DashboardMetricCard`
- `DashboardBadge`
- `getDashboardStatusTone`
- `getDashboardCategoryTone`
- `DashboardButton`
- `DashboardProgress`
- `DashboardStateCard`
- `DashboardModal`
- `ResponsiveDataRow`
- `ResponsiveDataCell`
- `MarketplaceCard`
- `DashboardActionMenu`

## Route Notes

- `/dashboard/umkm/campaign`
  - Mobile uses `ResponsiveDataRow` cards to avoid table-driven horizontal scroll.
  - Desktop keeps the campaign table and action menu.
  - Campaign thumbnails now use `next/image`.

- `/dashboard/umkm/keuangan`
  - Mobile escrow flow uses stacked step cards.
  - Desktop keeps the timeline/connector diagram.
  - Escrow step definitions are now module-level constants.

- `/dashboard/kreator/job-pool`
  - Job card avatar now uses `next/image`.
  - Job status/category/asset badges, quota progress, and primary/detail actions use shared primitives.
  - Toolbar controls stack on mobile to avoid cramped horizontal layout.

## Alert Replacements

- `CreatorDashboardView.tsx`
  - Withdrawal validation and proof URL validation now use the existing toast flow.

- `NegotiationRoomHeader.tsx`
  - Collab Post verification now uses `DashboardModal` instead of `alert()`.

## Raw Images

- Completed:
  - `src/components/features/umkm-dashboard/campaign/CampaignTable.tsx`
  - `src/components/features/creator-dashboard/JobPoolView.tsx`

- Deferred:
  - `src/components/features/creator-dashboard/JobDetailView.tsx`
  - Other dashboard routes outside the controlled proof scope.

## Domain Rules Preserved

- No route changes.
- No mock data meaning changes.
- No Appwrite, auth, payment, chat, or AI additions.
- Campaign Mode and Rate Card Mode business copy remains local and mock-driven.

## Phase 3 TODO

- Continue raw image replacement across remaining dashboard routes.
- Migrate older route-local dashboard primitives to the shared folder when each route is touched.
- Consider replacing remaining route-local modals with `DashboardModal` after visual QA.
- Add route-level visual regression screenshots for mobile widths `375px`, `390px`, `430px`, and desktop.
