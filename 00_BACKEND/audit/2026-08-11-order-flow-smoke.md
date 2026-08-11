# Smoke Test Order Flow — 2026-08-11

- **Tanggal**: Selasa, 11 Agustus 2026
- **Scope**: verifikasi live pasca-remediasi `UMKM-OPS-01`
- **Tujuan**: buktikan jalur order kritis masih jalan setelah aktivasi deployment
  terbaru dan pembuatan function `cancel-order`

## Catatan penting

`cancel-order` tidak bisa diverifikasi pada order yang sama dengan `create-escrow`.
Root cause: `cancel-order` hanya menerima `orders.status = "pending_payment"`,
sedangkan `create-escrow` mengubah order menjadi `in_progress`.

Karena itu smoke dipecah menjadi 2 cabang:

1. **Paid path**
   `create-order -> create-escrow`
2. **Cancel path**
   `create-order -> cancel-order`

## Metode eksekusi

- `create-order` dan `create-escrow`
  dipicu via Appwrite Function execution, sehingga punya `executionId` live.
- `accept-tos` dan `cancel-order`
  diverifikasi via local invoke source function ke live DB.
  Alasannya teknis: Appwrite `POST /functions/{id}/executions` menolak header
  `x-appwrite-*`, padahal dua function ini butuh `x-appwrite-user-id`.
- Setup row `payments`
  dibuat via Admin API (`TablesDB createRow`) agar `create-escrow` bisa diuji
  tanpa bergantung pada jalur user-context `create-payment`.

## Actor smoke

- **Creator**: `test-user-001`
- **UMKM**: `6a699a5a002a13ca4d76`
- **Nominal uji**: `10000`

## Evidence hasil

### TOS setup

- Mode: `local-invoke`
- Result:

```json
{
  "success": true,
  "alreadyAccepted": true,
  "tos_version": "v3.1"
}
```

### Paid path

- Offer ID: `smokeordpay20260811010445`
- Order ID: `6a7a752d003b75d71ca6`
- Payment ID: `smokepay20260811010445`
- Escrow ID: `6a7a75340015a22f1d8a`
- `create-order` execution ID: `6a7a752dd5e0c8e89334`
- `create-escrow` execution ID: `6a7a752e4b96df9ee4b9`
- Verifikasi row akhir:
  - `orders.status = "in_progress"`
  - `escrows.orderId = 6a7a752d003b75d71ca6` ada di live

### Cancel path

- Offer ID: `smokeordcan20260811010445`
- Order ID: `6a7a7535001e695571ea`
- `cancel-order`: `local-invoke`
- Verifikasi row akhir:
  - `orders.status = "cancelled"`

## Kesimpulan

Smoke test live tanggal 11 Agustus 2026 **lulus** untuk dua cabang order yang
paling kritis setelah remediasi:

- order accepted masih bisa dibuat
- escrow hold masih bisa mengubah order menjadi `in_progress`
- cancellation untuk unpaid order masih bekerja

Ini menutup kebutuhan evidence behavior untuk `UMKM-OPS-01`, bukan hanya
evidence config/deployment.
