# Dashboard Component Normalization Plan

## Goal

Normalize UMKM and Konten Kreator dashboards around one Marketiv dashboard UI system based on:

```txt
docs/design-system/marketiv-studio-system-v5-8.html
```

This plan is for Phase 2 and later implementation work. Phase 1 did not modify UI code.

## Components That Must Become Source-of-Truth Primitives

### Dashboard Shell

Target API:

```ts
interface DashboardShellProps {
  role: "umkm" | "creator";
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}
```

Normalize:

- `src/components/features/dashboard/DashboardShell.tsx`
- `src/components/features/dashboard/UmkmDashboardChrome.tsx`
- `src/components/features/creator-dashboard/CreatorDashboardChrome.tsx`
- `src/components/features/dashboard/DashboardSidebar.tsx`
- `src/components/features/creator-dashboard/CreatorDashboardSidebar.tsx`
- `src/components/features/dashboard/DashboardTopbar.tsx`
- `src/components/features/creator-dashboard/CreatorDashboardTopbar.tsx`

### DashboardCard

Target API:

```ts
interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "elevated" | "featured" | "dark" | "danger";
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}
```

Normalize:

- `src/components/features/umkm-dashboard/shared/DashboardCard.tsx`
- `src/components/features/dashboard/DashboardCard.tsx`
- Local creator `bg-white ... rounded-3xl ... shadow-*` cards

### DashboardMetricCard

Target API:

```ts
interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  helperText?: string;
  trendText?: string;
  trendType?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  tone?: "default" | "orange" | "navy" | "green" | "blue" | "red";
  currencyMode?: "none" | "compact" | "full";
}
```

Normalize:

- `src/components/features/umkm-dashboard/shared/DashboardMetricCard.tsx`
- `src/components/features/creator-dashboard/CreatorMetricCard.tsx`
- Inline metric tiles in job detail, active work detail, finance, and overview pages

### DashboardBadge

Target API:

```ts
interface DashboardBadgeProps {
  tone?: "gray" | "orange" | "green" | "yellow" | "red" | "blue" | "navy" | "purple";
  size?: "xs" | "sm" | "md";
  children: React.ReactNode;
}
```

Also support status/category mapping helpers:

```ts
getDashboardStatusTone(status: string): DashboardBadgeTone
getDashboardCategoryTone(category: string): DashboardBadgeTone
```

Normalize:

- `src/components/features/umkm-dashboard/shared/DashboardBadge.tsx`
- `src/components/features/creator-dashboard/CreatorStatusBadge.tsx`
- `src/components/features/dashboard/StatusBadge.tsx`
- Inline badge spans across creator pages

### DashboardButton

Target API:

```ts
interface DashboardButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "soft" | "danger" | "icon";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidthOnMobile?: boolean;
}
```

Normalize:

- `src/components/features/umkm-dashboard/shared/DashboardButton.tsx`
- Inline buttons in creator pages
- Icon-only buttons that need `aria-label`
- Modal action footers

### DashboardProgress

Target API:

```ts
interface DashboardProgressProps {
  value: number;
  max?: number;
  label?: string;
  valueLabel?: string;
  tone?: "orange" | "green" | "yellow" | "red" | "blue";
  shimmer?: boolean;
}
```

Normalize:

- `src/components/features/umkm-dashboard/shared/DashboardProgress.tsx`
- `src/components/features/dashboard/ProgressBar.tsx`
- Manual progress bars in job pool, job detail, campaign overview, and active work

### DashboardStateCard

Target API:

```ts
interface DashboardStateCardProps {
  type: "loading" | "empty" | "filtered-empty" | "error" | "not-found" | "success";
  title: string;
  description: string;
  action?: React.ReactNode;
}
```

Normalize:

- `src/components/ui/empty-state.tsx`
- `src/components/ui/skeleton.tsx`
- `CreatorEmptyState`
- `CreatorErrorState`
- UMKM campaign/creator/finance/negotiation empty and error states

### DashboardModal

Target API:

```ts
interface DashboardModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}
```

Requirements:

- Mobile scroll-safe.
- Close button with accessible label.
- Overlay click behavior where appropriate.
- Primary and secondary action slots.
- No browser `alert()`.

Normalize:

- UMKM campaign modals
- UMKM negotiation/payment/custom offer modals
- UMKM finance modals
- Creator claim/proof/withdrawal/profile/rate-card modals

### ResponsiveDataRow

Target API:

```ts
interface ResponsiveDataRowProps {
  title: React.ReactNode;
  meta?: React.ReactNode;
  cells?: Array<{ label: string; value: React.ReactNode }>;
  actions?: React.ReactNode;
}
```

Normalize:

- `src/components/features/umkm-dashboard/shared/ResponsiveDataRow.tsx`
- `CampaignTable`
- Finance transaction table/card pair
- Creator negotiation rows
- Creator finance transaction rows

### MarketplaceCard

Target API:

```ts
interface MarketplaceCardProps {
  kind: "campaign" | "creator" | "job" | "rate-card" | "order";
  title: string;
  subtitle?: string;
  image?: { src: string; alt: string };
  badges?: React.ReactNode;
  metrics?: React.ReactNode;
  primaryAction: React.ReactNode;
  secondaryAction?: React.ReactNode;
}
```

Normalize:

- UMKM campaign cards
- UMKM creator cards
- Creator job pool cards
- Creator active work cards
- Creator rate card package cards
- UMKM/creator negotiation order cards

## Components That Should Be Refactored

### High Priority

- `src/components/features/umkm-dashboard/campaign/CampaignTable.tsx`
- `src/components/features/umkm-dashboard/finance/EscrowOverviewCard.tsx`
- `src/components/features/creator-dashboard/CreatorDashboardView.tsx`
- `src/components/features/creator-dashboard/JobPoolView.tsx`
- `src/components/features/creator-dashboard/JobDetailView.tsx`
- `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx`
- `src/components/features/creator-dashboard/NegosiasiRoomView.tsx`
- `src/components/features/creator-dashboard/ProfilView.tsx`
- `src/components/features/creator-dashboard/RateCardView.tsx`
- `src/components/features/creator-dashboard/KeuanganView.tsx`

### Medium Priority

- `src/components/features/umkm-dashboard/creators/CreatorDirectoryPage.tsx`
- `src/components/features/umkm-dashboard/creators/CreatorCard.tsx`
- `src/components/features/umkm-dashboard/creators/detail/CreatorDetailPage.tsx`
- `src/components/features/umkm-dashboard/creators/detail/RateCardPackageCard.tsx`
- `src/components/features/umkm-dashboard/negotiation/NegotiationListPage.tsx`
- `src/components/features/umkm-dashboard/negotiation/detail/NegotiationRoomPage.tsx`
- `src/components/features/umkm-dashboard/create-campaign/CreateCampaignWizard.tsx`

### Lower Priority

- Older generic dashboard components not used by current dashboard routes:
  - `src/components/features/dashboard/DashboardHero.tsx`
  - `src/components/features/dashboard/CampaignGrid.tsx`
  - `src/components/features/dashboard/CampaignCard.tsx`

## Duplicated Patterns to Remove

- Duplicate dashboard cards in `features/dashboard` and `umkm-dashboard/shared`.
- Creator-specific metric/status/state primitives that duplicate shared dashboard primitives.
- Inline card surfaces with repeated `bg-white`, `rounded-3xl`, `border`, and `shadow-*`.
- Inline pill badges with local color/tone mapping.
- Manual progress bars.
- Manual modal overlays and action footers.
- Browser `alert()` feedback.
- Raw `<img>` for dashboard content images.
- Table-only data views on mobile.
- Repeated toast banners.
- Repeated sidebar/topbar icon switchers where the visual language is identical.

## Recommended Shared Component API

Create or consolidate under one dashboard shared folder. Recommended destination for Phase 2:

```txt
src/components/features/dashboard/shared/
```

Recommended exports:

```ts
export { DashboardShell } from "./DashboardShell";
export { DashboardCard } from "./DashboardCard";
export { DashboardMetricCard } from "./DashboardMetricCard";
export { DashboardBadge } from "./DashboardBadge";
export { DashboardButton } from "./DashboardButton";
export { DashboardProgress } from "./DashboardProgress";
export { DashboardActionMenu } from "./DashboardActionMenu";
export { DashboardStateCard } from "./DashboardStateCard";
export { DashboardModal } from "./DashboardModal";
export { ResponsiveDataRow, ResponsiveDataCell } from "./ResponsiveDataRow";
export { MarketplaceCard } from "./MarketplaceCard";
```

Keep role-specific composition in:

```txt
src/components/features/umkm-dashboard/
src/components/features/creator-dashboard/
```

## Safe Refactor Order

1. Freeze visual tokens and primitive API in `features/dashboard/shared`.
2. Move or adapt UMKM shared primitives into the new shared location without changing their visual output.
3. Point optimized UMKM overview primitives to the shared primitives.
4. Normalize `DashboardShell`, role sidebars, and role topbars.
5. Replace raw `<img>` with `next/image` route-by-route where dimensions and remote config are safe.
6. Replace browser `alert()` with `DashboardModal` or toast.
7. Fix P0 mobile overflow:
   - campaign table mode,
   - UMKM finance escrow diagram,
   - chat room/composer height,
   - dense modals.
8. Normalize creator metric cards, empty/error/skeleton states, and buttons.
9. Normalize marketplace cards:
   - campaign cards,
   - creator cards,
   - job cards,
   - rate card packages,
   - order cards.
10. Normalize screen states and modal copy.
11. Run route-by-route live QA at 375px, 430px, 768px, 1024px, 1280px, and 1440px.

## Files Likely Affected in Phase 2

Shared primitives:

- `src/components/features/dashboard/shared/*`
- `src/components/features/umkm-dashboard/shared/*`
- `src/components/features/dashboard/DashboardShell.tsx`
- `src/components/features/dashboard/UmkmDashboardChrome.tsx`
- `src/components/features/creator-dashboard/CreatorDashboardChrome.tsx`

UMKM pages/components:

- `src/app/dashboard/umkm/*`
- `src/components/features/dashboard/*`
- `src/components/features/umkm-dashboard/campaign/*`
- `src/components/features/umkm-dashboard/campaign/detail/*`
- `src/components/features/umkm-dashboard/campaign/modals/*`
- `src/components/features/umkm-dashboard/create-campaign/*`
- `src/components/features/umkm-dashboard/creators/*`
- `src/components/features/umkm-dashboard/creators/detail/*`
- `src/components/features/umkm-dashboard/negotiation/*`
- `src/components/features/umkm-dashboard/negotiation/detail/*`
- `src/components/features/umkm-dashboard/finance/*`

Creator pages/components:

- `src/app/dashboard/kreator/*`
- `src/components/features/creator-dashboard/*`

Utilities/types:

- `src/lib/formatters.ts`
- `src/types/umkm-dashboard.types.ts`
- `src/types/creator-dashboard.ts`

## Phase 2 Recommended Scope

Recommended Phase 2 should not attempt to fix every route at once. The safest scope is:

1. Establish shared primitive API and migrate no more than one UMKM route plus one creator route as proof.
2. Fix P0 mobile overflow in `/dashboard/umkm/campaign` table mode and `/dashboard/umkm/keuangan` escrow overview.
3. Replace browser `alert()` calls.
4. Normalize raw `<img>` usage on the highest-traffic routes:
   - `/dashboard/kreator/job-pool`,
   - `/dashboard/kreator/job-pool/[id]`,
   - `/dashboard/umkm/campaign`.
5. Run live breakpoint QA before expanding to all pages.
