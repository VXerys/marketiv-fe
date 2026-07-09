# Campaigns — Frontend

## Halaman UMKM

### Create Campaign

- Form: title, category, platforms, budget, rewardPer1000Views, claimLimit.
- Opsi Generate Brief dengan AI.
- Upload campaign assets.

### My Campaigns

- Daftar campaign milik UMKM dengan filter status.
- Detail campaign: stats, claims, submissions.

### Review Submission

- List submission per campaign.
- Preview konten (URL).
- Approve / Reject dengan alasan opsional.

## Halaman Creator

### Job Board

- Daftar campaign active dengan filter platform, kategori.
- Detail campaign (brief, reward, claim limit).

### My Claims

- Daftar campaign yang sudah di-claim.
- Tombol "Submit Konten" untuk claim berstatus `claimed`.

## Komponen

- `CampaignCard` — ringkasan campaign di job board.
- `SubmissionCard` — detail submission dengan fraud badge.
- `ClaimButton` — tombol claim dengan validasi.
