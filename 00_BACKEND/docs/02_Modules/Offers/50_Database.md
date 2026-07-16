# Offers — Database

Sumber kebenaran skema koleksi milik modul Offers. Satu fakta = satu lokasi.

---

## offers

Custom offer dalam sebuah percakapan. Relasi: Conversation (1) → Offers (N); merujuk UMKM pembuat offer dan creator penerima offer (FK → users).

| Attribute      | Type    | Required | Catatan                          |
| -------------- | ------- | -------- | -------------------------------- |
| conversationId | string  | yes      | FK → conversations (modul Chat)  |
| umkmId         | string  | yes      | FK → users (pembuat offer)       |
| creatorId      | string  | yes      | FK → users (penerima offer)      |
| title          | string  | yes      |                                  |
| description    | string  | no       | detail pekerjaan                 |
| price          | integer | yes      | harga yang disepakati            |
| deadline       | string  | yes      | tenggat pengerjaan               |
| revisionLimit  | integer | yes      | batas jumlah revisi              |
| status         | enum    | yes      | `pending\|accepted\|rejected`    |

**Index**: `conversationId`, `status`, `createdAt DESC`.

**Permission**: Conversation participant.

> `conversationId` merujuk koleksi milik modul Chat (`../Chat/50_Database.md`). Order yang terbentuk dari accept ada di `../Orders/50_Database.md`. Status & field dijelaskan di `30_Business_Rules.md`.
