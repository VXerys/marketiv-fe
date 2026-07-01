# Workflow — Component & Page Slicing SOP

This document provides a step-by-step Standard Operating Procedure (SOP) for slicing UI components and page layouts in Marketiv using Tailwind CSS v4 design tokens and the **Marketiv Light OS** visual parameters.

---

## Step 1 — Context & Content Extraction

Before writing any React component code, extract static text and dummy data to maintain clean, presentational code:

1. **Static Text:** Check if the page copy is already in `src/data/content.ts`. If not, add your new page content objects there using `UPPER_SNAKE_CASE` (e.g. `UMKM_CONTENT`, `CREATOR_CONTENT`).
2. **Dummy Lists:** Put any required tabular list datasets (e.g. mock campaigns, active orders, transaction ledger lines) into `src/data/` (e.g. `src/data/campaigns.ts`).
3. **Interfaces:** Declare the typescript types for the datasets inside `src/types/` (e.g. `src/types/campaign.ts`) so components are fully type-safe.

---

## Step 2 — Layout & Primitives Layout Slicing

1. **Page Wrapper:** Set up the main structural container using the warm off-white background:
   ```tsx
   <main className="min-h-screen bg-background">
   ```
2. **Dashboard Shell:** Wrap the page inside `<DashboardShell>` if it is a protected route.
3. **Desktop Grid vs Mobile Stack:**
   - Default stack structure: Use `flex flex-col` for mobile-first layout (tested at viewport **375px**).
   - Desktop grid upgrade: Add grid columns at breakpoints (e.g., `md:grid md:grid-cols-12 md:gap-6`).
4. **Spacing:** Maintain vertical rhythm using 4px base grids. Use spacing tokens like `gap-4`, `py-6`, `px-4 sm:px-6 md:px-8`.

---

## Step 3 — Design Token Styling (Tailwind v4)

Apply the visual guidelines defined in `docs/marketiv-md/ui-ux/02-design-tokens.md`:

1. **Card styling:**
   ```tsx
   <div className="bg-background-card rounded-lg border border-border-subtle p-6 shadow-sm">
   ```
2. **Typography Scale:**
   - Main page titles: `text-2xl font-bold text-text-primary` or class `text-heading-1`.
   - Subsection headings: `text-lg font-semibold text-text-primary` or class `text-heading-2`.
   - Body metadata: `text-sm text-text-secondary` or `text-xs text-text-muted`.
3. **CTA Buttons:**
   - Primary orange button:
     ```tsx
     <Button variant="primary" size="lg">Aksi Utama</Button>
     ```
   - Secondary navy outline button:
     ```tsx
     <Button variant="outline" size="lg">Batal / Kembali</Button>
     ```
4. **Avoid Hardcoded Colors:** Never write `#ffffff`, `#f97316`, `#102033` or arbitrary colors directly inside your class names. Always use the mapped `@theme` tokens.

---

## Step 4 — Visual State Mapping (DoD checklist)

Ensure every data-driven component handles the full lifecycle of data delivery:

1. **Loading State:** Render a skeleton grid (`Skeleton` card grids) if loading data is asynchronous:
   ```tsx
   if (isLoading) return <SkeletonGrid count={3} />;
   ```
2. **Empty State:** Provide a helpful empty illustration and call-to-action when lists are empty:
   ```tsx
   if (items.length === 0) {
     return (
       <EmptyState
         title="Belum ada Campaign"
         description="Buat campaign pertama Anda untuk mulai berkolaborasi."
         actionLabel="Buat Campaign"
         onAction={handleCreate}
       />
     );
   }
   ```
3. **Error State:** Support graceful failure screens with retry callbacks.

---

## Step 5 — Visual & Code Audit

Perform a self-audit before committing:

- [ ] Does it scale down to 375px mobile viewport without truncation or scroll issues?
- [ ] Are named exports used exclusively (`export function Component()`)?
- [ ] Are Tailwind v4 theme custom properties used instead of hardcoded hex colors?
- [ ] Is interactive click targets (like buttons and links) at least 44px on mobile?
- [ ] Are image references utilizing Next.js `<Image>` with appropriate dimensions?
- [ ] Has ESLint been executed (`npm run lint`) to confirm code quality?
