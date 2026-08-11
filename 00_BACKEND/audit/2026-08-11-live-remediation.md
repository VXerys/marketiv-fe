# Remediation Audit Live — 2026-08-11

- **Project**: `Marketiv`
- **Tanggal**: Selasa, 11 Agustus 2026
- **Target**: tutup drift live vs repo untuk scope `UMKM-OPS-01`
- **Metode**:
  - audit read-only live vs config
  - aktivasi deployment terbaru yang sudah `ready`
  - create/deploy function yang hilang di live
  - sinkronisasi source schema repo bila audit menemukan false-positive

## Command utama

```bash
rtk node 00_BACKEND/appwrite/ops/audit-live.mjs
rtk node 00_BACKEND/appwrite/ops/activate-latest-deployment.mjs
appwrite functions create --function-id cancel-order --name "Cancel Order" --runtime node-22 --execute users --timeout 15 --enabled true --logging true --entrypoint src/main.js --commands "npm install" --scopes documents.read documents.write
appwrite functions create-deployment --function-id cancel-order --code functions/cancel-order --activate true --entrypoint src/main.js --commands "npm install"
appwrite functions create-variable --function-id cancel-order --variable-id co_appwrite_database_id --key APPWRITE_DATABASE_ID --value 6a4c8598001da3b0d7f0 --secret true
rtk node 00_BACKEND/appwrite/ops/audit-live.mjs
```

## Temuan awal

Audit live awal 11 Agustus 2026 menemukan drift nyata:

1. `create-order` deployment aktif stale.
   Active pointer tertinggal; ada deployment `ready` yang lebih baru.
2. `create-escrow` deployment aktif stale.
   Kondisi sama: function hidup, tapi kode live bukan latest ready deployment.
3. `cancel-order` belum ada di live.
   Repo/config sudah punya function, live belum.
4. False-positive schema drift `umkm_profiles.address`.
   Root cause bukan live salah, tapi source repo audit salah referensi setelah
   field `address` dipindah ke tabel `users`.
5. Warning `reset-password-with-otp` tanpa `APPWRITE_DATABASE_ID`.
   Setelah cek kode, function ini auth-only dan memang tidak menyentuh database.

## Tindakan remediation

### 1. Aktivasi latest ready deployment

Perintah:

```bash
rtk node 00_BACKEND/appwrite/ops/activate-latest-deployment.mjs
```

Hasil yang terkonfirmasi:

- `create-order`: aktif berpindah dari deployment lama `2026-08-10 02:34:47`
  ke deployment `ready` terbaru `2026-08-11 00:22:46`
- `create-escrow`: aktif berpindah dari deployment lama `2026-08-10 02:34:44`
  ke deployment `ready` terbaru `2026-08-11 00:22:43`

### 2. Buat function live yang hilang

Function `cancel-order` dibuat di live, lalu langsung dideploy dari
`00_BACKEND/functions/cancel-order`.

Hasil penting:

- function live `cancel-order` berhasil dibuat
- deployment aktif dibuat dengan id `6a7a7038d30ac0edfa4a`
- variable live `APPWRITE_DATABASE_ID=6a4c8598001da3b0d7f0` berhasil ditambahkan

### 3. Tutup false-positive dari source repo

Perubahan source audit/config:

- `00_BACKEND/appwrite.config.json`
  `address` diposisikan benar di `users`, bukan `umkm_profiles`
- `00_BACKEND/appwrite/generate_appwrite_json.cjs`
  generator disamakan dengan schema terbaru
- `00_BACKEND/appwrite/ops/audit-live.mjs`
  `reset-password-with-otp` dimasukkan ke `DB_ID_OPTIONAL_FUNCTIONS`
  karena function auth-only dan tidak butuh `APPWRITE_DATABASE_ID`

## Verifikasi akhir

Command verifikasi final:

```bash
rtk node 00_BACKEND/appwrite/ops/audit-live.mjs
```

Output akhir:

```text
=== RINGKASAN ===
  Tidak ada selisih. Live sama dengan config.
```

Makna:

- tidak ada bucket drift
- tidak ada tabel drift
- semua kolom config ada di live dan `available`
- semua function di config ada di live
- tidak ada stale deployment tersisa
- tidak ada missing required env/config untuk scope audit ini

## Dampak ke checklist

Artefak ini menutup evidence untuk:

- `UMKM-OPS-01`

Dan menguatkan audit sebelumnya bahwa beberapa temuan checklist lama memang
halusinasi / evidence lemah, bukan kondisi live aktual terbaru.

## Sisa kerja yang masih layak dilakukan

1. Jalankan smoke test jalur `create-order -> create-escrow -> cancel-order`
   lalu simpan execution ID sebagai evidence behavior, bukan hanya evidence config.
2. Audit kontrak function yang baru ditutup test lokal:
   `mark-notifications-read`, `get-umkm-finance-summary`, `cancel-order`.
3. Jika mau histori audit lebih rapi, link artefak ini dari
   `docs/revisi/14_CHECKLIST.md`.
