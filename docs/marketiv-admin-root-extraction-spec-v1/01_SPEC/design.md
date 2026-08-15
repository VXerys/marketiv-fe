# Design — Standalone Admin Root Extraction

## 1. Migration strategy

Use a **strangler-style file extraction**, not an immediate destructive move.

```text
Audit dependency graph
      ↓
Create admin app shell
      ↓
Copy/move Admin-owned code
      ↓
Close dependency closure
      ↓
Normalize routes
      ↓
Build standalone Admin
      ↓
Update user-app Admin destination
      ↓
Delete old Admin code
      ↓
Build both apps
```

The old route remains temporarily during the extraction inside the working branch, then is removed before migration completion.

## 2. Why not only move `src/app/admin`

The route imports:

```text
src/components/admin/*
src/features/admin/*
src/lib/admin/*
```

and those import generic main-app UI/assets/utilities.

Moving only the route directory would create broken `@/*` imports or accidental cross-app coupling.

Therefore the migration unit is the **Admin frontend dependency closure**, not one folder.

## 3. Package boundary

### Main app

No workspace conversion is required.

Keep existing root `package.json`.

### Admin app

Create a normal standalone Next package at `admin/package.json`.

Suggested scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint src --ext .ts,.tsx,.js,.jsx",
  "typecheck": "tsc --noEmit"
}
```

Do not copy all root dependencies automatically.

Build a package list from import audit.

Expected core group based on current code:

```text
next
react
react-dom
typescript
appwrite
lucide-react
sonner
tailwindcss
@tailwindcss/postcss
clsx
tailwind-merge
class-variance-authority
required @radix-ui packages
```

Only add packages proven by imports.

## 4. Alias boundary

Admin `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

After extraction every existing `@/...` import inside Admin must resolve inside `admin/src`.

Do not configure `@/*` to reference main `src`.

## 5. CSS strategy

For migration safety:

1. copy the existing `src/app/globals.css` into `admin/src/app/globals.css` as initial visual compatibility baseline;
2. do not redesign or prune tokens during this task;
3. later design-system extraction can reduce duplication.

This trades small CSS duplication for deterministic visual parity.

## 6. Root layout

Admin gets its own root layout.

Required:

- same relevant font setup used by Admin visuals;
- Admin global CSS;
- Sonner toaster if Admin uses toast;
- only Admin-needed provider(s).

Do NOT include:

- BetaTesterModal;
- ChatbotFab;
- UMKM/Creator providers;
- onboarding-specific shell.

## 7. Generic frontend dependency policy

During migration, app independence is more important than prematurely introducing a workspace package.

For a shared generic file:

```text
Is it Admin-owned?
  yes → move
  no
    ↓
Is it required by both apps?
  yes → copy minimal file into admin for now
  no  → move/copy according to actual owner
```

Potential later improvement:

```text
packages/ui
packages/shared
```

is explicitly out of scope.

## 8. Assets

Static imported assets must be self-contained.

Example current chain:

```text
AdminSidebar
→ MarketivLogo
→ @/assets/icons
→ logo-marketiv.png
```

Copy the exact required logo asset(s) and their index/module declaration into `admin/src/assets`.

Do not copy all product assets unless imported.

## 9. Route normalization

Old:

```ts
"/admin/dashboard"
"/admin/submissions"
```

New:

```ts
"/dashboard"
"/submissions"
```

Admin sidebar/pathname checks, links, redirect calls and tests must be updated.

Admin root:

```ts
redirect("/dashboard")
```

## 10. Cross-app routing

Do not replace local `/admin` with a hardcoded string throughout components.

Create a single main-app config/helper for Admin origin, e.g.:

```ts
export const adminAppUrl =
  process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "";
```

Use it only for cross-application Admin destination.

If the main app currently maps `dashboardByRole.admin` to `/admin`, update the Admin value through this boundary.

Because cross-origin navigation is a full application transition, use browser navigation / absolute Link behavior appropriate to current code rather than pretending it is a same-app route.

## 11. Appwrite config

Admin gets its own browser Appwrite client/config modules under `admin/src`.

Use the SAME public environment values for matching environment.

Do not import main app's client through `../src`.

Do not introduce API key.

## 12. Backend topology

No backend file movement is required.

```text
00_BACKEND/
```

remains at repository root and is shared logically by both frontend deployments.

Functions remain environment resources, not frontend-app resources.

## 13. Safety sequence for deletion

Only remove legacy Admin directories after:

```text
admin npm install
admin typecheck PASS
admin build PASS
admin route smoke PASS
dependency audit PASS
```

Then:

```text
delete legacy Admin-specific src paths
run main app typecheck/build
search stale /admin links/imports
```

## 14. Known bug preservation

Migration report must explicitly list known issues that were not fixed.

Do not describe those issues as resolved merely because the code moved.
