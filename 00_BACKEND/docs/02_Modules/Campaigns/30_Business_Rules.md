# Campaigns — Business Rules

## Status Campaign

`draft | active | paused | completed`

- Campaign dibuat dengan status `draft`.
- Publish mengubah `draft` → `active` (memicu event Campaign Published).
- `paused` menghentikan sementara visibilitas/claim; `completed` saat budget habis atau campaign ditutup.

## Aturan Claim

- **Unik**: satu creator hanya boleh claim sebuah campaign satu kali — kombinasi `campaignId + creatorId` harus unik (divalidasi di backend).
- **Profil lengkap**: creator wajib `isProfileCompleted = true`.
- **Campaign aktif**: campaign harus berstatus `active`.
- **Claim limit**: jumlah claim tidak boleh melebihi `claimLimit` campaign (First Come First Serve).

Status claim: `claimed | submitted | approved | rejected`.

## Aturan Submission

Status submission: `pending | approved | rejected`.

- Submission dibuat dengan status `pending` dan langsung memicu AI Fraud Detection (lihat `90_Events.md`).
- Submission terhubung 1—1 dengan claim (`claimId`).
- UMKM mereview submission `pending` lalu approve atau reject.

## Aturan Fraud

Status fraud (`fraudStatus` pada submission / `result` pada fraud_checks): `safe | review | rejected`.

Ambang batas berdasarkan `fraudScore` (0–100):

| Skor    | Risiko  | Status   | Aksi          |
| ------- | ------- | -------- | ------------- |
| 0–30    | Low     | `safe`   | Auto-approve  |
| 31–70   | Medium  | `review` | Manual review |
| 71–100  | High    | `rejected` | Auto-reject |

Definisi validasi fraud & kontrak fungsi ada di modul `../AI/30_Business_Rules.md`; data hasilnya disimpan pada `campaign_submissions` & `fraud_checks` (lihat `50_Database.md`).

## Rumus Reward

```text
reward = (views / 1000) × rewardPer1000Views
```

Reward dihitung saat submission di-approve dan masuk ke **pending balance** wallet creator (lihat modul Wallet).

## Data Denormalisasi

Pada `campaigns` disimpan counter denormalisasi agar dashboard cepat (tidak perlu agregasi runtime):

- `totalClaims` — jumlah claim aktif.
- `spentAmount` — total reward yang sudah dikeluarkan.
- `remainingBudget` — sisa budget = `budget − spentAmount`.

Lihat ADR-005 (denormalized counters) di `../../04_Decisions/`.
