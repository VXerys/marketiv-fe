# 03_Workflows — Index

Folder ini mendokumentasikan **kolaborasi lintas-modul** (end-to-end). Aturan internal satu modul tetap dimiliki dokumen modulnya — di sini hanya alur, urutan, event, dan titik serah-terima antar modul. Lihat modul terkait di [`../02_Modules/`](../02_Modules/).

## Daftar Workflow

- [10_Registration.md](10_Registration.md) — Onboarding akun baru sampai siap pakai. Spans: Authentication, Users, Payments, Notifications.
- [20_Campaign_PPV.md](20_Campaign_PPV.md) — Siklus campaign Pay-Per-View dari pembuatan sampai reward. Spans: Campaigns, AI, Payments, Notifications.
- [30_RateCard_Order.md](30_RateCard_Order.md) — Pesanan rate card kustom dengan escrow dari discovery sampai release. Spans: RateCards, Chat, Offers, Orders, Payments.
- [40_Submission_Fraud.md](40_Submission_Fraud.md) — Pemeriksaan fraud submission & routing berdasarkan risk score. Spans: Campaigns, AI (+ Admin untuk antrian manual).
- [50_Withdrawal.md](50_Withdrawal.md) — Penarikan saldo creator dengan review admin. Spans: Payments, Admin.
- [60_Dispute.md](60_Dispute.md) — Sengketa order & resolusi admin terhadap escrow. Spans: Orders, Payments, Admin.
