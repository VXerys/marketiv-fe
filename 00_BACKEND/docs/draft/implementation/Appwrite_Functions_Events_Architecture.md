
# Appwrite Functions & Event Architecture (MVP Marketiv)

Setelah Collection Design selesai, tahap berikutnya memang **Event-Driven Architecture** karena Appwrite bukan framework backend monolith seperti Laravel. Hampir seluruh automasi bisnis akan berjalan melalui:

```text
Database Event
↓
Appwrite Function
↓
Business Logic
↓
Database Update
↓
Notification
```

---

# 1. User Register

## Trigger

```text
users.create
```

## Function

```text
create-user-wallet
```

## Flow

```text
User Register
↓
Function Triggered
↓
Create Wallet
↓
Create User Profile
↓
Send Welcome Notification
```

## Collections Affected

### wallets

```json
{
  "userId": "user_xxx",
  "availableBalance": 0,
  "pendingBalance": 0,
  "escrowBalance": 0,
  "createdAt": "..."
}
```

### notifications

```json
{
  "userId": "user_xxx",
  "title": "Selamat datang di Marketiv",
  "type": "system"
}
```

---

# 2. Campaign Published

## Trigger

```text
campaigns.status
draft → active
```

## Function

```text
campaign-published
```

## Flow

```text
Campaign Publish
↓
Generate Campaign Feed
↓
Notify Eligible Creators
↓
Update Search Index
```

## Collections

### notifications

```json
{
  "userId": "creator_xxx",
  "title": "Campaign baru tersedia",
  "campaignId": "..."
}
```

---

# 3. Campaign Claimed

(MVP yang sekarang menggunakan sistem First Come First Serve)

## Trigger

```text
campaign_claims.create
```

## Function

```text
campaign-claimed
```

## Flow

```text
Creator Claim Campaign
↓
Check Campaign Status
↓
Check Claim Limit
↓
Create Assignment
↓
Notify UMKM
```

## Collections

### campaign_assignments

```json
{
  "campaignId": "...",
  "creatorId": "...",
  "status": "claimed"
}
```

---

# 4. Submission Created

Ini salah satu event terpenting karena USP Marketiv ada di AI Fraud Detection.

## Trigger

```text
submissions.create
```

## Function

```text
ai-fraud-precheck
```

## Flow

```text
Submission Masuk
↓
Validasi Link
↓
Ambil Metadata Video
↓
AI Fraud Analysis
↓
Update Risk Score
↓
Queue Review
```

---

## Fraud Score

### 0 - 30

```text
Low Risk
```

Auto Approve

---

### 31 - 70

```text
Medium Risk
```

Manual Review

---

### 71 - 100

```text
High Risk
```

Auto Reject

---

## Collection

### fraud_checks

```json
{
  "submissionId": "...",
  "score": 15,
  "status": "passed",
  "reason": []
}
```

---

# 5. Submission Approved

## Trigger

```text
submissions.status
pending → approved
```

## Function

```text
calculate-campaign-reward
```

## Flow

```text
Submission Approved
↓
Calculate Views
↓
Calculate Reward
↓
Create Wallet Transaction
↓
Move Balance to Pending
```

## Collections

### wallet_transactions

```json
{
  "userId": "...",
  "type": "campaign_reward",
  "amount": 50000
}
```

---

### wallet

```text
available = 0
pending = 50000
```

---

# 6. Offer Accepted (Rate Card)

Ini masuk workflow Premium.

## Trigger

```text
offers.status
pending → accepted
```

## Function

```text
create-order
```

## Flow

```text
Creator Accept Offer
↓
Create Order
↓
Waiting Payment
↓
Notify UMKM
```

## Collections

### orders

```json
{
  "offerId": "...",
  "status": "awaiting_payment"
}
```

---

# 7. Payment Success

Ini inti Escrow System.

## Trigger

```text
payments.status
pending → paid
```

## Function

```text
create-escrow
```

## Flow

```text
Payment Gateway Callback
↓
Payment Success
↓
Create Escrow Record
↓
Lock Funds
↓
Order → In Progress
```

## Collections

### escrows

```json
{
  "orderId": "...",
  "amount": 500000,
  "status": "locked"
}
```

### wallets

```text
escrowBalance += amount
```

---

# 8. Deliverable Submitted (Rate Card)

## Trigger

```text
deliverables.create
```

## Function

```text
notify-client-review
```

## Flow

```text
Creator Upload Draft
↓
Notify UMKM
↓
Waiting Review
```

---

# 9. Deliverable Approved

## Trigger

```text
deliverables.status
revision_requested → approved
```

## Function

```text
release-escrow
```

## Flow

```text
UMKM Approve Deliverable
↓
Release Escrow
↓
Transfer Balance
↓
Complete Order
↓
Create Transaction History
```

---

## Wallet Update

Before

```text
Creator
available = 100.000

Escrow
500.000
```

After

```text
Creator
available = 600.000

Escrow
0
```

---

# 10. Withdrawal Request

Karena Marketiv menggunakan wallet.

## Trigger

```text
withdrawals.create
```

## Function

```text
create-withdrawal
```

## Flow

```text
User Request Withdraw
↓
Check Available Balance
↓
Create Withdrawal
↓
Deduct Balance
↓
Admin Review
```

---

# 11. Withdrawal Approved

## Trigger

```text
withdrawals.status
pending → completed
```

## Function

```text
complete-withdrawal
```

## Flow

```text
Admin Approve
↓
Transfer Bank/E-Wallet
↓
Mark Completed
↓
Notification
```

---

# 12. Notification Service (Global)

Daripada setiap function mengirim notifikasi sendiri, buat satu service khusus.

## Trigger

```text
notifications.create
```

## Function

```text
send-notification
```

## Channel

```text
In-App
Email
WhatsApp (Future)
Push Notification (Future)
```

---

# Arsitektur Event MVP Marketiv

```text
User Register
↓
Create Wallet

Campaign Publish
↓
Notify Creator

Campaign Claimed
↓
Create Assignment

Submission Created
↓
AI Fraud Check

Submission Approved
↓
Reward Calculation
↓
Pending Balance

Offer Accepted
↓
Create Order

Payment Success
↓
Create Escrow

Deliverable Submitted
↓
Review Request

Deliverable Approved
↓
Release Escrow
↓
Update Wallet

Withdraw Request
↓
Admin Review
↓
Transfer Funds
```

## Catatan Penting MVP

Untuk MVP, saya sarankan hanya membuat **6 Function inti terlebih dahulu**:

```text
1. create-user-wallet
2. campaign-published
3. ai-fraud-precheck
4. create-order
5. create-escrow
6. release-escrow
```

Sisanya dapat ditangani langsung oleh frontend + Appwrite Database terlebih dahulu agar pengembangan lebih cepat. Setelah MVP tervalidasi, baru tambahkan function-function lanjutan seperti analytics, recommendation engine, automated payout, dan AI matching.
