# AI — API

Fungsi AI berjalan server-side di Appwrite Cloud. Tidak ada service layer yang dipanggil langsung dari frontend.

## Service Layer (Client SDK)

Module ini tidak memiliki service layer functions.

---

## Appwrite Functions (Server-side)

Fungsi-fungsi berikut di-deploy ke **Appwrite Cloud**. Aturan input/output & threshold di `30_Business_Rules.md`.

---

### `ai-brief` — [Appwrite Function]

**Endpoint**: `POST /functions/ai-brief`

- **Input**: `{ campaignId, description, type, materials[] }`
- **Return**: `{ brief }` — brief terstruktur (objective, content angle, CTA, detail, do & don't).
- **Efek**: hasil dapat disimpan ke `campaign_briefs` (lihat `../Campaigns/50_Database.md`).
- **Pemanggil**: dipanggil oleh service layer `generateBrief()` dari modul **Campaigns**.

### `ai-fraud-precheck` — [Appwrite Function]

**Endpoint**: `POST /functions/ai-fraud-precheck`

- **Input**: `{ submissionId }`
- **Return**: `{ score, status }` — `score` 0–100, `status` `safe|review|rejected`.
- **Efek**: tulis `fraud_checks` + update `fraudScore`/`fraudStatus` pada submission (data di modul Campaigns).
- **Trigger**: dipicu otomatis oleh event **Submission Created** (`campaign_submissions.create`) — lihat `../Campaigns/90_Events.md`.
- **Internal Gemini call**: Function memanggil Gemini API untuk content analysis. Detail input/output kontrak Gemini ada di `30_Business_Rules.md`.

---

### `ai_requests`

Log permintaan AI (Brief, Fraud, Landing). Relasi: User (1) → AI Requests (N).

| Attribute | Type   | Required | Catatan                          |
| --------- | ------ | -------- | -------------------------------- |
| userId    | string | yes      | FK → users                       |
| feature   | enum   | yes      | mis. `brief`, `fraud`, `landing` |
| prompt    | string | yes      | input yang dikirim ke model      |
| response  | string | no       | output model                     |

**Index**: `userId`, `feature`, `createdAt DESC`.

**Permission**: Owner read · System write.

---

## Lihat Juga

- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi & threshold
- [Campaigns/90_Events.md](../Campaigns/90_Events.md) — event trigger flow
