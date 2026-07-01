# Orders — Events

Automasi modul Orders berjalan event-driven via Appwrite Functions. Service yang memicu ada di `60_API.md`.

---

## Offer Accepted → Order Created

- **Trigger**: `offers.status` `pending → accepted`.
- **Function**: `create-order`.
- **Aksi**: buat dokumen `orders` (status `pending_payment`), notify UMKM untuk bayar.
- **Link**: pemicu di modul Offers → `../Offers/90_Events.md`.

## Payment Success → Escrow Hold

- **Trigger**: `payments.status` `pending → paid`.
- **Function**: `create-escrow`.
- **Aksi**: buat dokumen `escrows` (status `held`), lock dana, set order `escrow`/`in_progress`.
- **Link**: escrow & wallet → `../Payments/90_Events.md`.

## Deliverable Approved → Release Escrow

- **Trigger**: `deliverables.status` `revision_requested → approved` (atau approve oleh UMKM).
- **Function**: `release-escrow`.
- **Aksi**: rilis escrow → saldo pindah ke wallet creator + catat transaksi → order `completed`.
- **Link**: detail wallet & transaksi → `../Payments/` dan `../Payments/90_Events.md`.

> Keputusan order sebagai aggregate utama: `../../04_Decisions/ADR-003.md`.
