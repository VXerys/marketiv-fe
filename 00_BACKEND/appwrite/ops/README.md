# appwrite/ops

Perkakas operasional untuk Appwrite live. Sebelumnya tinggal di folder temp
sesi Claude dan nyaris hilang; dipindah ke repo pada 2026-07-27.

Kredensial diambil dari env (`APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`,
`APPWRITE_API_KEY`), atau kalau kosong dari `~/.appwrite/prefs.json` profil
`current`. Tidak perlu env var untuk pemakaian normal.

| Script | Tulis? | Perintah |
| --- | --- | --- |
| `audit-live.mjs` | tidak | `node appwrite/ops/audit-live.mjs` |
| `drift.mjs` | tidak | `npm run fn:drift` |
| `check-deployments.mjs` | tidak | `node appwrite/ops/check-deployments.mjs` |
| `ensure-buckets.mjs` | ya | `node appwrite/ops/ensure-buckets.mjs --dry` |
| `ensure-columns.mjs` | ya | `node appwrite/ops/ensure-columns.mjs --dry` |
| `fix-function-vars.mjs` | ya | `node appwrite/ops/fix-function-vars.mjs --dry` |
| `sync-function-vars.mjs` | ya | `node appwrite/ops/sync-function-vars.mjs --dry` |
| `harden-permissions.mjs` | ya | `node appwrite/ops/harden-permissions.mjs --dry` |
| `sync-functions.mjs` | ya | `npm run fn:sync:dry` lalu `npm run fn:sync` |
| `activate-latest-deployment.mjs` | ya | `node appwrite/ops/activate-latest-deployment.mjs --dry` |

Yang menulis selalu punya `--dry`. Jalankan kering dulu, baca rencananya, baru
tanpa flag.

`sync-function-vars.mjs` menyalin `functions/<id>/.env` ke Appwrite. Ia
menggantikan `scripts/sync-env-all-functions.sh`, yang butuh `jq` dan CLI
`appwrite` di PATH — di mesin dev MINGW64 keduanya tidak ada, dan skrip itu
melaporkan seluruh 28 Function `NOT DEPLOYED` padahal semuanya live.

**Mulai dari `audit-live.mjs`.** `drift.mjs` hanya membandingkan field runtime
Function dan buta terhadap bucket, tabel, dan kolom — pada 2026-07-29 justru di
kategori itulah empat dari enam blocker bersembunyi, termasuk bucket yang tidak
pernah dibuat dan kolom yang hilang sejak migrasi gagal.

`activate-latest-deployment.mjs` memindahkan pointer deployment ke build `ready`
terbaru yang **sudah ada**; ia tidak pernah membuat deployment baru — itu tetap
tugas `appwrite push functions`. Dipakai saat `audit-live.mjs` melaporkan
`STALE-DEP`, yaitu kondisi Function lolos seluruh pemeriksaan config tapi
menjalankan kode dari build lama karena push sebelumnya berhenti di tengah.

## Kapan perubahan berlaku

Sejak 2026-07-29 tidak ada pembagian wewenang frontend/backend — seluruh lapisan
Appwrite milik tim ini. Yang tersisa perbedaan **teknis**, dan itu tetap penting:

**Berlaku langsung**, tanpa deploy ulang:

`events` · `schedule` · `execute` · `timeout` · `enabled` · `logging`
· permission tabel & bucket · variabel Function

**Baru berlaku setelah `appwrite push functions`:**

`scopes` · `entrypoint` · `commands` · `runtime` · `name` · kode Function

Menyetel `scopes` lewat API lalu menganggapnya aktif adalah kesalahan yang mudah
dibuat. `sync-functions.mjs` default hanya menyentuh kelompok pertama; kelompok
kedua butuh flag `--backend-fields` eksplisit. `drift.mjs` memisahkan laporannya
mengikuti pembagian yang sama.

> Catatan lingkungan: perintah yang **menulis** ke Appwrite production diblokir
> classifier saat dijalankan lewat asisten. Baca lolos. Jadi skrip disiapkan di
> repo dan dijalankan manusia di terminal — itu batas harness, bukan wewenang.

## Aturan yang lahir dari insiden

`PUT` di Appwrite adalah **replace, bukan patch**. Field yang tidak dikirim
di-reset ke default server.

Pada 2026-07-27 `appwrite/sync-scopes.ts` dijalankan untuk memulihkan `scopes`,
dan justru mengosongkan `events` dan `commands` di 8 Function event-driven —
mematikan seluruh Alur A. Penyebabnya: SDK `node-appwrite` membuang argumen
`undefined` dari payload, sementara endpoint-nya PUT. Ini penyakit yang sama
persis dengan `appwrite push functions` yang mengosongkan `scopes`, yaitu bug
yang sedang coba diperbaiki skrip itu.

Konsekuensinya, untuk setiap tulis ke Appwrite:

1. **GET dulu**, merge perubahan di atas kondisi live, kirim payload **lengkap**.
2. Field yang tidak dikenal `appwrite.config.json` (`specification`,
   `installationId`, `provider*`) **harus dibawa ulang dari live**.
3. Jangan pakai SDK dengan argumen posisional untuk update parsial. Script di
   sini sengaja memakai `fetch` mentah supaya payload terlihat apa adanya.
4. Verifikasi selalu dengan `npm run fn:drift`, yang membandingkan **semua**
   field tanpa syarat. Versi lamanya menyembunyikan perbandingan `scopes` di
   balik `if (c.scopes && ...)` sehingga `NO DRIFT` sempat jadi lampu hijau
   palsu selama 8 Function kehilangan scopes-nya.

`appwrite/sync-scopes.ts` sudah diubah jadi stub yang menolak jalan dan
menunjuk ke sini.

## Catatan tentang `appwrite push functions`

Push sekarang **aman untuk scopes** — sejak generator diperbaiki,
`appwrite.config.json` sudah memuat key `scopes` untuk seluruh 28 Function, jadi
push tidak lagi mengosongkannya. Sebelum perbaikan itu, setiap push diam-diam
mencabut hak akses Function.

Yang belum aman: **push tidak dijamin tuntas.** Build bisa tersangkut di status
`building` tanpa batas waktu, dan saat itu terjadi pointer deployment aktif
Function tersebut tidak pernah maju — tanpa pesan error apa pun. Karena itu
`appwrite push functions` selalu diikuti `audit-live.mjs`, bukan dianggap
selesai begitu perintahnya kembali.
