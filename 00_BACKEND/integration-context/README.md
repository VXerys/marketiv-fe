# integration-context

Handoff dan temuan antara tim frontend dan backend selama integrasi Appwrite.

## Konvensi

- Satu dokumen per handoff/temuan, diawali tanggal: `YYYY-MM-DD-topik.md`.
- **Resolusi ditulis sebagai bagian `## ✅ Resolusi` yang di-append ke dokumen aslinya**, bukan sebagai file baru. Prosa temuan aslinya dibiarkan utuh di atasnya supaya dokumen terbaca sebagai "terbuka → tertutup".
- Status di tabel header ikut diperbarui saat resolusi ditambahkan.

## ⚠️ Legenda ID — prefix yang sama dipakai untuk hal berbeda

Prefix `B-` dipakai dengan **tiga arti berbeda** di tiga dokumen. Selalu sebut nama dokumennya saat merujuk sebuah ID.

| Dokumen | Prefix | Arti |
|---|---|---|
| `2026-07-25-frontend-sprint3-write-layer.md` | `B-1`…`B-5` | Blocker Sprint 3: `create-payment` tanpa `total_amount`, `create-escrow` tanpa `remainingBudget`, `doAndDont` 400 char, `request-withdrawal` belum deploy, `addSocialAccount` `creatorId` |
| `2026-07-26-bloker-frontend-delete.md` | `B1`…`B4` (tanpa tanda hubung) | Blokir lapisan delete: missing Function, hard delete, API docs kosong, chat archive |
| `2026-07-26-frontend-sprint4-alur-a.md` | `B-1`…`B-3` | Temuan Sprint 4 Alur A: `views` tidak diisi, tidak ada `reviewNotes`, klaim selalu 404 |

Prefix lain, masing-masing hanya dipakai satu dokumen:

| Prefix | Dokumen | Topik |
|---|---|---|
| `T-1`…`T-5` | `2026-07-26-review-frontend-atas-delete-layer.md` | Review frontend atas lapisan delete/cancel |
| `V-1`, `V-2` | `2026-07-26-verifikasi-resolusi-T1-T4.md` | Verifikasi resolusi T-1/T-4 |
| `W-1`…`W-6`, `M-1`…`M-3` | `2026-07-27-verifikasi-event-prefix-dan-sisa-wiring.md` | Wiring Function kosong (`W`) & temuan di luar wiring (`M`) |

Catatan: rujukan `§5` di dalam §7 dokumen `2026-07-27` menunjuk **§5 dokumen Sprint 4 Alur A** (pertanyaan claim `expired`), bukan §5 dokumen itu sendiri.

## 👉 Mulai dari sini

**[`2026-07-29-audit-live-dan-pengambilalihan-backend.md`](2026-07-29-audit-live-dan-pengambilalihan-backend.md)** — dokumen terbaru dan satu-satunya titik masuk yang akurat. Berisi audit live 2026-07-29, runbook 5 langkah beserta hasil eksekusinya, dan §Resolusi yang menutup blocker deployment basi.

Sejak 2026-07-29 **tidak ada tim backend terpisah** — seluruh lapisan Appwrite milik tim ini. Dokumen lama yang ditulis sebagai serah-terima dibaca ulang sebagai daftar kerja sendiri, bukan permintaan ke pihak lain.

> ⚠️ Dokumen di folder ini adalah **catatan kronologis, bukan status terkini**. Header status di dokumen tertanggal 2026-07-27 dan 07-28 mencerminkan keadaan saat ditulis. Jangan menyimpulkan ada pekerjaan terbuka dari dokumen selain yang terdaftar di bawah.

## Yang masih terbuka per 2026-07-29

| Item | Sumber | Butuh |
|---|---|---|
| **Nol bukti runtime** — 0 eksekusi Function setelah deploy 2026-07-29 | Doc 07-29 §6b | E2E setelah sprint UI selesai |
| **Build tersangkut** di `delete-file`, `create-order`, `campaign-claimed` | `audit-live.mjs` warn | Tidak ada — sumbernya identik dengan deployment aktif (tidak ada commit ke `functions/*/src/` setelah 2026-07-28). Hapus di konsol kalau mengganggu |
| Provider Google OAuth + URL callback | Doc 07-29 §7 #1 | Aksi konsol — tidak memblokir (tombol di balik flag) |
| URL recovery `<origin>/reset-password` sebagai platform Web | Doc 07-29 §7 #2 | Aksi konsol — `/forgot-password` gagal tanpa ini |
| Cabut API key `ai-brief` lama di konsol | Doc 07-29 §5 | Aksi konsol — key sudah pernah terekspos |
| Atomicity `release-escrow` | Doc 07-29 §7 #3 | Risiko diterima sengaja; kebalikannya = bayar ganda |
| Variabel Function tidak terversion (`.env` gitignored) | Doc 07-29 §5 | Sebagian tertutup `sync-function-vars.mjs` |
| Harness `vitest` 103/121 gagal | Doc 07-29 §5 | Workstream sendiri; sebagian ekspektasi usang vs ADR-008 |
| Bucket `deliverables` di config tidak dipakai | Doc 07-29 §7 #6 | Keputusan: pakai atau hapus |
| Claim `expired` mengunci kreator selamanya | Sprint 4 Alur A §5 | Keputusan produk |
| Tren harian campaign mustahil dari `campaign_submissions` | Sprint 4 Alur B §F #5 | Butuh kolom snapshot bertanggal |

## ⛔ Jangan dijalankan

`npx tsx appwrite/sync-scopes.ts` — skrip ini mengosongkan `events` di 8 Function pada 2026-07-27. Sudah diubah jadi stub yang menolak jalan. Penggantinya `appwrite/ops/sync-functions.mjs`; alasannya di handoff §A-3.
