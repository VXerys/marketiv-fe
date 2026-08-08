# T-05: Auto-Approve Review Rate Card (Pasal 7.2.e-f T&C) — Laporan Hasil

**Tanggal:** 2026-08-05  
**Commit:** Belum di-commit (perubahan masih di working directory)  
**Branch:** staging  
**Status:** SELESAI ✅

---

## Ringkasan Eksekutif

Berhasil mengimplementasikan mekanisme auto-approve review Rate Card sesuai tenggat waktu 3 hari kalender. Mekanisme mencakup reminder H-1 dan definisi "satu revisi". Auto-approve diimplementasikan dengan secara otomatis mengeset status deliverable menjadi `approved` apabila batas waktu telah terlewati, yang secara otomatis akan men-trigger event `release-escrow`. 

Perubahan mencakup:
- **2 function inti baru**: `track-order-review` (event-driven saat deliverable dibuat) dan `auto-approve-orders` (cron berjalan tiap jam).
- **Skema database Orders**: penambahan kolom `review_deadline_at`, `auto_approved`, `revision_count`, `revision_limit`, dan `reminder_sent_at`.
- **Penanganan Sengketa**: Timer pause (skip auto-approve/reminder) otomatis jika status order adalah `dispute`.
- **Idempotensi Timer**: Batas waktu deadline dihitung absolut menggunakan `deliverable.$createdAt` + 3 hari kalender, mencegah resetting jika ada pemicuan event ulang (retry).
- **Documentasi**: Pembaruan di 4 file dokumen dengan aturan bisnis & event-driven architecture yang baru.

Kedua function baru sudah **deployed & activated** di Appwrite Console live via MCP (Project: `69f9d45b00315cb0ec2f`, Region: sgp), termasuk penambahan atribut-atribut baru pada koleksi `orders`.

---

## File Berubah (12 file)

| Path | Tipe |
|------|------|
| `00_BACKEND/appwrite.config.json` | Config generated: kolom baru di `orders` dan definisi dua function baru |
| `00_BACKEND/appwrite/function-scopes.json` | Scope update: `track-order-review` dan `auto-approve-orders` |
| `00_BACKEND/appwrite/generate_appwrite_json.cjs` | Sync schema generator untuk `orders` |
| `00_BACKEND/docs/02_Modules/Orders/30_Business_Rules.md` | Aturan bisnis: 1 permintaan = 1 revisi, timer reset |
| `00_BACKEND/docs/02_Modules/Orders/50_Database.md` | Kolom baru dan status di table orders |
| `00_BACKEND/docs/02_Modules/Orders/70_Backend.md` | Dokumentasi arsitektur auto-approve & idempoten timer |
| `00_BACKEND/docs/02_Modules/Orders/90_Events.md` | Dokumentasi pemicu event `track-order-review` |
| `00_BACKEND/functions/track-order-review/src/main.js` | Function baru: Hitung batas waktu review |
| `00_BACKEND/functions/track-order-review/package.json` | Deps function |
| `00_BACKEND/functions/auto-approve-orders/src/main.js` | Function baru: Cron auto approve & reminder |
| `00_BACKEND/functions/auto-approve-orders/package.json` | Deps function |
| `00_BACKEND/tests/integration/functions.test.ts` | Test integration baru |

---

## Perubahan Konfigurasi (3 tempat sinkron)

| File | Perubahan |
|------|-----------|
| `appwrite.config.json` | + 5 atribut di `orders` (review_deadline_at, auto_approved, revision_count, revision_limit, reminder_sent_at) |
| `appwrite/generate_appwrite_json.cjs` | + 5 atribut di dalam skema definisi `orders` |
| `appwrite/function-scopes.json` | + `track-order-review` & `auto-approve-orders` → `["documents.read","documents.write"]` |

---

## Dokumentasi Diperbarui (4 file)

| File | Perubahan |
|------|-----------|
| `docs/02_Modules/Orders/30_Business_Rules.md` | Penjelasan aturan "1 permintaan revisi = 1 revisi", di mana jumlah revisi naik per kirim ulang, serta reset timer 3 hari setelahnya. |
| `docs/02_Modules/Orders/50_Database.md` | Dokumentasi atribut baru (`review_deadline_at`, dkk) pada koleksi `orders`. |
| `docs/02_Modules/Orders/70_Backend.md` | Penjelasan teknis mengenai idempotensi `track-order-review` serta bagaimana `auto-approve-orders` trigger pelepasan escrow secara pasif lewat event. |
| `docs/02_Modules/Orders/90_Events.md` | Menambahkan event pemicu `track-order-review` setiap kali dokumen `deliverables` baru dibuat. |

---

## Test Baru (2) — SEMUA HIJAU ✅

| Test Suite | Test Case | Hasil |
|------------|-----------|-------|
| `Auto-approve Review Rate Card` | should set review_deadline_at on deliverable create | ✅ pass |
| `Auto-approve Review Rate Card` | should auto-approve orders past deadline | ✅ pass |

---

## Deployment Live Console (MCP) — VERIFIED ✅

| Function | Type | Status | Activated |
|----------|------|--------|-----------|
| track-order-review | cli | ready | **true** |
| auto-approve-orders | cli | ready | **true** |

**Konfigurasi Live:**
- `track-order-review`: events=[databases.6a4c8598001da3b0d7f0.collections.deliverables.documents.*.create], scopes=[documents.read, documents.write]
- `auto-approve-orders`: schedule=0 * * * *, scopes=[documents.read, documents.write]

**Database Sync:**
- `orders`: kolom `review_deadline_at` (datetime), `auto_approved` (boolean), `revision_count` (int), `revision_limit` (int), `reminder_sent_at` (datetime) ditambahkan.

---

## Temuan Penting & Keputusan Teknis

- **Idempotensi Kalkulasi Timer**: `track-order-review` mematok titik mulai timer selalu pada `deliverable.$createdAt` (bukan saat request datang/now). Pengecekan guard dilakukan untuk tidak menulis ulang nilai `review_deadline_at` jika versi saat ini tidak melampaui jumlah revisi yang sudah ditracking order (misalnya jika sistem re-trigger event yang sama).
- **Pasif Releasing Escrow**: Cron `auto-approve-orders` tidak memanggil mekanisme release escrow secara manual (untuk mencegah duplikasi kode release). Ia murni memutasikan dokumen `deliverable.status = 'approved'`, biarkan event trigger standar mengeksekusi sisanya via `release-escrow`.
- **Status "dispute" (Pause)**: Evaluasi cron akan mengabaikan (skip auto-approve & skip reminder) segala order yang berstatus `dispute`. 

---

## Risiko Tersisa

| Risiko | Mitigasi |
|--------|----------|
| `revision_limit` snapshot | Limit revisi ditarik dari struktur `offers` / `rate_card_packages` saat deliverable *pertama* dikirim. Jika entitas paket asli tersebut sengaja dihapus sesaat setelah order masuk tapi sebelum deliverable pertama, defaultnya akan jatuh ke 0. |
| Resume timer post-sengketa | Saat ini auto-approve akan kembali berjalan (resume) segera setelah status terlepas dari `dispute`. Apabila proses sengketa memakan waktu lama hingga menyeberangi deadline asli, sistem langsung mengapprove saat order kembali ke jalur `in_progress`. Modifikasi manual (admin backend) pada `review_deadline_at` mungkin diperlukan di kasus sengketa rumit. |

---

## Definisi Selesai — TERPENUHI ✅

- [x] Tambah 5 kolom ke `orders` di config & generator
- [x] `track-order-review` diimplementasikan (set deadline = createdAt + 3 hari)
- [x] `auto-approve-orders` diimplementasikan (auto-approve passif via event, pause dispute, reminder H-1)
- [x] Aturan "1 permintaan revisi = 1 revisi" masuk dokumentasi 
- [x] Test baru dibuat & integration tests pass (hijau)
- [x] Validasi Live Console via MCP (fungsi & attribute sinkron dengan repo)
- [x] Laporan ini selesai dibuat 
