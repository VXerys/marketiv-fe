# Payments — Backend

Dokumen ini khusus untuk Appwrite Functions dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Functions

### cancel-payment

- **Trigger**: callable dari frontend saat user membatalkan payment yang masih `pending`.
- **Pola**: service `payment.service.ts:cancelPayment(paymentId)` → Function `cancel-payment`.
- **Aksi**: Campaign: validasi kepemilikan + status `pending`, update status → `cancelled`. Rate Card order: tolak local cancel dengan `409 gateway_cancellation_required`.
- **Syarat**: payment `status = pending` (belum `paid`/`failed`/`expired`/`cancelled`).
- **Env wajib**: `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `PAYMENTS_COLLECTION_ID`.
- **Catatan**: Function tidak memanggil Midtrans. Karena itu Rate Card lock hanya dilepas webhook terminal Midtrans (`failed|expired|cancelled`), bukan dari local UX cancel.

### create-payment

- **Trigger**: callable dari frontend saat UMKM checkout order atau top up.
- **Aksi**: validasi user/order/amount, buat dokumen `payments`, panggil Midtrans, simpan `snapToken` dan/atau `redirectUrl`.
- **Idempotensi Rate Card**: unique `order_payment_key` menjadi arbitrator race. Request kalah unique race membaca intent pemenang; tidak membuat Snap transaction kedua. Key dipertahankan saat `pending|paid`, dibersihkan authoritative saat `failed|expired|cancelled`.
- **Error Snap ambigu**: setelah request ke Midtrans dimulai, kegagalan Function/network tidak mengubah order payment menjadi `failed` dan tidak membuka key. Request berikutnya mendapat `payment_preparing` sampai status gateway dapat dikonfirmasi.
- **Env wajib**: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_ENV`.
- **Validasi per purpose**: `order` dan `campaign` sama-sama memeriksa kepemilikan, status, dan kecocokan nominal terhadap baris sumbernya. `campaign` wajib berstatus `draft` dan `amount` harus sama persis dengan `campaigns.budget`.
- **Batas `gateway_reference`**: maksimal **50 karakter** — itu batas `transaction_details.order_id` di Midtrans. Referensi dibentuk `<prefix>-<paymentId>` (`ord`/`top`/`cmp`, total 24 karakter) dan id campaign/order **tidak** ikut di dalamnya; kaitannya sudah disimpan di kolom `campaign_id`/`order_id`. Bentuk lama yang menyertakan id + timestamp mencapai 52 karakter dan membuat **setiap** pembayaran campaign ditolak Midtrans dengan `transaction_details.order_id is too long`.

### midtrans-webhook

- **Trigger**: HTTP notification dari Midtrans.
- **Aksi**: validasi `signature_key` Midtrans dengan SHA-512 (`order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY`), cocokkan `gateway_reference`, validasi nominal, update status payment secara idempotent.
- **Efek sukses**: status payment `pending → paid`, lalu alur escrow/deposit berjalan dari event `payments.status`.
- **Konfigurasi WAJIB di luar repo**: URL Function ini harus didaftarkan di dashboard Midtrans (**Settings → Configuration → Payment Notification URL**). Tanpa itu tidak ada error di mana pun — Snap tetap sukses, tapi `payments.status` selamanya `pending`, `create-escrow` tidak pernah menyala, `campaigns.remainingBudget` tetap 0, dan campaign mandek sebagai draft dengan pesan "Dana campaign belum masuk". Cetak URL yang benar dengan:

  ```bash
  node 00_BACKEND/appwrite/ops/midtrans-webhook-url.mjs
  ```

- **`execute` harus `["any"]`**: Midtrans memanggil tanpa sesi Appwrite. Nilai lain membuat notifikasi ditolak 401 sebelum sampai ke kode.

### create-user-wallet

- **Trigger**: `users.create`.
- **Aksi**: buat dokumen `wallets` (`balance = 0`, `pendingBalance = 0`).

### create-escrow

- **Trigger**: `payments.status` `pending → paid`.
- **Aksi**: buat escrow (`held`), lock dana, update order status.

### release-escrow

- **Trigger**: `deliverables.status` → `approved`.
- **Aksi**: rilis escrow, tambah balance wallet Creator, catat transaksi `release`, update order.

### refund-escrow

- **Trigger**: manual (admin/Console/CLI untuk dispute) — payload `{ escrowId }` atau `{ orderId }`. `execute: []` (server-only).
- **Aksi**: escrow `held` → `refunded`, kredit `wallets.balance` UMKM sebesar `escrow.amount` utuh (fee TIDAK dikembalikan), catat ledger `refund` (deterministik, idempoten), notifikasi UMKM.
- **Idempotensi**: flip-first (escrow dulu, baru ledger & kredit) + ledger id deterministik `tx` + sha256(`${escrow.$id}:refund`). Event ulang menemukan escrow `refunded` → skip.
- **Rollback**: gagal kredit → hapus baris ledger `pending` (pola `request-withdrawal`).
- **Fee**: TIDAK dikembalikan — fee seller-side 2% dipotong saat release dari pendapatan kreator; fee buyer-side campaign tidak pernah masuk escrow. Kredit = persis `escrow.amount`.

### refund-order

- **Trigger**: manual (`{ orderId }` atau `{ campaignId }`) + event `orders.*.update` (auto saat order jadi `cancelled`/`expired`).
- **Aksi (orderId)**: order `cancelled`/`expired` → cari escrow `held` → refund sama dengan `refund-escrow`. Order `in_progress`/`completed` → 409.
- **Aksi (campaignId)**: campaign `cancelled`/`completed` dengan `remainingBudget > 0` → kredit UMKM wallet `remainingBudget`, zero-kan budget, ledger `refund` (`referenceType: "campaign"`), idempoten via ledger deterministik.
- **Event**: `databases.*.tables.orders.rows.*.update` — status jadi `cancelled`/`expired` DAN `oldStatus` berbeda → proses refund.
- **Fee**: TIDAK dikembalikan (sama seperti di atas).

### mature-pending-balance

- **Status**: legacy-retired 2026-08-25; `enabled: false`, `schedule: ""`, `execute: []`.
- **Retirement evidence**: staging memiliki zero wallet `pendingBalance > 0`, zero campaign release `status: "completed"`, dan zero mature ledger `status: "pending"`.
- **Source retention**: folder dan ledger type tetap disimpan untuk audit/history. Jangan aktifkan ulang atau hapus source tanpa inventory dan reconciliation baru.
- **Current reward path**: `calculate-campaign-reward` mengkredit `wallet.balance` langsung dan membuat release ledger `status: "matured"`.

### request-withdrawal

- **Trigger**: callable dari frontend (creator atau UMKM) — `execute: ["users"]`, identitas dari header `x-appwrite-user-id`.
- **Current result**: row `requested`, balance di-reserve/debit atomik, primary withdrawal ledger `pending`, lalu Function berhenti. Tidak ada network call ke Iris/payout provider.
- **Receipt**: `{ success, withdrawalId, status: "requested", requestedAt, balanceAfter, transactionId }`.
- **Debit ATOMIK (Fix B)**: `decrementColumn(balance, amount, 0)` dari `src/atomic.js` — Appwrite tak punya compare-and-set; baca-ubah-tulis bisa kehilangan mutasi saat dua request tumpang tindih. Min 0 ditegakkan server, bukan `Math.max` dari bacaan basi.
- **Reversal**: entry ledger BARU `withdrawal_reversal` id deterministik `tx` + sha256(`${withdrawalId}:reversal`) (T-17 append-only) + `wallets.balance` di-`incrementColumn`, withdrawal ditandai `reversed` + `reversed_at`. Gagal debit → hapus baris audit (pola lama, dipertahankan sampai T-17).
- **UMKM**: boleh withdraw — wajib `sourceOrigin` ∈ `{umkm_refund, umkm_budget}` DAN terbukti di ledger (`refund` batch ATAU pembayaran campaign lunas). Bukan cek role buta: validasi SUMBER SALDO. Kreator bebas.
- **Advanced guards**: first-withdraw email verification, KYC threshold, daily limit, dan account cooling hanya hard-block saat `WITHDRAWAL_ADVANCED_GUARDS_ENABLED=true`; default manual-admin MVP menonaktifkannya.
- **Idempotensi**: document id deterministik `wd` + sha256(`${userId}:${requestKey}`) — panggilan ulang requestKey sama → 409 sebelum mutasi. Ledger/notifikasi memakai id deterministik (`tx`/`ntf`).
- **Env policy**: `MINIMUM_WITHDRAW`, `CURRENT_TOS_VERSION`, dan `WITHDRAWAL_ADVANCED_GUARDS_ENABLED`; advanced-guard env lain dibaca hanya saat flag aktif.

### get-admin-withdrawal-queue

- **Trigger**: callable Admin — `execute: ["users"]`.
- **Aksi**: verifikasi active Admin server-side, validasi filter status/pagination, lalu kembalikan DTO operasional tanpa log data rekening sensitif.

### review-withdrawal

- **Trigger**: callable Admin — `execute: ["users"]`.
- **Actions**: `start_processing`, `mark_succeeded`, `fail`.
- **Success**: hanya `processing → succeeded`, wajib `transfer_reference`, update primary ledger ke `completed`, simpan processor/timestamps/note.
- **Failure**: `requested|processing → reversed`, wajib `failure_reason`, update primary ledger ke `failed`, buat deterministic `withdrawal_reversal`, dan kredit balance tepat sekali dalam Appwrite transaction.
- **Idempotency**: retry/lost commit response direkonsiliasi terhadap canonical rows; terminal transition tidak melakukan mutasi kedua.

### withdrawal-callback

- **Status**: legacy-retired 2026-08-25; `enabled: false`, `execute: []`.
- **Retirement evidence**: staging memiliki zero withdrawal `processing` dan zero row dengan `iris_reference`.
- **Source/history**: source dan nullable `iris_reference` dipertahankan untuk historical audit. Setup callback lama ditandai superseded di [101_Iris_Webhook_Security_Setup.md](101_Iris_Webhook_Security_Setup.md).

### verify-kyc

- **Trigger**: dipanggil INTERNAL (admin/Console/CLI) — `execute: []`, bukan dari browser.
- **Aksi**: `{ userId }` → `users.kyc_status = "verified"` + `kyc_verified_at`, notifikasi `kyc_verified`. Idempoten: user sudah `verified` → 200 tanpa mutasi ulang.
- **Alur dokumen**: verifikasi lewat WhatsApp admin (di luar sistem); fungsi ini cuma mencatat hasil.
- **Env**: `USERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`.

### get-umkm-finance-summary

- **Trigger**: dipanggil frontend (`executeFunction`), bukan event.
- **Execute**: authenticated users. Identitas dari header `x-appwrite-user-id`.
- **Output**: `{ finance: UmkmFinanceSummary, escrow: EscrowOverview }` — dua view-model sekaligus, supaya halaman Keuangan tidak memicu dua agregasi identik atas data yang sama.
- **Aksi**: agregasi `payments` + `transactions` + `campaigns` + `escrows` milik UMKM pemanggil.

Pemetaan angka:

| Field | Sumber |
| --- | --- |
| `totalExpenses` | Σ `payments.total_amount` berstatus `paid` (sudah termasuk fee) |
| `pendingPayments` | Σ `payments.total_amount` berstatus `pending` |
| `platformFees` | Σ `payments.fee_amount` berstatus `paid` — dibaca dari kolom, tidak dihitung ulang, karena tarif bisa berubah antar periode |
| `refundsReceived` | Σ `transactions.amount` bertipe `refund` (refund tidak melewati `payments`) |
| `successfulTransactionsCount` | jumlah `payments` berstatus `paid` |
| `campaignEscrow` | Σ `campaigns.remainingBudget` berstatus `active` / `paused` |
| `rateCardEscrow` | Σ `escrows.amount` berstatus `held` milik order UMKM ini |
| `activeEscrow` | `campaignEscrow + rateCardEscrow` |
| `pendingRelease` | escrow `held` yang order-nya berstatus `approved` — deliverable sudah disetujui, tinggal menunggu `release-escrow` |
| `refundEligible` | Σ `campaigns.remainingBudget` berstatus `completed` — sisa budget yang berhak kembali ke UMKM |

- `escrows` tidak menyimpan `umkmId`, jadi kepemilikan ditegakkan lewat daftar `orders` milik UMKM — bukan query langsung ke `escrows`.
- Read-only. Function ini tidak pernah memutasi saldo.

## Aturan Backend

- `MINIMUM_WITHDRAW = 50000` (Rp50.000) — **konstanta sistem** di service layer (`wallet.service.ts`). Lihat [ADR-007](../../04_Decisions/ADR-007.md).
- Withdrawal mengikuti manual Admin flow `requested → processing → succeeded|reversed`; Marketiv tidak memanggil automated payout provider.
- `mark_succeeded` berarti Admin sudah melakukan transfer manual dan wajib mencatat `transfer_reference`.
- Webhook Midtrans wajib valid signature dan nominal sebelum mengubah status payment.
- Handler webhook wajib idempotent terhadap notifikasi berulang.
- Payment yang sudah berstatus final (`paid`, `failed`, `expired`, `cancelled`) tidak boleh diturunkan statusnya oleh webhook berikutnya.
- Withdrawal yang sudah berstatus final (`succeeded`, `failed`, `reversed`) tidak boleh diubah oleh callback berikutnya.
- `balance` tidak boleh negatif — ditegakkan server lewat `decrementColumn` min 0, bukan `Math.max` dari bacaan yang mungkin basi.
- Escrow hanya bisa diubah oleh system/admin — tidak ada akses user.
- Setiap mutasi saldo harus tercatat di `transactions`.
