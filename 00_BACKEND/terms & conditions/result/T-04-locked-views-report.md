# T-04: Implementasi Jejak Views Terkunci — Laporan Hasil

**Tanggal:** 2026-08-05
**Commit:** ad2ec92 (docs(backend): update T-03 report with commit hash)
**Branch:** staging
**Status:** SELESAI ✅

---

## Ringkasan Eksekutif

Berhasil mengimplementasikan fitur jejak views terkunci (T-04) untuk `campaign_submissions`. Reward campaign kini menggunakan perhitungan yang aman dan terkunci pada saat validasi UMKM, menghilangkan risiko penurunan atau manipulasi jumlah tayangan pasca-persetujuan.

Integrasi dilakukan via modifikasi database koleksi Appwrite, pembaruan fungsi Appwrite `review-submission` untuk *snapshot* jejak, dan fungsi `calculate-campaign-reward` untuk mengutamakan views final yang telah direkam.

---

## File Diubah (4 file)

| Path | Deskripsi |
|------|-----------|
| `appwrite/generate_appwrite_json.cjs` | Penambahan atribut `views_count` (int), `views_captured_at` (datetime), `views_source` (enum), `views_final` (bool). |
| `appwrite.config.json` | Hasil regenerate konfigurasi Appwrite berdasarkan skema baru. |
| `functions/review-submission/src/main.js` | Modifikasi untuk merekam jejak views pada saat UMKM melakukan *approve* status (snapshot metrics). |
| `functions/calculate-campaign-reward/src/main.js` | Logika `calculateReward` diubah memprioritaskan `views_count` (jika `views_final = true`), jatuh kembali ke iterasi `views` reguler. |

---

## Perubahan Konfigurasi Database Appwrite (MCP)

| Koleksi | Penambahan Atribut |
|---------|--------------------|
| `campaign_submissions` | `views_count` (Integer, tidak wajib) |
| `campaign_submissions` | `views_captured_at` (Datetime, tidak wajib) |
| `campaign_submissions` | `views_source` (Enum: `api`, `scrape`, `manual_admin`, tidak wajib) |
| `campaign_submissions` | `views_final` (Boolean, default: false) |

---

## Test Diperbarui & Diperbaiki (1 file) — SEMUA HIJAU ✅

| Test Suite | Test Case | Hasil |
|------------|-----------|-------|
| `calculate-campaign-reward function locked views` | reads reward from locked views (`views_final` = true) when available | ✅ pass |
| `calculate-campaign-reward function locked views` | calculates Rp0 when locked views is under 1000 | ✅ pass |
| `calculate-campaign-reward function locked views` | is idempotent on repeated calls for the same submission | ✅ pass |

> **Catatan:** Mock global `fetch` (mockTablesDb) untuk operasi `increment`/`decrement` atomik diperbaiki untuk mengembalikan nilai `text: async () => JSON.stringify(doc)` guna mencegah error *JSON parsing* di helper `atomic.js`.

---

## Deployment Live Console (MCP) — VERIFIED ✅

| Function | Type | Status |
|----------|------|--------|
| `review-submission` | cli | Pushed & deployed |
| `calculate-campaign-reward` | cli | Pushed & deployed |

**Sinkronisasi Appwrite:**
- Konfigurasi divalidasi dengan `npm run fn:sync` ("sudah sesuai : 43").
- Atribut-atribut `campaign_submissions` dibuat di Production Console dengan sukses menggunakan `appwrite_call_tool`.
- Function `review-submission` dan `calculate-campaign-reward` dipush ke Live secara *force push* non-interaktif (`yes YES | appwrite push functions`).

---

## Pola Implementasi

| Pola | Penerapan |
|------|-----------|
| **Snapshot Immutable** | Mencegah UMKM maupun Creator mengubah angka views setelah status `approved`. Disimpan selamanya di koleksi `campaign_submissions`. |
| **Backward Compatibility** | Function `calculate-campaign-reward` memelihara kompatibilitas dengan submission yang disetujui sebelumnya (tanpa field `views_final`) dengan membaca fallback attribute `views`. |
| **Pembayaran Nol untuk Views Minor** | `Math.floor(views / 1000) * rewardPer1000Views` menegaskan jika views = 999 maka `0 * reward` = Rp 0. |

---

## Definisi Selesai — TERPENUHI ✅

- [x] 4 Atribut `views_*` dideklarasikan dan di-*push* ke skema Appwrite.
- [x] Reward mengkalkulasi bayaran 0 apabila `views_final` di bawah 1.000.
- [x] Fix A (idempotency ledger) aman tidak disentuh atau dirusak.
- [x] Tidak menggunakan implementasi scraping / API tiktok eksternal; purely manual admin verification/snapshot logic.
- [x] Audit log tidak dibuat sebagai entitas koleksi Appwrite baru.
- [x] Test Suite untuk locked views hijau semua.
- [x] Function tersinkronisasi ke server Live Appwrite via MCP/CLI.
- [x] Laporan telah berhasil didokumentasikan di `T-04-locked-views-report.md`.
