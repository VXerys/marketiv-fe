# Payments — API

## Service Layer (Client SDK)

Fungsi-fungsi berikut dipanggil langsung dari frontend Next.js via **Appwrite Client SDK (Database)**. Berjalan di browser user.

---

### Wallet Service

Dimiliki pemilik wallet.

#### `getWallet()` — [Client SDK]

- **Input**: `{ userId }` (own).
- **Proses**: ambil `balance` & `pendingBalance` wallet user.
- **Akses**: Owner read · Admin.

#### `getTransactions()` — [Client SDK]

- **Input**: `{ userId }` (own).
- **Proses**: ambil daftar mutasi saldo dari `transactions`, urut terbaru.
- **Akses**: Owner read · Admin.

#### `getWithdrawals()` — [Client SDK]

- **Input**: `{ userId, status? }` (own).
- **Proses**: ambil daftar withdrawal creator dari `withdrawals`, bisa difilter status.
- **Akses**: Owner read · Admin.

#### `requestWithdraw()` — [Appwrite Function callable]

- **Input**: `{ amount, payoutMethod, providerName, accountNumber, accountName }`
- **payoutMethod**: `bank | ewallet`.
- **Validasi**: `amount ≥ MINIMUM_WITHDRAW` (`Rp50.000` — konstanta sistem, lihat [ADR-007](../../04_Decisions/ADR-007.md)), `balance ≥ amount`, dan data tujuan pencairan lengkap.
- **Proses**: panggil `request-withdrawal`; Function membuat row `requested`, reserve/debit balance atomik, dan membuat transaction `pending`. Tidak ada payout-provider call.
- **Output**: `{ success, withdrawalId, status: 'requested', requestedAt, balanceAfter, transactionId }`.
- **Akses**: authenticated eligible owner. Browser tidak mendapat izin write langsung ke wallet/status.

#### Admin withdrawal Functions

- `get-admin-withdrawal-queue`: list queue setelah active-admin authorization server-side.
- `review-withdrawal`: `start_processing`, `mark_succeeded`, atau `fail` dengan transition validation dan audit fields.
- `mark_succeeded` wajib `transfer_reference`; `fail` wajib `failure_reason` dan mengembalikan saldo tepat sekali.

### Payment Service

Payment dibuat lewat Appwrite Function agar Midtrans secret key tidak pernah keluar ke browser.

#### `createPayment()` — [Appwrite Function callable]

- **Input**: `{ purpose, orderId?, campaignId?, amount }`
- **Purpose**: `order | campaign`.
- **Validasi**:
  - `amount > 0`.
  - Jika `purpose = order`, `orderId` wajib dan order harus milik UMKM yang login dengan status `pending_payment`.
  - Jika `purpose = campaign`, `campaignId` wajib dan campaign harus status `draft` milik UMKM yang login.
  - Amount harus sama dengan nilai order untuk payment order; sama dengan budget untuk payment campaign.
- **Proses**:
  - Untuk `purpose = order`, klaim `order_payment_key = order:<orderId>` lewat unique index. Payment `pending` direuse; payment `paid` ditolak; `failed|expired|cancelled` membuka retry.
  - Buat dokumen `payments` dengan `gateway = midtrans`, `status = pending`, dan `gateway_reference` unik.
  - Buat transaksi ke Midtrans dari server.
  - Simpan `snapToken` dan/atau `redirectUrl` dari Midtrans.
- **Output**: `{ paymentId, gateway: 'midtrans', snapToken, redirectUrl, status: 'pending' }`
- **Akses**: Authenticated UMKM.

#### `getPayment()` — [Client SDK]

- **Input**: `{ paymentId }`.
- **Proses**: ambil detail payment milik user.
- **Akses**: Owner read · Admin.

#### `getPayments()` — [Client SDK]

- **Input**: `{ status? }`
- **Proses**: ambil daftar payment milik user, bisa difilter status.
- **Akses**: Owner read · Admin.

#### `cancelPayment()` — [Appwrite Function callable]

- **Input**: `{ paymentId }`
- **Validasi**: Payment harus milik user yang login, status harus `pending` (belum `paid`/`expired`/`failed`/`cancelled`).
- **Proses**: Campaign mempertahankan cancel lokal `pending → cancelled`. Untuk Rate Card order, Function menolak cancel lokal dengan `409 gateway_cancellation_required` karena Snap aktif tidak dapat dianggap batal tanpa konfirmasi Midtrans.
- **Output**: Campaign `{ ok: true }`; Rate Card order `{ error, code: 'gateway_cancellation_required' }`.
- **Akses**: Authenticated user (owner payment).

---

## Appwrite Functions (Server-side)

Fungsi-fungsi berikut di-deploy ke **Appwrite Cloud** dan dipicu oleh **event database**. Tidak dipanggil langsung dari frontend.

### `create-user-wallet` — [Appwrite Function]

- **Trigger**: `users.create`.
- **Aksi**: buat dokumen `wallets` (`balance = 0`, `pendingBalance = 0`) + welcome notification.
- **Link**: alur registrasi → `../Authentication/`.

### `midtrans-webhook` — [Appwrite Function]

- **Trigger**: HTTP webhook/notification dari Midtrans.
- **Validasi**: signature Midtrans (`SHA512(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)`), `gateway_reference`, amount, dan status transaksi.
- **Aksi**: update `payments.status` dari `pending` menjadi `paid | failed | expired | cancelled` secara idempotent.
- **Catatan**: function ini adalah satu-satunya jalur untuk menandai payment sebagai `paid`.

### `create-escrow` — [Appwrite Function]

- **Trigger**: `payments.status` `pending → paid`.
- **Aksi**: buat dokumen `escrows` (status `held`), lock dana, set order `escrow` / `in_progress`.
- **Link**: alur order → `../Orders/90_Events.md`.

### `release-escrow` — [Appwrite Function]

- **Trigger**: `deliverables.status` `revision_requested → approved` (approve oleh UMKM).
- **Aksi**: rilis escrow (status `released`) → saldo masuk wallet creator + catat `transactions` (type `release`) → order `completed`.
- **Link**: alur order → `../Orders/90_Events.md`.

---

> Escrow tidak dikelola lewat service user, melainkan **Appwrite Functions**. Pemicu escrow berasal dari alur order — lihat `../Orders/90_Events.md`. Detail event di `90_Events.md`.

## Lihat Juga

- [50_Database.md](50_Database.md) — skema data
- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi
- [90_Events.md](90_Events.md) — event trigger flow
