# Handoff — Pemulihan Setelan Function & Daftar Kerja Tim Backend

| | |
|---|---|
| **Tanggal** | 2026-07-27 (sore) |
| **Dari** | Tim frontend/integrasi |
| **Untuk** | Tim backend — mohon direview, lalu kerjakan §C |
| **Status** | ✅ Sisi kami selesai · ⬜ Menunggu §C dari tim backend |
| **Sifat** | Laporan insiden + serah-terima. §A insiden, §B yang kami kerjakan (untuk direview), §C tugas kalian. |
| **Metode** | Appwrite REST API `/v1/functions` + `/v1/tablesdb`, project `69f9d45b00315cb0ec2f`, server 1.9.5. Semua angka dibaca dari server, bukan dari `appwrite.config.json`. |

---

## 0. Ringkasan 1 menit

| | Hal | Keadaan |
|---|---|---|
| 🔴 | `appwrite push functions` **mengosongkan `scopes`** tiap kali dijalankan | Akar dari semuanya. Sudah diperbaiki di generator. |
| 🔴 | 8 Function kehilangan `scopes` → tiap `databases.*` balik **401 senyap** | Sudah dipulihkan |
| 🔴 | Skrip pemulih kami sendiri lalu **mengosongkan `events`** di 8 Function yang sama | Sudah dipulihkan, skripnya sudah dimatikan |
| 🟠 | `timeout` live **15 detik di semua Function**, config minta 30–60 | Sudah dipulihkan (19 Function) |
| 🟡 | `commands` (`npm install`) kosong di 25 Function, `entrypoint` kosong di 2 | **Tugas kalian (§C-2)** |
| 🔴 | `create-order` & `request-withdrawal` — kode sudah diperbaiki, **live masih kode lama** | **Tugas kalian (§C-1)** |
| 🔴 | Reward campaign mengendap permanen di `pendingBalance` | Function baru sudah ditulis, **butuh push (§C-1)** |

> **Yang paling penting dipahami:** Alur A **belum bisa dinyatakan hidup**. Konfigurasinya sekarang benar, tapi belum ada satu pun eksekusi Function yang terbukti sukses, dan perbaikan kode terpenting belum ter-deploy. Detailnya di §E.

---

## A. Insiden — kenapa "NO DRIFT" kemarin adalah lampu hijau palsu

### A-1. Akar masalah: `appwrite push functions` mencabut hak akses Function

`appwrite.config.json` **tidak pernah punya key `scopes`**. Generator `generate_appwrite_json.cjs` memang tidak pernah menuliskannya.

Karena `appwrite push` bersifat *replace*, setiap push mengirim konfigurasi tanpa `scopes` → Appwrite mengisi field itu dengan default, yaitu **kosong**.

Dampaknya: dynamic API key milik Function tidak punya hak apa pun. Setiap panggilan `databases.*` di dalam Function balik **401**, dan karena kebanyakan Function tidak melaporkan error ke pemanggil, kegagalannya **senyap**. Yang terdampak termasuk `calculate-campaign-reward`, `create-escrow`, `release-escrow`, dan `create-order` — yaitu seluruh Alur A.

### A-2. Kenapa lolos berbulan-bulan

Skrip pembanding `drift.mjs` berbunyi:

```js
if (c.scopes && j(c.scopes) !== j(l.scopes)) rows.push([...])
```

Karena config **tidak punya** key `scopes`, `c.scopes` selalu `undefined`, dan perbandingannya **selalu dilewati**. `NO DRIFT` yang kami laporkan kemarin karena itu tidak pernah memeriksa satu-satunya field yang sedang rusak.

### A-3. Skrip pemulih kami sendiri ikut merusak

Untuk memulihkan `scopes`, kami menjalankan `appwrite/sync-scopes.ts`. Skrip itu memakai SDK:

```js
functions.update(id, name, undefined, undefined, undefined, ..., scopes)
```

`PUT /v1/functions/{id}` adalah **replace, bukan patch**. SDK `node-appwrite` membuang argumen `undefined` dari payload, lalu Appwrite mengisi tiap field yang absen dengan **default**-nya. Jadi baris di atas tidak berarti "ubah scopes saja", melainkan:

> kosongkan `events`, kosongkan `commands`, kembalikan `timeout` ke 15 — lalu set `scopes`.

Hasilnya `events` hilang di 8 Function event-driven, mematikan Alur A untuk kedua kalinya dalam satu hari.

**Ini penyakit yang persis sama dengan A-1.** Replace-semantics yang sama, kali ini dari sisi kami. Kami mendiagnosis A-1 dengan benar lalu mengulangi kesalahannya ke arah sebaliknya. Kami catat terbuka di sini supaya polanya dikenali, bukan diulang.

> **Aturan yang kami tarik:** setiap tulis ke Appwrite wajib **GET dulu → merge → kirim payload lengkap**. Tidak boleh ada field yang absen, karena field absen = reset ke default.

---

## B. Yang sudah kami kerjakan — mohon direview

### B-1. Generator sekarang menulis `scopes`

`appwrite/generate_appwrite_json.cjs` kini meng-emit `scopes` dari `appwrite/function-scopes.json`, dan **melempar error** kalau ada Function tanpa entri scope. Verifikasi: 26/26 Function di config punya `scopes` yang cocok dengan `function-scopes.json`.

> **Konsekuensi untuk kalian:** `appwrite push functions` **sekarang aman untuk `scopes`**. Sebelum perbaikan ini, tiap push diam-diam mencabut hak akses seluruh Function.

### B-2. Pagar regresi yang sebenarnya

`npm run fn:drift` membandingkan **11 field tanpa syarat** (dulu 4, dengan `scopes` di balik `if` yang selalu `false`). Laporannya dipisah dua blok: **A** yang boleh kami perbaiki, **B** yang wewenang kalian.

### B-3. Skrip perusak dimatikan, perkakas ops pindah ke repo

- `appwrite/sync-scopes.ts` → sekarang **stub yang menolak jalan** dan menjelaskan alasannya. **Jangan dijalankan.**
- Perkakas ops pindah dari folder temp ke `00_BACKEND/appwrite/ops/` agar tidak hilang: `client.mjs`, `drift.mjs`, `sync-functions.mjs`, `check-deployments.mjs`, `harden-permissions.mjs`, plus `README.md` berisi aturan §A-3.

`sync-functions.mjs` memakai `fetch` mentah, bukan SDK — supaya payload yang dikirim terlihat apa adanya di kode, dan default-nya **hanya menyentuh field wewenang kami**.

### B-4. Pemulihan yang sudah diterapkan ke live

| Field | Function | Perubahan |
|---|---|---|
| `events` | 8 event-driven | `[]` → nilai config (pulih) |
| `timeout` | 14 Function | `15` → `30`/`60` sesuai config |
| `scopes` | 8 Function | kosong → nilai config |

Hasil `npm run fn:drift` setelah pemulihan: **`0 field bisa kita perbaiki`**.

> **Perlu kami sampaikan terbuka:** `scopes` sebenarnya wewenang kalian. Kami menyetelnya **sebelum** batas wewenang itu ditetapkan, dalam rangka memadamkan 401 senyap. Nilainya persis sama dengan `function-scopes.json`, tidak ada yang kami karang. Mohon dicek ulang kalau perlu; setelah ini kami tidak menyentuhnya lagi.

**Temuan sampingan yang berarti:** `timeout` di live ternyata **15 detik untuk semua Function** sejak awal, padahal config minta 30–60. `ai-fraud-precheck` (AI, butuh 60s), `ai-brief` (30s), dan semua `get-*` dashboard kemungkinan besar sudah diam-diam kena timeout selama ini. Ini tidak pernah ketahuan karena `drift.mjs` lama tidak membandingkan field itu.

### B-5. Perbaikan kode — belum ter-deploy, mohon direview

| # | File | Isi |
|---|---|---|
| 1 | `functions/create-order/src/main.js` | Guard `$previous` **dibuang**. Event dokumen Appwrite tidak pernah mengirim `$previous`, jadi `oldStatus !== "pending"` selalu gagal dan **tidak satu pun order pernah terbuat** — seluruh alur Rate Card mati. Anti-duplikat kini dipegang unique index `idx_offerId` di tabel `orders`, ditolak server, bukan oleh kode. |
| 2 | `functions/request-withdrawal/src/main.js` | Guard peran: hanya `creator` yang boleh menarik saldo, selain itu **403**. Tanpa ini siapa pun yang punya `wallets.balance` bisa menarik dana platform. Peran dibaca via `listDocuments` + `Query.equal("userId")`, **bukan** `getDocument(userId)` — baris `users` dibuat dengan `ID.unique()` sehingga `$id` ≠ id akun Auth. Butuh env baru `USERS_COLLECTION_ID`. |
| 3 | `functions/mature-pending-balance/` **(baru)** | Cron harian `0 2 * * *`. `calculate-campaign-reward` menaruh reward di `wallets.pendingBalance`, tapi **tidak ada satu pun kode yang memindahkannya ke `balance`**, sementara `request-withdrawal` hanya membaca `balance`. Akibatnya reward kreator mengendap permanen dan tidak pernah bisa ditarik. Function ini mematangkannya H+7. Idempoten memakai pola ledger `create-escrow` (fix M-2). Ledger bertipe `mature`, bukan `release`, supaya tidak terhitung dua kali di `get-creator-dashboard-summary:93`. |
| 4 | `src/services/user.service.ts` | **B-5 Sprint 3 nyata dan masih hidup.** `addSocialAccount` menulis `creatorId` = `$id` dokumen `creator_profiles`, sedangkan **kedua** pembacanya (`get-creator-profile:72`, `get-creator-directory:74`) menjodohkannya dengan `userId` akun Auth. Akun sosial kreator **tidak akan pernah muncul**. Kelas kesalahan yang sama persis dengan B-3. Sekarang selalu memakai id akun Auth; `data.creatorId` diabaikan (selain salah kunci, ia memungkinkan kreator menulis akun sosial atas nama orang lain). |
| 5 | `src/services/order.service.ts`, `chat.service.ts` | Permission per-baris untuk `deliverables`, `revisions`, dan `messages.update` — prasyarat sebelum `read("users")` level koleksi dicabut. |

### B-6. Permission tabel

10 tabel sudah disinkronkan antara config dan live. Sisa `read("users")` tinggal di `deliverables` dan `revisions`, **sengaja ditunda** sampai row permission di B-5 nomor 5 ter-deploy — kalau dicabut sekarang, pemiliknya justru terkunci dari datanya sendiri.

### B-7. Verifikasi yang sudah kami jalankan

- `tsc --noEmit` — 0 error di frontend maupun `00_BACKEND/src`
- `node --check` — lolos untuk seluruh Function yang disentuh
- `npm run fn:drift` — blok A = 0
- Config: 26 Function, semuanya punya `scopes`

Satu yang **gagal dan bukan dari sesi ini**: `tests/integration/services.test.ts` sudah rusak sejak sebelumnya (harness `vitest`, 102/121 gagal).

---

## C. Yang perlu tim backend kerjakan

### C-1. 🔴 Deploy — paling mendesak

Tiga hal ini membuat perbaikan di §B-5 belum berdampak apa pun di live:

| # | Tindakan | Kenapa mendesak |
|---|---|---|
| 1 | **Redeploy `create-order`** | Live masih menjalankan kode lama. Bug "order tidak pernah terbuat" **masih hidup sekarang**. |
| 2 | **Redeploy `request-withdrawal`** | Guard peran belum aktif. Tambahkan env `USERS_COLLECTION_ID=users` (lihat `.env.example`). |
| 3 | **Push `mature-pending-balance`** (Function baru) | Selama belum ada, reward kreator mengendap permanen. Set env sesuai `.env.example`, jadwal `0 2 * * *`, timeout 60, scopes `documents.read` + `documents.write`. |

### C-2. 🟡 Kembalikan setelan build

`commands` kosong di **25 Function**, `entrypoint` kosong di `request-withdrawal` dan `cancel-payment`.

Ini **tidak** mengganggu deployment yang sedang berjalan — dependency-nya sudah ikut ter-build. Tapi **build berikutnya tidak akan menjalankan `npm install`**, jadi Function akan crash saat start.

Cara paling ringkas: satu kali

```bash
appwrite push functions
```

Itu sekaligus membereskan `commands`, `entrypoint`, dan `name` (`name` murni kosmetik: live memakai `create-order`, config memakai `Create Order`).

> ⚠️ **Push ini aman untuk `scopes`** berkat B-1. Sebelum perbaikan itu, push justru mencabutnya. Mohon jalankan `npm run fn:drift` **sesudah** push untuk memastikan.

### C-3. 🔴 Verifikasi deployment — mohon dicek dari sisi kalian

Snapshot kami menunjukkan `deployment=NONE` untuk **25/25 Function**. Kami menduga ini alarm palsu karena nama field berubah di Appwrite 1.9.x (`deployment` → `deploymentId`/`latestDeploymentId`), **tapi dugaan itu belum terbukti**.

Kalau ternyata bukan alarm palsu, `events` yang baru kami pulihkan **tetap tidak menjalankan apa pun** — sakelarnya tersambung, tapi tidak ada lampunya.

```bash
node appwrite/ops/check-deployments.mjs
```

Read-only, mencetak deployment aktif + jumlah eksekusi tiap Function.

### C-4. 🟠 Kolom yang perlu diubah

| Item | Permintaan | Asal |
|---|---|---|
| `campaign_briefs.doAndDont` | 400 → **4000** char | B-3 Sprint 3, masih terbuka. Brief hasil AI rutin melebihi 400 dan **gagal simpan diam-diam**. |
| `get-creator-negotiations` DTO | tambahkan `conversationId` + `isArchived` | T-5, ditampung sejak 2026-07-26 |

### C-5. 🟢 Setelah C-1 selesai

Pengetatan permission gelombang 2 untuk `deliverables` dan `revisions` baru aman dijalankan **setelah** row permission di §B-5 nomor 5 ter-deploy:

```bash
node appwrite/ops/harden-permissions.mjs --dry
```

### C-6. ⛔ Jangan dijalankan

```
npx tsx appwrite/sync-scopes.ts
```

Skrip ini yang menyebabkan §A-3. Sudah kami ubah jadi stub yang menolak jalan, tapi mohon jangan dihidupkan kembali. Penggantinya `appwrite/ops/sync-functions.mjs`.

---

## D. Cara memverifikasi pekerjaan kami

```bash
cd 00_BACKEND
npm run fn:drift
```

Yang seharusnya terlihat **sekarang**:

- `A. BISA KITA PERBAIKI` → **0 field**
- `B. WEWENANG TIM BACKEND` → 52 field (isi §C-2)
- `BELUM DI-PUSH` → `mature-pending-balance` (isi §C-1)

Setelah §C-1 dan §C-2 selesai, hasilnya seharusnya **`NO DRIFT`** tanpa pengecualian.

Perintah lain:

| Perintah | Sifat |
|---|---|
| `npm run fn:drift` | read-only |
| `npm run fn:sync:dry` | read-only, tampilkan rencana |
| `npm run fn:sync` | menulis — hanya field runtime |
| `node appwrite/ops/check-deployments.mjs` | read-only |
| `node appwrite/ops/harden-permissions.mjs --dry` | read-only |

---

## E. Yang belum terbukti — mohon jangan dianggap selesai

Seluruh pekerjaan sesi ini ada di **lapisan konfigurasi**. Kami memastikan sakelarnya tersambung, **bukan** memastikan lampunya menyala.

1. **Belum ada satu pun eksekusi Function yang terbukti sukses.** Semua tabel masih 0 baris, `executions` masih 0.
2. **Status deployment belum terverifikasi** (§C-3).
3. **Perbaikan kode terpenting belum ter-deploy** (§C-1).

Karena itu status Alur A yang tepat adalah **"konfigurasi benar, menunggu deploy"** — bukan "selesai".

Kami menuliskan ini eksplisit karena kemarin Alur A sempat dinyatakan selesai berdasarkan `NO DRIFT` yang ternyata lampu hijau palsu (§A-2). Sayang kalau polanya terulang dalam bentuk berbeda.

---

## F. Masih menunggu keputusan produk

| Item | Pertanyaan |
|---|---|
| Claim `expired` | Klaim yang kedaluwarsa **mengunci kreator selamanya** — tidak ada jalan klaim ulang. Perlu keputusan: reset otomatis, atau kreator boleh klaim ulang? (Sprint 4 Alur A §5) |

---

## G. Pembagian wewenang yang kami pakai

Supaya jelas batas siapa mengerjakan apa:

| Wilayah | Siapa |
|---|---|
| Kode Function (`functions/<id>/src/`) | Kami |
| Rules & permission collection/table | Kami |
| Setelan runtime Function: `events`, `schedule`, `execute`, `timeout`, `enabled`, `logging` | Kami |
| `scopes` / API key Function | **Tim backend** |
| Setelan build: `entrypoint`, `commands`, `runtime`, `name` | **Tim backend** |
| `appwrite push functions`, deploy, redeploy | **Tim backend** |

`sync-functions.mjs` menegakkan pembagian ini di kode: default hanya menyentuh baris "Kami", dan field milik tim backend dibawa ulang apa adanya dari live.
