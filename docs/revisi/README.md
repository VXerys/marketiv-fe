# Marketiv UMKM Audit — Hard Token Mode v2

Repo: `marketiv-id/marketiv-web`  
Branch: `staging`  
Audit baseline: `fd833d387324a6d279a7b2f88cc4c1c45b86a5bf`  
Date: `2026-08-10`

## Purpose
Versi ini dioptimalkan untuk implementasi AI dengan konsumsi token minimum.

Prinsip:
- baseline tidak diulang di setiap file;
- detail finding hanya di `01_FINDINGS_REGISTRY.md`;
- file tab hanya berisi scope, source, finding ID, acceptance, verification;
- implementasi `1 finding = 1 batch`;
- jangan re-audit repo jika evidence finding masih valid.

## Read pattern
Untuk satu finding, buka hanya:
1. `00_HARD_TOKEN_MODE.md`
2. entry finding di `01_FINDINGS_REGISTRY.md`
3. file tab terkait
4. source files yang disebut finding

Jangan load seluruh audit pack sekaligus.

## Files
- `00_HARD_TOKEN_MODE.md`
- `01_FINDINGS_REGISTRY.md`
- `02_DASHBOARD.md`
- `03_CAMPAIGN.md`
- `04_CREATOR_MARKETPLACE.md`
- `05_NEGOTIATION_RATE_CARD.md`
- `06_FINANCE_PAYMENT_ESCROW.md`
- `07_ANALYTICS.md`
- `08_NOTIFICATIONS.md`
- `09_SETTINGS.md`
- `10_GUIDE_LEGAL.md`
- `11_IMPLEMENTATION_ORDER.md`
- `12_VERIFICATION.md`
- `13_CODEX_IMPLEMENT_PROMPT.md`

## Release status
`BLOCKED` untuk production financial flow sampai P0 selesai.

P0:
`UMKM-SEC-01`, `UMKM-SEC-03`, `UMKM-SEC-04`, `UMKM-FIN-01`, `UMKM-OPS-01`.
