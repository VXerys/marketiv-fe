# Phase 04 — Requirements: Admin Withdrawal UI

## Objective
Menambahkan halaman operasional withdrawal pada aplikasi `admin/` tanpa memberi browser otoritas finansial langsung.

## Route
Recommended: `/withdrawals`.

## Navigation
Tambahkan menu operational pada `admin/src/components/admin/AdminSidebar.tsx`, label `Penarikan Dana` atau `Withdrawals`.

## Data Access
Admin web wajib membaca queue lewat `get-admin-withdrawal-queue` dan mutation lewat `review-withdrawal`. Jangan direct update `withdrawals`, `wallets`, atau `transactions` dari browser.

## List Requirements
Tampilkan minimal:
- ID,
- creator/user display name,
- amount,
- destination provider,
- masked account number,
- requested timestamp,
- status.

Filters: operational/default, requested, processing, succeeded, reversed, all.

## Detail Requirements
Detail boleh menampilkan full payout method/provider, account number, account name, amount, processing timestamp, processor, transfer reference, processed timestamp, failure reason/admin note.

## Actions
Requested: `Mulai Proses`.
Processing: admin transfer manual di luar Marketiv lalu pilih `Tandai Berhasil` atau `Gagal / Tolak`.

Success wajib transfer reference + confirmation.
Failure wajib reason + warning saldo akan dikembalikan.

## UX States
Required loading, empty, error+retry, mutation loading, success feedback, stale conflict feedback, dan double-submit protection.

## Security UX
No server secret, no full account logging, no payout provider credential di admin env, no “Transfer Otomatis” action.

## Acceptance Criteria
- Admin melihat requested queue.
- Non-admin tetap blocked oleh backend.
- Table account masked.
- Full destination hanya di detail.
- Actions call trusted Functions.
- Success requires reference.
- Failure requires reason.
- Authoritative re-fetch after mutation.
- No direct DB financial mutation.
- Loading/error/empty states ada.
- Sidebar route responsive.
