# Prompt — Fee dari Env + Snapshot (T-01) & Hapus Top-Up Reguler (T-19)

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan fase dan constraint di dalamnya saling terkait.
>
> **Target repo:** `00_BACKEND/` (Appwrite Functions).
> **Tanggal:** 2026-08-02

---

## PERAN

Kamu adalah backend engineer senior di repo `00_BACKEND/`. Tugasmu DUA phase yang menyentuh **file yang SAMA** (alasan digabung jadi satu prompt/satu sesi — mengerjakan terpisah akan bentrok):

- **PHASE 1 (T-19):** hapus top-up reguler (`purpose=topup`), pertahankan `purpose=campaign`.
- **PHASE 2 (T-01):** fee platform dari env + snapshot `fee_rate` per transaksi.

Selesaikan Phase 1, laporkan, lalu TUNGGU konfirmasi saya sebelum Phase 2. Setelah Phase 2 selesai, berhenti.

Aturan kerja repo berlaku. Baca dulu `00_BACKEND/AGENTS.md`. Dokumentasi adalah sumber kebenaran: baca `docs/02_Modules/Payments/70_Backend.md`, `docs/02_Modules/Payments/50_Database.md`, `docs/02_Modules/Payments/30_Business_Rules.md`, `docs/02_Modules/Campaigns/30_Business_Rules.md`, dan ADR yang relevan di `docs/04_Decisions/`.

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

- **Fee:** konstanta `PLATFORM_FEE_RATE = 0.02` HARDCODE di 4 tempat + duplikat klien:
  - `functions/create-payment/src/main.js:13` (buyer-side, campaign: `fee_amount = floor(amount × rate)`, baris 87-88)
  - `functions/release-escrow/src/main.js:18` (seller-side, rate card: fee dipotong dari pendapatan kreator, baris 56-58)
  - `functions/get-creator-negotiations/src/main.js:61` (display potongan)
  - `src/services/wallet.service.ts:6` (klien — di luar `functions/`, baca saja untuk sinkron)
  - `src/types/domain.ts:117` (klien, `PLATFORM_FEE_RATE`)
- **Keputusan locked (T-01):** fee **2%** saat launch → naik **5%** otomatis saat 1.000 transaksi `completed`. T&C tetap **5%** (batas legal; undercharge sah, naik = menepati T&C). **Snapshot `fee_rate` ke escrow saat create** — order lama tidak boleh kena rate baru.
- **Top-up (T-19):** `create-payment` menerima `purpose` ∈ {`order`, `topup`, `campaign`}; `topup` = kredit `wallets.balance` bebas (risiko PJP — ditarik/diambil tanpa ikatan). Keputusan: HAPUS. `campaign` = kredit `campaign.remainingBudget`, terikat — PERTAHANKAN.
- **Env Appwrite:** function membaca env di `getEnv()` (pola `req.headers["x-appwrite-key"]` + `process.env.*`); variable di-set di Console Appwrite, bukan di kode. Flip rate 2%→5% = operasional (ubah variable env di Console) — function TIDAK bisa mengubah env sendiri.
- **Ledger:** `transactions` append-only (T-17). Flip pemicu menghitung `status = completed`.

---

## KONTEKS TUGAS TERKAIT — BACA FILE INI DULU

Roadmap resmi: `terms & conditions/roadmap/tasks-backend-alignment-tnc.md`. Baca SEBELUM mulai.

| Task di roadmap | Singgungan | Aturan buat kamu |
|---|---|---|
| **T-02** (refund) | `wallets.balance` UMKM | Setelah topup dihapus, balance UMKM terisi hanya via refund (T-02, prompt terpisah). JANGAN kerjakan refund di sini. |
| **T-06** (withdrawal UMKM) | Validasi sumber saldo UMKM | JANGAN sentuh `request-withdrawal`. |
| **T-03** (suspend guard) | Guard di `create-payment` | JANGAN tambahkan guard suspend — jadwal T-03 (setelah prompt ini). |
| **T-05** (auto-approve) | `release-escrow` tetap dipicu event | Snapshot fee_rate di release WAJIB kompatibel dengan alur auto-approve — jangan ubah mekanisme event. |
| **T-17** (ledger append-only) | — | Patuhi: jangan update/delete entry lama. |

---

## PHASE 1 — T-19: Hapus top-up reguler (WAJIB, kerjakan dulu)

### 1. `functions/create-payment/src/main.js`

- Baris 3: `PURPOSES` → `new Set(["order", "campaign"])`.
- Baris 28: `PURPOSE_PREFIX` → hapus entry `topup` (`{ order: "ord", campaign: "cmp" }`).
- Baris 120-121: itemName topup → hapus cabang (`payload.purpose === "topup" ? "Marketiv Wallet Top Up" :`).
- Baris 193: validasi `payload.purpose === "topup" && payload.orderId` → hapus.
- Jalur `campaign` (62-78, 87-88) dan `order` (48-57) PERTAHANKAN utuh.

### 2. `functions/create-escrow/src/main.js`

- Baris 14: hapus `payment.purpose === "topup" ||` — hanya `"campaign"` yang masuk `completeTopup`.
- Baris 102-103: hapus lookup wallet non-campaign (`wallet` hanya untuk respons; campaign tak butuh wallet — perilaku V-2 dipertahankan).
- Baris 105: `type` → `"payment"` selalu (hapus `"deposit"`).
- Baris 129-135: hapus cabang `else` increment `wallets.balance`. Jalur campaign (124-128, kredit `remainingBudget`) PERTAHANKAN utuh.

### 3. Klien (BACA + sesuaikan minimal — jangan rombak)

- `src/services/payment.service.ts`: hapus `'topup'` dari union `PaymentPurpose` (± baris 5) dan validasi terkait (± baris 118, 130 — verifikasi).
- `src/services/wallet.service.ts`: hapus `'deposit'` dari `TransactionType` (± baris 11) — verifikasi tidak ada logika lain yang bergantung.
- `src/types/domain.ts`: cek referensi `topup` — hapus bila ada (jangan sentuh `PLATFORM_FEE_RATE` di file ini — Phase 2).

### 4. Docs

- `docs/02_Modules/Payments/100_Testing.md` + `docs/02_Modules/Campaigns/30_Business_Rules.md` + ADR-008 (`docs/04_Decisions/`): hapus referensi top-up reguler; catat bahwa `wallets.balance` UMKM terisi hanya via refund/sisa budget (rujuk T-02).

### Test Phase 1 (wajib)

**File:** `tests/integration/functions.test.ts`.

1. `create-payment` dengan `purpose: "topup"` → 400.
2. Jalur campaign tetap jalan: `create-payment` campaign → payment dibuat; `create-escrow` paid campaign → `remainingBudget` terkredit, `wallets.balance` TIDAK berubah.
3. Test lama `create-payment + create-escrow (campaign topup flow)` (baris 242-268) — tetap hijau (test ini memakai `purpose: campaign`).
4. Semua test lama hijau.

**Lapor & tunggu konfirmasi** sebelum Phase 2.

---

## PHASE 2 — T-01: Fee dari env + snapshot (kerjakan SETELAH konfirmasi)

### 1. Satu konstanta dari env

- `functions/create-payment/src/main.js`: hapus `PLATFORM_FEE_RATE = 0.02` (baris 13); di `getEnv()` tambah `feeRate = Number(process.env.FEE_RATE || 0.02)` (default 0.02 — aman sebelum env di-set); pakai `env.feeRate` di baris 87-88.
- `functions/release-escrow/src/main.js`: hapus konstanta (baris 18); `getEnv()` tambah `feeRate` (sama); fee dihitung dari **snapshot escrow** — lihat langkah 2.
- `functions/get-creator-negotiations/src/main.js:61`: ganti konstanta → `env.feeRate` (default sama).
- Klien (sinkronisasi display, bukan pengaman): `src/types/domain.ts:117` → `export const PLATFORM_FEE_RATE = Number(process.env.NEXT_PUBLIC_FEE_RATE || 0.02)`; `src/services/wallet.service.ts:6` baca dari domain.ts (hapus duplikat). JANGAN rombak file klien lain.

### 2. Snapshot `fee_rate` ke escrow

- Skema: `escrows` tambah `fee_rate` (double, optional, min 0 — kolom snapshot). Edit `appwrite/generate_appwrite_json.cjs` DAN `appwrite.config.json` MANUAL (jangan regenerate — drift schedule di luar scope). Docs: `Payments/50_Database.md`.
- `functions/create-escrow/src/main.js` baris 25-30: saat create escrow, simpan `fee_rate: env.feeRate` (snapshot rate saat transaksi dibuat).
- `functions/release-escrow/src/main.js` baris 56-58: `const rate = Number(escrow.fee_rate) || 0.02;` (fallback untuk escrow LAMA yang belum punya snapshot) → `feeAmount = Math.floor(escrowAmount × rate)`. Order lama tetap 2% setelah flip — ini kuncinya.
- `payments.fee_amount` SUDAH disimpan saat create-payment (baris 87-88 pakai `env.feeRate`) — snapshot payment sudah benar, tidak perlu ubah.
- `get-creator-negotiations`: tampilan fee pakai `env.feeRate` (display global) — snapshot per-escrow untuk nilai final ditampilkan dari escrow kalau tersedia; kalau tidak, env. Dokumentasikan pilihanmu.

### 3. Cron `fee-rate-flip` (pemicu 1.000 transaksi)

Function baru, schedule `"0 0 * * *"` (harian — pola `expire-stale-claims`), `execute: []`, scopes `documents.read` + `documents.write` (generator + config + `appwrite/function-scopes.json` — tiga tempat sinkron).

- Hitung `transactions` dengan `status = "completed"` (count; pakai pagination cursor).
- Kalau count ≥ 1000: kirim **notifikasi admin/platform** (tidak ada role admin di sistem — tulis ke `notifications` user platform atau `log` + `ai_requests`? Pilih: log + notifikasi ke user list env `ADMIN_NOTIFY_USER_ID` kalau di-set; JANGAN buat tabel baru) berisi: "Transaksi ≥ 1.000 — set FEE_RATE=0.05 di Console Appwrite". Function TIDAK bisa mengubah env — flip dilakukan manual via Console (dokumentasikan).
- Guard: jangan spam — simpan penanda di env? Tidak bisa. Solusi: log function; idempotensi per hari tidak penting (notifikasi ke admin = log). Dokumentasikan bahwa flag flip tercatat di log + docs.
- Response: `{ count, thresholdReached, rate: process.env.FEE_RATE || 0.02 }`.

### 4. Test Phase 2 (wajib)

1. `create-payment` dengan `process.env.FEE_RATE = "0.05"` → `fee_amount = floor(amount × 0.05)`.
2. **Snapshot:** escrow `fee_rate: 0.02` (lama) + `process.env.FEE_RATE = "0.05"` → `release-escrow` potong 2% (dari escrow), BUKAN 5%; escrow baru `fee_rate: 0.05` → 5%.
3. Escrow tanpa `fee_rate` (fallback) → 2% (`|| 0.02`).
4. `fee-rate-flip` dengan 999 completed → tidak reach; 1.000 → reach + log/notifikasi.
5. Semua test lama tetap hijau (perhatikan: test `release-escrow` lama seed escrow TANPA `fee_rate` → fallback 2% → asersi `wallet.balance = 100000` tetap berlaku — verifikasi).

---

## CONSTRAINT — jangan lakukan ini

- JANGAN ubah rumus reward, `create-payment` jalur campaign/order (selain fee), `review-submission`, `calculate-campaign-reward`.
- JANGAN sentuh `request-withdrawal` / `withdrawals` / `appeals`.
- JANGAN buat mekanisme flip otomatis yang menulis env — function tidak bisa; flip = Console (dokumentasikan).
- JANGAN update/delete entry ledger lama (T-17).
- JANGAN jalankan `node appwrite/generate_appwrite_json.cjs` — edit manual (drift schedule di luar scope; LAPORKAN kalau terlanjur ter-regen).
- JANGAN upgrade node-appwrite SDK.
- JANGAN commit sebelum test hijau. Satu commit per phase, pesan jelas (pola: `feat(create-payment): ...`).
- JANGAN ubah console Appwrite di luar MCP; validasi LIVE via MCP sebelum menyatakan selesai.
- JANGAN lanjut Phase 2 tanpa konfirmasi eksplisit saya.

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

Setelah Phase 1:
1. `PHASE 1 — file:line` dihapus/diubah (create-payment, create-escrow, services) + pola.
2. Test Phase 1 + hasil run (tempel output).
3. Berhenti. Tunggu konfirmasi.

Setelah Phase 2:
4. `PHASE 2 — file:line` diubah + konfirmasi `fee-rate-flip` terdaftar di tiga tempat sinkron.
5. Test Phase 2 + hasil run (tempel output).
6. Catatan: nilai `FEE_RATE` env yang HARUS di-set di Console Appwrite (2% launch) + prosedur flip ke 5%.
7. Catatan risiko yang tersisa.
8. Berhenti.

---

## DEFINISI SELESAI

Phase 1:
- [ ] `topup` tak bisa dibuat (400); jalur campaign utuh; `wallets.balance` UMKM tidak terisi via payment.
- [ ] `'deposit'`/`'topup'` bersih dari services + docs.

Phase 2:
- [ ] Satu konstanta dari env (`FEE_RATE`, default 0.02) di 3 function + klien sinkron.
- [ ] `escrows.fee_rate` snapshot saat create; release memakai snapshot (fallback 0.02 untuk escrow lama).
- [ ] `fee-rate-flip` menghitung ≥ 1.000 completed + notifikasi flip manual.
- [ ] Test: rate baru tidak menyentuh escrow lama; test lama hijau.
- [ ] Validasi live console via MCP: function + database sinkron repo (bukti di LAPORAN).
- [ ] Laporan terkirim; tidak ada pekerjaan di luar scope.
