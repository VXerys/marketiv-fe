
# Marketiv MVP Documentation

## 1. Gambaran Produk

Marketiv adalah platform yang mempertemukan UMKM dengan Content Creator untuk menjalankan kampanye promosi berbasis rate card.

Fokus MVP:

* UMKM membuat campaign
* Creator membuat rate card
* UMKM mengirim offer
* Creator menerima / menolak offer
* Escrow payment
* Submission konten
* Approval
* Pencairan dana
* AI Brief Generator
* AI Fraud Detection

Tidak ada marketplace terbuka seperti Fiverr.

Model bisnis lebih dekat ke:

UMKM → Cari Creator → Kirim Offer → Creator Kerja → Escrow → Selesai

---

# 2. Role System

## UMKM

Pengguna yang ingin mempromosikan produk/jasa.

Hak akses:

* Membuat campaign
* Mencari creator
* Melihat rate card creator
* Mengirim offer
* Membayar campaign
* Approve hasil pekerjaan

---

## Content Creator

Pengguna yang menawarkan jasa promosi.

Hak akses:

* Membuat profil creator
* Membuat rate card
* Menerima offer
* Mengirim submission
* Mencairkan saldo

---

# 3. User Flow Global

## Flow UMKM

Register
↓
Lengkapi Profil
↓
Buat Campaign
↓
AI Generate Brief (Opsional)
↓
Publish Campaign
↓
Cari Creator
↓
Lihat Rate Card
↓
Kirim Offer
↓
Creator Accept
↓
Bayar Escrow
↓
Creator Kerjakan Campaign
↓
Review Submission
↓
Approve
↓
Dana Cair
↓
Campaign Selesai

---

## Flow Creator

Register
↓
Lengkapi Profil
↓
Buat Rate Card
↓
Menerima Offer
↓
Accept Offer
↓
Menunggu Escrow
↓
Kerjakan Campaign
↓
Upload Submission
↓
Menunggu Approval
↓
Dana Masuk Wallet
↓
Withdraw

---

# 4. Authentication Module

## Halaman

### Login

Data:

* Email
* Password

Action:

* Login

---

### Register

Data:

* Nama
* Email
* Password
* Role

Pilihan role:

* UMKM
* Creator

---

### Verifikasi Email

Data:

* Token

Action:

* Verify

---

### Forgot Password

Data:

* Email

Action:

* Kirim Link Reset

---

# 5. UMKM Module

## Dashboard UMKM

Menampilkan:

* Total campaign
* Campaign aktif
* Campaign selesai
* Saldo wallet
* Offer aktif

---

# 6. Profil UMKM

## Halaman Profil

Data:

* Nama usaha
* Nama pemilik
* Logo
* Deskripsi
* Kategori usaha
* Kota
* Website
* Instagram
* TikTok
* WhatsApp

Status:

* Draft
* Complete

---

# 7. Campaign Module

## Daftar Campaign

Data:

* Judul
* Status
* Budget
* Creator terlibat
* Progress

Status:

* Draft
* Published
* Running
* Completed
* Cancelled

---

## Create Campaign

Data:

### Informasi Dasar

* Nama Campaign
* Tujuan Campaign
* Produk/Jasa
* Kategori

### Deliverable

* Instagram Feed
* Instagram Story
* Reels
* TikTok
* YouTube
* Artikel

### Requirement

* Minimum follower
* Minimum engagement
* Lokasi creator

### Budget

* Total budget

---

# 8. AI Brief Generator

## Halaman Generate Brief

Input:

* Nama produk
* Deskripsi produk
* Target market
* Tujuan campaign

Output:

* Campaign objective
* Content angle
* CTA
* Brief detail
* Do & Don't

UMKM dapat:

* Edit hasil AI
* Simpan sebagai brief campaign

---

# 9. Creator Discovery

## Cari Creator

Filter:

* Platform
* Kategori
* Lokasi
* Followers
* Engagement Rate

---

## Detail Creator

Menampilkan:

### Profil

* Nama
* Foto
* Bio

### Statistik

* Followers
* Engagement
* Campaign selesai

### Rate Card

* Daftar layanan

---

# 10. Creator Profile Module

## Profil Creator

Data:

* Nama
* Username
* Foto
* Bio
* Lokasi

---

## Social Media

Data:

* Instagram
* TikTok
* YouTube

---

## Statistik

Data:

* Followers
* Average Views
* Engagement Rate

---

# 11. Rate Card Module

## Daftar Rate Card

Contoh:

* Instagram Story
* Instagram Feed
* Instagram Reels
* TikTok Video
* YouTube Short

---

## Create Rate Card

Data:

* Nama layanan
* Platform
* Deskripsi
* Harga
* Estimasi pengerjaan
* Revisi
* Status

Status:

* Active
* Inactive

---

# 12. Offer Module

Ini adalah inti MVP.

## Flow

UMKM
↓
Pilih Creator
↓
Pilih Rate Card
↓
Kirim Offer
↓
Creator Accept / Reject

---

## Create Offer

Data:

* Campaign
* Creator
* Rate Card
* Harga
* Pesan

Status:

* Pending
* Accepted
* Rejected
* Expired

---

## Detail Offer

Menampilkan:

* Campaign
* Creator
* Harga
* Status
* Timeline

---

# 13. Order Module

Order tercipta ketika creator menerima offer.

Flow:

Offer Accepted
↓
Create Order

---

Data Order

* Order Number
* Campaign
* UMKM
* Creator
* Harga
* Deadline

Status:

* Waiting Payment
* Paid
* In Progress
* Submitted
* Revision
* Approved
* Completed

---

# 14. Escrow Payment

Flow:

Order
↓
UMKM Bayar
↓
Dana Ditahan Escrow
↓
Creator Submit
↓
UMKM Approve
↓
Dana Cair

---

## Payment Page

Data:

* Invoice Number
* Amount
* Payment Method

Status:

* Pending
* Paid
* Failed

---

# 15. Submission Module

## Create Submission

Data:

* URL Konten
* Catatan Creator

---

## AI Fraud Detection

Dijalankan saat submission dibuat.

Validasi:

* URL valid
* Konten tersedia
* Tidak private
* Tidak duplicate
* Sesuai platform

Output:

* Fraud Score
* Risk Level

Level:

* Safe
* Medium
* High

---

# 16. Approval Module

## Review Submission

UMKM dapat:

* Approve
* Request Revision

---

## Revision

Data:

* Catatan revisi

Status:

* Revision Requested

---

## Approve

Status:

* Approved

Trigger:

Escrow Release

---

# 17. Wallet Module

## Wallet Creator

Data:

* Available Balance
* Pending Balance
* Total Earned

---

## Riwayat Wallet

Data:

* Tanggal
* Tipe
* Nominal
* Status

---

# 18. Withdraw Module

## Request Withdraw

Data:

* Nominal
* Bank
* Nomor Rekening

Status:

* Pending
* Processed
* Rejected

---

# 19. Notification Module

Trigger:

* Register
* Offer masuk
* Offer diterima
* Pembayaran berhasil
* Submission masuk
* Revision request
* Approval
* Withdraw

Channel:

* In App
* Email

---

# 20. Dashboard Creator

Menampilkan:

* Total earning
* Pending earning
* Active order
* Completed order
* Offer masuk

---

# 21. Dashboard UMKM

Menampilkan:

* Total campaign
* Campaign berjalan
* Creator aktif
* Pending approval
* Total spending

---

# 22. MVP Navigation Structure

## Public

* Home
* Explore Creator
* Login
* Register

---

## UMKM

* Dashboard
* Campaign
* Create Campaign
* Creator Discovery
* Offers
* Orders
* Payments
* Wallet
* Notifications
* Settings

---

## Creator

* Dashboard
* Profile
* Rate Cards
* Offers
* Orders
* Submissions
* Wallet
* Withdraw
* Notifications
* Settings

---

# 23. MVP Scope Final

Included MVP:

✅ Authentication

✅ UMKM Profile

✅ Creator Profile

✅ Rate Card

✅ Campaign

✅ AI Brief

✅ Offer System

✅ Order System

✅ Escrow

✅ Submission

✅ AI Fraud Detection

✅ Approval Workflow

✅ Wallet

✅ Withdraw

✅ Notification

---

Excluded From MVP

❌ Chat Real-time

❌ Affiliate System

❌ Referral

❌ Creator Agency

❌ Team Management

❌ Subscription

❌ AI Matching

❌ Marketplace Bidding

❌ Public Campaign Board

❌ Analytics Advanced

❌ Mobile App
