
# API & Permission Matrix Design (Marketiv MVP)

Tujuan tahap ini adalah menentukan:

```text
Siapa boleh melakukan apa?
↓
Collection mana yang bisa diakses?
↓
Permission Appwrite seperti apa?
↓
Function mana yang bypass permission?
```

Ini penting karena Appwrite menggunakan security model yang berbeda dengan Laravel.

---

# 1. User Roles

## Creator

```text
Mencari Campaign
Claim Campaign
Upload Submission
Menerima Offer
Mengelola Wallet
Withdraw
```

---

## UMKM

```text
Membuat Campaign
Mengelola Budget
Melihat Submission
Membuat Offer
Membayar Order
Review Deliverable
```

---

## Admin

```text
Approve Withdrawal
Handle Dispute
Moderasi User
Review Fraud
Monitoring Sistem
```

---

# 2. API Service Layer

Walaupun Appwrite menggunakan SDK langsung, tetap buat service layer.

```text
src/services/
```

```text
auth.service.js
user.service.js
campaign.service.js
claim.service.js
submission.service.js
offer.service.js
order.service.js
wallet.service.js
notification.service.js
```

---

# 3. Permission Matrix

## users

### Creator

```text
READ: Self
UPDATE: Self
DELETE: No
CREATE: Register
```

---

### UMKM

```text
READ: Self
UPDATE: Self
DELETE: No
CREATE: Register
```

---

### Admin

```text
READ: All
UPDATE: All
DELETE: All
```

---

# 4. Campaigns

## Creator

```text
READ: Active Campaign Only
CREATE: No
UPDATE: No
DELETE: No
```

---

## UMKM

```text
READ: Own Campaign
CREATE: Yes
UPDATE: Own Campaign
DELETE: Draft Only
```

---

## Admin

```text
Full Access
```

---

# 5. Campaign Claims

## Creator

```text
READ: Own Claim
CREATE: Claim Campaign
UPDATE: No
DELETE: No
```

---

## UMKM

```text
READ: Claims on Own Campaign
```

---

## Admin

```text
Full Access
```

---

# 6. Submissions

## Creator

```text
READ: Own Submission
CREATE: Yes
UPDATE: Before Review
DELETE: No
```

---

## UMKM

```text
READ: Submission on Own Campaign
UPDATE:
Approve
Reject
Request Revision
```

---

## Admin

```text
Full Access
```

---

# 7. Offers

## Creator

```text
READ: Own Offers
UPDATE:
Accept
Reject
```

---

## UMKM

```text
CREATE: Offer
READ: Own Offers
UPDATE: Cancel
```

---

## Admin

```text
READ ONLY
```

---

# 8. Orders

## Creator

```text
READ: Related Orders
```

---

## UMKM

```text
READ: Related Orders
```

---

## Admin

```text
Full Access
```

---

# 9. Escrows

Escrow tidak boleh disentuh user.

## Creator

```text
NO ACCESS
```

## UMKM

```text
NO ACCESS
```

## Admin

```text
READ ONLY
```

---

## Function

```text
CREATE
UPDATE
RELEASE
```

Menggunakan API Key Server.

---

# 10. Wallet

## Creator

```text
READ: Own Wallet
```

---

## UMKM

```text
READ: Own Wallet
```

---

## Admin

```text
READ ONLY
```

---

## Function

```text
UPDATE BALANCE
TRANSFER
RELEASE ESCROW
WITHDRAW
```

---

# 11. Wallet Transactions

## Creator

```text
READ: Own Transaction
```

---

## UMKM

```text
READ: Own Transaction
```

---

## Admin

```text
READ ALL
```

---

# 12. Withdrawals

## Creator

```text
CREATE
READ OWN
```

---

## UMKM

```text
CREATE
READ OWN
```

---

## Admin

```text
APPROVE
REJECT
COMPLETE
```

---

# 13. Notifications

## Creator

```text
READ OWN
```

---

## UMKM

```text
READ OWN
```

---

## Admin

```text
CREATE SYSTEM NOTIFICATION
```

---

# 14. Chat Room (Rate Card)

## Creator

```text
READ OWN ROOM
SEND MESSAGE
```

---

## UMKM

```text
READ OWN ROOM
SEND MESSAGE
```

---

## Admin

```text
READ ONLY
```

---

# Permission Pattern Appwrite

Jangan gunakan role-based permission seperti Laravel.

Gunakan document-level permission:

## Campaign

Saat dibuat:

```javascript
Permission.read(Role.any()),
Permission.update(Role.user(umkmId)),
Permission.delete(Role.user(umkmId))
```

---

## Submission

Saat dibuat:

```javascript
Permission.read(Role.user(creatorId)),
Permission.read(Role.user(umkmId)),
Permission.update(Role.user(umkmId))
```

---

## Chat Message

```javascript
Permission.read(Role.user(senderId)),
Permission.read(Role.user(receiverId))
```

---

# Function API Key Scope

Buat 1 API Key khusus backend function.

Permission:

```text
databases.read
databases.write

users.read

storage.read
storage.write

functions.read
functions.write
```

Jangan pernah expose key ini ke frontend.

---

# Arsitektur Akses MVP

```text
Frontend
↓
Appwrite SDK

Creator
↓
Campaign
↓
Claim
↓
Submission

UMKM
↓
Campaign
↓
Offer
↓
Order

Function Layer
↓
Escrow
↓
Wallet
↓
Fraud Detection
↓
Notification

Admin
↓
Moderation
↓
Withdrawal
↓
Dispute
```

## Setelah Tahap Ini

Tahap berikutnya adalah **Frontend Route Architecture & Folder Structure**, yaitu mendefinisikan seluruh halaman, route React Router, layout, service, hook, dan state management agar implementasi coding dapat dimulai tanpa kebingungan struktur proyek.
