# Orders — Database

Sumber kebenaran skema koleksi milik modul Orders. Satu fakta = satu lokasi.

---

## orders

Aggregate utama alur Rate Card. Relasi: Offer (1) → Order (1) **atau** Package (1) → Order (1); merujuk umkm & creator (FK → users). Order (1) → Deliverables (N); Order (1) → Revisions (N); Order (1) → Escrow (1, modul Payments).

| Attribute | Type    | Required | Catatan                                                              |
| --------- | ------- | -------- | ------------------------------------------------------------------- |
| umkmId    | string  | yes      | FK → users (buyer)                                                   |
| creatorId | string  | yes      | FK → users (seller)                                                  |
| offerId   | string  | no       | FK → offers (jika dari custom offer)                                 |
| packageId | string  | no       | FK → rate_card_packages (jika direct order)                         |
| amount    | integer | yes      | nilai order                                                          |
| status    | enum    | yes      | `pending_payment\|escrow\|in_progress\|revision\|approved\|completed\|cancelled` |

**Index**: `umkmId`, `creatorId`, `status`, `createdAt DESC`.

**Permission**: Buyer · Seller · Admin.

---

## deliverables

Draft/hasil kerja creator, berversi. Relasi: Order (1) → Deliverables (N).

| Attribute | Type    | Required | Catatan                       |
| --------- | ------- | -------- | ----------------------------- |
| orderId   | string  | yes      | FK → orders                   |
| fileUrl   | string  | yes      | URL Storage (bucket deliverables) |
| notes     | string  | no       | catatan creator               |
| version   | integer | yes      | nomor versi unggahan          |
| status    | enum    | yes      | `submitted\|revision_requested\|approved` |

**Index**: `orderId`, `createdAt DESC`.

**Permission**: Buyer · Seller · Admin.

---

## revisions

Permintaan revisi atas sebuah order. Relasi: Order (1) → Revisions (N).

| Attribute   | Type   | Required | Catatan                    |
| ----------- | ------ | -------- | -------------------------- |
| orderId     | string | yes      | FK → orders                |
| requestedBy | string | yes      | FK → users (UMKM)          |
| message     | string | yes      | catatan revisi             |
| status      | enum   | yes      | `open\|resolved`           |

**Index**: `orderId`, `status`.

**Permission**: Buyer · Seller · Admin.

> Escrow milik order ada di modul Payments (`../Payments/50_Database.md`) — escrow & transaksi sengaja dipisah dari order. `offerId` → `../Offers/50_Database.md`; `packageId` → `../RateCards/50_Database.md`. Aturan status & versi: `30_Business_Rules.md`.
