# Payments — Business Rules

## Payment Gateway

- Marketiv menggunakan **Midtrans** sebagai payment gateway resmi untuk MVP.
- Frontend tidak boleh memanggil Midtrans menggunakan secret key; semua request pembuatan transaksi dilakukan lewat Appwrite Function.
- Payment order/top up dibuat dengan status awal `pending` dan `gateway = midtrans`.
- `gateway_reference` harus berisi `order_id` Midtrans dan unik untuk mencegah duplikasi webhook.
- Status `paid` hanya boleh diset oleh Appwrite Function setelah signature webhook Midtrans valid dan nominal pembayaran sesuai.
- Signature Midtrans dihitung dengan SHA-512 dari `order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY` dan dibandingkan dengan `signature_key`.
- Webhook Midtrans harus idempotent: notifikasi berulang untuk `gateway_reference` yang sama tidak boleh menggandakan escrow, deposit, atau transaksi ledger.
- Mapping status internal:
  - `settlement` → `paid`.
  - `capture` + `fraud_status = accept` → `paid`.
  - `capture` + `fraud_status = challenge` atau `pending` → `pending`.
  - `deny` / `failure` → `failed`.
  - `expire` → `expired`.
  - `cancel` / `refund` / `partial_refund` / `chargeback` / `partial_chargeback` → `cancelled`.

## Balance vs Pending Balance

- `balance` — saldo tersedia, dapat ditarik (withdraw).
- `pendingBalance` — saldo belum cair (mis. reward submission yang menunggu, atau dana dalam proses).
- Saat escrow dirilis untuk order, saldo masuk ke wallet creator (lihat `90_Events.md`).

### Pematangan pendingBalance

- Reward campaign (`calculate-campaign-reward`) masuk ke `pendingBalance`, **bukan** `balance`.
- **Masa tunggu 7 hari** sejak baris `transactions` reward dibuat. Jeda ini memberi jendela koreksi kalau fraud baru ketahuan setelah UMKM menyetujui submission.
- Function terjadwal `mature-pending-balance` (harian, 02:00) memindahkan reward yang sudah lewat masa tunggu: `pendingBalance -= amount`, `balance += amount`.
- Baris `transactions` sumber ditandai `status: "matured"` agar tidak diproses dua kali; pemindahannya sendiri dicatat sebagai baris ledger baru bertipe `mature`.
- Rilis escrow order (`release-escrow`) **tidak** lewat jalur ini — dana order langsung masuk `balance`.

## Tipe Transaksi

`withdrawal | payment | refund | release | fee | mature`

- `withdrawal` — pencairan dana keluar.
- `payment` — pembayaran order oleh UMKM.
- `mature` — pemindahan reward dari `pendingBalance` ke `balance`. Bukan pendapatan baru, jadi jangan ikut dijumlahkan sebagai earnings (`get-creator-dashboard-summary` hanya menghitung `release`).
- `refund` — pengembalian dana.
- `release` — pelepasan escrow ke creator.
- `fee` — biaya platform.

## Escrow

- Status `held | released | refunded`.
- `held` — dana ditahan saat pembayaran order sukses.
- `released` — dirilis ke creator saat deliverable di-approve.
- `refunded` — dikembalikan ke UMKM (mis. order dibatalkan).
- Escrow tidak boleh disentuh user (Admin/System only).

## Refund (Pasal 15 T&C)

Refund mengembalikan dana ke **Wallet UMKM** (Opsi B, locked). Fee platform **tidak dikembalikan** (biaya layanan terpakai, CTO-26).

### Pemicu Refund

| Pemicu | Jalur | Kredit ke UMKM |
|--------|-------|----------------|
| Order dibatalkan/expired (`cancelled`/`expired`) | Otomatis via event `orders.*.update` → `refund-order` | `escrow.amount` (utuh) |
| Dispute admin | Manual via Console/CLI → `refund-escrow` / `refund-order` | `escrow.amount` (utuh) |
| Sisa budget campaign (`cancelled`/`completed`) | Manual → `refund-order` (`campaignId`) | `remainingBudget` (utuh) |

### Aturan Refund

- **Fee tidak dikembalikan**: Fee seller-side 2% dipotong saat release dari pendapatan kreator; fee buyer-side campaign tidak pernah masuk escrow. Kredit UMKM = persis `escrow.amount` atau `remainingBudget`.
- **Escrow status**: `held` → `refunded` (flip-first idempoten). `released`/`refunded` sudah tidak bisa di-refund.
- **Ledger**: setiap refund membuat entry `transactions` baru bertipe `refund` (`referenceType: "escrow"` atau `"campaign"`). Koreksi = entry baru (T-17), tidak update/delete lama.
- **Idempotensi**: ledger id deterministik (`tx` + sha256(`${refId}:refund`)) + guard status escrow.
- **Wallet UMKM**: saldo refund masuk ke `wallets.balance`. Fitur withdrawal UMKM (T-06) memakai saldo ini — refund menyiapkan sumber saldonya.

## Platform Fee

Marketiv membebankan **biaya platform 2%** dengan model berbeda per modul (lihat ADR-008):

### Rate Card Order (Seller Side)

Fee dipotong dari pendapatan creator saat escrow release.

```text
UMKM bayar:  Rp200.000 (harga paket)
Escrow:      Rp200.000
Saat rilis:
  Creator:   Rp200.000 - Rp4.000 = Rp196.000
  Platform:  Rp4.000 (fee 2%)
```

### Campaign Top-Up (Buyer Side)

Fee ditambahkan ke total pembayaran UMKM saat top-up.

```text
UMKM bayar:  Rp100.000 + Rp2.000 = Rp102.000
Budget:      Rp100.000 (penuh untuk reward)
Platform:    Rp2.000 (fee 2%)
```

**Aturan umum:**
- Fee dicatat sebagai transaksi `fee` di ledger (`transactions`) tanpa memengaruhi wallet user.
- Perubahan nilai fee di masa depan memerlukan update kode + redeploy (konstanta sistem, lihat ADR-008).

## Minimum Campaign Budget

Setiap campaign PPV wajib memiliki **minimum budget Rp50.000** (`50.000`).

- Validasi dilakukan saat `createCampaign()` — budget < Rp50.000 ditolak.
- Budget + fee 2% = total yang dibayar UMKM saat top-up.
- Konsisten dengan minimum withdraw Rp50.000 (ADR-007).

## Withdraw

Permintaan withdraw valid bila:

- Jumlah ≥ **minimum withdraw** = `Rp50.000` (`50.000`) — **konstanta sistem**, lihat [ADR-007](../../04_Decisions/ADR-007.md).
- `balance ≥ amount`.
- Tujuan pencairan wajib memakai `payoutMethod = bank` atau `ewallet`.
- `providerName`, `accountNumber`, dan `accountName` wajib terisi untuk bank maupun e-wallet.
- Withdrawal **langsung diproses** tanpa review admin. Dana langsung keluar dari wallet.

> Escrow & transactions disimpan terpisah (`50_Database.md`). Aggregate order: `../../04_Decisions/ADR-003.md`.
