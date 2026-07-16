# Payments — Database

Sumber kebenaran skema koleksi milik modul Payments. Satu fakta = satu lokasi. Payments, escrow & transactions sengaja **dipisah**.

---

## wallets

Satu wallet per user. Relasi: User (1) → Wallet (1); Wallet (1) → Transactions (N).

| Attribute      | Type    | Required | Catatan                       |
| -------------- | ------- | -------- | ----------------------------- |
| userId         | string  | yes      | FK → users (unik)             |
| balance        | integer | yes      | saldo tersedia                |
| pendingBalance | integer | yes      | saldo belum cair              |

**Index**: `userId (unique)`.

**Permission**: Owner read · Admin write (user tidak boleh ubah saldo sendiri).

---

## payments

Payment intent lokal untuk pembayaran yang diproses oleh Midtrans. Relasi: Order (0..1) → Payment (1), User/UMKM (1) → Payments (N).

| Attribute        | Type    | Required | Catatan                                                       |
| ---------------- | ------- | -------- | ------------------------------------------------------------- |
| user_id          | string  | yes      | FK → users, pembayar                                          |
| order_id         | string  | no       | FK → orders untuk pembayaran order                            |
| campaign_id      | string  | no       | FK → campaigns untuk top-up campaign                          |
| amount           | integer | yes      | nominal transaksi (sebelum fee)                                |
| total_amount     | integer | yes      | nominal + fee platform (yang dibayar ke Midtrans)             |
| fee_amount       | integer | no       | jumlah fee platform (5% dari amount)                          |
| purpose          | enum    | yes      | `order\|topup\|campaign`                                      |
| gateway          | enum    | yes      | `midtrans`                                                    |
| gateway_reference| string  | yes      | `order_id` Midtrans, unik                                     |
| snap_token       | string  | no       | token Snap Midtrans                                           |
| redirect_url     | string  | no       | URL pembayaran Midtrans                                       |
| status           | enum    | yes      | `pending\|paid\|failed\|expired\|cancelled`                 |
| paid_at          | datetime| no       | waktu status berubah ke `paid`                                |

**Index**: `gateway_reference (unique)`, `order_id`, `campaign_id`, `user_id`, `status`, `purpose`, `createdAt DESC`.

**Permission**: Owner read · System write · Admin read.

---

## transactions

Ledger mutasi saldo. Relasi: Wallet/User (1) → Transactions (N).

| Attribute     | Type    | Required | Catatan                                                  |
| ------------- | ------- | -------- | -------------------------------------------------------- |
| userId        | string  | yes      | FK → users                                               |
| amount        | integer | yes      |                                                          |
| type          | enum    | yes      | `deposit\|withdrawal\|payment\|refund\|release\|fee`     |
| referenceId   | string  | no       | id dokumen terkait (order/escrow/withdrawal)             |
| referenceType | string  | no       | jenis referensi                                          |
| status        | enum    | yes      | status transaksi                                         |

**Index**: `userId`, `referenceId`, `referenceType`, `status`, `createdAt DESC`.

**Permission**: Owner read · System write · Admin read.

---

## escrows

Dana ditahan per order. Relasi: Order (1) → Escrow (1).

| Attribute | Type    | Required | Catatan                       |
| --------- | ------- | -------- | ----------------------------- |
| orderId   | string  | yes      | FK → orders (unik)            |
| amount    | integer | yes      |                               |
| status    | enum    | yes      | `held\|released\|refunded`    |

**Index**: `orderId (unique)`, `status`.

**Permission**: Admin/System only (tidak boleh disentuh user).

---

## withdrawals

Riwayat pencairan dana. Langsung processed tanpa review admin.

| Attribute     | Type     | Required | Catatan                                      |
| ------------- | -------- | -------- | -------------------------------------------- |
| userId        | string   | yes      | FK → users                                   |
| amount        | integer  | yes      | nominal dalam Rupiah                         |
| payoutMethod  | enum     | yes      | `bank\|ewallet`                              |
| providerName  | string   | yes      | nama bank atau provider e-wallet             |
| accountNumber | string   | yes      | nomor rekening atau nomor akun/HP e-wallet   |
| accountName   | string   | yes      | nama pemilik rekening atau akun e-wallet     |
| status        | enum     | yes      | `processed`                                  |
| processedAt   | datetime | yes      | waktu proses                                 |

**Index**: `userId`, `createdAt DESC`.

**Permission**: User create · User read · System write.

> `orderId` merujuk koleksi milik modul Orders (`../Orders/50_Database.md`). Aturan saldo, tipe transaksi, status escrow & withdraw: `30_Business_Rules.md`.
