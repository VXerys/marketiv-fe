# Domain Model — ERD Tingkat Tinggi

Gambaran model data Marketiv dikelompokkan per domain. Dokumen ini hanya menyajikan peta relasi tingkat tinggi dan kepemilikan modul. **Skema detail (attribute, index, permission) ada di `50_Database.md` masing-masing modul, bukan di sini.**

## Kelompok Domain & Modul Pemilik

| Domain | Collection | Modul Pemilik |
| --- | --- | --- |
| Identity | `users`, `umkm_profiles`, `creator_profiles`, `creator_social_accounts`, `creator_portfolios` | [Users](Users/50_Database.md) |
| Campaign / PPV | `campaigns`, `campaign_assets`, `campaign_claims`, `campaign_submissions` | Campaigns |
| RateCard | `rate_cards`, `rate_card_packages` | RateCards |
| Chat / Offer | `conversations`, `messages`, `offers` | Chat, Offers |
| Order | `orders`, `revisions`, `deliverables` | Orders |
| Payment | `wallets`, `transactions`, `escrows`, `withdrawals` | Payments |
| AI | `ai_requests`, `fraud_checks` | AI |
| Notification | `notifications` | [Notifications](Notifications/50_Database.md) |

> Catatan: Appwrite Auth menyimpan kredensial user; modul [Authentication](Authentication/00_Index.md) tidak memiliki collection sendiri.

## ERD Sederhana (Relationship Tree)

```text
USERS
 ├── UMKM_PROFILES
 ├── CREATOR_PROFILES
 ├── WALLETS
 └── NOTIFICATIONS

UMKM
 ├── CAMPAIGNS
 │     ├── CAMPAIGN_BRIEFS / AI_BRIEF_REQUESTS
 │     ├── CAMPAIGN_CLAIMS
 │     │      └── SUBMISSIONS
 │     │              └── FRAUD_ANALYSES
 │     └── AI_BRIEF_REQUESTS
 │
 └── CONVERSATIONS
         └── OFFERS
                 └── ORDERS
                         ├── DELIVERABLES
                         └── ESCROWS

CREATOR
 ├── RATE_CARDS
 ├── CAMPAIGN_CLAIMS
 └── CONVERSATIONS

WALLETS
 └── WALLET_TRANSACTIONS
```

## Catatan Pemodelan

- **One fact = one location.** Setiap collection didokumentasikan penuh hanya di modul pemiliknya; modul lain melakukan cross-link.
- **Denormalisasi disengaja** untuk kecepatan dashboard (mis. `campaigns.totalClaims/spentAmount/remainingBudget`, `creator_profiles.totalFollowers/totalOrders/rating`, `conversations.unreadCount*`).
- ERD di atas adalah **ERD Final Product**. MVP v1 mengaktifkan sekitar 12–14 collection terlebih dahulu.
