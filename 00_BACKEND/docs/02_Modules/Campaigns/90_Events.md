# Campaigns — Events

Automasi modul Campaigns berjalan event-driven via Appwrite Functions (database event → function → update + notifikasi). Service yang memicu ada di `60_API.md`.

---

## Campaign Published

- **Trigger**: `campaigns.status` `draft → active`.
- **Function**: `campaign-published`.
- **Aksi**: notify creator yang eligible (buat dokumen `notifications`), tampilkan campaign di job board.
- **Link**: notifikasi → `../Notifications/`.

## Campaign Claimed

- **Trigger**: `campaign_claims.create`.
- **Function**: `campaign-claimed`.
- **Aksi**: validasi status & claim limit, lalu notify UMKM bahwa campaign-nya di-claim.
- **Link**: notifikasi → `../Notifications/`.

## Submission Created

- **Trigger**: `campaign_submissions.create`.
- **Function**: `ai-fraud-precheck`.
- **Aksi**: jalankan AI Fraud Detection → tulis `fraud_checks` + update `fraudScore`/`fraudStatus` pada submission.
- **Threshold**: 0–30 auto-approve · 31–70 review · 71–100 reject (lihat `30_Business_Rules.md`).
- **Link**: kontrak fungsi fraud → `../AI/60_API.md`; aturan validasi → `../AI/30_Business_Rules.md`.

## Submission Approved

- **Trigger**: `campaign_submissions.status` `pending → approved`.
- **Function**: `calculate-campaign-reward`.
- **Aksi**: hitung reward (`views/1000 × rewardPer1000Views`), buat transaksi, pindahkan ke **pending balance** wallet creator.
- **Link**: detail wallet & transaksi → `../Wallet/` (atau modul Payments/Wallet).
