
Saya setuju perlu direvisi sebelum schema dianggap final. Untuk Marketiv yang menggunakan Appwrite, ada beberapa hal yang akan menjadi masalah jika mengikuti schema sebelumnya.

# Revisi 1 — Gunakan Appwrite Auth Sebagai Source of Truth

Tidak perlu collection `users`.

Karena Appwrite sudah memiliki:

```text
Auth Users
```

Data berikut sudah tersedia:

```text
$id
name
email
emailVerification
phone
status
prefs
```

Sehingga cukup buat:

```text
profiles
```

---

# 1. profiles

Gabungkan `umkm_profiles` dan `creator_profiles`.

```text
profiles
--------
user_id

role

avatar_url

phone

city

bio

business_name
business_category

rating
completed_jobs

status
```

### Kenapa?

Karena:

```text
Auth User
      ↓
Profile
```

lebih sederhana dibanding:

```text
Users
 ├── Creator Profile
 └── UMKM Profile
```

---

# 2. social_accounts

Tetap dipertahankan.

```text
social_accounts
---------------
user_id

platform
username

followers

verified

engagement_rate
```

Tambahan:

```text
engagement_rate
```

karena nantinya dipakai untuk filtering kreator.

---

# 3. campaigns

Tambahkan snapshot penting.

```text
campaigns
---------
umkm_id

title

type

category

thumbnail_url

budget_total
budget_used

cpm

min_views
max_views

status

submission_count
approved_count

created_at
```

### Kenapa?

Dashboard UMKM akan sering menampilkan:

```text
Jumlah submission
Jumlah approved
```

Jika selalu query collection lain akan mahal.

---

# 4. campaign_briefs

Ubah struktur.

```text
campaign_briefs
---------------
campaign_id

brief_json

generated_by_ai
```

Daripada 15 field terpisah.

Karena AI Brief kemungkinan berubah terus.

Lebih fleksibel.

---

# 5. campaign_claims

Tambahkan unique constraint logic.

```text
campaign_id
creator_id
```

Tidak boleh ada duplikat.

Tambahkan:

```text
claim_status
```

```text
claimed
submitted
approved
rejected
cancelled
```

---

# 6. submissions

Tambahkan snapshot creator.

```text
submissions
-----------
claim_id

creator_id

creator_name

platform

video_url

caption

current_views

analytics_file

status

fraud_score
```

### Kenapa?

Dashboard UMKM sering menampilkan:

```text
Nama Kreator
Views
Status
```

Tidak perlu join lagi.

---

# 7. fraud_analyses

Saya sarankan HAPUS.

Untuk MVP tidak perlu collection sendiri.

Cukup:

```text
submissions.fraud_score
submissions.fraud_result
```

Karena:

```text
1 submission
→ 1 fraud result
```

Tidak perlu collection terpisah.

---

# 8. rate_cards

Tambahkan:

```text
platform
content_type
```

Contoh:

```text
TikTok Video
Instagram Reel
Instagram Story
UGC Product Video
```

Schema:

```text
rate_cards
----------
creator_id

title

platform

content_type

price

delivery_days

revision_limit

description

is_active
```

---

# 9. conversations

Tambahkan:

```text
offer_id
```

opsional.

Karena nanti chat sering terkait satu negosiasi.

---

# 10. messages

Tambahkan:

```text
message_type
```

```text
text
image
file
offer
system
```

Schema:

```text
messages
--------
conversation_id

sender_id

message_type

content

attachment_url
```

---

# 11. offers

Tambahkan:

```text
offer_type
```

```text
rate_card
custom
```

Karena bisa berasal dari rate card maupun negosiasi manual.

---

# 12. orders

Order harus menjadi pusat transaksi.

```text
orders
------
offer_id

creator_id
umkm_id

title

price

deadline

revision_limit

escrow_amount

escrow_status

order_status
```

Snapshot data offer disimpan di sini.

Jangan hanya referensi `offer_id`.

Karena offer bisa berubah.

---

# 13. wallets (DITAMBAHKAN KEMBALI)

Saya justru menyarankan wallet tetap dibuat sejak MVP.

```text
wallets
-------
user_id

available_balance

pending_balance
```

Karena fitur campaign PPV membutuhkan:

```text
Saldo Kreator
Saldo Pending
Penarikan
```

Jika tidak ada wallet, nanti migrasinya cukup berat.

---

# 14. wallet_transactions

Minimal.

```text
wallet_transactions
-------------------
wallet_id

type

amount

reference_type

reference_id
```

---

# Collection MVP Final yang Saya Rekomendasikan

```text
profiles
social_accounts

campaigns
campaign_briefs
campaign_claims
submissions

rate_cards

conversations
messages

offers
orders

wallets
wallet_transactions
```

Total:

```text
13 Collections
```

Ini jauh lebih realistis untuk Appwrite dibanding 20 collection, tetapi masih cukup kuat untuk mendukung:

* Campaign PPV
* AI Brief
* AI Fraud
* Rate Card
* Chat
* Negosiasi
* Escrow
* Wallet
* Withdraw

Tanpa perlu migrasi besar ketika Marketiv mulai mendapatkan pengguna. Setelah schema ini disetujui, langkah berikutnya yang paling tepat adalah **Tahap 3: UI Flow & User Journey Mapping**, karena seluruh entity utama sudah stabil.
