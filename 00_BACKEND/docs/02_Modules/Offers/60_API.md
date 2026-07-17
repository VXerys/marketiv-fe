# Offers — API

## Service Layer (Client SDK)

Fungsi-fungsi berikut dipanggil langsung dari frontend Next.js via **Appwrite Client SDK (Database)**. Berjalan di browser user.

---

### `createOffer()` — [Client SDK]

- **Input**: `{ conversationId, title, description?, price, deadline, revisionLimit }`
- **Proses**: buat dokumen `offers` (`status = pending`) dalam percakapan terkait.
- **Akses**: UMKM (peserta percakapan).

### `acceptOffer()` — [Client SDK] *(memicu Appwrite Function `create-order`)*

- **Input**: `{ offerId }`
- **Proses**: set `status = accepted` → memicu event Offer Accepted → pembuatan **order** (status `pending_payment`). Lihat `90_Events.md` dan `../Orders/`.
- **Akses**: Content Creator (peserta percakapan).

### `rejectOffer()` — [Client SDK]

- **Input**: `{ offerId }`
- **Proses**: set `status = rejected`.
- **Akses**: Content Creator (peserta percakapan).

---

## Appwrite Functions (Server-side)

Module ini tidak memiliki REST API publik sendiri. Order creation dipicu oleh event `offers.status` → `accepted` dan ditangani oleh function `create-order` di modul **Orders** — lihat `../Orders/90_Events.md`.

---

## Lihat Juga

- [50_Database.md](50_Database.md) — skema data
- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi
- [90_Events.md](90_Events.md) — event trigger flow
