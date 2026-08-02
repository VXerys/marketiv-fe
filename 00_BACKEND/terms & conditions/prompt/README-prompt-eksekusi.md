# Panduan Eksekusi Prompt Backend (Roadmap T&C)

Panduan ini mengatur **urutan** menjalankan prompt-prompt di folder ini. Setiap prompt = SATU sesi AI terpisah (hemat token, isolasi konteks). JANGAN gabung dua prompt dalam satu sesi — beberapa menyentuh file yang sama dan dirancang berurutan.

**Cara pakai:** salin isi satu file prompt (dari `## PERAN` sampai akhir) ke agen AI. Tunggu laporan + konfirmasi, baru lanjut ke prompt berikutnya.

---

## Daftar Prompt

| # | File | Task | Sentuh file uang | Butuh konfirmasi awal |
|---|---|---|---|---|
| 0 | `prompt-perbaikan-wallet-reward.md` (SUDAH ADA) | Fix A idempotensi reward + Fix B overdraw withdrawal | `calculate-campaign-reward`, `request-withdrawal` | — |
| 1 | `prompt-t12-t13-metadata-konten.md` | T-12 kreditasi + T-13 penanda AI | tidak | tidak |
| 2 | `prompt-t14-t15-akun-kepatuhan.md` | T-14 TOS + T-15 email verified | `request-withdrawal` (guard) | tidak |
| 3 | `prompt-t04-views-tracking.md` | T-04 views terkunci | `calculate-campaign-reward`, `review-submission` | tidak |
| 4 | `prompt-t02-refund.md` | T-02 refund → wallet UMKM | escrow, wallet, ledger | tidak |
| 5 | `prompt-t06-withdrawal-iris.md` | T-06 4-state + Iris + KYC + UMKM | `request-withdrawal` (TULIS ULANG) | tidak |
| 6 | `prompt-t05-autoapprove.md` | T-05 auto-approve + reminder | via event release saja | tidak |
| 7 | `prompt-t01-fee-t19-topup.md` | T-01 fee env + snapshot, T-19 hapus topup | `create-payment`, `create-escrow`, `release-escrow` | **YA** (antar phase) |
| 8 | `prompt-t03-suspend-banding.md` | T-03 suspend + banding + guard | guard di banyak function | tidak |

---

## Urutan WAJIB + Alasan

```
0. prompt-perbaikan-wallet-reward.md   ← dulu (hentikan pendarahan uang)
1. prompt-t12-t13-metadata-konten.md   ← paling kecil, hangatkan
2. prompt-t14-t15-akun-kepatuhan.md    ← T-15 SEBELUM T-06 (guard email di file yang sama)
3. prompt-t04-views-tracking.md        ← butuh Fix A sudah masuk (file sama)
4. prompt-t02-refund.md                ← T-06 butuh sumber saldo UMKM
5. prompt-t06-withdrawal-iris.md       ← tulis ulang request-withdrawal (terbesar)
6. prompt-t05-autoapprove.md           ← independen, kapan pun setelah release stabil
7. prompt-t01-fee-t19-topup.md         ← fee terakhir (semua task lain masih pakai 2%)
8. prompt-t03-suspend-banding.md       ← PALING AKHIR: guard menambah baris di file
                                            yang ditulis ulang #5 dan #7
```

## Matriks Bentrok File (kenapa urutannya begitu)

| File | Disentuh prompt | Konflik kalau dibalik |
|---|---|---|
| `request-withdrawal/src/main.js` | #0 (Fix B), #2 (guard email+TOS), #5 (TULIS ULANG), #8 (guard suspend) | #5 harus setelah #0+#2; #8 harus setelah #5 |
| `create-payment/src/main.js` | #7 (fee+topup), #8 (guard suspend) | #8 harus setelah #7 |
| `create-escrow/src/main.js` | #7 (topup+fee snapshot), #4 (baca saja) | #7 bebas; #4 jangan sentuh |
| `release-escrow/src/main.js` | #7 (fee snapshot), #6 (dipicu event) | #6 jangan panggil langsung |
| `calculate-campaign-reward/src/main.js` | #0 (Fix A), #3 (views) | #3 harus setelah #0 |
| `review-submission/src/main.js` | #3 (views), #1 (jaga updateDocument), #8 (guard) | aman — #3 dan #8 bagian berbeda |
| `appwrite.config.json` + generator | SEMUA (skema) | edit manual; jangan regenerate |

## Aturan Bersama Setiap Prompt (sudah tertulis di tiap file)

1. **JANGAN** jalankan `node appwrite/generate_appwrite_json.cjs` — edit config + generator MANUAL (ada drift schedule `expire-stale-claims` antara keduanya yang bukan scope siapa pun; kalau terlanjur ter-regen → LAPORKAN).
2. Function baru wajib sinkron TIGA tempat: `appwrite/generate_appwrite_json.cjs` + `appwrite.config.json` + `appwrite/function-scopes.json` (aturan AGENTS.md).
3. Pola wajib: `atomic.js` (increment/decrement min server), id ledger deterministik `tx`+sha256, flip-first, notifikasi deterministic `ntf`, permission baris `[Permission.read(Role.user(...))]`.
4. `atomic.js` TIDAK ikut ter-bundle lintas folder — salin ke tiap folder function yang butuh.
5. Test: `00_BACKEND/tests/integration/functions.test.ts`; `npm run test:integration` + `npm test` wajib hijau sebelum commit.
6. Docs = sumber kebenaran; sinkronkan `docs/02_Modules/<Module>/` tiap perubahan (AGENTS.md).
7. Satu commit per function/phase, pola pesan repo: `feat(<function-id>): ...`.
8. Setiap prompt berhenti setelah scope-nya — jangan lanjut task lain tanpa konfirmasi.
9. **Console Appwrite diakses via MCP** (function, database, validasi kesesuaian): `appwrite_get_context` → `appwrite_search_tools` → `appwrite_call_tool`. Cek kondisi LIVE vs repo SEBELUM implementasi, validasi LIVE vs repo SESUDAH — jangan menyatakan selesai sebelum bukti MCP. (Tertulis di tiap prompt, section "AKSES CONSOLE APPWRITE — WAJIB VIA MCP".)

## Dependensi Antar Task (ringkas)

- T-15 → T-06 (guard email dipertahankan saat rewrite)
- T-02 → T-06 (sumber saldo UMKM)
- T-04 → Fix A (file sama, dedup dulu)
- T-06 → T-03 (guard suspend ditambah belakangan)
- T-01/T-19 → T-03 (guard create-payment belakangan)
- T-02/T-19 → saling melengkapi: setelah topup hapus, refund = satu-satunya isi balance UMKM
- T-05 → release-escrow stabil (event release tetap satu jalur)

## Status

| File | Status |
|---|---|
| `prompt-perbaikan-wallet-reward.md` | siap (sudah ada) |
| `prompt-t12-t13-metadata-konten.md` | siap |
| `prompt-t14-t15-akun-kepatuhan.md` | siap |
| `prompt-t04-views-tracking.md` | siap |
| `prompt-t02-refund.md` | siap |
| `prompt-t06-withdrawal-iris.md` | siap |
| `prompt-t05-autoapprove.md` | siap |
| `prompt-t01-fee-t19-topup.md` | siap |
| `prompt-t03-suspend-banding.md` | siap (kerjakan TERAKHIR) |
