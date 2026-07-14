# Payments — Database

Sumber kebenaran skema koleksi milik modul Payments. Satu fakta = satu lokasi. Escrow & transactions sengaja **dipisah**.

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

Permintaan pencairan dana. Relasi: merujuk user (FK → users).

| Attribute     | Type    | Required | Catatan                       |
| ------------- | ------- | -------- | ----------------------------- |
| userId        | string  | yes      | FK → users                    |
| amount        | integer | yes      |                               |
| bankName      | string  | yes      |                               |
| accountNumber | string  | yes      |                               |
| accountName   | string  | yes      |                               |
| status        | enum    | yes      | `pending\|processed\|rejected`|

**Index**: `userId`, `status`, `createdAt DESC`.

**Permission**: User create · Admin approve.

> `orderId` merujuk koleksi milik modul Orders (`../Orders/50_Database.md`). Aturan saldo, tipe transaksi, status escrow & withdraw: `30_Business_Rules.md`.
