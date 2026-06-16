
Berdasarkan domain breakdown, MVP, PRD Level 1 & 2 yang sudah kita susun, saya sarankan untuk **Appwrite Collection Design** jangan mengikuti domain secara 1:1, tetapi mengikuti kebutuhan query di dashboard.

Target MVP kita:

* Campaign
* Rate Card
* Chat
* Escrow
* Wallet
* AI Brief
* AI Fraud

Sehingga koleksi Appwrite harus dibuat agar:

* mudah di-query
* minim join
* scalable untuk Phase 2

---

# Database Structure

```text
marketiv
│
├── users
│
├── umkm_profiles
├── creator_profiles
│
├── creator_social_accounts
├── creator_portfolios
│
├── campaigns
├── campaign_assets
├── campaign_claims
├── campaign_submissions
│
├── rate_cards
├── rate_card_packages
│
├── conversations
├── messages
├── offers
│
├── orders
├── revisions
├── deliverables
│
├── wallets
├── transactions
├── escrows
├── withdrawals
│
├── ai_requests
├── fraud_checks
│
└── notifications
```

---

# 1. users

Identity Domain

Sebenarnya Appwrite Auth sudah menyimpan user.

Tetapi kita tetap membutuhkan profile collection.

```json
{
  "$id": "userId",
  "role": "umkm",
  "status": "active",
  "email": "",
  "phone": "",
  "createdAt": ""
}
```

---

# 2. umkm_profiles

```json
{
  "$id": "",
  "userId": "",

  "businessName": "",
  "category": "",
  "description": "",

  "city": "",
  "address": "",

  "instagram": "",
  "tiktok": "",
  "website": "",

  "logoUrl": "",

  "isProfileCompleted": true
}
```

---

# 3. creator_profiles

```json
{
  "$id": "",

  "userId": "",

  "displayName": "",
  "bio": "",

  "city": "",

  "avatarUrl": "",

  "totalFollowers": 0,

  "totalOrders": 0,

  "rating": 0,

  "isProfileCompleted": false
}
```

---

# 4. creator_social_accounts

Satu creator bisa punya banyak akun.

```json
{
  "$id": "",

  "creatorId": "",

  "platform": "tiktok",

  "username": "",

  "followers": 10000,

  "engagementRate": 5.4,

  "isVerified": false
}
```

---

# 5. creator_portfolios

```json
{
  "$id": "",

  "creatorId": "",

  "title": "",

  "description": "",

  "thumbnailUrl": "",

  "portfolioUrl": ""
}
```

---

# 6. campaigns

Collection terbesar MVP.

```json
{
  "$id": "",

  "umkmId": "",

  "title": "",

  "category": "",

  "platforms": [
    "tiktok",
    "instagram"
  ],

  "description": "",

  "budget": 1000000,

  "rewardPer1000Views": 10000,

  "minViews": 10000,

  "maxViews": 500000,

  "brief": "",

  "status": "published",

  "claimLimit": 100,

  "totalClaims": 0,

  "spentAmount": 0,

  "remainingBudget": 1000000,

  "publishedAt": ""
}
```

---

# 7. campaign_assets

Karena satu campaign bisa memiliki banyak asset.

```json
{
  "$id": "",

  "campaignId": "",

  "type": "video",

  "fileUrl": "",

  "fileName": ""
}
```

---

# 8. campaign_claims

Creator mengambil campaign.

```json
{
  "$id": "",

  "campaignId": "",

  "creatorId": "",

  "claimedAt": "",

  "status": "claimed"
}
```

Status:

```text
claimed
submitted
approved
rejected
```

---

# 9. campaign_submissions

Ini yang nanti dipakai AI Fraud.

```json
{
  "$id": "",

  "claimId": "",

  "campaignId": "",

  "creatorId": "",

  "platform": "tiktok",

  "postUrl": "",

  "caption": "",

  "views": 0,

  "engagement": 0,

  "fraudScore": 0,

  "fraudStatus": "safe",

  "status": "pending"
}
```

Fraud Status

```text
safe
review
rejected
```

---

# 10. rate_cards

```json
{
  "$id": "",

  "creatorId": "",

  "title": "",

  "description": "",

  "status": "published"
}
```

---

# 11. rate_card_packages

Karena satu rate card memiliki:

```text
Basic
Standard
Premium
```

```json
{
  "$id": "",

  "rateCardId": "",

  "name": "Basic",

  "price": 100000,

  "deliveryDays": 3,

  "revisionLimit": 1,

  "description": ""
}
```

---

# 12. conversations

Chat room.

```json
{
  "$id": "",

  "umkmId": "",

  "creatorId": "",

  "lastMessage": "",

  "lastMessageAt": ""
}
```

---

# 13. messages

Realtime Appwrite akan banyak dipakai di sini.

```json
{
  "$id": "",

  "conversationId": "",

  "senderId": "",

  "type": "text",

  "content": ""
}
```

Type:

```text
text
image
file
offer
system
```

---

# 14. offers

Custom Offer.

```json
{
  "$id": "",

  "conversationId": "",

  "creatorId": "",

  "umkmId": "",

  "title": "",

  "description": "",

  "price": 200000,

  "deadline": "",

  "revisionLimit": 2,

  "status": "pending"
}
```

---

# 15. orders

Ini pusat Rate Card.

Baik direct order maupun custom offer.

```json
{
  "$id": "",

  "umkmId": "",

  "creatorId": "",

  "offerId": "",

  "packageId": "",

  "amount": 200000,

  "status": "pending_payment"
}
```

Status:

```text
pending_payment
escrow
in_progress
revision
approved
completed
cancelled
```

---

# 16. revisions

```json
{
  "$id": "",

  "orderId": "",

  "requestedBy": "",

  "message": "",

  "status": "open"
}
```

---

# 17. deliverables

Draft hasil kerja creator.

```json
{
  "$id": "",

  "orderId": "",

  "fileUrl": "",

  "notes": "",

  "status": "submitted"
}
```

---

# 18. wallets

Satu user satu wallet.

```json
{
  "$id": "",

  "userId": "",

  "balance": 0,

  "pendingBalance": 0
}
```

---

# 19. transactions

Jangan gabungkan dengan escrow.

```json
{
  "$id": "",

  "userId": "",

  "amount": 0,

  "type": "",

  "referenceId": "",

  "referenceType": "",

  "status": ""
}
```

Type

```text
deposit
withdrawal
payment
refund
release
fee
```

---

# 20. escrows

Domain sensitif.

```json
{
  "$id": "",

  "orderId": "",

  "amount": 0,

  "status": "held"
}
```

---

# 21. withdrawals

```json
{
  "$id": "",

  "userId": "",

  "amount": 0,

  "bankName": "",

  "accountNumber": "",

  "accountName": "",

  "status": "pending"
}
```

---

# 22. ai_requests

Dipakai AI Landing dan AI Brief.

```json
{
  "$id": "",

  "userId": "",

  "feature": "brief",

  "prompt": "",

  "response": ""
}
```

---

# 23. fraud_checks

Pisahkan dari submission agar histori fraud bisa disimpan.

```json
{
  "$id": "",

  "submissionId": "",

  "score": 20,

  "result": "safe",

  "reason": ""
}
```

---

# 24. notifications

```json
{
  "$id": "",

  "userId": "",

  "title": "",

  "message": "",

  "type": "system",

  "isRead": false
}
```

---

## Revisi yang Saya Sarankan Sebelum Implementasi

Dari rancangan sebelumnya, ada 3 penyesuaian penting:

### 1. Tambahkan `orders` sebagai aggregate utama Rate Card

Jangan biarkan Offer langsung mengelola Escrow.

```text
Offer
↓
Order
↓
Escrow
↓
Deliverable
↓
Revision
↓
Completed
```

### 2. Pisahkan `fraud_checks` dari `campaign_submissions`

Karena nanti Phase 2 akan ada:

```text
AI Fraud
Computer Vision
Product Detection
Logo Detection
```

Jika digabung akan sulit berkembang.

### 3. Simpan denormalized data

Contoh pada `campaigns`:

```json
{
  "totalClaims": 12,
  "spentAmount": 250000,
  "remainingBudget": 750000
}
```

Walaupun bisa dihitung dari collection lain, simpan langsung agar dashboard cepat.

---

Menurut saya ini sudah cukup matang untuk masuk ke tahap berikutnya, yaitu **Appwrite Relationship Design (attribute, relationship type, index, dan permission per collection)** sebelum mulai implementasi backend. Itu akan menjadi blueprint yang langsung bisa diterapkan di Appwrite Console.
