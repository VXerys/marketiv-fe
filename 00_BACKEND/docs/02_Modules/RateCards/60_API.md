# Rate Cards — API

## Service Layer (Client SDK)

Fungsi-fungsi berikut dipanggil langsung dari frontend Next.js via **Appwrite Client SDK (Database)**. Berjalan di browser user.

---

### Rate Card Service

Dimiliki Creator.

#### `createRateCard()` — [Client SDK]

- **Input**: `{ title, description?, packages[] }` — tiap paket wajib `{ name, description, output, deliveryDays, price, revisionLimit }`.
- **Proses**: buat dokumen `rate_cards` (`status = draft`) + dokumen `rate_card_packages`.
- **Akses**: Creator (owner).

#### `updateRateCard()` — [Client SDK]

- **Input**: `{ rateCardId, ...fields, packages? }`
- **Proses**: ubah rate card / paket; set `status = published` untuk publish.
- **Akses**: Creator (owner).

#### `getRateCards()` — [Client SDK]

- **Input**: `{ creatorId }`
- **Proses**: list rate card published milik creator + paketnya.
- **Akses**: Public.

---

### Discovery Creator

`searchCreators({ city, minPrice?, maxPrice?, sortBy?, order? })` digunakan untuk menemukan creator beserta rate card-nya. Filter platform tidak ada karena MVP hanya TikTok. Service ini **dibagi dengan modul Users** — lihat `../Users/` (jangan diduplikasi di sini).

---

## Appwrite Functions (Server-side)

Module ini tidak memiliki REST API publik sendiri. Operasi CRUD dilakukan langsung via Appwrite SDK dan tidak ada Appwrite Function khusus untuk modul ini.

---

## Lihat Juga

- [50_Database.md](50_Database.md) — skema data
- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi
