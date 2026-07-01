# Payments — Business Rules

## Balance vs Pending Balance

- `balance` — saldo tersedia, dapat ditarik (withdraw).
- `pendingBalance` — saldo belum cair (mis. reward submission yang menunggu, atau dana dalam proses).
- Saat escrow dirilis untuk order, saldo masuk ke wallet creator (lihat `90_Events.md`).

## Tipe Transaksi

`deposit | withdrawal | payment | refund | release | fee`

- `deposit` — dana masuk (top up).
- `withdrawal` — pencairan dana keluar.
- `payment` — pembayaran order oleh UMKM.
- `refund` — pengembalian dana.
- `release` — pelepasan escrow ke creator.
- `fee` — biaya platform.

## Escrow

- Status `held | released | refunded`.
- `held` — dana ditahan saat pembayaran order sukses.
- `released` — dirilis ke creator saat deliverable di-approve.
- `refunded` — dikembalikan ke UMKM (mis. order dibatalkan).
- Escrow tidak boleh disentuh user (Admin/System only).

## Withdraw

Permintaan withdraw valid bila:

- Jumlah ≥ **minimum withdraw**.
- `balance ≥ amount`.
- Memerlukan **persetujuan admin** (admin gate) sebelum dana ditransfer.

> Escrow & transactions disimpan terpisah (`50_Database.md`). Aggregate order: `../../04_Decisions/ADR-003.md`.
