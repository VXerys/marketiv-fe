# T-02: Implementasi Jalur Refund (Pasal 15 T&C) — Laporan Hasil

**Tanggal:** 2026-08-04  
**Commit:** c837e3a (Implement Phase 1 (T-19) and Phase 2 (T-01) payment changes + T-02 Refund)  
**Branch:** staging  
**Status:** SELESAI ✅

---

## Ringkasan Eksekutif

Berhasil mengimplementasikan jalur refund (Pasal 15 T&C) dengan dua function Appwrite baru:
- **`refund-escrow`**: Fungsi inti refund escrow `held` → `refunded` ke Wallet UMKM
- **`refund-order`**: Orkestrator refund otomatis (event `orders.*.update`) + manual (dispute) + sisa budget campaign

Kedua function sudah **deployed & activated** di Appwrite Console live (Project: `69f9d45b00315cb0ec2f`, Region: sgp).

---

## File Baru (6 file)

| Path | Deskripsi |
|------|-----------|
| `functions/refund-escrow/src/main.js` | Core refund logic: flip-first idempoten, ledger deterministik, kredit atomik, rollback |
| `functions/refund-escrow/src/atomic.js` | Copy identik `mature-pending-balance/atomic.js` (increment/decrement via TablesDB HTTP) |
| `functions/refund-escrow/package.json` | Deps: `node-appwrite@^14.1.0` |
| `functions/refund-order/src/main.js` | Orkestrator: `orderId` path, `campaignId` path, event handler `orders.*.update` |
| `functions/refund-order/src/atomic.js` | Copy identik |
| `functions/refund-order/package.json` | Deps: `node-appwrite@^14.1.0` |

---

## Perubahan Konfigurasi (3 tempat sinkron)

| File | Perubahan |
|------|-----------|
| `appwrite/function-scopes.json` | + `refund-escrow`, `refund-order` → `["documents.read","documents.write"]` |
| `appwrite/generate_appwrite_json.cjs` | + kedua function (refund-order dengan event `orders.*.update`) |
| `appwrite.config.json` | + kedua function (path, scopes, events, runtime node-22, timeout 15s) |

---

## Dokumentasi Diperbarui (4 file)

| File | Perubahan Utama |
|------|-----------------|
| `docs/02_Modules/Payments/70_Backend.md` | Dokumentasi kedua function: trigger, aksi, idempotensi, rollback, fee tidak dikembalikan |
| `docs/02_Modules/Payments/30_Business_Rules.md` | Section baru "Refund (Pasal 15 T&C)": tabel pemicu, aturan fee, escrow status, ledger, wallet UMKM |
| `docs/02_Modules/Orders/50_Database.md` | Note refund: `cancelled`/`expired` memicu refund via event; hanya `pending_payment` bisa cancel manual |
| `docs/02_Modules/Payments/90_Events.md` | Event flows baru: Order Cancelled→Refund Escrow, Campaign Budget Refund |

---

## Test Baru (6) — SEMUA HIJAU ✅

| Test Suite | Test Case | Hasil |
|------------|-----------|-------|
| `refund-escrow function (T-02)` | refunds held escrow to UMKM wallet + creates refund ledger | ✅ pass |
| `refund-escrow function (T-02)` | is idempotent - second call no double credit | ✅ pass |
| `refund-escrow function (T-02)` | ignores released escrow (creator funds safe) | ✅ pass |
| `refund-order function (T-02)` | refunds order cancelled: escrow held → UMKM wallet + ledger | ✅ pass |
| `refund-order function (T-02)` | campaign completed + remainingBudget → UMKM wallet, budget=0 | ✅ pass |
| `refund-order function (T-02)` | fee not returned: wallet = escrow.amount exactly | ✅ pass |

> **Catatan:** 29 test gagal pre-existing (release-escrow, calculate-campaign-reward, fee-rate-flip, services.test.ts) — tidak terkait perubahan T-02.

---

## Deployment Live Console (MCP) — VERIFIED ✅

| Function | Deployment ID | Type | Status | Activated |
|----------|---------------|------|--------|-----------|
| refund-escrow | `6a7191f02b6f61e3d194` | cli | ready | **true** |
| refund-order | `6a719202443e59147f61` | cli | ready | **true** |

**Konfigurasi Live:**
- `refund-escrow`: execute=[], events=[], scopes=[documents.read, documents.write]
- `refund-order`: execute=[], events=[databases.6a4c8598001da3b0d7f0.tables.orders.rows.*.update], scopes=[documents.read, documents.write]

**Database Sync:**
- `escrows`: kolom `fee_rate` (float), `status` string → support `refunded` ✅
- `transactions`: userId, amount, type, referenceId, referenceType, status ✅
- `orders`: `status` string (bukan enum ketat) → support `cancelled`/`expired` ✅
- `campaigns`: `remainingBudget` integer → support zero-kan saat refund ✅

---

## Pola Implementasi (Ditiru dari Codebase Existing)

| Pola | Sumber | Penerapan |
|------|--------|-----------|
| Flip-first idempoten | `release-escrow:50-73` | Escrow di-flip `refunded` DULU, baru ledger + kredit |
| Ledger id deterministik | `create-escrow:165-168` | `tx` + sha256(`${escrow.$id}:refund`).slice(0,32) |
| Claim ledger 409 handling | `create-escrow:133-162` | Create ledger `pending`, 409 = sudah diproses |
| incrementColumn atomik | `mature-pending-balance/atomic.js` | Raw HTTP ke TablesDB endpoint |
| Rollback delete ledger | `request-withdrawal:100-108` | Gagal kredit → hapus baris ledger `pending` |
| findOrCreateWallet | `calculate-campaign-reward:144-156` | Create wallet UMKM kalau belum ada |
| Notifikasi deterministik | `release-escrow:238-242` | `ntf` + sha256(`${sourceId}:${kind}`) |

---

## Temuan Penting: Jalur Pembatalan Order

**`cancelOrder` di `src/services/order.service.ts:362-383` HANYA mengizinkan:**
- Order `pending_payment` → `cancelled`
- Status `pending_payment` = **belum ada escrow** (escrow dibuat saat payment `paid`)

**Implikasi:**
- Event `orders.*.update` → `refund-order` menemukan escrow `held` **hanya** untuk order yang sudah `in_progress`/`approved` lalu dibatalkan (dispute/admin)
- Jalur `cancelOrder` manual tidak punya escrow → `refund-order` return `ignored: escrow not found`
- Function tetap siap dipicu manual via Console/CLI untuk dispute

---

## Risiko Tersisa

| Risiko | Mitigasi |
|--------|----------|
| VCS deployment (GitHub staging) masih "waiting" | CLI deployment sudah ready & activated; VCS akan build saat push ke staging |
| `expired` order status tidak di-dokumentasikan di Orders enum | Guard `REFUNDABLE_ORDER_STATUSES` handle `expired` sebagai future-proof; DB string field tidak butuh migrasi |
| Cross-function dedup logic (refund-escrow vs refund-order) | Duplikasi terpaksa (deploy root per-function); logika identik dengan komentar referensi |
| `oldStatus` di event Appwrite kadang tidak dikirim | Guard `oldStatus !== status` degrade gracefully (undefined → proceed) |

---

## Bukti Validasi

```
✓ 6/6 refund test baru PASS
✓ Function refund-escrow registered in Console (scopes, events, runtime)
✓ Function refund-order registered in Console (scopes, events, runtime + orders.*.update)
✓ CLI deployments built successfully (npm install passed, build cache hit)
✓ Both deployments ACTIVATED (activate: true)
✓ Database schema in sync (no migrations required)
✓ Docs updated: 4 files with refund business rules & event flows
```

---

## Definisi Selesai — TERPENUHI ✅

- [x] `refund-escrow`: held → refunded + kredit wallet UMKM `escrow.amount` + ledger `refund` + notifikasi; idempoten
- [x] `refund-order`: jalur order cancelled/expired (event + manual) + jalur sisa budget campaign
- [x] Fee **tidak dikembalikan** (kredit = persis `escrow.amount` / `remainingBudget`)
- [x] Ledger append-only (entry baru, tidak update/delete lama)
- [x] Terdaftar di 3 tempat sinkron (generator/config/scopes)
- [x] Test baru (6) PASS
- [x] Validasi live console via MCP: function + database sinkron repo
- [x] Laporan terkirim, tidak ada pekerjaan di luar scope