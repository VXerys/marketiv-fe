# Prompt — Auto-Approve Review Rate Card (T-05)

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan fase dan constraint di dalamnya saling terkait.
>
> **Target repo:** `00_BACKEND/` (Appwrite Functions).
> **Tanggal:** 2026-08-02

---

## PERAN

Kamu adalah backend engineer senior di repo `00_BACKEND/`. Tugasmu: implementasikan **auto-approve review Rate Card** (T-05, Pasal 7.2.e-f T&C) — tenggat review 3 hari kalender, auto-approve + release escrow, reminder H-1, dan definisi "satu revisi". Selesai lalu berhenti dan melapor.

Aturan kerja repo berlaku. Baca dulu `00_BACKEND/AGENTS.md`. Dokumentasi adalah sumber kebenaran: baca `docs/02_Modules/Orders/70_Backend.md`, `docs/02_Modules/Orders/50_Database.md`, `docs/02_Modules/Orders/30_Business_Rules.md`, `docs/02_Modules/Orders/90_Events.md`.

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

- **Alur Rate Card:** offer `accepted` → `create-order` (event, status `pending_payment`) → bayar → `create-escrow` (order `in_progress`) → kreator kirim deliverable (`deliverables`, `version` mulai 1, status dikirim — nilai status baca dari `Orders/70_Backend.md`) → UMKM approve → **`release-escrow`** (event `deliverables.rows.*.update` saat status jadi `approved`): flip escrow `released` dulu, kredit wallet kreator, order `completed`.
- **Pola cron yang sudah ada:** `expire-stale-claims` (`0 * * * *`) — pagination cursor (bukan offset — set dipakai berubah), baca dokumen, mutasi atomik.
- **Keputusan locked:** review **3 hari kalender** sejak deliverable dikirim; lewat tanpa aksi → auto-approve + escrow rilis. **1 permintaan revisi = 1 revisi** (berapa pun butirnya, wajib sekaligus). Reminder H-1 (email + notifikasi dashboard, `reminder_sent_at` anti-dobel). Timer **reset** tiap kirim ulang deliverable. Timer **pause** saat sengketa (Pasal 14).

**Prinsip kunci:** JANGAN duplikasi logika release. Auto-approve cukup mengubah status deliverable menjadi `approved` — event `deliverables.rows.*.update` akan memicu `release-escrow` yang SUDAH ADA. Satu jalur release.

---

## KONTEKS TUGAS TERKAIT — BACA FILE INI DULU

Roadmap resmi: `terms & conditions/roadmap/tasks-backend-alignment-tnc.md`. Baca SEBELUM mulai.

| Task di roadmap | Singgungan | Aturan buat kamu |
|---|---|---|
| **T-12/T-13** (metadata deliverables) | Field di `deliverables` | JANGAN sentuh `creatorCredit`/`aiGenerated`. |
| **T-02** (refund) | Order `cancelled` | JANGAN refund otomatis dari cron kamu — jalur terpisah. |
| **T-03** (suspend) | Sengketa (dispute) | Pause timer saat sengketa = kalau order berstatus dispute → SKIP auto-approve. JANGAN bangun mekanisme dispute di sini. |
| **T-11** (work_started_at) | `orders` | JANGAN tambahkan `work_started_at` — jadwal T-11. |
| **T-01** (fee) | `release-escrow` | JANGAN sentuh — release dipicu event, bukan dipanggil kamu. |
| **T-16** (claim atomik) | — | Di luar scope. |

---

## PHASE — WAJIB

### 1. Skema

**File:** `appwrite/generate_appwrite_json.cjs` DAN `appwrite.config.json` (edit MANUAL keduanya, jangan regenerate — drift schedule di luar scope).

`orders` tambah:

- `review_deadline_at` (datetime, optional)
- `auto_approved` (boolean, optional, default `false`)
- `revision_count` (integer, optional, default 0, min 0)
- `revision_limit` (integer, optional, default 0, min 0 — snapshot dari offer/rate card package)
- `reminder_sent_at` (datetime, optional)

**Docs:** `docs/02_Modules/Orders/50_Database.md`.

### 2. Function `track-order-review` (event: deliverable dikirim → set tenggat + revisi)

Function baru, event-driven (pola `notify-order-activity` — event `databases.6a4c8598001da3b0d7f0.tables.deliverables.rows.*.create`), `execute: []`, scopes `documents.read` + `documents.write` (generator + config + `appwrite/function-scopes.json` — tiga tempat sinkron, AGENTS.md).

- Payload = baris deliverable (`orderId`, `version`, `status`).
- Load order; kalau status order ∉ {`in_progress`, `revision`} → `{ status: "ignored" }` (order selesai/dibatalkan).
- **Timer reset:** set `order.review_deadline_at = now + 3 hari kalender` (3 × 24 × 60 × 60 × 1000 — "hari" = hari kalender, T-07).
- **Revisi:** `revision_count = max(existing, deliverable.version - 1)` — kirim ulang versi 2 = 1 revisi. Kalau `version === 1` dan `revision_count` kosong → biarkan 0.
- `revision_limit`: kalau kosong, snapshot dari sumber (offer via `order.offerId` → `revisionLimit`, atau `rate_card_packages` via `order.packageId`) — baca `Orders/70_Backend.md` untuk sumber yang benar; kalau tidak tersedia, biarkan 0 dan dokumentasikan.
- Idempoten: event ulang (payload sama) → hitung ulang deadline dari SEKARANG akan salah. Gunakan guard: kalau `review_deadline_at` sudah ada DAN `deliverable.version` <= versi yang sudah dihitung — simpan versi terakhir yang dihitung di order? Sederhananya: hitung dari `deliverable.createdAt` (waktu event asli) + 3 hari, bukan `now` — dengan begitu event ulang menghasilkan deadline sama (createdAt sama). **Gunakan `createdAt` payload, bukan `now`.** Dokumentasikan pilihan ini.

### 3. Function cron `auto-approve-orders`

Function baru, cron schedule `"0 * * * *"` (pola `expire-stale-claims`), `execute: []`, scopes `documents.read` + `documents.write`.

Satu lintasan:

1. **Auto-approve:** scan `deliverables` dengan status = status "terkirim menunggu review" (baca nilai persisnya dari `Orders/70_Backend.md` — misal `submitted`/`delivered`), pagination cursor (pola `expire-stale-claims:21-93`):
   - Load order terkait. SKIP kalau: order status ∉ {`in_progress`, `revision`}; order status = `dispute`/sengketa (PAUSE timer); deliverable sudah `approved` (idempoten).
   - `review_deadline_at` kosong → isi dari `deliverable.createdAt + 3 hari` (backfill), skip lintasan ini.
   - `now >= review_deadline_at` → **`updateDocument` deliverable → `status: "approved"`** (INi memicu event `release-escrow` — JANGAN panggil release langsung) + set `order.auto_approved = true`.
   - Notifikasi ke kedua pihak (deterministic id, `kind: "auto_approved"`): "Tenggat review lewat — hasil kerja disetujui otomatis".
   - Kalau `updateDocument` deliverable gagal 404 (sudah diubah) → skip, log.
2. **Reminder H-1:** scan `orders` (query `review_deadline_at` antara now dan now+24 jam, `reminder_sent_at` kosong, status ∈ {`in_progress`, `revision`}, bukan dispute):
   - Notifikasi UMKM (deterministic, `kind: "review_reminder"`) + set `reminder_sent_at = now` (anti-dobel — guard: kalau sudah terisi, skip).
3. Log ringkasan: `{ autoApproved: n, reminded: m }`.

**Idempoten:** cron jalan dua kali bersamaan → deliverable `approved` sudah tidak masuk filter; reminder tercegah `reminder_sent_at`.

### 4. Definisi "satu revisi" — dokumentasi

- `docs/02_Modules/Orders/30_Business_Rules.md`: **1 permintaan revisi = 1 revisi** — UMKM wajib mengirim SEMUA butir revisi dalam satu permintaan (berapa pun jumlahnya); permintaan baru setelah kreator kirim ulang = revisi berikutnya; `revision_count` naik per kirim ulang, bukan per butir. Timer reset setiap kirim ulang.
- `docs/02_Modules/Orders/70_Backend.md`: `track-order-review` + `auto-approve-orders` (payload, idempotensi, relasi ke `release-escrow`).
- `docs/02_Modules/Orders/90_Events.md`: event baru deliverables create → `track-order-review`.

### Test (wajib ditambahkan)

**File:** `tests/integration/functions.test.ts`.

1. **e2e:** deliverable dibuat (createdAt 4 hari lalu) + order `in_progress` + `review_deadline_at` lewat → panggil cron → deliverable `approved`, `order.auto_approved = true`; lalu panggil `release-escrow` manual dengan payload deliverable tersebut (simulasi event) → escrow `released`, wallet kreator bertambah, order `completed`.
2. **Idempoten:** cron dua kali → deliverable approve SEKALI (tidak ada kredit ganda saat release).
3. **Timer reset:** `track-order-review` dengan deliverable `version: 2` → `revision_count = 1`, deadline = createdAt + 3 hari; event ulang payload sama → deadline SAMA (tidak bergeser).
4. **Reminder:** order deadline dalam 24 jam + `reminder_sent_at` kosong → cron → notifikasi + `reminder_sent_at` terisi; cron kedua → tidak dobel.
5. **Pause dispute:** order status `dispute` → cron skip (tidak approve, tidak reminder).
6. Semua test lama tetap hijau.

---

## CONSTRAINT — jangan lakukan ini

- JANGAN panggil `release-escrow` langsung dari cron — WAJIB lewat event `deliverables.rows.*.update` (satu jalur release).
- JANGAN ubah `release-escrow`, `expire-stale-claims`, `notify-order-activity`.
- JANGAN implementasikan mekanisme dispute — hanya SKIP saat status dispute (pause).
- JANGAN sentuh `work_started_at` (T-11), `refund` (T-02), metadata deliverables (T-12/13).
- JANGAN kirim reminder berulang — `reminder_sent_at` wajib.
- JANGAN jalankan `node appwrite/generate_appwrite_json.cjs` — edit manual (drift schedule di luar scope; LAPORKAN kalau terlanjur ter-regen).
- JANGAN upgrade node-appwrite SDK.
- JANGAN commit sebelum test hijau. Satu commit per function (pola: `feat(auto-approve-orders): ...`).
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

1. `file:line` diubah + dua function baru (konfirmasi tiga tempat sinkron: generator/config/scopes).
2. Nilai status deliverable "terkirim" yang kamu pakai + sumber (docs) — dan status `dispute` yang kamu cek.
3. Keputusan: deadline dari `createdAt` (bukan now) + alasannya.
4. Daftar test baru + hasil run (tempel output).
5. Catatan risiko yang tersisa (mis. revisi vs revision_limit).
6. Berhenti.

---

## DEFINISI SELESAI

- [ ] `orders` + 5 kolom di config + generator.
- [ ] `track-order-review`: set deadline (createdAt + 3 hari), `revision_count` dari version, idempoten.
- [ ] `auto-approve-orders`: auto-approve via event release (bukan panggil langsung), reminder H-1 sekali, pause dispute, idempoten.
- [ ] "1 permintaan revisi = 1 revisi" terdokumentasi di Orders/30_Business_Rules.md.
- [ ] Test baru + test lama hijau.
- [ ] Validasi live console via MCP: function + database sinkron repo (bukti di LAPORAN).
- [ ] Laporan terkirim, tidak ada pekerjaan di luar scope.
