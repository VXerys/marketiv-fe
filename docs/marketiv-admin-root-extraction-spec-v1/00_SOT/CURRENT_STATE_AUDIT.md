# Current State Audit

Audit target: `marketiv-id/marketiv-web`, branch `staging`.

## Current Admin application location

Admin is currently embedded in the main Next.js application.

### Routing

```text
src/app/admin/
├── dashboard/
├── submissions/
├── layout.tsx
├── loading.tsx
└── page.tsx
```

`src/app/admin/page.tsx` redirects to `/admin/dashboard`.

`src/app/admin/layout.tsx` imports Admin shell and Admin dashboard metrics from the main app source tree.

## Current Admin-owned source domains

Admin code is not one physical folder. It is distributed across:

```text
src/app/admin/
src/components/admin/
src/features/admin/
src/lib/admin/
```

Therefore this task must NOT merely rename `src/app/admin → admin`.

It must extract the Admin application dependency closure.

## Current Admin shared dependencies

Confirmed examples include:

- `src/components/admin/AdminSidebar.tsx`
  - `@/components/ui/MarketivLogo`
  - `@/lib/utils`
  - `next/link`
  - `next/navigation`
  - `lucide-react`

- `src/components/ui/MarketivLogo.tsx`
  - `@/assets/icons`
  - `@/lib/utils`

- Admin feature components use generic `src/components/ui/*` primitives.

These dependencies must become self-contained inside `admin/src/` or otherwise be explicitly packaged. The migration SHALL NOT leave imports such as:

```ts
import ... from "../../src/..."
```

## Current shared app configuration

Main app currently uses:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4 + `@tailwindcss/postcss`
- Appwrite browser SDK
- Radix UI primitives
- Lucide
- Sonner
- shared alias `@/* → ./src/*`

Admin's standalone package must derive its minimal dependency set from actual Admin imports rather than blindly copying every user-app dependency.

## Current root layout coupling

The main root layout currently includes:

- `AuthProvider`
- `BetaTesterModal`
- `ChatbotFab`
- root global CSS
- Toaster

A standalone Admin app SHALL NOT inherit user-only `BetaTesterModal` or `ChatbotFab` merely because they exist in the main root layout.

Admin should create its own root layout with only dependencies it needs.

## Current known behavior debt

Do not silently fix during extraction:

- Admin auth helper contains an offline/development Admin fallback.
- Admin dashboard has known data truthfulness issues.
- Admin submission service has known false-success/direct-write issues.
- Admin route security needs hardening.

These belong to the next bugfix pack.

Structural migration must leave clear TODO/known-debt notes but should avoid combining unrelated fixes into this PR.
