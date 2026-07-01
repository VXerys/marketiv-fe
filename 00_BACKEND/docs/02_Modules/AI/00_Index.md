# Modul AI

Dua fitur AI Marketiv via Appwrite Functions yang membungkus OpenAI: **Brief Generator** & **Fraud Detection**. Modul ini mendokumentasikan kontrak fungsi AI dan memiliki koleksi `ai_requests`. Data hasil fraud disimpan di modul Campaigns (`fraud_checks`) — ditautkan, tidak didefinisikan ulang.

## Daftar Dokumen

- `10_Overview.md` — Dua fitur AI (+ opsional landing assistant), semua server-side.
- `30_Business_Rules.md` — Input/output Brief, validasi & threshold Fraud.
- `60_API.md` — Kontrak endpoint AI Function + skema `ai_requests`.
