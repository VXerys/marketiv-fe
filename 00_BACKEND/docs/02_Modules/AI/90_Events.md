# AI — Events

## Event yang Dikonsumsi

| Event | Sumber | Aksi |
| --- | --- | --- |
| `campaign_submissions.create` | Campaigns | Jalankan AI Fraud Detection |

## Event yang Diterbitkan

- Modul AI tidak menerbitkan event domain; hasil fraud ditulis langsung ke `fraud_checks` & `campaign_submissions` milik Campaigns.

## Lihat Juga

- Event pemicu fraud detection → `../Campaigns/90_Events.md`.
