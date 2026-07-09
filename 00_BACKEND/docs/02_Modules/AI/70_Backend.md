# AI — Backend

## Appwrite Functions

### ai-brief

- **Trigger**: HTTP (dipanggil dari frontend UMKM).
- **Proses**: terima `campaignId` → ambil data campaign → kirim ke OpenAI → kembalikan brief terstruktur.
- **Output**: `{ objective, contentAngle, cta, detail, doAndDont }`.

### fraud-detection

- **Trigger**: Database event `campaign_submissions.create`.
- **Proses**: terima `submissionId` → validasi URL, duplikasi, platform → hitung `fraudScore` → tulis `fraud_checks` + update submission.
- **Output**: `{ score, status }`.

## Integrasi Eksternal

- **OpenAI API** — satu-satunya integrasi eksternal. API key disimpan sebagai environment variable Appwrite Function.
