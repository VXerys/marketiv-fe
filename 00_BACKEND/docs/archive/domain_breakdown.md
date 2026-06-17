---

# Domain Breakdown

## Arsitektur Tingkat Tinggi

```text
Marketiv
│
├── Identity Domain
├── UMKM Domain
├── Creator Domain
├── Campaign Domain
├── Rate Card Domain
├── Collaboration Domain
├── Financial Domain
├── AI Domain
└── Notification Domain
```

---

# 1. Identity Domain

## Tujuan

Mengelola identitas pengguna dan autentikasi.

## Aktor

* UMKM
* Creator
* Admin

## Tanggung Jawab

* Register
* Login
* Session
* Role Management
* Permission

## Ownership

Identity Domain tidak menyimpan data bisnis.

Hanya:

```text
User
Role
Session
```

---

## Core Entity

### User

```text
id
email
phone
role
status
createdAt
```

---

# 2. UMKM Domain

## Tujuan

Mengelola seluruh data UMKM.

## Tanggung Jawab

* Profil UMKM
* Informasi usaha
* Branding usaha
* Statistik UMKM

---

## Core Entity

### UMKM

```text
id
ownerId
businessName
category
description
city
logo
status
```

---

## Relasi

```text
User
↓
UMKM
↓
Campaign
```

---

# 3. Creator Domain

## Tujuan

Mengelola identitas kreator.

## Tanggung Jawab

* Profil kreator
* Portofolio
* Sosial media
* Statistik performa

---

## Core Entity

### Creator

```text
id
userId
displayName
bio
city
avatar
status
```

---

### Social Account

```text
creatorId
platform
username
followers
engagement
```

---

### Portfolio

```text
creatorId
title
url
thumbnail
```

---

# 4. Campaign Domain

Ini domain terbesar.

---

## Tujuan

Mengelola campaign berbasis performa.

---

## Tanggung Jawab

UMKM:

* Membuat campaign
* Publish campaign

Creator:

* Claim campaign
* Submit campaign

---

## Core Entity

### Campaign

```text
id
umkmId
title
description
budget
brief
status
```

---

### Campaign Asset

```text
campaignId
fileUrl
type
```

---

### Campaign Claim

```text
campaignId
creatorId
claimedAt
status
```

---

### Campaign Submission

```text
claimId
contentUrl
views
status
```

---

## Status Campaign

```text
draft
published
active
completed
cancelled
```

---

# 5. Rate Card Domain

Domain kedua terbesar.

---

## Tujuan

Mengelola layanan kreator.

---

## Core Entity

### Rate Card

```text
id
creatorId
title
description
price
deliveryDays
```

---

### Rate Card Package

```text
id
rateCardId
name
price
revisionLimit
```

---

Contoh:

```text
Basic
Rp100.000

Standard
Rp200.000

Premium
Rp350.000
```

---

# 6. Collaboration Domain

Ini domain yang sering terlupakan.

Padahal seluruh negosiasi berada di sini.

---

## Tujuan

Mengelola interaksi UMKM dan Creator.

---

## Tanggung Jawab

* Chat
* Offer
* Custom Offer
* Revision

---

## Core Entity

### Conversation

```text
id
umkmId
creatorId
```

---

### Message

```text
conversationId
senderId
type
content
```

---

### Offer

```text
id
conversationId
amount
description
status
```

---

## Status Offer

```text
pending
accepted
rejected
expired
```

---

# 7. Financial Domain

Domain paling sensitif.

Saya sarankan dibuat terpisah sejak awal.

---

## Tujuan

Mengelola uang.

---

## Tanggung Jawab

* Deposit
* Escrow
* Withdrawal
* Fee
* Transaction

---

## Core Entity

### Wallet

```text
userId
balance
pendingBalance
```

---

### Transaction

```text
id
userId
amount
type
status
```

---

### Escrow

```text
id
orderId
amount
status
```

---

## Status Escrow

```text
pending
held
released
refunded
```

---

# 8. AI Domain

Karena MVP AI masih kecil, jangan dibuat terlalu rumit.

---

## Tanggung Jawab

### AI Landing Assistant

Menjawab pertanyaan pengguna.

---

### AI Brief Assistant

Menghasilkan brief campaign.

---

### AI Fraud Detection

Memeriksa submission campaign.

---

## Core Entity

### AI Request

```text
id
userId
feature
prompt
response
```

---

# 9. Notification Domain

Terpisah agar mudah berkembang.

---

## Tanggung Jawab

* Notification
* Reminder
* System Message

---

## Core Entity

### Notification

```text
id
userId
title
message
type
isRead
```

---

# Bounded Context

Sekarang bagian paling penting.

```text
Identity
│
├── UMKM
├── Creator
│
├── Campaign
│
├── Rate Card
│
├── Collaboration
│
├── Financial
│
├── AI
│
└── Notification
```

Aturan yang saya sarankan:

### Campaign tidak boleh mengelola uang

Campaign hanya tahu:

```text
Campaign
Claim
Submission
```

Tidak tahu:

```text
Wallet
Escrow
Transaction
```

---

### Financial tidak boleh tahu detail campaign

Financial hanya tahu:

```text
referenceId
referenceType
```

Misal:

```text
referenceType = campaign
referenceType = order
```

---

### Chat tidak boleh tahu pembayaran

Collaboration hanya tahu:

```text
Conversation
Message
Offer
```

---

### AI tidak boleh mengubah data bisnis langsung

AI hanya menghasilkan:

```text
Suggestion
Recommendation
Generated Content
```

Yang menyimpan tetap domain lain.

---

# Output Setelah Domain Breakdown

Setelah ini kita sudah bisa membuat:

```text
Level 2 PRD
↓
Collection Design Appwrite
↓
Document Schema
↓
Event Flow
↓
State Machine
↓
API Contract
```

Dan menurut saya langkah berikutnya yang paling krusial adalah **Collection Design Appwrite**, karena di sanalah kita menentukan collection mana yang benar-benar dibuat dan mana yang hanya menjadi embedded document agar biaya query dan kompleksitas NoSQL tetap rendah.
