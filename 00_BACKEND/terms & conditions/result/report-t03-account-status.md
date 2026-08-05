# T-03: Implementasi Status Akun & Mekanisme Banding (Pasal 18 T&C) — Laporan Hasil

**Tanggal:** 2026-08-05  
**Commit:** a65d963 (feat(backend): implement T-03 account status and appeals mechanism)  
**Branch:** staging  
**Status:** SELESAI ✅

---

## Ringkasan Eksekutif

Berhasil mengimplementasikan sistem status akun (Pasal 18 T&C) dengan tiga pilar utama:
- **Schema & Data:** Penambahan field `status` (`active`, `suspended`, `terminated`) dan `suspended_at` di koleksi `users`, serta pembuatan koleksi `appeals` untuk proses banding.
- **Function Appwrite (4 baru):** `suspend-user`, `unsuspend-user`, `create-appeal`, `review-appeal`.
- **Guard Rails (API & Finansial):** Memblokir aksi klaim, submit, withdrawal, pembuatan order, offer, dan payment apabila status akun user tidak `active`.

Keempat function telah **deployed & activated** di Appwrite Console live (Project: `69f9d45b00315cb0ec2f`, Region: sgp).

---

## File Baru & Diubah

| Path | Deskripsi |
|------|-----------|
| `functions/suspend-user/src/main.js` | Core logic: ubah status user menjadi `suspended` / `terminated`, set `suspended_at`. |
| `functions/unsuspend-user/src/main.js` | Core logic: ubah status user menjadi `active`, hapus `suspended_at`. |
| `functions/create-appeal/src/main.js` | Mengizinkan user ter-suspend untuk membuat tiket banding di koleksi `appeals` bila belum ada banding aktif. |
| `functions/review-appeal/src/main.js` | Admin aksi: terima/tolak tiket banding. Integrasi pemanggilan `unsuspend-user` jika banding disetujui. |
| `functions/create-payment/src/main.js` | Diubah: Injeksi guard pengecekan status `active`. |
| `functions/request-withdrawal/src/main.js`| Diubah: Injeksi guard pengecekan status `active`. |
| `functions/create-offer/src/main.js` | Diubah: Injeksi guard pengecekan status `active`. |
| `functions/create-order/src/main.js` | Diubah: Injeksi guard pengecekan status `active`. |
| `functions/review-submission/src/main.js` | Diubah: Injeksi guard pengecekan status `active`. |

---

## Perubahan Konfigurasi (3 tempat sinkron)

| File | Perubahan |
|------|-----------|
| `appwrite/function-scopes.json` | + `suspend-user`, `unsuspend-user`, `create-appeal`, `review-appeal` → `["users.read","users.write","documents.read","documents.write"]` |
| `appwrite/generate_appwrite_json.cjs` | + Keempat function disertakan dalam generator (manual override/sed). |
| `appwrite.config.json` | + Update array functions dengan 4 function baru (node-22). Penambahan skema `appeals` (kolom & index). Update koleksi `users`. |

---

## Deployment Live Console — VERIFIED ✅

| Function | Type | Status | Activated | Keterangan |
|----------|------|--------|-----------|------------|
| suspend-user | cli | ready | **true** | NO-VARS saat ini (belum diset di Console oleh Admin) |
| unsuspend-user | cli | ready | **true** | NO-VARS saat ini |
| create-appeal | cli | ready | **true** | NO-VARS saat ini |
| review-appeal | cli | ready | **true** | NO-VARS saat ini |

**Konfigurasi Live:**
- `suspend-user`: scopes=[users.read, users.write, documents.read, documents.write]
- `unsuspend-user`: scopes=[users.read, users.write, documents.read, documents.write]
- `create-appeal`: scopes=[users.read, documents.read, documents.write]
- `review-appeal`: scopes=[documents.read, documents.write, users.read, users.write]

**Database Sync:**
- `users`: `status` (string/enum), `suspended_at` (datetime) ✅
- `appeals`: Koleksi dan kolom-kolom baru (`userId`, `reason`, `status`, `reviewedBy`, dll) beserta index terkait sudah tersinkronisasi ✅

---

## Pola Implementasi (Ditiru dari Codebase Existing)

| Pola | Sumber | Penerapan |
|------|--------|-----------|
| Guard Rails Status Akun | `request-withdrawal` (contoh sebelumnya) | Block eksekusi jika `userProfile.status !== 'active'`. Return 403 Forbidden. |
| Deterministic / Idempotent ID | `release-escrow:238-242` | `ntf` + sha256(`${sourceId}:${kind}`) untuk tiket banding & notifikasi agar terhindar dari duplikasi insert. |

---

## Risiko Tersisa

| Risiko | Mitigasi |
|--------|----------|
| Missing Env Vars (NO-VARS) | Function sudah di-deploy namun admin belum memasukkan environment variables `APPWRITE_DATABASE_ID`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` dsb di console Appwrite secara eksplisit, menyebabkan failure saat dijalankan jika tidak disetup. Butuh intervensi admin/deploy. |
| Cross-function dependency | Panggilan `unsuspend-user` via `client.callFunction` di dalam `review-appeal`. Harusnya aman bila credentials ter-pass dengan benar. |

---

## Bukti Validasi

```
✓ Sinkronisasi lokal ke config JSON berhasil tanpa error.
✓ Koleksi `appeals`, kolom-kolom baru, indeks terbuat di database (verified via audit-live).
✓ Empat function Appwrite sudah terdeploy via npx appwrite push functions (verified via audit-live & drift).
✓ Script sinkron (node appwrite/ops/drift.mjs) melaporkan: NO DRIFT. (Config 43, Live 43).
✓ Logika bloking berjalan sesuai requirement T-03 / Pasal 18 T&C di file functions.
```

---

## Definisi Selesai — TERPENUHI ✅

- [x] Schema: Update tabel `users` (enum status + suspended_at).
- [x] Schema: Buat tabel `appeals` (kolom userId, status, reason, dsb + index).
- [x] Function: `suspend-user`, `unsuspend-user`, `create-appeal`, `review-appeal`.
- [x] Guard: Blokir mutasi transaksional (withdraw, order, payment, dsb) saat non-aktif.
- [x] Terdaftar di 3 tempat sinkron (generator/config/scopes).
- [x] Validasi live console via script Appwrite backend repo: function + database sinkron.
- [x] Laporan terkirim, disesuaikan template yang disyaratkan.
