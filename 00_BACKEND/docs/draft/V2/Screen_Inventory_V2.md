# 4. SCREEN INVENTORY + FRONTEND ROUTING MAP

Tujuannya:

* Menentukan seluruh halaman yang harus dibuat
* Menentukan seluruh modal, drawer, dialog
* Menentukan route React Router
* Menentukan role access (Guest, UMKM, Creator, Admin)
* Menentukan reusable component

Karena setelah ini:

```text
ERD
↓
Collection Schema
↓
Service Contract
↓
User Flow
↓
Screen Inventory
↓
Design System
↓
Coding
```

Jika Screen Inventory belum dibuat, developer biasanya akan:

```text
"Oh ternyata halaman ini belum ada"
"Oh ternyata butuh modal ini"
"Oh ternyata route ini lupa"
```

dan akhirnya refactor berkali-kali.

---

# SCREEN INVENTORY MARKETIV MVP

## PUBLIC

```text
/
Landing Page

/login
/register
/forgot-password

/creator
Creator Discovery

/creator/:username
Creator Profile

/campaign
Campaign Marketplace

/campaign/:id
Campaign Detail
```

---

# UMKM AREA

```text
/dashboard

/dashboard/onboarding

/dashboard/profile

/dashboard/wallet

/dashboard/notifications
```

---

## RATE CARD

```text
/dashboard/creators

/dashboard/creators/:id

/dashboard/offers

/dashboard/offers/:id

/dashboard/orders

/dashboard/orders/:id
```

---

## CAMPAIGN VIRAL

```text
/dashboard/campaigns

/dashboard/campaigns/create

/dashboard/campaigns/:id

/dashboard/campaigns/:id/edit

/dashboard/campaigns/:id/submissions
```

---

## WALLET

```text
/dashboard/wallet

/dashboard/wallet/topup

/dashboard/wallet/history
```

---

# CREATOR AREA

```text
/creator-dashboard

/creator-dashboard/onboarding

/creator-dashboard/profile

/creator-dashboard/verification

/creator-dashboard/wallet

/creator-dashboard/notifications
```

---

## RATE CARD

```text
/creator-dashboard/rate-cards

/creator-dashboard/rate-cards/create

/creator-dashboard/rate-cards/:id/edit

/creator-dashboard/offers

/creator-dashboard/orders

/creator-dashboard/orders/:id
```

---

## CAMPAIGN VIRAL

```text
/creator-dashboard/campaigns

/creator-dashboard/campaigns/:id

/creator-dashboard/submissions

/creator-dashboard/submissions/:id
```

---

# ADMIN AREA

```text
/administrator

/administrator/users

/administrator/campaigns

/administrator/orders

/administrator/disputes

/administrator/reports

/administrator/fraud

/administrator/withdraws

/administrator/refunds
```

---

# MODAL INVENTORY

## Global

```text
Confirm Modal
Delete Modal
Success Modal
Error Modal
```

---

## Rate Card

```text
Create Offer Modal

Accept Offer Modal
Reject Offer Modal

Approve Draft Modal
Request Revision Modal

Approve Final Modal

Cancel Order Modal
```

---

## Campaign Viral

```text
Create Campaign Modal

AI Brief Modal

Claim Campaign Modal

Submit Result Modal

Appeal Rejection Modal
```

---

## Wallet

```text
Top Up Modal

Withdraw Modal

Refund Modal
```

---

## Report & Dispute

```text
Report User Modal

Report Campaign Modal

Open Dispute Modal
```

---

# DRAWER INVENTORY

Mobile MVP:

```text
Notification Drawer

Wallet Drawer

Chat Drawer (Rate Card)

Filter Drawer

Creator Detail Drawer
```

---

# SHARED COMPONENT INVENTORY

## Cards

```text
CreatorCard
RateCardCard

CampaignCard

OrderCard

SubmissionCard

NotificationCard
```

---

## Tables

```text
OrderTable

SubmissionTable

WithdrawTable

UserTable
```

---

## AI Components

```text
AiLandingAssistant

AiBriefGenerator

FraudScoreBadge
```

---

# ESTIMASI SCREEN MVP

Jika dihitung:

```text
Public Pages          : 6
UMKM Pages            : 14
Creator Pages         : 13
Admin Pages           : 9

TOTAL PAGE            : ±42

Modal                 : ±18
Drawer                : ±5

TOTAL SCREEN UNIT     : ±65
```


