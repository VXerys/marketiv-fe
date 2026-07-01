# Design Document

## Overview

This design document describes how to refine the Marketiv UMKM and Konten Kreator dashboards using the design system reference:

```txt
docs/design-system/marketiv-studio-system-v5-8.html
```

The goal is to transform the current sliced dashboard from “feature-complete UI” into a **consistent, responsive, premium, and demo-ready product interface**.

This is a UI system alignment pass, not a feature expansion pass.

---

## Design Intent from the UI Kit

The UI kit positions Marketiv as:

> A calmer system for faster product decisions.

The dashboard must feel:

- calm,
- structured,
- warm,
- premium,
- SaaS-like,
- trustworthy,
- mobile-first,
- marketplace-ready.

The UI must avoid looking like disconnected template sections.

---

## Visual Foundation

### Color Direction

Use the design tokens from the UI kit as the visual reference.

Recommended token mapping:

| Purpose | UI Kit Reference | Suggested Usage |
|---|---|---|
| Primary text | `--ink-950`, `--ink-900` | Main text, title, high emphasis |
| Secondary text | `--ink-600`, `--ink-500` | Description, metadata, helper text |
| App background | `--paper`, `--paper-2`, `--paper-3` | Dashboard background/surface |
| Primary CTA | `--orange-500`, `--orange-600`, `--orange-700` | Primary buttons, active nav, key accents |
| Emphasis | `--navy-900`, `--navy-800`, `--navy-700` | Sidebar, hero cards, finance wallet cards |
| Success | `--green` | Valid, success, completed |
| Warning | `--yellow` | Pending, warning, needs review |
| Error | `--red` | Fraud, failed, destructive action |
| Info | `--blue` | Informational status |
| AI / special | `--purple` | AI assistant, special insights |

### Background System

Use the UI kit background direction:

- warm cream base,
- subtle radial orange/navy glow,
- optional light grid texture only if already part of global design,
- avoid harsh gray backgrounds,
- avoid unrelated gradients per page.

Recommended dashboard background:

```css
background:
  radial-gradient(circle at 12% 0%, rgba(249, 115, 22, 0.08), transparent 28rem),
  radial-gradient(circle at 96% 10%, rgba(30, 58, 95, 0.08), transparent 32rem),
  linear-gradient(180deg, #fffaf3 0%, #fbf7ef 42%, #f6eee3 100%);
```

Implementation may translate this into Tailwind/CSS variables, but the visual result must follow the UI kit.

---

## Typography

The UI kit uses:

- `Sora` for display/headline/product emphasis,
- `Plus Jakarta Sans` for body/dashboard readability.

If both fonts are already installed, preserve this pair. If not, use the closest existing project fonts while keeping hierarchy consistent.

### Typography Rules

- Page title must be visually stronger than section title.
- Section title must be stronger than card title.
- Card metadata must be smaller and lower-contrast.
- Metric values must be bold, compact, and readable.
- Avoid overly long button text on mobile.
- Use Indonesian copy for user-facing dashboard labels.

---

## Component Architecture

### Existing Shared Dashboard Components

The repo already contains dashboard primitives from previous dashboard work. Use or normalize around these primitives:

- `DashboardCard`
- `DashboardMetricCard`
- `DashboardBadge`
- `DashboardButton`
- `DashboardProgress`
- `DashboardActionMenu`
- `ResponsiveDataRow`
- `ResponsiveDataCell`

### Primitive Design Rules

#### DashboardCard

Must support:

- default surface,
- highlighted/featured variant,
- subtle/nested variant,
- danger/review variant,
- no overflow,
- flexible header/footer slots.

Visual style:

- large radius: 24px–32px,
- border: rgba black 6–10%,
- shadow: soft and low opacity,
- warm white surface,
- optional subtle radial glow for featured cards.

#### DashboardMetricCard

Must support:

- icon slot,
- label,
- value,
- note,
- trend/status badge,
- compact currency formatting,
- 2–3–4 grid compatibility.

#### DashboardBadge

Must support semantic tones:

- default/gray,
- orange,
- green,
- yellow,
- red,
- blue,
- navy,
- purple.

Badge requirements:

- pill shape,
- no overflow,
- clear text,
- not color-only dependent,
- consistent height.

#### DashboardButton

Must support:

- primary,
- secondary,
- outline,
- ghost/subtle,
- danger,
- icon,
- full-width mobile behavior.

#### ResponsiveDataRow

Must support:

- desktop row layout,
- mobile stacked card layout,
- safe title/metadata overflow,
- consistent action placement.

---

## Layout System

### Dashboard Shell

Do not duplicate the dashboard shell.

All dashboard pages must use the existing dashboard shell/sidebar/topbar if available.

Layout must provide:

- sidebar/navigation,
- topbar/header context,
- content container,
- responsive navigation behavior,
- safe content width,
- consistent page padding.

### Page Layout Patterns

#### Overview Page

Use:

1. page header,
2. metric grid,
3. quick actions,
4. main content grid,
5. recent activity/feed.

#### List Page

Use:

1. page header,
2. summary cards,
3. toolbar search/filter/sort,
4. card grid or responsive data rows,
5. empty/loading/error states.

#### Detail Page

Use:

1. back button,
2. detail header,
3. metric overview,
4. main content,
5. sidebar/support panel,
6. activity/status timeline,
7. not-found/loading/error states.

#### Wizard Page

Use:

1. page header,
2. stepper,
3. active form step,
4. live preview/sidebar,
5. footer navigation,
6. validation and success modals.

#### Room/Chat Page

Use:

1. room header,
2. required warning banner,
3. chat/content area,
4. order summary sidebar,
5. composer/action area,
6. loading/empty/error/not-found states.

---

## Responsive System

### Breakpoint QA Targets

Every dashboard route must be checked at:

```txt
375px  - small mobile baseline
430px  - large mobile
768px  - tablet
1024px - small laptop/tablet landscape
1280px - standard desktop
1440px - large desktop
```

### Metric Grid Rule

Use dashboard 2–3–4 rule from the UI kit:

```txt
Mobile:  2 columns
Tablet:  3 columns
Desktop: 4 columns
```

Use fewer columns if content is too long.

### Mobile Rules

- Single column for complex content.
- CTA full-width where needed.
- Toolbar controls stack or wrap.
- Cards must not overflow.
- Tables must become stacked cards or responsive rows.
- Modals must be scroll-safe.
- Currency should use compact format in cards.

### Tablet Rules

- Use 2 columns where safe.
- Toolbar can wrap.
- Sidebar content may stack below main content.

### Desktop Rules

- Detail pages may use 8/4 or 9/3 main/sidebar grid.
- Avoid excessive blank whitespace.
- Use sticky sidebar only if it does not block content.

---

## Screen State System

The UI kit defines a strict rule:

> Tidak ada blank page. Semua kondisi punya arah aksi.

Every async or data-driven page must implement:

1. Loading state
2. Empty state
3. Filtered empty state
4. Error state
5. Not-found state for detail pages
6. Success feedback where applicable

### Loading State

Use shimmer/skeleton, not generic spinner.

Skeleton should match:

- page header,
- metric cards,
- toolbar,
- card/list rows,
- detail/sidebar areas.

### Empty State

Empty state must include:

- icon/visual,
- clear title,
- helpful description,
- primary CTA where relevant.

### Error State

Error state must include:

- clear title,
- actionable description,
- retry button.

### Not Found State

Detail route not-found must include:

- clear title,
- description,
- CTA back to list.

---

## Domain Design Rules

### Campaign Mode

Campaign Mode is performance-based and zero-chat.

Allowed UI:

- browse campaign/job,
- view brief,
- claim job,
- submit public TikTok/Instagram URL,
- view validation status,
- view escrow/reward estimate.

Forbidden UI:

- chat,
- WhatsApp,
- direct message,
- contact creator/UMKM,
- comments,
- upload final video to Marketiv.

### Rate Card Mode

Rate Card Mode is consultative fixed-price collaboration.

Allowed UI:

- chat,
- custom offer,
- order summary,
- escrow/payment simulation,
- collab post warning,
- submit final result URL.

Required:

- Collab Post warning in negotiation room.
- Clear separation from Campaign Mode.

### Finance/Escrow

For current UI-only phase:

- payment is simulation only,
- withdrawal is simulation only,
- escrow status is dummy/read-only,
- financial copy must emphasize safety and clarity.

---

## Route Inventory for QA

### UMKM Routes

```txt
/dashboard/umkm
/dashboard/umkm/campaign
/dashboard/umkm/campaign/buat
/dashboard/umkm/campaign/[id]
/dashboard/umkm/kreator
/dashboard/umkm/kreator/[id]
/dashboard/umkm/negosiasi
/dashboard/umkm/negosiasi/[id_order]
/dashboard/umkm/keuangan
```

### Konten Kreator Routes

```txt
/dashboard/kreator
/dashboard/kreator/job-pool
/dashboard/kreator/job-pool/[id]
/dashboard/kreator/pekerjaan-aktif
/dashboard/kreator/pekerjaan-aktif/[id]
/dashboard/kreator/negosiasi
/dashboard/kreator/negosiasi/[id_order]
/dashboard/kreator/profil
/dashboard/kreator/rate-card
/dashboard/kreator/keuangan
```

If a route does not exist yet but is part of the intended dashboard flow, document it in the audit matrix instead of silently changing route architecture.

---

## Route Audit Matrix Format

Create or maintain a route audit table during refinement.

Recommended format:

| Route | Breakpoint | Issue | Severity | Component | Expected Fix | Status |
|---|---:|---|---|---|---|---|
| `/dashboard/kreator/job-pool` | 375px | Job card CTA overflows | High | JobCard | Stack CTA full-width | Todo |
| `/dashboard/umkm/campaign` | 768px | Toolbar wraps awkwardly | Medium | CampaignToolbar | Use responsive wrap and reset button | Todo |
| `/dashboard/umkm/keuangan` | 375px | Currency breaks card | High | MetricCard | Compact currency and min-w-0 | Todo |

---

## Implementation Strategy

### Phase A — Audit First

Before coding visual fixes:

1. Run project locally.
2. Open all dashboard routes.
3. Check breakpoints.
4. Record route-by-route issues.
5. Group issues by component pattern.

Do not start by editing random pages.

### Phase B — Normalize Primitives

Fix common primitives first:

- DashboardCard
- DashboardMetricCard
- DashboardBadge
- DashboardButton
- DashboardProgress
- ResponsiveDataRow
- Modal primitives
- Skeleton primitives

This reduces repeated fixes.

### Phase C — Fix High-Risk Routes

Prioritize routes with:

- mobile overflow,
- broken card grid,
- modal overflow,
- invalid domain UI,
- non-functional CTA,
- poor dashboard overview quality.

### Phase D — State and Modal QA

Ensure every page has:

- loading,
- empty,
- filtered empty,
- error,
- not-found,
- success feedback.

### Phase E — Final Build and Regression Check

Run:

```bash
npm run build
```

If available, also run:

```bash
npm run lint
npm run typecheck
```

Document results.

---

## File Organization Guidance

Prefer structure like:

```txt
src/components/features/dashboard/shared/
src/components/features/umkm-dashboard/
src/components/features/kreator-dashboard/
src/components/features/dashboard/modals/
src/constants/dashboard.constants.ts
src/lib/formatters.ts
src/lib/responsive-utils.ts
src/mocks/umkm/
src/mocks/kreator/
src/services/umkm/
src/services/kreator/
src/types/umkm-dashboard.types.ts
src/types/kreator-dashboard.types.ts
```

Adapt to existing project structure. Do not create duplicate structures if the repo already has equivalents.

---

## Accessibility Requirements

- Icon-only buttons must have `aria-label`.
- External links must use `target="_blank"` and `rel="noreferrer"`.
- Form fields must have labels.
- Error messages must be visible and actionable.
- Modal title/description must be programmatically clear.
- Status must not depend only on color.
- Focus state must remain visible.

---

## Performance and Maintainability

- Do not add new dependencies unless absolutely required.
- Do not duplicate large JSX blocks.
- Do not hardcode repeated design classes in every screen if a primitive exists.
- Do not hardcode large mock arrays inside page components.
- Keep helpers for currency, date, status tone, and progress calculation centralized.
- Keep component files focused and readable.

---

## Success Criteria

This spec is complete when:

1. All UMKM and Konten Kreator dashboard routes visually align with the UI kit.
2. No route has horizontal overflow at 375px.
3. Cards, badges, buttons, metric cards, rows, and modals are consistent.
4. Every relevant route has loading, empty, filtered empty, error, and not-found states.
5. Campaign Mode has no chat/contact/final upload UI.
6. Rate Card Mode has chat/custom offer only in negotiation pages.
7. All modals are mobile-safe.
8. All primary CTAs have route or dummy behavior.
9. `npm run build` passes.
10. Remaining backend TODOs are documented, not mixed into UI refinement.
