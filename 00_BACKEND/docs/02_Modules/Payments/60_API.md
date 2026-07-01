# Payments — API

Kontrak Wallet Service. Skema di `50_Database.md`; aturan di `30_Business_Rules.md`.

---

## Wallet Service

Dimiliki pemilik wallet.

### getWallet()

- **Input**: `{ userId }` (own).
- **Proses**: ambil `balance` & `pendingBalance` wallet user.
- **Akses**: Owner read · Admin.

### requestWithdraw()

- **Input**: `{ amount, bankName, accountNumber, accountName }`
- **Validasi**: `amount ≥ minimum withdraw` dan `balance ≥ amount`.
- **Proses**: buat dokumen `withdrawals` (`status = pending`); menunggu **persetujuan admin**.
- **Akses**: Owner (user).

---

## Escrow (via Functions)

Escrow tidak dikelola lewat service user, melainkan **Appwrite Functions**:

- `create-escrow` — hold dana saat pembayaran order sukses.
- `release-escrow` — rilis dana ke wallet creator saat deliverable di-approve.

Pemicu escrow berasal dari alur order — lihat `../Orders/90_Events.md`. Detail event di `90_Events.md`.
