# 02 — Route Map Marketiv
> Dokumen ini menetapkan route final Marketiv untuk kebutuhan slicing UI/UX.
> Route map ini menjadi acuan tim Frontend, Backend, QA, dan AI coding assistant saat membuat halaman baru.
---
## 1. Tujuan Dokumen
Route map mencegah tim membuat path yang berbeda-beda untuk fitur yang sama.
Route map menjaga pemisahan role antara Guest, UMKM, Kreator, dan Admin.
Route map memastikan Campaign Mode dan Rate Card Mode tetap terpisah secara navigasi.
Route map membantu UI/UX designer memahami struktur halaman yang akan dislicing.
Route map membantu backend memahami halaman mana yang memerlukan Appwrite data contract.
Route map membantu AI di VS Code agar tidak mengarang path baru.
Route map ini harus dibaca sebelum membuat file baru di `src/app/`.
Route map ini mengikuti Next.js App Router convention.
Route map ini menjadi jembatan dari docs Features ke implementasi folder `src/app`.
Route map ini boleh berubah hanya jika ada keputusan produk yang eksplisit.
---
## 2. Prinsip Routing
1. Public route tidak membutuhkan session.
2. Dashboard route membutuhkan session.
3. UMKM route hanya untuk role UMKM.
4. Kreator route hanya untuk role KREATOR.
5. Admin route hanya untuk role ADMIN.
6. Campaign Mode tidak memiliki route chat.
7. Rate Card Mode memiliki route negosiasi/chat.
8. Route harus memakai Bahasa Indonesia jika user-facing.
9. Route internal boleh memakai slug teknis yang stabil.
10. Route tidak boleh bergantung pada label UI yang sering berubah.
11. Dynamic segment harus jelas: `[id]`, `[campaignId]`, `[orderId]`, atau `[creatorId]`.
12. Route dashboard harus lebih eksplisit daripada route lama `/umkm` dan `/creator`.
13. Route lama boleh dipertahankan sementara sebagai redirect jika diperlukan.
14. Route admin tidak boleh bercampur dengan dashboard role biasa.
15. Route API atau server handlers harus dipisah dari route visual.
---
## 3. Public Routes
### 3.1 Landing Page
```txt
/
```
Fungsi:
- Menjelaskan Marketiv.
- Mengarahkan user ke register/login.
- Menjelaskan Campaign Mode dan Rate Card Mode secara ringkas.
- Menampilkan trust, escrow, dan value proposition.
Komponen utama:
- Public navbar.
- Hero section.
- Problem section.
- Solution section.
- Feature overview.
- CTA section.
- Footer.
Status slicing:
- Bisa dikerjakan setelah dashboard foundation stabil.
---
### 3.2 Auth Routes
```txt
/login
/register
/forgot-password
/reset-password
/verify-email
```
Fungsi:
- Login user.
- Register role UMKM/Kreator.
- Password recovery.
- Email verification.
Rules:
- Guest boleh akses.
- User yang sudah login diarahkan berdasarkan role.
- Admin login boleh memakai route yang sama atau route internal sesuai keputusan security.
---
### 3.3 Informational Routes
```txt
/panduan
/tentang-kami
/kebijakan-privasi
/syarat-ketentuan
```
Fungsi:
- Menjelaskan cara kerja platform.
- Menjelaskan legal dan trust.
- Menjelaskan aturan payment, escrow, dan konten.
Prioritas:
- P1 setelah dashboard MVP.
---
## 4. UMKM Dashboard Routes
### 4.1 Dashboard Home
```txt
/dashboard/umkm
```
Fungsi:
- Ringkasan campaign.
- Ringkasan budget escrow.
- Ringkasan submission pending.
- CTA buat campaign.
Komponen utama:
- DashboardShell.
- MetricCard.
- CampaignPreviewList.
- RecentActivity.
- PaymentStatusCard.
---
### 4.2 Campaign List
```txt
/dashboard/umkm/campaign
```
Fungsi:
- Menampilkan seluruh campaign milik UMKM.
- Filter by status.
- Search by campaign title.
- Sort by terbaru atau status.
Data source:
- `campaigns` filtered by owner.
UI state:
- Loading campaign list.
- Empty campaign list.
- Error loading campaign list.
---
### 4.3 Create Campaign Wizard
```txt
/dashboard/umkm/campaign/buat
```
Fungsi:
- Wizard pembuatan campaign performance-based.
- Mengumpulkan produk, brief, aset, budget, kuota, dan review.
- Payment step hanya trigger backend/payment flow.
Steps:
1. Informasi produk.
2. Brief campaign.
3. Aset mentah.
4. Budget dan kuota.
5. Review.
6. Pembayaran.
Rules:
- Tidak ada chat.
- Tidak ada direct contact kreator.
- Payment success tidak ditentukan oleh frontend.
---
### 4.4 Campaign Detail
```txt
/dashboard/umkm/campaign/[campaignId]
```
Fungsi:
- Detail campaign.
- Status campaign.
- Budget escrow.
- Kuota kreator.
- Submission list.
- Performance overview.
Allowed actions:
- Edit draft campaign jika status Draft.
- Continue payment jika status MenungguPembayaran.
- Cancel campaign sesuai rules.
- View submissions.
Forbidden actions:
- Chat with creator.
- Direct payout.
- Direct validation override jika bukan admin.
---
### 4.5 Creator Directory for Rate Card
```txt
/dashboard/umkm/kreator
/dashboard/umkm/kreator/[creatorId]
```
Fungsi:
- Browse kreator untuk Rate Card Mode.
- Lihat profil kreator.
- Lihat paket rate card.
- Mulai negosiasi/chat.
Rules:
- Route ini adalah Rate Card Mode.
- Chat diperbolehkan setelah order/room dibuat.
- Hanya kreator aktif/verified yang tampil.
---
### 4.6 UMKM Negotiation Routes
```txt
/dashboard/umkm/negosiasi
/dashboard/umkm/negosiasi/[orderId]
```
Fungsi:
- Daftar order Rate Card.
- Chat negosiasi.
- Custom Offer.
- Payment after accepted offer.
Rules:
- Hanya untuk Rate Card Mode.
- Tidak boleh menampilkan campaign claim flow.
- Custom Offer dikirim oleh UMKM.
---
### 4.7 UMKM Finance Routes
```txt
/dashboard/umkm/keuangan
/dashboard/umkm/keuangan/transaksi/[transactionId]
```
Fungsi:
- Riwayat transaksi.
- Status deposit.
- Refund status.
- Escrow status.
Rules:
- Read-only untuk mutasi saldo.
- Payment action harus lewat backend/provider.
- Tidak boleh mengubah transaction status dari frontend.
---
## 5. Kreator Dashboard Routes
### 5.1 Dashboard Home
```txt
/dashboard/kreator
```
Fungsi:
- Ringkasan saldo.
- Ringkasan pekerjaan aktif.
- Submission status.
- Order Rate Card aktif.
- CTA lihat Job Pool.
---
### 5.2 Job Pool
```txt
/dashboard/kreator/job-pool
/dashboard/kreator/job-pool/[campaignId]
```
Fungsi:
- Menampilkan campaign aktif yang bisa diklaim kreator.
- Detail campaign untuk klaim.
- Claim CTA.
Rules:
- Hanya campaign status Aktif.
- Klaim harus melalui backend trusted operation.
- CTA disabled jika kuota penuh.
- Tidak ada chat.
---
### 5.3 Active Campaign Jobs
```txt
/dashboard/kreator/pekerjaan-aktif
/dashboard/kreator/pekerjaan-aktif/[claimId]
```
Fungsi:
- Menampilkan campaign yang sudah diklaim.
- Submit proof URL.
- Melihat validation status.
Rules:
- Bukti tayang berupa URL TikTok/Instagram.
- Tidak boleh upload video final ke Marketiv.
- Submission tidak bisa diedit setelah Valid/Paid.
---
### 5.4 Rate Card Management
```txt
/dashboard/kreator/rate-card
/dashboard/kreator/rate-card/buat
/dashboard/kreator/rate-card/[rateCardId]/edit
```
Fungsi:
- Menampilkan paket jasa kreator.
- Membuat paket baru.
- Edit paket.
- Toggle active status.
Rules:
- Maksimal 3 paket aktif per kreator.
- Harga harus valid.
- Data sensitif seperti saldo tidak tersentuh.
---
### 5.5 Kreator Negotiation Routes
```txt
/dashboard/kreator/negosiasi
/dashboard/kreator/negosiasi/[orderId]
```
Fungsi:
- Daftar order Rate Card.
- Chat negosiasi.
- Terima/tolak Custom Offer.
- Submit Collab Post URL.
Rules:
- Custom Offer diterima/ditolak oleh Kreator.
- Kreator tidak membuat Custom Offer awal jika rule product belum mengizinkan.
- Chat hanya untuk Rate Card Mode.
---
### 5.6 Kreator Finance Routes
```txt
/dashboard/kreator/keuangan
/dashboard/kreator/keuangan/withdrawal
/dashboard/kreator/keuangan/withdrawal/[withdrawalId]
```
Fungsi:
- Saldo tersedia.
- Riwayat payout.
- Request withdrawal.
- Status withdrawal.
Rules:
- Frontend tidak mengubah wallet balance.
- Withdrawal request harus backend trusted operation.
- Rekening bank harus divalidasi.
---
## 6. Admin Routes
### 6.1 Admin Dashboard
```txt
/admin
```
Fungsi:
- GMV.
- User stats.
- Campaign stats.
- Pending validation.
- Active disputes.
---
### 6.2 Admin Validation
```txt
/admin/submissions
/admin/submissions/[submissionId]
```
Fungsi:
- Validasi proof URL.
- Update views actual.
- Approve/reject/fraud.
- Release payout via backend.
Rules:
- Semua action harus audit log.
- Semua action harus confirmation jika berdampak pada dana.
---
### 6.3 Admin Disputes
```txt
/admin/disputes
/admin/disputes/[disputeId]
```
Fungsi:
- Review dispute.
- Lihat evidence.
- Resolve dispute.
- Refund atau payout decision.
Rules:
- Tidak ada perubahan saldo tanpa transaction record.
- Semua keputusan wajib punya alasan.
---
### 6.4 Admin Users
```txt
/admin/users
/admin/users/[userId]
```
Fungsi:
- Lihat user.
- Verify creator/UMKM.
- Suspend user.
- Review profile.
---
### 6.5 Admin Reports
```txt
/admin/reports
```
Fungsi:
- Export GMV report.
- Export user activity.
- Export campaign performance.
- Export transaction report.
Rules:
- Data P2MW harus mudah diunduh.
- Export bisa mock dulu pada fase UI slicing.
---
## 7. Legacy Route Handling
Route lama berikut boleh ada sementara:
```txt
/umkm
/creator
```
Rekomendasi:
- Redirect `/umkm` ke `/dashboard/umkm`.
- Redirect `/creator` ke `/dashboard/kreator`.
- Jangan membangun fitur baru di route lama.
- Jangan membuat komponen baru yang hanya bergantung pada route lama.
---
## 8. AI Coding Assistant Rules
Jangan membuat route baru tanpa mengecek dokumen ini.
Jangan membuat `/campaign/[id]/chat` karena Campaign Mode zero-chat.
Jangan membuat `/dashboard/umkm/job-pool` karena Job Pool adalah milik Kreator.
Jangan membuat `/dashboard/kreator/campaign/buat` karena campaign dibuat oleh UMKM.
Jangan membuat `/admin/keuangan` jika finance admin sudah tercakup dalam `/admin/reports` dan transaction monitoring.
Gunakan dynamic segment yang eksplisit.
Jangan mencampur route publik dengan protected dashboard.
Jika user meminta route baru, cek apakah route tersebut lebih cocok sebagai subpage existing.
Pastikan route yang dibuat punya loading, empty, dan error state jika data-driven.
Pastikan copy page memakai Bahasa Indonesia.
