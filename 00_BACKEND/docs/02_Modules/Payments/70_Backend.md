# Payments — Backend

## Appwrite Functions

### create-user-wallet

- **Trigger**: `users.create`.
- **Aksi**: buat dokumen `wallets` (`balance = 0`, `pendingBalance = 0`).

### create-escrow

- **Trigger**: `payments.status` `pending → paid`.
- **Aksi**: buat escrow (`held`), lock dana, update order status.

### release-escrow

- **Trigger**: `deliverables.status` → `approved`.
- **Aksi**: rilis escrow, tambah balance wallet Creator, catat transaksi `release`, update order.

### process-withdrawal (Admin)

- **Manual/Trigger**: admin approve.
- **Aksi**: set withdrawal `processed`, kurangi balance, kirim dana.

## Aturan Backend

- Minimum withdrawal amount (konfigurabel).
- `balance` tidak boleh negatif.
- Escrow hanya bisa diubah oleh system/admin — tidak ada akses user.
- Setiap mutasi saldo harus tercatat di `transactions`.
