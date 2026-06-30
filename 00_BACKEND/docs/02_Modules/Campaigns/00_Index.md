# Modul Campaigns

Alur Pay-Per-View (PPV): UMKM membuat campaign + brief, mempublikasikan, creator melakukan claim, mengirim submission konten, dilakukan fraud check, lalu UMKM approve dan reward dihitung berdasarkan views/CPM. Modul ini memiliki seluruh data flow campaign termasuk claim, submission, dan hasil fraud.

## Daftar Dokumen

- `10_Overview.md` — Gambaran alur PPV campaign end-to-end.
- `30_Business_Rules.md` — Status, aturan claim, aturan submission & fraud, rumus reward, data denormalisasi.
- `50_Database.md` — Skema, atribut, index, dan relasi koleksi `campaigns`, `campaign_assets`, `campaign_briefs`, `campaign_claims`, `campaign_submissions`, `fraud_checks`.
- `60_API.md` — Kontrak Campaign Service, Claim Service, dan Submission Service.
- `90_Events.md` — Event-driven flow (publish, claim, submission, approval) dan tautan ke modul AI & Notifications.
