# Withdrawal 4-State + Midtrans Iris (T-06, T-17, T-18, Fix B, Pasal 11 & 15 T&C) — Laporan Hasil

**Tanggal:** 2026-08-04  
**Commit:** belum di-commit (perubahan uncommitted di working tree, branch `staging`)  
**Branch:** staging  
**Status:** KODE & TEST SELESAI ✅ — DEPLOY SELESAI ✅ (3 fungsi LIVE; tersisa `MIDTRANS_IRIS_SERVER_KEY` placeholder)

---

## Ringkasan Eksekutif

Berhasil menulis ulang alur penarikan saldo dari ADR-008 lama (withdrawal langsung `processed`) menjadi alur **4-state** dengan disbursement asinkron **Midtrans Iris** (B2B payout API, terpisah dari Snap):

```
requested → processing → succeeded | failed | reversed
```

- **requested** — audit row dibuat, saldo BELUM keluar (id deterministik `wd` + sha256(`${userId}:${requestKey}`) = idempotensi tanpa perubahan skema)
- **processing** — Iris menerima payout (dana keluar wallet platform), `iris_reference` tersimpan
- **succeeded** — callback Iris: dana sampai rekening penerima, `processedAt` diisi
- **failed** — Iris menolak (sync saat request ATAU async via callback); saldo DIKREDIT BALIK via ledger `withdrawal_reversal`
- **reversed** — kredit balik sudah dieksekusi (marker idempoten)

**Kontrol baru (Pasal 11 & 15 T&C):**
- **UMKM boleh withdraw (T-06, Pasal 15.1.c)** — bukan cek role buta: validasi SUMBER SALDO (`sourceOrigin` ∈ `{umkm_refund, umkm_budget}` + terbukti di ledger `refund` atau pembayaran campaign lunas)
- **KYC (Pasal 11.8)** — nominal ≥ `KYC_THRESHOLD` (default Rp5.000.000) wajib `users.kyc_status = verified`; ditolak → `pending_wa` (dokumen diverifikasi admin via WhatsApp)
- **Rate limit (T-18)** — maks `WITHDRAW_PER_DAY_LIMIT` (3)/hari, status `failed` tidak dihitung
- **Cooling anti-fraud** — ganti akun rekening → pending `WITHDRAW_COOLING_DAYS` (3) hari
- **Debit ATOMIK (Fix B)** — `decrementColumn(balance, amount, 0)` dari `src/atomic.js` (min 0 ditegakkan server, bukan baca-ubah-tulis)
- **Reversal append-only (T-17)** — entry ledger BARU `withdrawal_reversal` id deterministik `tx` + sha256(`${withdrawalId}:reversal`), kredit balik tidak pernah dobel
- T-14 (TOS) & T-15 (email pertama) **dipertahankan** — `main.js:49` dan `main.js:58`

**Fungsi baru (2):**
- `withdrawal-callback` (`execute: ["any"]`) — webhook Iris, lookup `iris_reference`, tutup status final, reversal idempoten DOUBLE-SOURCE (terminal + ledger deterministik)
- `verify-kyc` (`execute: []`) — dipanggil internal, `kyc_status = "verified"` + `kyc_verified_at` + notifikasi

---

## File Baru (6)

| Path | Deskripsi |
|------|-----------|
| `functions/withdrawal-callback/src/main.js` | Webhook Iris: `processing → succeeded/failed`, reversal idempoten |
| `functions/withdrawal-callback/src/atomic.js` | Salinan atomic.js (bundle per folder — root Appwrite `functions/<id>/` tidak ikut ter-bundle) |
| `functions/withdrawal-callback/package.json` | Deps: `node-appwrite@^14.1.0` |
| `functions/withdrawal-callback/.env.example` | Env: withdrawals/wallets/transactions/notifications collection id |
| `functions/verify-kyc/src/main.js` | `kyc_status: verified` + `kyc_verified_at` + notifikasi `kyc_verified` |
| `functions/verify-kyc/package.json` + `.env.example` | Deps + env users/notifications collection id |

---

## Perubahan Konfigurasi (3 file)

| File | Perubahan |
|------|-----------|
| `appwrite.config.json` | + `withdrawal-callback` (execute `["any"]`, timeout 30) + `verify-kyc` (execute `[]`, timeout 15) — total 39 fungsi |
| `appwrite/generate_appwrite_json.cjs` | + kedua function (blok setelah `midtrans-webhook`) |
| `appwrite/function-scopes.json` | + `withdrawal-callback` + `verify-kyc` → `["documents.read", "documents.write"]` |

**Skema (Task 1, diedit manual di generator + config — `generate_appwrite_json.cjs` TIDAK dijalankan, constraint):**
- `withdrawals`: `status` → enum `["requested","processing","succeeded","failed","reversed"]`; + `failure_reason` (500), `reversed_at`, `requester_role` (20), `source_origin` (enum `creator|umkm_refund|umkm_budget`), `kyc_status` (enum `none|pending_wa|verified`), `iris_reference` (255); `processedAt` → optional (diisi saat status final `succeeded`)
- `users`: + `kyc_status` (enum), `kyc_verified_at`

---

## Dokumentasi Diperbarui (3 file)

| File | Perubahan Utama |
|------|-----------------|
| `docs/02_Modules/Payments/70_Backend.md` | + section `request-withdrawal` (4-state, Iris, Fix B, reversal, UMKM, KYC, rate limit), `withdrawal-callback`, `verify-kyc`; aturan backend diperbarui (final status, balance non-negatif via server) |
| `docs/02_Modules/Payments/30_Business_Rules.md` | Tipe transaksi + `withdrawal_reversal`; bagian Withdraw di-rewrite: alur 4-state, SLA 1×24 jam kerja, reversal ≤ 3 hari kerja, KYC, rate limit & cooling, UMKM (Pasal 15.1.c), idempotensi |
| `docs/02_Modules/Payments/50_Database.md` | Tabel `withdrawals` di-rewrite (4-state + 7 kolom baru, `processedAt` optional); tipe `transactions` + `withdrawal_reversal` |

---

## Test Baru (19) — SEMUA HIJAU ✅

| Test Suite | Test Case | Hasil |
|------------|-----------|-------|
| request-withdrawal (4-state flow) | menolak saat TOS v3.1 belum disetujui (T-14) | ✅ pass |
| request-withdrawal (4-state flow) | menolak penarikan pertama saat email belum verified (T-15) | ✅ pass |
| request-withdrawal (4-state flow) | mengizinkan → `processing` + `iris_reference` + debit atomik | ✅ pass |
| request-withdrawal (4-state flow) | menolak saat saldo nol, tanpa baris withdrawal | ✅ pass |
| request-withdrawal (4-state flow) | hanya panggilan pertama requestKey sama yang lolos (dup 60 dtk) | ✅ pass |
| request-withdrawal (4-state flow) | menolak UMKM tanpa `sourceOrigin` valid | ✅ pass |
| request-withdrawal (4-state flow) | menolak UMKM tanpa sumber refund/budget di ledger | ✅ pass |
| request-withdrawal (4-state flow) | mengizinkan UMKM dengan ledger `refund` (Pasal 15.1.c) | ✅ pass |
| request-withdrawal (4-state flow) | KYC wajib verified saat nominal ≥ threshold, `pending_wa` di-set | ✅ pass |
| request-withdrawal (4-state flow) | rate limit 3/hari (429) | ✅ pass |
| request-withdrawal (4-state flow) | cooling 3 hari saat akun rekening berubah (429) | ✅ pass |
| request-withdrawal (4-state flow) | Iris fail sync → `failed` + reversal (saldo kembali, ledger 1 baris) | ✅ pass |
| withdrawal-callback | `completed` → `succeeded` + `processedAt`, tanpa reversal | ✅ pass |
| withdrawal-callback | `failed` → `failed` + kredit balik + `reversed` | ✅ pass |
| withdrawal-callback | idempoten: callback ganda tidak kredit dobel | ✅ pass |
| withdrawal-callback | callback `failed` telat untuk withdrawal terminal `succeeded` → no-op | ✅ pass |
| withdrawal-callback | `iris_reference` tidak dikenal → 404 | ✅ pass |
| verify-kyc | `pending_wa` → `verified` + `kyc_verified_at` + notifikasi | ✅ pass |
| verify-kyc | idempoten saat sudah verified (tanpa notifikasi ganda) | ✅ pass |

**Perbaikan struktural:** region `tests/integration/functions.test.ts` 462-614 (describe rusak + parse error `Expected } but found EOF` di baris 1009) ditulis ulang — file kini compile, seluruh suite berjalan.

---

## Baseline Merah (BUKAN regresi — terbukti `git stash` di state bersih)

| Failure | Jumlah | Keterangan |
|---------|--------|------------|
| Unit test (auth/campaign/wallet/submission/services-validation) | 108 | Pre-existing — `calculatePlatformFee is not a function` dll; service layer tidak sinkron test |
| Integration (create-order, release-escrow, calculate-campaign-reward, user.service, campaign-claimed, fee-rate-flip ×2) | 7 | Pre-existing, tersembunyi parse error lama — kini terungkap |

---

## Pola Implementasi

| Pola | Sumber | Penerapan |
|------|--------|-----------|
| 4-state flow | Pasal 11 T&C | `requested → processing → succeeded/failed/reversed` |
| Debit atomik (Fix B) | `atomic.js` (mature-pending-balance) | `decrementColumn(..., min 0)` — server-enforced, bukan baca-ubah-tulis |
| Reversal append-only (T-17) | pola `create-escrow` | Ledger `withdrawal_reversal` id `tx` + sha256, kredit tidak dobel |
| Ledger deterministik | `create-escrow` / `refund-escrow` | `tx` + sha256(`${sourceId}:${kind}`) |
| Notifikasi deterministik | repo-wide | `ntf` + sha256(`${sourceId}:${kind}`) |
| Idempotensi webhook | `midtrans-webhook` | Status terminal → no-op; lookup `iris_reference` |
| UMKM (T-06, Pasal 15.1.c) | T&C Pasal 15 | Validasi SUMBER SALDO (ledger), bukan role |
| KYC (Pasal 11.8) | T&C Pasal 11 | `verify-kyc` internal + gate nominal ≥ threshold |
| Rate limit (T-18) | Pasal 11 | 3/hari + cooling 3 hari dihitung di Function |
| Header-first API key | integration-context blocker | `x-appwrite-key` runtime, fallback `APPWRITE_API_KEY` |

---

## Deployment Live Console (MCP) — VALIDASI ULANG 2026-08-04 (setelah deploy)

| Resource | Server (Marketiv `69f9d45b00315cb0ec2f`) | Status | Bukti |
|----------|------------------------------------------|--------|-------|
| `withdrawal-callback` | execute `["any"]`, live: true | ✅ LIVE | deployment `6a71d7b2` ready (12:14), vars lengkap (wallets/withdrawals/transactions/notifications/db) |
| `verify-kyc` | execute `[]`, live: true | ✅ LIVE | deployment `6a71d7b5` ready (12:14), vars lengkap (users/notifications/db) |
| `request-withdrawal` | execute `["users"]`, live: true | ✅ LIVE (12:33) | deployment aktif `6a71dc2f` (12:33, activate:true, ready) — sourceSize 9.930B = gzip working tree 4-state (main.js 25.639B + atomic.js 3.185B + package.json → tar.gz 9.336B, selisih ~500B = metadata tar) |
| `request-withdrawal` vars Iris/KYC | — | ✅ TERPENUHI (12:19) | `KYC_THRESHOLD=5000000`, `WITHDRAW_PER_DAY_LIMIT=3`, `WITHDRAW_COOLING_DAYS=3`, `NOTIFICATIONS_COLLECTION_ID=notifications`, `MIDTRANS_IRIS_ENV=sandbox` semua set. `USERS_COLLECTION_ID` kosong tapi aman (getEnv fallback `"users"`, main.js:373). ⚠️ `MIDTRANS_IRIS_SERVER_KEY` masih PLACEHOLDER `your-midtrans-iris-server-key` (secret:false) → payout akan 401 |
| Tabel `withdrawals` | — | ✅ MIGRASI SELESAI (12:23) | 14 kolom, semua available: +`failure_reason`(500), `reversed_at`, `requester_role`(20), `source_origin`(enum), `kyc_status`(enum), `iris_reference`(255); `processedAt` → required:false. `status` tetap string(50) — konversi enum gagal 500 (platform), bukan blocker (nilai enum tetap valid) |
| Tabel `users` | — | ✅ MIGRASI SELESAI (12:23) | 11 kolom: +`kyc_status`(enum), `kyc_verified_at` — semua available |

**DAMPAK:** alur 4-state BELUM berjalan end-to-end. `withdrawal-callback` live tapi:
- baris withdrawal dibuat `request-withdrawal` versi lama → status `processed`, tanpa `iris_reference` → callback lookup `Query.equal("iris_reference", ...)` tidak akan menemukan baris
- kolom `failure_reason`/`reversed_at`/`iris_reference` belum ada → updateDocument callback `failed`/`succeeded` akan gagal
- `verify-kyc` update `kyc_status`/`kyc_verified_at` di `users` → kolom belum ada → error 400

Validasi 3 tempat sinkron LOKAL: ✅ `appwrite.config.json` (39 fungsi) + `generate_appwrite_json.cjs` + `function-scopes.json`.

**Catatan keamanan deploy:** `APPWRITE_API_KEY` di `withdrawal-callback` + `verify-kyc` tersimpan sebagai `secret: false` dengan nilai API key terlihat (pola deploy console). Sebaiknya di-set ulang sebagai secret.

---

## Bukti Validasi

```
✓ 19/19 test baru PASS (request-withdrawal 12 + withdrawal-callback 5 + verify-kyc 2)
✓ node --check: main.js request-withdrawal, withdrawal-callback, verify-kyc, atomic.js — SYNTAX OK
✓ appwrite.config.json JSON parse OK (39 functions)
✓ Sinkron 3 tempat: config + generator + scopes
✓ Baseline merah (115) terbukti pre-existing via git stash (state bersih tetap gagal)
✓ Docs updated: 3 file Payments (70_Backend, 30_Business_Rules, 50_Database)
✓ Constraint dihormati: generator TIDAK dijalankan, SDK tidak di-upgrade, create-payment/release-escrow/fee/refund tak disentuh
✓ MCP validasi ulang pasca-deploy: withdrawal-callback + verify-kyc LIVE; request-withdrawal + skema masih lama (tercatat di bawah)
```

---

## Definisi Selesai — KODE TERPENUHI; DEPLOY PARTAIL

- [x] Alur 4-state `requested → processing → succeeded | failed | reversed`
- [x] Disbursement Midtrans Iris (POST `{base}/payouts`, sandbox/prod base, auth Basic server key Iris)
- [x] Debit atomik `decrementColumn` min 0 (Fix B)
- [x] Reversal idempoten append-only (T-17) — ledger `withdrawal_reversal` + `reversed_at`
- [x] UMKM boleh withdraw — validasi sumber saldo refund/budget di ledger (Pasal 15.1.c)
- [x] KYC gate nominal ≥ Rp5.000.000 + `pending_wa` (Pasal 11.8)
- [x] Rate limit 3/hari + cooling 3 hari (T-18)
- [x] Guard T-14 / T-15 dipertahankan
- [x] `withdrawal-callback` + `verify-kyc` dibuat, terdaftar di 3 tempat sinkron
- [x] Skema withdrawals + users diperbarui (generator + config)
- [x] Docs 3 file Payments diperbarui
- [x] Test baru 19 PASS; parse error test file diperbaiki
- [x] MCP validasi: konfirmasi server state + sinkron lokal
- [x] DEPLOY `withdrawal-callback` + `verify-kyc` — LIVE (deployment `6a71d7b2` / `6a71d7b5`, ready)
- [x] Env Iris/KYC di `request-withdrawal` — set (12:19): `KYC_THRESHOLD`, `WITHDRAW_PER_DAY_LIMIT`, `WITHDRAW_COOLING_DAYS`, `NOTIFICATIONS_COLLECTION_ID`, `MIDTRANS_IRIS_ENV`
- [x] Migration kolom `withdrawals` (6 kolom baru + `processedAt`→optional, 14 kolom available) + `users` (`kyc_status`, `kyc_verified_at`, 11 kolom available) — via MCP 12:23
- [x] DEPLOY ulang `request-withdrawal` — LIVE (`6a71dc2f` 12:33, activate:true, ready; sourceSize 9.930B ≈ gzip working tree 4-state)
- [ ] Set `MIDTRANS_IRIS_SERVER_KEY` nilai nyata (placeholder `your-midtrans-iris-server-key` → payout 401; secret:false → perlu jadi secret)
- [ ] Opsional: konversi `withdrawals.status` → enum (gagal 500 via MCP; bukan blocker — string 50 terima nilai enum)

---

## Risiko Tersisa

| Risiko | Mitigasi |
|--------|----------|
| `MIDTRANS_IRIS_SERVER_KEY` placeholder (`your-midtrans-iris-server-key`, secret:false) → `createIrisPayout` 401 di Midtrans | Set nilai nyata server key Iris; set sebagai secret var |
| `iris_reference` tidak ada di baris lama → callback lookup tidak menemukan withdrawal | Migration selesai; baris lama berstatus `processed` tidak akan diproses callback (final status guard) |
| Payload webhook Iris tidak punya skema `signature_key` terdokumentasi | Identitas diikat ke lookup `iris_reference`; ganti verifikasi signature bila docs resmi tersedia (tercatat di `70_Backend.md`) |
| `withdrawals.status` belum enum (konversi gagal 500 via MCP) | Bukan blocker — kolom string 50 menampung nilai enum; konversi manual di console bila ingin |
| `APPWRITE_API_KEY` ter-set `secret: false` (terlihat) di 2 fungsi baru | Set ulang sebagai secret variable di console |
| 115 failure baseline (unit + integration) | Pre-existing, di luar scope — perlu task terpisah |
