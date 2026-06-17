
# Frontend Route Architecture & Folder Structure (Marketiv MVP)

Tahap ini menjadi blueprint seluruh frontend React + Appwrite agar ketika coding dimulai tidak terjadi refactor besar di tengah jalan.

---

# Tech Stack Frontend

```text
React
React Router
TanStack Query
Zustand
Appwrite SDK
Shadcn UI
Tailwind CSS
```

---

# Folder Structure

```text
src/
│
├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
│
├── pages/
│
│   ├── public/
│   ├── auth/
│   ├── creator/
│   ├── umkm/
│   └── admin/
│
├── services/
│
├── hooks/
│
├── stores/
│
├── components/
│
│   ├── ui/
│   ├── shared/
│   ├── creator/
│   ├── umkm/
│   └── admin/
│
├── lib/
│
├── constants/
│
└── utils/
```

---

# Route Structure

```text
/
├── Landing
├── Login
├── Register
├── Creator Register
├── UMKM Register
├── Campaign Detail
```

---

# Public Pages

```text
pages/public/

LandingPage.jsx
CampaignDetailPage.jsx
PrivacyPage.jsx
TermsPage.jsx
NotFoundPage.jsx
```

---

# Authentication

```text
pages/auth/

LoginPage.jsx
RegisterPage.jsx

RegisterCreatorPage.jsx
RegisterUmkmPage.jsx

ForgotPasswordPage.jsx
```

---

# Creator Area

```text
/creator
```

Layout:

```text
CreatorLayout
```

---

## Dashboard

```text
/creator/dashboard
```

Page:

```text
CreatorDashboardPage.jsx
```

Widgets:

```text
Total Earnings
Pending Balance
Available Balance
Total Submissions
```

---

## Campaign Feed

```text
/creator/campaigns
```

Page:

```text
CreatorCampaignListPage.jsx
```

Features:

```text
Search
Filter
Category
Platform
```

---

## Campaign Detail

```text
/creator/campaigns/:id
```

Page:

```text
CreatorCampaignDetailPage.jsx
```

Features:

```text
Campaign Brief
Claim Campaign
View Materials
```

---

## My Claims

```text
/creator/claims
```

Page:

```text
CreatorClaimsPage.jsx
```

Status:

```text
Claimed
Submitted
Approved
Rejected
```

---

## Submission Detail

```text
/creator/submissions/:id
```

Page:

```text
CreatorSubmissionDetailPage.jsx
```

Features:

```text
Upload Submission
Revision Request
Fraud Result
```

---

## Wallet

```text
/creator/wallet
```

Page:

```text
CreatorWalletPage.jsx
```

Sections:

```text
Available Balance
Pending Balance

Transaction History

Withdraw
```

---

## Profile

```text
/creator/profile
```

Page:

```text
CreatorProfilePage.jsx
```

Sections:

```text
Personal Data
Social Accounts
Verification
```

---

# UMKM Area

```text
/umkm
```

Layout:

```text
UmkmLayout
```

---

## Dashboard

```text
/umkm/dashboard
```

Page:

```text
UmkmDashboardPage.jsx
```

Widgets:

```text
Campaign Active
Total Budget
Pending Review
Total Creator
```

---

## Campaign List

```text
/umkm/campaigns
```

Page:

```text
UmkmCampaignListPage.jsx
```

---

## Create Campaign

```text
/umkm/campaigns/create
```

Page:

```text
CampaignCreatePage.jsx
```

Wizard:

```text
Step 1 Profile
Step 2 Budget
Step 3 Brief
```

---

## Edit Campaign

```text
/umkm/campaigns/:id/edit
```

Page:

```text
CampaignEditPage.jsx
```

---

## Campaign Detail

```text
/umkm/campaigns/:id
```

Page:

```text
CampaignDetailPage.jsx
```

Sections:

```text
Submissions
Budget
Analytics
```

---

## Review Submission

```text
/umkm/submissions/:id
```

Page:

```text
SubmissionReviewPage.jsx
```

Actions:

```text
Approve
Reject
Request Revision
```

---

## Rate Card Marketplace

```text
/umkm/creators
```

Page:

```text
CreatorMarketplacePage.jsx
```

Features:

```text
Search Creator
Filter
Send Offer
```

---

## Orders

```text
/umkm/orders
```

Page:

```text
OrderListPage.jsx
```

Status:

```text
Pending Payment
In Progress
Completed
Dispute
```

---

## Wallet

```text
/umkm/wallet
```

Page:

```text
UmkmWalletPage.jsx
```

Sections:

```text
Balance
Top Up
History
```

---

## Settings

```text
/umkm/settings
```

Page:

```text
UmkmSettingsPage.jsx
```

---

# Admin Area

```text
/admin
```

Layout:

```text
AdminLayout
```

---

## Dashboard

```text
/ admin/dashboard
```

---

## User Management

```text
/ admin/users
```

---

## Campaign Management

```text
/ admin/campaigns
```

---

## Fraud Review

```text
/ admin/fraud
```

---

## Withdrawal Review

```text
/ admin/withdrawals
```

---

## Dispute Center

```text
/ admin/disputes
```

---

# Shared Components

```text
components/shared/
```

---

## Navigation

```text
Navbar.jsx
Sidebar.jsx
MobileNav.jsx
```

---

## Wallet

```text
WalletCard.jsx
TransactionTable.jsx
WithdrawModal.jsx
```

---

## Campaign

```text
CampaignCard.jsx
CampaignFilters.jsx
CampaignStatusBadge.jsx
```

---

## Submission

```text
SubmissionCard.jsx
SubmissionStatusBadge.jsx
ReviewModal.jsx
```

---

# Service Layer

```text
services/
```

```text
auth.service.js

campaign.service.js

claim.service.js

submission.service.js

wallet.service.js

offer.service.js

order.service.js

notification.service.js

creator.service.js
```

Semua komunikasi Appwrite hanya boleh melalui service layer.

Jangan pernah memanggil SDK langsung dari page.

---

# Zustand Stores

```text
stores/
```

---

## Auth Store

```text
auth.store.js
```

State:

```text
user
role

isLoading
isAuthenticated
```

---

## Notification Store

```text
notification.store.js
```

State:

```text
notifications

unreadCount
```

---

## Wallet Store

```text
wallet.store.js
```

State:

```text
balance
pendingBalance
transactions
```

---

# React Query

Query yang wajib menggunakan cache:

```text
Campaign List
Campaign Detail
Creator List
Wallet
Notifications
Orders
Submissions
```

Mutasi:

```text
Create Campaign
Claim Campaign
Create Submission
Approve Submission
Create Offer
Accept Offer
Withdraw
```

---

# Route Guards

## Guest Only

```text
/login
/register
```

---

## Creator Only

```text
/creator/*
```

---

## UMKM Only

```text
/umkm/*
```

---

## Admin Only

```text
/admin/*
```

---

# MVP Screen Priority (Wajib Dibangun Dulu)

Urutan implementasi:

```text
1. Authentication
2. Creator Campaign Feed
3. Claim Campaign
4. Submission
5. UMKM Create Campaign
6. UMKM Review Submission
7. Wallet
8. Notification
9. Fraud Detection
10. Admin Panel
```

Dengan blueprint ini, tahap berikutnya yang biasanya saya lakukan adalah **Database Relationship Diagram (ERD Final)** untuk memastikan seluruh collection Appwrite benar-benar saling terhubung sebelum mulai membuat schema dan coding. Ini biasanya menjadi dokumen teknis terakhir sebelum development sprint dimulai.
