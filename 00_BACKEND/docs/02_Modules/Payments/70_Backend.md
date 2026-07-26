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

### midtrans-webhook

- **Trigger**: HTTP notification dari Midtrans.
- **Aksi**: validasi `signature_key` Midtrans dengan SHA-512 (`order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY`), cocokkan `gateway_reference`, validasi nominal, update status payment secara idempotent.
- **Efek sukses**: status payment `pending → paid`, lalu alur escrow/deposit berjalan dari event `payments.status`.

### create-user-wallet

- **Trigger**: `users.create`.
- **Aksi**: buat dokumen `wallets` (`balance = 0`, `pendingBalance = 0`).

### create-escrow

- **Trigger**: `payments.status` `pending → paid`.
- **Aksi**: buat escrow (`held`), lock dana, update order status.

### release-escrow

- **Trigger**: `deliverables.status` → `approved`.
- **Aksi**: rilis escrow, tambah balance wallet Creator, catat transaksi `release`, update order.

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
