# Konsep Fitur Delete — Draf Diskusi

| | |
|---|---|
| **Tanggal** | 2026-07-26 06:25 |
| **Pemicu** | Diskusi dengan Angkasa: beberapa fitur belum punya delete, collection perlu diperiksa akses mana yang perlu di-update untuk mendukungnya. |
| **Status** | 🟡 **Draf konsep** — belum diimplementasi, menunggu keputusan mana yang mau dikerjakan di Sprint 4/5. |
| **Sifat** | Dokumen analisis, bukan perubahan kode. |

---

## 0. Ringkasan 1 menit

Berdasarkan lifecycle & status tiap collection (`50_Database.md` per modul), fitur delete dikelompokkan 3 kelas:

1. **Layak hard delete** — campaign draft, rate card draft, offer pending, campaign asset.
2. **Layak soft delete / cancel** — order (belum escrow), payment (belum paid), campaign claim (belum submit), conversation (archive, bukan hapus).
3. **Tidak boleh delete sama sekali** — withdrawal, transaction, campaign submission, message, escrow. Semua ini audit trail finansial atau bukti pekerjaan.

**Temuan penting (sudah tercatat di handoff Sprint 3, §5 poin 5):** saat ini **tidak ada satupun collection yang punya `delete("users")`** di level permission. Artinya walau fitur delete di-build di frontend, backend akan menolak semua percobaan hapus kecuali baris tersebut dibuat dengan `Permission.delete` per-baris eksplisit. Ini blocker teknis yang harus diselesaikan lebih dulu sebelum fitur delete manapun bisa berfungsi.

---

## 1. Kelas 1 — Layak Hard Delete

| Fitur | Collection | Syarat delete | Alasan |
|---|---|---|---|
| Hapus campaign draft | `campaigns` | `status = draft` (belum `active`) | Belum ada claim/spending; aman dihapus total |
| Hapus rate card draft | `rate_cards` | `status = draft` (belum `published`) | Belum ada order yang mereferensikan |
| Hapus offer | `offers` | `status = pending` (belum `accepted`) | Belum bind ke order; kalau sudah `accepted`/`rejected` sudah final |
| Hapus campaign asset | `campaign_assets` | Campaign induk masih `draft` | Asset bagian dari spesifikasi campaign yang belum publish |

**Yang perlu diubah di Appwrite:** tambahkan `Permission.delete(Permission.user(ownerId))` saat baris dibuat, ATAU backfill baris lama + tambah `delete("users")` di level collection (union permission, sesuai catatan §5-4 handoff Sprint 3 — union bukan intersection, jadi perlu hati-hati kalau pakai level collection).

---

## 2. Kelas 2 — Layak Soft Delete / Cancel (bukan hard delete)

| Fitur | Collection | Syarat | Mekanisme |
|---|---|---|---|
| Cancel order | `orders` | `status = pending_payment` (belum `escrow`) | Update status → `cancelled`, bukan hapus baris |
| Cancel payment | `payments` | `status = pending` (belum `paid`) | Update status → `cancelled` |
| Unclaim campaign | `campaign_claims` | `status = claimed` (belum `submitted`) | **Perlu klarifikasi ke Angkasa**: apakah kreator boleh unclaim sendiri, atau hanya system yang boleh expire otomatis? |
| Archive conversation | `conversations` | Kapan saja | Hide dari UI user (flag lokal atau kolom baru), pesan tetap ada sebagai audit trail |

**Kenapa bukan hard delete:** semuanya sudah menyentuh uang (escrow/payment) atau ada state lanjutan (submission dari claim). Hapus baris berisiko menciptakan data orphan (mis. escrow yatim tanpa order).

---

## 3. Kelas 3 — Tidak Boleh Delete Sama Sekali

| Collection | Alasan |
|---|---|
| `withdrawals` | Langsung `processed`, sudah cair — tidak bisa di-undo (ADR-008) |
| `transactions` | Ledger keuangan, audit trail wajib |
| `campaign_submissions` | Bukti kerja kreator + histori AI fraud check |
| `messages` | Riwayat negosiasi, audit trail |
| `escrows` | Dana ditahan, admin/system only |
| `fraud_checks` | Riwayat AI Fraud Detection (ADR-004) |

Untuk kelas ini, **tidak perlu ubah permission apapun** — memang harus tetap tertutup.

---

## 4. Yang Perlu Diputuskan Sebelum Implementasi

1. **Permission delete** — pilih salah satu:
   - (a) Tambah `Permission.delete` per-baris saat create (butuh sentuh semua fungsi create terkait: campaign draft, rate card draft, offer, campaign asset)
   - (b) Tambah `delete("users")` di level collection + selalu filter ownership di kode (defence in depth) — lebih cepat tapi union permission butuh audit tambahan
2. **Unclaim campaign** — perlu keputusan bisnis dari Angkasa: boleh atau tidak kreator batalkan claim sebelum submit?
3. **Cancel vs Delete untuk Order/Payment** — pastikan UI menyebutnya "Batalkan", bukan "Hapus", supaya user tidak salah ekspektasi (baris tetap ada untuk audit).

---

## Rujukan

- Analisis awal: percakapan sesi ini (2026-07-26)
- Skema sumber kebenaran: `00_BACKEND/appwrite.config.json`
- Temuan permission delete: `00_BACKEND/integration-context/2026-07-25-frontend-sprint3-write-layer.md` §5 poin 5
- Progress tracker: `[integration_progress.md]` (memory Claude) — Sprint 4/5 belum menyentuh delete
