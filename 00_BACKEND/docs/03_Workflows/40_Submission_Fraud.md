# Workflow: Submission Fraud Check

## Purpose

Saat submission campaign masuk, `ai-fraud-precheck` menghitung risk score dan merutekan submission: auto-approve, antrian review manual, atau auto-reject — sebelum UMKM mengambil keputusan akhir.

## Modules Involved

- [Campaigns](../02_Modules/Campaigns/00_Index.md) — submission & status.
- [AI](../02_Modules/AI/00_Index.md) — analisis fraud & risk score.
- Admin — review antrian risk medium (lihat [50_Withdrawal.md](50_Withdrawal.md) untuk pola review admin serupa).

## Trigger

Event `submissions.create` (creator submit hasil campaign).

## Step-by-step Flow

1. **Campaigns** — Submission dibuat (platform, username, URL, caption/views).
2. **Event `submissions.create`** memicu function `ai-fraud-precheck`.
3. **AI** — Validasi link → ambil metadata video → analisis pola (duplicate, logo, asset similarity, fraud signal) → hitung risk score.
4. **AI** — Tulis `fraud_checks` (`submissionId`, `score`, `status`, `reason[]`).
5. **Routing berdasarkan score:**
   - **0–30 (Low Risk)** → **Auto Approve** → lanjut ke reward (lihat [20_Campaign_PPV.md](20_Campaign_PPV.md) langkah reward).
   - **31–70 (Medium Risk)** → **Manual Review** → masuk Fraud Queue Admin.
   - **71–100 (High Risk)** → **Auto Reject**.
6. **Admin (untuk 31–70)** — Review queue → keputusan: Approve / Reject / Ban Creator.
7. **Campaigns** — Status submission final; UMKM tetap dapat approve/reject submission yang lolos. Approve → memicu `calculate-campaign-reward`.

## Events / Functions

- `submissions.create` → `ai-fraud-precheck`
- `submissions.status (pending→approved)` → `calculate-campaign-reward` (downstream)
- Lihat: [`../02_Modules/AI/00_Index.md`](../02_Modules/AI/00_Index.md), [`../02_Modules/Campaigns/90_Events.md`](../02_Modules/Campaigns/90_Events.md).

## Edge Cases

- URL tidak valid → fraud check gagal/flag, masuk antrian atau reject.
- Submission duplikat (URL sama) → flag tinggi.
- Creator di-ban dari antrian fraud → submission ditolak & akun disuspend.
- Creator appeal atas auto-reject → admin review → final decision (Campaign Viral Dispute).

## Links

- [Campaigns](../02_Modules/Campaigns/00_Index.md)
- [AI](../02_Modules/AI/00_Index.md)
- [Campaign PPV workflow](20_Campaign_PPV.md)
