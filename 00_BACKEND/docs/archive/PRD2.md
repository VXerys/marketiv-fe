# PRD Level 2 — Functional Requirements

Pada level ini kita berhenti berbicara tentang bisnis dan mulai berbicara tentang:

```text
Apa yang dapat dilakukan user?
Apa yang terjadi ketika tombol ditekan?
Apa validasinya?
Apa outputnya?
```

Karena nantinya AI seperti Claude, Gemini, Codex, Cursor, atau Roo Code akan membaca dokumen ini untuk menghasilkan kode.

---

# MODULE 1 — AUTHENTICATION

## User Story

Sebagai pengguna, saya ingin membuat akun dan masuk ke platform agar dapat menggunakan layanan Marketiv.

---

## Register

### Actor

* UMKM
* Creator

### Flow

```text
Landing Page
↓
Register
↓
Pilih Role
↓
Isi Data
↓
Verifikasi
↓
Dashboard
```

---

### UMKM Registration

Field:

```text
Nama Pemilik
Email
Nomor WhatsApp
Password

Nama UMKM
Kategori UMKM
Kota
```

Validation:

```text
Email unik
Whatsapp unik
Password minimal 8 karakter
```

---

### Creator Registration

Field:

```text
Nama Lengkap
Email
Nomor WhatsApp
Password
Kota
```

Validation:

```text
Email unik
Whatsapp unik
Password minimal 8 karakter
```

---

## Login

Field

```text
Email
Password
```

Output

```text
Session Appwrite
JWT
User Profile
```

---

# MODULE 2 — UMKM PROFILE

## User Story

Sebagai UMKM saya ingin mengelola profil usaha agar kreator dapat memahami bisnis saya.

---

## Create Profile

Field

```text
Logo
Nama UMKM
Kategori
Deskripsi
Alamat
Kota
Instagram
TikTok
Website
```

---

## AI Landing Assistant

### Tujuan

Membantu UMKM memahami fitur Marketiv.

### Input

```text
Pertanyaan User
```

### Output

```text
Jawaban AI
Rekomendasi Fitur
```

Sesuai proposal P2MW, AI ini berfungsi sebagai onboarding assistant.  

---

# MODULE 3 — CREATOR PROFILE

## User Story

Sebagai kreator saya ingin membuat profil profesional agar dapat memperoleh pekerjaan.

---

## Creator Profile

Field

```text
Avatar
Display Name
Bio
Kota
```

---

## Social Accounts

Field

```text
Platform
Username
Followers
```

Platform

```text
TikTok
Instagram
YouTube
```

---

## Portfolio

Field

```text
Judul
Thumbnail
URL
Deskripsi
```

---

# MODULE 4 — CAMPAIGN

Ini merupakan USP utama Marketiv.

Proposal menyebut:

```text
UMKM Upload Asset
↓
Creator Claim
↓
Creator Posting
↓
Validasi Views
↓
Pembayaran
```



---

# Campaign Lifecycle

```text
Draft
↓
Published
↓
Active
↓
Completed

atau

Cancelled
```

---

## Create Campaign

### Actor

UMKM

---

### Step 1

Basic Information

Field

```text
Campaign Name
Kategori
Platform
```

---

### Step 2

Budget

Field

```text
Budget
Reward per 1000 Views
Min Views
Max Views
```

---

### Step 3

Brief

Button

```text
Generate With AI
```

---

## AI Brief Assistant

Salah satu USP utama proposal. 

Input:

```text
Nama Produk
Deskripsi Produk
Target Audiens
Tujuan Campaign
```

Output:

```text
Campaign Brief
Hashtag
CTA
Guideline Konten
```

---

## Publish Campaign

Validation:

```text
Budget > 0
Brief tersedia
Asset tersedia
```

Output:

```text
Campaign muncul pada Job Board
```

---

# MODULE 5 — CAMPAIGN CLAIM

## User Story

Sebagai kreator saya ingin mengambil campaign agar dapat memperoleh penghasilan.

---

## Claim Campaign

Validation:

```text
Creator Profile Complete
Social Account Connected
```

---

Output:

```text
Campaign Claim Created
Status = Claimed
```

---

# MODULE 6 — CAMPAIGN SUBMISSION

## Submit Content

Field

```text
Platform
Post URL
Caption
```

---

Status

```text
Pending
Approved
Rejected
Fraud Review
```

---

# AI Fraud Detection

Untuk MVP saya sarankan sederhana.

Bukan Computer Vision dulu.

Proposal memang menyebut Computer Vision, tetapi untuk MVP sebaiknya ditunda ke Phase 2. 

MVP cukup:

Input

```text
Post URL
Views
Engagement
```

Check

```text
Spike Tidak Wajar
Engagement Terlalu Rendah
Duplicate Submission
```

Output

```text
Safe
Review Needed
Rejected
```

---

# MODULE 7 — RATE CARD

Ini domain kedua terbesar.

---

# Rate Card Lifecycle

```text
Draft
↓
Published
↓
Ordered
↓
In Progress
↓
Revision
↓
Completed
```

---

## Create Rate Card

Actor

Creator

Field

```text
Title
Description
Price
Delivery Days
Revision Limit
```

---

## Package Tier

Creator dapat membuat:

```text
Basic

Standard

Premium
```

Contoh:

```text
Basic
1 Video
Rp100.000

Standard
2 Video
1 Story
Rp200.000

Premium
3 Video
2 Story
Rp350.000
```

---

# MODULE 8 — CHAT & CUSTOM OFFER

Sesuai proposal:

```text
Chat
↓
Negosiasi
↓
Custom Offer
↓
Escrow
```



---

## Conversation

Field

```text
Participant
Last Message
```

---

## Message

Type

```text
Text
Image
File
Offer
```

---

## Custom Offer

Field

```text
Title
Description
Price
Deadline
Revision Limit
```

Status

```text
Pending
Accepted
Rejected
Expired
```

---

# MODULE 9 — ORDER MANAGEMENT

## User Story

Sebagai UMKM saya ingin memesan jasa creator dengan aman.

---

Lifecycle

```text
Pending Payment
↓
Escrow
↓
In Progress
↓
Revision
↓
Approved
↓
Completed
```

---

## Direct Order

UMKM langsung membeli package.

---

## Custom Offer Order

UMKM menerima offer hasil negosiasi.

---

# MODULE 10 — ESCROW

Ini salah satu USP proposal. 

---

## Create Escrow

Trigger

```text
Payment Success
```

Status

```text
Held
```

---

## Release Escrow

Trigger

```text
UMKM Approve
```

Output

```text
Wallet Creator Bertambah
```

---

## Refund Escrow

Trigger

```text
Dispute Approved
```

Output

```text
Dana Kembali Ke UMKM
```

---

# MODULE 11 — WALLET

## Wallet Summary

Field

```text
Available Balance
Pending Balance
```

---

## Transaction History

Type

```text
Deposit
Withdrawal
Escrow Hold
Escrow Release
Refund
Admin Fee
```

---

## Withdrawal

Validation

```text
Minimum Rp50.000
```

Sama seperti referensi TryBuzzer yang Anda kumpulkan. 

---

# MODULE 12 — NOTIFICATION

Type

```text
Campaign Claimed
Submission Approved
Submission Rejected

Offer Received
Offer Accepted

Payment Received
Withdrawal Success
```

---

# Setelah PRD Level 2

Urutan berikutnya yang saya rekomendasikan:

```text
PRD Level 1
✅

Domain Breakdown
✅

PRD Level 2
✅

↓

Collection Design Appwrite
↓↓

Document Schema

↓↓

State Machine

↓↓

Event Flow

↓↓

API Contract

↓↓

AI Coding
```

Tahap selanjutnya yang paling krusial untuk Appwrite + AI Coding adalah **Collection Design Appwrite (Database Architecture)**, karena di sana kita akan menentukan collection mana yang benar-benar dibuat, relasi antar document, indexing, permission model Appwrite, dan struktur yang optimal untuk NoSQL. Itu akan menjadi blueprint langsung yang nantinya dibaca AI saat menghasilkan backend.
