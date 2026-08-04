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
- Withdrawal langsung diproses oleh `requestWithdraw()` tanpa admin review.
- Secret key Midtrans hanya disimpan sebagai environment variable Appwrite Function.
- Webhook Midtrans wajib valid signature dan nominal sebelum mengubah status payment.
- Handler webhook wajib idempotent terhadap notifikasi berulang.
- Payment yang sudah berstatus final (`paid`, `failed`, `expired`, `cancelled`) tidak boleh diturunkan statusnya oleh webhook berikutnya.
- `balance` tidak boleh negatif.
- Escrow hanya bisa diubah oleh system/admin — tidak ada akses user.
- Setiap mutasi saldo harus tercatat di `transactions`.
