# Audit `mark-notifications-read` + `get-umkm-finance-summary` — 2026-08-11

- **Tanggal**: Selasa, 11 Agustus 2026
- **Scope**:
  - `mark-notifications-read`
  - `get-umkm-finance-summary`
- **Tujuan**: tutup sisa audit checklist dengan verifikasi code, schema, test,
  dan smoke/live minimal

## Ringkasan

Hasil audit awal:

- `mark-notifications-read` dan `get-umkm-finance-summary` tidak punya temuan
  baru pada level code/schema/contract.

Temuan live tambahan saat verifikasi lanjutan hari yang sama:

- semua function berawalan `mark*` ternyata **belum ada di live** walau source
  dan `appwrite.json` lokal sudah punya.
- remediation live sudah dijalankan:
  - create function `mark-conversation-read`
  - create function `mark-notifications-read`
  - deploy source terbaru ke keduanya
  - pasang runtime variables minimal
  - smoke `mark-conversation-read` pass
  - smoke `mark-notifications-read` pass

Kedua function sudah selaras dengan schema terbaru dan kontrak yang dipakai
frontend/backend lain:

- `mark-notifications-read`
  - schema cocok dengan tabel `notifications`
  - ownership guard jalan
  - live update hanya menyentuh notifikasi milik caller
- `get-umkm-finance-summary`
  - schema cocok dengan tabel `payments`, `transactions`, `campaigns`,
    `orders`, `escrows`
  - perhitungan memakai `total_amount` dan `fee_amount`, bukan rekalkulasi liar
  - live DTO terbentuk dan terbaca normal

## Audit code + schema

### 1. `mark-notifications-read`

Source:

- `00_BACKEND/functions/mark-notifications-read/src/main.js`
- tabel `notifications` di `00_BACKEND/appwrite.config.json`

Hasil:

- function membaca `ids: string[]`
- setiap row diverifikasi lewat `notif.userId === caller`
- hanya row `isRead === false` yang di-update
- kolom schema yang dipakai valid:
  - `userId`
  - `isRead`
  - `title`
  - `message`
  - `type`
  - `createdAt`

Tidak ditemukan drift field.

### 2. `get-umkm-finance-summary`

Source:

- `00_BACKEND/functions/get-umkm-finance-summary/src/main.js`
- tabel `payments`, `transactions`, `campaigns`, `orders`, `escrows`
  di `00_BACKEND/appwrite.config.json`

Hasil:

- `payments` dibaca dari `user_id`, `status`, `total_amount`, `fee_amount`
- `transactions` refund dibaca dari `userId`, `type`, `amount`
- `campaigns` escrow campaign dibaca dari `umkmId`, `status`, `remainingBudget`
- `orders` dipakai sebagai ownership bridge ke `escrows`
- `escrows` dibaca dari `orderId`, `status`, `amount`

Tidak ditemukan drift field atau mismatch naming terhadap schema sekarang.

## Evidence test lokal

Command:

```bash
cd 00_BACKEND
rtk npx vitest run tests/integration/functions.test.ts -t "mark-notifications-read function|get-umkm-finance-summary function"
```

Hasil:

- `1` file pass
- `2` test pass
- `0` fail

Test yang tertutup:

1. `mark-notifications-read`
   hanya menandai notifikasi unread milik caller, dan mengabaikan row milik user lain
2. `get-umkm-finance-summary`
   menghitung `totalExpenses`, `pendingPayments`, `platformFees`,
   `refundsReceived`, `campaignEscrow`, `rateCardEscrow`, `pendingRelease`,
   `refundEligible` dari field schema nyata

## Evidence smoke/live

### 1. `mark-notifications-read`

Metode:

- buat 2 row fixture live di `notifications`
  - 1 milik UMKM `6a699a5a002a13ca4d76`
  - 1 milik user lain `test-user-001`
- invoke function source ke live DB dengan caller UMKM
- verifikasi hasil row
- cleanup fixture

Fixture IDs:

- own: `smokenotifown1786410591722`
- other: `smokenotifoth1786410591722`

Hasil invoke:

```json
{
  "ok": true,
  "updated": 1
}
```

Verifikasi row:

```json
{
  "own": {
    "id": "smokenotifown1786410591722",
    "userId": "6a699a5a002a13ca4d76",
    "isRead": true
  },
  "other": {
    "id": "smokenotifoth1786410591722",
    "userId": "test-user-001",
    "isRead": false
  }
}
```

Cleanup:

- `cleanup-ok`

Kesimpulan:

- ownership guard live bekerja
- function tidak menandai notifikasi user lain

### 1b. Remediation live `mark-notifications-read`

Status awal saat cek live:

- function `mark-notifications-read` belum ada di `/functions`

Remediation yang dijalankan:

- create live function `mark-notifications-read`
- create deployment aktif `6a7a779fda75b38c8e26`
- set variables:
  - `APPWRITE_API_KEY`
  - `APPWRITE_DATABASE_ID`
  - `NOTIFICATIONS_COLLECTION_ID`

Status akhir:

- function ada di live
- deployment aktif status `ready`
- vars live terdaftar `3`

### 2. `get-umkm-finance-summary`

Metode:

- invoke source function ke live DB secara read-only
- caller UMKM: `6a699a5a002a13ca4d76`

Hasil live:

```json
{
  "finance": {
    "totalExpenses": 10000,
    "escrowBalance": 10000,
    "pendingPayments": 4479000,
    "refundsReceived": 0,
    "platformFees": 0,
    "successfulTransactionsCount": 1,
    "isTruncated": false
  },
  "escrow": {
    "activeEscrow": 10000,
    "pendingRelease": 0,
    "refundEligible": 0,
    "campaignEscrow": 0,
    "rateCardEscrow": 10000,
    "isTruncated": false
  }
}
```

Kesimpulan:

- DTO live terbentuk sesuai kontrak
- tidak ada error env, schema, atau ownership di jalur baca

### 3. `mark-conversation-read`

Status awal saat cek live:

- function `mark-conversation-read` belum ada di `/functions`

Remediation yang dijalankan:

- create live function `mark-conversation-read`
- create deployment aktif `6a7a779fdb3800317082`
- set variables:
  - `APPWRITE_API_KEY`
  - `APPWRITE_DATABASE_ID`
  - `CONVERSATIONS_COLLECTION_ID`
  - `MESSAGES_COLLECTION_ID`

Smoke live:

- conversation fixture: `smokeconvq1786411184622`
- message unread dari creator:
  `smokemsgqa1786411184622`
- message milik caller sendiri:
  `smokemsgqb1786411184622`

Hasil invoke:

```json
{
  "ok": true,
  "updated": 1
}
```

Verifikasi row:

```json
{
  "a": {
    "id": "smokemsgqa1786411184622",
    "sender_id": "test-user-001",
    "read_at": "2026-08-11T01:20:23.453+00:00"
  },
  "b": {
    "id": "smokemsgqb1786411184622",
    "sender_id": "6a699a5a002a13ca4d76",
    "read_at": null
  }
}
```

Cleanup:

- `cleanup-ok`

Kesimpulan:

- function sekarang ada di live
- runtime vars terpasang
- unread message dari lawan bicara berhasil ditandai read
- message milik caller sendiri tidak ikut berubah

## Penutup

Sisa audit checklist untuk dua function ini **tuntas**.

Patch code tambahan yang dibutuhkan dari hasil audit 11 Agustus 2026 hanya
sinkronisasi manifest repo agar cocok dengan live remediation:

- `00_BACKEND/appwrite.config.json`
- `00_BACKEND/appwrite/generate_appwrite_json.cjs`

Selain itu, tidak ada patch logic function tambahan yang dibutuhkan untuk:

- `mark-notifications-read`
- `get-umkm-finance-summary`
