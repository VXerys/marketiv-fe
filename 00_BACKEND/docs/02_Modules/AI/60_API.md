# AI — API

Kontrak Appwrite Function untuk fitur AI. Semua server-side. Aturan input/output & threshold di `30_Business_Rules.md`.

---

## AI Brief

```text
POST /functions/ai-brief
```

- **Input**: `{ campaignId }`
- **Return**: `{ brief }` — brief terstruktur (objective, content angle, CTA, detail, do & don't).
- **Efek**: hasil dapat disimpan ke `campaign_briefs` (lihat `../Campaigns/50_Database.md`).

---

## Fraud Detection

```text
POST /functions/fraud-detection
```

- **Input**: `{ submissionId }`
- **Return**: `{ score, status }` — `score` 0–100, `status` `safe|review|rejected`.
- **Efek**: tulis `fraud_checks` + update `fraudScore`/`fraudStatus` pada submission (data di modul Campaigns).
- **Trigger**: dipanggil otomatis oleh event **Submission Created** — lihat `../Campaigns/90_Events.md`.

---

## ai_requests

Log permintaan AI (Brief, Fraud, Landing). Relasi: User (1) → AI Requests (N).

| Attribute | Type   | Required | Catatan                          |
| --------- | ------ | -------- | -------------------------------- |
| userId    | string | yes      | FK → users                       |
| feature   | enum   | yes      | mis. `brief`, `fraud`, `landing` |
| prompt    | string | yes      | input yang dikirim ke model      |
| response  | string | no       | output model                     |

**Index**: `userId`, `feature`, `createdAt DESC`.

**Permission**: Owner read · System write.
