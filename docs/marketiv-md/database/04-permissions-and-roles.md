# 04 — Permissions and Roles
> Dokumen ini menjelaskan strategi permission Appwrite untuk Marketiv.
> Fokusnya adalah role, label, team, document permission, row security, dan backend-only operation.
---
## 1. Prinsip Permission
Marketiv memakai permission dengan prinsip least privilege.
User hanya boleh membaca data yang relevan untuk dirinya.
User hanya boleh menulis data yang memang aman diubah dari client.
Operasi sensitif tidak boleh dilakukan langsung dari frontend.
Appwrite Functions bertindak sebagai trusted backend untuk mutation kritis.
Admin memiliki akses luas, tetapi setiap override wajib dicatat di `audit_logs`.
---
## 2. Role Domain Marketiv
| Role | Deskripsi | Akses Utama |
|---|---|---|
| `UMKM` | Pemilik bisnis yang membuat campaign/order | Campaign, creator directory, payment |
| `KREATOR` | Kreator yang mengambil job dan menawarkan jasa | Job Pool, claim, submission, rate card |
| `ADMIN` | Operator internal Marketiv | Review, dispute, report, override |
Role domain disimpan di `profiles.role`.
Role dapat didukung dengan Appwrite Labels atau Teams.
Jangan hanya mengandalkan role di frontend.
Backend/Function harus selalu mengecek role dari sumber terpercaya.
---
## 3. Appwrite Labels Recommendation
Gunakan labels untuk segmentasi role sederhana.
```txt
role_umkm
role_kreator
role_admin
verified_creator
verified_umkm
suspended_user
```
Penggunaan labels:
1. Mempermudah permission berbasis kategori user.
2. Membantu filtering akses umum.
3. Membantu admin panel.
4. Membantu future automation.
Catatan:
1. Label tidak menggantikan validasi backend.
2. Label role harus sinkron dengan `profiles.role`.
3. Perubahan label sensitif hanya boleh dilakukan backend/admin.
---
## 4. Appwrite Teams Recommendation
Gunakan Teams untuk admin dan internal operator.
```txt
Team ID: marketiv_admin
Roles:
- owner
- finance
- reviewer
- support
```
Mapping:
| Team Role | Tanggung Jawab |
|---|---|
| `owner` | Full admin operation |
| `finance` | Transaction, withdrawal, payment review |
| `reviewer` | Submission validation, fraud review |
| `support` | Dispute initial triage, user support |
Catatan:
1. Team admin tidak sama dengan user role `ADMIN` saja.
2. Operasi finance sebaiknya hanya bisa oleh `owner` atau `finance`.
3. Operasi validation sebaiknya bisa oleh `owner` atau `reviewer`.
4. Operasi support tidak boleh mengubah saldo.
---
## 5. Permission Level Strategy
Gunakan kombinasi collection-level dan document-level permission.
Untuk collection publik terbatas, read bisa dibuka ke role tertentu.
Untuk data private, gunakan document permission.
Untuk operasi sensitif, matikan direct client write dan pakai Function.
Permission types:
1. Read.
2. Create.
3. Update.
4. Delete.
General policy:
1. Create sensitif lewat Function.
2. Update sensitif lewat Function.
3. Delete hampir selalu dilarang untuk user biasa.
4. Soft delete lebih disarankan daripada hard delete.
---
## 6. `profiles` Permission
### Read
User boleh membaca profile miliknya.
UMKM boleh membaca subset public profile kreator verified.
Kreator boleh membaca subset public profile UMKM yang relevan dengan campaign/order.
Admin boleh membaca semua profile.
### Create
Profile dibuat oleh backend setelah Auth signup.
Frontend tidak boleh membuat profile mentah tanpa validasi.
### Update
User boleh update field aman miliknya:
1. `nama_lengkap`.
2. `nomor_whatsapp`.
3. `foto_profil_url`.
4. `bio`.
5. `niche`.
6. Onboarding preferences jika ada.
User tidak boleh update:
1. `role`.
2. `dompet_saldo`.
3. `is_verified`.
4. `verification_status`.
5. `email` jika tidak sinkron Auth.
### Delete
User tidak boleh delete profile langsung.
Account deletion harus lewat flow khusus backend.
---
## 7. `campaigns` Permission
### Read
UMKM owner boleh read campaign miliknya.
Kreator boleh read campaign dengan `status = Aktif`.
Admin boleh read semua campaign.
### Create
UMKM membuat campaign via Function atau backend endpoint.
Frontend boleh mengirim draft payload tetapi backend yang membuat document final.
### Update
UMKM boleh update draft campaign miliknya sebelum payment.
UMKM tidak boleh update campaign setelah status `Aktif` kecuali field non-sensitif yang diizinkan.
Backend/admin yang mengubah status, payment status, budget, dan kuota.
### Delete
Hard delete tidak disarankan.
Gunakan status `Dibatalkan`.
---
## 8. `campaign_claims` Permission
### Read
Kreator boleh read claim miliknya.
UMKM boleh read claim dari campaign miliknya.
Admin boleh read semua.
### Create
Hanya Function `claim-campaign` yang boleh create.
Frontend tidak boleh create langsung.
### Update
Kreator boleh request cancel via Function jika belum submit.
Backend/admin yang mengubah status final.
### Delete
Tidak boleh hard delete.
Gunakan status `Dibatalkan`.
---
## 9. `campaign_submissions` Permission
### Read
Kreator boleh read submission miliknya.
UMKM boleh read submission dari campaign miliknya.
Admin/reviewer boleh read semua.
### Create
Create melalui Function `submit-campaign-proof`.
Function memastikan claim valid.
### Update
Kreator boleh update URL hanya jika status masih `Pending` dan belum divalidasi.
Admin/reviewer mengubah `status_validasi`, `jumlah_views_aktual`, `fraud_score`, dan `dana_dicairkan` via backend.
### Delete
Tidak boleh hard delete.
Gunakan `Rejected` atau audit trail.
---
## 10. `creator_rate_cards` Permission
### Read
UMKM boleh read rate card aktif dari kreator verified.
Kreator boleh read semua rate card miliknya.
Admin boleh read semua.
### Create
Kreator boleh create via Function/backend agar limit 3 aktif bisa divalidasi.
### Update
Kreator boleh update paket miliknya.
Jika paket sedang dipakai order aktif, perubahan tidak boleh memengaruhi order existing.
### Delete
Soft delete dengan `is_active = false` lebih disarankan.
Hard delete hanya untuk data dummy/development.
---
## 11. `rate_card_orders` Permission
### Read
UMKM participant boleh read order.
Kreator participant boleh read order.
Admin boleh read semua order, terutama dispute.
### Create
UMKM create via Function `create-rate-card-order`.
### Update
Participant boleh update field tertentu lewat action function.
UMKM tidak boleh langsung set `Escrow`.
Kreator tidak boleh langsung set `Selesai`.
Payment status hanya boleh dari backend.
Allowed action:
1. Send custom offer.
2. Accept custom offer.
3. Reject custom offer.
4. Submit collab post URL.
5. Request revision.
6. Mark ready for verification.
7. Open dispute.
---
## 12. `messages` Permission
### Read
Hanya participant order yang boleh membaca messages.
Admin boleh membaca messages jika order masuk dispute atau untuk support terotorisasi.
### Create
Participant order boleh create message jika order masih aktif.
System boleh create message system.
### Update
User hanya boleh update `is_read` untuk message yang diterima.
Konten pesan tidak boleh diedit setelah dikirim pada fase MVP.
### Delete
Tidak ada hard delete untuk chat.
Jika perlu moderasi, buat field `is_hidden` di masa depan.
Critical rule:
```txt
Tidak boleh ada message untuk Campaign Mode.
```
---
## 13. `transactions` Permission
### Read
User boleh read transaction miliknya.
Admin finance boleh read semua.
### Create
Hanya backend/Function yang boleh create.
### Update
Hanya backend/Function yang boleh update.
Payment webhook handler boleh update status setelah signature valid.
### Delete
Tidak boleh delete transaction.
Transaction adalah ledger.
Jika salah, buat reversal/adjustment transaction.
---
## 14. `withdrawals` Permission
### Read
Kreator boleh read withdrawal miliknya.
Admin finance boleh read semua.
### Create
Kreator request via Function.
Function cek saldo cukup dan tidak ada dispute aktif.
### Update
Admin finance/backend update status process.
Kreator tidak boleh update status.
### Sensitive Data
Field bank hanya boleh terlihat ke kreator owner dan admin finance.
Jangan expose data bank ke UMKM atau kreator lain.
---
## 15. `disputes` Permission
### Read
User terkait boleh read dispute miliknya.
Admin/support boleh read semua dispute sesuai role.
### Create
User terkait boleh open dispute via Function.
### Update
Admin/support yang berwenang update status.
Resolusi finance harus oleh admin finance/owner.
### Delete
Tidak boleh delete dispute.
Gunakan status `Closed`.
---
## 16. `notifications` Permission
### Read
User hanya boleh read notification miliknya.
Admin boleh read untuk debugging jika diperlukan.
### Create
Backend/system yang create notification.
Frontend tidak boleh create notification sendiri.
### Update
User boleh update `is_read` dan `read_at` miliknya.
### Delete
Opsional.
Lebih aman gunakan retention policy daripada delete manual.
---
## 17. `audit_logs` Permission
### Read
Admin only.
Tidak boleh dibaca user biasa.
### Create
Backend/system only.
Admin action juga dicatat oleh backend.
### Update
Tidak boleh update audit log.
### Delete
Tidak boleh delete audit log dari aplikasi biasa.
Retention policy hanya oleh owner teknis.
---
## 18. Backend-Only Operation List
Operasi berikut wajib lewat Function/backend:
1. Create profile after signup.
2. Change user role.
3. Verify user.
4. Suspend user.
5. Create campaign payment.
6. Activate campaign.
7. Claim campaign.
8. Increment campaign quota.
9. Submit proof URL.
10. Validate submission.
11. Reject submission.
12. Mark fraud.
13. Release campaign payout.
14. Create rate card order.
15. Send custom offer.
16. Accept custom offer.
17. Create payment transaction.
18. Handle payment webhook.
19. Update payment status.
20. Update escrow status.
21. Update dompet_saldo.
22. Request withdrawal.
23. Process withdrawal.
24. Resolve dispute.
25. Create audit log.
---
## 19. Frontend-Allowed Direct Operation List
Operasi langsung dari frontend hanya boleh untuk data low-risk:
1. Read own profile.
2. Update safe profile fields.
3. Read active campaigns for Job Pool.
4. Read own campaigns.
5. Read own claims.
6. Read own submissions.
7. Read public creator directory.
8. Read own orders.
9. Read messages for participant order.
10. Create normal text message if participant and order active.
11. Mark received message as read.
12. Read own notifications.
13. Mark notification as read.
Jika ragu, gunakan Function.
---
## 20. Permission Checklist for AI
Sebelum membuat kode, AI assistant harus memastikan:
1. Siapa actor-nya?
2. Apa role actor-nya?
3. Document apa yang dibaca?
4. Document apa yang ditulis?
5. Apakah actor owner document?
6. Apakah actor participant order?
7. Apakah data termasuk finansial?
8. Apakah data termasuk admin-only?
9. Apakah mutation harus lewat Function?
10. Apakah audit log diperlukan?
11. Apakah notification diperlukan?
12. Apakah field sensitif tersembunyi dari response?
13. Apakah Campaign Mode tetap tanpa chat?
14. Apakah status payment hanya dari backend?
15. Apakah saldo tidak pernah diubah client?
---
## 21. Final Rule
Permission frontend adalah lapisan pertama.
Business validation backend adalah lapisan wajib.
Jangan menganggap UI disabled sudah cukup aman.
Semua operasi sensitif harus diverifikasi ulang di Function/backend.
