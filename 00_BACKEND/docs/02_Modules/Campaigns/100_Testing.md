# Campaigns — Testing

## Service Layer (`campaign.service.ts`)

### Create Campaign (`createCampaign`)

- UMKM membuat campaign dengan input valid → dokumen `campaigns` status `draft` terbuat.
- `title` kosong → throw `CampaignServiceError('validation', 'Judul wajib diisi.')`.
- `category` kosong → throw `CampaignServiceError('validation', 'Kategori wajib diisi.')`.
- `type` bukan `ugc`/`clipping` → throw `CampaignServiceError('validation', 'Tipe campaign tidak valid.')`.
- `platforms` kosong atau berisi bukan `tiktok` → throw `CampaignServiceError('validation', 'MVP hanya mendukung platform TikTok.')`.
- `budget` < `MINIMUM_CAMPAIGN_BUDGET` (Rp50.000) → throw `CampaignServiceError('validation', 'Minimum budget ...')`.
- `rewardPer1000Views` ≤ 0 → throw `CampaignServiceError('validation', 'CPM ... wajib diisi dan > 0.')`.
- `claimLimit` ≤ 0 → throw `CampaignServiceError('validation', 'Claim limit wajib diisi dan > 0.')`.
- `submissionDays` < 1 → throw `CampaignServiceError('validation', 'Batas waktu submit minimal 1 hari.')`.
- `submissionDays` undefined → default `7`.

### Generate Brief (`generateBrief`)

- Input valid (campaignId, description, type) → panggil function `ai-brief` → return `CampaignBrief` (objective, contentAngle, cta, briefDetail, doAndDont).
- `campaignId` kosong → throw `CampaignServiceError('validation', 'Campaign ID wajib diisi.')`.
- `description` kosong → throw `CampaignServiceError('validation', 'Deskripsi wajib diisi.')`.
- `type` invalid → throw `CampaignServiceError('validation', 'Tipe campaign tidak valid.')`.
- Function gagal (`execution.status === 'failed'`) → throw `CampaignServiceError('server', 'Gagal menghasilkan brief via AI.')`.
- Response kosong → throw `CampaignServiceError('server', 'Response AI kosong.')`.
- Result `success: false` → throw `CampaignServiceError('server', ...)`.

### Publish Campaign (`publishCampaign`)

- Owner publish campaign dengan `status === 'draft'` & `remainingBudget > 0` → status `active` + `publishedAt` di-set.
- Bukan owner → throw `CampaignServiceError('forbidden', 'Kamu bukan pemilik campaign ini.')`.
- Status bukan `draft` → throw `CampaignServiceError('validation', 'Hanya campaign draft yang bisa dipublish.')`.
- `remainingBudget <= 0` → throw `CampaignServiceError('validation', 'Campaign harus di-top-up terlebih dahulu.')`.

### Get Campaigns (`getCampaigns`)

- Filter `status` → query `Query.equal('status', ...)`.
- Filter `category` → query `Query.equal('category', ...)`.
- Default urut `Query.orderDesc('$createdAt')`, limit 50.

### Get Campaign By ID (`getCampaignById`)

- Campaign ID valid → return `Campaign`.
- Campaign ID kosong → throw `CampaignServiceError('validation', 'Campaign ID wajib diisi.')`.

## Claim Service Layer (`claim.service.ts`)

### Claim Campaign (`claimCampaign`)

- Creator claim campaign valid (`status === 'active'`, profil lengkap, belum pernah claim, `totalClaims < claimLimit`) → dokumen `campaign_claims` status `claimed` terbuat, `totalClaims` + 1.
- Campaign tidak aktif (`status !== 'active'`) → throw `ClaimServiceError('validation', 'Campaign tidak aktif.')`.
- `isProfileCompleted` false → throw `ClaimServiceError('validation', 'Lengkapi profil dulu sebelum claim.')`.
- Claim limit penuh (`totalClaims >= claimLimit`) → throw `ClaimServiceError('validation', 'Claim limit campaign sudah penuh.')`.
- Sudah pernah claim → throw `ClaimServiceError('validation', 'Kamu sudah claim campaign ini.')`.
- Claim expired (lebih lama dari `submissionDays`) → status diubah `expired`, `totalClaims` berkurang sebelum cek limit.
- Claim baru setelah slot kembali dari claim expired → berhasil.

## Submission Service Layer (`submission.service.ts`)

### Create Submission (`createSubmission`)

- Creator submit konten valid → dokumen `campaign_submissions` status `pending` terbuat.
- `claimId` kosong → throw `SubmissionServiceError('validation', 'Claim ID wajib diisi.')`.
- `campaignId` kosong → throw `SubmissionServiceError('validation', 'Campaign ID wajib diisi.')`.
- `platform !== 'tiktok'` → throw `SubmissionServiceError('validation', 'MVP hanya mendukung platform TikTok.')`.
- `postUrl` bukan URL TikTok valid → throw `SubmissionServiceError('validation', 'postUrl harus URL TikTok yang valid (https://*.tiktok.com).')`.
- `views` bukan integer ≥ 0 → throw `SubmissionServiceError('validation', 'Views harus angka >= 0.')`.
- Bukan pemilik claim → throw `SubmissionServiceError('forbidden', 'Kamu bukan pemilik claim ini.')`.
- `claim.campaignId !== input.campaignId` → throw `SubmissionServiceError('validation', 'Campaign tidak cocok dengan claim.')`.

### Get My Submissions (`getMySubmissions`)

- Creator login → list submission `creatorId === user.$id`, urut `Query.orderDesc('$createdAt')`.

### Approve Submission (`approveSubmission`)

- UMKM owner campaign → status `pending → approved`.
- Submission status bukan `pending` → throw `SubmissionServiceError('validation', 'Hanya submission pending yang bisa diproses.')`.
- Bukan owner campaign → throw `SubmissionServiceError('forbidden', ...)`.

### Reject Submission (`rejectSubmission`)

- UMKM owner campaign → status `pending → rejected`.
- Submission status bukan `pending` → throw `SubmissionServiceError('validation', 'Hanya submission pending yang bisa diproses.')`.

## Denormalisasi

- `totalClaims`, `spentAmount`, `remainingBudget` akurat setelah setiap aksi (dihandle Appwrite Function `calculate-campaign-reward` & `expire-stale-claims`).
