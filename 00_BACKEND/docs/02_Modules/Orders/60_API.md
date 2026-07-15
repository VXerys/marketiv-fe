# Orders — API

## Service Layer (Client SDK)

Fungsi-fungsi berikut dipanggil langsung dari frontend Next.js via **Appwrite Client SDK (Database)**. Berjalan di browser user.

---

### `getOrders()` — [Client SDK]

- **Input**: `{ umkmId }` (dashboard UMKM) atau `{ creatorId }` (dashboard creator).
- **Proses**: list order milik user terkait.
- **Akses**: Buyer / Seller (own) · Admin.

### `uploadDeliverable()` — [Client SDK]

- **Input**: `{ orderId, source, fileUrl, fileId?, notes? }`
- **Proses**:
  - Jika `source = storage`, file sudah diupload via File Manager; validasi `fileId` milik creator.
  - Jika `source = external_url`, simpan URL eksternal langsung.
  - Buat dokumen `deliverables` dengan versi berikutnya (`status = submitted`); set order `in_progress`. Notify UMKM untuk review.
- **Akses**: Creator (seller).

### `approveDeliverable()` — [Client SDK] *(memicu Appwrite Function `release-escrow`)*

- **Input**: `{ orderId, deliverableId }`
- **Proses**: set deliverable `approved` → **release escrow** → saldo masuk wallet creator → order `completed`.
- **Akses**: UMKM (buyer).
- **Link**: escrow release via function `release-escrow` (lihat `90_Events.md` & `../Payments/`).

### `requestRevision()` — [Client SDK]

- **Input**: `{ orderId, message }`
- **Proses**: buat dokumen `revisions` (`status = open`); set order `revision`. Creator mengunggah deliverable versi berikutnya.
- **Akses**: UMKM (buyer).

---

## Appwrite Functions (Server-side)

Fungsi-fungsi berikut di-deploy ke **Appwrite Cloud** dan dipicu oleh **event database**. Tidak dipanggil langsung dari frontend.

### `create-order` — [Appwrite Function]

- **Trigger**: `offers.status` `pending → accepted`.
- **Aksi**: buat dokumen `orders` (status `pending_payment`), notify UMKM untuk bayar.
- **Link**: pemicu dari modul Offers → `../Offers/90_Events.md`.

### `create-escrow` — [Appwrite Function]

- **Trigger**: `payments.status` `pending → paid`.
- **Aksi**: buat dokumen `escrows` (status `held`), lock dana, set order `escrow` / `in_progress`.
- **Link**: escrow & wallet → `../Payments/90_Events.md`.

### `release-escrow` — [Appwrite Function]

- **Trigger**: `deliverables.status` → `approved`.
- **Aksi**: rilis escrow (status `released`) → saldo masuk wallet creator + catat `transactions` → order `completed`.
- **Link**: detail wallet & transaksi → `../Payments/`.

---

> Pembayaran & escrow ditangani modul Payments (functions `create-escrow`/`release-escrow`) — lihat `90_Events.md`.

## Lihat Juga

- [50_Database.md](50_Database.md) — skema data
- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi
- [90_Events.md](90_Events.md) — event trigger flow
