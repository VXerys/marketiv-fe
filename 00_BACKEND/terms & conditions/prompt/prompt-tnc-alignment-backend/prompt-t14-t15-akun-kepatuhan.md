# Prompt — Kepatuhan Akun: Versi T&C (T-14) & Verifikasi Email (T-15)

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan fase dan constraint di dalamnya saling terkait.
>
> **Target repo:** `00_BACKEND/` (Appwrite Functions).
> **Tanggal:** 2026-08-02

---

## PERAN

Kamu adalah backend engineer senior di repo `00_BACKEND/`. Tugasmu DUA task kepatuhan yang menyentuh tabel `users` dan aksi finansial:

- **T-14** — versi T&C per pengguna (`tos_version`, `tos_accepted_at`) + guard di aksi finansial.
- **T-15** — verifikasi email (`email_verified_at`) + gate withdrawal pertama.

Selesaikan kedua phase, lalu berhenti dan melapor. JANGAN lanjut ke task lain.

Aturan kerja repo berlaku. Baca dulu `00_BACKEND/AGENTS.md`. Dokumentasi adalah sumber kebenaran: baca `docs/02_Modules/Users/50_Database.md`, `docs/02_Modules/Users/70_Backend.md`, `docs/02_Modules/Payments/70_Backend.md`, dan `docs/02_Modules/Orders/70_Backend.md`.

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

- Tabel `users`: `$permissions: []` + rowSecurity; baris dibuat `create-user-profile` (event `users.*.create`), `$id` baris TIDAK sama dengan id akun Auth — semua lookup lewat `Query.equal("userId", ...)` (pola `request-withdrawal:269-275`). Kolom sekarang: `userId`, `role`, `status`, `email`, `phone`, `createdAt`.
- Registrasi = event Appwrite Auth `users.*.create` → `create-user-profile`. Verifikasi email = fitur native Appwrite Auth; saat email diverifikasi, Auth account ter-update → event `users.*.update` (payload berisi `emailVerification: true`).
- Aksi finansial yang jadi titik cek: **withdrawal** (`request-withdrawal`, execute users), **order** (`create-order`, event-driven dari offer), **claim** (klien — keterbatasan, lihat tabel T-16).
- Versi T&C aktif: env `CURRENT_TOS_VERSION`, default `"v3.1"` (format string konsisten — keputusan locked).

---

## KONTEKS TUGAS TERKAIT — BACA FILE INI DULU

Roadmap resmi: `terms & conditions/roadmap/tasks-backend-alignment-tnc.md`. Baca SEBELUM mulai.

| Task di roadmap | Singgungan | Aturan buat kamu |
|---|---|---|
| **T-06** (withdrawal 4-state + Iris) | Akan MENULIS ULANG `request-withdrawal` — file SAMA | Urutan eksekusi: T-15 selesai DULU, lalu T-06. Guard email yang kamu pasang WAJIB dipertahankan T-06. Kalau `request-withdrawal` sudah diubah T-06 (terlihat dari status `requested`/Iris): sesuaikan — guard email tetap di awal handler, SEBELUM debit. |
| **T-03** (suspend akun) | Guard lain di `request-withdrawal` | JANGAN implementasikan guard suspend — jadwal T-03 (setelah T-06). |
| **T-16** (claim atomik) | Guard TOS di "claim" | Claim dibuat KLIEN (`claim.service.ts`) — tidak bisa di-guard server di prompt ini. LAPORKAN keterbatasan; guard claim masuk T-16 (function `claim-campaign`). |
| **Fix B prompt wallet** | `request-withdrawal` debit | JANGAN ubah mekanisme debit (Fix B). Guard kamu hanya TAMBAHAN di awal handler. |
| **T-19** (hapus topup) | `create-payment` | Di luar scope. JANGAN sentuh. |

---

## PHASE 1 — T-14: Versi T&C per pengguna

### 1. Skema

**File:** `appwrite/generate_appwrite_json.cjs` DAN `appwrite.config.json` (edit MANUAL keduanya, jangan regenerate — drift schedule di luar scope).

- `users` tambah: `tos_version` (string, optional, size 20), `tos_accepted_at` (datetime, optional).

**Docs:** `docs/02_Modules/Users/50_Database.md`.

### 2. Simpan saat registrasi

**File:** `functions/create-user-profile/src/main.js`.

- Terima `tos_version` dari payload (validasi: harus cocok `CURRENT_TOS_VERSION` dari env, default `"v3.1"`).
- Simpan `tos_version` + `tos_accepted_at = now` saat registrasi (kalau payload menyatakan setuju).
- Kalau payload tidak ada: jangan gagalkan registrasi — simpan kosong, user diarahkan re-consent via interstitial.

### 3. Function `accept-tos` (konsen ulang)

Function baru, pola persis function execute-users yang ada (`review-submission/src/main.js` sebagai referensi struktur):

- `execute: ["users"]`, scopes `documents.read` + `documents.write` (tambah ke `appwrite/function-scopes.json` + generator + config — tiga tempat wajib sinkron, lihat AGENTS.md).
- Validasi `tos_version` payload == env `CURRENT_TOS_VERSION` (default `"v3.1"`); salah → 400.
- `updateDocument` baris `users` (lookup `Query.equal("userId", userId)`): set `tos_version`, `tos_accepted_at = now`.
- Idempoten: versi sama sudah tersimpan → 200 tanpa update ulang.
- Permission baris: file ini memakai API key — baris `users` dibaca via query; tidak perlu permission tambahan.

### 4. Guard TOS di aksi finansial

**File:** `functions/request-withdrawal/src/main.js` dan `functions/create-order/src/main.js`.

- `request-withdrawal`: setelah guard role (baris 40-44), baca baris `users` user; kalau `tos_version !== CURRENT_TOS_VERSION` → 403 `"Setujui T&C terbaru terlebih dahulu."`.
- `create-order` (event `offers.rows.*.update`): payload offer punya `umkmId` + `creatorId`; kalau salah satu belum setuju T&C terbaru → return `{ status: "ignored", reason: "tos not accepted" }` + notifikasi user yang belum setuju (pola `notify()` deterministic — salin dari file lain). JANGAN buat order.

**Docs:** `docs/02_Modules/Users/30_Business_Rules.md` (interstitial re-consent saat versi berubah), `docs/02_Modules/Users/70_Backend.md` (guard + `accept-tos`).

---

## PHASE 2 — T-15: Verifikasi email sebelum withdrawal pertama

### 1. Skema

- `users` tambah: `email_verified_at` (datetime, optional). Sinkron config + generator + `Users/50_Database.md`.

### 2. Function `user-email-verified` (sinkronisasi status Auth)

Function baru, event-driven (pola `campaign-published`):

- Event: `users.*.update` (event Auth Appwrite), `execute: []`, scopes `documents.read` + `documents.write` (tiga tempat sinkron).
- Payload = akun Auth: kalau `emailVerification === true` dan `email_verified_at` belum terisi → lookup baris `users` by `Query.equal("userId", payload.$id)` → set `email_verified_at = now`.
- Idempoten: sudah terisi → skip.

### 3. Gate withdrawal pertama

**File:** `functions/request-withdrawal/src/main.js` (bersamaan dengan guard TOS di Phase 1 — satu sesi, satu commit).

- Gate HANYA untuk withdrawal PERTAMA: query `withdrawals` user (limit 1, status != `failed`); kalau TIDAK ada riwayat DAN `users.email_verified_at` kosong → 403 `"Verifikasi email sebelum penarikan pertama."` (arahkan ke alur verifikasi Appwrite Auth).
- Kalau sudah ada withdrawal sukses → lewati cek.
- JANGAN ubah guard duplicate, id deterministik `requestKey`, atau debit (Fix B).

**Docs:** `docs/02_Modules/Payments/30_Business_Rules.md` (gate withdrawal pertama, Pasal 5.1.e/5.3.c), `Users/70_Backend.md`.

### Test (wajib ditambahkan)

**File:** `tests/integration/functions.test.ts` (pola test yang ada, seed `users` + `wallets`).

1. `request-withdrawal`: user tanpa `email_verified_at` dan tanpa riwayat withdrawal → 403. Dengan `email_verified_at` → lolos guard (lanjut alur; saldo 0 → error saldo, itu valid).
2. `user-email-verified`: event payload `emailVerification: true` → `users.email_verified_at` terisi; event ulang → tidak mengubah.
3. `accept-tos`: versi salah → 400; versi benar → `tos_version` + `tos_accepted_at` tersimpan.
4. `request-withdrawal` user `tos_version` lama → 403.
5. `create-order`: offer dengan salah satu pihak `tos_version` lama → tidak membuat order.
6. Semua test lama tetap hijau.

---

## CONSTRAINT — jangan lakukan ini

- JANGAN ubah mekanisme debit/ledger/rollback `request-withdrawal` (Fix B + T-17 menjaga itu).
- JANGAN implementasikan guard suspend (`users.status`) — jadwal T-03.
- JANGAN sentuh `create-payment`, `create-escrow`, `release-escrow`, `calculate-campaign-reward`.
- JANGAN buat collection baru.
- JANGAN jalankan `node appwrite/generate_appwrite_json.cjs` — edit manual (drift schedule di luar scope; LAPORKAN kalau terlanjur ter-regen).
- JANGAN ubah format versi (wajib string `v3.1` — jangan jadi angka).
- JANGAN upgrade node-appwrite SDK.
- JANGAN commit sebelum test hijau. Satu commit per phase, pesan jelas (pola: `feat(users): ...`).
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

1. `PHASE 1 — file:line` diubah (skema, `create-user-profile`, `accept-tos`, guard TOS) + pola dipakai.
2. `PHASE 2 — file:line` diubah (skema, `user-email-verified`, gate withdrawal) + pola dipakai.
3. Daftar test baru + hasil run (tempel output).
4. Catatan: fungsi baru terdaftar di generator + config + function-scopes.json — konfirmasi.
5. Catatan risiko yang tersisa (termasuk: guard claim ditunda ke T-16).
6. Berhenti.

---

## DEFINISI SELESAI

- [ ] `users` punya `tos_version`, `tos_accepted_at`, `email_verified_at` di config + generator.
- [ ] Registrasi menyimpan versi T&C; `accept-tos` berfungsi untuk re-consent.
- [ ] `request-withdrawal` memblokir: TOS lama, dan email belum diverifikasi (hanya withdrawal pertama).
- [ ] `create-order` tidak membuat order bila salah satu pihak belum setuju T&C.
- [ ] `user-email-verified` sinkronisasi email verified dari Auth.
- [ ] Test baru + test lama hijau.
- [ ] Validasi live console via MCP: function + database sinkron repo (bukti di LAPORAN).
- [ ] Laporan terkirim, tidak ada pekerjaan di luar scope.
