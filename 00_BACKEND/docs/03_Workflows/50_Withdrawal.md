# Workflow: Withdrawal

## Purpose

Creator atau UMKM yang memiliki saldo eligible mengajukan withdrawal. Saldo langsung di-reserve, lalu Admin Marketiv mencatat hasil transfer manual.

## Current Flow

```text
Campaign submission approved
→ reward langsung masuk wallet.balance
→ user membuat withdrawal request
→ request-withdrawal melakukan reserve/debit atomik
→ withdrawal requested + transaction pending
→ Admin mulai proses
→ withdrawal processing
→ Admin transfer manual di luar Marketiv
→ succeeded + transaction completed
```

Jika request ditolak atau transfer gagal:

```text
requested|processing
→ Admin memilih fail
→ balance dikredit balik tepat sekali
→ withdrawal reversed
→ withdrawal_reversal ledger dibuat
→ transaction withdrawal awal menjadi failed
```

## Functions

| Caller | Function | Responsibility |
|---|---|---|
| Creator/UMKM | `request-withdrawal` | Validasi policy/provenance, buat row `requested`, reserve balance atomik, buat ledger `pending` |
| Admin | `get-admin-withdrawal-queue` | List queue operasional dengan active-admin authorization |
| Admin | `review-withdrawal` | `start_processing`, `mark_succeeded`, atau `fail`; reversal idempoten |

Browser tidak boleh mengubah `wallets`, `withdrawals.status`, atau final transaction state secara langsung.

## State Machine

```text
requested
   ├── start_processing → processing
   │                       ├── mark_succeeded → succeeded
   │                       └── fail/reject → reversed
   │
   └── fail/reject → reversed
```

Terminal state: `succeeded`, `reversed`.

- `requested`: saldo sudah di-reserve; transfer belum dilakukan.
- `processing`: Admin sedang menjalankan transfer manual.
- `succeeded`: Admin telah memastikan transfer berhasil dan mengisi `transfer_reference`.
- `reversed`: withdrawal gagal/ditolak dan balance sudah dikembalikan tepat sekali.
- `requested → succeeded` langsung tidak diizinkan.

Success path:

- withdrawal: `processing → succeeded`.
- primary withdrawal transaction: `pending → completed`.
- wallet: tidak berubah lagi saat `succeeded`.

Failure/reversal path:

- withdrawal: `requested | processing → reversed` langsung.
- primary withdrawal transaction: `pending → failed`.
- deterministic `withdrawal_reversal` transaction: `completed`.
- wallet: dikredit kembali tepat satu kali.

`failed` tetap dapat ada dalam schema/status vocabulary sebagai legacy state atau internal/recovery marker, dan tetap dipakai sebagai transaction status. Namun, `failed` bukan intermediate authoritative withdrawal state pada current manual-admin rejection path; action `fail` langsung menulis `withdrawal.status = reversed`.

## Validation and Audit Rules

- Minimum withdrawal Rp50.000.
- Payout destination wajib lengkap dan valid.
- `wallet.balance` tidak boleh negatif.
- `requestKey` deterministik mencegah double debit saat retry.
- Admin authority diverifikasi server-side; role dari payload tidak dipercaya.
- `mark_succeeded` wajib memiliki `transfer_reference`.
- `fail` wajib memiliki `failure_reason`.
- Reversal memakai ledger append-only `withdrawal_reversal` dengan ID deterministik.
- Successful transfer dapat ditelusuri lewat withdrawal ID, amount, destination, `processed_by`, timestamps, `transfer_reference`, dan optional `admin_note`.
- Copy operasional: “umumnya diproses dalam 1–2 hari kerja”; bukan SLA keras.

## Reward Availability and Legacy State

- Reward Campaign baru langsung masuk `wallet.balance` setelah admin approval dan reward Function selesai.
- `pendingBalance` tetap ada untuk kompatibilitas/historical reconciliation, tetapi tidak dipakai reward Campaign baru.
- Audit staging 2026-08-25 menemukan zero wallet dengan `pendingBalance > 0` dan zero campaign release berstatus `completed`; schedule `mature-pending-balance` kemudian dinonaktifkan.
- Source `mature-pending-balance` dipertahankan untuk audit. Jangan jalankan ulang tanpa inventory dan reconciliation baru.

## Provider Boundaries

- Withdrawal baru tidak memanggil Midtrans Iris atau payout provider lain.
- `withdrawal-callback` adalah legacy Iris callback. Audit staging 2026-08-25 menemukan zero withdrawal `processing` dan zero row dengan `iris_reference`; Function dinonaktifkan dan public execute dicabut.
- `midtrans-webhook` tetap aktif untuk payment/Snap UMKM. Retirement withdrawal tidak boleh mengubah Function tersebut.

## Links

- [Payments business rules](../02_Modules/Payments/30_Business_Rules.md)
- [Payments backend](../02_Modules/Payments/70_Backend.md)
- [Payments database](../02_Modules/Payments/50_Database.md)
