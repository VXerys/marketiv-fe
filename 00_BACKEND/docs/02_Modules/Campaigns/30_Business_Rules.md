# Campaigns — Business Rules

## Status Campaign

`draft | active | paused | completed`

- Campaign dibuat dengan status `draft`.
- Publish mengubah `draft` → `active` (memicu event Campaign Published).
- `paused` menghentikan sementara visibilitas/claim; `completed` saat budget habis atau campaign ditutup.

## Tipe Campaign & Aturan Tanpa Sampel Fisik

- Campaign wajib memiliki tipe: `ugc` atau `clipping`.
  - `ugc`: Pembuatan konten dari 0 berbasis aset digital (foto/video produk).
  - `clipping`: Pemotongan/repurposing video panjang eksternal menjadi klip pendek.
- **100% Berbasis Aset Digital (No Physical Shipping MVP)**:
  - Tidak ada fitur atau kewajiban pengiriman sampel produk fisik dari UMKM ke creator.
  - UMKM wajib menyediakan aset digital yang cukup pada `campaign_assets` (file upload atau external link) agar creator dapat mengerjakan konten.
  - Creator tidak berhak meminta pengiriman barang fisik. Semua deliverable dikerjakan menggunakan materi digital yang terlampir.

## Aturan Budget

- **Minimum budget**: setiap campaign wajib memiliki budget minimal **Rp50.000** (`50.000`).
- Validasi dilakukan saat `createCampaign()` — budget < Rp50.000 ditolak.
- Budget adalah total dana yang tersedia untuk reward creator (belum termasuk fee platform).

## Aturan Claim

- Campaign PPV MVP hanya mendukung platform `tiktok`. Campaign dengan platform Instagram, Facebook, YouTube, atau platform lain ditolak sampai fase ekspansi multi-platform.

- **Unik**: satu creator hanya boleh claim sebuah campaign satu kali — kombinasi `campaignId + creatorId` harus unik (divalidasi di backend).
- **Profil lengkap**: creator wajib `isProfileCompleted = true`.
- **Campaign aktif**: campaign harus berstatus `active`.
- **Claim limit**: jumlah claim tidak boleh melebihi `claimLimit` campaign (First Come First Serve).

Status claim: `claimed | submitted | approved | rejected | expired`.

## Aturan Auto-Expire Claim

- Setiap claim memiliki batas waktu submit (`submissionDays`, default 7 hari sejak claim).
- Jika creator tidak membuat submission dalam batas waktu tersebut, claim otomatis berubah status menjadi `expired`.
- **Dampak**: `campaigns.totalClaims -= 1` — slot kembali ke pool dan bisa di-claim kreator lain.
- Pengecekan expire dilakukan oleh scheduled function `expire-stale-claims` (berjalan periodik).
- Validasi expire juga dilakukan saat `claimCampaign()` dipanggil — claim yang expired akan di-reclaim sebelum cek claim limit.

## Aturan Submission

Status submission: `pending | approved | rejected`.

- Submission dibuat dengan status `pending` dan langsung memicu AI Fraud Detection (lihat `90_Events.md`).
- Submission terhubung 1—1 dengan claim (`claimId`).
- Submission MVP wajib `platform = tiktok` dan `postUrl` harus URL TikTok yang valid.
- UMKM mereview submission `pending` lalu approve atau reject.

## Aturan Fraud

Status fraud (`fraudStatus` pada submission / `result` pada fraud_checks): `safe | review | rejected`.

Ambang batas berdasarkan `fraudScore` (0–100):

| Skor    | Risiko  | Status   | Aksi          |
| ------- | ------- | -------- | ------------- |
| 0–30    | Low     | `safe`   | Auto-approve  |
| 31–70   | Medium  | `review` | Manual review |
| 71–100  | High    | `rejected` | Auto-reject |

Definisi validasi fraud & kontrak fungsi ada di modul `../AI/30_Business_Rules.md`; data hasilnya disimpan pada `campaign_submissions` & `fraud_checks` (lihat `50_Database.md`).

## Rumus Reward

```text
reward = (views / 1000) × rewardPer1000Views
```

Reward dihitung saat submission di-approve dan masuk ke **pending balance** wallet creator (lihat modul Wallet).

## Aturan Asset Campaign

- Asset campaign bisa berasal dari dua sumber:
  - `storage`: file diupload ke Appwrite Storage (terikat kuota user — lihat modul Users).
  - `external_url`: link eksternal (Google Drive, Dropbox, CDN, dll.) — tidak terikat kuota.
- External URL hanya menerima protokol `https`.
- `type = link` dipakai untuk referensi umum seperti folder Google Drive; `image`, `video`, `document` untuk asset spesifik.
- Saat campaign dihapus, asset tidak otomatis dihapus dari `user_files` (user harus mengelola sendiri lewat File Manager). ⚠️ `user_files` dormant — tidak dipakai MVP, semua aset external URL.

## Platform Fee

Platform Marketiv membebankan **fee 2%** kepada UMKM saat melakukan top-up budget campaign (lihat modul Payments).

- Creator menerima **full reward** sesuai rumus — fee tidak dipotong dari pendapatan creator.
- Total yang dibayar UMKM = `budget + floor(budget × 2 / 100)`.
- Fee dicatat sebagai transaksi `fee` di ledger.

## Data Denormalisasi

Pada `campaigns` disimpan counter denormalisasi agar dashboard cepat (tidak perlu agregasi runtime):

- `totalClaims` — jumlah claim aktif.
- `spentAmount` — total reward yang sudah dikeluarkan.
- `remainingBudget` — sisa budget = `budget − spentAmount`.

Lihat ADR-005 (denormalized counters) di `../../04_Decisions/`.
