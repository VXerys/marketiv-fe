# 40_Folder_Structure

**Pemilik tunggal struktur folder frontend Marketiv.** Modul dan dokumen lain mengacu ke sini, tidak menduplikasi. Konvensi penamaan di [`30_Naming_Convention.md`](30_Naming_Convention.md).

## Stack

- Frontend: Next.js (App Router) → deploy Vercel.
- Backend: Appwrite BaaS (Auth, Database, Storage, Realtime, Functions) → Appwrite Cloud.
- AI Layer: Gemini API dibungkus Appwrite Function.

## Struktur `src/`

```text
src/
├── app/                # Next.js App Router — routing = struktur folder
│   ├── layout.jsx      # Root layout, membungkus <Providers>
│   ├── page.jsx        # Landing
│   ├── providers.jsx   # Client providers (Zustand hydrate, theme) — "use client"
│   ├── error.jsx       # Root error boundary (lihat 60_Error_Handling.md)
│   ├── loading.jsx
│   ├── (public)/       # Route group tamu: login, register, landing
│   ├── (umkm)/         # Route group UMKM + layout.jsx sendiri
│   ├── (creator)/      # Route group Creator + layout.jsx sendiri
│   └── (admin)/        # Route group Admin + layout.jsx sendiri
├── middleware.js       # Auth/role guard di edge (pengganti RouteGuard)
├── modules/            # Feature-based modules — logika & UI per fitur (bukan routing)
├── services/           # Service layer global (akses Appwrite)
├── stores/             # Zustand stores
├── hooks/              # Custom hooks
├── components/         # Shared components (ui/ + per-domain)
├── design-system/      # Design tokens (lihat 90_Design_System.md)
├── lib/                # Integrasi (Appwrite config)
├── utils/
├── constants/
└── validations/        # Zod schemas
```

- Aset statis publik → `public/` (root proyek, bukan `src/`).
- Halaman = folder di `src/app/` berisi `page.jsx`. Layout per-role via `layout.jsx` di route group. Segmen dinamis pakai `[id]` (mis. `app/(umkm)/campaign/[id]/page.jsx`).

## Modules (`src/modules/`)

`auth`, `users`, `creator`, `rate-card`, `campaign`, `submission`, `chat`, `offer`, `order`, `wallet`, `payment`, `review`, `notification`, `ai`, `admin`.

Tiap modul: `components/`, `services/`, `hooks/`, `validators/`, `store.js`. Modul memuat logika & UI fitur; **routing tetap di `src/app/`** yang meng-import view dari modul. Modul AI hanya 3 komponen MVP: `AiLandingAssistant`, `AiBriefGenerator`, `FraudScoreBadge`.

## Shared Components (`src/components/`)

- `ui/`: Button, Input, Select, Textarea, Card, Badge, Avatar, Modal, Drawer, Dialog, Table, Tabs, Pagination, EmptyState, LoadingState.
- Per-domain: `creator/`, `campaign/`, `order/`, `wallet/`, `ai/`.

## Service Layer (`src/services/`)

Service layer global wajib menggunakan TypeScript (`.ts`). Service membungkus akses Appwrite SDK untuk aplikasi dan tidak boleh berisi implementasi Appwrite Function.

Contoh: `auth.service.ts`, `user.service.ts`, `creator.service.ts`, `campaign.service.ts`, `submission.service.ts`, `chat.service.ts`, `offer.service.ts`, `order.service.ts`, `wallet.service.ts`, `claim.service.ts`, `notification.service.ts`. Aturan akses: lihat [`20_Coding_Standards.md`](20_Coding_Standards.md).

## Appwrite Config (`src/lib/appwrite/`)

`client.js`, `account.js` (termasuk Google OAuth provider), `database.js`, `storage.js`, `functions.js`, `collections.js` (konstanta `COLLECTIONS`).

## Stores / Validations / Hooks

- `src/stores/`: `authStore.js`, `campaignStore.js`, `chatStore.js`, `walletStore.js`, `notificationStore.js`.
- `src/validations/`: `authSchema.js`, `campaignSchema.js`, `rateCardSchema.js`, `chatSchema.js`, `offerSchema.js`, `withdrawSchema.js` (Zod).
- `src/hooks/`: `useAuth`, `useCampaign`, `useChat`, `useWallet`, `useRealtime`, `useNotification`.

## Appwrite Functions (`functions/`)

`create-user-profile`, `validate-and-upload`, `delete-file`, `create-user-wallet`, `campaign-published`, `ai-brief`, `ai-fraud-precheck`, `create-order`, `calculate-campaign-reward`, `campaign-claimed`, `expire-stale-claims`, `create-payment`, `midtrans-webhook`, `create-escrow`, `release-escrow`, `send-chat-notification`. Penamaan: `kebab-case`.

Kode Appwrite Function wajib berada di `functions/<function-id>/`. Setiap function memiliki source dan dependency sendiri di folder tersebut. Entrypoint default adalah `functions/<function-id>/src/main.js`, dan file dependency function diletakkan di `functions/<function-id>/package.json`.

Jangan menulis implementasi Appwrite Function di `src/` atau root proyek.

## Appwrite Project Config (`appwrite/`)

- `appwrite/appwrite.json`: konfigurasi Appwrite yang dihasilkan untuk project, database, storage, dan functions.
- `appwrite/generate_appwrite_json.js`: script generator untuk membuat ulang `appwrite/appwrite.json`.
- Saat menambah, menghapus, atau mengganti nama function, sinkronkan `functions/<function-id>/`, `appwrite/appwrite.json`, dan `appwrite/generate_appwrite_json.js`.

## Storage Buckets (`storage/`)

`avatars/`, `logos/`, `portfolios/`, `campaign-assets/`, `deliverables/`, `fraud-evidence/`, ~~`user-files/`~~ (dormant — post-MVP).

## Tests (`tests/`)

`unit/`, `integration/`, `e2e/`. Framework: Vitest + Playwright. Detail di [`70_Testing_Strategy.md`](70_Testing_Strategy.md).

## Environment Variables

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_DB_ID=
NEXT_PUBLIC_USER_COLLECTION=
NEXT_PUBLIC_CREATOR_COLLECTION=
NEXT_PUBLIC_CAMPAIGN_COLLECTION=
NEXT_PUBLIC_ORDER_COLLECTION=
NEXT_PUBLIC_WALLET_COLLECTION=
NEXT_PUBLIC_PAYMENT_COLLECTION=
NEXT_PUBLIC_TRANSACTION_COLLECTION=
NEXT_PUBLIC_ESCROW_COLLECTION=
NEXT_PUBLIC_WITHDRAWAL_COLLECTION=
NEXT_PUBLIC_CREATE_PAYMENT_FUNCTION_ID=
NEXT_PUBLIC_STORAGE_BUCKET=
NEXT_PUBLIC_AI_FUNCTION_ID=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
```

Deploy & env: [`80_Deployment.md`](80_Deployment.md).
