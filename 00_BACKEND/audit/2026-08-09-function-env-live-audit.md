# Audit Environment Variables Function — Project Marketiv (Live)

- **Project ID**: `69f9d45b00315cb0ec2f`
- **Region**: `sgp` (<https://sgp.cloud.appwrite.io/v1>)
- **Tanggal audit**: 2026-08-09
- **Metode**:
  - `appwrite/ops/audit-live.mjs` — audit read-only live vs config
  - `appwrite/ops/sync-function-vars.mjs --dry` — diff `.env` lokal vs vars live
  - Fabrik dump `/functions/{id}/variables` via API untuk 49 fungsi
  - Inspeksi `process.env.*` di `src/main.js` tiap fungsi

> **STATUS TERAKHIR (2026-08-10)**: Semua perbaikan selesai —
> 1. `sync-function-vars.mjs` → 53 variabel baru, NO-VARS 11 → 0.
> 2. `activate-latest-deployment.mjs` → `create-order` & `create-escrow`
>    diaktifkan ke deployment `ready` 2026-08-10, STALE-DEP 2 → 0.
> 3. `fix-function-vars.mjs` → `validate-and-upload.DEFAULT_STORAGE_BUCKET_ID`
>    kini `user-files`.
> `audit-live.mjs` final: **0 blocker, 2 warning** (tabel `appeals` belum
> diketatkan; `reset-password-with-otp` tanpa DB ID — aman, Auth-only).

## Ringkasan

| Status                       | Jumlah | Keterangan                                                          |
| ---------------------------- | ------ | ------------------------------------------------------------------- |
| 🔴 KRITIS (NO-VARS)          | 0      | ✅ Sudah diisi via sync 2026-08-10                                  |
| 🟠 WARNING (kurang DB ID)    | 1      | `reset-password-with-otp` aman (Auth-only); `accept-tos` sudah dilengkapi |
| 🟠 STALE-DEPLOYMENT          | 0      | ✅ Keduanya diaktifkan ke deployment 2026-08-10                          |
| 🟡 NILAI SALAH / PLACEHOLDER | 1      | `your-midtrans-iris-server-key` (skip, placeholder aman)                 |
| 🟢 LENGKAP                   | 49     | Vars live sesuai `.env` lokal                                             |

---

## 1. 🔴 KRITIS — Fungsi live TANPA env vars sama sekali (11)

> **✅ SELESAI 2026-08-10**: `.env` dibuat untuk ke-11 fungsi ini (nilai dari
> `appwrite.config.json` + template fungsi sejenis), lalu di-sync via
> `node appwrite/ops/sync-function-vars.mjs`. `audit-live.mjs` kini melaporkan
> **0 NO-VARS**. Env baru berlaku pada eksekusi berikutnya — tidak perlu redeploy.

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

> **✅ SELESAI 2026-08-10**: `activate-latest-deployment.mjs` mengaktifkan
> deployment `ready` 2026-08-10 untuk keduanya (sebelumnya pointer tertinggal di
> luar 25 terbaru). STALE-DEP kini 0.

Bukan masalah env, tapi bercak: yang jalan di live belum tentu kode di repo.
Perbaiki: `node appwrite/ops/activate-latest-deployment.mjs`

| Fungsi          | Aktif di deployment                 | Ada yg "ready" baru |
| --------------- | ----------------------------------- | ------------------- |
| `create-order`  | `6a71b0b22a33aa9a822f` (2026-08-04) | 2026-08-09T12:05:54 |
| `create-escrow` | `6a6b047a2813ef26d01d` (2026-07-30) | 2026-08-09T12:05:51 |

Keduanya sudah **diaktifkan** (2026-08-10) — baris di atas adalah kondisi saat
audit sebelum perbaikan.

---

## 4. 🟡 NILAI SALAH / PLACEHOLDER

| Fungsi                | Key                         | Nilai live                      | Seharusnya   |
| --------------------- | --------------------------- | ------------------------------- | ------------ |
| `validate-and-upload` | `DEFAULT_STORAGE_BUCKET_ID` | ~~`campaign-assets`~~ → `user-files` ✅ | `user-files` |
| `request-withdrawal`  | `MIDTRANS_IRIS_SERVER_KEY`  | `your-midtrans-iris-server-key` | kunci asli   |

- **`validate-and-upload.DEFAULT_STORAGE_BUCKET_ID`** — ✅ **DIPERBAIKI 2026-08-10**
  via `appwrite/ops/fix-function-vars.mjs` (SET). Kini `user-files`
  (fileSecurity=true). Sebelumnya `campaign-assets` read("any") + fileSecurity=false,
  sehingga berkas terbuka publik — karena itu kuota per-pengguna tidak pernah ditegakkan.
- **`request-withdrawal.MIDTRANS_IRIS_SERVER_KEY`** — placeholder belum diganti kunci
  asli Midtrans (Iris = payout API terpisah dari Snap). **Skip** — belum dipakai produksi.
- `sync --dry` juga menunjuk **`APPWRITE_API_KEY` kosong di live** untuk
  `request-password-otp` & `reset-password-with-otp` (uncensored saat run-lokal:
  bila dipanggil tanpa header `x-appwrite-key` akan gagal).

---

## 5. 🟢 Lengkap

Total **49 fungsi** kini punya env vars tersinkron ke live. Rincian:

- **36 fungsi** sudah sinkron sejak sebelum audit (hasil `sync-function-vars --dry`
  hanya men-shows `UPD APPWRITE_API_KEY` dsb yang merupakan secret — nilainya tidak
  terbaca dari API, bukan berarti hilang). Daftar fungsi yang TIDAK tercantum di
  bagian 1-4:

`ai-brief, ai-fraud-precheck, calculate-campaign-reward, campaign-claimed,
campaign-published, cancel-payment, create-conversation, create-escrow, create-offer,
create-order, create-payment, create-user-profile, create-user-wallet, delete-file,
expire-stale-claims, fee-rate-flip, get-creator-dashboard-summary, get-creator-directory,
get-creator-negotiations, get-creator-profile, get-umkm-dashboard-summary,
get-umkm-finance-summary, get-umkm-negotiations, get-umkm-profile, mature-pending-balance,
midtrans-webhook, notify-order-activity, release-escrow, request-password-otp,
request-withdrawal, review-submission, send-chat-notification, send-message,
validate-and-upload, verify-kyc, withdrawal-callback`

- **11 fungsi NO-VARS** (bagian 1) diisi 2026-08-10 → sudah punya vars.
- **`accept-tos`** dilengkapi DB ID + collection IDs (bagian 2) → sudah punya vars.

Dua fungsi tersisa masih punya catatan (bukan env kosong):
`reset-password-with-otp` tanpa `APPWRITE_DATABASE_ID` (aman, Auth-only — bagian 2)
dan `request-withdrawal` placeholder Midtrans (bagian 4).

---

## Rekomendasi Urutan Aksi

Semua aksi utama sudah dijalankan 2026-08-10. Sisa terbuka:

1. **`request-withdrawal.MIDTRANS_IRIS_SERVER_KEY`** — ganti placeholder dengan kunci
   asli saat payout Midtrans Iris aktif (skip — belum dipakai produksi).
2. **Tabel `appeals`** — `audit-live` warning: live `rowSec=true` tanpa
   `create("users")` di permissions; config minta `["create(\"users\")"]`.
   Ketatkan permissions konsisten dengan config.
3. **Rotasi API key** — `ai-brief.APPWRITE_FUNCTION_API_KEY` pernah terekspos
   (secret=false, dihapus 2026-07-29). Cabut/rotasi di konsol bila belum.
4. Env baru & deployment aktif sudah berlaku — tidak perlu tindakan lagi.

## Lampiran — Snapshot vars live (49 fungsi, pasca-fix 2026-08-10)

Snapshot **setelah** perbaikan — semua fungsi sudah punya env vars. Diambil via
`node /tmp/opencode/dump-fn-vars.mjs` (API `/functions/{id}/variables`). Kolom
"Σ" = jumlah key vars. Nilai secret (`APPWRITE_API_KEY`, `GEMINI_API_KEY`,
`VERTEX_AI_PRIVATE_KEY`, `MIDTRANS_*`) tidak tampil via API — kehadiran key-nya
tercatat, nilainya harus diverifikasi manual di konsol.

| Fungsi | Σ | Vars |
| ------ | - | ---- |
| `accept-tos` | 4 | `CURRENT_TOS_VERSION`, `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `USERS_COLLECTION_ID` |
| `ai-brief` | 9 | `CAMPAIGN_BRIEFS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `GEMINI_API_KEY`, `APPWRITE_API_KEY`, `VERTEX_AI_PROJECT_ID`, `VERTEX_AI_CLIENT_EMAIL`, `VERTEX_AI_PRIVATE_KEY`, `VERTEX_AI_LOCATION`, `VERTEX_AI_MODEL` |
| `ai-fraud-precheck` | 8 | `CAMPAIGNS_COLLECTION_ID`, `APPWRITE_API_KEY`, `GEMINI_API_KEY`, `SUBMISSIONS_COLLECTION_ID`, `AI_REQUESTS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `CAMPAIGN_BRIEFS_COLLECTION_ID`, `FRAUD_CHECKS_COLLECTION_ID` |
| `auto-approve-orders` | 4 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `ORDERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `calculate-campaign-reward` | 6 | `APPWRITE_API_KEY`, `NOTIFICATIONS_COLLECTION_ID`, `WALLETS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `CAMPAIGNS_COLLECTION_ID`, `APPWRITE_DATABASE_ID` |
| `campaign-claimed` | 6 | `CLAIMS_COLLECTION_ID`, `CAMPAIGNS_COLLECTION_ID`, `APPWRITE_API_KEY`, `CREATOR_PROFILES_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`, `APPWRITE_DATABASE_ID` |
| `campaign-published` | 5 | `APPWRITE_API_KEY`, `CREATOR_PROFILES_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `NOTIFICATIONS_COLLECTION_ID`, `CAMPAIGNS_COLLECTION_ID` |
| `cancel-payment` | 3 | `APPWRITE_DATABASE_ID`, `PAYMENTS_COLLECTION_ID`, `APPWRITE_API_KEY` |
| `create-appeal` | 5 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `APPEALS_COLLECTION_ID`, `USERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `create-conversation` | 2 | `APPWRITE_DATABASE_ID`, `CONVERSATIONS_COLLECTION_ID` |
| `create-escrow` | 9 | `APPWRITE_API_KEY`, `TRANSACTIONS_COLLECTION_ID`, `PAYMENTS_COLLECTION_ID`, `ORDERS_COLLECTION_ID`, `WALLETS_COLLECTION_ID`, `ESCROWS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `CAMPAIGNS_COLLECTION_ID`, `FEE_RATE` |
| `create-offer` | 4 | `APPWRITE_DATABASE_ID`, `CONVERSATIONS_COLLECTION_ID`, `MESSAGES_COLLECTION_ID`, `OFFERS_COLLECTION_ID` |
| `create-order` | 4 | `APPWRITE_DATABASE_ID`, `APPWRITE_API_KEY`, `ORDERS_COLLECTION_ID`, `CURRENT_TOS_VERSION` |
| `create-payment` | 6 | `PAYMENTS_COLLECTION_ID`, `ORDERS_COLLECTION_ID`, `MIDTRANS_SERVER_KEY`, `APPWRITE_API_KEY`, `MIDTRANS_ENV`, `APPWRITE_DATABASE_ID` |
| `create-user-profile` | 7 | `UMKM_PROFILES_COLLECTION_ID`, `APPWRITE_API_KEY`, `USER_STORAGE_USAGE_COLLECTION_ID`, `CREATOR_PROFILES_COLLECTION_ID`, `USERS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `CURRENT_TOS_VERSION` |
| `create-user-wallet` | 3 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `WALLETS_COLLECTION_ID` |
| `delete-file` | 4 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `USER_FILES_COLLECTION_ID`, `USER_STORAGE_USAGE_COLLECTION_ID` |
| `expire-stale-claims` | 6 | `APPWRITE_API_KEY`, `CAMPAIGNS_COLLECTION_ID`, `CLAIMS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `CREATOR_PROFILES_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `fee-rate-flip` | 7 | `APPWRITE_FUNCTION_API_ENDPOINT`, `APPWRITE_FUNCTION_PROJECT_ID`, `FEE_RATE`, `APPWRITE_DATABASE_ID`, `APPWRITE_API_KEY`, `NOTIFICATIONS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID` |
| `get-creator-dashboard-summary` | 10 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `SUBMISSIONS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `CLAIMS_COLLECTION_ID`, `ESCROWS_COLLECTION_ID`, `WALLETS_COLLECTION_ID`, `ORDERS_COLLECTION_ID`, `CAMPAIGNS_COLLECTION_ID`, `RATE_CARDS_COLLECTION_ID` |
| `get-creator-directory` | 6 | `RATE_CARD_PACKAGES_COLLECTION_ID`, `APPWRITE_API_KEY`, `CREATOR_PROFILES_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `CREATOR_SOCIAL_ACCOUNTS_COLLECTION_ID`, `RATE_CARDS_COLLECTION_ID` |
| `get-creator-negotiations` | 11 | `RATE_CARD_PACKAGES_COLLECTION_ID`, `OFFERS_COLLECTION_ID`, `APPWRITE_API_KEY`, `ORDERS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `CONVERSATIONS_COLLECTION_ID`, `DELIVERABLES_COLLECTION_ID`, `ESCROWS_COLLECTION_ID`, `UMKM_PROFILES_COLLECTION_ID`, `MESSAGES_COLLECTION_ID`, `FEE_RATE` |
| `get-creator-profile` | 7 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `CREATOR_PROFILES_COLLECTION_ID`, `RATE_CARD_PACKAGES_COLLECTION_ID`, `RATE_CARDS_COLLECTION_ID`, `CREATOR_SOCIAL_ACCOUNTS_COLLECTION_ID`, `USERS_COLLECTION_ID` |
| `get-umkm-dashboard-summary` | 6 | `CAMPAIGN_SUBMISSIONS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `CAMPAIGNS_COLLECTION_ID`, `ESCROWS_COLLECTION_ID`, `APPWRITE_API_KEY`, `ORDERS_COLLECTION_ID` |
| `get-umkm-finance-summary` | 7 | `APPWRITE_DATABASE_ID`, `TRANSACTIONS_COLLECTION_ID`, `ESCROWS_COLLECTION_ID`, `APPWRITE_API_KEY`, `ORDERS_COLLECTION_ID`, `PAYMENTS_COLLECTION_ID`, `CAMPAIGNS_COLLECTION_ID` |
| `get-umkm-negotiations` | 9 | `APPWRITE_DATABASE_ID`, `ORDERS_COLLECTION_ID`, `OFFERS_COLLECTION_ID`, `RATE_CARD_PACKAGES_COLLECTION_ID`, `CREATOR_PROFILES_COLLECTION_ID`, `CONVERSATIONS_COLLECTION_ID`, `MESSAGES_COLLECTION_ID`, `ESCROWS_COLLECTION_ID`, `DELIVERABLES_COLLECTION_ID` |
| `get-umkm-profile` | 4 | `USERS_COLLECTION_ID`, `UMKM_PROFILES_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `APPWRITE_API_KEY` |
| `mature-pending-balance` | 5 | `APPWRITE_DATABASE_ID`, `WALLETS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`, `APPWRITE_API_KEY` |
| `midtrans-webhook` | 4 | `PAYMENTS_COLLECTION_ID`, `APPWRITE_API_KEY`, `MIDTRANS_SERVER_KEY`, `APPWRITE_DATABASE_ID` |
| `notify-order-activity` | 3 | `APPWRITE_DATABASE_ID`, `ORDERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `patch-campaign-draft` | 3 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `CAMPAIGNS_COLLECTION_ID` |
| `patch-campaign-status` | 3 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `CAMPAIGNS_COLLECTION_ID` |
| `refund-escrow` | 7 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `WALLETS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `ESCROWS_COLLECTION_ID`, `ORDERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `refund-order` | 8 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `WALLETS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `ESCROWS_COLLECTION_ID`, `ORDERS_COLLECTION_ID`, `CAMPAIGNS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `release-escrow` | 7 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `TRANSACTIONS_COLLECTION_ID`, `ESCROWS_COLLECTION_ID`, `WALLETS_COLLECTION_ID`, `ORDERS_COLLECTION_ID`, `FEE_RATE` |
| `request-password-otp` | 6 | `APPWRITE_PROJECT_ID`, `APPWRITE_ENDPOINT`, `OTP_RATE_LIMITS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `USERS_COLLECTION_ID`, `APPWRITE_API_KEY` |
| `request-withdrawal` | 14 | `APPWRITE_DATABASE_ID`, `WALLETS_COLLECTION_ID`, `WITHDRAWALS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `MINIMUM_WITHDRAW`, `USERS_COLLECTION_ID`, `APPWRITE_API_KEY`, `CURRENT_TOS_VERSION`, `WITHDRAW_COOLING_DAYS`, `MIDTRANS_IRIS_ENV`, `MIDTRANS_IRIS_SERVER_KEY`, `NOTIFICATIONS_COLLECTION_ID`, `KYC_THRESHOLD`, `WITHDRAW_PER_DAY_LIMIT` |
| `reset-password-with-otp` | 3 | `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` |
| `review-appeal` | 5 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `APPEALS_COLLECTION_ID`, `USERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `review-submission` | 4 | `APPWRITE_DATABASE_ID`, `CAMPAIGNS_COLLECTION_ID`, `CAMPAIGN_SUBMISSIONS_COLLECTION_ID`, `CAMPAIGN_CLAIMS_COLLECTION_ID` |
| `send-chat-notification` | 4 | `APPWRITE_DATABASE_ID`, `CONVERSATIONS_COLLECTION_ID`, `APPWRITE_API_KEY`, `NOTIFICATIONS_COLLECTION_ID` |
| `send-message` | 3 | `APPWRITE_DATABASE_ID`, `CONVERSATIONS_COLLECTION_ID`, `MESSAGES_COLLECTION_ID` |
| `suspend-user` | 4 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `USERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `track-order-review` | 2 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID` |
| `unsuspend-user` | 4 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `USERS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `user-email-verified` | 3 | `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `USERS_COLLECTION_ID` |
| `validate-and-upload` | 5 | `USER_STORAGE_USAGE_COLLECTION_ID`, `USER_FILES_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `APPWRITE_API_KEY`, `DEFAULT_STORAGE_BUCKET_ID` |
| `verify-kyc` | 4 | `APPWRITE_API_KEY`, `USERS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `NOTIFICATIONS_COLLECTION_ID` |
| `withdrawal-callback` | 6 | `WALLETS_COLLECTION_ID`, `WITHDRAWALS_COLLECTION_ID`, `APPWRITE_DATABASE_ID`, `APPWRITE_API_KEY`, `NOTIFICATIONS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID` |

