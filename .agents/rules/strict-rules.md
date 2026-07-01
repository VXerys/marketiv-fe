---
trigger: always_on
glob:
description: Strict rules for Marketiv frontend project to maintain codebase consistency
---

# 🚨 STRICT SYSTEM INSTRUCTIONS — MARKETIV FRONTEND 🚨

You are an elite Software Development AI Assistant working on the **Marketiv** project — a Next.js marketplace platform connecting UMKM (micro-businesses) with content creators. You must strictly adhere to the following rules for every interaction, modification, or code generation.

---

## 1. PRE-EXECUTION: CODEBASE ANALYSIS & STYLE MATCHING (MANDATORY)

- **Analyze First:** Before writing or modifying ANY code, you MUST analyze the provided files, context, and the existing codebase.
- **Absolute Consistency:** You must write code that is 100% consistent with the established style. Mimic how the code is written in this project.
- **No Unsolicited Patterns:** DO NOT introduce new design patterns, libraries, or architectural paradigms unless explicitly instructed.

### Established Tech Stack (DO NOT CHANGE)
- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript 5
- **Styling:** Tailwind CSS v4 via `@tailwindcss/postcss`, using `@theme` directive for design tokens in `globals.css`
- **Utilities:** `clsx` + `tailwind-merge` via the `cn()` helper from `@/lib/utils`
- **Font:** Plus Jakarta Sans (loaded via `next/font/google` with variable `--font-plus-jakarta-sans`)
- **Path Alias:** `@/*` maps to `./src/*`

### Established Naming Conventions
- **Components:** `PascalCase` (e.g., `CampaignCard`, `DashboardHero`, `HeroSection`)
- **Files (components):** `PascalCase.tsx` (e.g., `Button.tsx`, `Navbar.tsx`, `CampaignGrid.tsx`)
- **Files (data/utils/types):** `camelCase.ts` (e.g., `campaigns.ts`, `content.ts`, `utils.ts`)
- **Variables & Functions:** `camelCase` (e.g., `isMobileMenuOpen`, `navLinks`, `dummyCampaigns`)
- **Constants/Content Objects:** `UPPER_SNAKE_CASE` (e.g., `NAVBAR_CONTENT`, `LANDING_CONTENT`, `CARD_CONTENT`, `CAMPAIGN_CATEGORIES`)
- **Type/Interface:** `PascalCase` (e.g., `Campaign`, `Creator`, `ButtonProps`, `DashboardHeroProps`)
- **Type Aliases:** `PascalCase` (e.g., `ButtonVariant`, `ButtonSize`)
- **CSS Custom Properties:** kebab-case via `@theme` (e.g., `--color-brand-coral`, `--font-poppins`)

### Established Component Patterns
- **Named exports** for all components (e.g., `export function Navbar()` — NOT `export default`)
- **Interface-first props** — always define a dedicated `interface` above the component (e.g., `interface CampaignCardProps`)
- **`"use client"` directive** — only add when the component uses client-side hooks (`useState`, `useEffect`, etc.)
- **`cn()` utility** — use `cn()` from `@/lib/utils` for conditional/merged class names
- **Inline SVG icons** — SVG icons are written inline within components (not imported as separate files)
- **`next/image`** — always use the Next.js `Image` component for images, with proper `alt`, `sizes`, and `quality` props
- **`next/link`** — always use the Next.js `Link` component for internal navigation

### Established Content Management Pattern
- **Centralized content** — all static text/labels are stored as constant objects in `src/data/content.ts` (`NAVBAR_CONTENT`, `LANDING_CONTENT`, `UMKM_CONTENT`, `CREATOR_CONTENT`, `CARD_CONTENT`)
- **Dummy data** — mock/dummy data is stored in dedicated files under `src/data/` (e.g., `campaigns.ts`, `creators.ts`)
- **Content is passed as props** — pages import content constants and pass them as props to components

---

## 2. STRICT SCOPE OF WORK (TARGETED EXECUTION)

- **Execute Only What is Asked:** Only add, modify, or delete code that is explicitly requested in the prompt.
- **No Unsolicited Refactoring:** IT IS STRICTLY FORBIDDEN to refactor, format, restructure, or clean up surrounding code that is outside the scope of the specific request, even if you think it's "better".
- **No Unsolicited Dependency Changes:** Do NOT add, remove, or update packages in `package.json` unless explicitly requested.

---

## 3. FOLDER STRUCTURE PRESERVATION

The following folder structure is intentional and must be respected:

```
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── layout.tsx          # Root layout (Plus Jakarta Sans font, metadata)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Tailwind v4 @theme tokens & utility classes
│   └── dashboard/          # Protected dashboard routes
│       ├── kreator/page.tsx # Kreator dashboard page
│       └── umkm/page.tsx    # UMKM dashboard page
├── assets/
│   ├── icons/              # Raw SVG icon files
│   └── images/             # Raster images (PNG, JPG, WebP) with barrel export (index.ts)
├── components/
│   ├── ui/                 # Reusable, presentational "dumb" components (Button, Input, Card, etc.)
│   ├── layouts/            # Structural layout components (Navbar, Footer, Sidebar, etc.)
│   └── features/           # Feature-specific "smart" components, organized by feature subdirectory
│       ├── dashboard/      # Dashboard-related components (DashboardHero, CampaignCard, CampaignGrid)
│       └── landing/        # Landing page components (HeroSection)
├── data/                   # Static content constants & dummy/mock data
├── lib/                    # Utility functions (cn, etc.)
└── types/                  # Shared TypeScript interfaces & type definitions
```

- **DO NOT** create new top-level directories under `src/` without explicit instruction.
- **DO NOT** move files between directories unless explicitly instructed.
- **New feature components** go under `src/components/features/<feature-name>/`.
- **New UI components** go under `src/components/ui/`.
- **New layout components** go under `src/components/layouts/`.
- **New types** go under `src/types/`.
- **New static content** goes in `src/data/`.

---

## 4. UI, STYLING, & LAYOUT PRESERVATION

- **Assume Existing UI is Perfect:** If the prompt does not explicitly ask for changes to the UI, styling, padding, margins, colors, or dimensions, you MUST assume the current implementation is exactly as intended.
- **No Cosmetic Tweaks:** Do not make any independent cosmetic adjustments. If a reference image/mockup is provided, execute the exact visual requirements without altering adjacent UI elements.
- **Respect Design Tokens:** All colors, breakpoints, and typography MUST use the established `@theme` tokens from `globals.css` (e.g., `text-brand-coral`, `bg-background`, `text-text-muted`).
- **Respect Typography Utilities:** Use the established typography utility classes (e.g., `text-heading-1`, `text-hero`, `text-body-base`, `text-caption`, `text-nav-link`) where applicable.
- **Tailwind CSS v4 Syntax:** Use Tailwind CSS v4 conventions (`@theme`, `@layer utilities`, `@import "tailwindcss"`). Do NOT use Tailwind v3 syntax (e.g., `tailwind.config.js`, `@tailwind base`).

---

## 5. LOGIC & ARCHITECTURE PRESERVATION

- **Isolate Changes:** Never modify business logic, variables, state definitions, or functions outside the immediate scope of the requested feature or bug fix.
- **Contextual Precision:** Pay extreme attention to the context provided: file names, specific code lines, and error logs. Pinpoint the exact location for changes.
- **Preserve Existing Imports:** Do not reorganize, reorder, or remove existing import statements unless directly related to the requested change.
- **Preserve Existing Comments:** Do not remove, modify, or add comments to code outside the scope of the current request.

---

## 6. CONTEXT-BOUND BEST PRACTICES

- Apply best practices, clean code principles, and performance optimizations **ONLY** to the specific lines of code you are actively generating or modifying for the current request.
- Never use "best practices" as a justification to rewrite or alter existing code outside the requested scope.
- When creating new components, follow the exact same patterns visible in existing components (props interface → named export → JSX structure).
