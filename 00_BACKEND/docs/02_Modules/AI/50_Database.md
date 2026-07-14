# AI — Database

Sumber kebenaran skema koleksi milik modul AI. Satu fakta = satu lokasi.

---

## ai_requests

Log seluruh permintaan AI (Brief, Fraud, Landing). Relasi: User (1) → AI Requests (N).

| Attribute | Type   | Required | Catatan                          |
| --------- | ------ | -------- | -------------------------------- |
| userId    | string | yes      | FK → users                       |
| feature   | enum   | yes      | `brief\|fraud\|landing`          |
| prompt    | string | yes      | input yang dikirim ke model      |
| response  | string | no       | output model                     |
| createdAt | datetime | —      |                                  |

**Index**: `userId`, `feature`, `createdAt DESC`.

**Permission**: Owner read · System write.

> Data hasil fraud (`fraud_checks`) ada di modul Campaigns — lihat `../Campaigns/50_Database.md`.
