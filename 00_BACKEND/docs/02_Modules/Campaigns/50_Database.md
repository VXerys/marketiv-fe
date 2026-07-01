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
| platforms            | string[] | yes      | mis. `["tiktok","instagram"]`             |
| description          | string   | no       |                                           |
| budget               | integer  | yes      |                                           |
| rewardPer1000Views   | integer  | yes      | basis perhitungan reward (CPM)            |
| minViews             | integer  | no       |                                           |
| maxViews             | integer  | no       |                                           |
| brief                | string   | no       | brief tersimpan (lihat `campaign_briefs`) |
| status               | enum     | yes      | `draft\|active\|paused\|completed`        |
| claimLimit           | integer  | yes      | batas jumlah claim                        |
| totalClaims          | integer  | yes      | denormalisasi (ADR-005)                   |
| spentAmount          | integer  | yes      | denormalisasi (ADR-005)                   |
| remainingBudget      | integer  | yes      | denormalisasi (ADR-005)                   |
| publishedAt          | datetime | no       |                                           |

**Index**: `umkmId`, `status`, `category`, `publishedAt DESC`, `remainingBudget`.

**Permission**: Public read · Owner write · Admin full access.

---

## campaign_assets

Satu campaign dapat memiliki banyak asset. Relasi: Campaign (1) → Assets (N).

| Attribute  | Type   | Required | Catatan                |
| ---------- | ------ | -------- | ---------------------- |
| campaignId | string | yes      | FK → campaigns         |
| type       | enum   | yes      | mis. `video`, `image`  |
| fileUrl    | string | yes      | disimpan via Storage   |
| fileName   | string | no       |                        |

**Index**: `campaignId`.

**Permission**: Campaign owner write · Public read.

---

## campaign_briefs

Brief campaign (hasil AI Brief Generator atau input manual UMKM). Relasi: Campaign (1) → Brief.

| Attribute         | Type    | Required | Catatan                          |
| ----------------- | ------- | -------- | -------------------------------- |
| campaignId        | string  | yes      | FK → campaigns                   |
| targetAudience    | string  | no       |                                  |
| goal              | string  | no       | tujuan / objective campaign      |
| cta               | string  | no       | call to action                   |
| requiredElements  | string  | no       | elemen wajib konten              |
| captionRequired   | boolean | no       |                                  |
| hashtags          | string  | no       |                                  |
| allowedContent    | string  | no       | do (boleh dilakukan)             |
| forbiddenContent  | string  | no       | don't (tidak boleh)              |
| materialsJson     | string  | no       | material referensi (JSON)        |
| generatedByAi     | boolean | yes      | `true` bila dihasilkan AI        |

**Index**: `campaignId`.

**Permission**: Campaign owner write · Public read.

> Kontrak fungsi AI yang mengisi brief ini ada di `../AI/60_API.md`.

---

## campaign_claims

Creator mengambil campaign. Relasi: Campaign (1) → Claims (N); Creator (1) → Claims (N).

| Attribute  | Type     | Required | Catatan                                |
| ---------- | -------- | -------- | -------------------------------------- |
| campaignId | string   | yes      | FK → campaigns                         |
| creatorId  | string   | yes      | FK → users                             |
| status     | enum     | yes      | `claimed\|submitted\|approved\|rejected` |
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
| platform    | enum    | yes      | mis. `tiktok`                    |
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
