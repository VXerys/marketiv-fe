# Prompt — Perbaikan Integritas Finansial: Wallet & Reward

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan fase dan constraint di dalamnya saling terkait.
>
> **Target repo:** `00_BACKEND/` (Appwrite Functions).
> **Tanggal:** 2026-08-02

---

## PERAN

Kamu adalah backend engineer senior yang menjaga integritas uang di platform Marketiv. Kamu bekerja di repo `00_BACKEND/`. Tugasmu memperbaiki DUA bug finansial (Phase 1) — keduanya berpotensi kehilangan uang nyata — lalu berhenti dan melapor. JANGAN melanjutkan ke Phase 2 tanpa konfirmasi dari saya.

Aturan kerja repo berlaku. Baca dulu `00_BACKEND/AGENTS.md`. Dokumentasi adalah sumber kebenaran: sebelum menyentuh kode, baca `docs/marketiv-md/features/11-finance-escrow-wallet-and-withdrawal.md` dan `docs/marketiv-md/features/08-campaign-submission-and-validation.md`.

Semua jawaban/komentar kode boleh Bahasa Indonesia.

---

## AKSES CONSOLE APPWRITE — WAJIB VIA MCP

Semua interaksi dengan Appwrite Console (function, database, validasi kesesuaian) DIJALANKAN lewat MCP Appwrite — jangan mengandalkan asumsi dari file repo saja:

1. Alur MCP: `appwrite_get_context` (ambil project_id) → `appwrite_search_tools` (cari tool) → `appwrite_call_tool` (eksekusi).
2. SEBELUM implementasi — bandingkan kondisi LIVE console vs repo (`appwrite.config.json`, `appwrite/generate_appwrite_json.cjs`, `appwrite/function-scopes.json`):
   - Functions: daftar, runtime, entrypoint, scopes, events, schedule, vars.
   - Database: koleksi, atribut, tipe, index.
   - Drift yang menyentuh scope tugasmu → laporkan; jangan perbaiki di luar scope.
3. SAAT implementasi: daftarkan/ubah function + koleksi/atribut di console via MCP, lalu update repo supaya SINKRON (LIVE = repo).
4. SESUDAH implementasi — VALIDASI WAJIB via MCP:
   - Function: terdaftar? scopes benar? events terpasang? schedule benar? vars terset? deployment ter-upload?
   - Database: koleksi/atribut/index sesuai rencana? tipe data benar?
5. JANGAN menyatakan selesai sebelum validasi MCP membuktikan kondisi LIVE sesuai repo — tempel bukti (id function, id koleksi, atribut) di LAPORAN.

---

## KONTEKS SISTEM (baca sebelum mulai)

Saldo kreator = satu dokumen `wallets` per user dengan dua kolom:

- `pendingBalance` — reward campaign yang belum "matang", belum bisa ditarik.
- `balance` — dana tersedia, bisa ditarik.

Semua mutasi uang wajib lewat Appwrite Function (koleksi `wallets`/`transactions` pakai `$permissions: []` + rowSecurity; browser tidak bisa menulis). Ledger `transactions` mencatat setiap mutasi (tipe: `release`, `mature`, `withdrawal`, `fee`, dst).

Dua jalur pendapatan kreator:

1. **Campaign PPV** — reward dihitung per 1000 views, masuk ke `pendingBalance`, lalu cron harian `mature-pending-balance` memindahkannya ke `balance` setelah 7 hari.
2. **Rate Card (escrow)** — `release-escrow` mengkredit langsung ke `balance` saat deliverable di-approve (potong fee 2%).

Phase 1 hanya menyentuh jalur 1 (reward) dan jalur penarikan (withdrawal).

---

## KONTEKS TUGAS TERKAIT — BACA FILE INI DULU

Roadmap resmi backend ada di `terms & conditions/roadmap/tasks-backend-alignment-tnc.md` (hasil audit CTO/CAIO + keputusan produk yang SUDAH DIKUNCI). Baca file itu SEBELUM mulai — tugas di prompt ini bersinggungan dengan beberapa task di sana, dan kamu harus tahu batasnya:

| Task di roadmap | Singgungan | Aturan buat kamu |
|---|---|---|
| **T-01** (fee dari env + snapshot `fee_rate`) | Fee 2%→5% | JANGAN sentuh fee sama sekali. Prompt ini tidak mengubah konstanta fee. |
| **T-04** (field `views_count`/`views_final`) | Menyentuh file yang SAMA: `review-submission` & `calculate-campaign-reward` | JANGAN implementasikan field views apa pun. Fix A hanya soal idempotensi ledger. |
| **T-06** (withdrawal 4-state + Midtrans Iris + reversal) | Akan MENULIS ULANG `request-withdrawal` | Fix B = tambalan minimal sekarang (hentikan pendarahan). JANGAN bangun 4-state / `withdrawal-callback` / KYC — itu jadwal T-06. Prinsip Fix B (debit atomik) WAJIB dipertahankan saat T-06 dikerjakan nanti. |
| **T-17** (ledger append-only; ganti rollback-delete → status `failed`) | Menyentuh rollback di `request-withdrawal` | Kode saat ini memakai `deleteDocument` sebagai rollback. PERTAHANKAN perilaku itu sekarang; jangan ganti ke status `failed` — itu bagian T-17, jadwal terpisah. |
| **T-16** (claim atomik) | Pola yang sama (race → Function atomik) | Referensi pola saja, bukan scope prompt ini. |

**Kesimpulan penting:** Fix A dan Fix B adalah **temuan baru dari review kode — TIDAK tercantum di roadmap**. Roadmap menutup masalah desain (status, fee, views, refund), tapi tidak menutup dua race condition di atas. Keduanya wajib diperbaiki sekarang, dan tidak bertabrakan dengan roadmap selama kamu mengikuti tabel di atas.

---

## PHASE 1 — WAJIB (dua bug uang)

### FIX A — Reward campaign bisa dikredit dua kali

**File:** `functions/calculate-campaign-reward/src/main.js`

**Root cause:** Dedup di baris 22-34 memakai `listDocuments` (baca dulu, putuskan, lalu tulis). Ini pola *read-then-act* — RACED. Event database Appwrite bisa terkirim ulang, dan dua eksekusi yang tumpang tindih sama-sama tidak menemukan ledger existing, sama-sama menghitung reward, lalu keduanya mengeksekusi `incrementColumn` pendingBalance (baris 59-61) dan keduanya membuat ledger dengan `ID.unique()` (baris 64). Hasil: kreator dikredit dua kali, `spentAmount` terhitung dobel, sementara `decrementColumn` remainingBudget (baris 88-90) hanya menahan yang pertama (min 0 di server) — jadi dana yang keluar TIDAK pernah cocok dengan budget yang berkurang.

**Pola yang benar (SUDAH ADA di repo — tiru, jangan bikin baru):** `functions/mature-pending-balance/src/main.js`:

- baris 233-236: ledger memakai **id deterministik** `tx` + sha256 hex — eksekusi kedua otomatis kena 409, tidak perlu query dedup.
- baris 195-227 (`claimLedgerRow`): *claim dulu, pindahkan dana kemudian*. 409 = sudah diproses, skip.

**Perintah perbaikan:**

1. Ganti pembuatan ledger di baris 63-78: pakai id deterministik dari `submissionId` (pola persis `mature-pending-balance/src/main.js:233-236`, misal `tx` + sha256(`${submissionId}:release`).slice(0,32)).
2. Buat ledger **SEBELUM** mutasi dana (urutan: ledger → increment pendingBalance → decrement remainingBudget → increment spentAmount → cek budget habis → notifikasi).
3. Tangani 409 saat create ledger: log `Reward already processed`, return sukses tanpa memindahkan apa pun. Ini sekarang pengaman utama — query dedup di baris 22-34 boleh dipertahankan sebagai fast-path, tapi JANGAN dijadikan satu-satunya pengaman.
4. Jika mutasi dana gagal SETELAH ledger terlanjur dibuat (increment/decrement throw): hapus baris ledger (rollback), return error. Pola rollback persis ada di `functions/request-withdrawal/src/main.js:100-108` (catch → deleteDocument → return error).
5. Jangan ubah rumus reward (baris 40-47), konstanta, atau alur notifikasi.

**Kriteria lolos:**

- Dua eksekusi beruntun dengan payload submission yang sama → hanya SATU kredit pendingBalance, SATU baris ledger, remainingBudget terpotong SEKALI.
- Idempoten terhadap event terkirim ulang (409, bukan error).

### FIX B — Withdrawal bisa overdraw (saldo negatif)

**File:** `functions/request-withdrawal/src/main.js`

**Root cause:** Debit saldo di baris 92-98 memakai baca-ubah-tulis: `getWallet` → cek `fresh.balance >= amount` → `updateDocument({ balance: fresh.balance - amount })`. Appwrite tidak punya compare-and-set. Dua withdrawal dengan nominal berbeda dari user yang sama dalam milidetik yang sama sama-sama membaca saldo lama, dua-duanya lolos cek baris 93, dua-duanya menulis — yang terakhir menang, saldo jadi negatif / uang dobel cair. Guard duplicate (baris 53-56, 286-297) hanya menangkap (user, nominal) sama dalam 60 detik — tidak menangkap race nominal berbeda.

**Pola yang benar (SUDAH ADA di repo):** `functions/calculate-campaign-reward/src/atomic.js` — helper `decrementColumn(env, tableId, rowId, column, value, min)` yang memakai endpoint TablesDB increment/decrement; `min` ditegakkan SERVER (melampaui min = error, bukan angka dipotong diam-diam). Contoh pemakaian: `functions/mature-pending-balance/src/main.js:148`.

**PERHATIAN — arsitektur deploy:** `functions/request-withdrawal/src/` saat ini HANYA berisi `main.js`. File `atomic.js` TIDAK ikut ter-bundle kalau diimpor dari folder fungsi lain (deploy root Appwrite = `functions/<id>/`, direktori bersama tidak ikut — lihat catatan `calculate-campaign-reward/src/atomic.js:22-25`). Jadi:

1. **Salin** `functions/mature-pending-balance/src/atomic.js` → `functions/request-withdrawal/src/atomic.js` (identik, jangan diubah isinya).
2. Import `decrementColumn` di `main.js` dan ganti blok debit baris 91-108:
   - Panggil `decrementColumn(env, walletsCollectionId, wallet.$id, "balance", amount, 0)` — min 0 berarti saldo tidak bisa negatif, ditegakkan server.
   - Error dari decrement (saldo berubah/kurang) → jalankan rollback yang sudah ada (hapus baris `withdrawals` di baris 102-107), return error. Perilaku rollback-delete ini DIPERTAHANKAN — lihat tabel T-17 di bagian KONTEKS TUGAS TERKAIT.
   - `balanceAfter` di response: baca ulang wallet setelah decrement sukses (nilai ini hanya informatif untuk frontend, bukan pengaman).
3. JANGAN ubah: guard role kreator (baris 40-44), cek balance awal (46-50), guard duplicate (53-56), id deterministik `requestKey` (59), validasi payload (227-249), urutan audit-first.
4. Kalau kamu mengubah `atomic.js` di fungsi mana pun: **sinkronkan semua salinan identiknya** — `calculate-campaign-reward`, `create-escrow`, `release-escrow`, `campaign-claimed`, `expire-stale-claims`, `mature-pending-balance`, dan yang baru kamu salin ke `request-withdrawal`. (Idealnya tidak perlu diubah sama sekali.)

**Kriteria lolos:**

- Saldo 0 → withdrawal ditolak, baris `withdrawals` TIDAK tertinggal (rollback bersih).
- Saldo 50.000 → dua request 50.000 beruntun: hanya yang pertama sukses.
- Tidak ada jalur kode yang menulis `balance` dari hasil bacaan (read-then-write) tersisa di file ini.

### Test (wajib ditambahkan)

**File:** `functions/../tests/integration/functions.test.ts` (di `00_BACKEND/tests/integration/`). Pelajari pola test yang ada (sudah ada seed wallet, test reward, test withdrawal — baris 125-266).

1. **FIX A:** panggil handler `calculate-campaign-reward` dua kali dengan payload submission approved yang sama → assert `pendingBalance` naik SEKALI, baris `transactions` hanya satu, `remainingBudget` turun sekali.
2. **FIX B:** wallet balance 0 → `request-withdrawal` ditolak DAN tidak ada baris `withdrawals` tersisa (rollback). Wallet balance 50.000 → withdrawal pertama sukses, kedua ditolak.
3. Semua test lama tetap hijau.

---

## PHASE 2 — OPSIONAL (JANGAN dikerjakan sebelum saya konfirmasi setelah Phase 1)

1. **Audit trail:** semua operasi finansial wajib menulis `audit_logs` (mandat `docs/marketiv-md/features/11-finance-escrow-wallet-and-withdrawal.md` bagian 6/9, dan roadmap T-04 item 4). Saat ini TIDAK ADA satu pun fungsi finansial yang menulisnya. Cek dulu apakah koleksi `audit_logs` SUDAH ada di `appwrite.config.json`; kalau ada, tambahkan record (userId, action, entityType, entityId, before/after, createdAt) di `review-submission`, `calculate-campaign-reward`, `mature-pending-balance`, `release-escrow`, `request-withdrawal`. Kalau belum ada, LAPORKAN saja — roadmap (T-03/T-04, bagian "Perubahan Skema") berencana membuatnya; jangan buat collection baru tanpa konfirmasi.
2. **Fee 2% — JANGAN DIKERJAKAN DI PROMPT INI.** Duplikasi `PLATFORM_FEE_RATE` di 5 tempat (`src/services/wallet.service.ts:6`, `functions/create-payment/src/main.js:13`, `functions/get-creator-negotiations/src/main.js:61`, `functions/release-escrow/src/main.js:18`, `src/types/domain.ts:117`) SUDAH dijadwalkan di roadmap **T-01**: satu konstanta dari env Appwrite + snapshot `fee_rate` ke escrow saat create-escrow. Prompt ini tidak menyentuh fee sama sekali. Kalau kamu menemukan inkonsistensi fee di kode, LAPORKAN saja.

---

## CONSTRAINT — jangan lakukan ini

- JANGAN ubah `appwrite.config.json`, `0.02` (fee), rumus reward, atau status lifecycle.
- JANGAN implementasikan item roadmap `terms & conditions/roadmap/tasks-backend-alignment-tnc.md` yang belum ada (field `views_*`, withdrawal 4-state, fee dari env, koleksi `appeals`/`audit_logs` baru, dsb) — itu jadwal terpisah. Fokus: dua bug di Phase 1.
- JANGAN bikin pola baru — tiru pola yang sudah ada di repo (atomic.js, id deterministik, claim-first).
- JANGAN sentuh kode di luar `00_BACKEND/functions/` (client `src/` di root repo di luar scope).
- JANGAN upgrade node-appwrite SDK (repo memakai `^14.1.0` dengan sengaja — lihat atomic.js:13-17).
- JANGAN buat koleksi/field database baru.
- JANGAN commit sebelum semua test hijau. Satu commit per fix, pesan commit jelas (pola repo: prefix fungsi, misal `fix(request-withdrawal): ...`).
- JANGAN ubah console Appwrite di luar MCP; validasi LIVE via MCP sebelum menyatakan selesai.
- JANGAN lanjut Phase 2 tanpa konfirmasi eksplisit dari saya.

---

## VERIFIKASI

```bash
cd 00_BACKEND
npm run test:integration   # wajib hijau
npm test                   # full suite
```

Setelah itu periksa `git diff` sendiri — pastikan tidak ada perubahan di luar scope.

---

## LAPORAN (format output)

Setelah Phase 1 selesai, laporkan:

1. `FIX A — file:line` yang diubah + pola yang dipakai.
2. `FIX B — file:line` yang diubah + pola yang dipakai.
3. Daftar test baru + hasil run (tempel output).
4. Catatan risiko yang tersisa (kalau ada).
5. Berhenti. Tunggu konfirmasi untuk Phase 2.

---

## DEFINISI SELESAI

- [ ] `calculate-campaign-reward` idempoten terhadap event ganda (409-based, bukan query-based).
- [ ] `request-withdrawal` debit lewat `decrementColumn` (min 0), rollback bersih saat gagal.
- [ ] Tidak ada read-then-write saldo tersisa di kedua file.
- [ ] Test baru + test lama hijau.
- [ ] Validasi live console via MCP: function + database sinkron repo (bukti di LAPORAN).
- [ ] Laporan terkirim, Phase 2 belum dikerjakan.
