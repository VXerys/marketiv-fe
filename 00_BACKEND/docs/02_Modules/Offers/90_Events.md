# Offers — Events

Automasi modul Offers berjalan event-driven via Appwrite Functions. Service yang memicu ada di `60_API.md`.

---

## Offer Accepted

- **Trigger**: `offers.status` `pending → accepted`.
- **Function**: `create-order`.
- **Aksi**: buat dokumen `orders` (status `pending_payment`), notify UMKM untuk melakukan pembayaran.
- **Link**: order sebagai aggregate utama → `../Orders/` dan `../Orders/90_Events.md`; keputusan arsitektur → `../../04_Decisions/ADR-003.md`.
