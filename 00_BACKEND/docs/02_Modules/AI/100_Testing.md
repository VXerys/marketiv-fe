# AI — Testing

Catatan: Module AI tidak punya service layer frontend. Semua logic berjalan di Appwrite Functions (`ai-brief`, `ai-fraud-precheck`). Test dilakukan di level integration function dan melalui `campaign.service.ts` `generateBrief()`.

## Brief Generator (`ai-brief` Function + `generateBrief()` Service)

- Input valid (`campaignId`, `description`, `type`, `materials[]`) → brief terstruktur dengan field: `objective`, `contentAngle`, `cta`, `briefDetail`, `doAndDont { do, dont }`.
- `generateBrief()` dengan `campaignId` kosong → throw `CampaignServiceError('validation', 'Campaign ID wajib diisi.')`.
- `generateBrief()` dengan `description` kosong → throw `CampaignServiceError('validation', 'Deskripsi wajib diisi.')`.
- `generateBrief()` dengan `type` invalid → throw `CampaignServiceError('validation', 'Tipe campaign tidak valid.')`.
- Function `ai-brief` gagal (`execution.status === 'failed'`) → throw `CampaignServiceError('server', 'Gagal menghasilkan brief via AI.')`.
- Response kosong → throw `CampaignServiceError('server', 'Response AI kosong.')`.
- Response JSON invalid → throw `CampaignServiceError('server', 'Response AI tidak valid.')`.
- `result.success === false` → throw `CampaignServiceError('server', result.error)`.
- Response time dalam batas wajar (< 10 detik).

## Fraud Detection (`ai-fraud-precheck` Function)

Catatan: Function dipicu otomatis oleh event `campaign_submissions.create` (bukan dipanggil langsung dari frontend).

- Submission dengan URL valid & unik (TikTok, platform cocok) → `fraudScore` rendah (0–30), status `safe`.
- Submission dengan URL tidak valid (bukan TikTok) → `fraudScore` tinggi (71–100), status `rejected`.
- Submission duplikat (URL sama dengan submission lain) → terdeteksi sebagai duplikat, status `rejected`.
- Submission dengan platform tidak cocok → terdeteksi, status `rejected`.
- `fraudScore` & `fraudStatus` ditulis ke `campaign_submissions` + riwayat ke `fraud_checks`.
- Fraud check berjalan otomatis saat submission dibuat (event-driven).
