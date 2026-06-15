
# Product Requirement Document (PRD) Level 1

# Marketiv MVP

Version: 1.0

Status: Draft

---

# 1. Product Overview

## Product Name

Marketiv

## Product Type

Hybrid Influencer Marketing Marketplace

## Product Vision

Menjadi platform pemasaran digital yang membantu UMKM memperoleh promosi yang lebih terjangkau, transparan, dan berbasis performa melalui kolaborasi dengan kreator lokal.

## Product Mission

Menyediakan dua model kolaborasi utama:

1. Campaign (Performance Based)
2. Rate Card (Influencer Booking)

dengan dukungan AI untuk membantu UMKM menjalankan pemasaran digital tanpa memerlukan kemampuan teknis yang tinggi.

---

# 2. Problem Statement

## Masalah UMKM

* Sulit menemukan kreator lokal yang sesuai.
* Risiko tinggi membayar influencer tanpa hasil yang jelas.
* Tidak memahami cara membuat brief campaign yang baik.
* Kesulitan mengelola kolaborasi dengan kreator.

## Masalah Kreator

* Sulit mendapatkan pekerjaan berbayar.
* Sulit membangun portofolio.
* Tidak memiliki sistem pembayaran yang aman.
* Sulit menjangkau UMKM lokal.

---

# 3. Target User

## UMKM

Karakteristik:

* Kuliner
* Fashion
* Pariwisata
* Jasa

Tujuan:

* Mendapatkan promosi
* Meningkatkan awareness
* Menjalankan campaign dengan budget terjangkau

---

## Creator

Karakteristik:

* Nano Influencer
* Micro Influencer
* Video Editor
* UGC Creator

Tujuan:

* Mendapatkan pekerjaan
* Membangun portofolio
* Mendapatkan penghasilan

---

# 4. Product Pillars

## Campaign

Model promosi berbasis performa.

UMKM membuat campaign dan creator dapat langsung mengambil campaign tersebut.

Pembayaran berdasarkan performa yang diperoleh.

---

## Rate Card

Model kolaborasi langsung antara UMKM dan creator.

UMKM dapat memilih creator tertentu berdasarkan rate card yang tersedia.

Memiliki fitur negosiasi dan escrow.

---

## Artificial Intelligence

Fitur AI yang membantu operasional pengguna.

MVP hanya berfokus pada:

* AI Landing Assistant
* AI Smart Brief Assistant
* AI Fraud Detection

---

# 5. User Roles

## UMKM

Hak akses:

* Membuat campaign
* Mengelola campaign
* Melihat creator
* Membeli rate card
* Membuat custom offer
* Mengelola pembayaran
* Mengajukan revisi

---

## Creator

Hak akses:

* Mengelola profil
* Mengelola rate card
* Claim campaign
* Submit pekerjaan
* Mengirim deliverable
* Melakukan withdrawal

---

## Admin

Hak akses:

* Moderasi pengguna
* Moderasi campaign
* Moderasi transaksi
* Menangani dispute
* Monitoring fraud

---

# 6. Success Metrics

## Campaign

* Jumlah campaign dibuat
* Jumlah campaign berhasil
* Jumlah creator aktif

---

## Rate Card

* Jumlah order
* Nilai transaksi
* Tingkat penyelesaian order

---

## AI

* Jumlah AI Brief digunakan
* Jumlah Fraud Check dilakukan
* Tingkat penggunaan AI Landing Assistant

---

# 7. MVP Scope

## Included

### Authentication

* Register
* Login
* Logout
* Forgot Password

---

### Profile

* UMKM Profile
* Creator Profile

---

### Campaign

* Create Campaign
* Publish Campaign
* Claim Campaign
* Submit Campaign
* Fraud Check
* Campaign Completion

---

### Rate Card

* Rate Card Package
* Order Package
* Chat
* Custom Offer
* Escrow
* Revision
* Approval

---

### Wallet

* Balance
* Transaction History
* Withdrawal

---

### AI

* Landing Assistant
* Smart Brief Assistant
* Fraud Detection

---

### Notification

* In App Notification

---

## Excluded

* Mobile App
* Team Collaboration
* Multi UMKM Management
* Creator Recommendation AI
* Influencer Matching AI
* Computer Vision Verification
* Affiliate Program
* Subscription Plan
* Reputation System
* Advanced Analytics

---

# 8. High Level User Flow

## Campaign Flow

UMKM
↓
Create Campaign
↓
AI Brief
↓
Upload Asset
↓
Publish Campaign
↓
Creator Claim
↓
Creator Submit
↓
Fraud Check
↓
Approve
↓
Payment

---

## Rate Card Flow

UMKM
↓
Browse Creator
↓
View Rate Card

├─ Direct Order
│
└─ Custom Offer
↓
Chat
↓
Offer Agreement
↓
Escrow
↓
Production
↓
Revision
↓
Approval
↓
Release Payment

---

# 9. Monetization

Model:

Fixed Tier Admin Fee

Tier 1
Rp10.000 - Rp50.000
Fee Rp1.000

Tier 2
Rp50.001 - Rp150.000
Fee Rp5.000

Tier 3
Rp150.001 - Rp300.000
Fee Rp10.000

Tier 4
Rp300.001 - Rp500.000
Fee Rp15.000

Tier 5

> Rp500.000
> Fee Rp20.000

Fee dikenakan pada transaksi yang berhasil diproses melalui platform.

---

# 10. Technical Assumptions

Frontend

* Next.js

Backend

* Appwrite
* Appwrite Functions (Node.js)

Database

* Appwrite Database (NoSQL)

Storage

* Appwrite Storage

Authentication

* Appwrite Auth

Realtime

* Appwrite Realtime

AI

* OpenAI API

Payment Gateway

* Midtrans (tentatif)

---

# 11. Future Roadmap

Phase 2

* Creator Verification
* Reputation System
* Review & Rating

Phase 3

* AI Creator Recommendation
* AI Influencer Matching

Phase 4

* Computer Vision Verification
* Advanced Fraud Detection

Phase 5

* Team Collaboration
* Multi Business Management
