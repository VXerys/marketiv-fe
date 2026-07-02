# Campaigns — Backend

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

## Aturan Validasi Backend

- Unique constraint `campaignId + creatorId` pada claim (backend validation).
- Cek `status = active`, `isProfileCompleted = true`, `totalClaims < claimLimit`.
