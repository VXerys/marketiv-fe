# 06 — Business Rules and Validations

> Dokumen ini menjelaskan aturan bisnis Marketiv yang wajib ditegakkan oleh backend, frontend, dan QA.
> Schema saja tidak cukup; semua mutation penting harus mengikuti rules ini.

---

## 1. Prinsip Validasi

Validasi harus dilakukan di dua sisi.
Frontend melakukan validasi untuk UX cepat.
Backend/Function melakukan validasi untuk keamanan dan kebenaran data.
Validasi frontend tidak boleh dianggap cukup.
Semua rule finansial hanya boleh diputuskan oleh backend.
Semua status sensitif hanya boleh diubah oleh backend atau admin terotorisasi.
Semua action sensitif wajib punya audit log.

---

## 2. Role Validation

Setiap request mutation harus mengecek role.
Role diambil dari profile terpercaya, bukan dari payload frontend.

Rules:

1. UMKM boleh membuat campaign.
2. UMKM boleh membuat order Rate Card.
3. UMKM boleh melakukan pembayaran/deposit.
4. UMKM boleh membuka dispute untuk campaign/order miliknya.
5. Kreator boleh klaim campaign aktif.
6. Kreator boleh submit bukti tayang untuk claim miliknya.
7. Kreator boleh membuat rate card.
8. Kreator boleh request withdrawal.
9. Admin boleh validasi submission.
10. Admin finance boleh proses withdrawal.
11. Admin support boleh review dispute sesuai batas role.
12. User suspended tidak boleh melakukan mutation bisnis.

---

## 3. Profile Rules

Profile dibuat setelah Auth signup.
Satu Auth user hanya boleh punya satu profile.
`profiles.user_id` harus sama dengan Auth user ID.
Email profile harus sinkron dengan Auth email.
Role tidak boleh diubah oleh user biasa.
Saldo tidak boleh diubah oleh user biasa.
Status verifikasi tidak boleh diubah oleh user biasa.

Validation:

1. `nama_lengkap` minimal 3 karakter.
2. `email` harus valid.
3. `nomor_whatsapp` harus format nomor yang wajar.
4. `role` harus salah satu enum valid.
5. `dompet_saldo` tidak boleh negatif.
6. `niche` harus enum valid jika diisi.
7. `bio` maksimal panjang sesuai kebutuhan UI.
8. `foto_profil_url` harus URL valid jika diisi.

---

## 4. Campaign Creation Rules

Campaign hanya bisa dibuat oleh UMKM.
Campaign awal berstatus `Draft` atau `MenungguPembayaran` sesuai flow UI.
Campaign tidak boleh aktif sebelum payment valid.
Campaign harus punya brief yang cukup jelas.
Campaign harus punya aset eksternal atau aset gambar ringan.
Video mentah besar wajib memakai external URL.

Validation:

1. `judul_campaign` wajib, maksimal 200 karakter.
2. `deskripsi_brief` wajib, minimal 50 karakter.
3. `niche` wajib.
4. `harga_per_1000_views` minimal Rp 2.000.
5. `harga_per_1000_views` maksimal Rp 10.000 untuk MVP.
6. `kuota_kreator` minimal 1.
7. `kuota_kreator` maksimal 100 untuk MVP.
8. `total_budget_escrow` harus lebih besar dari 0.
9. `platform_fee_amount` untuk Campaign Mode adalah 15%.
10. `total_payment_amount = total_budget_escrow + platform_fee_amount`.
11. `asset_external_url` harus HTTPS jika diisi.
12. Upload file langsung maksimal 100MB per file.
13. Campaign tidak boleh mengandung field chat.

---

## 5. Campaign Payment Rules

Campaign payment harus dibuat oleh backend.
Midtrans server key tidak boleh berada di frontend.
Payment status hanya berubah setelah webhook atau verification valid.
Payment webhook wajib diverifikasi signature-nya.

Rules:

1. Jika payment dibuat, create `transactions` tipe `Deposit` status `Pending`.
2. Jika payment sukses, update transaction status `Escrow` atau `Success` sesuai model ledger.
3. Jika payment sukses, update `campaigns.payment_status = Paid`.
4. Jika payment sukses, update `campaigns.status = Aktif`.
5. Jika payment expired, update `payment_status = Expired`.
6. Jika payment failed, update `payment_status = Failed`.
7. Campaign tidak muncul di Job Pool sebelum payment sukses.
8. Duplicate webhook harus idempotent.
9. Webhook yang sama tidak boleh menggandakan transaction.
10. Semua webhook harus masuk `audit_logs`.

---

## 6. Campaign Claim Rules

Kreator hanya boleh klaim campaign yang aktif.
Kreator tidak boleh klaim campaign milik role UMKM sendiri jika role bukan kreator.
Satu kreator hanya boleh klaim satu kali per campaign.
Campaign tidak boleh di-claim jika kuota penuh.

Function flow wajib:

1. Cek user authenticated.
2. Cek role `KREATOR`.
3. Cek profile verified jika diwajibkan.
4. Ambil campaign.
5. Cek `status = Aktif`.
6. Cek `kuota_terpakai < kuota_kreator`.
7. Cek duplicate claim by `campaign_id + kreator_user_id`.
8. Create `campaign_claims`.
9. Increment `campaigns.kuota_terpakai`.
10. Jika kuota habis, set campaign `Penuh`.
11. Create notification untuk UMKM.
12. Create audit log.

Error code:

```txt
CAMPAIGN_NOT_FOUND
CAMPAIGN_NOT_ACTIVE
CAMPAIGN_QUOTA_FULL
DUPLICATE_CAMPAIGN_CLAIM
FORBIDDEN_ROLE
```

---

## 7. Campaign Submission Rules

Submission hanya bisa dibuat oleh kreator yang sudah klaim campaign.
Submission harus berupa URL TikTok atau Instagram publik.
Submission tidak boleh berupa upload video ke Marketiv.
Submission awal selalu `Pending`.

Validation:

1. `claim_id` valid dan milik kreator.
2. `campaign_id` sesuai claim.
3. `url_bukti_tayang` wajib HTTPS.
4. URL harus domain TikTok atau Instagram.
5. `platform` harus sesuai URL.
6. Status awal `Pending`.
7. `jumlah_views_aktual` default 0.
8. `dana_dicairkan` default 0.
9. Submission tidak boleh mengubah budget campaign.
10. Submission tidak boleh langsung mencairkan saldo.

---

## 8. Campaign Validation Rules

Validasi submission dilakukan oleh admin/reviewer atau worker backend.
Hasil validasi menentukan pencairan dana.

Rules:

1. Hanya admin/reviewer yang boleh set `Valid`, `Fraud`, `Rejected`, atau `Dispute`.
2. `jumlah_views_aktual` harus angka >= 0.
3. `dana_dicairkan` dihitung backend.
4. Dana tidak boleh melebihi budget campaign yang tersedia.
5. Jika valid, create transaction `Pencairan`.
6. Jika valid, update saldo kreator.
7. Jika fraud, dana ditahan.
8. Jika dispute, create/update dispute.
9. Semua keputusan validasi masuk audit log.
10. Kreator dan UMKM menerima notification.

---

## 9. Rate Card Rules

Rate Card hanya bisa dibuat oleh Kreator.
Kreator maksimal punya 3 rate card aktif.
Rate Card yang dipakai order tidak boleh mengubah data order existing.

Validation:

1. `nama_paket` wajib maksimal 100 karakter.
2. `harga_paket` minimal Rp 10.000.
3. `deliverable` wajib jelas.
4. `estimasi_hari` harus angka positif jika diisi.
5. `revision_limit` tidak boleh negatif.
6. `is_active` default true.
7. Jika aktif count sudah 3, create ditolak.
8. Nonaktifkan paket menggunakan `is_active = false`.

Error code:

```txt
RATE_CARD_LIMIT_REACHED
INVALID_RATE_CARD_PRICE
FORBIDDEN_ROLE
```

---

## 10. Rate Card Order Rules

Order hanya bisa dibuat oleh UMKM.
Order harus melibatkan satu UMKM dan satu Kreator.
Order awal berstatus `Negosiasi`.
Chat hanya aktif untuk order Rate Card.

Rules:

1. UMKM membuat order via Function.
2. Kreator target harus valid.
3. Jika rate_card_id dipakai, rate card harus aktif.
4. Create system message pertama.
5. Notify Kreator.
6. Order tidak punya payment sebelum Custom Offer diterima.
7. Campaign Mode tidak boleh membuat order chat.

---

## 11. Custom Offer Rules

Custom Offer adalah pesan khusus di chat Rate Card.
Hanya UMKM yang boleh mengirim Custom Offer.
Hanya Kreator yang boleh menerima atau menolak Custom Offer.

Validation:

1. Order status harus `Negosiasi`.
2. Sender harus UMKM participant.
3. Receiver harus Kreator participant.
4. `harga_final` wajib > 0.
5. `scope_pekerjaan` wajib jelas.
6. `deadline` wajib jika dibutuhkan flow.
7. `platform_fee_amount` = 10% dari harga final.
8. `total_payment_amount = harga_final + platform_fee_amount`.
9. Offer diterima mengubah order ke `MenungguPembayaran`.
10. Offer ditolak membuat message system dan tetap `Negosiasi`.

---

## 12. Rate Card Payment Rules

Payment Rate Card terjadi setelah Custom Offer diterima.
Dana masuk escrow.
Kreator tidak menerima dana sebelum order selesai dan tervalidasi.

Rules:

1. Create transaction `Deposit` atau `Escrow` untuk UMKM.
2. Payment amount = harga_final + 10% fee.
3. Webhook wajib verified.
4. Jika payment sukses, order status menjadi `Escrow`.
5. Jika payment gagal, order tetap `MenungguPembayaran` atau `Dibatalkan` sesuai flow.
6. Duplicate webhook harus idempotent.
7. Payment sukses membuat notification ke UMKM dan Kreator.
8. Payment sukses membuat audit log.

---

## 13. Collab Post Rules

Rate Card Mode wajib memakai Collab Post sesuai kontrak Marketiv.
Kreator submit URL Collab Post setelah pekerjaan selesai.

Validation:

1. URL wajib HTTPS.
2. URL harus TikTok atau Instagram sesuai scope.
3. Order harus status `Escrow` atau `MenungguVerifikasi`.
4. URL tidak boleh kosong.
5. Admin/backend validasi URL.
6. Jika valid, order bisa selesai.
7. Jika tidak valid, order bisa masuk `Revisi` atau `Dispute`.

---

## 14. Wallet and Balance Rules

Saldo kreator hanya berubah melalui transaction yang valid.
Saldo tidak boleh dihitung dari frontend.
Saldo tidak boleh diedit manual tanpa audit log.

Rules:

1. `dompet_saldo` bertambah setelah campaign submission valid.
2. `dompet_saldo` bertambah setelah Rate Card order selesai.
3. `dompet_saldo` berkurang saat withdrawal diproses sesuai policy.
4. Saldo tidak boleh negatif.
5. Semua perubahan saldo harus punya `transactions`.
6. Semua perubahan saldo harus punya `audit_logs`.
7. Adjustment manual hanya oleh admin owner/finance.

---

## 15. Withdrawal Rules

Withdrawal hanya untuk Kreator.
Withdrawal membutuhkan saldo cukup.
Withdrawal tidak boleh diproses jika ada dispute finansial kritis.

Validation:

1. User role harus `KREATOR`.
2. Nominal minimal Rp 10.000.
3. Nominal tidak boleh melebihi saldo tersedia.
4. Nama bank wajib.
5. Nomor rekening wajib.
6. Nama pemilik rekening wajib.
7. Create withdrawal status `Pending`.
8. Create transaction status `Pending`.
9. Admin finance memproses.
10. Success mengurangi saldo jika belum dikurangi saat request.
11. Failed/rejected harus rollback/restore sesuai model saldo.
12. Semua action masuk audit log.

---

## 16. Dispute Rules

Dispute dapat dibuka oleh user terkait.
Dispute harus mengacu pada reference yang valid.
Dispute tidak boleh duplicate aktif untuk reference yang sama.

Validation:

1. `reference_id` valid.
2. `reference_type` valid.
3. User adalah participant/entity owner.
4. Tidak ada dispute aktif untuk reference sama.
5. Reason wajib.
6. Description wajib.
7. Status awal `Open`.
8. Admin menangani dispute.
9. Resolusi harus masuk audit log.
10. Resolusi finansial harus membuat transaction jika ada refund/adjustment.

---

## 17. Notification Rules

Notification dibuat oleh backend/system.
Frontend hanya boleh mark as read.

Notification wajib dibuat saat:

1. Campaign payment sukses.
2. Campaign aktif.
3. Campaign diklaim kreator.
4. Submission dikirim.
5. Submission divalidasi.
6. Custom offer diterima.
7. Payment Rate Card sukses.
8. Order selesai.
9. Withdrawal sukses/gagal.
10. Dispute update.

---

## 18. Audit Log Rules

Audit log wajib untuk aksi sensitif.
Audit log tidak boleh diedit.
Audit log tidak boleh dihapus dari aplikasi biasa.

Aksi wajib audit:

1. Role change.
2. Verification change.
3. Campaign activation.
4. Payment webhook received.
5. Campaign claim.
6. Submission validation.
7. Fraud marking.
8. Payout release.
9. Balance update.
10. Withdrawal processing.
11. Dispute resolution.
12. Admin override.
13. Manual adjustment.

---

## 19. Data Validation Checklist for Backend

Setiap Function harus cek:

1. Authenticated user.
2. Profile exists.
3. Role allowed.
4. Resource exists.
5. User ownership/participant.
6. Status transition valid.
7. Payload shape valid.
8. Enum valid.
9. Money calculation valid.
10. URL valid.
11. Duplicate state prevented.
12. Permission safe.
13. Transaction ledger if money changes.
14. Notification if user-facing status changes.
15. Audit log if sensitive.

---

## 20. Status Transition Rules

Campaign:

```txt
Draft -> MenungguPembayaran -> Aktif -> Penuh -> Selesai
Draft -> Dibatalkan
MenungguPembayaran -> Dibatalkan
Aktif -> Dibatalkan
Aktif -> Dispute
Penuh -> Selesai
```

Campaign Submission:

```txt
Pending -> Valid
Pending -> Fraud
Pending -> Rejected
Pending -> Dispute
Dispute -> Valid
Dispute -> Fraud
```

Rate Card Order:

```txt
Negosiasi -> MenungguPembayaran -> Escrow -> MenungguVerifikasi -> Selesai
Negosiasi -> Dibatalkan
Escrow -> Revisi
Escrow -> Dispute
MenungguVerifikasi -> Revisi
MenungguVerifikasi -> Dispute
Dispute -> Selesai
Dispute -> Dibatalkan
```

Withdrawal:

```txt
Pending -> Processing -> Success
Pending -> Rejected
Processing -> Failed
Failed -> Pending if retried by admin
```

---

## 21. Final Rule

Jika sebuah operasi mengubah uang, status escrow, status validasi, role, atau permission, operasi itu wajib lewat backend dan wajib membuat audit log.
Jika sebuah flow membuat chat di Campaign Mode, flow itu salah dan harus ditolak.
