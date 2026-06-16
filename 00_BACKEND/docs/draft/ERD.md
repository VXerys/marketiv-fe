
# ERD (Database Relationship Diagram)

Berdasarkan MVP yang sudah kita sepakati, fokus pada:

* Role: UMKM & Kreator
* Campaign (Pay Per View)
* Rate Card (Influencer Booking)
* Wallet
* Escrow
* AI Brief
* AI Fraud Detection
* Submission
* Negotiation / Custom Offer
* Notification

---

## 1. Users

```text
users
-----
id (PK)
role (umkm|creator|admin)
name
email
phone
avatar
status
created_at
```

---

## 2. Creator Profiles

```text
creator_profiles
----------------
id (PK)
user_id (FK -> users)

bio
province
city

instagram_username
instagram_followers

tiktok_username
tiktok_followers

youtube_username
youtube_subscribers

rating
completed_jobs

created_at
```

### Relation

```text
users (1)
   |
   |---- (1) creator_profiles
```

---

## 3. UMKM Profiles

```text
umkm_profiles
-------------
id (PK)
user_id (FK)

business_name
category
description
logo_url
location

created_at
```

### Relation

```text
users (1)
   |
   |---- (1) umkm_profiles
```

---

# FITUR CAMPAIGN (VIRAL)

## 4. Campaigns

```text
campaigns
---------
id (PK)

umkm_id (FK -> users)

title
type (ugc|clipping)

category

thumbnail_url

budget_total
budget_used

cpm

min_views
max_views

status
(draft|active|paused|completed)

ai_brief_id

created_at
```

### Relation

```text
UMKM
 |
 |---- Campaigns
```

---

## 5. Campaign Brief

```text
campaign_briefs
---------------
id (PK)

campaign_id (FK)

target_audience
goal

cta

required_elements

caption_required

hashtags

allowed_content

forbidden_content

materials_json

generated_by_ai
created_at
```

### Relation

```text
Campaign
   |
   |---- Campaign Brief
```

---

## 6. Campaign Claims

Saat kreator mengambil misi.

```text
campaign_claims
---------------
id (PK)

campaign_id (FK)
creator_id (FK)

status
(claimed|submitted|approved|rejected)

claimed_at
```

### Relation

```text
Campaign
   |
   |---- Campaign Claim
                |
                |---- Creator
```

---

## 7. Submissions

Video yang dikirim kreator.

```text
submissions
-----------
id (PK)

claim_id (FK)

platform
video_url

caption

current_views

analytics_file

status
(pending|approved|rejected)

submitted_at
```

---

## 8. Fraud Analysis

Hasil AI Fraud Detection.

```text
fraud_analyses
--------------
id (PK)

submission_id (FK)

fraud_score

is_suspicious

notes

processed_at
```

### Relation

```text
Submission
    |
    |---- Fraud Analysis
```

---

# FITUR RATE CARD

## 9. Rate Cards

```text
rate_cards
----------
id (PK)

creator_id (FK)

platform

service_name

price

description

delivery_days

revision_limit

is_active
```

### Relation

```text
Creator
   |
   |---- Rate Cards
```

---

## 10. Conversations

Chat UMKM ↔ Kreator

```text
conversations
-------------
id (PK)

umkm_id
creator_id

created_at
```

---

## 11. Messages

```text
messages
--------
id (PK)

conversation_id

sender_id

message

attachment_url

created_at
```

---

## 12. Offers (Custom Offer)

Kesepakatan final.

```text
offers
------
id (PK)

conversation_id

creator_id
umkm_id

title

price

deadline

revision_limit

status
(pending|accepted|rejected)

created_at
```

---

## 13. Orders

Terbentuk setelah offer diterima.

```text
orders
------
id (PK)

offer_id

creator_id
umkm_id

status
(waiting_payment
|active
|review
|completed
|cancelled)

created_at
```

---

## 14. Deliverables

File preview hasil kerja.

```text
deliverables
------------
id (PK)

order_id

file_url

notes

version

created_at
```

---

# PAYMENT SYSTEM

## 15. Wallets

```text
wallets
-------
id (PK)

user_id

available_balance

pending_balance

updated_at
```

### Relation

```text
User
 |
 |---- Wallet
```

---

## 16. Wallet Transactions

```text
wallet_transactions
-------------------
id (PK)

wallet_id

type
(deposit
withdraw
reward
escrow
refund
fee)

amount

reference_type
reference_id

created_at
```

---

## 17. Escrows

Khusus Rate Card.

```text
escrows
-------
id (PK)

order_id

payer_id
receiver_id

amount

status
(held
released
refunded)

created_at
```

### Relation

```text
Order
  |
  |---- Escrow
```

---

# AI SYSTEM

## 18. AI Brief Requests

```text
ai_brief_requests
-----------------
id (PK)

umkm_id

product_description

generated_brief

created_at
```

---

## 19. AI Fraud Jobs

```text
ai_fraud_jobs
-------------
id (PK)

submission_id

status

result_json

created_at
```

---

# NOTIFICATION SYSTEM

## 20. Notifications

```text
notifications
-------------
id (PK)

user_id

title

message

type

is_read

created_at
```

---

# ERD Sederhana

```text
USERS
 ├── UMKM_PROFILES
 ├── CREATOR_PROFILES
 ├── WALLETS
 └── NOTIFICATIONS

UMKM
 ├── CAMPAIGNS
 │     ├── CAMPAIGN_BRIEFS
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

### Catatan penting sebelum lanjut ke tahap 2

Untuk MVP, saya menyarankan **tidak membuat semua tabel ini sekaligus**.

ERD di atas adalah **ERD Final Product**.

Sedangkan untuk **MVP v1**, kemungkinan hanya perlu sekitar **12–14 collection Appwrite**, bukan 20 collection. Setelah ERD final ini disetujui, tahap berikutnya adalah membuat **Appwrite Collection Schema Final (versi MVP)** dan menentukan tabel mana yang benar-benar dibuat sekarang serta mana yang ditunda ke fase berikutnya.
