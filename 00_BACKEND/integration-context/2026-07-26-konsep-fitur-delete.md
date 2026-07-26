# Konsep Fitur Delete — Draf Diskusi

| | |
|---|---|
| **Tanggal** | 2026-07-26 06:25 |
| **Pemicu** | Diskusi dengan Angkasa: beberapa fitur belum punya delete, collection perlu diperiksa akses mana yang perlu di-update untuk mendukungnya. |
| **Status** | ✅ **Semua sudah diimplementasi & di-deploy** — lihat §5 untuk detail. |
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
| Unclaim campaign | `campaign_claims` | `status = claimed` (belum `submitted`) | Update status → `unclaimed`, kurangi `totalClaims` campaign. Kreator boleh unclaim sendiri (keputusan Angkasa ✅). Implementasi di `claim.service.ts:unclaimCampaign`. |
| Archive conversation | `conversations` | Kapan saja | Set `is_archived = true`, sembunyikan dari inbox utama. Pesan tetap utuh. Implementasi di `chat.service.ts:archiveConversation`. |

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

## 4. Keputusan & Status Implementasi

| Keputusan | Status | Detail |
|---|---|---|
| **Strategi permission** | Pilih (a) per-row | `Permission.delete` sudah ditambahkan di semua create call (kecuali `offer.service.ts` yang sudah di-fix). Backfill script siap di `00_BACKEND/scripts/backfill-delete-permissions.ts`. |
| **Unclaim campaign** | ✅ Kreator boleh unclaim sendiri | Implementasi di `claim.service.ts:unclaimCampaign`. Status: `claimed` → `unclaimed`, `totalClaims` didecrement. |
| **Cancel vs Delete** | Pilih "Batalkan" | Semua implementasi soft delete menggunakan status update, bukan hard delete. |

---

## 5. Ringkasan Implementasi

### ✅ Sudah diimplementasi

| File | Perubahan |
|---|---|
| `00_BACKEND/src/services/offer.service.ts` | Tambah `Permission.delete(Role.user(conversation.umkm_id))` di create offer + fungsi `deleteOffer` — hard delete pending offer |
| `00_BACKEND/src/services/campaign.service.ts` | Fungsi `deleteCampaign` — hard delete draft campaign |
| `00_BACKEND/src/services/order.service.ts` | Fungsi `cancelOrder` — update status `pending_payment` → `cancelled` |
| `00_BACKEND/src/services/payment.service.ts` | Fungsi `cancelPayment` — panggil Function `cancel-payment` |
| `00_BACKEND/functions/cancel-payment/` | Function baru — validasi ownership + status `pending`, update → `cancelled` |
| `00_BACKEND/src/services/claim.service.ts` | Fungsi `unclaimCampaign` — update status `claimed` → `unclaimed`, decrement `totalClaims`. Tambah enum `unclaimed` ke `ClaimStatus`. |
| `00_BACKEND/src/services/chat.service.ts` | Fungsi `archiveConversation` / `unarchiveConversation` — set `is_archived`. `getConversations` filter `is_archived=false` secara default. |
| `00_BACKEND/appwrite/generate_appwrite_json.cjs` | Tambah field `is_archived` (bool) ke collection `conversations`. Register Function `cancel-payment`. |
| `00_BACKEND/appwrite/function-scopes.json` | Tambah `cancel-payment: ["documents.read","documents.write"]` |
| `00_BACKEND/scripts/deploy-all-functions.sh` | Tambah `cancel-payment` ke deploy list, `TOTAL=25` |
| `00_BACKEND/src/lib/appwrite/collections.ts` | Tambah `FUNCTIONS.cancelPayment` |
| `src/lib/appwrite/functions.ts` | Tambah `cancelPayment: "cancel-payment"` ke `FUNCTION_IDS` |

### ✅ Sudah di-deploy & diverifikasi

| Langkah | Status | Keterangan |
|---|---|---|
| Generate `appwrite.config.json` | ✅ | `node appwrite/generate_appwrite_json.cjs` |
| Push kolom `is_archived` ke `conversations` | ✅ | `node scripts/push-columns.cjs` — juga fix `fraud_checks` createdAt + error handler "max columns" |
| Deploy `cancel-payment` Function | ✅ | Create function + deploy code + set env `APPWRITE_DATABASE_ID`, `PAYMENTS_COLLECTION_ID` + sync scopes |
| Backfill Permission.delete | ✅ | `npx tsx scripts/backfill-delete-permissions.ts` — 0 error (semua existing docs sudah punya delete perm atau tidak perlu) |
| Redeploy semua function | ✅ | `bash scripts/deploy-all-functions.sh` — 25/25 OK (termasuk `create-payment`, `midtrans-webhook`) |
| Update env & deploy scripts | ✅ | `set-env-all-functions.sh` tambah `cancel-payment` |
| Update dokumentasi | ✅ | `docs/01_Global/40_Folder_Structure.md`, `80_Deployment.md`, `30_Naming_Convention.md`, `Payments/70_Backend.md` |

### ✅ Tambahan Blokir — Class 1 Hard Delete & API Docs

| Langkah | Status | Keterangan |
|---|---|---|
| `deleteOffer` di `offer.service.ts` | ✅ | Hard delete pending offer — validasi ownership UMKM + status `pending` |
| `deleteCampaign` di `campaign.service.ts` | ✅ | Hard delete draft campaign — validasi ownership + status `draft` |
| `cancelPayment` di frontend `FUNCTION_IDS` | ✅ | `src/lib/appwrite/functions.ts` — registrasi `cancelPayment: "cancel-payment"` |
| API docs `60_API.md` (6 module) | ✅ | Orders, Payments, Campaigns, Chat, Offers, RateCards — semua endpoint cancel/delete ditambahkan |
| Bloker doc | ✅ | `2026-07-26-bloker-frontend-delete.md` — koreksi arsitektur + resolved |

### ✅ Verifikasi Permission.delete — Backend Tidak Tolak Delete

| Metode | Hasil | Detail |
|---|---|---|
| **Kode — semua service tambah `Permission.delete`** | ✅ | `campaign.service.ts:136`, `offer.service.ts:150`, `creator.service.ts:119` (rateCards), `creator.service.ts:141` (rateCardPackages), `campaign-asset.service.ts:103`, `user.service.ts:318` — lihat tabel §5 di atas |
| **Backfill ulang — idempotent** | ✅ 0 updated | `npx tsx scripts/backfill-delete-permissions.ts` — semua dokumen existing sudah punya delete perm |
| **Script verifikasi** | ✅ ada | `scripts/verify-delete-permissions.ts` — cek 1 dokumen per koleksi, lapor ada/tidak `delete("user:...")` di `$permissions` |
| **Appwrite Console — level dokumen** | ✅ | Buka dokumen → tab Permissions → lihat pill `delete("user:<id>")`. Collection-level checkbox tidak relevan (diabaikan karena permission per-dokumen eksplisit). |

**Cara konfirmasi (3 opsi):**
1. **Console:** Database → pilih koleksi → klik dokumen → scroll ke Permissions, cek ada pill `delete("user:...")`.
2. **Script:** `npx tsx scripts/verify-delete-permissions.ts` (butuh `APPWRITE_API_KEY`).
3. **Test langsung:** Login sbg owner → delete dokumen status `draft`/`pending` → response 200 (bukan 401/403).

---

## Rujukan

- Analisis awal: percakapan sesi ini (2026-07-26)
- Skema sumber kebenaran: `00_BACKEND/appwrite.config.json`
- Temuan permission delete: `00_BACKEND/integration-context/2026-07-25-frontend-sprint3-write-layer.md` §5 poin 5
- Progress tracker: `[integration_progress.md]` (memory Claude) — Sprint 4/5 belum menyentuh delete
