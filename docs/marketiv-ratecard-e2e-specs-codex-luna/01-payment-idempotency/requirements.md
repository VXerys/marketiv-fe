# Spec 01 — Requirements: One Active Payment per Rate Card Order

## Problem Statement

Current `create-payment` sudah memvalidasi:
- authenticated user,
- order milik UMKM tersebut,
- order `pending_payment`,
- amount sama persis dengan `order.amount`.

Namun current implementation membuat payment document + Midtrans transaction baru setelah validasi tersebut. Belum ada **race-safe idempotency boundary per order**.

Skenario berisiko:

1. UMKM klik Bayar.
2. Midtrans transaction dibuat.
3. UMKM kembali / refresh sebelum webhook mengubah order ke `in_progress`.
4. Order masih terlihat `pending_payment`.
5. Request `create-payment` kedua dapat membuat payment/gateway transaction baru.

UI `paying` state hanya mencegah double click pada satu mounted component. Itu **bukan financial authority**.

## Functional Requirements

### R1 — Server-side single payment guard
Untuk `purpose = order`, satu order hanya boleh memiliki satu payment yang masih berlaku pada satu waktu.

Status:
- `pending`: payment masih aktif dan harus direuse.
- `paid`: final paid; payment baru untuk order yang sama tidak boleh dibuat.
- `failed`, `expired`, `cancelled`: boleh membuat attempt baru.

### R2 — Retry must be idempotent
Jika request baru datang untuk order yang sudah memiliki payment `pending` yang valid:
- jangan buat payment document baru,
- jangan buat Midtrans transaction baru,
- kembalikan existing payment intent bila redirect/token sudah tersedia.

Jika existing payment masih dalam proses creation dan belum memiliki redirect/token:
- return state/conflict actionable,
- jangan membuat transaksi kedua.

### R3 — Race safety
Dua request paralel harus tetap menghasilkan maksimal:
- 1 active payment row,
- 1 active Midtrans order/reference untuk attempt tersebut.

Query-before-create **tidak cukup**. Harus ada constraint/lock/idempotency key server-side yang menangani race.

### R4 — Retry after terminal failure
Ketika payment menjadi `failed`, `expired`, atau `cancelled`, lock aktif harus dilepas secara authoritative agar UMKM dapat membuat payment attempt baru.

### R5 — Paid remains closed
Payment `paid` harus mempertahankan invariant bahwa order tersebut tidak dapat dibayar lagi.

### R6 — Campaign unaffected
Perubahan harus scoped ke `purpose = order`. Jangan mengubah Campaign payment semantics kecuali diperlukan untuk shared helper yang benar-benar backward-compatible.

### R7 — No client authority
Frontend boleh disable button dan menampilkan loading, tetapi tidak boleh menjadi satu-satunya idempotency mechanism.

## Security Requirements

- Ownership order tetap diverifikasi server-side.
- Exact amount validation tetap dipertahankan.
- `gateway_reference` tetap server-generated.
- Client tidak boleh mengirim status payment final.
- Webhook Midtrans tetap signature-verified.
- Tidak ada secret baru di `NEXT_PUBLIC_*`.

## Error / UX Requirements

Gunakan hasil yang dapat dibedakan:
- existing pending intent reused,
- payment already paid,
- payment currently being prepared,
- payment retry allowed after failed/expired/cancelled.

Jangan gunakan generic false-success.

## Backward Compatibility

- Payment rows lama tanpa field idempotency/lock tetap dapat dibaca.
- Existing paid order tidak boleh tiba-tiba menjadi payable.
- Existing Campaign payment tidak rusak.
