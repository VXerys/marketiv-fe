# 01 — Appwrite Overview for Marketiv Database

> Dokumen ini menjelaskan arsitektur Appwrite yang dipakai oleh Marketiv.
> Fokusnya adalah batas tanggung jawab Auth, Database, Storage, Functions, Realtime, dan Messaging.

---

## 1. Tujuan

Marketiv menggunakan Appwrite sebagai Backend-as-a-Service utama.
Appwrite dipakai untuk mengelola authentication, database, file storage ringan, realtime, dan serverless function.
Dokumen ini memastikan semua tim memahami batas antar layanan.
Batas ini penting karena Marketiv memiliki data sensitif seperti escrow, transaksi, saldo, payout, dan dispute.
Kesalahan boundary dapat menyebabkan bug keamanan atau inkonsistensi data.

---

## 2. Appwrite Services yang Dipakai

| Service | Status | Fungsi di Marketiv |
|---|---|---|
| Auth | Wajib | Login, register, session, verification, password reset |
| Databases | Wajib | Data domain aplikasi |
| Storage | Terbatas | Foto profil, logo, gambar produk ringan |
| Functions | Wajib | Operasi sensitif, webhook, payment, validation |
| Realtime | Wajib terbatas | Chat Rate Card dan notification ringan |
| Messaging | Opsional | Email/in-app notification lanjutan |
| Teams | Direkomendasikan | Admin team dan role internal |
| Labels | Direkomendasikan | Role atau segmentasi user |

---

## 3. Resource Boundary

### 3.1 Auth Boundary

Appwrite Auth menyimpan data identity.
Data identity adalah data yang dibutuhkan untuk login dan session.
Data ini tidak boleh diduplikasi secara berlebihan ke Database.

Auth bertanggung jawab untuk:

1. Email user.
2. Password user.
3. Session token.
4. Email verification.
5. Password recovery.
6. OAuth jika nanti dipakai.
7. User ID utama.
8. Status akun level auth.
9. Security identity.
10. Permission identity.

Auth tidak bertanggung jawab untuk:

1. Bio kreator.
2. Niche kreator.
3. Saldo kreator.
4. Campaign UMKM.
5. Order Rate Card.
6. Submission.
7. Payment status.
8. Dispute.
9. Audit log bisnis.
10. Dashboard metrics.

---

## 4. Profile Boundary

Collection `profiles` adalah representasi domain dari Appwrite Auth user.
Setiap user Auth yang memakai Marketiv harus punya satu document profile.
`profiles.$id` sebaiknya sama dengan Appwrite Auth user ID.
Jika tidak memungkinkan, minimal `profiles.user_id` wajib sama dengan Auth user ID.

`profiles` menyimpan:

1. Role domain: `UMKM`, `KREATOR`, atau `ADMIN`.
2. Nama lengkap.
3. Nomor WhatsApp.
4. Foto profil.
5. Bio.
6. Niche.
7. Saldo domain.
8. Status verifikasi domain.
9. Metadata onboarding.
10. Timestamp domain.

`profiles` tidak menyimpan:

1. Password.
2. Password hash.
3. Refresh token.
4. API key.
5. Payment secret.
6. Midtrans server key.
7. Service account credential.
8. Session cookie.
9. Private key.
10. OTP raw value.

---

## 5. Database Boundary

Appwrite Database menyimpan data bisnis Marketiv.
Semua data yang dibutuhkan dashboard harus berasal dari Database atau response Function yang membaca Database.
Database tidak boleh menjadi tempat penyimpanan file binary besar.
Database tidak boleh menjadi tempat pemrosesan business rule kompleks sendirian.
Business rule kompleks harus di-handle oleh Appwrite Functions atau backend API.

Database menyimpan:

1. `profiles`.
2. `campaigns`.
3. `campaign_claims`.
4. `campaign_submissions`.
5. `creator_rate_cards`.
6. `rate_card_orders`.
7. `messages`.
8. `transactions`.
9. `withdrawals`.
10. `disputes`.
11. `notifications`.
12. `audit_logs`.

---

## 6. Storage Boundary

Storage hanya digunakan untuk file ringan.
Storage tidak boleh digunakan untuk video mentah campaign.
Storage tidak boleh digunakan untuk video final kreator.
Storage boleh digunakan untuk aset visual yang ukuran dan aksesnya terkontrol.

Allowed file di Storage:

1. Foto profil user.
2. Logo UMKM.
3. Foto produk.
4. Thumbnail campaign.
5. Bukti gambar pendukung dispute.
6. Avatar default custom.
7. Ilustrasi dashboard internal.
8. Dokumen laporan kecil jika nanti diperlukan.

Not allowed di Storage:

1. Video mentah UMKM.
2. Video final kreator.
3. File arsip besar.
4. File yang mengandung payment secret.
5. Dokumen identitas sensitif tanpa kebutuhan legal.
6. Backup database.
7. Export audit rahasia publik.
8. API key.
9. File yang melebihi batas MVP.
10. File tidak tervalidasi.

---

## 7. External URL Boundary

Video dan aset besar menggunakan URL eksternal.
UMKM bertanggung jawab mengunggah file besar ke Google Drive atau Dropbox.
Kreator bertanggung jawab memposting hasil video ke TikTok atau Instagram.
Marketiv hanya menyimpan URL dan metadata.

External URL digunakan untuk:

1. Aset video mentah UMKM.
2. Folder Google Drive campaign.
3. Dropbox link campaign.
4. URL TikTok bukti tayang.
5. URL Instagram Reels bukti tayang.
6. URL Collab Post Rate Card.
7. Portfolio kreator jika berbasis social media.
8. Referensi campaign jika diperlukan.

---

## 8. Functions Boundary

Appwrite Functions adalah layer backend terpercaya.
Operasi sensitif harus melewati Functions.
Frontend tidak boleh menulis langsung untuk operasi sensitif.

Functions wajib untuk:

1. Register profile setelah Auth signup.
2. Create campaign draft jika perlu validasi kompleks.
3. Activate campaign setelah payment webhook valid.
4. Claim campaign dengan cek kuota atomik secara aplikasi.
5. Submit campaign proof dengan validasi URL.
6. Validate submission oleh admin.
7. Create Midtrans transaction.
8. Receive Midtrans webhook.
9. Release payout.
10. Create withdrawal request.
11. Process withdrawal.
12. Resolve dispute.
13. Update dompet_saldo.
14. Create transaction ledger.
15. Create audit logs.

Functions tidak digunakan untuk:

1. Render UI.
2. Menyimpan state lokal frontend.
3. Query list sederhana yang aman dibaca langsung.
4. Manipulasi visual.
5. Menggantikan semua index database.

---

## 9. Realtime Boundary

Realtime digunakan untuk interaksi yang butuh update cepat.
Realtime bukan source of truth payment.
Realtime tidak boleh menjadi satu-satunya mekanisme validasi status uang.

Realtime digunakan untuk:

1. Chat Rate Card Mode.
2. Pesan baru di order tertentu.
3. Notification ringan.
4. Update status order setelah backend menulis database.
5. Update status submission setelah admin validasi.
6. Badge unread chat.
7. Badge unread notification.

Realtime tidak digunakan untuk:

1. Membuktikan payment sukses.
2. Mengubah saldo.
3. Mengubah status escrow langsung dari client.
4. Validasi fraud utama.
5. Menjalankan cron finansial.
6. Menyimpan pesan Campaign Mode.

---

## 10. Naming Convention Appwrite

### 10.1 Database

```txt
marketiv_main
```

### 10.2 Collections

Gunakan snake_case plural.

```txt
profiles
campaigns
campaign_claims
campaign_submissions
creator_rate_cards
rate_card_orders
messages
transactions
withdrawals
disputes
notifications
audit_logs
```

### 10.3 Functions

Gunakan kebab-case berbasis action.

```txt
create-campaign-payment
handle-midtrans-webhook
claim-campaign
submit-campaign-proof
validate-submission
create-rate-card-order
send-custom-offer
accept-custom-offer
request-withdrawal
resolve-dispute
```

### 10.4 Buckets

Gunakan snake_case.

```txt
profile_images
campaign_images
dispute_attachments
```

---

## 11. Environment Variables

Server-side variables:

```env
APPWRITE_ENDPOINT=
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=marketiv_main
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
OPENAI_API_KEY=
```

Client-side variables:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=marketiv_main
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
```

Aturan:

1. Jangan expose `APPWRITE_API_KEY` ke frontend.
2. Jangan expose `MIDTRANS_SERVER_KEY` ke frontend.
3. Jangan expose `OPENAI_API_KEY` ke frontend.
4. Frontend hanya memakai endpoint, project ID, database ID, dan key publik yang memang aman.
5. Semua operasi admin memakai API key di Function/server.

---

## 12. Recommended Backend Architecture

```txt
Frontend Next.js
  ↓
Appwrite Web SDK untuk read aman dan realtime
  ↓
Appwrite Functions untuk mutation sensitif
  ↓
Appwrite Database sebagai source of truth
  ↓
Midtrans / OpenAI / External Services jika diperlukan
```

Layering backend:

1. Request validation.
2. Auth context extraction.
3. Role check.
4. Data read.
5. Business validation.
6. Data mutation.
7. Transaction ledger creation.
8. Audit log creation.
9. Notification creation.
10. Response DTO.

---

## 13. Error Handling Standard

Setiap Function harus mengembalikan response konsisten.

```json
{
  "success": false,
  "code": "CAMPAIGN_QUOTA_FULL",
  "message": "Kuota campaign sudah penuh.",
  "details": null
}
```

Contoh error code:

1. `UNAUTHORIZED`.
2. `FORBIDDEN_ROLE`.
3. `PROFILE_NOT_FOUND`.
4. `CAMPAIGN_NOT_FOUND`.
5. `CAMPAIGN_NOT_ACTIVE`.
6. `CAMPAIGN_QUOTA_FULL`.
7. `DUPLICATE_CAMPAIGN_CLAIM`.
8. `INVALID_EXTERNAL_URL`.
9. `INVALID_SOCIAL_PROOF_URL`.
10. `RATE_CARD_LIMIT_REACHED`.
11. `PAYMENT_SIGNATURE_INVALID`.
12. `INSUFFICIENT_BALANCE`.
13. `ORDER_NOT_FOUND`.
14. `DISPUTE_ALREADY_OPEN`.
15. `INTERNAL_ERROR`.

---

## 14. Data Consistency Strategy

Appwrite tidak dipakai sebagai SQL transaction engine penuh.
Karena itu, operasi multi-step harus dilakukan hati-hati.
Untuk operasi sensitif, gunakan Function sebagai coordinator.

Contoh operasi claim campaign:

1. Function menerima request.
2. Function membaca profile kreator.
3. Function membaca campaign.
4. Function memastikan campaign aktif.
5. Function memastikan kuota belum penuh.
6. Function mencari claim existing.
7. Function membuat `campaign_claims`.
8. Function mengupdate `campaigns.kuota_terpakai`.
9. Function membuat notification.
10. Function membuat audit log.
11. Function mengembalikan DTO.

Jika step update kuota gagal setelah claim dibuat:

1. Function harus rollback manual atau mark claim sebagai cancelled.
2. Function harus membuat audit log error.
3. Function harus mengembalikan error yang aman.
4. Admin harus bisa review jika terjadi inconsistency.

---

## 15. Final Recommendation

Gunakan Appwrite Database untuk data domain.
Gunakan Appwrite Auth untuk identity.
Gunakan Appwrite Functions untuk operasi sensitif.
Gunakan Appwrite Realtime hanya untuk UI realtime, bukan validasi uang.
Gunakan Appwrite Storage secara terbatas.
Gunakan external URL untuk video dan aset besar.
Gunakan audit log untuk semua perubahan kritis.
Gunakan frontend contract agar UI dan backend tidak saling menebak field.
