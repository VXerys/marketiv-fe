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

## Order Cancelled/Expired → Refund Escrow (T-02)

- **Trigger**: `orders.status` `in_progress|approved|...` → `cancelled`/`expired` (via `cancelOrder` atau kadaluarsa otomatis).
- **Function**: `refund-order` (event `orders.*.update`).
- **Aksi**: cari escrow `held` milik order → flip ke `refunded` → kredit `wallets.balance` UMKM `escrow.amount` utuh → ledger `refund` (type `refund`, referenceType `escrow`) → notifikasi UMKM.
- **Fee**: tidak dikembalikan (fee seller-side dipotong saat release, fee buyer-side tidak pernah masuk escrow).

## Campaign Budget Refund (T-02)

- **Trigger**: campaign `cancelled`/`completed` dengan `remainingBudget > 0` (manual admin via `refund-order`).
- **Function**: `refund-order` (manual, payload `{ campaignId }`).
- **Aksi**: kredit `wallets.balance` UMKM `remainingBudget`, zero-kan `remainingBudget`, ledger `refund` (referenceType `campaign`), notifikasi UMKM.

## Withdraw Requested → Admin Review

- **Trigger**: `withdrawals.create`.
- **Aksi**: validasi saldo, kurangi balance, masuk antrian **admin review**; setelah approve, dana ditransfer & status `processed`.
- **Link**: aturan withdraw → `30_Business_Rules.md`.
