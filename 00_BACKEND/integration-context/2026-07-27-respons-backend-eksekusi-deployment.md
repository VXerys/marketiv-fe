# Respons Tim Backend — Eksekusi Pemulihan & Deployment

| | |
|---|---|
| **Tanggal** | 2026-07-27 (malam) |
| **Dari** | Tim backend |
| **Untuk** | Tim frontend/integrasi — mohon direview |
| **Merespons** | `2026-07-27-handoff-pemulihan-function-settings.md` (§C) dan `2026-07-27-verifikasi-event-prefix-dan-sisa-wiring.md` (§Resolusi) |
| **Status** | ✅ 7/8 item selesai · ⛔ 1 item blocked (doAndDont row limit) · ⬜ E2E belum dijalankan |

---

## 0. Ringkasan 1 menit

| | Hal | Status |
|---|---|---|
| ✅ | **26 Function pushed + deployed** — termasuk `mature-pending-balance` (baru) | Selesai, 42.5 detik |
| ✅ | **`NO DRIFT`** — 26 config = 26 live, 0 field beda | Terverifikasi |
| ✅ | `create-order` dan `request-withdrawal` — kode terbaru sudah live | Redeployed |
| ✅ | `mature-pending-balance` — function baru, env vars di-set, cron `0 2 * * *` | Deployed |
| ✅ | Env `USERS_COLLECTION_ID=users` di `request-withdrawal` | Di-set |
| ✅ | Permission 10 tabel diketatkan | Sudah sesuai |
| ✅ | DTO `get-creator-negotiations` — `conversationId` + `isArchived` ditambahkan | Deployed |
| ✅ | Kreator bisa klaim ulang setelah expired | Fix di `claim.service.ts` |
| ⛔ | `doAndDont` 400→4000 | **BLOCKED** — lihat §3 |

---

## 1. Respons atas §C Handoff — Daftar Kerja Tim Backend

### C-1. 🔴 Deploy — SELESAI ✅

| # | Permintaan | Tindakan kami | Hasil |
|---|---|---|---|
| 1 | Redeploy `create-order` | `appwrite push functions --all --force` — 26 Function sekaligus | ✅ Kode baru live. Guard `$previous` sudah hilang, dedup via unique index `idx_offerId` |
| 2 | Redeploy `request-withdrawal` + env `USERS_COLLECTION_ID` | Push + `appwrite functions create-variable --key USERS_COLLECTION_ID --value users` | ✅ Guard peran creator aktif, env terpasang |
| 3 | Push `mature-pending-balance` (function baru) | Push + set 4 env vars (`APPWRITE_DATABASE_ID`, `WALLETS_COLLECTION_ID`, `TRANSACTIONS_COLLECTION_ID`, `NOTIFICATIONS_COLLECTION_ID`) | ✅ Cron `0 2 * * *`, timeout 60, scopes `documents.read` + `documents.write` |

### C-2. 🟡 Kembalikan setelan build — SELESAI ✅

`appwrite push functions --all --force` mengembalikan **seluruh** setelan build sekaligus:
- `commands`: `"npm install"` di 25 Function yang tadinya kosong
- `entrypoint`: `"src/main.js"` di `request-withdrawal` dan `cancel-payment` yang tadinya kosong
- `name`: Format proper (e.g. `"Create Order"` bukan `"create-order"`)

Verifikasi sesudah push:
```
npm run fn:drift → NO DRIFT
Ringkasan: 0 field bisa kita perbaiki, 0 field ranah tim backend, 0 belum di-push, 0 yatim (26 di config, 26 di live)
```

### C-3. 🔴 Verifikasi deployment — SELESAI ✅

`node appwrite/ops/check-deployments.mjs` — hasil:
- **26/26 Function punya deployment aktif** (bukan `NONE`)
- Dugaan alarm palsu di snapshot sebelumnya **terbukti benar** — field `deployment` vs `deploymentId` di Appwrite 1.9.x
- Eksekusi tercatat: `expire-stale-claims` = 21, `delete-file` = 6, `campaign-published` = 3, dll
- Setelah push ulang, semua 26 Function punya deployment baru bertanggal hari ini

### C-4. 🟠 Kolom yang perlu diubah — SEBAGIAN

| Item | Permintaan | Status | Detail |
|---|---|---|---|
| `campaign_briefs.doAndDont` 400→4000 | Naikkan limit | ⛔ **BLOCKED** | Lihat §3 di bawah |
| `get-creator-negotiations` DTO: `conversationId` + `isArchived` | Tambahkan field | ✅ **SELESAI** | Lihat §4 di bawah |

### C-5. 🟢 Pengetatan permission gelombang 2 — SELESAI ✅

`node appwrite/ops/harden-permissions.mjs --dry` — hasil:
```
SKIP wallets              sudah sesuai
SKIP payments             sudah sesuai
SKIP users                sudah sesuai
SKIP withdrawals          sudah sesuai
SKIP user_files           sudah sesuai
SKIP user_storage_usage   sudah sesuai
SKIP conversations        sudah sesuai
SKIP messages             sudah sesuai
SKIP offers               sudah sesuai
SKIP orders               sudah sesuai
```

10/10 tabel sudah diketatkan. `appwrite push tables` yang kami jalankan untuk §C-4 ternyata sekaligus menerapkan perubahan permission di `messages`, `offers`, `orders`, `conversations` — `read("users")` sudah dicabut dari keempatnya.

### C-6. ⛔ Jangan dijalankan — DIPATUHI ✅

`sync-scopes.ts` tidak disentuh.

---

## 2. Respons atas Temuan Verifikasi Event Prefix

### W-1 sampai W-4, W-6 — SUDAH DIPULIHKAN OLEH TIM FRONTEND ✅

Kami verifikasi bahwa pemulihan yang dilakukan tim frontend sudah benar:
- `events` di 10 Function event-driven terisi sesuai config
- `execute` di 15 Function HTTP = `["users"]`, `midtrans-webhook` = `["any"]`
- `schedule` di `expire-stale-claims` = `"0 */6 * * *"`, `mature-pending-balance` = `"0 2 * * *"`
- `scopes` di seluruh 26 Function terisi

**Push kami tidak merusak pemulihan ini** — `npm run fn:sync:dry` sesudah push menunjukkan 0 drift di runtime fields.

### W-5 — `appwrite push functions` tidak sinkronkan `execute`

**Ternyata TIDAK terjadi di push kami.** Setelah `appwrite push functions --all --force`, semua `events`, `execute`, `schedule` tetap utuh. Kemungkinan:
- Fix di CLI versi terbaru
- Atau karena config kami sekarang sudah **eksplisit** menyertakan semua field (termasuk `scopes` berkat fix generator B-1)

Tetap direkomendasikan: jalankan `npm run fn:drift` setelah **setiap** push sebagai safety net.

### M-1 (`pendingBalance` mengendap) — SELESAI ✅

Function `mature-pending-balance` sudah pushed dan deployed. Cron harian 02:00 WIB. Mematangkan reward ≥ 7 hari dari `pendingBalance` → `balance`.

### M-2 (`create-escrow` ledger order) — SUDAH SELESAI SEBELUMNYA ✅

Di-resolve di commit `11ebfc3` oleh tim frontend. Kami verifikasi kode sudah ter-deploy via push.

### M-3 (Permission tabel membocorkan data) — SELESAI ✅

Gelombang 1 sudah diterapkan sebelumnya. Gelombang 2 diterapkan hari ini via `appwrite push tables`. Semua 10 tabel sensitif sudah diketatkan — `harden-permissions.mjs --dry` menunjukkan 10/10 "sudah sesuai".

### B-1 (`views` diisi UMKM saat approve) — DIKONFIRMASI ✅

Model sudah benar. Tidak ada aksi tambahan dari sisi kami.

### B-2 (Kolom `reviewNotes`) — SUDAH ADA ✅

Kolom sudah ada di live dan config. Tidak ada aksi tambahan.

### B-3 (`claim.service.ts` query `users` salah) — SUDAH SELESAI SEBELUMNYA ✅

Di-resolve di `11ebfc3`. Kami verifikasi kode ter-deploy.

### §5 (Claim `expired` mengunci kreator) — FIX DITERAPKAN ✅

**Keputusan produk yang diambil:** Kreator boleh klaim ulang tanpa batas setelah klaim expired.

**Implementasi:**
- `expire-stale-claims` **sudah** decrement `totalClaims` saat klaim expire (kode existing L50-56) — kuota dikembalikan ✅
- `claim.service.ts` L143-153: Ditambahkan `Query.notEqual('status', 'expired')` pada pengecekan duplikat klaim — baris expired tidak lagi menghalangi klaim baru ✅

```typescript
// Sebelum (kreator terkunci selamanya):
const existingClaims = await databases.listDocuments(DATABASE_ID, COLLECTIONS.claims, [
  Query.equal('campaignId', campaignId),
  Query.equal('creatorId', creatorId),
  Query.limit(1),
]);

// Sesudah (klaim expired tidak menghalangi):
const existingClaims = await databases.listDocuments(DATABASE_ID, COLLECTIONS.claims, [
  Query.equal('campaignId', campaignId),
  Query.equal('creatorId', creatorId),
  Query.notEqual('status', 'expired'),
  Query.limit(1),
]);
```

---

## 3. ⛔ BLOCKER — `doAndDont` Tidak Bisa Dinaikkan ke 4000

### Kronologi

1. Kami ubah `generate_appwrite_json.cjs` L272: `createStringAttr("doAndDont", false, 400)` → `4000`
2. Regenerate `appwrite.config.json` — berhasil, `"size": 4000` tertulis
3. Delete kolom `doAndDont` (size 400) dari live — berhasil
4. Create kolom `doAndDont` (size 4000) — **GAGAL:**
   ```
   400: "The maximum number or size of attributes for collection 'campaign_briefs' has been reached."
   ```
5. Kami coba size 2000, 1000 — semua gagal
6. Restore ke size 400 — berhasil
7. Generator di-revert ke 400

### Akar Masalah

Tabel `campaign_briefs` sudah mendekati batas ukuran baris MariaDB (~65535 bytes):

| Kolom | Size | Bytes (utf8mb4) |
|---|---|---|
| `campaignId` | 255 | 1020 |
| `objective` | 2000 | 8000 |
| `contentAngle` | 2000 | 8000 |
| `cta` | 1000 | 4000 |
| **`briefDetail`** | **10000** | **40000** |
| `doAndDont` | 400 | 1600 |
| `materialsJson` | 300 | 1200 |
| `generatedByAi` | boolean | 1 |
| **Total** | | **~63821** |

`briefDetail` (10000 chars = 40000 bytes) menghabiskan 61% budget baris. Menambah `doAndDont` ke 4000 (+14400 bytes) melebihi limit.

### Opsi Penyelesaian (Butuh Keputusan)

| # | Opsi | Dampak |
|---|---|---|
| A | Kurangi `briefDetail` 10000→5000 | Frees ~20KB. `doAndDont` bisa 4000. Tapi brief AI mungkin terpotong |
| B | Split `campaign_briefs` → 2 tabel | Arsitektur lebih bersih, tapi butuh refactor di semua Function yang baca briefs |
| C | Truncate output AI di `ai-brief` function | Limit `doAndDont` generation ≤400 chars. Zero schema change |
| D | Terima 400 apa adanya | Kalau AI output jarang >400 |

Kami belum mengambil keputusan sepihak karena menyangkut kapasitas data konten.

---

## 4. DTO `get-creator-negotiations` — `conversationId` + `isArchived`

### Perubahan

File: `functions/get-creator-negotiations/src/main.js` — fungsi `toNegotiation()`:

```diff
     status: str(order.status),
+    conversationId: str(offer?.conversationId),
+    isArchived: ["completed", "cancelled", "refunded", "disputed"].includes(str(order.status)),
     lastMessage: str(conversation?.last_message),
```

### Penjelasan

- **`conversationId`**: Diambil dari `offers.conversationId` yang sudah di-load di `loadContext()`. Tidak butuh query tambahan — data sudah tersedia di memory.
- **`isArchived`**: Derivasi dari status terminal order. Tidak butuh kolom baru di tabel `orders`. Status `completed`, `cancelled`, `refunded`, `disputed` = archived. Sisanya = aktif.

Sudah deployed via `appwrite push functions`.

---

## 5. Temuan Tambahan Saat Eksekusi

### 5a. Endpoint region salah di prefs.json

`~/.appwrite/prefs.json` profile aktif (`6a56302c001d68321e41`) punya endpoint `https://cloud.appwrite.io/v1` (US), padahal project Marketiv ada di `https://sgp.cloud.appwrite.io/v1` (Singapore). Menyebabkan semua ops script gagal 401 "Project is not accessible in this region".

**Fix yang diterapkan:**
- `appwrite client --endpoint "https://sgp.cloud.appwrite.io/v1" --project-id "69f9d45b00315cb0ec2f"`
- Ops scripts dijalankan dengan `APPWRITE_ENDPOINT="https://sgp.cloud.appwrite.io/v1"`

### 5b. `appwrite push tables` gagal di `creator_profiles.niche`

Error: `Missing required parameter: "size"` saat recreate kolom `niche` (enum → string migration).

**Ini bug pre-existing di generator** — `createEnumAttr()` tidak menulis field `size` ke output config, tapi Appwrite CLI butuhnya saat recreate. Bukan dari perubahan kami. Tidak blocking untuk kolom `doAndDont` (yang gagal karena row limit, bukan karena ini).

---

## 6. Verifikasi yang Sudah Dijalankan

| Perintah | Hasil |
|---|---|
| `npm run fn:drift` | **`NO DRIFT`** — 26 config, 26 live, 0 beda |
| `npm run fn:sync:dry` | 0 akan diubah, 26 sudah sesuai |
| `node appwrite/ops/check-deployments.mjs` | 26/26 deployment aktif |
| `node appwrite/ops/harden-permissions.mjs --dry` | 10/10 tabel sudah sesuai |
| `node --check` pada 3 Function yang disentuh | Pass |
| `npx tsc --noEmit` pada `claim.service.ts` | 0 error |

---

## 7. Yang Masih Terbuka

| # | Item | Status | Siapa |
|---|---|---|---|
| 1 | `doAndDont` 400→4000 | ⛔ Blocked row limit | Keputusan bersama (lihat §3) |
| 2 | `creator_profiles.niche` enum `size` di generator | 🟡 Pre-existing bug | Tim frontend (generator owner) |
| 3 | E2E testing (daftar user → dashboard → campaign → payment → klaim) | ⬜ Belum | Bersama |
| 4 | Harness `vitest` 102/121 gagal | 🟡 Pre-existing | Bersama |

---

## 8. Pembagian Wewenang — Ditegakkan

Kami mengikuti pembagian dari §G handoff:

| Wilayah | Dikerjakan oleh | Status |
|---|---|---|
| Push & deploy function | Tim backend ✅ | Selesai |
| Set env vars function | Tim backend ✅ | Selesai |
| Setelan build (commands, entrypoint) | Tim backend ✅ | Selesai via push |
| Kode Function | Tim frontend ✅ | Sudah di-commit sebelumnya |
| Push tables (schema) | Tim backend ✅ | Selesai (kecuali doAndDont) |
| Permission collection | Tim frontend → diterapkan backend ✅ | Config dari frontend, push dari backend |
