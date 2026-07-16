# Modul AI

Dua fitur AI Marketiv via Appwrite Functions yang membungkus Gemini API: **Brief Generator** & **Fraud Detection**. Modul ini mendokumentasikan kontrak fungsi AI dan memiliki koleksi `ai_requests`. Data hasil fraud disimpan di modul Campaigns (`fraud_checks`) — ditautkan, tidak didefinisikan ulang.

## Daftar Dokumen

- `10_Overview.md` — Dua fitur AI (+ opsional landing assistant), semua server-side.
- `20_Concepts.md` — Istilah & konsep domain AI.
- `30_Business_Rules.md` — Input/output Brief, validasi & threshold Fraud.
- `40_User_Flow.md` — Alur Brief Generator & Fraud Detection.
- `50_Database.md` — Skema koleksi `ai_requests`.
- `60_API.md` — Kontrak endpoint AI Function.
- `70_Backend.md` — Appwrite Functions & integrasi Gemini API.
- `80_Frontend.md` — Komponen UI untuk AI Brief Generator.
- `90_Events.md` — Event yang dikonsumsi AI (dari Campaigns).
- `100_Testing.md` — Skenario uji Brief Generator & Fraud Detection.
