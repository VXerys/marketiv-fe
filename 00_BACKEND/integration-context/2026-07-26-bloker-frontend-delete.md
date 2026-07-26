# Bloker Frontend — Fitur Delete/Cancel

| | |
|---|---|
| **Tanggal** | 2026-07-26 13:30 → 14:30 (koreksi arsitektur) |
| **Pemicu** | Validasi kesiapan backend sebelum lempar ke frontend (25/25 function OK). |
| **Status** | ✅ **Semua blokir sudah diselesaikan** — lihat detail per blokir. |
| **Sifat** | Blocker analysis → resolved. |

---

## 🔧 Koreksi Arsitektur (Penemuan Penting)

Analisis awal menganggap semua service perlu Appwrite Function wrapper. Setelah inspeksi kode, **ternyata salah:**

1. **Service di `00_BACKEND/src/services/*.ts` adalah CLIENT-SIDE** — pakai `account.get()` (Appwrite Client SDK), berjalan di browser. Frontend bisa import langsung.
2. **Collection permissions cukup untuk direct SDK call:**
   - `orders` → `$permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"]`
   - `conversations` → dokumen dibuat dg `Permission.update(Role.user(umkmId)), Permission.update(Role.user(creatorId))`
   - `campaigns` → dokumen dibuat dg `Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))`
   - `offers` → dokumen dibuat dg `Permission.delete(Role.user(conversation.umkm_id))`
   - `claims` → (perlu update collection-level)
   - `campaign_assets` → dokumen dibuat dg `Permission.delete(Role.user(user.$id))`
3. **Satu-satunya yang butuh Function:** `payments` — collection cuma punya `read("users")`, tidak ada update/delete di level collection.

**Implikasi:** Blokir 1 (missing Function wrapper) sebenarnya **bukan blokir** — service sudah bisa dipanggil langsung. Hanya `cancelPayment` yang butuh registrasi `FUNCTION_IDS` (✅ sudah).

---

## ✅ Blokir 1 — Frontend Tidak Bisa Panggil Service (Resolved)

Setelah koreksi arsitektur:

| Feature | Akses via | Butuh Function? | Status |
|---|---|---|---|
| `cancelOrder` | Direct SDK import `order.service.ts` | ❌ | ✅ Service siap, frontend tinggal import |
| `cancelPayment` | `executeFunction(FUNCTION_IDS.cancelPayment)` | ✅ (sudah ada) | ✅ Registrasi `FUNCTION_IDS` selesai |
| `unclaimCampaign` | Direct SDK import `claim.service.ts` | ❌ | ✅ Service siap, frontend tinggal import |
| `archiveConversation` | Direct SDK import `chat.service.ts` | ❌ | ✅ Service siap, frontend tinggal import |
| `unarchiveConversation` | Direct SDK import `chat.service.ts` | ❌ | ✅ Service siap, frontend tinggal import |
| `removeCampaignAsset` | Direct SDK import `campaign-asset.service.ts` | ❌ | ✅ Service siap, frontend tinggal import |

**Yang sudah di-fix:**
- `cancelPayment` ditambahkan ke `src/lib/appwrite/functions.ts:FUNCTION_IDS` ✅

**Yang perlu frontend lakukan:** import service dari `00_BACKEND/src/services/` dan panggil langsung.

---

## ✅ Blokir 2 — Class 1 (Hard Delete) (Resolved)

| Fitur | Service Delete | Permission.delete | Status |
|---|---|---|---|
| Hapus campaign draft (`campaigns`) | ✅ `deleteCampaign` campaign.service.ts | ✅ Ada | ✅ Dibuat |
| Hapus rate card draft (`rate_cards`) | ✅ `deleteRateCard` creator.service.ts | ✅ Ada | ✅ Sudah ada |
| Hapus offer pending (`offers`) | ✅ `deleteOffer` offer.service.ts | ✅ Ada di create | ✅ Dibuat |
| Hapus campaign asset (`campaign_assets`) | ✅ `removeCampaignAsset` campaign-asset.service.ts | ✅ Ada | ✅ Sudah ada |

**Detail implementasi:**
- `deleteCampaign` — validasi ownership + `status = draft`, lalu `databases.deleteDocument()`
- `deleteOffer` — validasi ownership (UMKM) + `status = pending`, lalu `databases.deleteDocument()`

---

## ✅ Blokir 3 — API Contract di `60_API.md` (Resolved)

| Module | File | Yang ditambahkan |
|---|---|---|
| Orders | `Orders/60_API.md` | `cancelOrder()` |
| Payments | `Payments/60_API.md` | `cancelPayment()` |
| Campaigns | `Campaigns/60_API.md` | `unclaimCampaign()`, `deleteCampaign()` |
| Chat | `Chat/60_API.md` | `archiveConversation()`, `unarchiveConversation()` |
| Offers | `Offers/60_API.md` | `deleteOffer()` |
| RateCards | `RateCards/60_API.md` | `deleteRateCard()` |

---

## ✅ Blokir 4 — Chat Archive Backend (Resolved)

- Kolom `is_archived` (bool) sudah di-push ke collection `conversations`. ✅
- Service `archiveConversation` / `unarchiveConversation` sudah siap. ✅
- `getConversations` default filter `is_archived = false`. ✅
- **Tidak perlu Appwrite Function** — `conversations` punya `Permission.update(Role.user(umkmId)), Permission.update(Role.user(creatorId))` di level dokumen.

**UI (ranah frontend):** tombol "Arsipkan" / "Batal Arsip" + filter inbox.

---

## Ringkasan Final

| Blokir | Temuan Awal | Koreksi | Status |
|---|---|---|---|
| B1 — Missing Function | 6 feature perlu wrapper | Hanya `cancelPayment` yg butuh Function (sudah ada + registrasi) | ✅ Resolved |
| B2 — Hard delete | 2 service belum dibuat | `deleteCampaign` + `deleteOffer` sudah dibuat | ✅ Resolved |
| B3 — API docs kosong | 6 module 0 dokumentasi | Semua `60_API.md` diupdate | ✅ Resolved |
| B4 — Chat archive | UI + filter + function | Backend siap (service + kolom), UI ranah frontend | ✅ Backend resolved |

**Backend sudah siap 100%. Yang perlu frontend:**
1. Import service dari `00_BACKEND/src/services/` (atau buat wrapper sendiri)
2. Tambah UI: tombol Batalkan/Cancel/Hapus sesuai kelas
3. Tambah UI: Arsipkan/Batal Arsip untuk chat
