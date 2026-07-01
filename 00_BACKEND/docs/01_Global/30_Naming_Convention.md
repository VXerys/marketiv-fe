# 30_Naming_Convention

Konvensi penamaan tunggal untuk seluruh Marketiv. Struktur folder di [`40_Folder_Structure.md`](40_Folder_Structure.md), daftar collection di [`../02_Modules/`](../02_Modules/).

## Collection (Appwrite)

- `snake_case` jamak (plural).
- Contoh: `users`, `umkm_profiles`, `creator_profiles`, `creator_social_accounts`, `campaigns`, `campaign_claims`, `campaign_submissions`, `rate_cards`, `rate_card_packages`, `conversations`, `messages`, `offers`, `orders`, `deliverables`, `wallets`, `transactions`, `escrows`, `withdrawals`, `ai_requests`, `fraud_checks`, `notifications`.

## Attribute (Appwrite)

- `camelCase`.
- Contoh: `userId`, `businessName`, `rewardPer1000Views`, `fraudScore`, `fraudStatus`, `pendingBalance`, `isProfileCompleted`, `lastMessageAt`.
- Field bawaan Appwrite memakai prefiks `$` (`$id`, `$createdAt`).
- Boolean memakai prefiks `is`/`has` (`isRead`, `isVerified`).

## File & Komponen Frontend

- Komponen React: **PascalCase** → `CampaignCard.jsx`, `WithdrawForm.jsx`, `FraudScoreBadge.jsx`.
- Page: PascalCase + sufiks `Page` → `CreatorListPage.jsx`, `CreatorDetailPage.jsx`.
- Service: **camelCase** + `Service` → `campaignService.js`, `walletService.js`.
- Store: camelCase + `Store` → `authStore.js`.
- Hook: prefiks `use` → `useRealtime.js`.
- Schema (Zod): camelCase + `Schema` → `campaignSchema.js`.
- Design token & util: camelCase → `colors.js`, `tailwind-preset.js`.

## Route (React Router)

- `kebab-case`, lowercase, di-namespace per role.
- Public: `/`, `/about`, `/pricing`, `/login?role=umkm`, `/register?role=creator`.
- UMKM: `/umkm/dashboard`, `/umkm/campaigns/create`, `/umkm/orders/:id`.
- Creator: `/creator/rate-cards`, `/creator/submissions/:id`, `/creator/wallet`.
- Admin: `/admin/users`, `/admin/fraud`, `/admin/withdraws`.
- Param dinamis pakai `:id`.

## Appwrite Function

- `kebab-case`.
- Contoh: `create-user-wallet`, `create-order`, `create-escrow`, `release-escrow`, `campaign-published`, `ai-fraud-precheck`, `generate-brief`, `send-notification`.
