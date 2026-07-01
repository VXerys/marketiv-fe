# Offers — API

Kontrak Offer Service. Skema di `50_Database.md`; aturan di `30_Business_Rules.md`.

---

## Offer Service

### createOffer()

- **Input**: `{ conversationId, title, description?, price, deadline, revisionLimit }`
- **Proses**: buat dokumen `offers` (`status = pending`) dalam percakapan terkait.
- **Akses**: Content Creator (peserta percakapan).

### acceptOffer()

- **Input**: `{ offerId }`
- **Proses**: set `status = accepted` → memicu pembuatan **order** (status `pending_payment`). Lihat `90_Events.md` dan `../Orders/`.
- **Akses**: UMKM (peserta percakapan).

### rejectOffer()

- **Input**: `{ offerId }`
- **Proses**: set `status = rejected`.
- **Akses**: UMKM (peserta percakapan).
