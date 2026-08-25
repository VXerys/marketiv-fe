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

### Reward Campaign dan legacy pendingBalance

- Reward Campaign baru (`calculate-campaign-reward`) langsung masuk `balance` setelah submission di-approve Admin dan reward event selesai.
- Ledger reward baru memakai `status: "matured"` agar tidak pernah masuk jalur maturation legacy.
- `pendingBalance` dipertahankan untuk historical compatibility/reconciliation, bukan untuk reward Campaign baru.
- Audit staging 2026-08-25 menemukan zero `pendingBalance > 0` dan zero campaign release belum matured. Schedule `mature-pending-balance` dinonaktifkan; source tetap disimpan untuk audit.
- Rilis escrow order (`release-escrow`) juga langsung masuk `balance`.

## Tipe Transaksi

`withdrawal | payment | refund | release | fee | mature | withdrawal_reversal`

- `withdrawal` — pencairan dana keluar.
- `payment` — pembayaran order oleh UMKM.
- `mature` — pemindahan reward dari `pendingBalance` ke `balance`. Bukan pendapatan baru, jadi jangan ikut dijumlahkan sebagai earnings (`get-creator-dashboard-summary` hanya menghitung `release`).
- `refund` — pengembalian dana.
- `release` — pelepasan escrow ke creator.
- `fee` — biaya platform.
- `withdrawal_reversal` — kredit balik saat withdrawal gagal (T-17 append-only, id deterministik). Bukan withdrawal baru, jangan dihitung sebagai pencairan.

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
- Wajib setuju T&C terbaru (T-14) dan email terverifikasi untuk penarikan pertama (T-15).

### Alur manual Admin

- `requested` — request diterima, saldo sudah di-reserve atomik, transaction awal `pending`.
- `processing` — Admin mulai memproses transfer manual.
- `succeeded` — Admin sudah memastikan transfer berhasil dan mengisi `transfer_reference`; transaction awal `completed`.
- `reversed` — Admin menolak/transfer gagal, balance dikredit balik tepat sekali, transaction awal `failed`, dan ledger `withdrawal_reversal` dibuat.
- `requested → succeeded` langsung ditolak. Finalitas transfer hanya boleh ditetapkan trusted Admin Function.

Copy user-facing: **“umumnya diproses dalam 1–2 hari kerja”**. Jangan menjanjikan SLA keras.

### Advanced Guards

- Email verification first-withdraw, KYC threshold, daily limit, dan changed-account cooling hanya hard-block bila `WITHDRAWAL_ADVANCED_GUARDS_ENABLED=true`.
- Default manual-admin MVP: env absent/bukan `true` berarti advanced guards disabled dan request tidak mengubah `kyc_status` menjadi `pending_wa`.
- Auth, eligible role/provenance, active account, T&C, minimum amount, payout destination, sufficient balance, idempotency, atomic reserve, recent duplicate protection, dan no-negative-balance tetap wajib.

### Rate Limit & Cooling

- Recent 60-second duplicate protection selalu aktif.
- Daily limit dan changed-account cooling mengikuti advanced-guard flag di atas.

### UMKM (Pasal 15.1.c)

- UMKM BUKAN diblokir dari withdraw — boleh menarik saldo yang berasal dari **refund** atau **sisa budget campaign**.
- Validasi pada SUMBER SALDO (ledger), bukan role: `sourceOrigin` ∈ `{umkm_refund, umkm_budget}` + terbukti di `transactions` (`refund` atau pembayaran campaign lunas).

### Idempotensi

- Document id deterministik `wd` + sha256(`${userId}:${requestKey}`) — retry requestKey sama → 409.
- Debit saldo ATOMIK (`decrementColumn` min 0, Fix B) — baca-ubah-tulis bisa kehilangan mutasi saat dua request tumpang tindih.
- Reversal idempoten: ledger `withdrawal_reversal` id deterministik `tx` + sha256(`${withdrawalId}:reversal`); kredit balik tidak pernah dobel.

> Escrow & transactions disimpan terpisah (`50_Database.md`). Aggregate order: `../../04_Decisions/ADR-003.md`.
