# Audit Environment Variables Function — Project Marketiv (Live)

- **Project ID**: `69f9d45b00315cb0ec2f`
- **Region**: `sgp` (<https://sgp.cloud.appwrite.io/v1>)
- **Tanggal audit**: 2026-08-09
- **Metode**:
  - `appwrite/ops/audit-live.mjs` — audit read-only live vs config
  - `appwrite/ops/sync-function-vars.mjs --dry` — diff `.env` lokal vs vars live
  - Fabrik dump `/functions/{id}/variables` via API untuk 49 fungsi
  - Inspeksi `process.env.*` di `src/main.js` tiap fungsi

## Ringkasan

| Status                       | Jumlah | Keterangan                                                          |
| ---------------------------- | ------ | ------------------------------------------------------------------- |
| 🔴 KRITIS (NO-VARS)          | 11     | Env vars kosong total di live — `getEnv()` throw di setiap eksekusi |
| 🟠 WARNING (kurang DB ID)    | 2      | Hanya aman bila `NEXT_PUBLIC_DB_ID` di-set (tidak di community)     |
| 🟠 STALE-DEPLOYMENT          | 2      | Deployment aktif ≠ kode terbaru (kode lama yang jalan)              |
| 🟡 NILAI SALAH / PLACEHOLDER | 3      | `campaign-assets`, `your-midtrans-iris-server-key`, dsb             |
| 🟢 LENGKAP                   | 31+    | Vars live sesuai `.env` lokal                                       |

---

## 1. 🔴 KRITIS — Fungsi live TANPA env vars sama sekali (11)

Semua fungsi ini punya **0 variabel** di live console. Pola seragam: ke-11 juga
**tidak punya file `.env` di `00_BACKEND/functions/<id>/`**, sehingga waktu push
tidak ada env yang terbawa. `getEnv()` di setiap fungsi fail-fast saat
`databaseId` kosong, jadi **setiap eksekusi melempar
`Missing required environment variables: databaseId`**.

| Fungsi                  | Vars live | Env yang dibutuhkan kode                                                                                                                                                                                     |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auto-approve-orders`   | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`                                                                                                                                                                   |
| `create-appeal`         | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `APPEALS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`, `USERS_COLLECTION_ID`                                                                                    |
| `patch-campaign-draft`  | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `CAMPAIGNS_COLLECTION_ID`                                                                                                                                        |
| `patch-campaign-status` | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `CAMPAIGNS_COLLECTION_ID`                                                                                                                                        |
| `refund-escrow`         | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `ESCROWS_COLLECTION_ID`, `ORDERS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `WALLETS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`                            |
| `refund-order`          | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `ESCROWS_COLLECTION_ID`, `ORDERS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `WALLETS_COLLECTION_ID`, `CAMPAIGNS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `review-appeal`         | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `APPEALS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`, `USERS_COLLECTION_ID`                                                                                    |
| `suspend-user`          | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `USERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`                                                                                                             |
| `track-order-review`    | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`                                                                                                                                                                   |
| `unsuspend-user`        | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `USERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`                                                                                                             |
| `user-email-verified`   | 0         | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `USERS_COLLECTION_ID`                                                                                                                                            |

> Catatan: `APPWRITE_ENDPOINT`/`APPWRITE_PROJECT_ID` TIDAK wajib di-set — kode memakai
> fallback ke `APPWRITE_FUNCTION_API_ENDPOINT`/`APPWRITE_FUNCTION_PROJECT_ID`
> yang di-inject otomatis oleh Appwrite saat runtime. Begitu juga `NEXT_PUBLIC_*`
> hanya dipakai di frontend. Kolom di atas hanya mencantumkan variabel non-opsional.
> `APPWRITE_API_KEY` juga opsional saat dijalankan via event/websocket (runtime
> pakai header `x-appwrite-key`) — DIPERLUKAN hanya bila dieksekusi manual/scheduled.

### Perbaikan yang disarankan

Buat `.env` per fungsi (contoh template di bawah), lalu jalankan:

```
node appwrite/ops/sync-function-vars.mjs
```

**Template `.env` umum (nilai default dari `appwrite.config.json`):**

```dotenv
APPWRITE_API_KEY=<api-key-scope-doc+vars>
APPWRITE_DATABASE_ID=6a4c8598001da3b0d7f0
# koleksi yang dipakai fungsi tsb — contoh untuk refund-order:
ESCROWS_COLLECTION_ID=escrows
ORDERS_COLLECTION_ID=orders
TRANSACTIONS_COLLECTION_ID=transactions
WALLETS_COLLECTION_ID=wallets
CAMPAIGNS_COLLECTION_ID=campaigns
NOTIFICATIONS_COLLECTION_ID=notifications
```

---

## 2. 🟠 WARNING — Kurang `APPWRITE_DATABASE_ID`

| Fungsi                    | Vars live                                        | Catatan                                                                                                                                                  |
| ------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accept-tos`              | hanya `CURRENT_TOS_VERSION`                      | Tanpa DB ID — DB aman hanya bila `NEXT_PUBLIC_DB_ID` di set; update `accept-tos` akan throw.                                                             |
| `reset-password-with-otp` | hanya `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID` | Fungsi hanya pakai Auth/Users API (`users.updateVerification`…), tidak membaca DB. Tanpa `APPWRITE_DATABASE_ID` TETAP aman — warning ini bisa diabaikan. |

---

## 3. 🟠 STALE-DEPLOYMENT — Deployment aktif ≠ kode terbaru

Bukan masalah env, tapi bercak: yang jalan di live belum tentu kode di repo.
Perbaiki: `node appwrite/ops/activate-latest-deployment.mjs`

| Fungsi          | Aktif di deployment                 | Ada yg "ready" baru |
| --------------- | ----------------------------------- | ------------------- |
| `create-order`  | `6a71b0b22a33aa9a822f` (2026-08-04) | 2026-08-09T12:05:54 |
| `create-escrow` | `6a6b047a2813ef26d01d` (2026-07-30) | 2026-08-09T12:05:51 |

---

## 4. 🟡 NILAI SALAH / PLACEHOLDER

| Fungsi                | Key                         | Nilai live                      | Seharusnya   |
| --------------------- | --------------------------- | ------------------------------- | ------------ |
| `validate-and-upload` | `DEFAULT_STORAGE_BUCKET_ID` | `campaign-assets`               | `user-files` |
| `request-withdrawal`  | `MIDTRANS_IRIS_SERVER_KEY`  | `your-midtrans-iris-server-key` | kunci asli   |

- **`validate-and-upload.DEFAULT_STORAGE_BUCKET_ID=campaign-assets`** — Sejak insiden
  2026-07-29 harus `user-files` (campaign-assets read("any") + fileSecurity=false,
  sehingga berkas terbuka publik). Perbaikan sudah disiapkan di
  `appwrite/ops/fix-function-vars.mjs` (SET). Jalankan setelah konfirm.
- **`request-withdrawal.MIDTRANS_IRIS_SERVER_KEY`** — placeholder belum diganti kunci
  asli Midtrans (Iris = payout API terpisah dari Snap).
- `sync --dry` juga menunjuk **`APPWRITE_API_KEY` kosong di live** untuk
  `request-password-otp` & `reset-password-with-otp` (uncensored saat run-lokal:
  bila dipanggil tanpa header `x-appwrite-key` akan gagal).

---

## 5. 🟢 Lengkap

26 fungsi dengan `.env` lokal sudah sinkron ke live (hasil `sync-function-vars --dry`
hanya men-shows `UPD APPWRITE_API_KEY` dsb yang merupakan secret — nilainya tidak
terbaca dari API, bukan berarti hilang). Daftar lengkap (list fungsi dengan `.env`
yang TIDAK tercantum di bagian 1-4):

`ai-brief, ai-fraud-precheck, calculate-campaign-reward, campaign-claimed,
campaign-published, cancel-payment, create-conversation, create-escrow, create-offer,
create-order, create-payment, create-user-profile, create-user-wallet, delete-file,
expire-stale-claims, fee-rate-flip, get-creator-dashboard-summary, get-creator-directory,
get-creator-negotiations, get-creator-profile, get-umkm-dashboard-summary,
get-umkm-finance-summary, get-umkm-negotiations, get-umkm-profile, mature-pending-balance,
midtrans-webhook, notify-order-activity, release-escrow, request-password-otp,
request-withdrawal, review-submission, send-chat-notification, send-message,
validate-and-upload, verify-kyc, withdrawal-callback`

---

## Rekomendasi Urutan Aksi

1. **Utamakan** untuk 11 fungsi NO-VARS: buat `.env` + `node appwrite/ops/sync-function-vars.mjs`
2. **accept-tos**: tambah `APPWRITE_DATABASE_ID` (dan validasi `CURRENT_TOS_VERSION`)
3. `node appwrite/ops/fix-function-vars.mjs` untuk `DEFAULT_STORAGE_BUCKET_ID=user-files`
4. `node appwrite/ops/activate-latest-deployment.mjs` untuk `create-order` & `create-escrow`
5. Ganti placeholder `MIDTRANS_IRIS_SERVER_KEY` di `request-withdrawal`
6. Cabut/rotasi API key bila ada yang pernah terlanjur terekspos

## Lampiran — Snapshot vars live (49 fungsi, 2026-08-09)

```
accept-tos                live  CURRENT_TOS_VERSION
ai-brief                  live  APPWRITE_API_KEY,APPWRITE_DATABASE_ID,CAMPAIGN_BRIEFS_COLLECTION_ID,GEMINI_API_KEY,VERTEX_AI_*
ai-fraud-precheck         live  AI_REQUESTS_COLLECTION_ID,APPWRITE_API_KEY,APPWRITE_DATABASE_ID,CAMPAIGNS_COLLECTION_ID,CAMPAIGN_BRIEFS_COLLECTION_ID,FRAUD_CHECKS_COLLECTION_ID,GEMINI_API_KEY,SUBMISSIONS_COLLECTION_ID
auto-approve-orders       live  (KOSONG)
create-appeal             live  (KOSONG)
patch-campaign-draft      live  (KOSONG)
patch-campaign-status     live  (KOSONG)
refund-escrow             live  (KOSONG)
refund-order              live  (KOSONG)
review-appeal             live  (KOSONG)
suspend-user              live  (KOSONG)
track-order-review        live  (KOSONG)
unsuspend-user            live  (KOSONG)
user-email-verified       live  (KOSONG)
reset-password-with-otp   live  APPWRITE_ENDPOINT,APPWRITE_PROJECT_ID
(request lain lengkap — lihat lampiran dump di bawah)
```

Lampiran penuh (semua 49 fungsi, key vars live) tersedia di output
`node appwrite/ops/audit-live.mjs` dan `node /tmp/opencode/dump-fn-vars.mjs` pada
sesi audit ini.

