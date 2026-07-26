# Campaigns — Database

Sumber kebenaran skema untuk koleksi milik modul Campaigns. Satu fakta = satu lokasi; koleksi lain ditautkan, tidak diduplikasi.

> Catatan keputusan:
> - **ADR-004** — `fraud_checks` dipisah dari `campaign_submissions` (riwayat fraud + ekspansi Phase 2 seperti Computer Vision / Logo Detection). Lihat `../../04_Decisions/`.
> - **ADR-005** — counter denormalisasi pada `campaigns` (`totalClaims`, `spentAmount`, `remainingBudget`). Lihat `../../04_Decisions/`.

---

## campaigns

Koleksi terbesar MVP. Relasi: UMKM (1) → Campaign (N).

| Attribute            | Type     | Required | Catatan                                   |
| -------------------- | -------- | -------- | ----------------------------------------- |
| umkmId               | string   | yes      | FK → users                                |
| title                | string   | yes      |                                           |
| category             | string   | yes      |                                           |
| type                 | enum     | yes      | `ugc\|clipping` (tipe kreasi konten)      |
| platforms            | string[] | yes      | MVP hanya `["tiktok"]`; platform lain future scope |
| description          | string   | no       |                                           |
| budget               | integer  | yes      | minimal Rp50.000 (validasi backend)       |
| rewardPer1000Views   | integer  | yes      | basis perhitungan reward (CPM)            |
| status               | enum     | yes      | `draft\|active\|paused\|completed`        |
| claimLimit           | integer  | yes      | batas jumlah claim                        |
| submissionDays       | integer  | yes      | batas waktu submit (hari), default 7      |
| totalClaims          | integer  | yes      | denormalisasi (ADR-005)                   |
| spentAmount          | integer  | yes      | denormalisasi (ADR-005)                   |
| remainingBudget      | integer  | yes      | denormalisasi (ADR-005)                   |
| publishedAt          | datetime | no       |                                           |

**Index**: `umkmId`, `status`, `category`, `publishedAt DESC`, `remainingBudget`.

**Permission**: Public read · Owner write · Admin full access.

---

## campaign_assets

Satu campaign dapat memiliki banyak asset. Relasi: Campaign (1) → Assets (N).

| Attribute  | Type   | Required | Catatan                                      |
| ---------- | ------ | -------- | -------------------------------------------- |
| campaignId | string | yes      | FK → campaigns                               |
| source     | enum   | yes      | `external_url` (hanya URL eksternal)         |
| type       | enum   | yes      | `image` \| `video` \| `document` \| `link`   |
| fileUrl    | string | yes      | URL eksternal (Google Drive / CDN publik)    |
| fileName   | string | no       | nama file atau label asset                   |

**Index**: `campaignId`.

**Permission**: Campaign owner write · Public read.

> Hanya `external_url` yang didukung. Upload asset menggunakan Google Drive atau layanan serupa. Tidak ada kuota penyimpanan internal. Lihat [85_Asset_Tutorial.md](85_Asset_Tutorial.md) untuk panduan.

---

## campaign_briefs

Brief campaign (hasil AI Brief Generator atau input manual UMKM). Relasi: Campaign (1) → Brief (1).

| Attribute      | Type    | Required | Catatan                                                                 |
| -------------- | ------- | -------- | ----------------------------------------------------------------------- |
| campaignId     | string  | yes      | FK → campaigns                                                          |
| objective      | string  | no       | tujuan kreatif campaign (output AI: `objective`)                        |
| contentAngle   | string  | no       | arah/format konten; berbeda antara `ugc` dan `clipping` (output AI: `contentAngle`) |
| cta            | string  | no       | call to action (output AI: `cta`)                                       |
| briefDetail    | string  | no       | arahan kreatif lengkap, termasuk penggunaan aset digital (output AI: `briefDetail`) |
| doAndDont      | string  | no       | JSON: `{ do: string[], dont: string[] }` (output AI: `doAndDont`)       |
| materialsJson  | string  | no       | referensi aset produk dari `campaign_assets` yang dipakai saat generate |
| generatedByAi  | boolean | yes      | `true` bila dihasilkan AI Brief Generator                               |

**Index**: `campaignId`.

**Permission**: Campaign owner write · Public read.

> Field-field di atas merupakan pemetaan 1-to-1 dari output AI di `../AI/30_Business_Rules.md`. Kontrak fungsi AI ada di `../AI/60_API.md`.

---

## campaign_claims

Creator mengambil campaign. Relasi: Campaign (1) → Claims (N); Creator (1) → Claims (N).

| Attribute  | Type     | Required | Catatan                                |
| ---------- | -------- | -------- | -------------------------------------- |
| campaignId | string   | yes      | FK → campaigns                         |
| creatorId  | string   | yes      | FK → users                             |
| status     | enum     | yes      | `claimed\|submitted\|approved\|rejected\|expired` |
| claimedAt  | datetime | yes      |                                        |

**Index**: `campaignId`, `creatorId`, `status`, `claimedAt DESC`.

**Unique constraint (backend)**: `campaignId + creatorId` harus unik — satu creator tidak boleh claim campaign yang sama berkali-kali.

**Permission**: Creator create · Creator read own · Campaign owner read.

---

## campaign_submissions

Konten yang dikirim creator. Dipakai AI Fraud Detection. Relasi: Claim (1) → Submission (1).

| Attribute   | Type    | Required | Catatan                          |
| ----------- | ------- | -------- | -------------------------------- |
| claimId     | string  | yes      | FK → campaign_claims             |
| campaignId  | string  | yes      | FK → campaigns                   |
| creatorId   | string  | yes      | FK → users                       |
| platform    | enum    | yes      | MVP hanya `tiktok`               |
| postUrl     | string  | yes      | URL konten                       |
| caption     | string  | no       |                                  |
| views       | integer | yes      | basis perhitungan reward         |
| engagement  | integer | no       |                                  |
| fraudScore  | integer | no       | 0–100 (hasil AI Fraud Detection) |
| fraudStatus | enum    | no       | `safe\|review\|rejected`         |
| status      | enum    | yes      | `pending\|approved\|rejected`    |

**Index**: `claimId`, `creatorId`, `campaignId`, `status`, `fraudStatus`.

**Permission**: Creator create · Creator read own · UMKM read.

> `fraudScore` & `fraudStatus` adalah ringkasan hasil fraud terbaru pada submission. Riwayat detail per-check disimpan di `fraud_checks` (di bawah).

---

## fraud_checks

Riwayat hasil AI Fraud Detection, dipisah dari submission (ADR-004). Relasi: Submission (1) → Fraud Checks (N).

| Attribute     | Type     | Required | Catatan                              |
| ------------- | -------- | -------- | ------------------------------------ |
| submissionId  | string   | yes      | FK → campaign_submissions            |
| score         | integer  | yes      | 0–100                                |
| result        | enum     | yes      | `safe\|review\|rejected`             |
| reason        | string   | no       | alasan / daftar validasi yang gagal  |

**Index**: `submissionId`, `result`, `createdAt DESC`.

**Permission**: System write · UMKM/Admin read.

> Logika validasi & ambang batas yang menghasilkan `score`/`result` didefinisikan di `../AI/30_Business_Rules.md`. Modul AI menautkan ke koleksi ini, tidak mendefinisikan ulang field-nya.
