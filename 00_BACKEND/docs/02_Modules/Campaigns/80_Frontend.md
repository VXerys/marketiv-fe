# Campaigns — Frontend

## Halaman UMKM

### Create Campaign

- **Pilih Tipe**: UGC (buat video baru) / Clipping (edit video panjang).
- **Basic Info**: judul, kategori, platform (TikTok, fixed).
- **Upload Asset**: internal (storage) / external URL.
- **Generate Brief** via AI (opsional).
- **Atur Reward** (form disederhanakan):
  - `budget` — input nominal (min Rp50.000).
  - `claimLimit` — input "Jumlah kreator".
  - `rewardPer1000Views` — radio button: Rp1.000 / Rp2.000 / Rp3.000 / Rp5.000.
  - Ringkasan otomatis: total bayar (budget + fee), contoh penghasilan kreator.
- Top-Up Budget via Midtrans.
- Publish.

### My Campaigns

- Daftar campaign milik UMKM dengan filter status.
- Detail campaign: stats, claims, submissions.

### Review Submission

- List submission per campaign.
- Preview konten (URL).
- Approve / Reject dengan alasan opsional.

## Halaman Creator

### Job Board

- Daftar campaign active dengan filter platform MVP (TikTok) dan kategori.
- Detail campaign (brief, reward, claim limit).

### My Claims

- Daftar campaign yang sudah di-claim.
- Tombol "Submit Konten" untuk claim berstatus `claimed`.

## Komponen

- `CampaignCard` — ringkasan campaign di job board.
- `SubmissionCard` — detail submission dengan fraud badge.
- `ClaimButton` — tombol claim dengan validasi.
