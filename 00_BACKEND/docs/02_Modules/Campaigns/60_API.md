# Campaigns — API

Kontrak service modul Campaigns. Skema data ada di `50_Database.md`; aturan validasi di `30_Business_Rules.md`. Semua dijalankan via Appwrite SDK (Database/Functions).

---

## Campaign Service

Dimiliki UMKM. Inti alur PPV.

### createCampaign()

- **Input**: `{ title, category, platforms[], budget, rewardPer1000Views, minViews?, maxViews?, claimLimit }`
- **Proses**: buat dokumen `campaigns` dengan `status = draft`.
- **Akses**: UMKM (owner).

### generateBrief()

- **Input**: `{ campaignId, description, materials[] }`
- **Proses**: panggil AI Function → tulis ke `campaign_briefs`. Brief dapat diedit & disimpan ulang.
- **Akses**: UMKM (owner). Kontrak fungsi AI di `../AI/60_API.md`.

### publishCampaign()

- **Input**: `{ campaignId }`
- **Proses**: `status: draft → active`, set `publishedAt`. Memicu event Campaign Published (lihat `90_Events.md`).
- **Akses**: UMKM (owner).

### getCampaigns(filter)

- **Input**: `{ platform?, category?, sort? }` (mis. `sort=latest`).
- **Proses**: query job board, default `status = active ORDER BY publishedAt DESC`.
- **Akses**: Public.

### getCampaignById()

- **Input**: `{ campaignId }`
- **Proses**: detail satu campaign + asset + brief.
- **Akses**: Public.

---

## Claim Service

Dimiliki Creator.

### claimCampaign()

- **Input**: `{ campaignId }` (creatorId dari sesi).
- **Validasi** (lihat `30_Business_Rules.md`):
  - Already claimed? — kombinasi `campaignId + creatorId` belum ada.
  - Campaign active? — `status = active`.
  - Profile complete? — `isProfileCompleted = true`.
  - Claim limit belum terlampaui (`totalClaims < claimLimit`).
- **Proses**: buat dokumen `campaign_claims` (`status = claimed`). Memicu event Campaign Claimed.
- **Akses**: Creator.

---

## Submission Service

### createSubmission()

- **Input**: `{ claimId, campaignId, platform, postUrl, caption?, views, engagement? }`
- **Proses**: buat `campaign_submissions` (`status = pending`). Memicu event Submission Created → AI Fraud (lihat `90_Events.md`).
- **Akses**: Creator (owner claim).

### getMySubmissions()

- **Input**: (creatorId dari sesi).
- **Proses**: list submission milik creator.
- **Akses**: Creator (read own).

### approveSubmission()

- **Input**: `{ submissionId }`
- **Proses**: `status: pending → approved`. Memicu reward calculation → pending balance wallet creator (lihat `90_Events.md`).
- **Akses**: UMKM (owner campaign).

### rejectSubmission()

- **Input**: `{ submissionId, reason? }`
- **Proses**: `status: pending → rejected`.
- **Akses**: UMKM (owner campaign).
