# Rate Cards — API

Kontrak Rate Card Service. Skema di `50_Database.md`; aturan di `30_Business_Rules.md`.

---

## Rate Card Service

Dimiliki Creator.

### createRateCard()

- **Input**: `{ title, description?, packages[] }` — tiap paket wajib `{ name, description, output, deliveryDays, price, revisionLimit }`.
- **Proses**: buat dokumen `rate_cards` (`status = draft`) + dokumen `rate_card_packages`.
- **Akses**: Creator (owner).

### updateRateCard()

- **Input**: `{ rateCardId, ...fields, packages? }`
- **Proses**: ubah rate card / paket; set `status = published` untuk publish.
- **Akses**: Creator (owner).

### getRateCards()

- **Input**: `{ creatorId }`
- **Proses**: list rate card published milik creator + paketnya.
- **Akses**: Public.

---

## Discovery Creator

`searchCreators({ platform, city })` digunakan untuk menemukan creator beserta rate card-nya. Service ini **dibagi dengan modul Users** — lihat `../Users/` (jangan diduplikasi di sini).
