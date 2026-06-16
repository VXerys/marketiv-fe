
# 7. Implementation Plan (Coding Architecture)

Tahap ini adalah blueprint final sebelum coding penuh dimulai.

Target:

```text
Frontend
↓
Service Layer
↓
Appwrite
↓
Functions
↓
AI Services
```

Semua fitur harus mengikuti arsitektur yang sama agar mudah di-maintain saat Marketiv berkembang.

---

# Tech Stack Final

## Frontend

```text
React 19
Vite
React Router
TailwindCSS
shadcn/ui
React Hook Form
Zod
TanStack Query
```

---

## Backend

```text
Appwrite Cloud
```

Digunakan untuk:

```text
Authentication
Database
Storage
Functions
Realtime
```

---

## AI Layer

```text
OpenAI API
```

MVP hanya untuk:

```text
AI Brief Assistant
AI Fraud Detection
Landing Page AI Assistant
```

sesuai keputusan sebelumnya.

---

# High Level Architecture

```text
┌─────────────────────┐
│ React Frontend      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Service Layer       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Appwrite SDK        │
└──────────┬──────────┘
           │
 ┌─────────┼─────────┐
 ▼         ▼         ▼
Auth   Database   Storage
 │         │         │
 └────┬────┴────┬────┘
      ▼         ▼
 Functions    Realtime
      │
      ▼
AI Services
```

---

# Frontend Folder Structure

```text
src/

├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
│
├── pages/
│
│   ├── auth/
│   ├── creator/
│   ├── umkm/
│   ├── admin/
│
├── components/
│
│   ├── ui/
│   ├── shared/
│   ├── campaign/
│   ├── creator/
│   ├── order/
│   ├── wallet/
│
├── services/
│
│   ├── auth/
│   ├── users/
│   ├── campaign/
│   ├── submission/
│   ├── orders/
│   ├── wallet/
│   ├── ai/
│
├── hooks/
│
├── store/
│
├── lib/
│
├── constants/
│
├── utils/
│
└── types/
```

---

# Feature-Based Structure

Contoh Campaign Module

```text
campaign/

├── pages/
├── components/
├── hooks/
├── services/
├── schemas/
└── types/
```

Keuntungan:

* scalable
* mudah dipisah
* mudah onboarding developer baru

---

# State Management

## Gunakan

```text
TanStack Query
+
React Context
```

Jangan gunakan Redux dulu.

Belum dibutuhkan.

---

## React Context

Untuk:

```text
Auth Context
Theme Context
Notification Context
```

---

## Query

Untuk:

```text
Campaign
Orders
Creator
Wallet
Analytics
```

---

# Service Layer Pattern

Jangan panggil Appwrite langsung dari halaman.

SALAH:

```jsx
DashboardPage
↓
Appwrite SDK
```

---

BENAR:

```jsx
DashboardPage
↓
CampaignService
↓
Appwrite SDK
```

---

Contoh:

```text
services/campaign/
```

```js
campaign.service.js
```

Methods:

```js
createCampaign()
getCampaign()
updateCampaign()
deleteCampaign()
publishCampaign()
```

---

# Validation Layer

Gunakan:

```text
Zod
```

Contoh:

```js
campaignSchema
offerSchema
withdrawSchema
```

---

# Appwrite Service Modules

---

## Auth Service

```text
register()
login()
logout()
resetPassword()
```

---

## User Service

```text
getProfile()
updateProfile()
```

---

## Creator Service

```text
createRateCard()
updateRateCard()
getPortfolio()
```

---

## Campaign Service

```text
createCampaign()
publishCampaign()
claimCampaign()
```

---

## Submission Service

```text
createSubmission()
approveSubmission()
rejectSubmission()
```

---

## Offer Service

```text
createOffer()
acceptOffer()
declineOffer()
```

---

## Wallet Service

```text
deposit()
withdraw()
getTransactions()
```

---

# Appwrite Functions Structure

```text
functions/

├── create-wallet
├── ai-brief
├── ai-fraud
├── create-order
├── create-escrow
├── release-escrow
├── notifications
├── analytics-sync
```

---

# Function Event Architecture

## User Register

```text
User Register
↓
Create Wallet
↓
Create User Profile
↓
Send Welcome Notification
```

---

## Campaign Publish

```text
Publish Campaign
↓
Generate AI Brief
↓
Notify Eligible Creators
```

---

## Submission Create

```text
Submission Created
↓
AI Fraud Check
↓
Store Fraud Score
```

---

## Offer Accepted

```text
Offer Accepted
↓
Create Order
↓
Create Escrow
```

---

## Order Complete

```text
Order Complete
↓
Release Escrow
↓
Create Wallet Transaction
```

---

# Storage Structure

Karena banyak file media.

```text
avatars/
campaign-assets/
portfolios/
submissions/
chat-attachments/
order-deliveries/
```

---

# Realtime Architecture

Gunakan realtime hanya untuk:

### Chat

```text
Offer Chat
Order Chat
```

---

### Notifications

```text
Wallet
Campaign
Order
```

---

Jangan realtime analytics.

Terlalu mahal dan tidak dibutuhkan pada MVP.

---

# AI Architecture MVP

## AI Brief Assistant

```text
UMKM Input
↓
OpenAI
↓
Generated Brief
↓
Campaign Draft
```

---

## AI Fraud

```text
Submission URL
↓
Collect Metrics
↓
Fraud Analysis
↓
Fraud Score
↓
Admin Review
```

MVP jangan langsung auto-ban.

Hanya:

```text
Low Risk
Medium Risk
High Risk
```

---

# Security Architecture

## Collection Permissions

Prinsip:

```text
Default = Private
```

baru dibuka sesuai role.

---

Contoh:

### Wallet

```text
Owner
Admin
```

---

### Order

```text
Buyer
Creator
Admin
```

---

### Campaign

```text
Public Read
Owner Write
```

---

# Logging Strategy

Buat collection khusus:

```text
audit_logs
```

isi:

```text
User Login
Campaign Publish
Offer Accepted
Escrow Released
Withdraw Request
```

Ini akan sangat membantu saat dispute.

---

# Development Order

Urutan coding yang direkomendasikan:

```text
1. Authentication

2. User Profile

3. Creator Profile

4. Rate Card

5. Campaign

6. Submission

7. Wallet

8. Offer

9. Order

10. Escrow

11. Notifications

12. Analytics

13. AI Brief

14. AI Fraud

15. Admin Panel
```

---

# Arsitektur Final Marketiv

```text
Frontend
React + Vite

State
TanStack Query

Backend
Appwrite

Storage
Appwrite Storage

Realtime
Appwrite Realtime

AI
OpenAI

Architecture
Feature-Based

Pattern
Service Layer

Validation
Zod

Deployment
Cloudflare + Appwrite Cloud
```

Dengan selesainya tahap ini, sebenarnya seluruh fase **perencanaan produk sudah lengkap**:

```text
✅ ERD Final
✅ Appwrite Collection Schema Final
✅ UI Flow & User Journey Mapping
✅ API Contract / Service Contract
✅ Sprint Breakdown & Development Roadmap
✅ Design System & Component Inventory
✅ Implementation Plan (Coding Architecture)
```

Langkah yang paling bernilai berikutnya bukan langsung coding, melainkan membuat **Task Breakdown per Sprint (Jira/Trello Style)** sehingga setiap sprint berubah menjadi daftar pekerjaan harian yang bisa langsung dikerjakan tim 4 orang tanpa kebingungan.
