# 🚨 Penjelasan Masalah APPWRITE_FUNCTION_API_KEY

**Status:** ✅ **Solved** — lihat § Resolusi di bawah  
**Tanggal:** 2026-07-25  
**Penyebab:** Commit `1f6e3ec` — perubahan nama env var di 23 Function  
**Dampak:** **Semua 23 Function akan crash saat dijalankan**

---

## Ringkasan Singkat

Backend baru saja mengubah semua Function dari `APPWRITE_API_KEY` → `APPWRITE_FUNCTION_API_KEY`, dengan asumsi bahwa Appwrite akan meng-inject kunci dengan nama baru saat Function dijalankan.

**Asumsi itu salah.**

Appwrite **hanya** meng-inject `APPWRITE_FUNCTION_API_KEY` saat **BUILD** (saat deploy). Saat Function **benar-benar dijalankan (runtime)**, kunci datang lewat **HTTP header** `x-appwrite-key`, bukan dari environment variable.

Karena semua Function memiliki pola fail-fast ("jika env var tidak ada, throw error"), maka saat runtime akan crash sebelum eksekusi logika apa pun.

---

## Cara Kerja Appwrite (Dokumentasi Resmi)

### Fase 1: BUILD (saat deploy pertama kali)

```
Ketika Function di-upload ke Appwrite:
├─ Appwrite inject: APPWRITE_FUNCTION_API_KEY
├─ Tujuan: untuk npm install dan setup
└─ Tersedia hanya di build stage
```

**Contoh:** kalau Function butuh koneksi Appwrite saat install dependensi, kunci ini ada.

### Fase 2: RUNTIME (saat Function dijalankan)

```
Ketika request masuk ke Function:
├─ Appwrite TIDAK meng-inject APPWRITE_FUNCTION_API_KEY lagi
├─ Sebagai gantinya, kunci datang dalam HTTP header
│  └─ Header name: x-appwrite-key
└─ Akses: req.headers["x-appwrite-key"]
```

**Ini adalah pola resmi Appwrite.** Dokumentasi: https://appwrite.io/docs/products/functions/environment-variables

---

## Masalah Saat Ini (Setelah Commit 1f6e3ec)

### Yang Terjadi di Backend

Semua 23 Function sekarang punya kode seperti ini:

```javascript
// Saat Function DIJALANKAN (runtime)
function getEnv() {
  const env = {
    appwriteApiKey: process.env.APPWRITE_FUNCTION_API_KEY,
    // ... config lain
  };
  
  // Check: apakah semua var ada?
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
```

### Apa yang Terjadi Saat Runtime

```
1. Request masuk ke Function
2. getEnv() dipanggil
3. Cari: process.env.APPWRITE_FUNCTION_API_KEY
4. Hasilnya: undefined (tidak ada)
5. missing = ["appwriteApiKey"]
6. THROW ERROR: "Missing required environment variables: appwriteApiKey"
7. Function crash, HTTP 500 error
```

**Hasilnya:** 23 Function semua tidak berfungsi.

---

## Kenapa Belum Ketahuan?

Frontend masih dalam mode **mock** (`NEXT_PUBLIC_USE_MOCK_DATA=true`):

```
Frontend pakai mock data
  ↓
Tidak ada satupun Function yang dipanggil
  ↓
Bug tidak terlihat sekarang
  ↓
Akan fatal setelah frontend set mock=false
```

Jadi blocker ini **dormant** — belum muncul sampai frontend benar-benar memanggil Function.

---

## Bukti Lengkap

### Konfigurasi Lama yang Bekerja

Sebelum commit `1f6e3ec`, Variable namanya adalah:
```
process.env.APPWRITE_API_KEY
```

Ini **bukan** nama yang di-reserved Appwrite, jadi:
- Saat BUILD: Appwrite tidak ada urusan dengan ini
- Saat RUNTIME: Nilai yang kalian isi manual di Console tetap terbaca apa adanya
- **Hasilnya:** Bekerja normal

### Konfigurasi Baru yang Gagal

Setelah commit `1f6e3ec`:
```
process.env.APPWRITE_FUNCTION_API_KEY
```

Masalah:
- Saat BUILD: Appwrite inject `APPWRITE_FUNCTION_API_KEY` = OK (tapi tidak dipakai saat build)
- Saat RUNTIME: `process.env.APPWRITE_FUNCTION_API_KEY` = `undefined` (tidak ada)
- **Hasilnya:** Crash dengan "Missing required environment variables"

---

## Solusi Ada 2 Pilihan

### Opsi 1: Kembalikan ke Nama Lama (Paling Cepat)

Ubah semua Function kembali ke:
```javascript
appwriteApiKey: process.env.APPWRITE_API_KEY
```

**Kelebihan:**
- Perubahan minimal (1 baris per Function)
- Sudah terbukti bekerja sebelum `1f6e3ec`
- Deploy segera, tanpa riset lebih lanjut

**Kekurangan:**
- Tidak mengadopsi pola kunci dinamis yang lebih aman

---

### Opsi 2: Adopsi Pola Header Appwrite (Proper)

Ubah `getEnv()` untuk menerima `req` parameter:

```javascript
function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID,
    // Kunci DINAMIS dari header
    // Fallback ke env manual untuk testing lokal
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    // ... config lain
  };
}
```

**Kelebihan:**
- Mengikuti pola resmi Appwrite
- Kunci dinamis, lebih aman, berumur pendek
- Appwrite otomatis handle scope & permission

**Kekurangan:**
- Perlu ubah 23 Function untuk terima `req`
- Function `expire-stale-claims` yang jalan via schedule perlu uji khusus (apakah header ada?)
- Butuh lebih banyak waktu testing

---

## Cara Verifikasi (Tanpa Menyalakan Frontend)

Tidak perlu tunggu frontend — bisa tes sekarang:

1. Buka **Appwrite Console** → **Functions**
2. Pilih satu Function (contoh: `create-user-profile`)
3. Klik **Execute**
4. Lihat response:
   - **Jika masalah nyata:** Log menampilkan `Missing required environment variables: appwriteApiKey` + HTTP 500
   - **Jika sudah diperbaiki:** Function berjalan normal

Satu Function saja cukup untuk membuktikan.

---

## Rekomendasi

**Prioritas:** Lakukan **Opsi 1** (kembalikan ke nama lama) dulu:
- Cepat 5 menit
- Langsung bisa verifikasi semua 23 Function working
- Tidak ada risiko regresi

Setelah itu stabil, bisa *mulai* research tentang Opsi 2 (adopsi header) untuk jangka panjang tanpa buru-buru.

---

## Timeline

| Tanggal | Event |
|---|---|
| 2026-07-24 | Commit `1f6e3ec` → semua 23 Function berubah ke nama baru |
| 2026-07-25 | Frontend menemukan masalah via dokumentasi Appwrite |
| Sekarang | Blocker dilaporkan + penjelasan disiapkan |
| **ASAP** | Backend pilih Opsi 1 atau 2 → verifikasi → deploy |

---

## File Terkait

- **Analisis Teknis Detail:** `2026-07-25-blocker-api-key-runtime.md` (penjelasan dengan kode & source link)
- **Dokumentasi Appwrite:** https://appwrite.io/docs/products/functions/environment-variables
- **Dokumentasi Appwrite Runtime:** https://appwrite.io/docs/products/functions/develop

---

## Pertanyaan?

Jika ada yang kurang jelas, silakan tanya — penjelasan ini sengaja dibuat sederhana agar mudah dipahami tanpa perlu deep dive dokumentasi Appwrite.

---

## ✅ Resolusi — Backend Menerapkan Opsi 2

**Keputusan:** Menerapkan **Opsi 2** (adopsi pola header Appwrite), bukan sekadar revert ke nama lama.

### Yang Diubah

| Area | Perubahan |
|------|-----------|
| **23 function** | `getEnv()` → `getEnv(req)`, key dari `req.headers["x-appwrite-key"]` dengan fallback `process.env.APPWRITE_API_KEY` |
| **Scope** | `databases.read/write` → `documents.read/write` (semua function butuh akses dokumen, bukan metadata DB) |
| **`campaign-published`** | Tambah `node-appwrite` di `package.json` (sebelumnya hilang, menyebabkan `Cannot find package 'node-appwrite'` saat runtime) |
| **`ai-brief`** | `.setKey()` pakai header + fallback, `.env` diselaraskan |

### Verifikasi

6 function sample telah dites via Console Execute — semuanya berjalan normal (200, 400, atau 404 — bukan 500 karena scope/env). Detail lengkap lihat `2026-07-25-blocker-api-key-runtime.md` §8.

**Siap untuk `NEXT_PUBLIC_USE_MOCK_DATA=false`.**
