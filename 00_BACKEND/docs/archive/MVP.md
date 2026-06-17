# Marketiv - Draft Rancangan Sistem (Versi Awal)

> Status: Draft Konseptual
>
> Tujuan dokumen ini adalah mendefinisikan ruang lingkup sistem Marketiv sebelum masuk ke tahap Context Diagram, Domain Model, ERD Konseptual, dan Database Schema.

---

# 1. Gambaran Umum

Marketiv merupakan platform yang mempertemukan UMKM/Brand dengan Content Creator melalui dua layanan utama:

1. Campaign (Performance Campaign / Pay Per View)
2. Rate Card (Influencer Booking)

Selain marketplace creator, Marketiv memiliki fitur Artificial Intelligence (AI) sebagai Unique Selling Proposition (USP) utama.

---

# 2. Pilar Utama Produk

## 2.1 Campaign

Campaign digunakan untuk mendistribusikan konten promosi melalui creator dengan sistem pembayaran berbasis performa.

### Alur Campaign

```text
Brand Membuat Campaign
↓
Upload Asset
↓
Membuat Brief
↓
Menentukan Budget
↓
Campaign Dipublikasikan
↓
Creator Claim Campaign
↓
Creator Membuat Konten
↓
Creator Submit Hasil
↓
Validasi Performa
↓
Pembayaran Creator
```

### Karakteristik Campaign

* Tidak ada negosiasi.
* Sistem First Come First Serve.
* Creator dapat langsung claim campaign.
* Pembayaran berdasarkan performa campaign.
* Campaign dapat diklaim banyak creator sesuai batas yang ditentukan.

---

## 2.2 Rate Card

Rate Card digunakan ketika Brand ingin bekerja sama dengan creator tertentu.

### Alur Rate Card

```text
Brand Mencari Creator
↓
Melihat Profil Creator
↓
Melihat Rate Card
↓
Chat / Negosiasi
↓
Custom Offer
↓
Pembayaran Escrow
↓
Produksi Konten
↓
Revisi
↓
Approval
↓
Publikasi
↓
Dana Dicairkan
```

### Karakteristik Rate Card

* Creator memiliki paket layanan.
* Harga dapat dinegosiasikan.
* Memiliki fitur chat.
* Menggunakan escrow.
* Memiliki proses revisi.
* Cocok untuk kebutuhan branding dan influencer collaboration.

---

# 3. Artificial Intelligence (USP)

Pada tahap MVP, AI hanya difokuskan pada tiga area utama.

## 3.1 AI Landing Page Assistant

Tujuan:

* Membantu calon pengguna memahami layanan Marketiv.
* Memberikan rekomendasi layanan yang sesuai.

Contoh:

```text
User:
Saya memiliki usaha kuliner.

AI:
Kami merekomendasikan Campaign karena cocok untuk meningkatkan awareness dan menjangkau audiens lokal.
```

---

## 3.2 AI Smart Brief Assistant

Tujuan:

* Membantu UMKM membuat brief campaign.

Input:

```text
Nama Produk
Kategori
Target Audience
Lokasi
Tujuan Campaign
```

Output:

```text
Campaign Title
Campaign Description
Target Audience
Content Direction
Call To Action
Hashtag Recommendation
Editing Recommendation
```

---

## 3.3 AI Fraud Detection

Tujuan:

* Membantu mendeteksi performa campaign yang tidak wajar.

Tahap MVP:

* Deteksi lonjakan views tidak normal.
* Fraud scoring.
* Penandaan campaign berisiko.

Tahap lanjutan:

* Computer Vision.
* Content Verification.
* Product Detection.

---

# 4. Domain Sistem

## 4.1 Identity Domain

Mengelola autentikasi dan otorisasi pengguna.

### Entitas Awal

* User
* Role
* Permission

---

## 4.2 Creator Domain

Mengelola data creator.

### Entitas Awal

* Creator Profile
* Social Account
* Portfolio
* Rate Card Package

---

## 4.3 Brand Domain

Mengelola data UMKM dan Brand.

### Entitas Awal

* Brand Profile
* Brand Member (opsional)

---

## 4.4 Campaign Domain

Mengelola seluruh aktivitas campaign.

### Entitas Awal

* Campaign
* Campaign Brief
* Campaign Asset
* Campaign Claim
* Campaign Submission

---

## 4.5 Collaboration Domain

Digunakan pada fitur Rate Card.

### Entitas Awal

* Conversation
* Message
* Offer
* Order
* Revision
* Deliverable

---

## 4.6 Financial Domain

Mengelola transaksi dan escrow.

### Entitas Awal

* Wallet
* Wallet Transaction
* Escrow
* Escrow Transaction
* Withdrawal

---

## 4.7 Notification Domain

Mengelola seluruh notifikasi sistem.

### Entitas Awal

* Notification

---

## 4.8 AI Domain

Mengelola seluruh aktivitas AI.

### Entitas Awal

* AI Conversation
* AI Message
* AI Brief Generation
* Fraud Check
* Fraud Result

---

# 5. Arsitektur Tingkat Tinggi

```text
Marketiv
│
├── Identity
│
├── Creator
│
├── Brand
│
├── Campaign
│
├── Collaboration
│
├── Financial
│
├── Notification
│
└── AI
```

---

# 6. Prioritas Pengembangan

## Fase 1

* Authentication
* User Management
* Brand Profile
* Creator Profile

## Fase 2

* Campaign
* Brief
* Asset

## Fase 3

* Claim
* Submission

## Fase 4

* Wallet
* Escrow
* Withdrawal

## Fase 5

* Rate Card
* Conversation
* Offer
* Order
* Revision

## Fase 6

* AI Landing Assistant
* AI Brief Assistant
* AI Fraud Detection

---

# 7. Catatan Revisi

Bagian berikut masih perlu divalidasi pada tahap berikutnya:

* Context Diagram
* User Flow Brand
* User Flow Creator
* Domain Model
* ERD Konseptual
* ERD Fisik
* Database Schema
* Integrasi AI
* Integrasi Payment Gateway
* Integrasi Media Sosial
* Sistem Escrow Detail
* Sistem Fraud Detection Detail
* Sistem Permission Detail
* Multi Role User
* Multi Brand Management
* Team Collaboration
* Admin Panel
* Moderation System
* Creator Verification
* Reputation System

