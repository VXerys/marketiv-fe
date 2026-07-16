# Chat — Database

Sumber kebenaran skema koleksi milik modul Chat. Satu fakta = satu lokasi.

---

## conversations

Ruang chat antara satu UMKM dan satu creator. Relasi: Conversation (1) → Messages (N).

| Attribute       | Type    | Required | Catatan                              |
| --------------- | ------- | -------- | ------------------------------------ |
| umkm_id         | string  | yes      | FK → users                           |
| creator_id      | string  | yes      | FK → users                           |
| offer_id        | string  | no       | FK → offers terakhir/terkait         |
| last_message    | string  | no       | denormalisasi pesan terakhir         |
| last_message_at | datetime| no       | denormalisasi waktu pesan terakhir   |

**Index**: `umkm_id`, `creator_id`, unique `umkm_id + creator_id`, `offer_id`.

**Constraint**: kombinasi `umkm_id + creator_id` unik (satu percakapan per pasangan — lihat `30_Business_Rules.md`).

**Permission**: Participant only.

---

## messages

Pesan dalam sebuah percakapan. Relasi: Conversation (1) → Messages (N).

| Attribute       | Type   | Required | Catatan                            |
| --------------- | ------ | -------- | ---------------------------------- |
| conversation_id | string  | yes      | FK → conversations                 |
| sender_id       | string  | yes      | FK → users                         |
| message_type    | string  | yes      | `text\|offer\|system`              |
| content         | string  | no       | isi pesan (untuk `text`/`system`)  |
| offer_id        | string  | no       | FK → offers untuk tipe `offer`     |
| read_at         | datetime| no       | timestamp saat pesan dibaca        |

**Index**: `conversation_id`, `sender_id`, `read_at`.

**Permission**: Participant only.
