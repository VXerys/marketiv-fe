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

**[`2026-07-27-handoff-pemulihan-function-settings.md`](2026-07-27-handoff-pemulihan-function-settings.md)** — dokumen terbaru dan titik masuk untuk tim backend. Berisi laporan insiden `scopes`/`events`, daftar yang sudah kami kerjakan untuk direview, dan daftar tugas tim backend (§C).

## Yang masih terbuka per 2026-07-27

| Item | Dokumen | Butuh |
|---|---|---|
| **Redeploy `create-order` & `request-withdrawal`, push `mature-pending-balance`** | Handoff pemulihan §C-1 | Tim backend — perbaikan kode belum berdampak sampai ini jalan |
| **`commands`/`entrypoint` kosong di 25 Function** | Handoff pemulihan §C-2 | Tim backend — `appwrite push functions` |
| **Status deployment belum terverifikasi** (`deployment=NONE` 25/25) | Handoff pemulihan §C-3 | Tim backend — jalankan `check-deployments.mjs` |
| Claim `expired` mengunci kreator selamanya | Sprint 4 Alur A §5 | Keputusan produk |
| **B-3 Sprint 3** — `campaign_briefs.doAndDont` masih 400 char | Sprint 3 write layer §Resolusi | Naikkan ke 4000, atau potong di sisi penulis |
| `conversationId` + `isArchived` di DTO `get-creator-negotiations` (T-5) | Review delete layer §7 | Backend, ditampung sejak 2026-07-26 |
| Permintaan kolom Sprint 3 §6 (`doAndDont` 400→4000, dll.) | Sprint 3 write layer | Tinjauan ulang |
| Pengetatan permission `deliverables` & `revisions` | Verifikasi wiring §Resolusi | Menunggu row perm ter-deploy |
| Harness `vitest` rusak (102/121 gagal) | Sprint 3 §8 | Perbaikan harness |

## ⛔ Jangan dijalankan

`npx tsx appwrite/sync-scopes.ts` — skrip ini mengosongkan `events` di 8 Function pada 2026-07-27. Sudah diubah jadi stub yang menolak jalan. Penggantinya `appwrite/ops/sync-functions.mjs`; alasannya di handoff §A-3.
