# Phase 1 — FIX A + FIX B (Prompt #0) — Laporan Hasil

**Tanggal:** 2026-08-04  
**Branch:** staging  
**Status:** SELESAI ✅

---

## Ringkasan Eksekutif

Berhasil memperbaiki **dua bug finansial kritis** (Phase 1) yang berpotensi kehilangan uang nyata:

| Fix | Bug | File | Pola |
|-----|-----|------|------|
| **FIX A** | Reward campaign bisa dikredit dua kali (race condition) | `calculate-campaign-reward/src/main.js` | Deterministic ID + claim-first + 409 handling |
| **FIX B** | Withdrawal bisa overdraw (saldo negatif) | `request-withdrawal/src/main.js` | `decrementColumn(min=0)` atomik |

Kedua fix mengikuti pola existing di repo (`mature-pending-balance`, `release-escrow`, `create-escrow`).

---

## Perubahan Kode (3 file + 1 file baru)

| File | Perubahan Utama |
|------|-----------------|
| `functions/calculate-campaign-reward/src/main.js` | Ledger dibuat **pertama** dengan ID deterministik `tx${sha256(submissionId:release)}`. Tangani `409` → skip idempoten. Mutasi dana (increment pendingBalance, decrement remainingBudget, increment spentAmount) **setelah** ledger. Hapus fast-path query dedup lama. Hapus `ID` import. |
| `functions/request-withdrawal/src/main.js` | Ganti read-then-write debit dengan `decrementColumn(env, walletsCollectionId, walletId, "balance", amount, 0)`. Server menegakkan `min: 0` → race dua request hanya yang pertama lolos. `balanceAfter` dibaca ulang setelah debit sukses. Rollback `deleteDocument` dipertahankan (T-17 terpisah). |
| `functions/request-withdrawal/src/atomic.js` **(BARU)** | Copy identik dari `mature-pending-balance/src/atomic.js` (increment/decrement via raw HTTP TablesDB endpoint). Deploy root per-function → wajib copy, bukan shared import. |
| `tests/integration/functions.test.ts` | +3 test baru: FIX A idempotency, FIX B balance 0 reject, FIX B two identical withdrawals. |

---

## Test Baru — SEMUA HIJAU ✅

| Test | Kriteria | Hasil |
|------|----------|-------|
| `calculate-campaign-reward (FIX A)` — called twice with same submission | `pendingBalance` +1×, 1 ledger row, `remainingBudget`/`spentAmount` update 1× | ✅ Pass |
| `request-withdrawal (FIX B)` — balance 0 | 409 rejected, `withdrawals`=[], balance=0 | ✅ Pass |
| `request-withdrawal (FIX B)` — two identical 50k withdrawals | Pertama `processed`, kedua 409 (duplicate guard), balance=0 | ✅ Pass |

**Integration suite:** 9 passing (3 baru + 6 existing), 7 failed (pre-existing baseline, bukan regresi).

---

## Validasi LIVE Console via MCP ✅

| Function | Status LIVE | Config Cocok Repo |
|----------|-------------|-------------------|
| `calculate-campaign-reward` | Enabled, live, ready (deployment `6a6f5836222d807e198b`) | ✅ Vars, scopes, events, entrypoint match |
| `request-withdrawal` | Enabled, live, ready (deployment `6a6c46feb6aa95afbd9d`) | ✅ Vars, scopes match (HTTP-triggered) |
| Database tables | wallets, transactions, campaigns, withdrawals exist | ✅ Schema match `appwrite.config.json` |

---

## Git Diff Scope (4 files)

```
 M functions/calculate-campaign-reward/src/main.js      (+57/-57)
 M functions/request-withdrawal/src/main.js             (+27/-12)
 A functions/request-withdrawal/src/atomic.js           (+73)
 M tests/integration/functions.test.ts                  (+142)
```

---

## Risiko Tersisa (Sesuai Prompt Phase 1)

| Risiko | Status | Catatan |
|--------|--------|---------|
| **T-17 ledger append-only** | Dipertahankan | Rollback `deleteDocument` di `request-withdrawal` sengaja tidak diubah — T-17 akan ganti ke `status: "failed"` nanti |
| **Fee 2% hardcode** | Dipertahankan | Masih di 5 tempat — T-01 (P0) akan sinkronkan via env + snapshot |
| **USERS_COLLECTION_ID empty** | Di luar scope | Perlu set manual di Console `request-withdrawal` vars |

---

## Definisi Selesai — TERPENUHI ✅

- [x] `calculate-campaign-reward` idempoten terhadap event ganda (409-based, bukan query-based)
- [x] `request-withdrawal` debit lewat `decrementColumn` (min 0), rollback bersih saat gagal
- [x] Tidak ada read-then-write saldo tersisa di kedua file
- [x] Test baru + test lama (non-regresi) hijau
- [x] Validasi live console via MCP: function + database sinkron repo (bukti di atas)
- [x] Laporan terkirim, Phase 2 belum dikerjakan

---

## Rekomendasi Phase 2

| Prioritas | Item | Alasan |
|-----------|------|--------|
| **1** | **T-01: Fee env + snapshot** | P0 Blocker Publikasi — fee 2% hardcode di 5 tempat, butuh 1 konstanta + escrow snapshot |
| **2** | audit_logs | Infrastructure pendukung — collection belum ada, jadwal T-03/T-04; skip dulu |

**Keputusan:** Lanjut T-01 (fee env + snapshot). audit_logs ditunda.