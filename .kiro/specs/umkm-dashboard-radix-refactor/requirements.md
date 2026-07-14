# Requirements — UMKM Dashboard Radix Refactor

## Introduction

Fitur ini bertujuan untuk menyelaraskan visual dashboard UMKM di platform Marketiv agar konsisten dengan standar estetika **Marketiv Studio System v5.8**. Fokus utama dari spesifikasi ini adalah melakukan refaktorisasi kode pada **3 tab utama** fitur UMKM: **Overview**, **Campaign List**, dan **Discover Creators**. Refaktorisasi ini mengganti seluruh komponen wrapper kustom yang sudah `@deprecated` dengan komponen berbasis **Radix UI (melalui shadcn/ui)**, menghilangkan gaya inline layout yang tidak standar, serta menerapkan visual style premium (shadows, warm-cream paper tones, borders, glowing accents, dan corner-radii) yang sesuai dengan dokumentasi desain resmi.

---

## Requirements

### 1. Visual Style Alignment (Marketiv Studio System v5.8)

**User Story:** As a UMKM, I want a premium and consistent dashboard theme with warm paper-like card containers and soft orange glows, so that the platform feels professional, cohesive, and easy on the eyes.

#### Acceptance Criteria

1. WHERE any card container is rendered in the UMKM Dashboard, THE SYSTEM SHALL apply:
   - Background color: `var(--paper-2, #fffdf8)` (cream paper base) or gradient fallback.
   - Border radius: `var(--radius-3, 26px)` for main cards and `var(--radius-2, 18px)` for inner dashboard panels.
   - Border style: `1px solid var(--border, rgba(17, 24, 39, .10))`.
   - Shadow style: `var(--shadow-1, 0 8px 24px rgba(15, 23, 42, .06))` for default states, and `var(--shadow-2, 0 18px 46px rgba(15, 23, 42, .10))` for highlighted or hovered panels.
2. WHEN a primary button is rendered in the dashboard, THE SYSTEM SHALL apply:
   - Background: `linear-gradient(180deg, #fb7a18 0%, #ea580c 100%)`.
   - Border: `1px solid rgba(194, 65, 12, .22)`.
   - Box Shadow: `0 14px 30px rgba(234, 88, 12, .24), inset 0 1px 0 rgba(255, 255, 255, .22)`.
   - Hover state: Translate Y by `-2px` smoothly with custom easing (`var(--ease)`), and increase box shadow to `0 18px 38px rgba(234, 88, 12, .30)`.
3. WHEN a secondary button is rendered in the dashboard, THE SYSTEM SHALL apply:
   - Background: `linear-gradient(180deg, rgba(255, 255, 255, .96), rgba(250, 250, 250, .86))`.
   - Border: `1px solid rgba(17, 24, 39, .10)`.
   - Box Shadow: `0 10px 24px rgba(15, 23, 42, .06), inset 0 1px 0 rgba(255, 255, 255, .92)`.
4. WHEN an active state or high-priority accent is displayed (e.g. key action triggers, financial settlements), THE SYSTEM SHALL allow the option to apply a premium glowing effect `var(--orange-glow, 0 20px 60px rgba(249, 115, 22, .22))`.

---

### 2. Tab 1: Refactor Halaman Overview (Dashboard Utama)

**User Story:** As a UMKM, I want to view my dashboard overview with responsive KPI metrics, a clean bento grid layout, and flexible charts, so that I can monitor my business performance accurately at any screen size without layout shifting.

#### Acceptance Criteria

1. WHERE page-level container is rendered on `/dashboard/umkm`, THE SYSTEM SHALL use `UmkmPageWrapper` to ensure standard responsive padding (`clamp(16px, 3vw, 28px)`) and a `maxWidth` of `1400px`.
2. WHERE the top KPI metrics row is rendered, THE SYSTEM SHALL use `src/components/ui/card.tsx` as the backing container instead of the deprecated `DashboardCard`, and arrange them using the `.dashboard-rule-grid` (2-col mobile, 3-col tablet, 6-col desktop).
3. WHERE the main bento-grid layout is rendered (displaying active campaign preview, escrow stats, pending reviews, and analytics chart), THE SYSTEM SHALL use the `.bento-grid` layout pattern class.
4. WHERE Recharts charts (within `UmkmViewsChartCard.tsx`) are rendered, THE SYSTEM SHALL:
5. Nest the chart inside a `.chart-card-container` shell.
6. Wrap the `<ResponsiveContainer>` in a `.chart-inner` div to guarantee responsive height values (`240px` on mobile, `280px` on tablet, `320px` on desktop) without using hardcoded inline pixel heights.
7. IF the loading skeleton is displayed, THEN the skeleton bento layout and placeholders SHALL follow the exact same visual grids and card classes as the live state to prevent layout shift during loading.

---

### 3. Tab 2: Refactor Halaman Campaign List

**User Story:** As a UMKM, I want to manage my campaign list with unified card designs and responsive list alignment, so that I can see the progress of all my ongoing campaigns in a consistent structured format.

#### Acceptance Criteria

1. WHERE page-level container is rendered on `/dashboard/umkm/campaign`, THE SYSTEM SHALL apply the `UmkmPageWrapper` with an customized `maxWidth` prop of `1440px`.
2. WHERE campaigns list grid is displayed, THE SYSTEM SHALL replace all inline Tailwind grid class variations with the unified `.responsive-card-grid` (1→2→3→4 column layout).
3. WHERE campaign item cards are rendered, THE SYSTEM SHALL:
   - Standardize on `CampaignCard.tsx` using `src/components/ui/card.tsx` as the container component.
   - Apply `.campaign-card`, `.campaign-card-cover`, `.campaign-card-body`, and `.campaign-card-title` visual classes.
   - Retain only justified inline styles (such as dynamic progress-bar percentage widths or dynamic custom cover background gradients).
   - Ensure the card hover state raises by `-4px` vertically with a transition time of `0.24s` using `--ease`.

---

### 4. Tab 3: Refactor Halaman Discover Creators (Directory & Search)

**User Story:** As a UMKM, I want to browse available creators with clear rating badges, structured stats cards, and easy package details, so that I can find the best match for my brand campaign.

#### Acceptance Criteria

1. WHERE page-level container is rendered on `/dashboard/umkm/kreator`, THE SYSTEM SHALL use the `UmkmPageWrapper` with a `maxWidth` of `1400px`.
2. WHERE creator profiles list grid is displayed, THE SYSTEM SHALL replace inline grid layouts with the unified `.responsive-card-grid` layout helper.
3. WHERE creator profiles cards are rendered, THE SYSTEM SHALL:
   - Standardize on `CreatorCard.tsx` using `src/components/ui/card.tsx` as the container component.
   - Use CSS classes `.creator-card`, `.creator-card-header`, `.creator-card-avatar` (56x56px with a `var(--radius-2, 18px)` border radius and orange glow shadow), `.creator-card-stats`, `.creator-card-stat`, and `.creator-card-actions`.
   - Standardize stats cells background using `--ink-100` and typography utilizing Plus Jakarta Sans (with `font-weight: 820` for values and `font-weight: 700` for labels).
   - Clean up arbitrary Tailwind spacing overrides and keep creator directory headers consistent with the design system.

---

### 5. Radix & shadcn/ui UI Primitive Replacement (Eliminasi Deprecated Wrapper)

**User Story:** As a developer, I want all dashboard screens to use accessible Radix UI primitives through shadcn/ui components, so that we have clean imports, proper keyboard navigation, and zero legacy wrapper dependencies.

#### Acceptance Criteria

1. WHERE any of the selected 3 tabs (Overview, Campaign List, Discover Creators) are refactored, THE SYSTEM SHALL replace imports from `@/components/features/dashboard/shared/` with:
   - `DashboardCard` -> `Card` from `@/components/ui/card.tsx`
   - `DashboardButton` -> `Button` from `@/components/ui/button.tsx`
   - `DashboardBadge` -> `Badge` from `@/components/ui/badge.tsx`
   - `DashboardModal` -> `Dialog` from `@/components/ui/dialog.tsx` or `ResponsiveModal` from `@/components/ui/responsive-modal.tsx`
   - `DashboardProgress` -> `Progress` from `@/components/ui/progress.tsx`
2. THE SYSTEM SHALL delete any unused imports of deprecated wrapper components in the refactored files.
3. THE visual styles of the newly integrated shadcn/ui components SHALL match the design system tokens (`globals.css` variables mapped to shadcn tokens) to ensure zero change in brand colors.

---

## Success Metrics

- **Zero Layout Shift:** Cumulative Layout Shift (CLS) on tab transitions remains below `0.02`.
- **Zero Build Warnings:** `npm run build` runs successfully with zero warnings or errors.
- **Strict Accessibility:** All refactored buttons and interactive cards pass basic keyboard navigation (`Tab` focusable and `Enter` selectable).

---

## Constraints

- Mobile-first layouts (375px) must use appropriate flex column layouts for grids.
- All visual style assets and elements must adhere to variables loaded in `globals.css` (`--paper-2`, `--border`, `--shadow-1`, `--radius-3`, etc.).
- No chat components or WhatsApp links shall be implemented or visible in any Campaign Mode screens (Campaign Mode is strict zero-chat).
- Raw UMKM assets must point to OneDrive/Google Drive links (no video uploads directly to backend).

---

## Out of Scope

- Refactoring of negotiations (`/dashboard/umkm/negosiasi`) and finance (`/dashboard/umkm/keuangan`) screens (will be handled in a separate iteration).
- Refactoring of creator-side dashboard screens (`/dashboard/kreator/*`).
- Back-end integration (Supabase data connection) or payment gateway logic.
