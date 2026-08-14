# Modul Campaigns

Alur Pay-Per-View (PPV): UMKM membuat dan mendanai campaign, Creator melakukan claim lalu mengirim bukti tayang berupa public post URL, sistem menjalankan fraud/risk precheck, dan **Admin Marketiv** melakukan validasi final submission serta mengunci views yang menjadi dasar reward. UMKM dapat memantau submission dan hasil validasi secara read-only.

## Authority Ringkas

- **UMKM** — create/edit/fund/publish campaign; melihat progress dan hasil submission.
- **Creator** — claim campaign dan submit bukti tayang untuk claim miliknya.
- **Admin Marketiv** — validate submission, lock final views, approve/reject.
- **AI/Fraud Function** — menghasilkan risk signal, bukan final financial authority.
- **Reward Function** — menghitung reward setelah submission authoritative `approved`.

## Daftar Dokumen

- `10_Overview.md` — gambaran Campaign PPV end-to-end.
- `20_Concepts.md` — istilah & konsep domain.
- `30_Business_Rules.md` — status, authority, claim, submission, fraud, reward.
- `40_User_Flow.md` — alur UMKM, Creator, dan Admin.
- `50_Database.md` — skema Campaign collections.
- `60_API.md` — kontrak read/command frontend-backend.
- `70_Backend.md` — Appwrite Functions dan trust boundary.
- `80_Frontend.md` — halaman/komponen per role.
- `85_Asset_Tutorial.md` — aset Campaign.
- `90_Events.md` — event-driven flow.
- `95_Views_Tracking.md` — capture dan locking views.
- `96_Views_Sprint_Plan.md` — superseded implementation plan; lihat spec terbaru.
- `100_Testing.md` — acceptance/security scenarios.

## Implementation Status Note

Product authority sudah diputuskan ke Admin melalui ADR-010. Backend `review-submission` pada baseline 2026-08-14 masih memakai ownership UMKM dan menjadi blocker wiring yang harus diselesaikan sebelum Campaign E2E ditandai complete.
