# Payments — Events

Automasi finansial berjalan event-driven via Appwrite Functions. Service yang memicu ada di `60_API.md`.

---

## User Registered → Create Wallet

- **Trigger**: `users.create`.
- **Function**: `create-user-wallet`.
- **Aksi**: buat dokumen `wallets` (`balance = 0`, `pendingBalance = 0`) + welcome notification.
- **Link**: alur registrasi → `../Authentication/`.

## Checkout Created → Midtrans Payment

- **Trigger**: UMKM memulai checkout order/top up dari frontend.
- **Function**: `create-payment`.
- **Aksi**: buat dokumen `payments` (`gateway = midtrans`, `status = pending`), panggil Midtrans, kembalikan `snapToken` dan/atau `redirectUrl`.

## Midtrans Notification → Payment Status

- **Trigger**: HTTP webhook/notification Midtrans.
- **Function**: `midtrans-webhook`.
- **Aksi**: validasi signature dan amount, update `payments.status` menjadi `paid | failed | expired | cancelled` secara idempotent.

## Payment Success → Escrow Hold

- **Trigger**: `payments.status` `pending → paid`.
- **Function**: `create-escrow`.
- **Aksi**: buat dokumen `escrows` (status `held`), lock dana, set order `escrow`/`in_progress`.
- **Link**: alur order → `../Orders/90_Events.md`.

## Deliverable Approved → Release Escrow

- **Trigger**: `deliverables.status` `revision_requested → approved` (approve oleh UMKM).
- **Function**: `release-escrow`.
- **Aksi**: rilis escrow (status `released`) → saldo masuk wallet creator + catat `transactions` (type `release`) → order `completed`.
- **Link**: alur order → `../Orders/90_Events.md`.

## Withdraw Requested → Admin Review

- **Trigger**: `withdrawals.create`.
- **Aksi**: validasi saldo, kurangi balance, masuk antrian **admin review**; setelah approve, dana ditransfer & status `processed`.
- **Link**: aturan withdraw → `30_Business_Rules.md`.
