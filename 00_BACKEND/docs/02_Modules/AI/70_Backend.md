# AI — Backend

Dokumen ini khusus untuk Appwrite Functions AI dan aturan integrasinya. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Functions

### 1. `ai-brief` (Brief Generator)

- **Platform**: Appwrite Function (Runtime: Node.js)
- **Proses**: terima `{ campaignId, description, type, materials[] }` → ambil data campaign & aset digital → kirim ke Gemini API dengan instruksi khusus tipe (`ugc`/`clipping`) dan referensi aset → kembalikan brief terstruktur.
- **AI Model**: Gemini API (model default untuk text generation, misal `gemini-2.5-flash`).
- **Structured Output**: gunakan JSON schema atau prompt instruction agar output sesuai format `campaign_briefs` dan mengarahkan penggunaan aset digital tanpa sampel fisik.

### ai-fraud-precheck

- **Trigger**: Database event `campaign_submissions.create`.
- **Proses**: terima `submissionId` → validasi URL, duplikasi, platform → content analysis (text-based) via Gemini API → hitung `fraudScore` → tulis `fraud_checks` + update submission.
- **Output**: `{ score, status }`.
- **Catatan**: Content analysis MVP hanya memproses caption & hashtag (teks). Analisis visual video adalah future scope.

## Integrasi Eksternal

- **Gemini API** — satu-satunya integrasi eksternal. API key disimpan sebagai environment variable Appwrite Function.
