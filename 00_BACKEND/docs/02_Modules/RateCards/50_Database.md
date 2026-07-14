# Rate Cards — Database

Sumber kebenaran skema koleksi milik modul Rate Cards. Satu fakta = satu lokasi.

---

## rate_cards

Etalase layanan creator. Relasi: Creator (1) → Rate Cards (N).

| Attribute   | Type   | Required | Catatan                  |
| ----------- | ------ | -------- | ------------------------ |
| creatorId   | string | yes      | FK → users               |
| title       | string | yes      |                          |
| description | string | no       |                          |
| status      | enum   | yes      | `draft\|published`       |

**Index**: `creatorId`, `status`, `createdAt DESC`.

**Permission**: Public read · Owner write.

---

## rate_card_packages

Paket di dalam rate card (mis. Basic/Standard/Premium). Relasi: Rate Card (1) → Packages (N).

| Attribute     | Type    | Required | Catatan                              |
| ------------- | ------- | -------- | ------------------------------------ |
| rateCardId    | string  | yes      | FK → rate_cards                      |
| name          | string  | yes      | mis. `Basic`, `Standard`, `Premium`  |
| description   | string  | yes      | deskripsi paket                      |
| output        | string  | yes      | deliverable / hasil yang didapat     |
| deliveryDays  | integer | yes      | estimasi lama pengerjaan (hari)      |
| price         | integer | yes      |                                      |
| revisionLimit | integer | yes      | batas jumlah revisi                  |

**Index**: `rateCardId`, `price`.

**Permission**: Public read · Owner write.

> Field wajib paket dijelaskan di `30_Business_Rules.md`.
