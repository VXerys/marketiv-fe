# Prompt — Refund ke Wallet UMKM (T-02)

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan fase dan constraint di dalamnya saling terkait.
>
> **Target repo:** `00_BACKEND/` (Appwrite Functions).
> **Tanggal:** 2026-08-02

---

## PERAN

Kamu adalah backend engineer senior di repo `00_BACKEND/`. Tugasmu: implementasikan **jalur refund** (T-02, Pasal 15 T&C) — dana kembali ke Wallet UMKM saat order dibatalkan/expired atau dispute — dengan fungsi `refund-escrow` dan `refund-order`. Selesai lalu berhenti dan melapor.

Aturan kerja repo berlaku. Baca dulu `00_BACKEND/AGENTS.md`. Dokumentasi adalah sumber kebenaran: baca `docs/02_Modules/Payments/70_Backend.md`, `docs/02_Modules/Payments/30_Business_Rules.md`, `docs/02_Modules/Orders/50_Database.md`, `docs/02_Modules/Payments/50_Database.md`.

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

- **Escrow Rate Card:** `escrows` (orderId unique, amount, status `held` → `released`). UMKM membayar PERSIS harga rate card (`payments.amount` = `escrows.amount`); fee seller-side 2% dipotong SAAT RELEASE dari pendapatan kreator (`release-escrow`), bukan dari escrow. Jadi escrow penuh = milik kreator setelah release, atau milik UMKM sebelum release.
- **Fee buyer-side (campaign):** `create-payment` menagih `amount + fee_amount`; `fee_amount` TIDAK pernah masuk escrow.
- **Keputusan locked (Opsi B):** refund → **Wallet UMKM** (`wallets.balance`) + fitur withdrawal UMKM (T-06, prompt terpisah). **Fee TIDAK dikembalikan** (biaya layanan terpakai). Pemicu: otomatis (order dibatalkan/expired) + manual admin (dispute).
- **Ledger:** `transactions` = append-only (T-17); koreksi = entry BARU, jangan update entry lama. Semua mutasi wallet lewat `incrementColumn` atomik (server min 0).
- **Sumber saldo UMKM:** dengan T-19 (topup dihapus), `wallets.balance` UMKM terisi HANYA via refund (prompt ini) — jadi refund di sini juga menyiapkan jalur withdrawal UMKM (T-06).

---

## KONTEKS TUGAS TERKAIT — BACA FILE INI DULU

Roadmap resmi: `terms & conditions/roadmap/tasks-backend-alignment-tnc.md`. Baca SEBELUM mulai.

| Task di roadmap | Singgungan | Aturan buat kamu |
|---|---|---|
| **T-06** (withdrawal 4-state + UMKM) | Withdrawal UMKM dari saldo refund | JANGAN bangun alur withdrawal di prompt ini. Yang kamu buat = sumber saldonya. Kerjakan T-02 DULU. |
| **T-19** (hapus topup) | `wallets.balance` UMKM | JANGAN sentuh `create-payment`/`create-escrow`/`payment.service.ts` — prompt T-01/T-19 menanganinya. |
| **T-17** (ledger append-only) | Ledger `refund` | Patuhi: entry baru, jangan delete/update entry lama. |
| **T-03** (suspend) | Order dibekukan saat sengketa | JANGAN otomatis refund saat suspend — escrow beku ≠ refund. |
| **T-05** (auto-approve) | Order `completed` via cron | JANGAN sentuh `release-escrow` / `auto-approve-orders`. |
| **T-01** (fee env) | Fee rate | JANGAN ubah konstanta fee. Refund TIDAK mengembalikan fee. |

---

## PHASE — WAJIB

### 1. Function `refund-escrow` (inti)

Function baru. Pola struktur: file function execute-users / event yang ada. `execute: []` (server-only — dipanggil admin dari Console/CLI untuk dispute, dan dipicu event untuk jalur otomatis — lihat PHASE 3). Scopes `documents.read` + `documents.write` (daftarkan di generator + config + `appwrite/function-scopes.json` — tiga tempat sinkron, AGENTS.md).

**PERHATIAN arsitektur deploy:** salin `functions/mature-pending-balance/src/atomic.js` → `functions/refund-escrow/src/atomic.js` (identik, jangan diubah) — kamu butuh `incrementColumn`.

Payload: `escrowId` ATAU `orderId`.

Alur (pola flip-first idempoten dari `release-escrow:60-73`):

1. Load escrow (by id, atau by `Query.equal("orderId", orderId)`).
2. Guard: escrow `status === "held"`; kalau `released`/`refunded` → `{ status: "ignored" }` (idempoten — event bisa terkirim ulang).
3. Flip escrow → `status: "refunded"` (DULU, sebelum mutasi wallet — kalau eksekusi berhenti di tengah, retry tidak refund dua kali).
4. Load order → `umkmId`; wallet UMKM (create kalau belum ada — pola `findOrCreateWallet` di `calculate-campaign-reward:144-156`).
5. Ledger dulu: entry deterministic `tx` + sha256(`${escrow.$id}:refund`).slice(0,32) (pola `create-escrow:183-186`), `type: "refund"`, `referenceId: escrow.$id`, `referenceType: "escrow"`, `status: "pending"`, permission baris `[Permission.read(Role.user(umkmId))]`. 409 → sudah diproses → `{ status: "already_processed" }` (jangan lanjut).
6. `incrementColumn(wallets, wallet.$id, "balance", escrow.amount)` — atomik. Gagal → hapus baris ledger (rollback delete, pola `request-withdrawal:100-108` — perilaku ini dipertahankan sampai T-17), return error.
7. Tandai ledger `status: "completed"` (pola `create-escrow:137-139`).
8. Notifikasi UMKM (deterministic id, `kind: "refund_escrow"`, sebut nominal).
9. **Fee TIDAK dikembalikan:** `escrow.amount` = harga order (fee seller-side belum pernah dipotong; fee buyer-side campaign tidak pernah masuk escrow). JANGAN kredit lebih dari `escrow.amount`.

### 2. Function `refund-order` (jalur otomatis + manual)

Function baru, `execute: []`, scopes sama. Payload: `orderId` ATAU `campaignId` + `reason` (optional).

- **`orderId`:** load order; kalau `status` ∈ `{cancelled, expired}` (atau `refund_requested` bila ada — periksa docs nilai status order di `Orders/50_Database.md`): jalankan logika refund-escrow yang SAMA (JANGAN duplikasi — import/refactor ke helper bersama dalam folder yang sama, atau panggil ulang blok yang sama). Kalau order `in_progress`/`completed` → 409 (bukan jalur refund).
- **`campaignId` (sisa budget):** load campaign; kalau `status` ∈ `{cancelled, completed}` DAN `remainingBudget > 0`: kredit `wallets.balance` UMKM (`umkmId`) sebesar `remainingBudget` via `incrementColumn`, ledger deterministic `tx` + sha256(`${campaignId}:refund`), `type: "refund"`, `referenceType: "campaign"`, set `remainingBudget` → 0 (`decrementColumn` min 0). Idempoten via ledger 409.
- Notifikasi kedua jalur.

### 3. Jalur otomatis — event `orders.rows.*.update`

- Daftarkan `refund-order` pada event `databases.6a4c8598001da3b0d7f0.tables.orders.rows.*.update` (generator + config — pola `create-order`).
- Handler: payload berisi `$id`, `status`, `oldStatus`; kalau status jadi `cancelled`/`expired` DAN `oldStatus` berbeda → proses refund (jalur `orderId`). Kalau tidak → `{ status: "ignored" }`.
- Idempoten: event ulang → escrow sudah `refunded` → skip.
- Kalau ternyata jalur pembatalan order belum ada (tidak ada yang menulis `cancelled`), LAPORKAN — function tetap siap dipicu manual (admin/Console) untuk dispute.

### 4. Dokumentasi

- `docs/02_Modules/Payments/70_Backend.md`: `refund-escrow` + `refund-order` (payload, idempotensi, fee tidak dikembalikan, koreksi = entry ledger baru).
- `docs/02_Modules/Payments/30_Business_Rules.md`: Pasal 15.1.c/15.2.b/15.3 — pemicu otomatis vs manual, escrow `refunded`, status withdrawal UMKM (rujuk T-06).
- `docs/02_Modules/Orders/50_Database.md`: status `refunded` di `escrows`.

### Test (wajib ditambahkan)

**File:** `tests/integration/functions.test.ts`.

1. e2e: order `cancelled` + escrow `held` 100.000 + wallet UMKM 0 → panggil `refund-order` → escrow `refunded`, wallet UMKM = 100.000, SATU baris ledger `refund`.
2. Idempoten: panggil kedua → tidak ada kredit ganda, tidak ada ledger dobel.
3. Escrow `released` → `ignored` (dana kreator tidak ditarik).
4. Campaign `completed` + `remainingBudget` 20.000 → wallet UMKM +20.000, `remainingBudget` = 0, ledger `refund` referenceType campaign.
5. Fee tidak dikembalikan: wallet bertambah PERSIS `escrow.amount` (100.000), bukan 102.000.
6. Semua test lama tetap hijau (perhatikan: test `create-escrow`/`release-escrow` tidak boleh rusak).

---

## CONSTRAINT — jangan lakukan ini

- JANGAN kredit melebihi `escrow.amount` / `remainingBudget` — fee tidak dikembalikan.
- JANGAN update/delete entry ledger lama — entry baru (T-17).
- JANGAN ubah `release-escrow`, `create-payment`, `create-escrow`, `wallet.service.ts`, `payment.service.ts` (T-01/T-19 menangani).
- JANGAN bangun alur withdrawal UMKM — itu T-06.
- JANGAN refund otomatis saat suspend/dispute tanpa status order yang sah.
- JANGAN jalankan `node appwrite/generate_appwrite_json.cjs` — edit manual (drift schedule di luar scope; LAPORKAN kalau terlanjur ter-regen).
- JANGAN upgrade node-appwrite SDK.
- JANGAN commit sebelum test hijau. Satu commit per function (pola: `feat(refund-escrow): ...`).
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

1. `file:line` diubah + dua function baru (konfirmasi terdaftar di generator + config + function-scopes.json).
2. Pola yang ditiru: flip-first, ledger deterministic, `incrementColumn`, rollback delete.
3. Daftar test baru + hasil run (tempel output).
4. Temuan: apakah jalur pembatalan order (`cancelled`) sudah ada di sistem — ya/tidak + bukti.
5. Catatan risiko yang tersisa.
6. Berhenti.

---

## DEFINISI SELESAI

- [ ] `refund-escrow`: held → refunded + kredit wallet UMKM `escrow.amount` + ledger `refund` + notifikasi; idempoten.
- [ ] `refund-order`: jalur order cancelled/expired (event + manual) + jalur sisa budget campaign.
- [ ] Fee tidak dikembalikan (kredit = persis escrow.amount / remainingBudget).
- [ ] Ledger append-only dihormati.
- [ ] Terdaftar di tiga tempat sinkron (generator/config/scopes).
- [ ] Test baru + test lama hijau.
- [ ] Validasi live console via MCP: function + database sinkron repo (bukti di LAPORAN).
- [ ] Laporan terkirim, tidak ada pekerjaan di luar scope.
