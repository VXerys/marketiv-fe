
# Tahap 3 — UI Flow & User Journey Mapping (MVP)

Tujuan tahap ini adalah memastikan seluruh fitur MVP memiliki alur yang jelas sebelum mulai membuat API dan coding.

---

# Aktor Sistem

```text
1. UMKM
2. Kreator
3. Admin
```

---

# FLOW 1 — Registrasi

## UMKM

```text
Landing Page
    ↓
Daftar
    ↓
Pilih Role UMKM
    ↓
Lengkapi Profil Bisnis
    ↓
Dashboard UMKM
```

---

## Kreator

```text
Landing Page
    ↓
Daftar
    ↓
Pilih Role Kreator
    ↓
Lengkapi Profil
    ↓
Tambah Akun Sosial
    ↓
Dashboard Kreator
```

---

# FLOW 2 — Campaign PPV

Ini merupakan core feature Marketiv.

## UMKM Membuat Campaign

```text
Dashboard UMKM
    ↓
Buat Campaign
    ↓
Isi Informasi Campaign
    ↓
Generate AI Brief
    ↓
Review Brief
    ↓
Publish Campaign
```

---

## Detail Form Campaign

### Step 1

```text
Judul Campaign
Kategori
Thumbnail
Jenis Campaign
```

---

### Step 2

```text
Budget
CPM

Min Views
Max Views

Platform
```

---

### Step 3

```text
AI Brief Assistant

Upload materi

Generate Brief
```

---

### Step 4

```text
Preview

Publish
```

---

# FLOW 3 — Kreator Mengambil Campaign

```text
Dashboard Kreator
    ↓
Explore Campaign
    ↓
Detail Campaign
    ↓
Claim Campaign
    ↓
Setuju Syarat
    ↓
Campaign Masuk Dashboard
```

---

# FLOW 4 — Submit Video

```text
Campaign Saya
    ↓
Pilih Campaign
    ↓
Submit Video
```

---

## Form Submission

```text
Platform

Video URL

Caption

Views Saat Ini

Upload Analytics
```

---

```text
Submit
   ↓
Status Pending
```

---

# FLOW 5 — AI Fraud Detection

```text
Submission Masuk
      ↓
Appwrite Event
      ↓
AI Fraud Function
      ↓
Fraud Score
      ↓
Status:
    Aman
    Review
    Fraud
```

---

## Jika Aman

```text
Pending
    ↓
Approved
```

---

## Jika Mencurigakan

```text
Pending
    ↓
Need Review Admin
```

---

# FLOW 6 — Approval Campaign

## UMKM

```text
Dashboard
    ↓
Submission List
    ↓
Detail Submission
```

Lihat:

```text
Video
Views
Fraud Score
Analytics
```

---

Keputusan:

```text
Approve
Reject
```

---

## Jika Approve

```text
Reward Dihitung
↓
Saldo Kreator Pending
```

---

# FLOW 7 — Wallet

## Kreator

```text
Dashboard
    ↓
Wallet
```

---

Melihat:

```text
Available Balance

Pending Balance

Riwayat
```

---

# FLOW 8 — Withdraw

```text
Wallet
    ↓
Withdraw
    ↓
Input Nominal
    ↓
Konfirmasi
```

---

```text
Status:
Pending
Success
Rejected
```

---

# FLOW 9 — Marketplace Rate Card

Fitur kedua setelah PPV.

## Kreator

```text
Dashboard
    ↓
Rate Card
    ↓
Tambah Rate Card
```

---

Contoh:

```text
TikTok Review

Rp150.000

3 Hari

2 Revisi
```

---

Publish

```text
Rate Card Aktif
```

---

# FLOW 10 — UMKM Memesan Kreator

```text
Cari Kreator
    ↓
Detail Kreator
    ↓
Lihat Rate Card
```

---

Pilihan:

```text
Pesan Sekarang
```

atau

```text
Chat Dulu
```

---

# FLOW 11 — Negosiasi

```text
Chat
    ↓
Kirim Offer
```

---

Offer:

```text
Judul

Harga

Deadline

Revisi
```

---

Kreator:

```text
Accept
Reject
Counter Offer
```

---

# FLOW 12 — Escrow

Jika offer diterima.

```text
Offer Accepted
      ↓
Create Order
      ↓
Pembayaran UMKM
      ↓
Escrow Hold
```

---

Status:

```text
Waiting Payment

Active

Review

Completed
```

---

# FLOW 13 — Delivery

## Kreator

```text
Order
   ↓
Upload Hasil
```

---

```text
Link Drive

File

Catatan
```

---

Status:

```text
Review
```

---

# FLOW 14 — Release Escrow

## UMKM

```text
Review Hasil
```

---

Jika setuju:

```text
Approve
    ↓
Escrow Released
    ↓
Wallet Kreator
```

---

Jika revisi:

```text
Request Revision
```

---

# FLOW 15 — Admin

Admin hanya memiliki 5 modul MVP.

```text
Dashboard
```

---

### User Management

```text
Suspend User
Verifikasi
```

---

### Campaign Management

```text
Lihat Campaign
```

---

### Submission Review

```text
Fraud Review
```

---

### Withdraw Review

```text
Approve Withdraw
Reject Withdraw
```

---

### Order Dispute

```text
Mediasi UMKM
Mediasi Kreator
```

---

# Struktur Menu MVP

## UMKM

```text
Dashboard
Campaign
Submissions
Creators
Messages
Orders
Wallet
Settings
```

---

## Kreator

```text
Dashboard
Campaign
My Submissions
Rate Cards
Messages
Orders
Wallet
Settings
```

---

## Admin

```text
Dashboard
Users
Campaigns
Submissions
Withdraws
Disputes
```

---

Setelah UI Flow ini, tahap berikutnya adalah **Tahap 4 — API Contract / Service Contract**, yaitu mendefinisikan seluruh endpoint, Appwrite Functions, Events, dan permission model yang akan digunakan saat implementasi. Ini biasanya menjadi blueprint terakhir sebelum Sprint Planning dan coding.
