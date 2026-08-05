# Prompt — Withdrawal 4-State + Midtrans Iris + Reversal + KYC + UMKM (T-06)

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan fase dan constraint di dalamnya saling terkait.
>
> **Target repo:** `00_BACKEND/` (Appwrite Functions).
> **Tanggal:** 2026-08-02

---

## PERAN

Kamu adalah backend engineer senior di repo `00_BACKEND/`. Tugasmu: **menulis ulang `request-withdrawal`** menjadi alur 4-state (`requested → processing → succeeded | failed | reversed`) dengan disbursement **Midtrans Iris**, webhook `withdrawal-callback`, reversal otomatis, KYC, rate limit, dan membuka withdrawal untuk **UMKM** (saldo refund/sisa budget). Selesai lalu berhenti dan melapor.

**PENTING — dependensi:** prompt ini DIKERJAKAN SETELAH `prompt-t14-t15-akun-kepatuhan.md` (guard email+TOS di `request-withdrawal`) dan `prompt-t02-refund.md` (sumber saldo UMKM). Guard yang sudah ada WAJIB dipertahankan. Kalau file belum sesuai, KERJAKAN DULU prompt-prompt itu, atau LAPORKAN dan berhenti.

Aturan kerja repo berlaku. Baca dulu `00_BACKEND/AGENTS.md`. Dokumentasi adalah sumber kebenaran: baca `docs/02_Modules/Payments/70_Backend.md`, `docs/02_Modules/Payments/30_Business_Rules.md`, `docs/02_Modules/Payments/50_Database.md`, dan `functions/midtrans-webhook/src/main.js` (pola webhook).

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

- **Kondisi sekarang** (`request-withdrawal/src/main.js`): status langsung `processed` (baris 76), debit baca-ubah-tulis (baris 91-98 — RACED), id deterministik `wd`+sha256(userId:requestKey) (baris 256-259), guard role kreator (40-44), guard duplicate 60 detik (53-56, 286-297), rollback deleteDocument (100-108), ledger `withdrawal` (114-135).
- **Fix B (prompt wallet `prompt-perbaikan-wallet-reward.md`):** debit wajib via `decrementColumn(..., min 0)` dari `atomic.js` — kalau belum diterapkan (tidak ada `functions/request-withdrawal/src/atomic.js`), prompt ini WAJIB menerapkannya (salin `functions/mature-pending-balance/src/atomic.js` → folder ini, identik). Kalau sudah, pertahankan.
- **Fix A (idempotensi reward)** sudah/jangan disentuh — tidak terkait.
- **Midtrans Iris** = B2B disbursement API, TERPISAH dari Snap (aktivasi terpisah). Auth Basic server key (pola `create-payment:220-221`), base URL sandbox `https://app.sandbox.midtrans.com`, endpoint dan format payload BACA dari dokumentasi Iris resmi — jangan menebak. Catat: server key Iris bisa berbeda dari Snap — env `MIDTRANS_IRIS_SERVER_KEY`.
- **Ledger:** append-only (T-17). Reversal = entry BARU `type: "withdrawal_reversal"`, bukan update.
- **Keputusan locked:** SLA dana diterima 1×24 jam kerja; reversal maks 3 hari kerja; rate limit 3 withdrawal/hari + cooling 3 hari setelah ubah rekening; KYC `none|pending_wa|verified` wajib ≥ Rp5.000.000 via WhatsApp admin (admin tandai verified di sistem); UMKM boleh withdraw dari saldo refund/sisa budget — validasi SUMBER SALDO, bukan role.

---

## KONTEKS TUGAS TERKAIT — BACA FILE INI DULU

Roadmap resmi: `terms & conditions/roadmap/tasks-backend-alignment-tnc.md`. Baca SEBELUM mulai.

| Task di roadmap | Singgungan | Aturan buat kamu |
|---|---|---|
| **T-15** (email gate) | Guard di `request-withdrawal` — file SAMA | WAJIB PERTAHANKAN: gate email untuk withdrawal pertama tetap jalan. |
| **T-14** (TOS guard) | Guard di `request-withdrawal` | WAJIB PERTAHANKAN: cek `tos_version`. |
| **T-03** (suspend guard) | Guard di `request-withdrawal` | JANGAN implementasikan — prompt T-03 dikerjakan SETELAH ini dan akan menambah guard. |
| **T-02** (refund) | Saldo UMKM dari refund | UMKM withdraw = saldo yang dihasilkan T-02. JANGAN ubah fungsi refund. |
| **T-18** (rate limit) | Rate limit withdrawal | TERCAKUP di prompt ini — jangan kerjakan terpisah. |
| **T-17** (ledger append-only) | Rollback delete → status `failed` | PERTAHANKAN perilaku rollback deleteDocument SEKARANG (pola Fix B). JANGAN ganti ke tanda `failed` — itu jadwal T-17 terpisah. |
| **T-01** (fee env) | `get-creator-negotiations` | JANGAN sentuh fee. |

---

## PHASE — WAJIB

### 1. Skema

**File:** `appwrite/generate_appwrite_json.cjs` DAN `appwrite.config.json` (edit MANUAL keduanya, jangan regenerate — drift schedule di luar scope).

- `withdrawals`:
  - `status` → enum `["requested", "processing", "succeeded", "failed", "reversed"]`
  - tambah `failure_reason` (string, optional, 500)
  - tambah `reversed_at` (datetime, optional)
  - tambah `requester_role` (string, optional, 20 — `creator`|`umkm`)
  - tambah `source_origin` (enum `["creator", "umkm_refund", "umkm_budget"]`, optional)
  - tambah `kyc_status` (enum `["none", "pending_wa", "verified"]`, optional — snapshot saat request)
  - tambah `iris_reference` (string, optional, 255 — id transfer Iris untuk lookup webhook)
  - `processedAt` tetap (required) — isi saat sukses/final, bukan saat request.
- `users`:
  - tambah `kyc_status` (enum `["none", "pending_wa", "verified"]`, optional, default null)
  - tambah `kyc_verified_at` (datetime, optional)

**Docs:** `docs/02_Modules/Payments/50_Database.md` (kolom baru + makna tiap status).

### 2. Tulis ulang `request-withdrawal`

**File:** `functions/request-withdrawal/src/main.js` (+ `src/atomic.js` bila Fix B belum ada).

Urutan handler (pertahankan semua guard yang ada, tambah yang baru):

1. Method/unauthorized/payload — sama (baris 22-32). `PAYOUT_METHODS` tetap.
2. **Guard role + UMKM (GANTI baris 40-44):**
   - Baca role (pola `getUserRole`, baris 269-275).
   - `creator` → lanjut; `umkm` → wajib payload `sourceOrigin` ∈ `{umkm_refund, umkm_budget}` DAN validasi ledger: `transactions` user memiliki entry `type: "refund"` (atau `type: "payment"` referenceType `campaign` — periksa docs) → kalau tidak → 403 `"Saldo UMKM hanya dapat ditarik dari refund atau sisa budget."`.
   - Role lain → 403 (perilaku lama).
3. **KYC (baru):** kalau `amount >= 5.000.000` dan `users.kyc_status !== "verified"` → 403 `"Verifikasi KYC dulu melalui WhatsApp admin."` (set `kyc_status: "pending_wa"` di `users` kalau masih `none`).
4. **Rate limit (baru):** hitung `withdrawals` user hari ini (`$createdAt >= startOfDay`, status != `failed`) — ≥ 3 → 429. Cooling: cek withdrawal sukses (status `succeeded`/`processing`/`requested`) 3 hari terakhir dengan `accountNumber`/`providerName` BERBEDA dari request → 429 `"Akun penarikan baru perlu pending 3 hari."` (pola fraud: ganti rekening → withdraw).
5. Guard duplicate 60 detik (53-56) — pertahankan.
6. **Audit-first (ubah baris 63-86):** create `withdrawals` id deterministik `wd`+sha256 (PERTAHANKAN id), `status: "requested"`, `requester_role`, `source_origin`, `kyc_status` (snapshot dari users), `processedAt` KOSONG (nullable? kolom required — isi `null` tidak boleh; solusi: set `processedAt` saat transisi final; kalau kolom wajib mengganjal, LAPORKAN opsi: ubah kolom jadi optional di skema — keputusan kamu, dokumentasikan). 409 → sudah diproses (perilaku lama).
7. **Debit atomik (Fix B — WAJIB):** `decrementColumn(env, wallets, wallet.$id, "balance", amount, 0)`; gagal → rollback delete baris withdrawal (pola lama 100-108, PERTAHANKAN delete — T-17) + return error. Baca ulang wallet untuk `balanceAfter` (informatif).
8. **Panggil Midtrans Iris (baru):** buat disbursement transfer ke rekening (bank: `providerName`, nomor: `accountNumber`, nama: `accountName`); simpan `iris_reference` ke baris withdrawal; sukses dipanggil → `status: "processing"`; error response dari Iris (rekening salah, saldo platform kurang, dsb) → `status: "failed"` + `failure_reason` + **kredit balik reversal SEKARANG** (incrementColumn balance + ledger `withdrawal_reversal` deterministic `tx`+sha256(`${withdrawalId}:reversal`)) + `reversed_at`. JANGAN kredit balik kalau reversal sudah ada (idempoten).
9. **Ledger `withdrawal`** (baris 114-135) — pertahankan posisi (setelah debit); type `withdrawal`, referenceId = withdrawalId.
10. Notifikasi + response (ubah: `status` jadi `requested`/`processing` sesuai hasil; `balanceAfter`).
11. **Guard email (T-15) dan TOS (T-14)** — kalau sudah ada di file, biarkan posisinya; kalau hilang karena tulis ulang, RESTORE sesuai spec prompt itu (gate email hanya untuk withdrawal pertama; TOS = `tos_version === CURRENT_TOS_VERSION`).

### 3. Function `withdrawal-callback` (webhook Iris)

Function baru, `execute: ["any"]` (webhook publik — pola `midtrans-webhook`), scopes `documents.read` + `documents.write` (generator + config + `appwrite/function-scopes.json` — tiga tempat sinkron).

- Verifikasi autentisitas callback sesuai dokumentasi Midtrans Iris (signature/token — baca `midtrans-webhook/src/main.js` untuk pola verifikasi sha512; kalau Iris sandbox tidak menyediakan signature yang bisa diverifikasi, VALIDASI via lookup `iris_reference` + catat keterbatasan di laporan).
- Payload berisi referensi transfer (id) + status disbursement (`success`/`failed`).
- Cari `withdrawals` by `iris_reference`.
- `success` → `status: "succeeded"`, `processedAt = now`.
- `failed` → `status: "failed"`, `failure_reason`, dan kalau `status` belum `reversed` → kredit balik (incrementColumn + ledger `withdrawal_reversal` deterministic + `reversed_at`).
- Idempoten: status sudah final (`succeeded`/`failed`/`reversed`) → respond 200 ok tanpa mutasi.
- Response webhook: 200 selalu (jangan retry loop), log setiap transisi.

### 4. Function `verify-kyc` (admin tool)

Function baru, `execute: []` (server-only — Console/CLI), scopes `documents.read` + `documents.write`.

- Payload: `userId`, `status` (`verified` — pencabutan tidak di prompt ini).
- Update `users.kyc_status = "verified"`, `kyc_verified_at = now`; notifikasi user (deterministic, `kind: "kyc_verified"`).
- (Verifikasi dokumen terjadi di WhatsApp admin — di luar sistem; sistem hanya mencatat status + timestamp via tombol admin ini.)

### 5. Dokumentasi

- `docs/02_Modules/Payments/70_Backend.md`: alur 4-state, Iris (aktivasi terpisah, sandbox, env `MIDTRANS_IRIS_SERVER_KEY`), callback, reversal.
- `docs/02_Modules/Payments/30_Business_Rules.md`: SLA 1×24 jam kerja, reversal maks 3 hari kerja, rate limit 3/hari, cooling 3 hari, KYC ≥ Rp5jt (Pasal 11.1/11.4/11.6/11.8), withdrawal UMKM dari refund/sisa budget (Pasal 15.1.c).
- `docs/02_Modules/Payments/50_Database.md`: kolom baru.

### Test (wajib ditambahkan)

**File:** `tests/integration/functions.test.ts`.

1. **Reversal mengembalikan saldo persis:** withdrawal sukses debit 50.000 → callback failed → saldo kembali 50.000, ledger `withdrawal_reversal` SATU baris; callback kedua → tidak ada kredit ganda.
2. **UMKM:** tanpa ledger refund → 403; dengan ledger refund → lolos (mock Iris sukses).
3. **KYC:** amount 6.000.000 tanpa verified → 403 + `users.kyc_status` jadi `pending_wa`; dengan verified → lolos.
4. **Rate limit:** 3 withdrawal hari ini → keempat 429.
5. **Cooling:** withdrawal sukses 1 hari lalu dengan rekening lain → 429.
6. **Debit atomik (Fix B):** saldo 0 → ditolak + baris withdrawal ter-rollback (tidak tertinggal); saldo 50.000 → dua request 50.000 beruntun → hanya pertama sukses.
7. **Email gate (T-15):** user tanpa `email_verified_at` + tanpa riwayat → 403.
8. Semua test lama tetap hijau.

---

## CONSTRAINT — jangan lakukan ini

- JANGAN ganti id deterministik `wd`+sha256, guard duplicate, atau rollback delete → status `failed` (T-17 terpisah).
- JANGAN sentuh `create-payment`/Snap, `release-escrow`, fee, topup.
- JANGAN hapus guard email/TOS yang sudah ada (T-14/T-15).
- JANGAN buat collection baru.
- JANGAN kredit balik dua kali — ledger `withdrawal_reversal` deterministic + guard status.
- JANGAN menebak format API Iris — baca dokumentasi resmi; kalau endpoint/format tidak bisa dipastikan, implementasikan dengan env endpoint + laporkan asumsi.
- JANGAN jalankan `node appwrite/generate_appwrite_json.cjs` — edit manual (drift schedule di luar scope; LAPORKAN kalau terlanjur ter-regen).
- JANGAN upgrade node-appwrite SDK.
- JANGAN commit sebelum test hijau. Satu commit per function (pola: `feat(request-withdrawal): ...`).
- JANGAN ubah console Appwrite di luar MCP; validasi LIVE via MCP sebelum menyatakan selesai.
- JANGAN lanjut task roadmap lain setelah selesai — berhenti dan laporkan.

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

1. `file:line` diubah (rewrite `request-withdrawal`, dua function baru — konfirmasi tiga tempat sinkron: generator/config/scopes).
2. Status Fix B: atomic.js sudah ada / baru disalin.
3. Asumsi API Iris yang dipakai (endpoint, payload, verifikasi callback) + referensi sumber.
4. Daftar test baru + hasil run (tempel output).
5. Keputusan kolom `processedAt` (required vs optional) — apa yang kamu lakukan.
6. Catatan risiko yang tersisa.
7. Berhenti.

---

## DEFINISI SELESAI

- [ ] 4-state status + kolom baru di config + generator; `users.kyc_status`.
- [ ] Debit atomik (min 0) + rollback bersih; tidak ada read-then-write saldo tersisa.
- [ ] UMKM bisa withdraw dari refund/sisa budget (validasi ledger, bukan role).
- [ ] KYC ≥ Rp5jt diblokir sampai verified; `verify-kyc` admin berfungsi.
- [ ] Rate limit 3/hari + cooling 3 hari.
- [ ] Callback: succeeded/failed → reversal kredit balik persis + ledger `withdrawal_reversal` sekali, idempoten.
- [ ] Guard email (T-15) + TOS (T-14) dipertahankan.
- [ ] Test baru + test lama hijau.
- [ ] Validasi live console via MCP: function + database sinkron repo (bukti di LAPORAN).
- [ ] Laporan terkirim, tidak ada pekerjaan di luar scope.
