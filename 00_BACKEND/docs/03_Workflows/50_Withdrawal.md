# Workflow: Withdrawal

## Purpose

Creator menarik saldo available dari wallet ke bank/e-wallet. Proses langsung cair tanpa review admin.

## Modules Involved

- [Payments](../02_Modules/Payments/00_Index.md) — wallet, withdrawal, transaksi.
- [Notifications](../02_Modules/Notifications/00_Index.md) — notifikasi status penarikan.

## Trigger

Creator submit form `Tarik Dana` dari halaman Wallet (input: payoutMethod, providerName, accountNumber, accountName, amount).

## Data Model — Collection yang Terlibat

| Collection | Modul | Aksi |
|---|---|---|
| `wallets` | Payments | kurangi balance |
| `withdrawals` | Payments | insert record |
| `transactions` | Payments | insert transaksi |
| `notifications` | Notifications | insert notifikasi |

## Step-by-step Flow

### Tahap 1: Request & Process Withdrawal

1. **Payments** — Creator buka halaman Wallet → klik "Tarik Dana".
2. **Payments** — Tampilkan saldo available (`wallet.balance`), minimum withdraw amount (**Rp50.000**, konstanta sistem — lihat [ADR-007](../04_Decisions/ADR-007.md)).
3. **Payments** — Creator isi form: `{ payoutMethod, providerName, accountNumber, accountName, amount }`.
4. **Payments** — `requestWithdraw()` menjalankan validasi:
   - `wallet.balance >= amount`
   - `amount >= MINIMUM_WITHDRAW` (konstanta sistem = `Rp50.000` / `50.000`, lihat [ADR-007](../04_Decisions/ADR-007.md))
   - `amount > 0`
   - `payoutMethod` adalah `bank` atau `ewallet`
   - `providerName`, `accountNumber`, dan `accountName` terisi
5. **Jika validasi gagal** — tampilkan error: "Saldo tidak mencukupi" / "Minimum penarikan Rp50.000".
6. **Jika validasi lolos** — Proses langsung:
   - Kurangi `wallet.balance -= amount`.
   - Buat `withdrawals`: `{ userId, amount, payoutMethod, providerName, accountNumber, accountName, status: 'processed', processedAt: now }`.
   - Buat `transactions`: `{ userId, amount: -amount, type: 'withdrawal', referenceType: 'withdrawal', referenceId: withdrawalId, status: 'completed' }`.
7. **Notifications** — Notifikasi ke creator: "Penarikan Rp{amount} berhasil — cek rekeningmu".

## State Transitions

```text
WITHDRAWAL:  (langsung processed)
WALLET:      balance -= amount
```

## Events / Functions

| Trigger | Function | Aksi |
|---|---|---|
| Dipanggil frontend (`executeFunction`) | `request-withdrawal` | Validasi peran & saldo, buat `withdrawals`, debit `wallets.balance`, catat `transactions` |
| Scheduled (harian, 02:00) | `mature-pending-balance` | Memindahkan reward campaign ≥ 7 hari dari `pendingBalance` ke `balance` sehingga bisa ditarik |

`wallets` dan `transactions` punya `$permissions: []` + rowSecurity, jadi browser tidak bisa mendebit saldo — debit wajib lewat Function.

## Validation Rules per Langkah

| Langkah | Validasi | Gagal → |
|---|---|---|
| Request withdrawal | `users.role === "creator"` | `403` "Hanya kreator yang dapat menarik saldo." |
| Request withdrawal | `wallet.balance >= amount` | Error "Saldo tidak mencukupi" |
| Request withdrawal | `amount >= MINIMUM_WITHDRAW` | Error "Minimum withdraw Rp50.000" |
| Request withdrawal | `amount > 0` | Error "Jumlah tidak valid" |
| Request withdrawal | `payoutMethod` valid (`bank` atau `ewallet`) | Error "Metode penarikan tidak valid" |
| Request withdrawal | Data tujuan pencairan lengkap | Error "Lengkapi data penarikan" |

## Notifikasi

| Titik | Notifikasi | Penerima |
|---|---|---|
| Withdrawal processed | "Penarikan Rp{amount} berhasil — cek rekeningmu" | Creator |

## Edge Cases

- **Saldo kurang dari amount** — ditolak saat validasi awal.
- **Amount di bawah minimum withdraw** — ditolak.
- **Hanya saldo available yang bisa ditarik** — `pendingBalance` dan `escrowBalance` tidak bisa ditarik. Reward campaign masuk ke `pendingBalance` lebih dulu dan baru bisa ditarik setelah dimatangkan `mature-pending-balance` (H+7).
- **UMKM mengajukan withdrawal** — ditolak `403`. Saldo UMKM diisi untuk membayar campaign/order, bukan untuk dicairkan.
- **Withdrawal diakses saat wallet dibekukan** — jika user `status: suspended`, withdrawal tidak bisa diajukan.
- **Transfer gagal di sisi bank/e-wallet** — di luar tanggung jawab platform. Dana sudah keluar dari wallet sistem.

## Links

- [Payments](../02_Modules/Payments/00_Index.md)
- [Notifications](../02_Modules/Notifications/00_Index.md)
- [Dispute workflow](60_Dispute.md)
