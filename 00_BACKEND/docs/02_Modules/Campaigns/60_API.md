# Campaigns — API

## Service Layer (Client SDK)

Fungsi-fungsi berikut dipanggil langsung dari frontend Next.js via **Appwrite Client SDK (Database, Storage)**. Berjalan di browser user.

---

### Campaign Service

Dimiliki UMKM. Inti alur PPV.

#### `createCampaign()` — [Client SDK]

- **Input**: `{ title, category, type, platforms[], budget, rewardPer1000Views, claimLimit, submissionDays? }`
- **Validasi MVP**:
  - `type` wajib `ugc` atau `clipping`.
  - `platforms[]` hanya boleh berisi `"tiktok"`. Instagram, Facebook, YouTube, dan platform lain ditolak sampai fase ekspansi multi-platform.
  - **`budget` minimal Rp50.000** — nilai < 50000 ditolak.
  - **`claimLimit`** wajib diisi dan > 0.
- **Proses**: buat dokumen `campaigns` dengan `status = draft`.
- **Akses**: UMKM (owner).
- **Catatan UI** — form input disederhanakan untuk UMKM:
  - `rewardPer1000Views` ditampilkan sebagai **radio button**: Rp1.000 / Rp2.000 / Rp3.000 / Rp5.000 dengan label "Penghasilan kreator per 1.000 tayangan".
  - `claimLimit` ditampilkan sebagai **"Jumlah kreator"**.
  - `minViews` dan `maxViews` tidak ditampilkan di form utama (tersedia sebagai pengaturan lanjutan jika diperlukan).
  - Ringkasan otomatis: budget, fee, total bayar, dan contoh penghasilan kreator.

#### `generateBrief()` — [Client SDK] *(memanggil Appwrite Function `ai-brief` di belakang)*

- **Input**: `{ campaignId, description, type, materials[] }`
- **Proses**: panggil AI Function → tulis ke `campaign_briefs`. Brief dapat diedit & disimpan ulang.
- **Akses**: UMKM (owner). Kontrak fungsi AI di `../AI/60_API.md`.

#### `publishCampaign()` — [Client SDK]

- **Input**: `{ campaignId }`
- **Proses**: `status: draft → active`, set `publishedAt`. Memicu event Campaign Published (lihat `90_Events.md`).
- **Akses**: UMKM (owner).

#### `topUpCampaign()` — [Client SDK]

- **Input**: `{ campaignId, snapToken? }`
- **Proses**: Buat payment dengan `purpose = campaign`, amount = `budget`, total = `budget + floor(budget × 5%)`. Redirect ke Midtrans Snap.
- **Validasi**:
  - Campaign harus milik UMKM yang sama.
  - Campaign harus `draft` — hanya bisa top-up sebelum publish (atau saat masih draft).
  - `remainingBudget` harus 0 (belum pernah di-top-up sebelumnya).
- **Akses**: UMKM (owner campaign).
- **Catatan**: Function `midtrans-webhook` akan memproses konfirmasi pembayaran dan meng-update status campaign menjadi siap publish.

#### `getCampaigns(filter)` — [Client SDK]

- **Input**: `{ platform?, category?, sort? }` (mis. `sort=latest`). Pada MVP, `platform` hanya `tiktok`.
- **Proses**: query job board, default `status = active ORDER BY publishedAt DESC`.
- **Akses**: Public.

#### `getCampaignById()` — [Client SDK]

- **Input**: `{ campaignId }`
- **Proses**: detail satu campaign + asset + brief.
- **Akses**: Public.

#### `addCampaignAsset()` — [Client SDK]

- **Input**: `{ campaignId, type, fileUrl, fileName? }`
- **Validasi**:
  - `fileUrl` wajib URL `https://`.
  - Hanya owner campaign yang boleh menambah asset.
- **Proses**: buat dokumen `campaign_assets` dengan `source: 'external_url'`.
- **Akses**: UMKM (owner campaign).

#### `removeCampaignAsset()` — [Client SDK]

- **Input**: `{ assetId }`
- **Proses**: hapus dokumen `campaign_assets`.
- **Akses**: UMKM (owner campaign).

---

### Claim Service

Dimiliki Creator.

#### `claimCampaign()` — [Client SDK]

- **Input**: `{ campaignId }` (creatorId dari sesi).
- **Validasi** (lihat `30_Business_Rules.md`):
  - Already claimed? — kombinasi `campaignId + creatorId` belum ada.
  - Campaign active? — `status = active`.
  - Profile complete? — `isProfileCompleted = true`.
  - Claim limit belum terlampaui (`totalClaims < claimLimit`).
- **Proses**: buat dokumen `campaign_claims` (`status = claimed`). Memicu event Campaign Claimed.
- **Akses**: Creator.

---

### Submission Service

#### `createSubmission()` — [Client SDK]

- **Input**: `{ claimId, campaignId, platform, postUrl, caption?, views, engagement? }`
- **Validasi MVP**: `platform` wajib `tiktok` dan `postUrl` harus URL TikTok yang valid.
- **Proses**: buat `campaign_submissions` (`status = pending`). Memicu event Submission Created → AI Fraud (lihat `90_Events.md`).
- **Akses**: Creator (owner claim).

#### `getMySubmissions()` — [Client SDK]

- **Input**: (creatorId dari sesi).
- **Proses**: list submission milik creator.
- **Akses**: Creator (read own).

#### `approveSubmission()` — [Client SDK]

- **Input**: `{ submissionId }`
- **Proses**: `status: pending → approved`. Memicu event Submission Approved → reward calculation (lihat `90_Events.md`).
- **Akses**: UMKM (owner campaign).

#### `rejectSubmission()` — [Client SDK]

- **Input**: `{ submissionId, reason? }`
- **Proses**: `status: pending → rejected`.
- **Akses**: UMKM (owner campaign).

---

## Appwrite Functions (Server-side)

Fungsi-fungsi berikut di-deploy ke **Appwrite Cloud** dan dipicu oleh **event database**. Tidak dipanggil langsung dari frontend. Detail lebih lanjut di `70_Backend.md` dan `90_Events.md`.

---

### `campaign-published` — [Appwrite Function]

- **Trigger**: `campaigns.status` `draft → active`.
- **Aksi**: set `publishedAt`, kirim notifikasi ke creator eligible.

### `campaign-claimed` — [Appwrite Function]

- **Trigger**: `campaign_claims.create`.
- **Aksi**: validasi claim limit & duplikasi, update `totalClaims`, notifikasi UMKM.

### `ai-fraud-precheck` — [Appwrite Function]

- **Trigger**: `campaign_submissions.create`.
- **Aksi**: jalankan validasi & AI fraud detection (Gemini via modul AI), tulis hasil ke `fraud_checks` & update submission.

### `calculate-campaign-reward` — [Appwrite Function]

- **Trigger**: `campaign_submissions.status` `pending → approved`.
- **Aksi**: hitung reward (`views/1000 × rewardPer1000Views`), update `spentAmount` & `remainingBudget`, buat transaksi ke pending balance wallet creator.

---

## Lihat Juga

- [50_Database.md](50_Database.md) — skema data
- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi
- [70_Backend.md](70_Backend.md) — detail Appwrite Functions
- [90_Events.md](90_Events.md) — event trigger flow
