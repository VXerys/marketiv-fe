# Orders — API

## Service Layer (Client SDK)

Read dan mutation non-cross-user berikut memakai service frontend. Create deliverable menjadi pengecualian: service memanggil Appwrite Function karena row permission lintas-user tidak boleh dipasang sesi browser.

---

### `getOrders()` — [Client SDK]

- **Input**: `{ umkmId }` (dashboard UMKM) atau `{ creatorId }` (dashboard creator).
- **Proses**: list order milik user terkait.
- **Akses**: Buyer / Seller (own) · Admin.

### `uploadDeliverable()` — [Appwrite Function]

- **Input**: `{ orderId, source, fileUrl, fileId?, notes? }`
- **Proses**:
  - Jika `source = storage`, file sudah diupload via File Manager; validasi `fileId` aktif, milik creator, dan metadata memberi UMKM order izin read.
  - Jika `source = external_url`, simpan URL eksternal langsung.
  - Frontend memanggil Function `submit-ratecard-deliverable`; browser tidak membuat dokumen langsung.
  - Function mengambil caller dari execution header, memuat order, dan hanya menerima Creator owner saat status `in_progress`/`revision`.
  - Function membuat dokumen `deliverables` dengan versi berikutnya dan `status = submitted` memakai API key. ID deterministik dari `(orderId, version)` membuat submit paralel versi sama berakhir HTTP 409, bukan duplikat versi.
  - Permission dokumen: Creator `read`; UMKM order `read` + `update`; Creator tidak mendapat `update`.
- **Akses**: Creator (seller).

### `approveDeliverable()` — [Client SDK] *(memicu Appwrite Function `release-escrow`)*

- **Input**: `{ orderId, deliverableId }`
- **Proses**: set deliverable `approved` → **release escrow** → saldo masuk wallet creator → order `completed`.
- **Akses**: UMKM (buyer).
- **Link**: escrow release via function `release-escrow` (lihat `90_Events.md` & `../Payments/`).

### `cancelOrder()` — [Client SDK]

- **Input**: `{ orderId }`
- **Validasi**: Order harus milik UMKM yang login, status harus `pending_payment` (belum masuk escrow).
- **Proses**: update `status: pending_payment → cancelled`.
- **Akses**: UMKM (owner).

### `requestRevision()` — [Appwrite Function]

- **Input**: `{ orderId, message }`
- **Proses**: frontend hanya memanggil Function `request-ratecard-revision`. Function mengambil caller dari execution header, memverifikasi UMKM pemilik order, status `in_progress|revision`, latest deliverable `submitted`, batas revisi, dan message; lalu membuat revision read-only untuk UMKM + Creator, menandai latest deliverable `revision_requested`, mengubah order menjadi `revision`, serta mereset `review_deadline_at` dan `reminder_sent_at`.
- **Siklus berikutnya**: setelah Creator mengunggah v2, latest kembali `submitted`; UMKM dapat meminta revisi lagi selama total revision rows belum mencapai limit.
- **Tidak dilakukan**: tidak mengubah `revision_count`, escrow, wallet, payment, atau validation.
- **Akses**: UMKM (buyer).

---

## Appwrite Functions (Server-side)

Fungsi berikut di-deploy ke **Appwrite Cloud**. Trigger dapat berupa eksekusi sinkron frontend atau event database sesuai tiap kontrak.

### `submit-ratecard-deliverable` — [Appwrite Function]

- **Trigger**: eksekusi sinkron dari frontend oleh authenticated user.
- **Aksi**: authorization owner Creator, validasi state/input/file, hitung `latestVersion + 1`, lalu create deliverable dengan least-privilege row permissions.
- **Tidak melakukan**: approve deliverable, update order, release escrow, wallet, atau payment.

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
