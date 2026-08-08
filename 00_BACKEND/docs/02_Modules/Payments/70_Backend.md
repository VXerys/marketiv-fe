# Payments — Backend

Dokumen ini khusus untuk Appwrite Functions dan aturan backend. Kontrak pemanggilan dari frontend dibahas di [60_API.md](60_API.md).

## Appwrite Functions

### cancel-payment

- **Trigger**: callable dari frontend saat user membatalkan payment yang masih `pending`.
- **Pola**: service `payment.service.ts:cancelPayment(paymentId)` → Function `cancel-payment`.
- **Aksi**: validasi kepemilikan + status `pending`, update status → `cancelled`.
- **Syarat**: payment `status = pending` (belum `paid`/`failed`/`expired`/`cancelled`).
- **Env wajib**: `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `PAYMENTS_COLLECTION_ID`.
- **Catatan**: Tidak memanggil Midtrans — hanya update status internal. Jika ingin void transaksi Midtrans, perlu integrasi tambahan.

### create-payment

- **Trigger**: callable dari frontend saat UMKM checkout order atau top up.
- **Aksi**: validasi user/order/amount, buat dokumen `payments`, panggil Midtrans, simpan `snapToken` dan/atau `redirectUrl`.
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

- **Trigger**: terjadwal, `0 2 * * *` (harian pukul 02:00).
- **Aksi**: cari `transactions` bertipe `release` dengan `referenceType: "campaign_submission"`, `status: "completed"`, dan berumur ≥ 7 hari. Untuk tiap baris: pindahkan `pendingBalance → balance` di wallet pemiliknya, tandai baris sumber `status: "matured"`, dan kirim notifikasi ke creator.
- **Idempotensi**: memakai pola `create-escrow` — baris ledger `mature` dengan id deterministik dibuat sebagai `pending` sebelum dana dipindah, lalu ditandai `completed`. Eksekusi yang terputus di tengah diselesaikan cron berikutnya, bukan diulang dari nol.
- **Catatan**: tanpa Function ini reward campaign mengendap permanen — `request-withdrawal` hanya membaca `balance`.

### request-withdrawal

- **Trigger**: callable dari frontend (creator atau UMKM) — `execute: ["users"]`, identitas dari header `x-appwrite-user-id`.
- **Alur 4-state**: `requested → processing → succeeded | failed | reversed`. Perubahan vs ADR-008 lama (withdrawal langsung `processed`): audit row dibuat segera (`requested`, saldo belum keluar), debit atomik, lalu async disbursement via Midtrans Iris.
- **Disbursement**: Midtrans **Iris** (B2B payout API, TERPISAH dari Snap — aktivasi + server key sendiri). POST `{base}/payouts`, body `{ payouts: [{ beneficiary_name, beneficiary_account, beneficiary_bank, amount (string), notes }] }`. Base sandbox `https://app.sandbox.midtrans.com/iris`, prod `https://app.midtrans.com/iris`. Auth Basic `base64(${serverKey}:)`. Iris menerima → `processing` + `iris_reference`; Iris menolak sync → `failed` + reversal.
- **Debit ATOMIK (Fix B)**: `decrementColumn(balance, amount, 0)` dari `src/atomic.js` — Appwrite tak punya compare-and-set; baca-ubah-tulis bisa kehilangan mutasi saat dua request tumpang tindih. Min 0 ditegakkan server, bukan `Math.max` dari bacaan basi.
- **Reversal**: entry ledger BARU `withdrawal_reversal` id deterministik `tx` + sha256(`${withdrawalId}:reversal`) (T-17 append-only) + `wallets.balance` di-`incrementColumn`, withdrawal ditandai `reversed` + `reversed_at`. Gagal debit → hapus baris audit (pola lama, dipertahankan sampai T-17).
- **UMKM**: boleh withdraw — wajib `sourceOrigin` ∈ `{umkm_refund, umkm_budget}` DAN terbukti di ledger (`refund` batch ATAU pembayaran campaign lunas). Bukan cek role buta: validasi SUMBER SALDO. Kreator bebas.
- **Gate berurutan**: role → T-14 TOS (`tos_version === CURRENT_TOS_VERSION` + `tos_accepted_at`) → T-15 email (khusus penarikan pertama) → KYC (nominal ≥ `KYC_THRESHOLD` wajib `verified`) → saldo cukup → rate limit → cooling akun → dup 60 dtk. Audit row dibuat PENGALING terakhir sebelum debit.
- **Rate limit (T-18, Pasal 11)**: maks `WITHDRAW_PER_DAY_LIMIT` (default 3)/hari dengan status ≠ `failed`, plus `WITHDRAW_COOLING_DAYS` (default 3) hari pending saat akun rekening baru/berubah (anti pola ganti-rekening-lalu-tarik). Dihitung di Function dari `listDocuments` (query ignore di mock/test).
- **KYC (Pasal 11.8)**: nominal ≥ `KYC_THRESHOLD` (default Rp5.000.000) dan `users.kyc_status ≠ verified` → 403 + `kyc_status` di-`pending_wa` (dokumen diverifikasi admin via WhatsApp, sistem cuma catat hasil).
- **Idempotensi**: document id deterministik `wd` + sha256(`${userId}:${requestKey}`) — panggilan ulang requestKey sama → 409 sebelum mutasi. Ledger/notifikasi memakai id deterministik (`tx`/`ntf`).
- **Env**: `MINIMUM_WITHDRAW`, `CURRENT_TOS_VERSION`, `KYC_THRESHOLD`, `WITHDRAW_PER_DAY_LIMIT`, `WITHDRAW_COOLING_DAYS`, `MIDTRANS_IRIS_SERVER_KEY`, `MIDTRANS_IRIS_ENV`.
- **Catatan**: Iris API key TERPISAH dari Snap; fallback ke `MIDTRANS_SERVER_KEY` hanya supaya sandbox/test tanpa env Iris tetap jalan.

### withdrawal-callback

- **Trigger**: HTTP notification dari Midtrans Iris (callable tanpa sesi) — `execute: ["any"]`, ala `midtrans-webhook`.
- **Aksi**: lookup withdrawal via `iris_reference`, tutup status final. Iris `completed`/`settled` → `succeeded` + `processedAt`; Iris `failed` → `failed` + `failure_reason` + reversal (kredit balik idempoten).
- **Reversal** out-of-band (Iris terima dulu `processing`, lalu gagal belakangan): sama seperti `request-withdrawal` — ledger `withdrawal_reversal` deterministik + `reversed`.
- **Idempotensi DOUBLE-SOURCE**: (1) status terminal (`succeeded`/`failed`/`reversed`) → 200 tanpa mutasi; (2) ledger reversal id deterministik — callback terkirim ulang tidak pernah kredit dobel.
- **Auth**: shared secret via header `x-iris-callback-token` — Function membandingkan dengan env var `IRIS_CALLBACK_SECRET`. Request tanpa token yang cocok → `401`, tidak ada mutasi. Backward-compatible: jika env tidak di-set, semua request diizinkan (tidak boleh dibiarkan di production). Panduan setup lengkap (generate token, set Appwrite env var, konfigurasi Midtrans Iris): [101_Iris_Webhook_Security_Setup.md](101_Iris_Webhook_Security_Setup.md).
- **Env**: `WITHDRAWALS_COLLECTION_ID`, `WALLETS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`, `IRIS_CALLBACK_SECRET`.

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
- Withdrawal mengikuti alur 4-state (`requested → processing → succeeded | failed | reversed`) — disbursement async via Midtrans Iris, status final ditutup `withdrawal-callback`.
- Secret key Midtrans hanya disimpan sebagai environment variable Appwrite Function. Iris memakai server key sendiri (`MIDTRANS_IRIS_SERVER_KEY`).
- Webhook Midtrans wajib valid signature dan nominal sebelum mengubah status payment.
- Handler webhook wajib idempotent terhadap notifikasi berulang.
- Payment yang sudah berstatus final (`paid`, `failed`, `expired`, `cancelled`) tidak boleh diturunkan statusnya oleh webhook berikutnya.
- Withdrawal yang sudah berstatus final (`succeeded`, `failed`, `reversed`) tidak boleh diubah oleh callback berikutnya.
- `balance` tidak boleh negatif — ditegakkan server lewat `decrementColumn` min 0, bukan `Math.max` dari bacaan yang mungkin basi.
- Escrow hanya bisa diubah oleh system/admin — tidak ada akses user.
- Setiap mutasi saldo harus tercatat di `transactions`.
