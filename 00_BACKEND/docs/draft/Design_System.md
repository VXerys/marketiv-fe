
# 6. Design System & Component Inventory

Tujuan tahap ini adalah memastikan seluruh tim menggunakan komponen yang konsisten sehingga saat development tidak terjadi duplikasi UI.

---

# Design Principles

Marketiv memiliki 3 karakter utama:

### 1. Simple

Target utama adalah UMKM.

Mereka tidak boleh merasa sedang menggunakan software yang rumit.

Hindari:

* terlalu banyak menu
* terlalu banyak statistik
* terlalu banyak istilah teknis

---

### 2. Trust First

Karena ada:

* uang
* escrow
* transaksi

UI harus selalu menunjukkan:

* status
* progress
* saldo
* bukti transaksi

secara jelas.

---

### 3. Mobile First

Mayoritas Creator menggunakan HP.

MVP harus didesain:

```text
Mobile
↓
Tablet
↓
Desktop
```

bukan sebaliknya.

---

# Design Token

## Color

### Primary

```css
#7C3AED
```

Purpose:

* CTA
* Primary Button
* Active State

---

### Success

```css
#22C55E
```

Purpose:

* Wallet
* Success
* Completed

---

### Warning

```css
#F59E0B
```

Purpose:

* Pending
* Review

---

### Danger

```css
#EF4444
```

Purpose:

* Rejected
* Fraud
* Failed

---

### Neutral

```css
#0F172A
#334155
#64748B
#CBD5E1
#F8FAFC
```

---

# Typography

### Heading

```text
Inter
Font Weight 700
```

---

### Body

```text
Inter
Font Weight 400–500
```

---

# Border Radius

```css
12px
```

Standard seluruh card.

---

# Shadow

```css
shadow-sm
shadow-md
```

Hindari shadow berlebihan.

---

# Layout System

## Container

```text
Max Width
1280px
```

---

## Dashboard

```text
Sidebar
+
Main Content
```

Desktop

---

```text
Bottom Navigation
+
Content
```

Mobile

---

# Component Inventory

---

# A. Core Components

Digunakan hampir di seluruh aplikasi.

---

### Button

Variants

```text
Primary
Secondary
Outline
Ghost
Danger
```

---

### Input

Variants

```text
Text
Email
Number
Password
Currency
```

---

### Textarea

Untuk:

* Brief
* Description
* Notes

---

### Select

Untuk:

* Category
* Niche
* Location

---

### Badge

Status:

```text
Draft
Published
Pending
Approved
Rejected
Fraud
Completed
```

---

### Avatar

Digunakan:

* Creator
* UMKM
* Admin

---

### Modal

Digunakan:

* Offer
* Deposit
* Withdraw
* Dispute

---

### Drawer

Mobile version modal.

---

### Tabs

Digunakan:

* Dashboard
* Analytics
* Wallet

---

# B. Marketplace Components

---

### Creator Card

Menampilkan:

```text
Avatar
Name
Location
Category
Followers
Starting Rate
Rating
```

Dipakai:

* Search Creator
* Featured Creator

---

### Creator Header

Menampilkan:

```text
Cover
Avatar
Bio
Stats
Rate Card Preview
```

---

### Rate Card Item

Menampilkan:

```text
Platform
Service
Price
Delivery Time
```

---

### Portfolio Grid

Menampilkan:

```text
Thumbnail
Views
Platform
```

---

# C. Campaign Components

---

### Campaign Card

Menampilkan:

```text
Thumbnail
Title
Reward
Budget
Status
```

---

### Campaign Detail

Menampilkan:

```text
Brief
Assets
Requirements
Reward Rules
```

---

### Campaign Progress

Menampilkan:

```text
Published
Claimed
Submission
Completed
```

---

### Submission Card

Menampilkan:

```text
Creator
Video
Views
Status
```

---

# D. Order Components

---

### Offer Card

Menampilkan:

```text
Price
Scope
Deadline
Status
```

---

### Order Timeline

Menampilkan:

```text
Offer Accepted
In Progress
Review
Completed
```

---

### Revision Card

Menampilkan:

```text
Revision Number
Message
Attachment
```

---

# E. Wallet Components

---

### Balance Card

Menampilkan:

```text
Available Balance
Pending Balance
Escrow Balance
```

---

### Transaction Table

Menampilkan:

```text
Date
Type
Amount
Status
```

---

### Withdraw Form

Menampilkan:

```text
Bank
Account Number
Amount
```

---

# F. Analytics Components

---

### Stat Card

Menampilkan:

```text
Views
Orders
Revenue
Campaigns
```

---

### Line Chart

Untuk:

```text
Views Trend
Revenue Trend
```

---

### Pie Chart

Untuk:

```text
Campaign Distribution
Platform Distribution
```

---

# G. Notification Components

---

### Notification Item

Menampilkan:

```text
Title
Description
Time
```

---

### Notification Dropdown

Kategori:

```text
Order
Campaign
Wallet
System
```

---

# H. Admin Components

---

### User Table

Menampilkan:

```text
Name
Role
Status
Joined Date
```

---

### Fraud Review Card

Menampilkan:

```text
Submission
Fraud Score
Evidence
Action
```

---

### Dispute Panel

Menampilkan:

```text
UMKM
Creator
Order
Evidence
Resolution
```

---

# Component Priority

## MVP Wajib Dibuat Dulu

```text
Button
Input
Modal
Tabs
Badge

Creator Card
Rate Card Item

Campaign Card
Campaign Detail

Offer Card
Order Timeline

Balance Card
Transaction Table

Stat Card
Notification Item
```

Total sekitar:

```text
15–20 komponen utama
```

yang sudah cukup untuk membangun ±80% fitur MVP Marketiv.

---

**Roadmap tersisa:**

* ✅ 5. Sprint Breakdown & Development Roadmap
* ✅ 6. Design System & Component Inventory
* ⬜ 7. Implementation Plan (Coding Architecture)

Tahap berikutnya adalah yang paling teknis: **Implementation Plan (Coding Architecture)** yang akan mendefinisikan struktur folder React, Appwrite Services, State Management, Repository Pattern, dan Appwrite Functions agar tim bisa langsung mulai coding tanpa perubahan arsitektur besar di tengah jalan.
