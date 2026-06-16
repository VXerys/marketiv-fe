# 6. CODING ARCHITECTURE & FOLDER STRUCTURE FINAL — MARKETIV MVP

```text
Architecture Style:

Frontend
React + Vite

Backend
Appwrite BaaS

Storage
Appwrite Storage

Authentication
Appwrite Auth

Realtime
Appwrite Realtime

Functions
Appwrite Functions

AI Layer
OpenAI API
(Appwrite Function Wrapper)

Deployment
Frontend → Vercel

Backend → Appwrite Cloud
```

---

# HIGH LEVEL ARCHITECTURE

```text
                ┌──────────────┐
                │ React Client │
                └──────┬───────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ Service Layer       │
            │ (API Abstraction)   │
            └─────────┬───────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Appwrite SDK     │
             └────────┬─────────┘
                      │
 ┌────────────────────┼────────────────────┐
 ▼                    ▼                    ▼

Auth             Database            Storage

 ▼                    ▼                    ▼

Functions      Realtime         File Upload

                      │
                      ▼

              AI Functions

         Brief Generator
         Fraud Detection
         FAQ Assistant
```

---

# PROJECT STRUCTURE

```text
src/

├── app/
├── routes/
├── layouts/
├── pages/
├── modules/
├── services/
├── stores/
├── hooks/
├── components/
├── design-system/
├── lib/
├── utils/
├── constants/
├── validations/
├── assets/
└── main.jsx
```

---

# APP LAYER

```text
src/app/

├── App.jsx
├── Providers.jsx
├── ErrorBoundary.jsx
└── AppInitializer.jsx
```

Tujuan:

```text
Bootstrap aplikasi

Auth check
Role check
Theme
Global Provider
```

---

# ROUTES

```text
src/routes/

├── AppRouter.jsx

├── GuestRoutes.jsx
├── UmkmRoutes.jsx
├── CreatorRoutes.jsx
├── AdminRoutes.jsx

└── RouteGuard.jsx
```

---

# ROUTE STRUCTURE

## Public

```text
/

/about
/pricing
/contact

/login
/register
```

---

## UMKM

```text
/umkm/dashboard

/umkm/creators
/umkm/creators/:id

/umkm/campaigns
/umkm/campaigns/create
/umkm/campaigns/:id

/umkm/orders
/umkm/orders/:id

/umkm/wallet

/umkm/profile
```

---

## Creator

```text
/creator/dashboard

/creator/rate-cards
/creator/rate-cards/create

/creator/campaigns
/creator/campaigns/:id

/creator/submissions
/creator/submissions/:id

/creator/wallet

/creator/profile
```

---

## Admin

```text
/admin/dashboard

/admin/users

/admin/campaigns

/admin/orders

/admin/fraud

/admin/reports

/admin/withdraws
```

---

# LAYOUTS

```text
src/layouts/

├── PublicLayout

├── UmkmLayout

├── CreatorLayout

└── AdminLayout
```

---

## PublicLayout

```text
Navbar
Footer
Landing Assistant
```

---

## UmkmLayout

```text
Sidebar
Header
Notification
Bottom Navigation
```

---

## CreatorLayout

```text
Sidebar
Header
Bottom Navigation
```

---

## AdminLayout

```text
Sidebar
Header
Admin Toolbar
```

---

# FEATURE MODULE ARCHITECTURE

Marketiv menggunakan:

```text
Feature Based Architecture
```

bukan:

```text
Page Based
```

karena lebih scalable.

---

# MODULES

```text
src/modules/

├── auth
├── users
├── creator
├── rate-card
├── campaign
├── submission
├── offer
├── order
├── wallet
├── payment
├── review
├── notification
├── ai
├── admin
```

---

# AUTH MODULE

```text
auth/

├── pages/
├── components/
├── services/
├── hooks/
├── validators/
└── store.js
```

---

# CREATOR MODULE

```text
creator/

├── pages/

│   ├── CreatorListPage
│   ├── CreatorDetailPage

├── components/

│   ├── CreatorCard
│   ├── CreatorStats
│   ├── CreatorFilters

├── services/

│   └── creatorService.js
```

---

# RATE CARD MODULE

```text
rate-card/

├── pages/
├── components/
├── services/
├── hooks/
```

Component:

```text
RateCardCard
RateCardForm
RateCardTable
```

---

# CAMPAIGN MODULE

Campaign Viral.

```text
campaign/

├── pages/

├── components/

│   ├── CampaignCard
│   ├── CampaignForm
│   ├── CampaignBrief
│   ├── CampaignStats

├── services/
```

---

# SUBMISSION MODULE

```text
submission/

├── pages/

├── components/

│   ├── SubmissionCard
│   ├── SubmissionTable
│   ├── SubmissionReview

├── services/
```

---

# OFFER MODULE

Rate Card Negotiation.

```text
offer/

├── components/

│   ├── OfferForm
│   ├── OfferTimeline

├── services/
```

---

# ORDER MODULE

```text
order/

├── pages/

├── components/

│   ├── OrderCard
│   ├── OrderStatus
│   ├── OrderTimeline

├── services/
```

---

# WALLET MODULE

```text
wallet/

├── pages/

├── components/

│   ├── WalletBalance
│   ├── WalletTable
│   ├── WithdrawForm

├── services/
```

---

# AI MODULE

Sesuai MVP final hanya 3 AI.

```text
ai/

├── pages/

├── components/

│   ├── AiLandingAssistant
│   ├── AiBriefGenerator
│   ├── FraudScoreBadge

├── services/
```

---

# SHARED COMPONENTS

```text
src/components/
```

---

## UI

```text
ui/

├── Button
├── Input
├── Select
├── Textarea

├── Card
├── Badge
├── Avatar

├── Modal
├── Drawer
├── Dialog

├── Table

├── Tabs
├── Pagination

├── EmptyState
├── LoadingState
```

---

# DESIGN SYSTEM

```text
src/design-system/

├── colors.js
├── spacing.js
├── typography.js
├── shadows.js
├── radius.js

├── tailwind-preset.js
```

---

# STATE MANAGEMENT

Gunakan:

```text
Zustand
```

karena:

```text
Lebih ringan
Tidak perlu Redux Boilerplate
```

---

```text
src/stores/

├── authStore.js
├── campaignStore.js
├── walletStore.js
├── notificationStore.js
```

---

# SERVICES LAYER

Seluruh Appwrite access wajib lewat service layer.

JANGAN:

```text
Page
↓
Appwrite SDK
```

Lakukan:

```text
Page
↓
Service
↓
Appwrite SDK
```

---

```text
src/services/

├── authService.js

├── userService.js

├── creatorService.js

├── campaignService.js

├── submissionService.js

├── orderService.js

├── walletService.js

├── paymentService.js

├── aiService.js
```

---

# APPWRITE CONFIG

```text
src/lib/appwrite/

├── client.js

├── account.js
├── database.js
├── storage.js
├── functions.js

├── collections.js
```

---

# COLLECTION CONSTANTS

```javascript
export const COLLECTIONS = {
  USERS: "...",
  CREATORS: "...",
  CAMPAIGNS: "...",
  SUBMISSIONS: "...",
  ORDERS: "...",
  WALLETS: "...",
};
```

---

# APPWRITE FUNCTIONS

```text
functions/

├── create-wallet

├── create-order

├── process-payment

├── release-escrow

├── generate-brief

├── fraud-detection

├── send-notification
```

---

# EVENT ARCHITECTURE

## User Register

```text
User Register
↓
Create Wallet
↓
Send Welcome Notification
```

---

## Campaign Publish

```text
Publish Campaign
↓
Notify Eligible Creators
```

---

## Submission Created

```text
Submission Created
↓
Fraud Detection
↓
Update Risk Score
```

---

## Offer Accepted

```text
Offer Accepted
↓
Create Order
↓
Lock Escrow
```

---

## Payment Success

```text
Payment Success
↓
Update Wallet
↓
Create Transaction
```

---

# VALIDATIONS

```text
src/validations/

├── authSchema.js
├── campaignSchema.js
├── rateCardSchema.js
├── offerSchema.js
├── withdrawSchema.js
```

Library:

```text
zod
```

---

# HOOKS

```text
src/hooks/

├── useAuth
├── useCampaign
├── useWallet
├── useRealtime
├── useNotification
```

---

# REALTIME ARCHITECTURE

```text
Campaign Update
↓
Realtime Channel

Order Update
↓
Realtime Channel

Submission Review
↓
Realtime Channel

Notification
↓
Realtime Channel
```

---

# FILE STORAGE STRUCTURE

```text
storage/

├── avatars/

├── logos/

├── campaign-assets/

├── campaign-thumbnails/

├── submissions/

├── drafts/

├── payment-proofs/
```

---

# ENVIRONMENT VARIABLES

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

---

# TESTING STRUCTURE

```text
tests/

├── unit/

├── integration/

├── e2e/
```

Framework:

```text
Vitest
Playwright
```

---

# MVP DEVELOPMENT ORDER

```text
PHASE 1
Authentication

PHASE 2
Creator Profile
Rate Card

PHASE 3
Campaign Viral

PHASE 4
Submission

PHASE 5
Order + Escrow

PHASE 6
Wallet

PHASE 7
Notification

PHASE 8
AI Brief Generator

PHASE 9
Fraud Detection

PHASE 10
Admin Dashboard
```

---


