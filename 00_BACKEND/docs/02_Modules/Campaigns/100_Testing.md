# Campaigns — Testing

## Campaign

- UMKM membuat campaign → status `draft`.
- Publikasi → status `active`, muncul di job board.
- UMKM melihat campaign milik sendiri saja.

## Claim

- Creator claim campaign → status `claimed`.
- Claim duplikat (campaign + creator sama) → ditolak.
- Claim saat campaign paused/completed → ditolak.
- Claim melebihi `claimLimit` → ditolak.
- Creator dengan profil belum lengkap → ditolak.

## Submission

- Creator submit konten → status `pending`, fraud check otomatis berjalan.
- Fraud `safe` → auto-approve.
- Submit sebelum claim → error.
- UMKM approve → reward terhitung, balance creator bertambah.

## Denormalisasi

- `totalClaims`, `spentAmount`, `remainingBudget` akurat setelah setiap aksi.
