# 10_Glossary

Istilah inti domain Marketiv. Satu baris per istilah. Detail teknis tiap entitas ada di modul terkait ([`../02_Modules/`](../02_Modules/)).

## Aktor

- **UMKM** — Pelaku usaha (non-tech) yang membuat campaign, memesan jasa creator, dan membayar.
- **Content Creator** — Pembuat konten (mayoritas Gen-Z, mobile) yang meng-claim campaign, mengunggah konten, dan menerima reward.
- **Admin** — Internal Marketiv: moderasi user, review fraud, approve withdrawal, handle dispute.

## Campaign & Konten

- **Campaign** — Program konten berbayar dari UMKM untuk creator.
- **Pay-Per-View (PPV)** — Model campaign yang membayar creator berdasarkan jumlah views konten.
- **UGC** — User Generated Content; campaign meminta creator membuat konten produk.
- **Clipping** — Campaign memotong/mengedit ulang konten panjang menjadi klip pendek.
- **Brief** — Panduan campaign (hook, CTA, hashtag) yang bisa dibuat manual atau lewat AI Brief Generator.
- **Rate Card** — Daftar layanan & harga yang dipublikasikan creator.
- **Package** — Paket di dalam rate card (Basic/Standard/Premium) dengan harga, lama pengerjaan, limit revisi.
- **Offer** — Penawaran (custom price) dari UMKM ke creator melalui chat rate card.
- **Order** — Aggregate transaksi rate card (dari offer/direct order) yang mengikat escrow & deliverable.
- **Deliverable** — Draft hasil kerja creator yang diunggah pada sebuah order.
- **Submission** — Bukti posting konten campaign PPV oleh creator (post URL + views) yang dinilai fraud.
- **Claim** — Aksi creator mengambil sebuah campaign sebelum membuat submission.

## Finansial

- **Wallet** — Dompet per user (balance + pendingBalance).
- **Escrow** — Dana order yang ditahan sistem, hanya dikelola Appwrite Function, dirilis saat deliverable disetujui.
- **CPM / reward per 1000 views** — Tarif imbalan campaign PPV per 1000 views (`rewardPer1000Views`).

## Fraud

- **Fraud Score** — Skor numerik risiko submission dari AI Fraud Function (`fraudScore`).
- **Fraud Status** — Hasil penilaian fraud: `safe` (aman), `review` (perlu ditinjau admin), `rejected` (ditolak).
