# Prompt — Metadata Konten: Kreditasi Kreator (T-12) & Penanda AI (T-13)

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan fase dan constraint di dalamnya saling terkait.
>
> **Target repo:** `00_BACKEND/` (Appwrite Functions).
> **Tanggal:** 2026-08-02

---

## PERAN

Kamu adalah backend engineer senior di repo `00_BACKEND/`. Tugasmu: tambahkan metadata konten murni — **kreditasi kreator** (T-12) dan **penanda AI** (T-13) — pada `campaign_submissions` dan `deliverables`, plus sinkronisasi skema & dokumentasi. Setelah selesai, berhenti dan melapor.

Aturan kerja repo berlaku. Baca dulu `00_BACKEND/AGENTS.md`. Dokumentasi adalah sumber kebenaran: sebelum menyentuh kode, baca `docs/02_Modules/Campaigns/50_Database.md`, `docs/02_Modules/Campaigns/70_Backend.md`, dan `docs/02_Modules/Orders/50_Database.md`.

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

Dua jalur konten:

1. **Campaign PPV** — kreator submit bukti kerja → baris `campaign_submissions` (dibuat klien lewat `create("users")`, kolom wajib: `claimId`, `campaignId`, `creatorId`, `platform`, `postUrl`, `views`, `status`). Review UMKM lewat function `review-submission`.
2. **Rate Card (escrow)** — kreator kirim deliverable → baris `deliverables` (dibuat klien lewat `order.service.ts`, kolom: `orderId`, `source`, `fileUrl`, `version`, `status`). Approve memicu `release-escrow`.

Kedua task ini MURNI metadata transparansi — TIDAK ada guard, TIDAK ada validasi yang memblokir, TIDAK ada perubahan alur uang. Field hanya disimpan dan didokumentasikan.

Titik peralihan kepemilikan konten dari kreator ke UMKM = **saat escrow dirilis** (`release-escrow`), bukan saat deliverable dikirim.

---

## KONTEKS TUGAS TERKAIT — BACA FILE INI DULU

Roadmap resmi: `terms & conditions/roadmap/tasks-backend-alignment-tnc.md`. Baca SEBELUM mulai.

| Task di roadmap | Singgungan | Aturan buat kamu |
|---|---|---|
| **T-04** (views tracking) | Field `views_*` di `campaign_submissions` — koleksi SAMA | JANGAN sentuh `views_count`/`views_final`/`views_source`/`views_captured_at`. Itu jadwal T-04 (prompt terpisah). |
| **T-16** (claim atomik) | `campaign_claims` — tidak tersentuh | Di luar scope. |
| **T-03** (suspend akun) | `users.status` — tidak tersentuh | Di luar scope. JANGAN tambah guard apa pun ke metadata. |
| **Fix A/B prompt wallet** (`prompt-perbaikan-wallet-reward.md`) | `calculate-campaign-reward`, `request-withdrawal` | Di luar scope. JANGAN sentuh kedua file ini. |
| **T-05** (auto-approve) | `deliverables` — koleksi SAMA, field BEDA | Field `creatorCredit`/`aiGenerated` tidak bertabrakan dengan `review_deadline_at`/`auto_approved` (itu di `orders`). Aman. |

**Kesimpulan:** kamu hanya menambah kolom + dokumentasi. Tidak ada function yang berubah perilakunya.

---

## PHASE — WAJIB

### 1. Skema — tambah kolom (dua sumber: generator + config)

**File:** `appwrite/generate_appwrite_json.cjs` (sumber kebenaran) DAN `appwrite.config.json` (artifact — edit MANUAL, jangan regenerate; regen memunculkan drift schedule yang tidak terkait, LAPORKAN kalau terlanjur).

- `campaign_submissions` (di generator: `createStringAttr`/`createBoolAttr` di objek `campaign_submissions`):
  - `creatorCredit` — string, optional, size 255 (username TikTok kreator)
  - `aiGenerated` — boolean, optional, default null
  - `aiDisclosed` — boolean, optional, default null
- `deliverables`:
  - `creatorCredit` — string, optional, size 255
  - `aiGenerated` — boolean, optional, default null

**Kriteria lolos:** config dan generator identik untuk kolom baru; `"default": null` untuk boolean (bukan false — tri-state: belum diisi ≠ tidak AI).

### 2. Cek fungsi yang menulis kedua koleksi

**File:** `functions/review-submission/src/main.js`, `functions/ai-fraud-precheck/src/main.js`, `functions/notify-order-activity/src/main.js`, `functions/calculate-campaign-reward/src/main.js`.

- Verifikasi tidak ada function yang menulis `campaign_submissions`/`deliverables` dan HARUS ikut menulis field baru (updateDocument dengan objek lengkap bisa menimpa field yang tidak disebut — cek `updateDocument` mana pun di koleksi ini).
- Kalau ada `updateDocument` yang menimpa: tambahkan field metadata ke update tersebut (nilai yang sudah ada, jangan reset ke null).
- **JANGAN** ubah `review-submission` selain penjagaan di atas — logika views/reward TIDAK di sini.

### 3. Dokumentasi

- `docs/02_Modules/Campaigns/50_Database.md`: kolom baru `campaign_submissions` + penjelasan `creatorCredit` (username TikTok, format kreditasi Pasal 16.3 T&C), `aiGenerated`/`aiDisclosed` (opsional, tanpa sanksi — Pasal 12.5).
- `docs/02_Modules/Orders/50_Database.md`: kolom baru `deliverables` + **dokumentasikan titik peralihan kepemilikan konten = release escrow** (mandat T-12).
- `docs/02_Modules/Campaigns/70_Backend.md` atau `Orders/70_Backend.md`: catatan bahwa metadata diisi klien saat submit; tidak ada validasi server.

### Test

**File:** `tests/integration/functions.test.ts`.

Tidak ada function yang berubah perilaku → test baru TIDAK wajib. Yang wajib: **semua test lama tetap hijau** (`npm run test:integration`).

---

## CONSTRAINT — jangan lakukan ini

- JANGAN tambah guard/validasi/memblokir alur apa pun — field murni metadata.
- JANGAN sentuh `views_*`, `orders`, `users`, `appeals`, `withdrawals` — jadwal task lain.
- JANGAN ubah `review-submission`/`calculate-campaign-reward`/`release-escrow`/`request-withdrawal` (kecuali penjagaan updateDocument di PHASE 2).
- JANGAN jalankan `node appwrite/generate_appwrite_json.cjs` — edit kedua file manual supaya diff bersih (ada drift schedule `expire-stale-claims` antara generator dan config yang BUKAN scope kamu; kalau terlanjur ter-regen, LAPORKAN).
- JANGAN buat collection/field database lain.
- JANGAN upgrade node-appwrite SDK (`^14.1.0` disengaja).
- JANGAN commit sebelum semua test hijau. Satu commit, pesan jelas (pola repo: `feat(campaign_submissions): ...`).
- JANGAN ubah console Appwrite di luar MCP; validasi LIVE via MCP sebelum menyatakan selesai.
- JANGAN lanjut ke task roadmap lain setelah selesai — berhenti dan laporkan.

---

## VERIFIKASI

```bash
cd 00_BACKEND
npm run test:integration   # wajib hijau
npm test                   # full suite
```

Setelah itu periksa `git diff` sendiri — pastikan hanya kolom metadata + docs yang berubah.

---

## LAPORAN (format output)

1. `file:line` kolom baru di config + generator.
2. Function (kalau ada) yang perlu penjagaan `updateDocument` — `file:line` + tindakan.
3. File docs yang diubah + ringkasan.
4. Hasil run test (tempel output).
5. Catatan risiko yang tersisa (kalau ada).
6. Berhenti.

---

## DEFINISI SELESAI

- [ ] `campaign_submissions` + `deliverables` punya `creatorCredit`, `aiGenerated` (+ `aiDisclosed` di submissions) di config DAN generator — identik.
- [ ] Tidak ada `updateDocument` di fungsi yang menimpa field metadata.
- [ ] Docs: kolom baru + titik peralihan kepemilikan (release escrow) terdokumentasi.
- [ ] Test lama hijau.
- [ ] Validasi live console via MCP: function + database sinkron repo (bukti di LAPORAN).
- [ ] Laporan terkirim, tidak ada pekerjaan di luar scope.
