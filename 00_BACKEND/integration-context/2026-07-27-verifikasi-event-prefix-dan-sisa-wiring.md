# Verifikasi `dd41686` — Prefix Event Sudah Benar, Tapi Wiring Lain Masih Kosong

| | |
|---|---|
| **Tanggal** | 2026-07-27 (temuan) → 2026-07-27 sore (resolusi, lihat §Resolusi di bawah) |
| **Pemicu** | Kami verifikasi commit `dd41686` langsung ke **live Appwrite** (bukan ke config file) sebelum melanjutkan Sprint 4. |
| **Status** | ✅ **W-1…W-6, M-1…M-3, B-1…B-3 selesai** · ✅ **§5 (claim expired) resolved** · ✅ **T-5 (DTO) deployed** · ⬜ **doAndDont blocked row limit** |
| **Sifat** | Dokumen temuan **+ resolusi**. Bagian di atas garis adalah kondisi saat temuan; §Resolusi mencatat perbaikannya. |
| **Metode** | Appwrite REST API `/v1/functions` + `/v1/tablesdb`, project `69f9d45b00315cb0ec2f`, server **1.9.5**. Semua angka di bawah dibaca dari server, bukan dari `appwrite.config.json`. |

---

## 0. Ringkasan 1 menit

| # | Temuan | Dampak |
|---|---|---|
| ✅ | 8 event database sudah terisi di live dengan prefix `databases.*.tables.*.rows.*` | Resolusi `dd41686` **terbukti berhasil** untuk 8 function itu |
| 🔴 **W-1** | `create-user-profile` & `create-user-wallet` → `events: []` | **User baru daftar tidak dapat baris `users`, profil, maupun wallet** |
| 🔴 **W-2** | `execute: []` di **15 function HTTP** | **Frontend tidak bisa memanggil satu pun** `get-*`, `create-payment`, `request-withdrawal`, `ai-brief`, dll |
| 🔴 **W-3** | `midtrans-webhook` → `execute: []` (config: `["any"]`) | Callback Midtrans ditolak → payment tidak pernah `paid` → **fix V-2 tidak pernah tereksekusi** |
| 🟠 **W-4** | `expire-stale-claims` → `schedule: ""` (config: `0 */6 * * *`) | Cron tidak pernah jalan |
| 🟡 **W-5** | `appwrite push functions` **tidak menyinkronkan** `execute` | Sebabnya W-1…W-4 tidak ikut terbawa waktu push |

Dokumen `2026-07-27-appwrite-event-prefix-tablesdb.md` §Catatan menulis bahwa `create-user-profile`, `create-user-wallet`, dan `expire-stale-claims` *"tidak terdampak"*. **Premisnya benar, kesimpulannya tidak.** Prefix event user (`users.*.create`) memang tidak berubah — tapi field-nya tetap kosong di live. Masalahnya bukan di prefix, jadi tidak ikut ketahuan waktu fokusnya ke prefix.

---

## 1. ✅ Yang sudah benar — 8 event database

Dibaca dari `GET /v1/functions` hari ini:

| Function | `events` di live |
|---|---|
| `campaign-published` | `databases.6a4c8598001da3b0d7f0.tables.campaigns.rows.*.update` |
| `ai-fraud-precheck` | `databases.…tables.campaign_submissions.rows.*.create` |
| `create-order` | `databases.…tables.offers.rows.*.update` |
| `calculate-campaign-reward` | `databases.…tables.campaign_submissions.rows.*.update` |
| `campaign-claimed` | `databases.…tables.campaign_claims.rows.*.create` |
| `create-escrow` | `databases.…tables.payments.rows.*.update` |
| `release-escrow` | `databases.…tables.deliverables.rows.*.update` |
| `send-chat-notification` | `databases.…tables.messages.rows.*.create` |

Analisis prefix kalian juga kami cek ke dokumentasi Appwrite dan **sejalan**: `collections`/`documents` memang deprecated, diganti `tables`/`rows`, dan root prefix `databases.*` → `tablesdb.*`.

> ⚠️ **Satu hal yang belum terbukti secara runtime.** Klaim "server 1.9.x emit kedua format" masih di level dokumentasi/PR. Semua tabel masih 0 baris dan `executions` masih 0, jadi **belum ada satu pun bukti bahwa event ini benar-benar memicu**. Ini bukan keraguan atas analisis kalian — hanya catatan bahwa verifikasi kalian membuktikan *field-nya terisi*, belum *function-nya menyala*. Uji end-to-end di §5 yang akan membuktikannya.

---

## 2. 🔴 W-1 sampai W-4 — wiring yang masih kosong

Hasil diff `00_BACKEND/appwrite.config.json` (source of truth) vs live, **17 function**:

| Function | Field | Config | Live |
|---|---|---|---|
| `create-user-profile` | `events` | `["users.*.create"]` | `[]` |
| `create-user-wallet` | `events` | `["users.*.create"]` | `[]` |
| `expire-stale-claims` | `schedule` | `"0 */6 * * *"` | `""` |
| `midtrans-webhook` | `execute` | `["any"]` | `[]` |
| `create-user-profile` | `execute` | `["users"]` | `[]` |
| `validate-and-upload` | `execute` | `["users"]` | `[]` |
| `delete-file` | `execute` | `["users"]` | `[]` |
| `ai-brief` | `execute` | `["users"]` | `[]` |
| `create-payment` | `execute` | `["users"]` | `[]` |
| `request-withdrawal` | `execute` | `["users"]` | `[]` |
| `cancel-payment` | `execute` | `["users"]` | `[]` |
| `get-umkm-dashboard-summary` | `execute` | `["users"]` | `[]` |
| `get-umkm-finance-summary` | `execute` | `["users"]` | `[]` |
| `get-umkm-profile` | `execute` | `["users"]` | `[]` |
| `get-creator-directory` | `execute` | `["users"]` | `[]` |
| `get-creator-profile` | `execute` | `["users"]` | `[]` |
| `get-creator-dashboard-summary` | `execute` | `["users"]` | `[]` |
| `get-creator-negotiations` | `execute` | `["users"]` | `[]` |

### Kenapa ini lebih mendesak daripada kelihatannya

Belum ada data user di staging — dan justru itu masalahnya. Dengan `create-user-profile` dan `create-user-wallet` tidak terpasang event, **user pertama yang daftar tidak akan dapat baris `users`, profil, maupun wallet**. Seluruh Alur A berdiri di atas baris-baris itu: `claimCampaign` butuh profil, `calculate-campaign-reward` butuh wallet.

Jadi bukan "belum ada data jadi belum penting", melainkan **data pertama tidak akan pernah terbentuk dengan benar**. Lebih murah dibereskan sekarang mumpung belum ada yang perlu di-backfill.

Dan `execute: []` berarti Alur A tidak bisa diuji sama sekali dari browser — semua `get-*` dashboard, `create-payment`, sampai `request-withdrawal` akan menolak pemanggilan dari user login.

---

## 3. 🟡 W-5 — kenapa push tidak membereskannya (ini akar masalahnya)

Dari timestamp di live: ada **11 deployment baru pada 2026-07-27 02:29–02:31 UTC** (09:29–09:31 WIB) — pola khas satu kali `appwrite push functions`.

Pada saat push itu, `appwrite.config.json` **sudah** berisi `execute: ["users"]` dan `events: ["users.*.create"]` (nilai itu sudah ada sejak commit `17791c0`, 26 Juli). Tapi setelah push, live tetap `[]`.

**Kesimpulan yang bisa ditarik: `appwrite push functions` tidak menyinkronkan `execute`, dan tidak memulihkan `events`/`schedule` yang kosong.** Karena itu 8 function yang kalian perbaiki manual lewat `appwrite functions update` berhasil, sementara sisanya tidak ikut terbawa.

Konsekuensinya: **wiring ini tidak akan pernah beres lewat `push` saja** — harus di-set eksplisit per function.

### ⚠️ Risiko lanjutan: reset saat deploy

Semua function tersambung Git (`providerBranch: staging`, auto-deploy). Ada isu Appwrite yang dilaporkan bahwa **event trigger ter-reset setiap kali function di-deploy ulang** — [appwrite/appwrite#3536](https://github.com/appwrite/appwrite/issues/3536), [#2715](https://github.com/appwrite/appwrite/issues/2715).

Kami belum bisa memastikan ini yang terjadi di project kita (butuh satu siklus push untuk diamati). Tapi kalau benar, **8 event yang baru kalian pasang bisa hilang lagi pada push berikutnya ke `staging`**. Saran: jalankan skrip verifikasi §4 setiap habis deploy, sampai terbukti stabil.

---

## 4. Skrip verifikasi (read-only, bisa dijalankan siapa saja)

Simpan sebagai `verify-wiring.mjs`, isi `KEY` dengan API key yang punya scope `functions.read`:

```js
const KEY = "<API_KEY>";
const ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const PROJECT  = "69f9d45b00315cb0ec2f";
import fs from "node:fs";

const res = await fetch(`${ENDPOINT}/functions?queries[]=${encodeURIComponent(JSON.stringify({method:"limit",values:[100]}))}`, {
  headers: { "X-Appwrite-Project": PROJECT, "X-Appwrite-Key": KEY }
});
const live = await res.json();
const cfg  = JSON.parse(fs.readFileSync("00_BACKEND/appwrite.config.json", "utf8"));
const byId = Object.fromEntries(live.functions.map(f => [f.$id, f]));
const j = a => JSON.stringify(a ?? []);
let bad = 0;

for (const c of cfg.functions) {
  const l = byId[c.$id]; if (!l) { console.log(`${c.$id}: MISSING`); bad++; continue; }
  if (j(c.events)   !== j(l.events))            { console.log(`${c.$id} events   ${j(c.events)} -> ${j(l.events)}`); bad++; }
  if ((c.schedule||"") !== (l.schedule||""))    { console.log(`${c.$id} schedule "${c.schedule||""}" -> "${l.schedule||""}"`); bad++; }
  if (j(c.execute)  !== j(l.execute))           { console.log(`${c.$id} execute  ${j(c.execute)} -> ${j(l.execute)}`); bad++; }
}
console.log(bad === 0 ? "✅ NO DRIFT" : `🔴 ${bad} drift`);
```

Target: `✅ NO DRIFT`. Saat ini keluarannya 18 baris drift.

### Perbaikannya

Per function, kirim **seluruh field** — jangan hanya field yang diubah, karena `PUT /functions/{id}` bersifat *replace*, sehingga field yang tidak dikirim berisiko ter-reset (ini pola yang sama dengan §3):

```
appwrite functions update \
  --function-id "create-user-wallet" \
  --name "create-user-wallet" \
  --runtime "node-22" \
  --events "users.*.create" \
  --execute "" \
  --schedule "" \
  --timeout 15 \
  --scopes "documents.read" "documents.write" \
  --entrypoint "src/main.js"
```

Ulangi untuk 17 function di tabel §2 dengan nilai dari `00_BACKEND/appwrite.config.json`. Kalau lebih praktis, kami sudah punya skrip Node yang membaca config lalu PUT seluruh field otomatis — tinggal bilang, kami kirim.

---

## 5. Urutan uji yang membuktikan semuanya sekaligus

Setelah §4 hijau, ini juga sekaligus membuktikan klaim dual-emit di §1:

1. Daftar user baru → cek baris `users`, `creator_profiles`/`umkm_profiles`, `wallets`, `user_storage_usage` **terbentuk otomatis**. Membuktikan W-1 tertutup.
2. Buka dashboard → `get-creator-dashboard-summary` tidak 401. Membuktikan W-2 tertutup.
3. Buat campaign → bayar Snap → `payments.status` jadi `paid`. Membuktikan W-3 tertutup.
4. `campaigns.remainingBudget` bertambah, `wallets.balance` **tidak** bertambah. Membuktikan fix V-2 benar **dan** event `create-escrow` memang memicu.
5. Klaim campaign → `campaign-claimed` punya execution baru. Membuktikan prefix `databases.*.tables.*.rows.*` benar-benar emit di 1.9.5.

Kalau langkah 5 tidak menghasilkan execution, berarti format compat tidak emit dan kita perlu `tablesdb.*` — yang berarti harus lewat REST API langsung, karena CLI menolaknya (sesuai temuan kalian).

---

## 6. Temuan lain di luar wiring

Ditemukan saat membaca kode dan skema live. Bukan blocker Sprint 4, tapi menyentuh uang dan keamanan.

### 🔴 M-1 — `pendingBalance` tidak punya jalan keluar

`calculate-campaign-reward:59` menambah `wallets.pendingBalance`. Kami grep seluruh `functions/`: **tidak ada satu pun yang memindahkan `pendingBalance` ke `balance`**. `request-withdrawal` hanya membaca dan mendebit `balance`.

Akibatnya reward campaign kreator masuk lalu **mengendap permanen — tidak bisa ditarik selamanya**. `docs/03_Workflows/20_Campaign_PPV.md:121` sendiri menulis `pendingBalance += reward → (later → available)`; langkah *"later"* itu belum ada implementasinya.

Ini butuh keputusan produk (kapan pending jadi available — setelah H+N? setelah UMKM konfirmasi?), jadi kami tidak mengusulkan solusi sepihak.

### 🟠 M-2 — `create-escrow` bisa kehilangan kredit secara permanen

`completeTopup` (`functions/create-escrow/src/main.js:83-108`) menulis baris ledger **sebelum** mengkredit:

```js
const result = await ensureTransaction(...);   // ledger dulu
if (!result.created) return { walletId: wallet.$id };   // ← early return
if (isCampaign) { /* kredit remainingBudget */ } else { /* kredit balance */ }
```

Kalau kredit di bawah gagal (network/5xx), baris ledger sudah terlanjur ada. Saat Midtrans mengirim ulang webhook, `ensureTransaction` menemukan baris lama → `result.created === false` → **`return` sebelum mengkredit**. Uangnya tercatat di ledger tapi tidak pernah masuk ke mana pun, dan retry justru memperkuat kesalahannya.

`request-withdrawal` sudah memakai pola yang benar untuk ini (document id deterministik, audit dulu lalu rollback bila debit gagal). Saran: samakan polanya — kredit dulu secara idempoten, ledger belakangan; atau verifikasi ulang kredit sebelum early-return.

Catatan kecil di fungsi yang sama: `findWallet` + `if (!wallet) throw` tetap jalan untuk `purpose: "campaign"`, padahal jalur campaign tidak lagi menyentuh wallet. UMKM tanpa baris wallet akan gagal top-up campaign tanpa alasan yang relevan.

### 🟠 M-3 — permission tabel membocorkan baris antar-user

Dibaca dari live. Karena permission Appwrite bersifat **union**, `read("users")` di level tabel memberi **setiap user login akses baca ke SEMUA baris**:

| Tabel | `rowSecurity` | Permission live | Yang bocor |
|---|---|---|---|
| `wallets` | **false** | `read("users")` | Saldo semua user |
| `payments` | true | `read("users")` | `snap_token`, `redirect_url`, nominal semua user |
| `messages` | true | `read("users")` | **Isi chat semua orang** |
| `conversations` | true | `read("users")` | Daftar lawan bicara semua orang |
| `users` | true | `read("users")` | Email & telepon semua user |

Yang paling perlu diperhatikan: **`wallets` punya `rowSecurity: false`**. Artinya `Permission.read(Role.user(userId))` per-baris yang ditulis `create-user-wallet:19` dan `calculate-campaign-reward:131` **diabaikan sepenuhnya** oleh server. Niat kode sudah benar, tapi tidak ditegakkan.

Komentar di `calculate-campaign-reward:72-75` menunjukkan kalian sudah sadar soal ini ("justru itu masalahnya — semua user bisa membaca semua transaksi"). Kami angkat supaya tidak hilang: memperketatnya butuh `rowSecurity: true` di `wallets` **plus** memastikan setiap jalur baca punya permission baris, jadi urutannya perlu direncanakan agar tidak memutus dashboard yang sudah jalan.

---

## 7. Yang masih terbuka dari dokumen sebelumnya

Belum terjawab sejak `2026-07-26-frontend-sprint4-alur-a.md`:

| # | Ringkas | Status |
|---|---|---|
| **B-1** | `campaign_submissions.views` tidak diisi siapa pun → reward selalu 0. Kami isi lewat input UMKM saat approve. | Menunggu konfirmasi model |
| **B-2** | Tidak ada kolom `reviewNotes` di `campaign_submissions` (kami cek live: 11 kolom, tidak ada). Textarea kami nonaktifkan. | Menunggu kolom baru |
| **B-3** | `claim.service.ts:91` baca `isProfileCompleted` dari `users` | **Diperkuat, lihat bawah** |
| **§5** | Claim `expired` mengunci kreator selamanya | Menunggu keputusan |

### B-3 — buktinya sekarang lebih kuat dari laporan sebelumnya

Dua kesalahan bertumpuk, keduanya kami verifikasi ke live:

1. **Kolomnya memang tidak ada.** Tabel `users` di live punya persis 6 kolom: `userId, role, status, email, phone, createdAt`. `isProfileCompleted` ada di `creator_profiles` dan `umkm_profiles`.

2. **`getDocument` akan 404 lebih dulu.** `create-user-profile:87` membuat baris `users` dengan `ID.unique()` — jadi `$id` dokumen **acak**, dan ID auth disimpan di kolom `userId`. Padahal `claim.service.ts:91` memanggil `getDocument(DATABASE_ID, COLLECTIONS.users, creatorId)` dengan `creatorId` = `account.get().$id`. ID itu tidak akan pernah cocok dengan `$id` dokumen mana pun.

Jadi bukan sekadar `undefined` → falsy → "Lengkapi profil dulu". **Panggilannya gagal 404 sebelum sempat mengecek apa pun.** Setiap klaim lewat service kalian akan gagal, tanpa kecuali.

Perbaikannya sama seperti yang sudah dipakai `get-creator-profile:72` dan `campaign-claimed:37-40` — query `creator_profiles` dengan `Query.equal("userId", creatorId)`, bukan `getDocument` ke `users`.

---

## Rujukan

- Resolusi yang diverifikasi: `00_BACKEND/integration-context/2026-07-27-appwrite-event-prefix-tablesdb.md` (commit `dd41686`)
- Temuan sebelumnya: `2026-07-26-frontend-sprint4-alur-a.md`, `2026-07-26-verifikasi-resolusi-T1-T4.md`
- Skema & config sumber kebenaran: `00_BACKEND/appwrite.config.json`
- Events Appwrite: <https://appwrite.io/docs/advanced/platform/events>
- Isu reset trigger: <https://github.com/appwrite/appwrite/issues/3536>

### Catatan kecil di luar konteks Appwrite

Ada `appwrite.config.json` **di root repo** (bukan di `00_BACKEND/`) berisi 2 baris saja: `{"projectId": "69f9d45b00315cb0ec2f"}`. File ini tidak ter-track Git. Karena CLI Appwrite membaca config dari direktori kerja, menjalankan perintah `appwrite` dari root repo akan memakai stub kosong ini — 0 function, 0 table. Mungkin ini sisa `appwrite init` yang tidak sengaja. Saran: hapus, atau tambahkan ke `.gitignore` dengan catatan agar tidak tertukar.

---

## ✅ Resolusi — 2026-07-27 (sore)

Dikerjakan setelah audit menyeluruh atas seluruh folder ini, `appwrite.config.json`, ke-25 Function, dan snapshot live.

### 🔴 Temuan baru: W-6 — 8 Function kehilangan `scopes`

Tidak pernah terdeteksi sebelumnya, dan **lebih menentukan daripada W-1…W-4.**

`snapshot-functions.json` (diambil sebelum pemulihan wiring) menunjukkan 8 Function event-driven punya `scopes: []`, sementara 17 lainnya utuh: `ai-fraud-precheck`, `campaign-published`, `campaign-claimed`, `calculate-campaign-reward`, `create-escrow`, `release-escrow`, `create-order`, `send-chat-notification` — persis 8 Function yang di-`appwrite push` di `dd41686`.

Rantai sebabnya:

1. `appwrite/generate_appwrite_json.cjs` tidak pernah menulis key `scopes` ke `appwrite.config.json`; scopes hidup terpisah di `appwrite/function-scopes.json`.
2. `appwrite push functions` punya replace-semantics → field yang tidak ada di config dikosongkan di Appwrite.
3. Di Appwrite, `scopes` menentukan hak dynamic API key (`x-appwrite-key`). Scopes kosong = **setiap panggilan `databases.*` balik 401, senyap.**
4. Pemulihan wiring mengirim ulang `scopes` dari live, jadi kekosongan itu ikut dilestarikan — bukan diperbaiki.
5. `drift.mjs` berbunyi `if (c.scopes && ...)`. Karena config tidak punya key itu, perbandingan scopes **selalu dilewati** → `NO DRIFT` memberi lampu hijau palsu.

Artinya seluruh Alur A yang dinyatakan selesai di Sprint 4 **tidak akan berjalan** sampai scopes dipulihkan.

**Perbaikan:** generator kini membaca `function-scopes.json` dan menulis `scopes` ke tiap entry function (dan **melempar error** kalau ada Function tanpa entry scope, supaya tidak bisa lolos lagi). `drift.mjs` membandingkan scopes tanpa syarat. Pemulihan di live lewat `npm run sync:scopes`.

### Status per temuan

| ID | Status | Keterangan |
|---|---|---|
| **W-1** | ✅ | `create-user-profile` & `create-user-wallet` — events `users.*.create` pulih |
| **W-2** | ✅ | `execute: ["users"]` pulih di 15 Function HTTP |
| **W-3** | ✅ | `midtrans-webhook` — `execute: ["any"]` pulih |
| **W-4** | ✅ | `expire-stale-claims` — schedule `0 */6 * * *` pulih |
| **W-5** | ✅ | Akar masalahnya sama dengan W-6; ditutup oleh perbaikan generator |
| **W-6** | ✅ | Baru — lihat di atas |
| **M-1** | ✅ | Function baru `mature-pending-balance` (cron harian 02:00) memindahkan reward ≥ 7 hari dari `pendingBalance` → `balance`. Idempotensi memakai pola ledger `create-escrow`. Ledger bertipe `mature`, bukan `release`, supaya tidak terhitung dua kali sebagai earnings |
| **M-2** | ✅ | Sudah selesai di `11ebfc3` — `completeTopup` memakai ledger `pending` → kredit → `completed` |
| **M-3** | ✅ | Gelombang 1 (6 tabel) sudah diterapkan. Gelombang 2 — `conversations`, `messages`, `offers`, `orders` — aman diketatkan setelah jalur create-nya memasang row perm. **`appwrite.config.json` ikut diperbarui**, kalau tidak `appwrite push tables` akan mengembalikan kebocorannya |
| **B-1** | ✅ | Model dikonfirmasi: `views` diisi UMKM saat approve, ditulis dalam `updateDocument` yang sama dengan `status`. Sudah didokumentasikan di `docs/02_Modules/Campaigns/50_Database.md` |
| **B-2** | ✅ | Kolom `reviewNotes` (string, 1000, opsional) sudah ada di live, dan kini juga di config, generator, dan docs |
| **B-3** | ✅ | Selesai di `11ebfc3` — `claim.service.ts` query `creator_profiles` lewat `Query.equal("userId", …)`. Diverifikasi: nol `getDocument(users, uid)` tersisa di seluruh repo |
| **§5** | ✅ | Claim `expired` — kreator boleh klaim ulang. `expire-stale-claims` sudah decrement `totalClaims`. `claim.service.ts` ditambah `Query.notEqual('status', 'expired')` |
| **T-5** | ✅ | DTO `get-creator-negotiations`: `conversationId` (dari `offer.conversationId`) + `isArchived` (derivasi status terminal) ditambahkan, deployed via push |
| **doAndDont** 400→4000 | ⛔ | `campaign_briefs.doAndDont` — row limit MariaDB. `briefDetail` (10000 chars = 40000 bytes) makan 61% budget baris. Kolom di-restore ke 400 |

### Temuan tambahan yang ikut ditutup

- **`create-order` tidak pernah membuat order.** Guardnya butuh `oldStatus` dari `offer.$previous?.status`, padahal event dokumen Appwrite tidak mengirim `$previous` — jadi guard selalu gagal dan Function selalu `return ignored`. Ini memblokir **seluruh Alur B**, bukan hanya satu langkah. Guard transisi dibuang; kini hanya memeriksa `offer.status === "accepted"`, dan order ganda ditolak unique index `idx_offerId` (ditangkap sebagai `already_exists`, bukan 500).
- **`request-withdrawal` tanpa guard peran.** Nol pengecekan role — siapa pun bersaldo bisa menarik. Ditambah guard `403` untuk non-creator. Perannya dibaca lewat `Query.equal("userId", …)`, **bukan** `getDocument` — jebakan yang sama dengan B-3.
- **`deliverables` & `revisions` dibuat tanpa permission baris** (`order.service.ts`). Ditambah read/update untuk kedua pihak. Kedua tabel ini **belum** diketatkan; menyusul setelah perbaikan ini ter-deploy.
- **`messages` hanya punya `Permission.read`.** Ditambah `update` untuk kedua pihak supaya `read_at` tetap bisa ditulis setelah `read("users")` dicabut.
- **Stub `appwrite.config.json` di root repo** — sudah dihapus.

### Yang masih terbuka

Detail penyelesaian backend ada di `2026-07-27-respons-backend-eksekusi-deployment.md`.

| Item | Kenapa |
|---|---|
| **T-5** — `conversationId` + `isArchived` di DTO `get-creator-negotiations` | ✅ **SELESAI** — deployed via push. Lihat §4 respons |
| Pengetatan `deliverables` & `revisions` | Menunggu perbaikan row perm di atas ter-deploy |
| Sprint 3 §6 — `doAndDont` 400→4000 | ⛔ **BLOCKED** row limit MariaDB. `briefDetail` (10000 chars = 40000 bytes) makan 61% budget baris. Lihat §3 respons |
| `creator_profiles.niche` enum `size` di generator | 🟡 Pre-existing bug — `createEnumAttr()` tidak tulis `size`, CLI butuh saat recreate |
| Harness `vitest` rusak | 102/121 gagal sebelum maupun sesudah `11ebfc3` — bukan regresi, tapi artinya tidak ada gate tes |

