# Campaigns — Overview

Campaign adalah fitur inti Pay-Per-View (PPV) Marketiv: UMKM mendanai promosi, Creator membuat dan mempublikasikan konten, Marketiv memvalidasi bukti serta views, lalu backend menghitung reward berdasarkan CPM Campaign.

## Alur End-to-End

1. **Create Campaign — UMKM**: informasi produk, tipe, brief, aset, budget, quota, CPM.
2. **Generate Brief (opsional) — UMKM**: AI membantu menyusun brief yang tetap dapat diedit.
3. **Fund & Publish — UMKM + Backend**: Midtrans mengonfirmasi funding, lalu campaign dapat menjadi `active`.
4. **Claim — Creator**: Creator eligible claim Campaign.
5. **Publish Content — Creator**: Creator mempublikasikan konten sesuai platform Campaign.
6. **Submit Proof — Creator**: Creator mengirim public post URL; trusted Function membuat submission `pending`.
7. **Fraud/Risk Precheck — System**: sistem menulis `fraudScore/fraudStatus` sebagai metadata risiko.
8. **Validate Submission — Admin Marketiv**: Admin memeriksa bukti, menangkap final views, lalu `approved` atau `rejected`.
9. **Reward — Backend**: jika `approved`, backend menghitung reward dari locked views dan sisa Campaign budget, lalu mencatat transaksi/pending balance Creator.
10. **Monitor — UMKM**: UMKM melihat status submission, validated views, dan hasil Campaign tanpa mutation review.

## Actors

- **UMKM** — campaign owner/buyer; create, fund, publish, monitor.
- **Creator** — claim owner; produce content, submit proof.
- **Admin Marketiv** — operational validation authority.
- **AI/Fraud Function** — advisory/risk precheck.
- **Payment/Reward Functions** — trusted financial execution.

## Collections

`campaigns`, `campaign_assets`, `campaign_briefs`, `campaign_claims`, `campaign_submissions`, `fraud_checks`.

## Current Migration Note

UI/SOT target follows ADR-010. Current backend `review-submission` still requires UMKM ownership and must be migrated before production Admin wiring is complete.
