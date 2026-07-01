# 02 — Collections Schema
> Dokumen ini adalah referensi schema utama untuk Appwrite Database Marketiv.
> Semua attribute, enum, ownership, dan catatan validasi harus mengikuti dokumen ini.
---
## 1. Database
```txt
Database ID   : marketiv_main
Database Name : Marketiv Main Database
```
Semua collection menggunakan snake_case.
Semua timestamp menggunakan ISO string yang dihasilkan Appwrite atau backend.
Semua nominal uang disimpan sebagai integer Rupiah.
Semua field ID relasi memakai string Appwrite ID.
Semua enum harus dipakai persis sesuai dokumen.
---
## 2. Collection Summary
| Collection | Purpose | Owner Utama |
|---|---|---|
| `profiles` | Profil domain user | User |
| `campaigns` | Campaign Mode UMKM | UMKM |
| `campaign_claims` | Klaim campaign oleh kreator | Kreator |
| `campaign_submissions` | Bukti tayang campaign | Kreator |
| `creator_rate_cards` | Paket jasa kreator | Kreator |
| `rate_card_orders` | Order Rate Card | UMKM + Kreator |
| `messages` | Chat Rate Card | Participants |
| `transactions` | Ledger transaksi | System |
| `withdrawals` | Request penarikan saldo | Kreator |
| `disputes` | Sengketa | User + Admin |
| `notifications` | Notifikasi user | User |
| `audit_logs` | Jejak aksi sensitif | System/Admin |
---
## 3. `profiles`
### Purpose
Menyimpan data domain user yang tidak disimpan di Appwrite Auth.
Setiap Appwrite Auth user harus punya tepat satu profile.
Document ID direkomendasikan sama dengan Auth user ID.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `user_id` | string | Yes | Auth ID | ID user dari Appwrite Auth |
| `role` | enum | Yes | - | `UMKM`, `KREATOR`, `ADMIN` |
| `nama_lengkap` | string | Yes | - | Nama asli user |
| `email` | email/string | Yes | - | Duplikasi aman dari Auth untuk read cepat |
| `nomor_whatsapp` | string | No | null | Nomor kontak operasional |
| `foto_profil_url` | url/string | No | null | URL foto profil |
| `bio` | string | No | null | Bio singkat user/kreator |
| `niche` | enum/string | No | null | Niche utama kreator atau UMKM |
| `dompet_saldo` | integer | Yes | 0 | Saldo tersedia dalam Rupiah |
| `is_verified` | boolean | Yes | false | Verifikasi domain Marketiv |
| `verification_status` | enum | Yes | `Pending` | Status verifikasi domain |
| `onboarding_status` | enum | Yes | `Incomplete` | Status kelengkapan onboarding |
| `created_at` | datetime | Yes | now | Waktu dibuat |
| `updated_at` | datetime | Yes | now | Waktu diubah |
### Enums
```txt
role = UMKM | KREATOR | ADMIN
verification_status = Pending | Verified | Rejected | Suspended
onboarding_status = Incomplete | Complete
niche = Kuliner | Fesyen | Pariwisata | Edukasi | Kecantikan | Teknologi | Lainnya
```
### Sensitive Fields
`dompet_saldo` tidak boleh diubah langsung oleh frontend.
`role` tidak boleh diubah langsung oleh frontend.
`verification_status` tidak boleh diubah langsung oleh frontend.
---
## 4. `campaigns`
### Purpose
Menyimpan campaign performance-based yang dibuat oleh UMKM.
Campaign ini muncul di Job Pool setelah status aktif.
Campaign Mode tidak memiliki chat.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `umkm_user_id` | string | Yes | - | Owner UMKM |
| `judul_campaign` | string | Yes | - | Judul campaign |
| `deskripsi_brief` | string | Yes | - | Brief untuk kreator |
| `niche` | enum | Yes | - | Kategori campaign |
| `thumbnail_url` | url/string | No | null | Thumbnail produk/campaign |
| `asset_type` | enum | Yes | `ExternalUrl` | Sumber aset |
| `asset_file_ids` | string[] | No | [] | File gambar ringan di Storage |
| `asset_external_url` | url/string | No | null | Link Drive/Dropbox |
| `harga_per_1000_views` | integer | Yes | - | Bayaran per 1000 views |
| `estimasi_views_target` | integer | No | 0 | Target views perkiraan |
| `kuota_kreator` | integer | Yes | - | Maks kreator yang bisa klaim |
| `kuota_terpakai` | integer | Yes | 0 | Jumlah klaim aktif |
| `total_budget_escrow` | integer | Yes | - | Budget campaign |
| `platform_fee_amount` | integer | Yes | 0 | Fee platform 15% |
| `total_payment_amount` | integer | Yes | 0 | Budget + fee |
| `status` | enum | Yes | `Draft` | Status campaign |
| `payment_status` | enum | Yes | `Unpaid` | Status pembayaran |
| `created_at` | datetime | Yes | now | Waktu dibuat |
| `updated_at` | datetime | Yes | now | Waktu diubah |
| `published_at` | datetime | No | null | Waktu aktif |
| `ended_at` | datetime | No | null | Waktu selesai |
| `cancelled_at` | datetime | No | null | Waktu batal |
### Enums
```txt
asset_type = ExternalUrl | AppwriteStorage | Mixed
status = Draft | MenungguPembayaran | Aktif | Penuh | Selesai | Dibatalkan | Dispute
payment_status = Unpaid | Pending | Paid | Failed | Expired | Refunded
```
### Business Notes
`asset_external_url` wajib jika ada video mentah besar.
`kuota_terpakai` hanya boleh diubah oleh Function.
`status` hanya boleh diubah oleh Function atau Admin backend.
`payment_status` hanya boleh diubah setelah webhook/payment verification.
Campaign dengan status selain `Aktif` tidak boleh muncul di Job Pool.
---
## 5. `campaign_claims`
### Purpose
Mencatat kreator yang mengambil pekerjaan campaign.
Collection ini memisahkan proses klaim dari proses submit bukti tayang.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `campaign_id` | string | Yes | - | ID campaign |
| `umkm_user_id` | string | Yes | - | Denormalisasi owner campaign |
| `kreator_user_id` | string | Yes | - | ID kreator yang klaim |
| `status` | enum | Yes | `Aktif` | Status klaim |
| `claim_note` | string | No | null | Catatan optional |
| `claimed_at` | datetime | Yes | now | Waktu klaim |
| `cancelled_at` | datetime | No | null | Waktu pembatalan |
| `completed_at` | datetime | No | null | Waktu selesai |
### Enums
```txt
status = Aktif | Dibatalkan | Selesai | Dispute
```
### Business Notes
Satu kreator hanya boleh punya satu claim aktif per campaign.
Composite uniqueness harus divalidasi di Function.
Create claim harus sekaligus mengupdate `campaigns.kuota_terpakai`.
Jika kuota sudah penuh, Function harus menolak request.
---
## 6. `campaign_submissions`
### Purpose
Menyimpan URL bukti tayang dari kreator setelah campaign diklaim.
Bukti tayang harus berupa URL publik TikTok atau Instagram.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `campaign_id` | string | Yes | - | ID campaign |
| `claim_id` | string | Yes | - | ID campaign claim |
| `umkm_user_id` | string | Yes | - | Owner campaign |
| `kreator_user_id` | string | Yes | - | Owner submission |
| `url_bukti_tayang` | url/string | Yes | - | URL TikTok/Instagram |
| `platform` | enum | Yes | - | Platform bukti tayang |
| `jumlah_views_target` | integer | No | 0 | Target views |
| `jumlah_views_aktual` | integer | Yes | 0 | Views tervalidasi |
| `status_validasi` | enum | Yes | `Pending` | Status validasi |
| `fraud_score` | integer | No | null | Skor fraud 0-100 |
| `fraud_notes` | string | No | null | Catatan validasi |
| `dana_dicairkan` | integer | Yes | 0 | Dana cair ke kreator |
| `submitted_at` | datetime | Yes | now | Waktu submit |
| `validated_at` | datetime | No | null | Waktu validasi |
| `validated_by_admin_id` | string | No | null | Admin validator |
### Enums
```txt
platform = TikTok | Instagram
status_validasi = Pending | Valid | Fraud | Dispute | Rejected
```
### Business Notes
Frontend hanya boleh membuat submission via Function.
Admin atau validator backend yang mengubah `status_validasi`.
Jika valid, backend membuat transaction pencairan.
Jika fraud, dana ditahan dan bisa masuk dispute.
---
## 7. `creator_rate_cards`
### Purpose
Menyimpan paket jasa kreator untuk Rate Card Mode.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `kreator_user_id` | string | Yes | - | Owner paket |
| `nama_paket` | string | Yes | - | Nama paket |
| `deskripsi_paket` | string | No | null | Deskripsi detail |
| `harga_paket` | integer | Yes | - | Harga dalam Rupiah |
| `deliverable` | string | Yes | - | Output jasa |
| `estimasi_hari` | integer | No | null | Estimasi pengerjaan |
| `revision_limit` | integer | No | 1 | Batas revisi |
| `is_active` | boolean | Yes | true | Status aktif |
| `created_at` | datetime | Yes | now | Waktu dibuat |
| `updated_at` | datetime | Yes | now | Waktu diubah |
### Business Notes
Maksimal 3 rate card aktif per kreator.
Limit ini harus divalidasi di Function/backend.
Frontend boleh menampilkan tombol disabled jika sudah 3 aktif.
Harga minimal direkomendasikan Rp 10.000.
---
## 8. `rate_card_orders`
### Purpose
Menyimpan order konsultatif antara UMKM dan Kreator.
Order ini memiliki chat, custom offer, escrow, dan collab post.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `umkm_user_id` | string | Yes | - | Pihak UMKM |
| `kreator_user_id` | string | Yes | - | Pihak Kreator |
| `rate_card_id` | string | No | null | Paket awal jika ada |
| `judul_proyek` | string | No | null | Judul pekerjaan |
| `scope_pekerjaan` | string | No | null | Scope final/custom offer |
| `harga_final` | integer | No | 0 | Harga deal |
| `platform_fee_amount` | integer | No | 0 | Fee platform 10% |
| `total_payment_amount` | integer | No | 0 | Harga final + fee |
| `deadline` | datetime | No | null | Deadline pekerjaan |
| `url_collab_post` | url/string | No | null | URL hasil Collab Post |
| `status` | enum | Yes | `Negosiasi` | Status order |
| `payment_status` | enum | Yes | `Unpaid` | Status payment |
| `created_at` | datetime | Yes | now | Waktu dibuat |
| `updated_at` | datetime | Yes | now | Waktu diubah |
| `accepted_at` | datetime | No | null | Offer diterima |
| `paid_at` | datetime | No | null | Payment sukses |
| `completed_at` | datetime | No | null | Order selesai |
| `cancelled_at` | datetime | No | null | Order batal |
### Enums
```txt
status = Negosiasi | MenungguPembayaran | Escrow | Revisi | MenungguVerifikasi | Selesai | Dibatalkan | Dispute
payment_status = Unpaid | Pending | Paid | Failed | Expired | Refunded
```
### Business Notes
Live chat hanya boleh ada untuk order ini.
Custom Offer dibuat sebagai message tipe `CustomOffer`.
Setelah offer diterima, status order menjadi `MenungguPembayaran`.
Setelah payment valid, status order menjadi `Escrow`.
---
## 9. `messages`
### Purpose
Menyimpan live chat Rate Card Mode.
Tidak boleh digunakan untuk Campaign Mode.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `order_id` | string | Yes | - | ID rate card order |
| `sender_user_id` | string | Yes | - | Pengirim |
| `receiver_user_id` | string | Yes | - | Penerima |
| `tipe_pesan` | enum | Yes | `Text` | Jenis pesan |
| `konten` | string | Yes | - | Isi pesan atau summary offer |
| `offer_data` | json/string | No | null | JSON custom offer |
| `is_read` | boolean | Yes | false | Status dibaca |
| `created_at` | datetime | Yes | now | Waktu kirim |
### Enums
```txt
tipe_pesan = Text | CustomOffer | System
```
### `offer_data` Shape
```json
{
  "harga_final": 350000,
  "scope_pekerjaan": "1 video Reels 30 detik, 2x revisi, Collab Post",
  "deadline": "2026-06-24T00:00:00.000Z",
  "revision_limit": 2,
  "status": "Pending"
}
```
---
## 10. `transactions`
### Purpose
Ledger semua pergerakan dana.
Collection ini adalah sumber histori finansial.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `user_id` | string | Yes | - | User terkait |
| `reference_id` | string | No | null | ID campaign/order/withdrawal |
| `reference_type` | enum | Yes | - | Jenis referensi |
| `nominal` | integer | Yes | - | Nominal utama |
| `platform_fee_amount` | integer | No | 0 | Fee platform |
| `gross_amount` | integer | No | 0 | Amount sebelum potongan |
| `net_amount` | integer | No | 0 | Amount bersih |
| `tipe` | enum | Yes | - | Jenis transaksi |
| `status` | enum | Yes | `Pending` | Status transaksi |
| `provider` | enum | No | null | Payment/disbursement provider |
| `provider_order_id` | string | No | null | Order ID provider |
| `provider_transaction_id` | string | No | null | Transaction ID provider |
| `payment_url` | url/string | No | null | URL payment redirect |
| `paid_at` | datetime | No | null | Waktu bayar |
| `expired_at` | datetime | No | null | Waktu expired |
| `created_at` | datetime | Yes | now | Waktu dibuat |
| `updated_at` | datetime | Yes | now | Waktu update |
| `keterangan` | string | No | null | Catatan transaksi |
### Enums
```txt
reference_type = Campaign | RateCardOrder | Withdrawal | Refund | ManualAdjustment
tipe = Deposit | Fee | Escrow | Pencairan | Refund | Withdrawal | Adjustment
status = Pending | Escrow | Success | Failed | Expired | Refunded | Cancelled
provider = Midtrans | Manual | Xendit | Internal
```
---
## 11. `withdrawals`
### Purpose
Menyimpan permintaan penarikan saldo kreator.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `kreator_user_id` | string | Yes | - | Kreator pemilik saldo |
| `nominal` | integer | Yes | - | Nominal tarik dana |
| `bank_name` | string | Yes | - | Nama bank/e-wallet |
| `bank_account_number` | string | Yes | - | Nomor rekening |
| `bank_account_holder` | string | Yes | - | Nama pemilik rekening |
| `status` | enum | Yes | `Pending` | Status withdrawal |
| `provider` | enum | No | null | Provider disbursement |
| `provider_disbursement_id` | string | No | null | ID provider |
| `requested_at` | datetime | Yes | now | Waktu request |
| `processed_at` | datetime | No | null | Waktu proses |
| `completed_at` | datetime | No | null | Waktu selesai |
| `rejection_reason` | string | No | null | Alasan reject |
### Enums
```txt
status = Pending | Processing | Success | Failed | Rejected | Cancelled
provider = Manual | Xendit | MidtransIris | Internal
```
---
## 12. `disputes`
### Purpose
Menyimpan sengketa antara user atau antara user dan sistem.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `reference_id` | string | Yes | - | Entity yang disengketakan |
| `reference_type` | enum | Yes | - | Tipe entity |
| `opened_by_user_id` | string | Yes | - | User pembuka sengketa |
| `against_user_id` | string | No | null | Pihak lawan |
| `reason` | enum/string | Yes | - | Alasan sengketa |
| `description` | string | Yes | - | Deskripsi sengketa |
| `status` | enum | Yes | `Open` | Status sengketa |
| `admin_user_id` | string | No | null | Admin handler |
| `resolution` | string | No | null | Hasil penyelesaian |
| `created_at` | datetime | Yes | now | Waktu dibuat |
| `updated_at` | datetime | Yes | now | Waktu update |
| `resolved_at` | datetime | No | null | Waktu selesai |
### Enums
```txt
reference_type = CampaignSubmission | RateCardOrder | Withdrawal | Transaction
status = Open | UnderReview | ResolvedForUMKM | ResolvedForKreator | Refunded | Rejected | Closed
```
---
## 13. `notifications`
### Purpose
Menyimpan notifikasi in-app untuk user.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `user_id` | string | Yes | - | Penerima notifikasi |
| `title` | string | Yes | - | Judul singkat |
| `body` | string | Yes | - | Isi notifikasi |
| `type` | enum | Yes | `System` | Jenis notifikasi |
| `reference_id` | string | No | null | ID entity terkait |
| `reference_type` | string | No | null | Tipe entity terkait |
| `is_read` | boolean | Yes | false | Status dibaca |
| `created_at` | datetime | Yes | now | Waktu dibuat |
| `read_at` | datetime | No | null | Waktu dibaca |
### Enums
```txt
type = CampaignActivated | ClaimCreated | SubmissionValidated | PaymentSuccess | CustomOfferReceived | OrderCompleted | WithdrawalSuccess | DisputeUpdated | System
```
---
## 14. `audit_logs`
### Purpose
Mencatat aksi sensitif, mutation penting, dan admin override.
Audit log membantu debugging, keamanan, dan laporan internal.
### Attributes
| Attribute | Type | Required | Default | Description |
|---|---:|:---:|---|---|
| `actor_user_id` | string | No | null | User yang melakukan aksi |
| `actor_role` | enum/string | No | null | Role actor |
| `action` | string | Yes | - | Nama aksi |
| `entity_type` | string | Yes | - | Tipe entity |
| `entity_id` | string | No | null | ID entity |
| `before_data` | json/string | No | null | Snapshot sebelum |
| `after_data` | json/string | No | null | Snapshot sesudah |
| `ip_address` | string | No | null | IP request |
| `user_agent` | string | No | null | User agent |
| `created_at` | datetime | Yes | now | Waktu log |
### Example Actions
```txt
CREATE_PROFILE
CREATE_CAMPAIGN
CREATE_PAYMENT
PAYMENT_WEBHOOK_RECEIVED
CLAIM_CAMPAIGN
SUBMIT_CAMPAIGN_PROOF
VALIDATE_SUBMISSION
REJECT_SUBMISSION
CREATE_RATE_CARD
CREATE_ORDER
SEND_CUSTOM_OFFER
ACCEPT_CUSTOM_OFFER
REQUEST_WITHDRAWAL
PROCESS_WITHDRAWAL
OPEN_DISPUTE
RESOLVE_DISPUTE
ADMIN_OVERRIDE_STATUS
```
---
## 15. Schema Change Policy
1. Jangan rename attribute tanpa migration note.
2. Jangan menghapus enum value yang sudah dipakai data production.
3. Tambahkan attribute baru sebagai optional dulu jika memungkinkan.
4. Jika attribute wajib baru diperlukan, siapkan migration script.
5. Update frontend contract setelah schema berubah.
6. Update index strategy jika field baru dipakai untuk query.
7. Update permission strategy jika field baru sensitif.
8. Update audit log action jika mutation baru sensitif.
9. Update AI prompt context agar VS Code assistant tidak memakai schema lama.
10. Review schema oleh backend dan frontend sebelum implementasi production.
