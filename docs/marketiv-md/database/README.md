# Marketiv Database Documentation — Appwrite Edition

> Folder ini adalah referensi utama database Marketiv setelah migrasi dari Supabase/PostgreSQL ke Appwrite.
> Dokumen ini ditujukan untuk tim Backend, tim Frontend, dan AI coding assistant di VS Code.

---

## 1. Tujuan Dokumentasi

Dokumentasi ini menjelaskan rancangan database Marketiv berbasis Appwrite.
Dokumentasi ini tidak hanya mendefinisikan collection dan field.
Dokumentasi ini juga menjelaskan ownership data, permission, query pattern, realtime, event, dan kontrak data frontend.
Dokumentasi ini harus dipakai sebagai sumber kebenaran utama sebelum membuat kode backend atau frontend.
Dokumentasi ini menggantikan konsep database lama yang sebelumnya berbasis Supabase/PostgreSQL.
Dokumentasi ini tetap mempertahankan logika bisnis Marketiv seperti Campaign Mode, Rate Card Mode, Escrow, Withdrawal, dan Admin Review.
Dokumentasi ini dibuat modular agar mudah dibaca oleh manusia dan AI coding assistant.

---

## 2. Struktur Folder

```txt

docs/database/
├── README.md
├── 01-appwrite-overview.md
├── 02-collections-schema.md
├── 03-relationships-and-access-patterns.md
├── 04-permissions-and-roles.md
├── 05-indexing-and-query-strategy.md
├── 06-business-rules-and-validations.md
├── 07-realtime-and-events.md
└── 08-frontend-data-contract.md

```

---

## 3. Ringkasan Setiap File

| File | Fokus Utama | Pembaca Utama |
|---|---|---|
| `README.md` | Index, prinsip global, urutan baca | Semua tim |
| `01-appwrite-overview.md` | Batas Auth, Database, Storage, Functions, Realtime | Backend, DevOps |
| `02-collections-schema.md` | Schema collection, attribute, enum, ownership | Backend, Frontend |
| `03-relationships-and-access-patterns.md` | Relasi antar collection dan flow akses data | Backend, Frontend |
| `04-permissions-and-roles.md` | Role, label, team, permission, backend-only operation | Backend |
| `05-indexing-and-query-strategy.md` | Index, filter, sort, pagination, query anti-pattern | Backend, Frontend |
| `06-business-rules-and-validations.md` | Validasi domain dan aturan mutlak Marketiv | Backend, QA |
| `07-realtime-and-events.md` | Chat, notification, webhook, event-driven flow | Backend, Frontend |
| `08-frontend-data-contract.md` | DTO, status mapping, field read/write, page data | Frontend |

---

## 4. Prinsip Global Database Marketiv

1. Appwrite Auth menyimpan identitas login user.
2. Collection `profiles` menyimpan profil domain user.
3. Database tidak boleh menyimpan password, token rahasia, atau API key.
4. Database tidak boleh menyimpan video binary.
5. File gambar ringan boleh memakai Appwrite Storage.
6. Video mentah UMKM tetap memakai URL eksternal seperti Google Drive atau Dropbox.
7. Bukti tayang kreator wajib berupa URL publik TikTok atau Instagram.
8. Semua transaksi uang wajib memiliki jejak di `transactions`.
9. Semua perubahan sensitif wajib dicatat di `audit_logs`.
10. Semua operasi sensitif harus lewat Appwrite Function atau backend server.
11. Frontend tidak boleh langsung mengubah saldo, status payment, status escrow, atau status validasi.
12. Campaign Mode tidak boleh memiliki chat.
13. Rate Card Mode adalah satu-satunya mode yang memiliki live chat.
14. Rate Card aktif maksimal 3 paket per kreator.
15. Campaign hanya masuk Job Pool jika status campaign adalah `Aktif`.
16. Kreator hanya dapat submit bukti tayang setelah berhasil klaim campaign.
17. UMKM hanya boleh membaca dan mengubah campaign miliknya sendiri.
18. Kreator hanya boleh membaca claim dan submission miliknya sendiri.
19. Admin boleh membaca semua data operasional, tetapi setiap override wajib masuk audit log.
20. Semua query dashboard harus memakai pagination dan index.

---

## 5. Appwrite Resource Boundary

| Resource | Digunakan Untuk | Tidak Digunakan Untuk |
|---|---|---|
| Auth | Akun, session, email verification, password reset | Data campaign, saldo, order |
| Database | Data bisnis Marketiv | File binary besar, password |
| Storage | Foto profil, logo, gambar produk kecil | Video mentah, video final |
| Functions | Webhook payment, validasi saldo, klaim campaign, admin action | UI rendering |
| Realtime | Chat Rate Card, notification ringan, status update | Validasi payment utama |
| Messaging | Email/in-app notification tambahan | Source of truth transaksi |

---

## 6. Database Utama

```txt
Database ID   : marketiv_main
Database Name : Marketiv Main Database
Purpose       : Menyimpan data domain Marketiv selain Auth credentials dan file binary besar.
```

Database ini dirancang untuk MVP tetapi tetap scalable.
Semua collection harus mengikuti naming convention snake_case.
Semua enum value di dokumen ini harus dipakai konsisten oleh backend dan frontend.
Semua tanggal menggunakan ISO timestamp.
Semua nominal uang disimpan sebagai integer dalam Rupiah, bukan decimal string.
Semua field ID relasi menyimpan Appwrite document ID atau Auth user ID.

---

## 7. Collection Utama

| Collection | Deskripsi Singkat |
|---|---|
| `profiles` | Profil domain user setelah register di Appwrite Auth |
| `campaigns` | Campaign Mode yang dibuat UMKM |
| `campaign_claims` | Klaim campaign oleh kreator |
| `campaign_submissions` | Bukti tayang campaign dari kreator |
| `creator_rate_cards` | Paket jasa kreator untuk Rate Card Mode |
| `rate_card_orders` | Order/negosiasi antara UMKM dan Kreator |
| `messages` | Live chat khusus Rate Card Mode |
| `transactions` | Ledger transaksi, fee, escrow, refund, pencairan |
| `withdrawals` | Permintaan penarikan saldo kreator |
| `disputes` | Sengketa campaign/order/transaction |
| `notifications` | Notifikasi in-app user |
| `audit_logs` | Jejak aksi sensitif sistem dan admin |

---

## 8. Urutan Baca untuk Backend

1. Baca `01-appwrite-overview.md`.
2. Baca `02-collections-schema.md` sampai selesai.
3. Baca `04-permissions-and-roles.md` sebelum membuat permission.
4. Baca `05-indexing-and-query-strategy.md` sebelum membuat query API.
5. Baca `06-business-rules-and-validations.md` sebelum membuat mutation.
6. Baca `07-realtime-and-events.md` untuk chat, notification, dan webhook.
7. Baca `08-frontend-data-contract.md` sebelum mengunci response API.

---

## 9. Urutan Baca untuk Frontend

1. Baca file ini untuk memahami struktur umum.
2. Baca `08-frontend-data-contract.md` untuk bentuk data per halaman.
3. Baca `03-relationships-and-access-patterns.md` untuk memahami data apa yang perlu dimuat.
4. Baca `05-indexing-and-query-strategy.md` untuk filter, sort, pagination.
5. Baca `06-business-rules-and-validations.md` agar UI tidak melanggar flow bisnis.
6. Baca `04-permissions-and-roles.md` untuk memahami operasi yang harus lewat backend.

---

## 10. Urutan Baca untuk AI Coding Assistant

Gunakan instruksi berikut saat memakai Copilot, Cursor, Windsurf, atau AI di VS Code.

```txt
Baca docs/database/README.md terlebih dahulu.
Untuk task schema atau Appwrite setup, baca 01 dan 02.
Untuk task query dashboard, baca 03 dan 05.
Untuk task permission, baca 04.
Untuk task mutation bisnis, baca 06.
Untuk task realtime/chat/notification, baca 07.
Untuk task frontend integration, baca 08.
Jangan membuat field baru tanpa update dokumentasi schema.
Jangan mengubah enum tanpa update kontrak frontend.
Jangan membuat operasi uang langsung dari frontend.
```

---

## 11. Naming Convention

1. Collection ID memakai snake_case plural.
2. Attribute memakai snake_case.
3. Enum memakai PascalCase untuk status bisnis yang tampil ke UI.
4. Function ID memakai kebab-case.
5. Storage bucket ID memakai snake_case.
6. Document ID boleh memakai auto ID kecuali `profiles` yang direkomendasikan memakai Auth user ID.
7. Field relasi ke user memakai suffix `_user_id`.
8. Field relasi ke document memakai suffix `_id`.
9. Timestamp memakai suffix `_at`.
10. Field boolean memakai prefix `is_`, `has_`, atau `can_`.

---

## 12. Status Source of Truth

| Data | Source of Truth |
|---|---|
| Email user | Appwrite Auth |
| Password user | Appwrite Auth |
| Role domain user | `profiles.role` + optional label/team |
| Saldo kreator | `profiles.dompet_saldo` + `transactions` ledger |
| Campaign status | `campaigns.status` |
| Kuota campaign | `campaigns.kuota_kreator` dan `campaigns.kuota_terpakai` |
| Klaim campaign | `campaign_claims` |
| Bukti tayang | `campaign_submissions` |
| Order Rate Card | `rate_card_orders` |
| Chat | `messages` |
| Dispute | `disputes` |
| Notification | `notifications` |
| Audit | `audit_logs` |

---

## 13. Hal yang Tidak Boleh Dilakukan

1. Jangan membuat collection `users` untuk menyimpan password.
2. Jangan menyimpan video final kreator di Storage Marketiv.
3. Jangan membuat `messages` untuk Campaign Mode.
4. Jangan mengubah `dompet_saldo` dari frontend.
5. Jangan mengubah `payment_status` dari frontend.
6. Jangan mengubah `status_validasi` dari frontend.
7. Jangan menghapus `transactions` untuk menyembunyikan histori.
8. Jangan menghapus `audit_logs` dari dashboard admin biasa.
9. Jangan menampilkan data bank withdrawal ke frontend yang tidak berwenang.
10. Jangan membuat query list tanpa limit.

---

## 14. Definition of Done Database Documentation

Sebuah perubahan database dianggap lengkap jika:

1. Collection atau attribute baru terdokumentasi di `02-collections-schema.md`.
2. Relasinya terdokumentasi di `03-relationships-and-access-patterns.md`.
3. Permission-nya terdokumentasi di `04-permissions-and-roles.md`.
4. Index dan query pattern-nya terdokumentasi di `05-indexing-and-query-strategy.md`.
5. Business rule-nya terdokumentasi di `06-business-rules-and-validations.md`.
6. Jika realtime/event terkait, update `07-realtime-and-events.md`.
7. Jika dikonsumsi frontend, update `08-frontend-data-contract.md`.
8. Enum status sudah sinkron antara backend dan frontend.
9. AI coding assistant bisa membaca dokumen dan menghasilkan kode tanpa menebak field.
10. QA bisa membuat test case berdasarkan dokumen.

---

## 15. Catatan Migrasi dari Dokumentasi Lama

Dokumentasi lama memakai istilah tabel SQL.
Dokumentasi baru memakai istilah Appwrite collection/document.
`users` lama diubah menjadi `profiles`.
`submissions` lama dipisah menjadi `campaign_claims` dan `campaign_submissions`.
`rate_cards` lama diubah menjadi `creator_rate_cards`.
`transactions` tetap dipakai, tetapi withdrawal dipisahkan ke `withdrawals`.
Collection baru `notifications` dan `audit_logs` ditambahkan.
Permission lama berbasis RLS diubah menjadi Appwrite permission + backend validation.
Foreign key SQL diganti menjadi reference ID + optional relationship attribute.
Constraint SQL diganti menjadi enum validation, Appwrite attribute validation, Function validation, dan audit log.

---

## 16. Final Rule

Jika ada konflik antara dokumen database ini dan implementasi sementara, ikuti dokumen ini.
Jika ada konflik antara dokumen ini dan aturan bisnis Marketiv, update dokumen ini terlebih dahulu sebelum coding.
Jika AI coding assistant menyarankan field atau flow baru, validasi dulu terhadap business rule dan permission boundary.
