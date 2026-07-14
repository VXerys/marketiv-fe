# 03 — Relationships and Access Patterns
> Dokumen ini menjelaskan relasi antar collection dan pola akses data yang harus dipakai backend/frontend.
> Appwrite dapat memakai relationship attribute, tetapi Marketiv tetap menggunakan reference ID eksplisit untuk query yang predictable.
---
## 1. Prinsip Relationship
Marketiv menggunakan strategi hybrid.
Strategi ini menggabungkan reference ID field dan optional relationship attribute.
Reference ID field wajib ada di semua collection yang berelasi.
Relationship attribute boleh ditambahkan jika benar-benar membantu developer experience.
Frontend tidak boleh mengandalkan auto-load relationship secara default.
Backend harus mengontrol payload agar dashboard tetap ringan.
---
## 2. Kenapa Reference ID Tetap Dipakai
1. Query lebih eksplisit.
2. Payload lebih kecil.
3. Pagination lebih mudah.
4. Denormalisasi ringan bisa dilakukan untuk dashboard.
5. Frontend tidak perlu memuat object besar jika hanya butuh ID.
6. Appwrite relationship loading bersifat opt-in.
7. Query list dashboard lebih predictable.
8. AI coding assistant lebih mudah memahami data flow.
9. Permission per document lebih mudah dijelaskan.
10. Migration lebih aman jika relationship attribute berubah.
---
## 3. Relationship Map
```txt
profiles.user_id
  ├── campaigns.umkm_user_id
  ├── campaign_claims.kreator_user_id
  ├── campaign_submissions.kreator_user_id
  ├── creator_rate_cards.kreator_user_id
  ├── rate_card_orders.umkm_user_id
  ├── rate_card_orders.kreator_user_id
  ├── messages.sender_user_id
  ├── transactions.user_id
  ├── withdrawals.kreator_user_id
  ├── disputes.opened_by_user_id
  └── notifications.user_id
campaigns.$id
  ├── campaign_claims.campaign_id
  ├── campaign_submissions.campaign_id
  └── transactions.reference_id where reference_type = Campaign
campaign_claims.$id
  └── campaign_submissions.claim_id
creator_rate_cards.$id
  └── rate_card_orders.rate_card_id
rate_card_orders.$id
  ├── messages.order_id
  ├── transactions.reference_id where reference_type = RateCardOrder
  └── disputes.reference_id where reference_type = RateCardOrder
withdrawals.$id
  └── transactions.reference_id where reference_type = Withdrawal
```
---
## 4. Ownership Model
| Entity | Owner | Secondary Reader |
|---|---|---|
| `profiles` | User sendiri | Admin, public verified creator subset |
| `campaigns` | UMKM pembuat | Kreator jika Aktif, Admin |
| `campaign_claims` | Kreator claimant | UMKM owner campaign, Admin |
| `campaign_submissions` | Kreator submitter | UMKM owner campaign, Admin |
| `creator_rate_cards` | Kreator | UMKM, Admin |
| `rate_card_orders` | UMKM + Kreator | Admin pada dispute |
| `messages` | Order participants | Admin pada dispute |
| `transactions` | System + user terkait | Admin |
| `withdrawals` | Kreator | Admin finance |
| `disputes` | User pembuka + pihak terkait | Admin |
| `notifications` | User penerima | System/Admin |
| `audit_logs` | System | Admin only |
---
## 5. Campaign Mode Access Pattern
### 5.1 UMKM Dashboard Summary
Data yang dibutuhkan:
1. Total campaign milik UMKM.
2. Campaign aktif.
3. Budget escrow.
4. Submission pending.
5. Submission valid.
6. Campaign terbaru.
Query pattern:
```txt
campaigns where umkm_user_id == current_user_id orderDesc created_at limit 10
campaigns where umkm_user_id == current_user_id and status == Aktif
campaign_submissions where umkm_user_id == current_user_id and status_validasi == Pending
transactions where user_id == current_user_id orderDesc created_at limit 5
```
Backend aggregation direkomendasikan untuk dashboard summary.
Frontend tidak perlu menghitung semua data dari list besar.
---
## 6. Campaign List UMKM
User: UMKM.
Page: `/dashboard/umkm/campaign`.
Filter yang didukung:
1. `status`.
2. `niche`.
3. `created_at`.
4. Search judul campaign.
Query pattern:
```txt
campaigns
  where umkm_user_id == current_user_id
  optional where status == selected_status
  optional where niche == selected_niche
  orderDesc created_at
  limit 20
```
Frontend harus menggunakan pagination.
Frontend tidak boleh memuat semua campaign sekaligus.
---
## 7. Job Pool Kreator
User: Kreator.
Page: `/dashboard/kreator/job-pool`.
Data yang dibutuhkan:
1. Campaign dengan status `Aktif`.
2. Sisa kuota.
3. Harga per 1000 views.
4. Niche.
5. Thumbnail.
6. Info apakah kreator sudah klaim.
Query pattern:
```txt
campaigns
  where status == Aktif
  optional where niche == selected_niche
  orderDesc published_at
  limit 20
```
Setelah list campaign didapat, backend/frontend perlu cek claim milik kreator.
Untuk menghindari N+1 query, backend endpoint khusus lebih direkomendasikan.
Recommended Function:
```txt
get-job-pool-feed
```
Function response:
```json
{
  "campaigns": [
    {
      "$id": "campaign_id",
      "judul_campaign": "Dapur Sehat Sambal Matah",
      "niche": "Kuliner",
      "harga_per_1000_views": 4000,
      "kuota_kreator": 5,
      "kuota_terpakai": 2,
      "has_claimed": false
    }
  ],
  "next_cursor": "..."
}
```
---
## 8. Claim Campaign Flow
Mutation: Kreator klaim campaign.
Access pattern:
1. Frontend memanggil Function `claim-campaign`.
2. Function membaca `profiles` kreator.
3. Function membaca `campaigns`.
4. Function memastikan status campaign `Aktif`.
5. Function mencari `campaign_claims` dengan `campaign_id` dan `kreator_user_id`.
6. Function menolak jika sudah ada claim.
7. Function menolak jika `kuota_terpakai >= kuota_kreator`.
8. Function membuat `campaign_claims`.
9. Function update `campaigns.kuota_terpakai`.
10. Function update status campaign ke `Penuh` jika kuota habis.
11. Function membuat notification untuk UMKM.
12. Function membuat audit log.
Frontend tidak boleh membuat `campaign_claims` secara langsung.
---
## 9. Submission Flow
User: Kreator.
Page: `/dashboard/kreator/pekerjaan-aktif/[id]`.
Data yang dibutuhkan:
1. Claim detail.
2. Campaign detail.
3. Existing submission jika ada.
4. Status validasi.
Query pattern:
```txt
campaign_claims where kreator_user_id == current_user_id and status == Aktif
campaigns by campaign_id
campaign_submissions where claim_id == selected_claim_id
```
Recommended Function:
```txt
submit-campaign-proof
```
Function responsibility:
1. Validate claim owner.
2. Validate campaign still valid.
3. Validate TikTok/Instagram URL.
4. Create or update submission.
5. Set `status_validasi = Pending`.
6. Notify UMKM/Admin.
7. Audit log.
---
## 10. Rate Card Directory Access Pattern
User: UMKM.
Page: `/dashboard/umkm/kreator`.
Data yang dibutuhkan:
1. Creator profile verified.
2. Niche.
3. Foto profil.
4. Harga mulai.
5. Rate card aktif.
Query pattern:
```txt
profiles where role == KREATOR and verification_status == Verified
creator_rate_cards where kreator_user_id in creator_ids and is_active == true
```
Recommended backend aggregation:
```txt
get-creator-directory
```
Reason:
1. Menghindari banyak query dari frontend.
2. Menghitung harga mulai lebih mudah di backend.
3. Bisa menerapkan ranking creator.
4. Bisa menyembunyikan field sensitif.
---
## 11. Rate Card Order Flow
Mutation: UMKM mulai chat/order kreator.
Flow:
1. UMKM membuka profil kreator.
2. UMKM klik `Hubungi Kreator`.
3. Frontend memanggil Function `create-rate-card-order`.
4. Function memastikan current user adalah UMKM.
5. Function memastikan kreator aktif/verified.
6. Function membuat `rate_card_orders` status `Negosiasi`.
7. Function membuat message system pertama.
8. Function membuat notification ke Kreator.
9. Function mengembalikan `order_id`.
10. Frontend redirect ke chat room.
---
## 12. Message Access Pattern
User: UMKM atau Kreator participant.
Page: `/dashboard/*/negosiasi/[id_order]`.
Query pattern:
```txt
messages where order_id == selected_order_id orderAsc created_at limit 50
```
Realtime channel:
```txt
databases.marketiv_main.collections.messages.documents
filter by order_id at client state level or subscribe document/channel if supported by SDK pattern
```
Important:
1. Messages hanya untuk Rate Card Mode.
2. Messages tidak boleh terhubung ke campaigns.
3. Participant check harus dilakukan sebelum read/write.
4. Admin read messages hanya untuk dispute review.
---
## 13. Transaction Access Pattern
User: UMKM, Kreator, Admin.
UMKM melihat:
1. Deposit campaign.
2. Fee platform.
3. Refund.
4. Payment order.
Kreator melihat:
1. Pencairan.
2. Withdrawal.
3. Saldo tersedia.
Admin melihat:
1. Semua transaksi.
2. Filter status.
3. Filter provider.
4. Filter date range.
5. Export report.
Query pattern:
```txt
transactions where user_id == current_user_id orderDesc created_at limit 20
transactions where status == Pending orderDesc created_at limit 50 for admin
transactions where reference_id == selected_id
```
---
## 14. Notification Access Pattern
User: semua role.
Query pattern:
```txt
notifications where user_id == current_user_id orderDesc created_at limit 20
notifications where user_id == current_user_id and is_read == false
```
Mutation:
1. Mark one as read.
2. Mark all as read.
Frontend boleh mark notification as read jika permission aman.
Notification creation tetap dilakukan backend/system.
---
## 15. Audit Log Access Pattern
Audit logs hanya untuk admin dan system.
Frontend user biasa tidak boleh membaca audit logs.
Admin dashboard boleh membaca audit logs dengan filter ketat.
Query pattern:
```txt
audit_logs where entity_type == selected_type and entity_id == selected_id orderDesc created_at
audit_logs where actor_user_id == selected_user orderDesc created_at
audit_logs where action == selected_action orderDesc created_at
```
---
## 16. Denormalization Strategy
Denormalisasi diizinkan untuk performa.
Denormalisasi harus terbatas dan terkontrol.
Allowed denormalization:
1. `campaign_claims.umkm_user_id` dari campaign.
2. `campaign_submissions.umkm_user_id` dari campaign.
3. `rate_card_orders.umkm_user_id` dan `kreator_user_id`.
4. `messages.receiver_user_id` untuk unread calculation.
5. `transactions.reference_type` untuk filter cepat.
6. `notifications.reference_type` untuk routing UI.
Not allowed denormalization:
1. Menyalin seluruh profile ke setiap campaign.
2. Menyalin seluruh campaign brief ke submission.
3. Menyalin semua messages ke order.
4. Menyalin data bank ke transactions publik.
5. Menyalin secret provider ke document readable frontend.
---
## 17. N+1 Query Avoidance
Hindari pola berikut:
```txt
load campaigns
for each campaign:
  load owner profile
  load claim count
  load submission count
```
Gunakan pola berikut:
1. Backend aggregation Function.
2. Denormalized count field jika aman.
3. Batched query berdasarkan ID jika supported.
4. Limit list dan lazy load detail.
5. Cache ringan di frontend state.
---
## 18. Detail Page Loading Strategy
List page harus ringan.
Detail page boleh memuat data lebih lengkap.
Campaign detail UMKM:
1. Campaign document.
2. Claims list paginated.
3. Submissions list paginated.
4. Transactions for campaign.
Campaign detail Kreator:
1. Campaign document.
2. Claim status current kreator.
3. Submission current kreator.
Order detail:
1. Order document.
2. Participant public profiles.
3. Messages paginated.
4. Latest custom offer.
5. Payment transaction summary.
---
## 19. Access Pattern Checklist for AI
Saat membuat fitur baru, AI assistant harus menjawab:
1. Collection apa yang dibaca?
2. Collection apa yang ditulis?
3. Apakah operasi ini sensitif?
4. Apakah harus lewat Function?
5. Role apa yang boleh melakukan operasi?
6. Field apa yang perlu di-index?
7. Apakah query butuh pagination?
8. Apakah perlu realtime?
9. Apakah perlu notification?
10. Apakah perlu audit log?
11. Apakah perlu frontend DTO khusus?
12. Apakah ada risiko N+1 query?
13. Apakah ada data sensitif yang harus disembunyikan?
14. Apakah Campaign Mode tetap zero chat?
15. Apakah Rate Card Mode tetap chat-only untuk order?
---
## 20. Final Rule
Relationship harus mendukung flow bisnis, bukan hanya terlihat rapi di schema.
Jika relationship membuat payload berat atau permission rumit, gunakan reference ID eksplisit.
Jika frontend butuh data gabungan kompleks, buat Function khusus yang mengembalikan DTO aman.
