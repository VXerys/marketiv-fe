
# Tahap 4 — API Contract & Service Contract (MVP)

Pada tahap ini kita tidak berpikir tentang UI lagi, tetapi tentang:

```text
Frontend
    ↓
Appwrite API
    ↓
Database
    ↓
Functions
    ↓
Events
```

Tujuannya supaya saat coding tidak ada kebingungan endpoint dan alur data.

---

# Arsitektur MVP

```text
React / Next.js
      ↓
Appwrite SDK

├── Auth
├── Database
├── Storage
├── Realtime
└── Functions
```

---

# Service Group

Saya membaginya menjadi 10 service.

```text
Auth Service
Profile Service

Campaign Service
Submission Service

AI Service

Rate Card Service
Chat Service

Order Service
Wallet Service

Admin Service
```

---

# 1. Auth Service

## Register

```typescript
registerUser()
```

Input

```json
{
  "name": "",
  "email": "",
  "password": "",
  "role": "umkm"
}
```

Process

```text
Create Appwrite Auth User
↓
Create Profile
↓
Create Wallet
```

---

## Login

```typescript
loginUser()
```

Return

```json
{
  "user": {},
  "profile": {},
  "wallet": {}
}
```

---

# Event

```text
User Registered
↓
Create Wallet
```

---

# 2. Profile Service

## Get Profile

```typescript
getProfile(userId)
```

---

## Update Profile

```typescript
updateProfile()
```

---

## Add Social Account

```typescript
addSocialAccount()
```

---

## Remove Social Account

```typescript
removeSocialAccount()
```

---

# 3. Campaign Service

Core PPV.

---

## Create Campaign

```typescript
createCampaign()
```

Input

```json
{
  "title": "",
  "type": "ugc",
  "category": "",
  "budget": 100000,
  "cpm": 5000
}
```

Process

```text
Create Campaign
↓
Draft
```

---

## Generate AI Brief

```typescript
generateBrief()
```

Input

```json
{
  "campaignId": "",
  "description": "",
  "materials": []
}
```

Process

```text
AI Function
↓
campaign_briefs
```

---

## Publish Campaign

```typescript
publishCampaign()
```

```text
draft
↓
active
```

---

## Explore Campaigns

```typescript
getCampaigns()
```

Filter

```json
{
  "platform": "tiktok",
  "category": "food",
  "sort": "latest"
}
```

---

## Detail Campaign

```typescript
getCampaignById()
```

---

# 4. Claim Service

---

## Claim Campaign

```typescript
claimCampaign()
```

Input

```json
{
  "campaignId": ""
}
```

Validation

```text
Already claimed?
Campaign active?
Profile complete?
```

---

Process

```text
Create Claim
```

---

# Event

```text
Campaign Claimed
↓
Notify UMKM
```

---

# 5. Submission Service

---

## Create Submission

```typescript
createSubmission()
```

Input

```json
{
  "claimId": "",
  "videoUrl": "",
  "views": 12000
}
```

---

Process

```text
Create Submission
↓
Fraud Queue
```

---

# Event

```text
Submission Created
↓
AI Fraud Detection
```

---

## Get My Submissions

```typescript
getMySubmissions()
```

---

## Approve Submission

```typescript
approveSubmission()
```

UMKM only.

---

Process

```text
Calculate Reward
↓
Pending Wallet
```

---

## Reject Submission

```typescript
rejectSubmission()
```

---

# 6. AI Service

Semua AI dijalankan melalui Appwrite Function.

---

## AI Brief Function

```typescript
POST /functions/ai-brief
```

Input

```json
{
  "campaignId": ""
}
```

Return

```json
{
  "brief": {}
}
```

---

## AI Fraud Function

```typescript
POST /functions/fraud-detection
```

Input

```json
{
  "submissionId": ""
}
```

Return

```json
{
  "score": 0.82,
  "status": "safe"
}
```

---

# Event Architecture

```text
Submission Created
↓
Fraud Function
↓
Update Submission
```

---

# 7. Rate Card Service

---

## Create Rate Card

```typescript
createRateCard()
```

---

## Update Rate Card

```typescript
updateRateCard()
```

---

## Get Creator Rate Cards

```typescript
getRateCards()
```

---

## Search Creators

```typescript
searchCreators()
```

Filter

```json
{
  "platform": "tiktok",
  "city": "sukabumi"
}
```

---

# 8. Chat Service

---

## Create Conversation

```typescript
createConversation()
```

---

## Send Message

```typescript
sendMessage()
```

Input

```json
{
  "conversationId": "",
  "content": ""
}
```

---

Realtime

```text
Message Sent
↓
Realtime Event
↓
Receiver UI Update
```

---

# 9. Offer Service

---

## Create Offer

```typescript
createOffer()
```

Input

```json
{
  "conversationId": "",
  "price": 300000
}
```

---

## Accept Offer

```typescript
acceptOffer()
```

Process

```text
Offer Accepted
↓
Create Order
```

---

## Reject Offer

```typescript
rejectOffer()
```

---

# Event

```text
Offer Accepted
↓
Order Created
```

---

# 10. Order Service

---

## Get Orders

```typescript
getOrders()
```

---

## Upload Deliverable

```typescript
uploadDeliverable()
```

Input

```json
{
  "orderId": "",
  "fileUrl": ""
}
```

---

## Approve Deliverable

```typescript
approveDeliverable()
```

Process

```text
Escrow Release
↓
Wallet
```

---

## Request Revision

```typescript
requestRevision()
```

---

# 11. Wallet Service

---

## Get Wallet

```typescript
getWallet()
```

---

## Withdraw Request

```typescript
requestWithdraw()
```

Input

```json
{
  "amount": 100000
}
```

Validation

```text
Balance >= Amount
Min Withdraw
```

---

Process

```text
Withdraw Pending
```

---

# 12. Admin Service

---

## Review Fraud

```typescript
reviewFraud()
```

---

## Review Withdraw

```typescript
approveWithdraw()
```

```typescript
rejectWithdraw()
```

---

## Suspend User

```typescript
suspendUser()
```

---

# Appwrite Event Architecture

Ini yang nanti menjadi backbone sistem.

```text
USER REGISTERED
↓
Create Wallet

CAMPAIGN PUBLISHED
↓
Notification

CAMPAIGN CLAIMED
↓
Notification

SUBMISSION CREATED
↓
AI Fraud Detection

SUBMISSION APPROVED
↓
Reward Calculation

OFFER ACCEPTED
↓
Create Order

PAYMENT SUCCESS
↓
Escrow Hold

DELIVERABLE APPROVED
↓
Release Escrow

WITHDRAW REQUESTED
↓
Admin Review
```

---

# Permission Model

## Public

```text
Landing
Campaign Explore
Creator Explore
```

---

## Creator

```text
Claim Campaign
Submission
Rate Card
Withdraw
```

---

## UMKM

```text
Campaign
Approve Submission
Order
Escrow
```

---

## Admin

```text
All Access
```

---

# Deliverable Tahap 4 Selesai

Dengan selesainya tahap ini, kita sudah memiliki:

```text
✅ ERD Final
✅ Collection Schema
✅ User Journey
✅ API Contract
```

Tahap berikutnya yang paling penting sebelum coding adalah **Tahap 5 — Sprint Breakdown & Development Roadmap**, yaitu memecah seluruh Marketiv menjadi sprint mingguan (Sprint 1, Sprint 2, Sprint 3, dst.) lengkap dengan urutan implementasi Appwrite, database, frontend, AI, payment, dan deployment. Ini biasanya menjadi dokumen eksekusi tim.
