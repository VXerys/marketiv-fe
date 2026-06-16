# 5. DESIGN SYSTEM & COMPONENT INVENTORY FINAL — MARKETIV MVP

Tujuan Design System Marketiv:

```text
1. Konsisten di seluruh halaman
2. Mempercepat development
3. Mengurangi duplicate component
4. Mempermudah scaling setelah MVP
```

Karena target Marketiv adalah:

```text
UMKM (non-tech)
Creator Gen-Z
Admin Internal
```

maka UI harus:

```text
Simple
Mobile-first
Tidak terlalu banyak warna
Fokus pada CTA
```

---

# DESIGN PRINCIPLES

## Principle #1

### Simplicity First

UMKM harus bisa memahami dashboard dalam < 5 menit.

Hindari:

```text
Terlalu banyak menu
Terlalu banyak grafik
Terlalu banyak tombol
```

---

## Principle #2

### Action Driven

Setiap halaman harus memiliki CTA utama.

Contoh:

```text
Campaign Page
↓
Buat Campaign

Creator Page
↓
Kirim Offer

Order Page
↓
Review Draft
```

---

## Principle #3

### Mobile First

Karena Creator mayoritas mobile user.

Prioritas:

```text
Mobile
Tablet
Desktop
```

---

# COLOR SYSTEM

## Primary

```css
Primary-50    #EEF7FF
Primary-100   #D9ECFF
Primary-500   #2563EB
Primary-600   #1D4ED8
Primary-700   #1E40AF
```

Digunakan untuk:

```text
Button Primary
Link
Active State
```

---

## Success

```css
#16A34A
```

Digunakan:

```text
Payment Success
Approved
Completed
```

---

## Warning

```css
#F59E0B
```

Digunakan:

```text
Pending
Waiting Review
Escrow
```

---

## Danger

```css
#DC2626
```

Digunakan:

```text
Rejected
Fraud
Cancelled
```

---

## Neutral

```css
Gray-50   #F9FAFB
Gray-100  #F3F4F6
Gray-200  #E5E7EB
Gray-500  #6B7280
Gray-700  #374151
Gray-900  #111827
```

---

# TYPOGRAPHY

Gunakan:

```text
Inter
```

atau

```text
Plus Jakarta Sans
```

---

## Heading

```css
H1 36px
H2 30px
H3 24px
H4 20px
```

---

## Body

```css
Large 18px
Base 16px
Small 14px
Caption 12px
```

---

# SPACING SYSTEM

Gunakan skala 4.

```css
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

---

# BORDER RADIUS

```css
sm 8px
md 12px
lg 16px
xl 24px
```

---

# SHADOW

## Card

```css
0 1px 3px rgba(0,0,0,.08)
```

---

## Modal

```css
0 10px 25px rgba(0,0,0,.12)
```

---

# BUTTON SYSTEM

## Primary Button

```text
Buat Campaign
Kirim Offer
Top Up
```

```css
bg-primary-500
text-white
```

---

## Secondary Button

```text
Edit
Lihat Detail
```

```css
border
bg-white
```

---

## Danger Button

```text
Delete
Cancel Order
Reject
```

```css
bg-red-600
```

---

# INPUT SYSTEM

## Text Input

```text
Nama UMKM
Nama Campaign
Judul Rate Card
```

---

## Currency Input

```text
Budget
Rate Card
Escrow
Withdraw
```

---

## Select Input

```text
Kategori
Platform
Lokasi
```

---

## Multi Select

```text
Niche Creator

TikTok
Instagram
YouTube
```

---

## File Upload

```text
Logo UMKM
Video Raw
Thumbnail
Draft
```

---

# BADGE SYSTEM

## Campaign Status

```text
Draft
Published
Active
Paused
Completed
```

---

## Order Status

```text
Waiting Payment
In Progress
Revision
Completed
Cancelled
```

---

## Submission Status

```text
Pending
Approved
Rejected
Fraud
```

---

# CARD SYSTEM

## CreatorCard

Digunakan:

```text
Creator Discovery
Creator Search
Campaign Applicant
```

Isi:

```text
Avatar
Nama
Username

Followers
Engagement

Category

Starting Price

Button View Profile
```

---

## CampaignCard

Isi:

```text
Thumbnail

Title
Budget
Platform

Submission Count

Button Detail
```

---

## OrderCard

Isi:

```text
Order Number

Creator

Status

Escrow

Deadline
```

---

## SubmissionCard

Isi:

```text
Creator

Campaign

Views

Status
```

---

# TABLE SYSTEM

## OrderTable

```text
Order ID
Creator
Budget
Status
Created At
Action
```

---

## SubmissionTable

```text
Creator
Campaign
Views
Status
Action
```

---

## WalletTable

```text
Date
Type
Amount
Status
```

---

# DASHBOARD LAYOUT SYSTEM

## UMKM Layout

```text
Sidebar

Dashboard
Creator
Campaign
Order
Wallet

Bottom Mobile Navigation
```

---

## Creator Layout

```text
Sidebar

Dashboard
Rate Card
Campaign
Submission
Wallet
```

---

## Admin Layout

```text
Sidebar

Users
Campaigns
Orders
Fraud

Reports
Withdraws
```

---

# NAVIGATION SYSTEM

## Desktop

```text
Sidebar Fixed
```

```text
Logo

Menu

User Menu
```

---

## Mobile

```text
Bottom Navigation
```

UMKM:

```text
Home
Creator
Campaign
Wallet
Profile
```

Creator:

```text
Home
Rate Card
Campaign
Wallet
Profile
```

---

# AI COMPONENTS

Sesuai MVP final, AI hanya ada 3.

## AiLandingAssistant

Landing page.

Fungsi:

```text
Menjawab FAQ
Mengarahkan user
```

---

## AiBriefGenerator

Campaign Create.

Input:

```text
Nama Produk
Deskripsi
Target
```

Output:

```text
Campaign Brief
Hook
CTA
Hashtag
```

---

## FraudScoreBadge

Submission Review.

Output:

```text
Low Risk
Medium Risk
High Risk
```

---

# DESIGN TOKEN STRUCTURE

```text
src/

design-system/

├── colors.js
├── typography.js
├── spacing.js
├── shadows.js
├── radius.js

components/

├── ui
│
├── Button
├── Input
├── Select
├── Modal
├── Badge
├── Table
├── Card
│
├── creator
├── campaign
├── order
├── wallet
├── ai
```

---


