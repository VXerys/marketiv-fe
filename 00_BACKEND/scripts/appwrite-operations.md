# Appwrite Operations — Frontend Guide

## Console

```
URL:  https://sgp.cloud.appwrite.io/
Org:  Marketiv
Proj: Marketiv (69f9d45b00315cb0ec2f)
```

## Script Prerequisites

```bash
# Install Appwrite CLI
npm install -g appwrite-cli
# Login
appwrite login
# Pastikan endpoint sesuai region Singapore
appwrite client --endpoint https://sgp.cloud.appwrite.io/v1
```

All scripts below run from project root.

---

## 1. Deploy Functions

Mengirim code function terbaru ke Appwrite.

```bash
bash 00_BACKEND/scripts/deploy-all-functions.sh
```

Apa yang terjadi:
- Upload semua function dari `00_BACKEND/functions/<id>/src/main.js`
- Jalankan `npm install` di setiap function
- Aktifkan deployment (traffic langsung pindah ke versi baru)

**Kapan perlu dijalankan:** setiap ada perubahan code di `00_BACKEND/functions/`.

> Catatan: script ini hanya deploy code, TIDAK sync environment variables.
> Jalankan `sync-env-all-functions.sh` juga jika ada perubahan env.

---

## 2. Sync Environment Variables

Menyelaraskan semua env var dari file `.env` masing-masing function ke Appwrite.

```bash
bash 00_BACKEND/scripts/sync-env-all-functions.sh
```

Apa yang terjadi:
- Baca `00_BACKEND/functions/<id>/.env`
- Cek apakah setiap variable sudah ada di Appwrite
- Jika sudah ada → update nilainya
- Jika belum → create baru
- Otomatis deteksi secret vars (KEY/SECRET/PASSWORD/TOKEN) → flag secret

**Kapan perlu dijalankan:** setelah mengubah nilai di file `.env`, atau saat collection ID berubah.

> Butuh `jq` terinstall.

---

## 3. Push Database Columns

Menambahkan kolom dan index ke database Appwrite sesuai konfigurasi.

```bash
node 00_BACKEND/scripts/push-columns.cjs
```

Apa yang terjadi:
- Baca `00_BACKEND/appwrite.config.json`
- Buat semua kolom (string, integer, boolean, datetime, enum, array)
- Buat semua index
- Skip kolom/index yang sudah ada

**Kapan perlu dijalankan:** setelah struktur database berubah (kolom baru, index baru).

> Script ini menggunakan `appwrite tables-db` (CLI plugin Appwrite Tables).

---

## 4. Backfill / Verify Delete Permissions

### Verify

Cek apakah dokumen existing sudah punya `Permission.delete`.

```bash
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1 \
APPWRITE_PROJECT_ID=69f9d45b00315cb0ec2f \
APPWRITE_API_KEY=<key> \
npx tsx 00_BACKEND/scripts/verify-delete-permissions.ts
```

### Backfill

Menambahkan `Permission.delete` ke dokumen-dokumen lama yang belum punya.

```bash
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1 \
APPWRITE_PROJECT_ID=69f9d45b00315cb0ec2f \
APPWRITE_API_KEY=<key> \
npx tsx 00_BACKEND/scripts/backfill-delete-permissions.ts
```

Prasyarat API key: `documents.read`, `documents.write`.

---

## 5. Common Appwrite Console Operations

Yang bisa dilakukan langsung dari Console tanpa script.

### 5.1. Update Auth Methods

**Settings > Auth > Methods**
- Email-password: ON
- Email OTP: ON
- Magic URL, Anonymous, Phone, Invites: OFF (jangan nyalakan tanpa koordinasi backend)

### 5.2. Update Auth Security

**Settings > Auth > Security**
- Session duration: 31536000 (1 tahun)
- Rate limits, password policy, dll bisa disesuaikan dari Console

### 5.3. Manage API Keys

**Settings > API Keys**
- Buat key baru dengan scope spesifik
- Scope yang biasa dipakai:
  - `documents.read`, `documents.write`
  - `files.read`, `files.write`
  - `users.read`
  - `messages.write`
- Copy key value & update di `.env` semua function

### 5.4. Update Function Settings

**Functions > [function name] > Settings**

Yang bisa diubah:
- **Runtime**: harus Node.js 18.0 (jangan diganti tanpa koordinasi)
- **Timeout**: sesuaikan jika function butuh waktu lebih
- **Entrypoint**: `src/main.js` (standard)
- **Scope**: pastikan sesuai kebutuhan function

### 5.5. Update Function Environment Variables

**Functions > [function name] > Variables**

Bisa add/edit/delete manual dari Console.
Tapi lebih baik pakai script `sync-env-all-functions.sh` agar konsisten dengan file `.env`.

### 5.6. Deploy Function from Console

**Functions > [function name] > Deployments > Create Deployment**

Upload zip file yang berisi source code + `package.json` + `node_modules` (jika manual).
Tapi lebih baik pakai `deploy-all-functions.sh`.

### 5.7. Manage Database Collections

**Databases > prod_marketiv_db > [collection] > Settings**

Yang bisa diubah:
- **Permissions:** atur siapa bisa read/create/update/delete
- **Row Security:** ON (di semua collection)
- Ukuran kolom, tipe, default value

> Hati-hati: jangan hapus kolom atau ubah tipe data jika sudah ada data.

### 5.8. Manage Storage Buckets

**Storage > [bucket] > Settings**

Yang bisa diubah:
- Max file size
- Allowed mime types
- Permissions

### 5.9. View Logs / Monitoring

**Functions > [function name] > Logs**

Lihat execution logs untuk debugging.
Filter by status (failed/success) atau date range.

### 5.10. Database Indexes

**Databases > prod_marketiv_db > [collection] > Indexes**

Tambahkan index dari Console jika diperlukan.
Tapi lebih baik update di `00_BACKEND/appwrite.config.json` dan jalankan `push-columns.cjs`.

---

## Quick Reference: Kapan Pakai Apa

| Kebutuhan | Cara |
|---|---|
| Update code function | `deploy-all-functions.sh` |
| Tambah/ubah env var | Edit `.env` + `sync-env-all-functions.sh` |
| Tambah kolom database | Edit `appwrite.config.json` + `push-columns.cjs` |
| Ganti auth method | Console > Auth > Methods |
| Buat API key | Console > API Keys |
| Debug function error | Console > Functions > Logs |
| Fix missing delete permission | `backfill-delete-permissions.ts` |

---

## File Locations

| File | Path |
|---|---|
| Appwrite config | `00_BACKEND/appwrite.config.json` |
| Function code | `00_BACKEND/functions/<id>/src/main.js` |
| Function env | `00_BACKEND/functions/<id>/.env` |
| Deploy script | `00_BACKEND/scripts/deploy-all-functions.sh` |
| Env sync script | `00_BACKEND/scripts/sync-env-all-functions.sh` |
| Column pusher | `00_BACKEND/scripts/push-columns.cjs` |
| Permission backfill | `00_BACKEND/scripts/backfill-delete-permissions.ts` |
| Permission verify | `00_BACKEND/scripts/verify-delete-permissions.ts` |
