# Prompt — Status Akun: Suspend, Terminate & Banding (T-03)

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan fase dan constraint di dalamnya saling terkait.
>
> **Target repo:** `00_BACKEND/` (Appwrite Functions).
> **Tanggal:** 2026-08-02

---

## PERAN

Kamu adalah backend engineer senior di repo `00_BACKEND/`. Tugasmu: implementasikan **status akun `active | suspended | terminated` + mekanisme banding** (T-03, Pasal 18 T&C): koleksi `appeals`, empat function baru, guard di aksi finansial. Selesai lalu berhenti dan melapor.

**PENTING — urutan eksekusi:** prompt ini DITUJUKAN DIKERJAKAN PALING AKHIR, setelah `prompt-t06-withdrawal-iris.md` dan `prompt-t01-fee-t19-topup.md` (guard kamu menambah baris di function yang mereka tulis ulang). Kalau file target belum berubah sesuai prompt itu, KERJAKAN DULU prompt-prompt tersebut, atau LAPORKAN dan berhenti.

Aturan kerja repo berlaku. Baca dulu `00_BACKEND/AGENTS.md`. Dokumentasi adalah sumber kebenaran: baca `docs/02_Modules/Users/50_Database.md`, `docs/02_Modules/Users/70_Backend.md`, `docs/02_Modules/Users/30_Business_Rules.md`, `docs/02_Modules/Orders/30_Business_Rules.md`, `docs/02_Modules/Payments/70_Backend.md`.

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

- `users.status` SUDAH ada (string, required, size 50) — sekarang dipakai untuk hal lain? Periksa `create-user-profile` dan docs; kalau nilai lama ≠ `active`, petakan saat enum diberlakukan. Semua lookup user lewat `Query.equal("userId", ...)` — `$id` baris ≠ id Auth.
- Aksi yang DIBLOKIR saat non-active: **claim, submit, withdrawal, order baru, offer baru, payment baru**.
- Aksi yang TIDAK diblokir: **release-escrow** (dana keluar harus selesai), **terima pesan**.
- Keputusan locked: banding ≤ **14 hari** sejak notifikasi suspend (`deadlineAt = suspendAt + 14`); SLA putusan **7 hari** (`slaDecidedAt = submittedAt + 7`); review **hybrid** (auto untuk kasus jelas, eskalasi admin untuk ambigu); akun **tetap suspend** selama banding; **terminated juga bisa banding**; putusan menang → cabut suspend.
- Pola repo yang wajib ditiru: notifikasi deterministic (`ntf` + sha256, contoh `create-escrow:273-301`), function admin = `execute: []` (server-only, dipanggil dari Console/CLI dengan API key — pola event function tanpa event), guard user via `listDocuments` + `Query.equal("userId", ...)`.
- **Keterbatasan yang harus dilaporkan:** claim & submit proof dibuat KLIEN (`create("users")` di `campaign_claims`/`campaign_submissions`) — tidak bisa di-guard server tanpa migrasi (T-16 `claim-campaign`). Guard kamu menjangkau semua aksi server; jalur klien didokumentasikan sebagai tanggungan T-16.

---

## KONTEKS TUGAS TERKAIT — BACA FILE INI DULU

Roadmap resmi: `terms & conditions/roadmap/tasks-backend-alignment-tnc.md`. Baca SEBELUM mulai.

| Task di roadmap | Singgungan | Aturan buat kamu |
|---|---|---|
| **T-06** (withdrawal rewrite) | Guard kamu masuk `request-withdrawal` — file sudah ditulis ulang | KERJAKAN SETELAH T-06. Tambah guard suspend TANPA mengubah 4-state/Iris/KYC/rate-limit yang sudah ada. |
| **T-01/T-19** (fee/topup) | Guard kamu masuk `create-payment` — file diubah prompt itu | KERJAKAN SETELAH. |
| **T-14/T-15** (tos/email) | Guard lain di `request-withdrawal` & `create-order` | JANGAN sentuh guard tos/email mereka. Tambah guard suspend di sebelahnya. |
| **T-16** (claim atomik) | Guard "claim" | JANGAN kerjakan di prompt ini — claim klien. Laporkan sebagai tanggungan. |
| **T-20** (banding fraud AI) | Jalur WhatsApp banding | Di luar scope — dokumentasikan saja di Users/30_Business_Rules.md. |
| **T-02** (refund) | Order dibatalkan saat sengketa | Escrow beku ≠ refund otomatis. JANGAN panggil refund dari guard kamu. |

---

## PHASE — WAJIB

### 1. Skema

**File:** `appwrite/generate_appwrite_json.cjs` DAN `appwrite.config.json` (edit MANUAL keduanya, jangan regenerate — drift schedule di luar scope).

- `users`:
  - `status` → jadikan enum `["active", "suspended", "terminated"]` (size ikut elemen terpanjang; kalau baris lama punya nilai lain, backfill mapping ke `active` — periksa docs dulu, jangan asal).
  - tambah `suspended_at` (datetime, optional) — dasar hitung `deadlineAt` banding.
- Collection BARU `appeals` (pola config collection lengkap: `$permissions: ["create(\"users\")"]`, rowSecurity `true`, index wajib):
  - `userId` (string, required, 255)
  - `actionRef` (string, required, 255 — referensi aksi suspend/terminate)
  - `reason` (string, required, 1000)
  - `evidence` (string, optional, 2048 — fileUrl)
  - `deadlineAt` (datetime, required — `suspended_at + 14 hari`)
  - `slaDecidedAt` (datetime, required — `submittedAt + 7 hari`)
  - `status` (enum `["submitted", "under_review", "approved", "rejected"]`, required)
  - `decision` (string, optional, 1000)
  - `decidedAt` (datetime, optional)
  - Index: `idx_userId` (key), `idx_status` (key), `idx_userId_status` (key, gabungan — untuk cek appeal open).

**Docs:** `docs/02_Modules/Users/50_Database.md` (kolom + tabel `appeals`), `docs/02_Modules/Orders/30_Business_Rules.md` (escrow transaksi berjalan saat suspend: DIBEKUKAN, diselesaikan via dispute Pasal 14).

### 2. Function `suspend-user` (admin tool)

Function baru, `execute: []` (server-only — dipanggil Console/CLI dengan API key), scopes `documents.read` + `documents.write` (daftarkan di generator + config + `appwrite/function-scopes.json` — tiga tempat sinkron, AGENTS.md).

- Payload: `userId`, `status` (`suspended`|`terminated`), `reason`.
- Validasi: target ada; status valid; kalau sudah non-active → 409.
- Update `users.status` + `suspended_at = now`.
- Notifikasi ke target (deterministic id, `kind: "account_suspended"` / `"account_terminated"`): sebutkan alasan dan **batas banding 14 hari** (`deadlineAt = now + 14 hari` dalam pesan). Notifikasi ini = "menyalakan timer".
- Response: `{ status, deadlineAt, notificationId }`.

### 3. Function `unsuspend-user` (admin tool)

Function baru, `execute: []`, scopes sama.

- Payload: `userId`, `note` (optional).
- Update `users.status = "active"`; notifikasi pemulihan (`kind: "account_restored"`).
- Kalau target `terminated` → 409 (terminated tidak di-unsuspend; dipulihkan lewat banding).

### 4. Function `create-appeal` (user)

Function baru, `execute: ["users"]`, scopes `documents.read` + `documents.write`.

- Payload: `reason`, `evidence` (optional fileUrl), `actionRef` (optional).
- Guard: user harus punya `status != active` (suspended ATAU terminated — keduanya boleh banding).
- Batas waktu: `suspended_at + 14 hari` — lewat → 403 `"Batas waktu banding telah berakhir."`.
- Anti-dobel: appeal `submitted|under_review` yang masih open untuk user ini → 409.
- Hitung: `deadlineAt` (sudah lewat, tetap simpan), `slaDecidedAt = now + 7 hari`, `status = "submitted"`.
- Permission baris: `[Permission.read(Role.user(userId)), Permission.update(Role.user(userId))]` (pola notifikasi).
- Notifikasi ke user: banding diterima, SLA 7 hari.

### 5. Function `review-appeal` (admin, hybrid)

Function baru, `execute: []`, scopes `documents.read` + `documents.write`.

- Payload: `appealId`, `decision` (`approved`|`rejected`), `note`.
- Validasi: appeal ada, status `submitted|under_review`; sudah `approved|rejected` → 409 (idempoten).
- Update: `status = decision === "approved" ? "approved" : "rejected"`, `decision = note`, `decidedAt = now`.
- Kalau `approved` → otomatis `unsuspend-user` logic (users.status = active) + notifikasi pemulihan. Kalau `rejected` → notifikasi penolakan; kalau user `suspended`, TETAP suspended (terminated tetap terminated).
- **Hybrid (dokumentasikan, jangan bangun AI di prompt ini):** `docs/02_Modules/Users/30_Business_Rules.md` — auto-approve untuk bukti kuat (evidence ada + tidak ada `fraud_checks` result `reject` pada user), auto-reject untuk fraud score tinggi, eskalasi admin untuk kasus ambigu. Logika hybrid bisa sederhana di function ini (cek `fraud_checks` by submission user), TAPI jangan sampai menunda keputusan admin manual.

### 6. Guard `requireActiveUser` di aksi finansial

Helper kecil per function (fungsi tidak berbagi modul — deploy root per folder): baca baris `users` by `userId`, return `false` kalau `status !== "active"`. Terapkan di:

| Function | Titik | Perilaku saat non-active |
|---|---|---|
| `request-withdrawal` | setelah guard role (cek file terkini — T-06/T-14/T-15 sudah mengubahnya) | 403 `"Akun Anda sedang tidak aktif."` |
| `create-payment` | setelah validasi payload | 403 (pembayar) |
| `create-offer` | setelah guard user | 403 (pembuat offer) |
| `create-order` (event) | setelah baca order — cek `umkmId` DAN `creatorId` | `ignored` + notifikasi pihak non-active |
| `review-submission` | setelah guard ownership | 403 (UMKM pelaku) |
| `campaign-claimed` (event) | cek `creatorId` | JANGAN blokir (claim sudah dibuat klien) — hanya catat di log. Guard claim server = tanggungan T-16. |

**TIDAK dipasang guard di:** `release-escrow`, `send-message`, `send-chat-notification`, `create-conversation`, semua `get-*`, `midtrans-webhook`, `create-escrow` (dana masuk tidak diblokir).

### Test (wajib ditambahkan)

**File:** `tests/integration/functions.test.ts`.

1. `suspend-user` → `users.status = suspended` + `suspended_at` terisi + notifikasi ke target.
2. User suspended → `request-withdrawal` 403; `create-payment` 403; `create-offer` 403.
3. `create-appeal`: user active → 403; `suspended_at` > 14 hari → 403; appeal open sudah ada → 409; sukses → `deadlineAt` & `slaDecidedAt` benar.
4. `review-appeal` approved → user kembali `active`; rejected → tetap non-active; dua kali → 409.
5. `unsuspend-user` pada terminated → 409.
6. `create-order` dengan salah satu pihak suspended → order tidak dibuat.
7. Semua test lama tetap hijau (perhatikan: test `request-withdrawal`/`create-payment` lama butuh seed `users` ber-status `active` — update seed bila perlu, JANGAN ubah asersi).

---

## CONSTRAINT — jangan lakukan ini

- JANGAN pasang guard di `release-escrow` / jalur pesan — keputusan locked.
- JANGAN implementasikan `claim-campaign` atomik (T-16) atau `audit_logs` (T-20/T-17).
- JANGAN sentuh: fee rate, topup, views, tos/email guards, 4-state withdrawal, refund.
- JANGAN panggil refund dari guard — escrow beku diselesaikan via dispute (T-02, prompt terpisah).
- JANGAN bangun sistem AI untuk hybrid review — dokumentasikan heuristic + keputusan admin manual.
- JANGAN jalankan `node appwrite/generate_appwrite_json.cjs` — edit manual (drift schedule di luar scope; LAPORKAN kalau terlanjur ter-regen).
- JANGAN upgrade node-appwrite SDK.
- JANGAN commit sebelum test hijau. Satu commit per fungsi baru + satu untuk guard (pola: `feat(users): ...`).
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

1. `file:line` diubah: skema (users + appeals), empat function baru (daftar: generator + config + function-scopes.json — konfirmasi), guard per function.
2. Pola yang ditiru (notifikasi deterministic, admin execute [], lookup userId).
3. Daftar test baru + hasil run (tempel output).
4. Keterbatasan terdokumentasi: claim/submit klien → tanggungan T-16.
5. Catatan risiko yang tersisa (kalau ada).
6. Berhenti.

---

## DEFINISI SELESAI

- [ ] `users.status` enum + `suspended_at`; koleksi `appeals` lengkap di config + generator.
- [ ] `suspend-user`/`unsuspend-user`/`create-appeal`/`review-appeal` terdaftar di tiga tempat sinkron + berfungsi (test).
- [ ] Banding: 14 hari, SLA 7 hari, anti-dobel, terminated bisa banding, menang → pulih.
- [ ] Guard non-active di: withdrawal, payment, offer, order, review-submission.
- [ ] release-escrow & pesan TIDAK diblokir.
- [ ] Escrow beku terdokumentasi di Orders/30_Business_Rules.md.
- [ ] Test baru + test lama hijau.
- [ ] Validasi live console via MCP: function + database sinkron repo (bukti di LAPORAN).
- [ ] Laporan terkirim, tidak ada pekerjaan di luar scope.
