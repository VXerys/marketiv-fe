# Campaigns — Overview

Campaign adalah fitur inti **Pay-Per-View (PPV)** Marketiv: UMKM mempromosikan produk, creator dibayar berdasarkan jumlah views konten yang mereka hasilkan.

## Alur End-to-End

1. **Create Campaign** — UMKM membuat campaign (informasi dasar, deliverable, requirement, budget).
2. **Generate Brief (opsional)** — UMKM dapat memakai AI Brief Generator untuk menghasilkan brief, lalu mengedit & menyimpannya. Lihat modul `../AI/`.
3. **Publish Campaign** — Status `draft` → `active`; campaign tampil di job board creator.
4. **Claim Campaign** — Creator yang memenuhi syarat melakukan claim (First Come First Serve, satu claim per creator per campaign).
5. **Create Submission** — Creator mengunggah URL konten + metadata (views, caption).
6. **Fraud Check** — Submission otomatis dianalisis AI Fraud Detection; menghasilkan `fraudScore` + status risiko.
7. **Approve / Reject** — UMKM mereview submission lalu approve atau reject.
8. **Reward** — Setelah approve, reward dihitung dari views (`views/1000 × rewardPer1000Views`) dan masuk ke pending balance wallet creator.

## Aktor

- **UMKM** — membuat, mempublikasikan, dan mereview campaign.
- **Content Creator** — claim campaign dan mengirim submission.
- **AI Functions** — Brief Generator (opsional) & Fraud Detection (otomatis). Lihat `../AI/`.

## Koleksi yang Dimiliki

`campaigns`, `campaign_assets`, `campaign_briefs`, `campaign_claims`, `campaign_submissions`, `fraud_checks`. Skema lengkap di `50_Database.md`.
