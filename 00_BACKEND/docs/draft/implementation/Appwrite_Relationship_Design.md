
# Appwrite Relationship Design

Setelah Collection Design selesai, tahap berikutnya adalah menentukan:

```text
Attribute
Relationship
Index
Permission
```

Tujuannya agar:

* Query cepat
* Realtime mudah
* Tidak terjadi full scan collection
* Mudah scaling ketika user sudah ribuan

---

# 1. users

## Attributes

| Attribute | Type   | Required |
| --------- | ------ | -------- |
| userId    | string | yes      |
| role      | enum   | yes      |
| status    | enum   | yes      |
| email     | string | yes      |
| phone     | string | no       |

---

## Index

```text
userId (unique)
email (unique)
role
status
```

---

## Permission

```text
User:
read own

Admin:
read/write all
```

---

# 2. umkm_profiles

## Attributes

```text
userId
businessName
category
description
city
address
instagram
tiktok
website
logoUrl
isProfileCompleted
```

---

## Relationship

```text
User
1
↓
1
UMKM Profile
```

Appwrite:

```text
One To One
```

---

## Index

```text
userId (unique)
city
category
isProfileCompleted
```

Karena nanti dipakai:

```text
Cari UMKM
Filter kota
Filter kategori
```

---

## Permission

```text
Owner:
read/write

Public:
read
```

Agar creator dapat melihat profil UMKM.

---

# 3. creator_profiles

## Relationship

```text
User
1
↓
1
Creator Profile
```

---

## Index

```text
userId (unique)

displayName

city

rating

totalFollowers

isProfileCompleted
```

Karena halaman browse creator akan sangat sering memakai query ini.

---

## Permission

```text
Owner:
read/write

Public:
read
```

---

# 4. creator_social_accounts

## Relationship

```text
Creator
1
↓
N
Social Accounts
```

---

## Index

```text
creatorId
platform
followers
```

---

## Permission

```text
Owner write

Public read
```

---

# 5. creator_portfolios

## Relationship

```text
Creator
1
↓
N
Portfolio
```

---

## Index

```text
creatorId
```

---

## Permission

```text
Public read

Owner write
```

---

# 6. campaigns

Ini collection terpenting.

---

## Relationship

```text
UMKM
1
↓
N
Campaign
```

---

## Attributes

Tambahkan:

```text
title
category
platforms

budget
spentAmount
remainingBudget

rewardPer1000Views

claimLimit
totalClaims

status

publishedAt
createdAt
```

---

## Index

```text
umkmId

status

category

publishedAt DESC

remainingBudget
```

---

## Query yang sering terjadi

Job Board:

```text
status = published

ORDER BY publishedAt DESC
```

Dashboard UMKM:

```text
umkmId = X
```

---

## Permission

```text
Public read

Owner write

Admin full access
```

---

# 7. campaign_assets

## Relationship

```text
Campaign
1
↓
N
Assets
```

---

## Index

```text
campaignId
```

---

## Permission

```text
Campaign owner write

Public read
```

---

# 8. campaign_claims

## Relationship

```text
Campaign
1
↓
N
Claims

Creator
1
↓
N
Claims
```

---

## Index

```text
campaignId
creatorId

status

claimedAt DESC
```

---

## Critical Unique Constraint

Jangan biarkan:

```text
Creator A
claim campaign yang sama
berkali-kali
```

Buat validasi backend:

```text
campaignId + creatorId
must unique
```

---

## Permission

```text
Creator create

Creator read own

Campaign owner read
```

---

# 9. campaign_submissions

## Relationship

```text
Claim
1
↓
1
Submission
```

---

## Index

```text
claimId

creatorId

campaignId

status

fraudStatus
```

---

## Query

Dashboard Creator:

```text
creatorId
```

Review UMKM:

```text
campaignId

status=pending
```

---

## Permission

```text
Creator create

Creator read own

UMKM read
```

---

# 10. rate_cards

## Relationship

```text
Creator
1
↓
N
Rate Cards
```

Walaupun MVP mungkin hanya satu rate card per creator, saya sarankan tetap One-to-Many.

---

## Index

```text
creatorId

status

createdAt DESC
```

---

## Permission

```text
Public read

Owner write
```

---

# 11. rate_card_packages

## Relationship

```text
Rate Card
1
↓
N
Package
```

---

## Index

```text
rateCardId
price
```

---

## Permission

```text
Public read

Owner write
```

---

# 12. conversations

Collection paling sering diakses setelah messages.

---

## Relationship

```text
UMKM
1
↓
N

Conversation

N
↑
1

Creator
```

---

## Tambahkan

```text
lastMessage
lastMessageAt

unreadCountUMKM
unreadCountCreator
```

Denormalisasi sangat penting.

---

## Index

```text
umkmId

creatorId

lastMessageAt DESC
```

---

## Permission

```text
Participant only
```

---

# 13. messages

Jangan simpan attachment langsung.

Gunakan Storage.

---

## Relationship

```text
Conversation
1
↓
N
Messages
```

---

## Tambahkan

```text
senderId

type

content

attachmentUrl

isRead

createdAt
```

---

## Index

```text
conversationId

createdAt DESC

senderId
```

---

## Permission

```text
Participant only
```

---

# 14. offers

## Relationship

```text
Conversation
1
↓
N
Offer
```

---

## Index

```text
conversationId

status

createdAt DESC
```

---

## Permission

```text
Conversation participant
```

---

# 15. orders

Aggregate utama Rate Card.

---

## Relationship

```text
Offer
1
↓
1
Order

atau

Package
1
↓
1
Order
```

---

## Index

```text
umkmId

creatorId

status

createdAt DESC
```

---

## Query

Dashboard Creator:

```text
creatorId
```

Dashboard UMKM:

```text
umkmId
```

---

## Permission

```text
Buyer
Seller
Admin
```

---

# 16. revisions

## Relationship

```text
Order
1
↓
N
Revision
```

---

## Index

```text
orderId
status
```

---

# 17. deliverables

## Relationship

```text
Order
1
↓
N
Deliverable
```

---

## Index

```text
orderId

createdAt DESC
```

---

# 18. wallets

## Relationship

```text
User
1
↓
1
Wallet
```

---

## Index

```text
userId unique
```

---

## Permission

```text
Owner read

Admin write
```

User tidak boleh update saldo sendiri.

---

# 19. transactions

Collection finansial utama.

---

## Relationship

```text
Wallet
1
↓
N
Transaction
```

---

## Index

```text
userId

referenceId

referenceType

status

createdAt DESC
```

---

## Permission

```text
Owner read

System write

Admin read
```

---

# 20. escrows

## Relationship

```text
Order
1
↓
1
Escrow
```

---

## Index

```text
orderId unique

status
```

---

## Permission

```text
Admin/System only
```

Escrow tidak boleh disentuh user.

---

# 21. withdrawals

## Index

```text
userId

status

createdAt DESC
```

---

## Permission

```text
User create

Admin approve
```

---

# 22. ai_requests

## Index

```text
userId

feature

createdAt DESC
```

---

## Permission

```text
Owner read

System write
```

---

# 23. fraud_checks

## Relationship

```text
Submission
1
↓
N
Fraud Checks
```

Karena Phase 2 nanti bisa:

```text
Fraud Check #1
Fraud Check #2
Computer Vision Check
Logo Detection Check
```

---

## Index

```text
submissionId

result

createdAt DESC
```

---

# 24. notifications

## Index

```text
userId

isRead

createdAt DESC
```

---

## Permission

```text
Owner read

System write
```

---

# Appwrite Storage Bucket Design

Selain collection, kita juga perlu bucket terpisah.

```text
marketiv-assets
│
├── avatars
├── logos
├── portfolios
├── campaign-assets
├── deliverables
├── chat-files
└── fraud-evidence
```

Jangan gabungkan semuanya dalam satu folder tanpa struktur karena nanti permission dan lifecycle file akan sulit dikelola.

---

# Tahap Berikutnya

Setelah ini, saya sarankan masuk ke **Appwrite Functions & Event Architecture**, yaitu mendefinisikan:

```text
User Register
↓
Create Wallet

Campaign Published
↓
Notification

Submission Created
↓
AI Fraud Detection

Offer Accepted
↓
Create Order

Payment Success
↓
Create Escrow

Order Approved
↓
Release Escrow
↓
Update Wallet
```

Tahap ini sangat penting karena Appwrite sangat mengandalkan **Functions + Events** dibanding backend monolith tradisional. Ini akan menjadi blueprint backend Marketiv sebelum mulai coding.
