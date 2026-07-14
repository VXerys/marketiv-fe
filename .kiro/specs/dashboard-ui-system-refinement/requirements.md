# Requirements Document

## Introduction

This spec defines the **Marketiv Dashboard UI System Refinement** workstream.

The current Marketiv dashboard for **UMKM** and **Konten Kreator** already has UI slicing and core user flows. The next work is not feature expansion. The next work is a structured UI quality pass to make the dashboard visually consistent, responsive, and aligned with the design system reference:

```txt
docs/design-system/marketiv-studio-system-v5-8.html
```

That UI kit is the **source of truth** for the dashboard visual direction, component shape, background treatment, spacing rhythm, card style, interaction pattern, state handling, and responsive behavior.

The refined dashboard must feel like a single cohesive SaaS product, not a collection of independently sliced screens.

---

## Business Goal

Marketiv needs a dashboard that is credible enough for demo, P2MW presentation, client review, and future backend integration.

The UI must communicate:

- trust for UMKM users,
- earning opportunity for creators,
- marketplace clarity,
- escrow/payment safety,
- modern and premium product quality,
- mobile-first usability.

---

## Source of Truth

### Primary UI Reference

Use this file as the main visual reference:

```txt
docs/design-system/marketiv-studio-system-v5-8.html
```

The implementation must extract and apply the design intent from that file, especially:

- warm cream/white background,
- soft orange primary accent,
- deep navy emphasis,
- large rounded cards,
- subtle borders,
- soft shadows,
- pill badges,
- clean typography hierarchy,
- shimmer loading state,
- premium marketplace cards,
- dashboard 2–3–4 responsive metric grid,
- mobile-first layout behavior,
- no blank page rule,
- Campaign Mode and Rate Card Mode domain boundaries.

### Important UI Kit Sections to Follow

The dashboard implementation must align with these conceptual sections from the UI kit:

1. Foundation
2. Primitives
3. Dashboard Components
4. Marketiv Domain
5. Marketplace Cards
6. Screen States
7. Brand Voice
8. Role Surfaces
9. UMKM Top Up Flow
10. Commerce & Escrow
11. AI Patterns
12. Analytics & Admin Review
13. Mobile-first Components
14. Layout Patterns
15. Quality Checklist
16. Motion

---

## Definitions

### Dashboard Scope

This spec covers all existing dashboard UI for:

#### UMKM

- Overview
- Campaign
- Campaign Create Wizard
- Campaign Detail
- Kreator Directory
- Kreator Profile
- Negosiasi Rate Card
- Keuangan
- Top Up / Escrow simulation

#### Konten Kreator

- Overview
- Job Pool
- Job Detail / Claim
- Pekerjaan Aktif
- Submit Bukti Tayang
- Negosiasi Rate Card
- Room Chat Rate Card
- Profil
- Rate Card
- Keuangan

### Refinement Scope

This spec focuses on:

- visual consistency,
- responsive layout,
- card shape and spacing,
- dashboard primitive reuse,
- state consistency,
- modal behavior,
- mobile usability,
- overflow prevention,
- route flow testing,
- domain rule validation.

### Out of Scope

Do not implement or change:

- real Appwrite/Supabase integration,
- real Midtrans payment,
- real escrow disbursement,
- real AI integration,
- real TikTok/Instagram API validation,
- real realtime chat,
- new business features,
- unrelated landing page redesign.

---

## Requirement 1 — Design System Alignment

### User Story

As a product owner, I want every dashboard screen to follow the Marketiv Studio System UI kit, so that the dashboard looks consistent, premium, and demo-ready.

### Acceptance Criteria

1. WHEN a dashboard screen is opened THEN it SHALL use the same warm visual language defined in `marketiv-studio-system-v5-8.html`.
2. WHEN a screen has a background THEN it SHALL use a warm cream/white surface direction, not random gray or unrelated gradients.
3. WHEN primary actions are rendered THEN they SHALL use the orange primary visual treatment from the UI kit.
4. WHEN emphasis sections are rendered THEN they SHALL use dark navy/charcoal only where emphasis is needed.
5. WHEN cards are rendered THEN they SHALL use large radius, subtle border, soft shadow, and clean inner spacing.
6. WHEN badges are rendered THEN they SHALL use consistent pill shape, readable label, semantic tone, and no overflow.
7. WHEN multiple dashboard sections appear on the same page THEN they SHALL follow a consistent spacing rhythm.
8. WHEN a page has old/manual styling THEN it SHALL be refactored to use shared dashboard primitives or matching design tokens.

---

## Requirement 2 — Shared Dashboard Primitives

### User Story

As a frontend developer, I want dashboard pages to use shared primitives, so that component shape, spacing, status, and actions remain consistent across UMKM and Kreator dashboards.

### Acceptance Criteria

1. WHEN a card is needed THEN the implementation SHALL use `DashboardCard` or a dashboard primitive equivalent.
2. WHEN a metric card is needed THEN the implementation SHALL use `DashboardMetricCard` or a dashboard primitive equivalent.
3. WHEN a status/category badge is needed THEN the implementation SHALL use `DashboardBadge` or a dashboard primitive equivalent.
4. WHEN a button is needed THEN the implementation SHALL use `DashboardButton` or a dashboard primitive equivalent.
5. WHEN a progress bar is needed THEN the implementation SHALL use `DashboardProgress` or a dashboard primitive equivalent.
6. WHEN row/list/table data is rendered THEN it SHALL use responsive row primitives or a mobile-safe card layout.
7. WHEN action menus are rendered THEN they SHALL use a consistent dashboard action menu pattern.
8. IF a primitive is missing THEN it SHALL be created once in a shared dashboard component folder, not recreated per page.
9. IF an existing page uses manual repeated Tailwind class strings for common UI elements THEN those patterns SHALL be migrated to primitives.

---

## Requirement 3 — Responsive Layout Quality

### User Story

As a mobile-first user, I want the dashboard to work cleanly on small screens, so that I can use Marketiv from a smartphone without broken layouts.

### Acceptance Criteria

1. WHEN the viewport is 375px wide THEN no dashboard route SHALL create horizontal scrolling.
2. WHEN the viewport is 430px wide THEN card content SHALL remain readable and not overflow.
3. WHEN the viewport is 768px wide THEN layouts SHALL use tablet-friendly columns without cramped cards.
4. WHEN the viewport is 1024px wide THEN dashboards SHALL avoid excessive whitespace and preserve hierarchy.
5. WHEN the viewport is 1280px or wider THEN dashboards SHALL use desktop layout efficiently.
6. WHEN a metric grid is rendered THEN it SHALL follow the dashboard 2–3–4 rule: 2 columns on mobile, 3 on tablet, and 4 on desktop where appropriate.
7. WHEN a table is rendered on mobile THEN it SHALL transform into responsive stacked cards or a safe responsive row layout.
8. WHEN a modal is opened on mobile THEN it SHALL fit within the viewport and allow internal scrolling if needed.
9. WHEN a toolbar has filters THEN it SHALL stack, wrap, or scroll safely on mobile without clipping.

---

## Requirement 4 — Card Consistency and Marketplace Quality

### User Story

As a Marketiv user, I want marketplace and dashboard cards to look consistent and informative, so that I can scan campaigns, creators, jobs, orders, and transactions quickly.

### Acceptance Criteria

1. WHEN a campaign card is shown THEN it SHALL include clear identity, value, status, availability, and primary CTA.
2. WHEN a creator card is shown THEN it SHALL include avatar/profile identity, niche, trust signal, starting price/rate, and CTA.
3. WHEN a job card is shown THEN it SHALL include reward, budget/escrow signal, quota, deadline, status, and CTA.
4. WHEN an order card is shown THEN it SHALL include package, scope, deadline, price, escrow/payment status, and CTA.
5. WHEN a finance card is shown THEN currency values SHALL use compact formatting in summary areas and full formatting in detail areas.
6. WHEN cards appear in a grid THEN card heights SHALL be visually balanced where reasonable.
7. WHEN a card has long title, URL, currency, or badges THEN it SHALL handle text overflow safely using `min-w-0`, `truncate`, `line-clamp`, or `overflow-wrap` as appropriate.
8. WHEN card CTAs appear on mobile THEN they SHALL stack or become full-width when needed.

---

## Requirement 5 — Screen States

### User Story

As a user, I want every screen to show useful states, so that I never see a blank, broken, or confusing page.

### Acceptance Criteria

1. WHEN a page is loading THEN it SHALL show shimmer/skeleton matching the final layout shape.
2. WHEN a list has no data THEN it SHALL show an empty state with title, description, and relevant CTA.
3. WHEN filters return no result THEN it SHALL show a filtered empty state with reset filter CTA.
4. WHEN data fails to load THEN it SHALL show an error state with retry CTA.
5. WHEN a detail route receives an invalid ID THEN it SHALL show a not-found state with back-to-list CTA.
6. WHEN a success action happens THEN it SHALL show a clear success modal, toast, or inline feedback.
7. WHEN an action is destructive THEN it SHALL show a confirmation modal and not use browser alert.

---

## Requirement 6 — Domain Rule Enforcement

### User Story

As the Marketiv product owner, I want UI flows to respect Campaign Mode and Rate Card Mode rules, so that the dashboard does not create wrong user expectations.

### Acceptance Criteria

1. WHEN a screen belongs to Campaign Mode THEN it SHALL NOT show chat, WhatsApp, direct contact, direct message, comment, or final video upload actions.
2. WHEN a creator submits proof for Campaign Mode THEN the UI SHALL only accept public TikTok/Instagram URL as proof.
3. WHEN a campaign displays asset access THEN large video assets SHALL be represented as external Google Drive/Dropbox URLs.
4. WHEN a screen belongs to Rate Card Mode THEN chat and custom offer UI MAY be shown.
5. WHEN a Rate Card room is displayed THEN it SHALL show a Collab Post warning.
6. WHEN finance/payment UI is shown during this phase THEN it SHALL clearly be dummy/simulation only.

---

## Requirement 7 — Modal and Interaction Quality

### User Story

As a user, I want modals and actions to feel predictable, so that dashboard demo flows can be clicked without visual or interaction issues.

### Acceptance Criteria

1. WHEN a modal opens THEN it SHALL have title, description, primary action, secondary action, and close behavior.
2. WHEN a modal opens on mobile THEN it SHALL not overflow outside the viewport.
3. WHEN a dummy payment, withdrawal, claim, submit, or save action is triggered THEN it SHALL show clear demo feedback.
4. WHEN a CTA is visible THEN it SHALL either navigate to a route or trigger a dummy interaction.
5. WHEN an icon-only button is used THEN it SHALL include an accessible label.
6. WHEN an external URL is opened THEN it SHALL use safe external link attributes.

---

## Requirement 8 — Typography and Content Tone

### User Story

As an UMKM or creator user, I want dashboard copy to be clear and helpful, so that I understand what to do without technical confusion.

### Acceptance Criteria

1. WHEN UI copy explains escrow THEN it SHALL explain that dana ditahan aman sampai pekerjaan/validasi selesai.
2. WHEN UI copy explains AI THEN it SHALL position AI as assistant/draft support, not final decision maker.
3. WHEN UI copy explains errors THEN it SHALL provide actionable resolution.
4. WHEN buttons are rendered THEN their labels SHALL be specific, not vague generic labels like “Submit” where context is needed.
5. WHEN status labels are rendered THEN they SHALL use Indonesian terms consistently across UMKM and Kreator dashboards.

---

## Requirement 9 — QA and Route Verification

### User Story

As a developer, I want a deterministic QA checklist for every dashboard route, so that visual and responsive issues can be found before backend integration.

### Acceptance Criteria

1. WHEN the QA pass starts THEN every UMKM and Kreator dashboard route SHALL be manually opened.
2. WHEN a route is checked THEN it SHALL be checked at 375px, 430px, 768px, 1024px, 1280px, and 1440px.
3. WHEN a route has filters THEN search/filter/reset behavior SHALL be tested.
4. WHEN a route has detail pages THEN valid and invalid IDs SHALL be tested.
5. WHEN a route has modals THEN open, close, confirm, and cancel states SHALL be tested.
6. WHEN QA finds visual issues THEN they SHALL be recorded in a route audit matrix before implementation.
7. WHEN all fixes are complete THEN `npm run build` SHALL pass.
8. WHEN lint/typecheck scripts exist THEN they SHALL pass or any remaining issues SHALL be documented.

---

## Requirement 10 — Non-Regression

### User Story

As a project owner, I want UI refinement to avoid breaking completed slicing work, so that existing dashboard flows remain available.

### Acceptance Criteria

1. WHEN UI refinement is performed THEN existing dashboard routes SHALL remain accessible.
2. WHEN shared primitives are changed THEN all pages using them SHALL be visually checked.
3. WHEN route structure exists THEN it SHALL not be renamed unless explicitly required.
4. WHEN mock/service files exist THEN they SHALL not be replaced with hardcoded arrays inside page components.
5. WHEN domain-specific pages exist THEN Campaign Mode and Rate Card Mode boundaries SHALL remain intact.
