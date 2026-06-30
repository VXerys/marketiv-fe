# Business Rules: <Nama Modul>

## Rules

1. <Aturan bisnis, ditulis sebagai pernyataan yang dapat diuji.>
2. <Aturan berikutnya.>

## Statuses / Enums

- **`<field>`**: `<status_a>` → `<status_b>` → `<status_c>`.
  - `<status_a>` — <arti & kapan>.
- **`<enum lain>`**: `<nilai1>`, `<nilai2>`.

## Validations

- <field/aksi> — <syarat validasi, mis. amount >= min, URL valid>.

## Invariants

- <kondisi yang harus selalu benar, mis. release + refund = jumlah escrow; tidak ada saldo hilang>.
