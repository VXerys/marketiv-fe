---

# 1. AUTHENTICATION FLOW

---

# UMKM REGISTRATION

```text
Landing Page
↓
Klik Daftar UMKM (/register?role=umkm)
↓
Isi:
- Nama Usaha
- Kategori Usaha
- Email
- Nomor HP
- Password

↓
Submit
↓
Verifikasi Email (Link Valid 10 Menit)
├─ Halaman Check Inbox
└─ Opsi Kirim Ulang Link
↓
Account Created
↓
Login
```

---

# CREATOR REGISTRATION

```text
Landing Page
↓
Klik Daftar Creator (/register?role=creator)
↓
Isi:
- Nama Lengkap
- Email
- Password
(Atau Daftar Menggunakan Google OAuth)

↓
Submit
↓
Verifikasi Email (Link Valid 10 Menit)
├─ Halaman Check Inbox
└─ Opsi Kirim Ulang Link
↓
Account Created
↓
Login
```

---

# LOGIN FLOW

```text
Login (/login?role=umkm atau ?role=creator)
↓
UMKM: Email + Password
Creator: Email + Password ATAU Google Login
↓
Success
↓
Dashboard
```

---

# FORGOT PASSWORD

```text
Klik Lupa Password
↓
Input Email
↓
Kirim Link Reset
↓
Open Email
↓
Reset Password
↓
Login
```

---

# 2. ONBOARDING FLOW

---

# UMKM ONBOARDING

```text
First Login
↓
Wizard Onboarding
```

Step 1

```text
Nama UMKM (Pre-filled dari Register)
Kategori (Pre-filled dari Register)
Deskripsi
```

↓

Step 2

```text
Logo
Foto Produk
```

↓

Step 3

```text
Tujuan Marketing

- Branding
- Penjualan
- Awareness
```

↓

Finish

↓

Dashboard

---

# CREATOR ONBOARDING

Step 1

```text
Nama
Foto Profil
Bio
```

↓

Step 2

```text
Tambah Sosial Media
```

↓

Step 3

```text
Verifikasi Akun Sosial
```

↓

Step 4

```text
Pilih Niche

- Kuliner
- Fashion
- Beauty
- Gaming
- Edukasi
```

↓

Finish

↓

Dashboard

---

# 3. CREATOR VERIFICATION FLOW

```text
Dashboard Creator
↓
Menu Verification
```

Input

```text
Platform
Username
```

↓

System Generate Code

```text
MARKETIV-XXXX
```

↓

Creator:

```text
Pasang di Bio
atau
Posting Story
```

↓

Verify

↓

System Check

↓

Verified

---

# 4. RATE CARD FLOW

---

# CREATOR CREATE RATE CARD

```text
Dashboard
↓
Rate Card
↓
Tambah Rate Card
```

Input

```text
Judul
Platform
Harga
Deskripsi
Revisi
Durasi
```

↓

Publish

↓

Active

---

# UMKM DISCOVER CREATOR

```text
Dashboard
↓
Creator Discovery
↓
Browse Creator
↓
Search
↓
Filter
↓
Open Profile
↓
View Rate Card
↓
Kirim Offer
```

---

# CREATE OFFER

```text
Input:

Judul Campaign
Brief
Deadline
Rate Card
Catatan
```

↓

Submit

↓

Pending

---

# CREATOR REVIEW OFFER

```text
Notification
↓
Offer Detail
```

Pilihan

```text
Accept
Reject
```

---

# ORDER CREATED

Jika Accept

```text
Offer Accepted
↓
Create Order
↓
Waiting Payment
```

---

# PAYMENT FLOW

```text
Open Order
↓
Bayar
↓
Gateway Success
↓
Escrow Locked
↓
Order Active
```

---

# PRODUCTION FLOW

```text
Creator Produksi
↓
Upload Draft
↓
Waiting Review
```

---

# REVISION FLOW

```text
UMKM Review
```

Pilihan

```text
Approve

atau

Request Revision
```

Jika Revisi

```text
Revision Requested
↓
Creator Reupload
↓
Waiting Review
```

---

# PUBLISH FLOW

```text
Draft Approved
↓
Creator Posting
↓
Submit URL
↓
System Verify URL
↓
Waiting Final Approval
```

---

# COMPLETION FLOW

```text
Approve Final
↓
Release Escrow
↓
Wallet Creator +
↓
Completed
```

---

# ORDER CANCELLATION FLOW

Sebelum pembayaran

```text
Cancel
↓
Order Closed
```

Setelah pembayaran

```text
Request Cancellation
↓
Admin Review
↓
Refund / Reject
```

---

# 5. CAMPAIGN VIRAL FLOW

---

# CREATE CAMPAIGN

```text
Dashboard
↓
Campaign Viral
↓
Create Campaign
```

---

# STEP 1 BASIC INFO

```text
Nama Campaign
Kategori
Thumbnail
```

↓

Next

---

# STEP 2 UPLOAD ASSET

```text
Video Mentah
Logo
Foto Produk
```

↓

Upload

↓

Next

---

# STEP 3 AI BRIEF

```text
Deskripsi Produk
Target Market
Goal Campaign
```

↓

Generate AI Brief

↓

Output

```text
Hook
CTA
Hashtag
Guideline
```

↓

Edit

↓

Next

---

# STEP 4 REWARD

```text
Budget
CPM
Min Views
Max Views
Creator Limit
```

↓

Publish

---

# CAMPAIGN STATUS

```text
Draft
↓
Published
↓
Running
↓
Paused
↓
Completed
```

---

# CAMPAIGN PAUSE

```text
Open Campaign
↓
Pause
↓
No New Claim
↓
Tracking Tetap Berjalan
```

---

# CAMPAIGN RESUME

```text
Resume
↓
Published
↓
Claim Dibuka Lagi
```

---

# CAMPAIGN STOP

```text
Stop Campaign
↓
No New Claim
↓
Tracking Selesai
↓
Completed
```

---

# CREATOR DISCOVER CAMPAIGN

```text
Marketplace
↓
Browse Campaign
↓
Search
↓
Filter
↓
Open Detail
```

---

# CLAIM CAMPAIGN

```text
Read Brief
↓
Checklist Rules
↓
Claim
↓
Claimed
```

---

# PRODUCE CONTENT

```text
Download Asset
↓
Edit Video
↓
Posting
```

---

# SUBMIT RESULT

```text
My Campaign
↓
Submit Result
```

Input

```text
Platform
Username
URL
Caption
```

↓

Submit

---

# AI VALIDATION FLOW

```text
Submission Created
↓
AI Validation
```

Check:

```text
URL Valid
Duplicate
Logo
Asset Similarity
Fraud Signal
```

↓

Result

```text
Approved
Warning
Rejected
```

---

# MANUAL REVIEW FLOW

Jika Warning

```text
Fraud Queue
↓
Admin Review
```

↓

Keputusan

```text
Approve
Reject
Ban Creator
```

---

# TRACKING FLOW

Jika Approved

```text
Tracking Start
↓
Views Update
↓
Reward Update
↓
Pending Balance
```

---

# PAYOUT FLOW

```text
Tracking End
↓
Reward Final
↓
Wallet Pending
↓
Wallet Available
```

---

# 6. WALLET FLOW

---

# WALLET CREATOR

```text
Dashboard
↓
Wallet
```

Data

```text
Available
Pending
Withdrawn
```

---

# WITHDRAW REQUEST

```text
Wallet
↓
Withdraw
```

Input

```text
Bank
Account Name
Account Number
Amount
```

↓

Submit

↓

Pending

↓

Paid

---

# WITHDRAW REJECTED

```text
Admin Reject
↓
Reason
↓
Balance Returned
```

---

# WALLET UMKM

```text
Dashboard
↓
Wallet
```

Data

```text
Available Balance
Locked Balance
```

---

# TOP UP

```text
Top Up
↓
Select Amount
↓
Payment Gateway
↓
Success
↓
Balance Added
```

---

# REFUND

```text
Refund Approved
↓
Balance Returned
↓
Wallet UMKM +
```

---

# 7. NOTIFICATION FLOW

Trigger:

```text
Offer Received
Offer Accepted
Offer Rejected

Order Created
Payment Success

Draft Uploaded
Revision Requested

Campaign Claimed
Submission Approved
Submission Rejected

Withdraw Approved
Withdraw Rejected

Dispute Opened
Dispute Resolved
```

↓

Notification Center

↓

Read

↓

Archived

---

# 8. DISPUTE FLOW

RATE CARD

```text
Order Active
↓
Open Dispute
```

Alasan

```text
Konten Tidak Sesuai
Tidak Posting
Spam
```

↓

Admin Review

↓

Keputusan

```text
Creator Win
UMKM Win
Partial Refund
```

---

# CAMPAIGN VIRAL DISPUTE

```text
Submission Rejected
↓
Creator Appeal
↓
Admin Review
↓
Final Decision
```

---

# 9. REPORT FLOW

---

# REPORT CREATOR

```text
Open Creator
↓
Report
```

Alasan

```text
Spam
Fake Account
Fraud
Abuse
```

↓

Admin Queue

---

# REPORT CAMPAIGN

```text
Open Campaign
↓
Report
```

↓

Admin Review

---

# 10. ADMIN MODERATION FLOW

---

# USER MANAGEMENT

```text
View Users
↓
Suspend
↓
Ban
↓
Restore
```

---

# CAMPAIGN MANAGEMENT

```text
Review Campaign
↓
Approve
↓
Reject
↓
Pause
```

---

# FRAUD REVIEW

```text
AI Flagged
↓
Fraud Queue
↓
Review
↓
Approve
Reject
Ban
```

---

# PAYMENT REVIEW

```text
Withdraw Queue
↓
Approve
↓
Transfer
↓
Paid
```

---

# REFUND REVIEW

```text
Refund Request
↓
Review
↓
Approve
Reject
```

---

# 11. AI FLOWS (USP MARKETIV)

---

# AI LANDING PAGE ASSISTANT

```text
Visitor
↓
Ask Question
↓
AI Assistant
↓
Recommend:

Rate Card
atau
Campaign Viral
```

---

# AI BRIEF ASSISTANT

```text
UMKM Input:

Produk
Target Market
Goal
```

↓

Generate

```text
Hook
CTA
Hashtag
Script
Guideline
```

↓

Save Brief

---

# AI FRAUD DETECTION

```text
Submission
↓
Collect Metrics
↓
Analyze Pattern
↓
Risk Score
```

↓

Output

```text
Safe
Warning
Fraud
```

↓

Action

```text
Auto Approve
Manual Review
Auto Reject
```

---

# FLOW FINAL MARKETIV (LEVEL MVP)

Jika disederhanakan ke level domain:

```text
AUTH
├─ Register
├─ Login
├─ Onboarding
└─ Verification

RATE CARD
├─ Discovery
├─ Offer
├─ Order
├─ Escrow
├─ Revision
├─ Publish
└─ Completion

CAMPAIGN VIRAL
├─ Create Campaign
├─ AI Brief
├─ Claim
├─ Submit
├─ AI Validation
├─ Tracking
└─ Payout

SYSTEM
├─ Wallet
├─ Top Up
├─ Withdraw
├─ Refund
├─ Notification
├─ Report
├─ Dispute
├─ Fraud Review
└─ Admin Moderation
```


