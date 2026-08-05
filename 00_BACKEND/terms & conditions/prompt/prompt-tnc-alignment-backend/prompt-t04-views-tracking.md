# Prompt — Views Tracking: Angka Final Terkunci (T-04)

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan fase dan constraint di dalamnya saling terkait.
>
> **Target repo:** `00_BACKEND/` (Appwrite Functions).
> **Tanggal:** 2026-08-02

---

## PERAN

Kamu adalah backend engineer senior di repo `00_BACKEND/`. Tugasmu: implementasikan **jejak views yang terkunci** (T-04) — `views_count`, `views_captured_at`, `views_source`, `views_final` — di `campaign_submissions`, sehingga reward campaign dihitung dari angka final yang tidak bisa berubah pasca-approve. Selesai lalu berhenti dan melapor.

Aturan kerja repo berlaku. Baca dulu `00_BACKEND/AGENTS.md`. Dokumentasi adalah sumber kebenaran: baca `docs/02_Modules/Campaigns/50_Database.md`, `docs/02_Modules/Campaigns/70_Backend.md`, dan `docs/02_Modules/Campaigns/30_Business_Rules.md`.

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

Alur reward campaign (Alur A):

1. Kreator submit bukti → `campaign_submissions` (kolom `views` diisi kreator, belum tepercaya).
2. UMKM review via `review-submission` (execute users) → approve dengan angka views (validasi baris 46-48: `views` wajib integer ≥ 0 saat approve).
3. Update submission memicu event → `calculate-campaign-reward` menghitung `Math.floor(views/1000) × rewardPer1000Views`, cap `remainingBudget`, kredit `pendingBalance` kreator, ledger `release` idempoten.

Keputusan locked (T-04): MVP = verifikasi manual UMKM dengan jejak tercatat. API TikTok resmi DITUNDA (trigger: flip 1.000 transaksi). Scraping DITOLAK. Reward dihitung per 1.000 views; di bawah 1.000 = Rp0 (sudah benar via `Math.floor`).

**PERHATIAN — prompt wallet `prompt-perbaikan-wallet-reward.md` (Fix A) menyentuh file yang SAMA:** kalau belum dikerjakan, kerjakan dulu sebelum prompt ini (Fix A = idempotensi ledger di `calculate-campaign-reward`, TIDAK bertabrakan dengan field views). Kalau sudah dikerjakan, JANGAN sentuh dedup ledger-nya.

---

## KONTEKS TUGAS TERKAIT — BACA FILE INI DULU

Roadmap resmi: `terms & conditions/roadmap/tasks-backend-alignment-tnc.md`. Baca SEBELUM mulai.

| Task di roadmap | Singgungan | Aturan buat kamu |
|---|---|---|
| **Fix A (prompt wallet)** | `calculate-campaign-reward` — file SAMA | Ledger idempoten (id deterministik + 409) WAJIB dipertahankan utuh. Kamu hanya menyentuh baris pembacaan views. |
| **T-12/T-13** (kreditasi/AI) | Field metadata `campaign_submissions` | Kalau sudah ditambahkan: biarkan. Kalau belum: JANGAN tambahkan di prompt ini. |
| **T-01** (fee env) | `release-escrow`, `create-payment` | Di luar scope. |
| **T-06** (withdrawal) | `request-withdrawal` | Di luar scope. |
| **T-20** (audit trail) | `audit_logs` | Belum ada collection `audit_logs`. JANGAN buat. Catat raw sumber views di log function saja. |

---

## PHASE — WAJIB

### 1. Skema

**File:** `appwrite/generate_appwrite_json.cjs` DAN `appwrite.config.json` (edit MANUAL keduanya, jangan regenerate — drift schedule di luar scope).

`campaign_submissions` tambah:

- `views_count` — integer, optional, default null (min 0)
- `views_captured_at` — datetime, optional
- `views_source` — enum `["api", "scrape", "manual_admin"]`, optional, default null (format enum — pola `createEnumAttr` di generator; ukuran ikut elemen terpanjang)
- `views_final` — boolean, optional, default `false`

**Docs:** `docs/02_Modules/Campaigns/50_Database.md` (keempat field + makna `views_final`), `docs/02_Modules/Campaigns/30_Business_Rules.md` (views = verifikasi manual UMKM; API TikTok fase pertumbuhan; scraping dilarang).

### 2. `review-submission` — tulis jejak saat approve

**File:** `functions/review-submission/src/main.js`.

- Update yang sudah ada (baris 74-78) menulis `status` + `views` + `reviewNotes`. Tambahkan ke update yang SAMA:
  - `views_count: views` (nilai yang divalidasi)
  - `views_captured_at: now` (ISO)
  - `views_source: "manual_admin"`
  - `views_final: true` (hanya saat status `approved`)
- Saat `rejected`: `views_final` tetap `false`, jangan tulis jejak (views reject tidak dipakai reward).
- JANGAN ubah: validasi, pengecekan ownership via campaign induk (baris 64-72), sinkronisasi status claim, notifikasi.

### 3. `calculate-campaign-reward` — baca angka final

**File:** `functions/calculate-campaign-reward/src/main.js`.

- Baris 40: ganti `const views = Number(doc.views) || 0;` menjadi:
  - `const views = doc.views_final ? Number(doc.views_count) : Number(doc.views);` (fallback `|| 0` tetap).
- Efek: reward terkunci dari `views_count` final. Edit `views_count` pasca-approve memicu event ulang, tapi ledger idempoten (Fix A) menahan kredit ganda — reward tidak berubah. JANGAN ubah rumus, cap, urutan mutasi, atau dedup ledger.

### 4. Log sumber data

- Tambahkan `log()` di `review-submission` saat approve: `Views captured: source=manual_admin, views=<n>, submission=<id>` — jejak audit sederhana (collection `audit_logs` belum ada — jangan buat).

### Test (wajib ditambahkan)

**File:** `tests/integration/functions.test.ts` (pola test `calculate-campaign-reward function` yang ada — baris 219-240).

1. `calculateReward` dengan `views_final: true, views_count: 999` → `pendingBalance` TIDAK berubah (reward 0).
2. `views_final: true, views_count: 4850, rewardPer1000Views: 1000, remainingBudget: 50000` → reward `4 × 1000 = 4000` (floor 4, bukan 5).
3. `views_final: false` → memakai `doc.views` (perilaku lama).
4. `review-submission`: approve dengan views → keempat field terisi (`views_source=manual_admin`, `views_final=true`); reject → `views_final` tetap false.
5. Simulasi edit pasca-approve: panggil handler dua kali dengan payload berbeda tapi `views_final: true` → kredit hanya sekali (idempoten).
6. Semua test lama tetap hijau.

---

## CONSTRAINT — jangan lakukan ini

- JANGAN ubah rumus reward, `rewardPer1000Views`, cap `remainingBudget`, atau urutan mutasi (ledger → pendingBalance → budget).
- JANGAN sentuh dedup/idempotensi ledger (Fix A — prompt wallet).
- JANGAN implementasikan API TikTok atau scraping — ditunda/ditolak.
- JANGAN buat collection `audit_logs`.
- JANGAN sentuh `orders`, `deliverables`, `users`, `withdrawals`, `escrows`.
- JANGAN jalankan `node appwrite/generate_appwrite_json.cjs` — edit manual (drift schedule di luar scope; LAPORKAN kalau terlanjur ter-regen).
- JANGAN upgrade node-appwrite SDK.
- JANGAN commit sebelum test hijau. Satu commit, pesan jelas (pola: `feat(campaign_submissions): ...`).
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

1. `file:line` diubah (skema, `review-submission`, `calculate-campaign-reward`) + pola dipakai.
2. Daftar test baru + hasil run (tempel output).
3. Konfirmasi: dedup ledger Fix A tidak tersentuh.
4. Catatan risiko yang tersisa (kalau ada).
5. Berhenti.

---

## DEFINISI SELESAI

- [ ] Empat field views ada di config + generator (`views_source` enum `api|scrape|manual_admin`).
- [ ] Approve menulis `views_count`/`views_captured_at`/`views_source=manual_admin`/`views_final=true` dalam satu update.
- [ ] Reward dibaca dari `views_final ? views_count : views`.
- [ ] Test: 999 → Rp0; 4850 → 4×tarif; edit pasca-approve tidak mengubah reward; reject tidak mengunci.
- [ ] Test lama hijau.
- [ ] Validasi live console via MCP: function + database sinkron repo (bukti di LAPORAN).
- [ ] Laporan terkirim, tidak ada pekerjaan di luar scope.
