# 40_Folder_Structure

**Pemilik tunggal struktur folder frontend Marketiv.** Modul dan dokumen lain mengacu ke sini, tidak menduplikasi. Konvensi penamaan di [`30_Naming_Convention.md`](30_Naming_Convention.md).

## Stack

- Frontend: React + Vite → deploy Vercel.
- Backend: Appwrite BaaS (Auth, Database, Storage, Realtime, Functions) → Appwrite Cloud.
- AI Layer: OpenAI API dibungkus Appwrite Function.

## Struktur `src/`

```text
src/
├── app/            # Bootstrap: App.jsx, Providers.jsx, ErrorBoundary.jsx, AppInitializer.jsx (auth/role/theme/global provider)
├── routes/         # AppRouter.jsx, GuestRoutes, UmkmRoutes, CreatorRoutes, AdminRoutes, RouteGuard.jsx
├── layouts/        # PublicLayout, UmkmLayout, CreatorLayout, AdminLayout
├── pages/          # Halaman level-app (selebihnya per modul)
├── modules/        # Feature-based modules (lihat di bawah)
├── services/       # Service layer global (akses Appwrite)
├── stores/         # Zustand stores
├── hooks/          # Custom hooks
├── components/     # Shared components (ui/ + per-domain)
├── design-system/  # Design tokens (lihat 90_Design_System.md)
├── lib/            # Integrasi (Appwrite config)
├── utils/
├── constants/
├── validations/    # Zod schemas
├── assets/
└── main.jsx
```

## Modules (`src/modules/`)

`auth`, `users`, `creator`, `rate-card`, `campaign`, `submission`, `offer`, `order`, `wallet`, `payment`, `review`, `notification`, `ai`, `admin`.

Tiap modul: `pages/`, `components/`, `services/`, `hooks/`, `validators/`, `store.js`. Modul AI hanya 3 komponen MVP: `AiLandingAssistant`, `AiBriefGenerator`, `FraudScoreBadge`.

## Shared Components (`src/components/`)

- `ui/`: Button, Input, Select, Textarea, Card, Badge, Avatar, Modal, Drawer, Dialog, Table, Tabs, Pagination, EmptyState, LoadingState.
- Per-domain: `creator/`, `campaign/`, `order/`, `wallet/`, `ai/`.

## Service Layer (`src/services/`)

`authService.js`, `userService.js`, `creatorService.js`, `campaignService.js`, `submissionService.js`, `orderService.js`, `walletService.js`, `paymentService.js`, `aiService.js`. Aturan akses: lihat [`20_Coding_Standards.md`](20_Coding_Standards.md).

## Appwrite Config (`src/lib/appwrite/`)

`client.js`, `account.js` (termasuk Google OAuth provider), `database.js`, `storage.js`, `functions.js`, `collections.js` (konstanta `COLLECTIONS`).

## Stores / Validations / Hooks

- `src/stores/`: `authStore.js`, `campaignStore.js`, `walletStore.js`, `notificationStore.js`.
- `src/validations/`: `authSchema.js`, `campaignSchema.js`, `rateCardSchema.js`, `offerSchema.js`, `withdrawSchema.js` (Zod).
- `src/hooks/`: `useAuth`, `useCampaign`, `useWallet`, `useRealtime`, `useNotification`.

## Appwrite Functions (`functions/`)

`create-wallet`, `create-order`, `process-payment`, `release-escrow`, `generate-brief`, `fraud-detection`, `send-notification`. Penamaan: `kebab-case`.

## Storage Buckets (`storage/`)

`avatars/`, `logos/`, `campaign-assets/`, `campaign-thumbnails/`, `submissions/`, `drafts/`, `payment-proofs/`.

## Tests (`tests/`)

`unit/`, `integration/`, `e2e/`. Framework: Vitest + Playwright. Detail di [`70_Testing_Strategy.md`](70_Testing_Strategy.md).

## Environment Variables

```env
VITE_APPWRITE_ENDPOINT=
VITE_APPWRITE_PROJECT_ID=
VITE_DB_ID=
VITE_USER_COLLECTION=
VITE_CREATOR_COLLECTION=
VITE_CAMPAIGN_COLLECTION=
VITE_ORDER_COLLECTION=
VITE_WALLET_COLLECTION=
VITE_STORAGE_BUCKET=
VITE_AI_FUNCTION_ID=
```

Deploy & env: [`80_Deployment.md`](80_Deployment.md).
