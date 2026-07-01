# Implementation Plan: UI Kit Migration

## Overview

Migrate 48 shadcn/ui components, 18 pages, and 2 layouts from the React + Vite prototype into the production Next.js 16 marketiv-web codebase. The migration follows a phased approach: foundation (dependencies + tokens), component library, primitive mapping, layouts, UMKM pages, Creator pages, and polish (toast, charts, animations, responsive).

## Tasks

- [ ] 1. Install dependencies and configure foundation
  - [ ] 1.1 Install Radix UI packages from prototype package.json
    - Install all 26 @radix-ui/* packages using caret ranges matching prototype versions
    - Verify no peer dependency conflicts with React 19; apply --legacy-peer-deps if needed
    - _Requirements: 1.1, 1.3, 1.4, 1.6_

  - [ ] 1.2 Install utility libraries from prototype package.json
    - Install recharts, motion, sonner, vaul, lucide-react, cmdk, embla-carousel-react, date-fns, react-dnd, react-dnd-html5-backend, input-otp, react-day-picker, react-resizable-panels, tw-animate-css
    - Preserve existing dependencies (phosphor-icons, react-hook-form, hookform/resolvers, zod, cva, clsx, tailwind-merge, appwrite)
    - _Requirements: 1.2, 1.3, 1.4, 1.6_

  - [ ] 1.3 Verify `cn()` utility in `src/lib/utils.ts`
    - Ensure `cn()` uses `clsx` + `tailwind-merge` pattern
    - Add or update if missing
    - _Requirements: 3.2_

  - [ ] 1.4 Add design token bridge to `src/app/globals.css`
    - Add shadcn CSS variable section mapping to Marketiv Studio System v5.8 tokens
    - Add `@theme inline` block mapping CSS vars to Tailwind color/radius utilities
    - Add sidebar tokens, chart tokens, and `.dark` placeholder scope
    - Import `tw-animate-css` at the top of the file
    - Add `--ease` cubic-bezier and `prefers-reduced-motion` media query
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 9.2, 9.4, 9.5_

  - [ ] 1.5 Run `next build` to verify dependency and token foundation
    - Confirm build passes with no dependency resolution, import, or type errors
    - _Requirements: 1.5, 13.7_

- [ ] 2. Migrate shadcn/ui component library (batch 1: pure UI components)
  - [ ] 2.1 Migrate pure UI components (no "use client" needed)
    - Copy and adapt: alert.tsx, aspect-ratio.tsx, avatar.tsx, badge.tsx, breadcrumb.tsx, button.tsx, card.tsx, input.tsx, label.tsx, separator.tsx, skeleton.tsx, table.tsx, textarea.tsx
    - Replace existing files (badge.tsx, Button.tsx→button.tsx, card.tsx, input.tsx, skeleton.tsx, textarea.tsx) with shadcn versions
    - Adapt imports: `cn` from `@/lib/utils`, remove forwardRef where unneeded (React 19), use named exports only
    - Add custom variants to button.tsx (soft, danger) and badge.tsx (success, warning, danger, info) per design
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8, 13.1_

  - [ ] 2.2 Migrate interactive components batch A (dialogs, dropdowns, popovers)
    - Copy and adapt with "use client": dialog.tsx, drawer.tsx, dropdown-menu.tsx, sheet.tsx, popover.tsx, hover-card.tsx, context-menu.tsx, alert-dialog.tsx, command.tsx, menubar.tsx, navigation-menu.tsx, tooltip.tsx
    - Ensure all sub-components exported as named exports (e.g., DialogTrigger, DialogContent, etc.)
    - Remove forwardRef; accept ref as direct prop for interactive primitives
    - _Requirements: 3.1, 3.3, 3.4, 3.6, 3.8, 13.1_

  - [ ] 2.3 Migrate interactive components batch B (form/input primitives)
    - Copy and adapt with "use client": accordion.tsx, calendar.tsx, checkbox.tsx, collapsible.tsx, form.tsx, input-otp.tsx, pagination.tsx, progress.tsx, radio-group.tsx, resizable.tsx, scroll-area.tsx, select.tsx, slider.tsx, switch.tsx, tabs.tsx, toggle.tsx, toggle-group.tsx
    - _Requirements: 3.1, 3.3, 3.4, 3.6, 3.8, 13.1_

  - [ ] 2.4 Migrate utility components (carousel, chart, sonner, sidebar, use-mobile)
    - Copy and adapt with "use client": carousel.tsx, chart.tsx, sonner.tsx, sidebar.tsx, use-mobile.ts
    - Chart wrapper integrates with Recharts and Marketiv color palette (chart tokens)
    - Sonner configured: bottom-right, 4s duration, max 3 toasts, Marketiv-styled classNames
    - Sidebar component supports collapsible="icon" and mobile Sheet mode
    - useMobile hook with 768px breakpoint, SSR-safe default (false)
    - _Requirements: 3.1, 3.3, 10.2, 11.1, 7.1, 15.3_

  - [ ]* 2.5 Write unit tests for shadcn component library
    - Test badge custom variants render correct classNames
    - Test button custom variants (soft, danger) apply correct styles
    - Test card sub-components export correctly
    - Verify "use client" directive presence on interactive components
    - _Requirements: 3.2, 3.5, 3.7_

- [ ] 3. Checkpoint - Verify component library build
  - Ensure `next build` passes, ask the user if questions arise.

- [ ] 4. Map dashboard primitives to shadcn equivalents
  - [ ] 4.1 Refactor DashboardCard to use shadcn Card internally
    - Replace internal implementation with shadcn Card, CardHeader, CardContent, CardFooter
    - Preserve all 6 variants (default, soft, elevated, featured, dark, danger) via className map
    - Preserve 4 padding options (none, sm, md, lg) and interactive prop
    - Add JSDoc `@deprecated` annotation
    - _Requirements: 4.1, 4.8_

  - [ ] 4.2 Refactor DashboardButton to use shadcn Button internally
    - Map variants: primary→default, secondary→secondary, outline→outline, ghost→ghost, soft→secondary+class, danger→destructive, danger-outline→outline+destructive class, icon→size icon
    - Preserve all existing props; add JSDoc `@deprecated` annotation
    - _Requirements: 4.2, 4.8_

  - [ ] 4.3 Refactor DashboardBadge to use shadcn Badge internally
    - Map tones: green→success, amber→warning, red→danger, blue→info, neutral→secondary, orange→default, purple→secondary+purple class, slate→secondary
    - Preserve getDashboardStatusTone and getDashboardCategoryTone helper functions
    - Add JSDoc `@deprecated` annotation
    - _Requirements: 4.3, 4.8_

  - [ ] 4.4 Refactor DashboardModal to use shadcn Dialog internally
    - Map to Dialog + DialogContent + DialogHeader + DialogFooter
    - Preserve props: isOpen, title, description, footer, confirmLabel, cancelLabel, onConfirm, onClose, variant (default/danger)
    - Add JSDoc `@deprecated` annotation
    - _Requirements: 4.4, 4.8, 4.9_

  - [ ] 4.5 Refactor DashboardActionMenu to use shadcn DropdownMenu internally
    - Map to DropdownMenu + DropdownMenuTrigger + DropdownMenuContent + DropdownMenuItem
    - Preserve ActionMenuItem interface (label, icon, onClick, disabled, tone)
    - Add JSDoc `@deprecated` annotation
    - _Requirements: 4.5, 4.8, 4.9_

  - [ ] 4.6 Refactor DashboardProgress to use shadcn Progress internally
    - Map 5 tone options (orange, green, yellow, red, blue) via indicator className
    - Preserve label, valueLabel, and value/max percentage calculation
    - Add JSDoc `@deprecated` annotation
    - _Requirements: 4.6, 4.8, 4.9_

  - [ ] 4.7 Update higher-level composed primitives to use shadcn internally
    - Update DashboardMetricCard, DashboardStateCard, MarketplaceCard, ResponsiveDataRow
    - Use shadcn Card, Badge, Button etc. internally while preserving public props
    - _Requirements: 4.7_

  - [ ] 4.8 Update primitives index.ts with backward-compatible re-exports
    - Ensure all deprecated primitives exported from `src/components/features/dashboard/shared/index.ts`
    - Add JSDoc @deprecated tag on each re-export
    - _Requirements: 4.8_

  - [ ]* 4.9 Write unit tests for primitive mappings
    - Test DashboardCard all 6 variants render correct shadcn Card classNames
    - Test DashboardButton variant mapping produces correct output
    - Test DashboardBadge tone mapping
    - Test DashboardModal renders Dialog sub-components
    - Test DashboardActionMenu renders DropdownMenu items
    - Test DashboardProgress tone colors
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 5. Checkpoint - Verify primitives build
  - Ensure `next build` passes after primitive refactoring, ask the user if questions arise.

- [ ] 6. Implement layout and navigation (shadcn Sidebar)
  - [ ] 6.1 Create UMKM dashboard layout with shadcn Sidebar
    - Create `src/app/dashboard/umkm/layout.tsx` (Server Component shell)
    - Create `src/components/features/dashboard/UmkmDashboardShell.tsx` ("use client")
    - Implement SidebarProvider + Sidebar (collapsible="icon", 16rem expanded, 3rem collapsed)
    - Add UMKM nav items: Dashboard, Campaign, Kreator, Keuangan, Analitik, Pengaturan
    - Active state: orange gradient on data-[active=true], exact match for root, startsWith for sub-routes
    - Sidebar background: --sidebar (#0c172b)
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ] 6.2 Create Creator dashboard layout with shadcn Sidebar
    - Create `src/app/dashboard/kreator/layout.tsx` (Server Component shell)
    - Create `src/components/features/dashboard/CreatorDashboardShell.tsx` ("use client")
    - Same SidebarProvider pattern; active state uses blue-to-purple gradient
    - Nav items: Overview, Job Pool, Pekerjaan Aktif, Negosiasi, Profil, Rate Card, Keuangan
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ] 6.3 Implement topbar/header for both layouts
    - Brand mark (logo + "Dashboard UMKM"/"Dashboard Kreator")
    - SidebarTrigger for mobile hamburger menu
    - Notification bell icon with badge dot (Lucide Bell, aria-label)
    - User avatar with link to profil
    - Use Next.js Link for all navigation
    - _Requirements: 7.5, 7.6, 8.2, 8.5_

  - [ ] 6.4 Integrate Toaster in root layout
    - Add Sonner `<Toaster />` component to `src/app/layout.tsx`
    - Configure fonts (Plus Jakarta Sans, Sora) via next/font
    - _Requirements: 11.1, 11.2, 11.5_

  - [ ] 6.5 Add error.tsx boundaries for UMKM and Creator route segments
    - Create error.tsx at `/dashboard/umkm/error.tsx` and `/dashboard/kreator/error.tsx`
    - Create error.tsx at key sub-routes (campaign, campaign/[campaignId])
    - Display fallback UI with error message and retry CTA
    - _Requirements: 12.6, 6.12_

  - [ ]* 6.6 Write integration tests for layout rendering
    - Test UMKM sidebar renders correct nav items
    - Test Creator sidebar renders correct nav items
    - Test active state applies on correct route
    - Test mobile viewport shows Sheet instead of sidebar
    - _Requirements: 7.3, 7.4, 7.7_

- [ ] 7. Checkpoint - Verify layouts build
  - Ensure `next build` passes with layouts wired, ask the user if questions arise.

- [ ] 8. Migrate UMKM dashboard pages
  - [ ] 8.1 Migrate UMKM overview page (`/dashboard/umkm`)
    - Create/update `src/app/dashboard/umkm/page.tsx` (Server Component, data fetching)
    - Create `src/components/features/umkm-dashboard/overview/UmkmOverviewClient.tsx` ("use client")
    - Migrate HeroOverview, KPISection, CampaignSection, ActivityTimeline, FinancialOverview, QuickActions as sub-components
    - Use shadcn Card for metric cards, existing data from `src/data/`
    - Convert react-router → next/navigation, inline styles → Tailwind
    - _Requirements: 5.1, 5.9, 5.10, 5.11, 13.2, 13.3, 13.5_

  - [ ] 8.2 Migrate UMKM campaign list page (`/dashboard/umkm/campaign`)
    - Create/update `src/app/dashboard/umkm/campaign/page.tsx` (Server Component)
    - Create `src/components/features/umkm-dashboard/campaign/CampaignListClient.tsx` ("use client")
    - Migrate CampaignCard, CampaignEmptyState, CampaignSkeleton
    - Use shadcn Table or Card grid, Badge for status, Input for search
    - _Requirements: 5.2, 5.9, 5.10, 5.11, 13.2, 13.3_

  - [ ] 8.3 Migrate UMKM campaign create wizard (`/dashboard/umkm/campaign/buat`)
    - Create/update `src/app/dashboard/umkm/campaign/buat/page.tsx` (Server Component)
    - Create `src/components/features/umkm-dashboard/create-campaign/CampaignCreateClient.tsx` ("use client")
    - Multi-step form with shadcn Tabs + Form + Input + Select
    - Integrate react-hook-form + Zod validation
    - Submit disabled while isSubmitting; toast on success/error
    - _Requirements: 5.3, 5.9, 13.2, 14.1, 14.2, 14.4, 14.6, 11.3, 11.4_

  - [ ] 8.4 Migrate UMKM campaign detail page (`/dashboard/umkm/campaign/[campaignId]`)
    - Create/update `src/app/dashboard/umkm/campaign/[campaignId]/page.tsx` (Server Component)
    - Create `src/components/features/umkm-dashboard/campaign/detail/CampaignDetailClient.tsx` ("use client")
    - Progress tracking, action buttons, submission section using shadcn components
    - _Requirements: 5.4, 5.9, 5.10, 5.11, 13.2, 13.3_

  - [ ] 8.5 Migrate UMKM kreator directory page (`/dashboard/umkm/kreator`)
    - Create/update `src/app/dashboard/umkm/kreator/page.tsx` (Server Component)
    - Create `src/components/features/umkm-dashboard/creators/CreatorDirectoryClient.tsx` ("use client")
    - Card grid, shadcn Input for search, Select for filter
    - _Requirements: 5.5, 5.9, 5.10, 5.11, 13.2, 13.3_

  - [ ] 8.6 Migrate UMKM keuangan page (`/dashboard/umkm/keuangan`)
    - Create/update `src/app/dashboard/umkm/keuangan/page.tsx` (Server Component)
    - Create `src/components/features/umkm-dashboard/finance/KeuanganClient.tsx` ("use client")
    - Recharts charts with Marketiv color palette via ChartContainer
    - shadcn Table for transactions, summary metric cards
    - Empty state and error state handling for chart data
    - _Requirements: 5.6, 5.9, 5.10, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ] 8.7 Create UMKM analitik page (`/dashboard/umkm/analitik`) [NEW ROUTE]
    - Create `src/app/dashboard/umkm/analitik/page.tsx` (Server Component)
    - Create `src/components/features/umkm-dashboard/analytics/AnalitikClient.tsx` ("use client")
    - Migrate InsightSection from prototype
    - Minimum 2 chart visualizations (Recharts) + 1 metrics summary section
    - Use Marketiv chart color palette, ResponsiveContainer, min height 200px
    - _Requirements: 5.7, 5.12, 10.3, 10.4, 10.5, 10.6, 12.3_

  - [ ] 8.8 Create UMKM pengaturan page (`/dashboard/umkm/pengaturan`) [NEW ROUTE]
    - Create `src/app/dashboard/umkm/pengaturan/page.tsx` (Server Component)
    - Create `src/components/features/umkm-dashboard/settings/PengaturanClient.tsx` ("use client")
    - Settings form with shadcn Form + Input + Select + Switch (minimum 3 configurable fields)
    - react-hook-form + Zod validation, FormMessage for errors
    - Toast on save success/error
    - _Requirements: 5.8, 5.12, 14.1, 14.2, 14.4, 14.5, 14.6, 11.3, 11.4, 12.3_

  - [ ]* 8.9 Write integration tests for UMKM pages
    - Test each UMKM route renders without crash
    - Test campaign list shows cards/table from data layer
    - Test empty states render when data is empty
    - _Requirements: 5.9, 5.10, 12.1_

- [ ] 9. Checkpoint - Verify UMKM pages build
  - Ensure `next build` passes with all UMKM pages, ask the user if questions arise.

- [ ] 10. Migrate Creator dashboard pages
  - [ ] 10.1 Migrate Creator overview page (`/dashboard/kreator`)
    - Create/update `src/app/dashboard/kreator/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/overview/CreatorOverviewClient.tsx` ("use client")
    - Migrate CreatorMetricCard, CreatorActionCard as sub-components
    - Metrics: total earnings, active jobs, completed jobs, pending negotiations
    - Recent activity list (max 10 items), quick action buttons with navigation
    - _Requirements: 6.1, 6.11, 6.13, 13.2, 13.3_

  - [ ] 10.2 Migrate Creator job pool page (`/dashboard/kreator/job-pool`)
    - Create/update `src/app/dashboard/kreator/job-pool/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/job-pool/JobPoolClient.tsx` ("use client")
    - Migrate CreatorFilterToolbar, CreatorStatusBadge
    - Toggle list/grid view, filter by category/status, sort by date/reward
    - Job cards with reward, quota, deadline, status
    - _Requirements: 6.2, 6.11, 6.13, 13.2, 13.3_

  - [ ] 10.3 Migrate Creator job detail page (`/dashboard/kreator/job-pool/[id]`)
    - Create/update `src/app/dashboard/kreator/job-pool/[id]/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/job-pool/JobDetailClient.tsx` ("use client")
    - Display: judul, deskripsi, reward, deadline, quota, persyaratan, asset links, brand info
    - Apply action button
    - _Requirements: 6.3, 6.11, 13.2, 13.3_

  - [ ] 10.4 Migrate Creator pekerjaan aktif page (`/dashboard/kreator/pekerjaan-aktif`)
    - Create/update `src/app/dashboard/kreator/pekerjaan-aktif/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/active-jobs/PekerjaanAktifClient.tsx` ("use client")
    - Active jobs list with progress bar, deadline countdown, status badge
    - _Requirements: 6.4, 6.11, 6.13, 13.2, 13.3_

  - [ ] 10.5 Migrate Creator submit bukti page (`/dashboard/kreator/pekerjaan-aktif/[id]`)
    - Create/update `src/app/dashboard/kreator/pekerjaan-aktif/[id]/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/active-jobs/SubmitBuktiClient.tsx` ("use client")
    - URL input form (TikTok/Instagram), preview, confirmation Dialog before submit
    - Toast on success/error
    - _Requirements: 6.5, 6.11, 11.3, 11.4, 13.2, 14.1_

  - [ ] 10.6 Migrate Creator negosiasi list page (`/dashboard/kreator/negosiasi`)
    - Create/update `src/app/dashboard/kreator/negosiasi/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/negotiation/NegosiasiListClient.tsx` ("use client")
    - Negotiation cards: brand/UMKM name, package, price, status badge (menunggu, diterima, ditolak, expired)
    - _Requirements: 6.6, 6.11, 6.13, 13.2, 13.3_

  - [ ] 10.7 Migrate Creator negosiasi room page (`/dashboard/kreator/negosiasi/[id_order]`)
    - Create/update `src/app/dashboard/kreator/negosiasi/[id_order]/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/negotiation/NegosiasiRoomClient.tsx` ("use client")
    - Chronological message list, counter-offer form (price + notes), accept/reject buttons
    - Collab Post warning indicator
    - _Requirements: 6.7, 6.11, 13.2, 14.1_

  - [ ] 10.8 Migrate Creator profil page (`/dashboard/kreator/profil`)
    - Create/update `src/app/dashboard/kreator/profil/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/profile/ProfilClient.tsx` ("use client")
    - Profile form (nama, bio, niche, social media links) with react-hook-form + Zod
    - Avatar upload (JPG/PNG/WebP, max 2MB)
    - Toast on save
    - _Requirements: 6.8, 6.11, 14.1, 14.2, 14.3, 14.5, 14.6, 11.3_

  - [ ] 10.9 Migrate Creator rate card page (`/dashboard/kreator/rate-card`)
    - Create/update `src/app/dashboard/kreator/rate-card/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/rate-card/RateCardClient.tsx` ("use client")
    - Pricing table: nama paket, deskripsi, harga, durasi
    - CRUD actions (tambah, edit, hapus) via Dialog forms
    - _Requirements: 6.9, 6.11, 14.1, 14.4, 11.3_

  - [ ] 10.10 Migrate Creator keuangan page (`/dashboard/kreator/keuangan`)
    - Create/update `src/app/dashboard/kreator/keuangan/page.tsx` (Server Component)
    - Create `src/components/features/creator-dashboard/finance/KreatorKeuanganClient.tsx` ("use client")
    - Earnings summary chart (Recharts, Marketiv palette)
    - Withdrawal request form (dummy/simulation)
    - Transaction history with filter (period, type)
    - _Requirements: 6.10, 6.11, 10.3, 10.4, 10.5, 10.6, 13.2_

  - [ ]* 10.11 Write integration tests for Creator pages
    - Test each Creator route renders without crash
    - Test empty states render when data is empty
    - Test error states show retry CTA
    - _Requirements: 6.11, 6.12, 6.13, 12.2_

- [ ] 11. Checkpoint - Verify Creator pages build
  - Ensure `next build` passes with all Creator pages, ask the user if questions arise.

- [ ] 12. Implement cross-cutting concerns (icons, animation, responsive, forms)
  - [ ] 12.1 Replace ad-hoc toast patterns with Sonner across existing components
    - Find and replace showToast/setToastMessage/setTimeout patterns
    - Replace with `toast.success()` / `toast.error()` from sonner
    - Ensure "use client" on files using toast()
    - _Requirements: 11.6, 11.3, 11.4_

  - [ ] 12.2 Implement page transition animation wrapper
    - Create `src/components/ui/page-transition.tsx` using motion library
    - Fade-in + slide-up (opacity 0→1, y 12→0), duration 300ms, ease [0.2, 0.8, 0.2, 1]
    - "use client" directive required
    - Apply to layout main content areas
    - _Requirements: 9.1, 9.3, 9.6_

  - [ ] 12.3 Implement ResponsiveModal pattern (Dialog on desktop, Drawer on mobile)
    - Create `src/components/ui/responsive-modal.tsx`
    - Uses useIsMobile hook to conditionally render Dialog vs Drawer (Vaul)
    - Apply to DashboardModal and any modal usage in migrated pages
    - _Requirements: 15.1, 15.2, 15.3_

  - [ ] 12.4 Add responsive table pattern for mobile viewports
    - Wrap table components with overflow-x-auto container
    - Ensure min-width for horizontal scroll on mobile
    - _Requirements: 15.4_

  - [ ] 12.5 Document icon usage guidelines
    - Add steering/README note: Lucide for new/shadcn components, Phosphor for legacy
    - Verify all icon-only buttons have aria-label across migrated pages
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ] 12.6 Verify React 19 compatibility across migrated files
    - Audit for remaining forwardRef patterns; convert to direct ref prop
    - Verify no react-router imports remain (replace with next/navigation)
    - Ensure all `<img>` replaced with Next.js Image where applicable
    - Ensure all internal links use Next.js Link component
    - _Requirements: 13.1, 13.4, 13.5, 13.6_

  - [ ]* 12.7 Write responsive tests for sidebar and modals
    - Test sidebar renders as Sheet on mobile viewport (<768px)
    - Test ResponsiveModal renders Drawer on mobile, Dialog on desktop
    - Test table horizontal scroll on mobile
    - _Requirements: 15.2, 15.4, 15.5_

- [ ] 13. Final checkpoint - Full build verification
  - Run `next build` and ensure zero errors
  - Verify all routes render without blank pages
  - Confirm no TypeScript errors (`tsc --noEmit`)
  - Ensure all existing service layer functions remain callable
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each migration phase
- The design uses TypeScript throughout; all implementation targets Next.js 16 with React 19
- Prototype source: `C:\Users\user\Downloads\Implement PRD with UI Kits\`
- Production target: `C:\Users\user\marketiv-web\`
- Existing data layer (src/data/, src/services/) must NOT be replaced
- Icon strategy: Lucide React for new components, Phosphor Icons for existing (no bulk replace)
- All "use client" directives must be first line before imports

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4"] },
    { "id": 2, "tasks": ["1.5"] },
    { "id": 3, "tasks": ["2.1"] },
    { "id": 4, "tasks": ["2.2", "2.3"] },
    { "id": 5, "tasks": ["2.4", "2.5"] },
    { "id": 6, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 7, "tasks": ["4.7", "4.8"] },
    { "id": 8, "tasks": ["4.9"] },
    { "id": 9, "tasks": ["6.1", "6.2"] },
    { "id": 10, "tasks": ["6.3", "6.4", "6.5"] },
    { "id": 11, "tasks": ["6.6"] },
    { "id": 12, "tasks": ["8.1", "8.2", "8.5"] },
    { "id": 13, "tasks": ["8.3", "8.4", "8.6", "8.7", "8.8"] },
    { "id": 14, "tasks": ["8.9"] },
    { "id": 15, "tasks": ["10.1", "10.2", "10.6"] },
    { "id": 16, "tasks": ["10.3", "10.4", "10.5", "10.7", "10.8", "10.9", "10.10"] },
    { "id": 17, "tasks": ["10.11"] },
    { "id": 18, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5", "12.6"] },
    { "id": 19, "tasks": ["12.7"] }
  ]
}
```
