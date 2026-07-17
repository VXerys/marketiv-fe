# Domain Model — ERD Tingkat Tinggi

Gambaran model data Marketiv dikelompokkan per domain. Dokumen ini hanya menyajikan peta relasi tingkat tinggi dan kepemilikan modul. **Skema detail (attribute, index, permission) ada di `50_Database.md` masing-masing modul, bukan di sini.**

## Kelompok Domain & Modul Pemilik

| Domain | Collection | Modul Pemilik |
| --- | --- | --- |
| Identity | `users`, `umkm_profiles`, `creator_profiles`, `creator_social_accounts`, `creator_portfolios` | [Users](Users/50_Database.md) |
| Campaign / PPV | `campaigns`, `campaign_assets`, `campaign_briefs`, `campaign_claims`, `campaign_submissions`, `fraud_checks` | [Campaigns](Campaigns/50_Database.md) |
| RateCard | `rate_cards`, `rate_card_packages` | [RateCards](RateCards/50_Database.md) |
| Chat / Offer | `conversations`, `messages`, `offers` | [Chat](Chat/50_Database.md), [Offers](Offers/50_Database.md) |
| Order | `orders`, `revisions`, `deliverables` | [Orders](Orders/50_Database.md) |
| Payment | `payments`, `wallets`, `transactions`, `escrows`, `withdrawals` | [Payments](Payments/50_Database.md) |
| AI | `ai_requests` | [AI](AI/50_Database.md) |
| Storage ⚠️ | `user_storage_usage`, `user_files` (dormant — post-MVP) | [Users](Users/50_Database.md) |
| Notification | `notifications` | [Notifications](Notifications/50_Database.md) |

> Catatan: Appwrite Auth menyimpan kredensial user; modul [Authentication](Authentication/00_Index.md) tidak memiliki collection sendiri.

## ERD Sederhana (Relationship Tree)

```text
USERS
 ├── UMKM_PROFILES
 ├── CREATOR_PROFILES
 ├── WALLETS
 ├── USER_STORAGE_USAGE
 ├── USER_FILES
 └── NOTIFICATIONS

UMKM_PROFILES
 ├── CAMPAIGNS
 │     ├── CAMPAIGN_ASSETS
 │     ├── CAMPAIGN_BRIEFS
 │     ├── CAMPAIGN_CLAIMS
 │     │      └── CAMPAIGN_SUBMISSIONS
 │     │              └── FRAUD_CHECKS
 │     └── AI_REQUESTS
 │
 └── CONVERSATIONS
         ├── MESSAGES
         │       └── OFFERS
         └── OFFERS
                 └── ORDERS
                         ├── REVISIONS
                         ├── DELIVERABLES
                         ├── PAYMENTS
                         └── ESCROWS

CREATOR_PROFILES
 ├── RATE_CARDS
 │     └── RATE_CARD_PACKAGES
 ├── CAMPAIGN_CLAIMS
 └── CONVERSATIONS

WALLETS
 ├── TRANSACTIONS
 └── WITHDRAWALS

ESCROWS
 └── TRANSACTIONS
```

## Catatan Pemodelan

- **One fact = one location.** Setiap collection didokumentasikan penuh hanya di modul pemiliknya; modul lain melakukan cross-link.
- **Denormalisasi disengaja** untuk kecepatan dashboard (mis. `campaigns.totalClaims/spentAmount/remainingBudget`, `creator_profiles.totalFollowers/totalOrders/rating`, `conversations.lastMessage/lastMessageAt`).
- ERD di atas adalah **ERD Final Product**. MVP v1 mengaktifkan sekitar 12–14 collection terlebih dahulu.
