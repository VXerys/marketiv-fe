# Chat — Database

Sumber kebenaran skema koleksi milik modul Chat. Satu fakta = satu lokasi.

---

## conversations

Ruang chat antara satu UMKM dan satu creator. Relasi: Conversation (1) → Messages (N).

| Attribute        | Type     | Required | Catatan |
| ---------------- | -------- | -------- | ------- |
| umkm_id          | string   | yes      | FK ke users |
| creator_id       | string   | yes      | FK ke users |
| offer_id         | string   | no       | FK ke offers terakhir/terkait |
| last_message     | string   | no       | denormalisasi pesan terakhir |
| last_message_at  | datetime | no       | denormalisasi waktu pesan terakhir |
| umkm_archived    | boolean  | no       | default `false`; status archive milik UMKM |
| creator_archived | boolean  | no       | default `false`; status archive milik Creator |
| is_archived      | boolean  | no       | default `false`; deprecated, kompatibilitas sementara, bukan authoritative |

**Index**: `umkm_id`, `creator_id`, unique `umkm_id + creator_id`, `offer_id`.

**Constraint**: kombinasi `umkm_id + creator_id` unik (satu percakapan per pasangan — lihat `30_Business_Rules.md`).

**Permission**: collection memberi `create("users")`; row hanya memberi `Permission.read` kepada kedua participant. Browser tidak mendapat `Permission.update` pada conversation.

### Migrasi Archive Legacy

- Tambahkan `umkm_archived` dan `creator_archived` dengan default `false`.
- Pertahankan `is_archived`; jangan hapus pada migrasi ini.
- Jangan backfill dari `is_archived`. Nilai `true` lama tidak menyimpan actor, sehingga tidak dapat dipetakan secara akurat ke UMKM atau Creator.
- Setelah kolom baru tersedia, deploy Function archive dan kedua Function read DTO. Sejak itu `is_archived` tidak authoritative.

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
