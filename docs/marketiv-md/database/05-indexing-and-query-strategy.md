# 05 — Indexing and Query Strategy

> Dokumen ini menjelaskan index dan query pattern untuk Appwrite Database Marketiv.
> Tujuannya agar dashboard cepat, query stabil, dan tidak ada list tanpa limit.

---

## 1. Prinsip Query

Semua list query wajib memakai limit.
Semua halaman dashboard wajib memakai pagination.
Semua filter yang sering dipakai wajib punya index.
Semua sort yang sering dipakai wajib didukung index sesuai kebutuhan Appwrite.
Frontend tidak boleh mengambil seluruh collection untuk dihitung manual.
Aggregation kompleks sebaiknya lewat Function.
Search sederhana boleh memakai query Appwrite jika didukung index dan data kecil.
Search kompleks dapat ditunda ke post-MVP atau backend search function.

---

## 2. Default Pagination

| Context | Default Limit | Max Limit |
|---|---:|---:|
| Dashboard card preview | 5 | 10 |
| Mobile list | 10 | 20 |
| Desktop table | 20 | 50 |
| Admin review queue | 20 | 100 |
| Chat initial load | 50 | 100 |
| Notification list | 20 | 50 |
| Export | backend stream | backend controlled |

Frontend harus menyimpan cursor/page state.
Infinite scroll hanya boleh untuk list non-finansial atau read-only feed.
Admin export tidak boleh dilakukan dengan mengambil semua data dari frontend.

---

## 3. Index Naming Convention

Gunakan format:

```txt
idx_{collection}_{field}
idx_{collection}_{field_a}_{field_b}
```

Contoh:

```txt
idx_campaigns_status
idx_campaigns_status_created_at
idx_rate_card_orders_umkm_user_id_status
idx_messages_order_id_created_at
```

---

## 4. `profiles` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_profiles_user_id` | `user_id` | Lookup profile current user |
| `idx_profiles_role` | `role` | Filter role |
| `idx_profiles_email` | `email` | Admin lookup |
| `idx_profiles_niche` | `niche` | Creator directory filter |
| `idx_profiles_verification_status` | `verification_status` | Verified creator directory |
| `idx_profiles_role_verification_status` | `role`, `verification_status` | Public creator list |

Query examples:

```txt
profiles where user_id == current_user_id limit 1
profiles where role == KREATOR and verification_status == Verified limit 20
profiles where role == KREATOR and niche == Kuliner limit 20
```

Anti-pattern:

```txt
Load all profiles then filter verified creators in frontend.
```

---

## 5. `campaigns` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_campaigns_umkm_user_id` | `umkm_user_id` | UMKM campaign list |
| `idx_campaigns_status` | `status` | Job Pool and admin filter |
| `idx_campaigns_niche` | `niche` | Job Pool filter |
| `idx_campaigns_created_at` | `created_at` | Sort terbaru |
| `idx_campaigns_published_at` | `published_at` | Job Pool sort |
| `idx_campaigns_harga_per_1000_views` | `harga_per_1000_views` | Sort/filter bayaran |
| `idx_campaigns_status_niche` | `status`, `niche` | Job Pool by niche |
| `idx_campaigns_umkm_status` | `umkm_user_id`, `status` | UMKM dashboard |
| `idx_campaigns_status_published_at` | `status`, `published_at` | Active feed terbaru |

Query examples:

```txt
campaigns where umkm_user_id == current_user_id orderDesc created_at limit 20
campaigns where status == Aktif orderDesc published_at limit 20
campaigns where status == Aktif and niche == Kuliner orderDesc published_at limit 20
campaigns where umkm_user_id == current_user_id and status == Draft limit 20
```

Anti-pattern:

```txt
Load all campaigns to calculate active campaign count.
Load all active campaigns without pagination.
Sort by field that has no index.
```

---

## 6. `campaign_claims` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_campaign_claims_campaign_id` | `campaign_id` | Campaign claim list |
| `idx_campaign_claims_kreator_user_id` | `kreator_user_id` | Kreator active jobs |
| `idx_campaign_claims_status` | `status` | Filter active/completed |
| `idx_campaign_claims_campaign_kreator` | `campaign_id`, `kreator_user_id` | Duplicate check |
| `idx_campaign_claims_kreator_status` | `kreator_user_id`, `status` | Active jobs page |
| `idx_campaign_claims_umkm_user_id` | `umkm_user_id` | UMKM dashboard |

Query examples:

```txt
campaign_claims where campaign_id == campaign_id limit 20
campaign_claims where kreator_user_id == current_user_id and status == Aktif limit 20
campaign_claims where campaign_id == campaign_id and kreator_user_id == current_user_id limit 1
```

Critical:

Composite index `campaign_id + kreator_user_id` mendukung duplicate check.
Duplicate tetap harus ditolak oleh Function, bukan hanya bergantung ke frontend.

---

## 7. `campaign_submissions` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_campaign_submissions_campaign_id` | `campaign_id` | UMKM campaign detail |
| `idx_campaign_submissions_claim_id` | `claim_id` | Claim detail |
| `idx_campaign_submissions_kreator_user_id` | `kreator_user_id` | Kreator submission history |
| `idx_campaign_submissions_umkm_user_id` | `umkm_user_id` | UMKM dashboard |
| `idx_campaign_submissions_status_validasi` | `status_validasi` | Admin validation queue |
| `idx_campaign_submissions_submitted_at` | `submitted_at` | Sort terbaru |
| `idx_campaign_submissions_campaign_status` | `campaign_id`, `status_validasi` | Campaign validation filter |
| `idx_campaign_submissions_umkm_status` | `umkm_user_id`, `status_validasi` | UMKM dashboard pending |

Query examples:

```txt
campaign_submissions where umkm_user_id == current_user_id and status_validasi == Pending limit 20
campaign_submissions where kreator_user_id == current_user_id orderDesc submitted_at limit 20
campaign_submissions where status_validasi == Pending orderAsc submitted_at limit 50 for admin
```

---

## 8. `creator_rate_cards` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_creator_rate_cards_kreator_user_id` | `kreator_user_id` | Profile creator detail |
| `idx_creator_rate_cards_is_active` | `is_active` | Public active cards |
| `idx_creator_rate_cards_harga_paket` | `harga_paket` | Sort/filter harga |
| `idx_creator_rate_cards_kreator_active` | `kreator_user_id`, `is_active` | Max 3 active check |

Query examples:

```txt
creator_rate_cards where kreator_user_id == selected_creator and is_active == true limit 3
creator_rate_cards where kreator_user_id == current_user_id limit 10
```

Critical:

Limit 3 active harus divalidasi dengan query `kreator_user_id + is_active`.

---

## 9. `rate_card_orders` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_rate_card_orders_umkm_user_id` | `umkm_user_id` | UMKM negotiation list |
| `idx_rate_card_orders_kreator_user_id` | `kreator_user_id` | Kreator negotiation list |
| `idx_rate_card_orders_status` | `status` | Admin/order filter |
| `idx_rate_card_orders_payment_status` | `payment_status` | Payment queue |
| `idx_rate_card_orders_created_at` | `created_at` | Sort terbaru |
| `idx_rate_card_orders_umkm_status` | `umkm_user_id`, `status` | UMKM filter |
| `idx_rate_card_orders_kreator_status` | `kreator_user_id`, `status` | Kreator filter |

Query examples:

```txt
rate_card_orders where umkm_user_id == current_user_id orderDesc created_at limit 20
rate_card_orders where kreator_user_id == current_user_id and status == Negosiasi limit 20
rate_card_orders where status == Dispute orderDesc created_at limit 50 for admin
```

---

## 10. `messages` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_messages_order_id` | `order_id` | Load chat room |
| `idx_messages_created_at` | `created_at` | Sort messages |
| `idx_messages_order_created_at` | `order_id`, `created_at` | Chat pagination |
| `idx_messages_receiver_read` | `receiver_user_id`, `is_read` | Unread count |
| `idx_messages_sender_user_id` | `sender_user_id` | Moderation/admin |

Query examples:

```txt
messages where order_id == order_id orderAsc created_at limit 50
messages where receiver_user_id == current_user_id and is_read == false limit 50
```

Chat pagination:

1. Initial load newest 50.
2. Display ascending in UI.
3. Load older messages with cursor.
4. Avoid fetching entire history.

---

## 11. `transactions` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_transactions_user_id` | `user_id` | User finance history |
| `idx_transactions_reference_id` | `reference_id` | Entity transaction history |
| `idx_transactions_reference_type` | `reference_type` | Report filter |
| `idx_transactions_status` | `status` | Payment/admin queue |
| `idx_transactions_tipe` | `tipe` | Ledger filter |
| `idx_transactions_created_at` | `created_at` | Sort/filter date |
| `idx_transactions_provider_order_id` | `provider_order_id` | Webhook lookup |
| `idx_transactions_user_status` | `user_id`, `status` | User pending transactions |
| `idx_transactions_reference_lookup` | `reference_type`, `reference_id` | Entity ledger |

Query examples:

```txt
transactions where user_id == current_user_id orderDesc created_at limit 20
transactions where provider_order_id == midtrans_order_id limit 1
transactions where reference_type == Campaign and reference_id == campaign_id limit 20
```

Critical:

Webhook handler harus lookup transaction by `provider_order_id`.
Jangan lookup payment berdasarkan amount saja.

---

## 12. `withdrawals` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_withdrawals_kreator_user_id` | `kreator_user_id` | Kreator withdrawal history |
| `idx_withdrawals_status` | `status` | Admin finance queue |
| `idx_withdrawals_requested_at` | `requested_at` | Sort queue |
| `idx_withdrawals_kreator_status` | `kreator_user_id`, `status` | Pending check |

Query examples:

```txt
withdrawals where kreator_user_id == current_user_id orderDesc requested_at limit 20
withdrawals where status == Pending orderAsc requested_at limit 50 for admin finance
```

---

## 13. `disputes` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_disputes_reference_id` | `reference_id` | Entity dispute lookup |
| `idx_disputes_reference_type` | `reference_type` | Filter type |
| `idx_disputes_opened_by_user_id` | `opened_by_user_id` | User dispute history |
| `idx_disputes_against_user_id` | `against_user_id` | Involved user filter |
| `idx_disputes_status` | `status` | Admin queue |
| `idx_disputes_created_at` | `created_at` | Sort queue |
| `idx_disputes_reference_lookup` | `reference_type`, `reference_id` | Duplicate dispute check |

Query examples:

```txt
disputes where status == Open orderAsc created_at limit 50
disputes where reference_type == RateCardOrder and reference_id == order_id limit 1
```

---

## 14. `notifications` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_notifications_user_id` | `user_id` | User notification list |
| `idx_notifications_is_read` | `is_read` | Unread filter |
| `idx_notifications_created_at` | `created_at` | Sort newest |
| `idx_notifications_user_read` | `user_id`, `is_read` | Unread badge |
| `idx_notifications_user_created` | `user_id`, `created_at` | Notification list |

Query examples:

```txt
notifications where user_id == current_user_id orderDesc created_at limit 20
notifications where user_id == current_user_id and is_read == false limit 20
```

---

## 15. `audit_logs` Indexes

Required indexes:

| Index | Fields | Purpose |
|---|---|---|
| `idx_audit_logs_actor_user_id` | `actor_user_id` | Actor history |
| `idx_audit_logs_action` | `action` | Action filter |
| `idx_audit_logs_entity_type` | `entity_type` | Entity type filter |
| `idx_audit_logs_entity_id` | `entity_id` | Entity audit trail |
| `idx_audit_logs_created_at` | `created_at` | Sort newest |
| `idx_audit_logs_entity_lookup` | `entity_type`, `entity_id` | Entity timeline |

Query examples:

```txt
audit_logs where entity_type == Campaign and entity_id == campaign_id orderDesc created_at limit 50
audit_logs where actor_user_id == admin_id orderDesc created_at limit 50
```

---

## 16. Dashboard Aggregation Strategy

Jangan paksa frontend menghitung dashboard dari semua rows.
Gunakan Function untuk summary jika data mulai banyak.

Recommended Functions:

```txt
get-umkm-dashboard-summary
get-kreator-dashboard-summary
get-admin-dashboard-summary
get-job-pool-feed
get-creator-directory
get-finance-summary
```

Function summary harus mengembalikan angka final yang sudah aman.
Frontend hanya render data, bukan menghitung rule finansial kompleks.

---

## 17. Search Strategy MVP

Search MVP sederhana:

1. Search campaign berdasarkan judul jika Appwrite query mendukung kebutuhan.
2. Search creator berdasarkan nama/niche dengan query terbatas.
3. Search admin berdasarkan email/user ID.

Search yang ditunda:

1. Full-text search kompleks.
2. Typo-tolerant search.
3. Semantic search.
4. Ranking kreator advanced.
5. Recommendation engine.

Jika search mulai kompleks, gunakan dedicated Function atau external search service post-MVP.

---

## 18. Query Anti-Patterns

Dilarang:

1. Query tanpa limit.
2. Load semua transaction untuk hitung saldo.
3. Load semua messages di chat room.
4. Load semua creators lalu filter di frontend.
5. Load semua campaigns lalu filter status di frontend.
6. Query field yang belum punya index untuk halaman utama.
7. Melakukan N+1 query di list besar.
8. Sorting di frontend untuk data paginated besar.
9. Mengambil field sensitif lalu disembunyikan di UI.
10. Menggunakan realtime sebagai pengganti query awal.

---

## 19. Frontend Query Checklist

Sebelum membuat query frontend, pastikan:

1. Ada limit.
2. Ada pagination/cursor.
3. Field filter punya index.
4. Field sort punya index.
5. Permission user sesuai.
6. Response tidak mengandung data sensitif.
7. Loading state tersedia.
8. Empty state tersedia.
9. Error state actionable.
10. Query tidak melanggar Campaign Mode zero chat.

---

## 20. Backend Query Checklist

Sebelum membuat Function, pastikan:

1. Auth user diverifikasi.
2. Profile user dibaca.
3. Role dicek.
4. Query memakai index.
5. Query memakai limit.
6. Business rule dicek.
7. Mutation sensitif dibuat berurutan.
8. Transaction ledger dibuat jika uang berubah.
9. Audit log dibuat jika aksi sensitif.
10. Notification dibuat jika user perlu tahu.
11. Response DTO aman untuk frontend.
12. Error code konsisten.

---

## 21. Final Rule

Index mengikuti access pattern, bukan sebaliknya.
Jika halaman baru membutuhkan filter baru, tambahkan index di dokumen ini sebelum coding.
Jika query mulai lambat, jangan langsung menambah data load; evaluasi index, pagination, dan aggregation Function.
