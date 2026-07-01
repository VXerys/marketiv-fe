# AI — Overview

Marketiv memakai AI melalui **Appwrite Functions** yang membungkus OpenAI. Semua pemanggilan berjalan **server-side** (API key tidak pernah ada di frontend).

## Fitur

1. **Brief Generator** — membantu UMKM menghasilkan brief campaign dari input produk; hasil dapat diedit & disimpan ke `campaign_briefs` (modul Campaigns).
2. **Fraud Detection** — menganalisis submission campaign, menghasilkan `fraudScore` + level risiko; hasil disimpan di `fraud_checks` (modul Campaigns).
3. **Landing Assistant** (opsional) — asisten konten landing page; tercatat di `ai_requests`.

## Batas Tanggung Jawab

- Modul AI mendokumentasikan **kontrak fungsi AI** (input/output) dan memiliki koleksi `ai_requests`.
- **Data hasil fraud** (`score`, `result`, `reason`) hidup di `../Campaigns/50_Database.md` (`fraud_checks`) — ditautkan, bukan didefinisikan ulang.

## Koleksi yang Dimiliki

`ai_requests`. Skema di `60_API.md`.
