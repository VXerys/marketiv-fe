# Campaigns — Backend

Dokumen ini khusus untuk Appwrite Functions dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Functions

### campaign-published

- **Trigger**: `campaigns.status` `draft → active`.
- **Aksi**: set `publishedAt`, kirim notifikasi ke creator eligible.

### campaign-claimed

- **Trigger**: `campaign_claims.create`.
- **Aksi**: validasi claim limit & duplikasi, update `totalClaims`, notifikasi UMKM.

### ai-fraud-precheck

- **Trigger**: `campaign_submissions.create`.
- **Aksi**: panggil AI Fraud Detection, tulis hasil ke `fraud_checks` & update submission.

### calculate-campaign-reward

- **Trigger**: `campaign_submissions.status` `pending → approved`.
- **Aksi**: hitung reward, update `spentAmount` & `remainingBudget`, buat transaksi ke pending balance creator.
- **Catatan**: Fee platform sudah dipotong di awal saat top-up — tidak ada potongan lagi di sini. Creator menerima full reward sesuai rumus.

### expire-stale-claims

- **Trigger**: scheduled function (setiap 6 jam) + dipanggil di `claimCampaign()`.
- **Aksi**: query `campaign_claims` dengan `status = claimed` dan `claimedAt + submissionDays < now`.
  - Ubah status claim menjadi `expired`.
  - Kurangi `campaigns.totalClaims` untuk campaign terkait.
  - Notifikasi ke kreator: "Claim-mu expired karena melebihi batas waktu submit".

## Aturan Backend

- Unique constraint `campaignId + creatorId` pada claim (backend validation).
- Cek `status = active`, `isProfileCompleted = true`, `totalClaims < claimLimit`.
- Asset hanya mendukung `source = external_url` dengan protokol `https`.
