# appwrite/ops

Perkakas operasional untuk Appwrite live. Sebelumnya tinggal di folder temp
sesi Claude dan nyaris hilang; dipindah ke repo pada 2026-07-27.

Kredensial diambil dari env (`APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`,
`APPWRITE_API_KEY`), atau kalau kosong dari `~/.appwrite/prefs.json` profil
`current`. Tidak perlu env var untuk pemakaian normal.

| Script | Tulis? | Perintah |
| --- | --- | --- |
| `drift.mjs` | tidak | `npm run fn:drift` |
| `sync-functions.mjs` | ya | `npm run fn:sync:dry` lalu `npm run fn:sync` |
| `check-deployments.mjs` | tidak | `node appwrite/ops/check-deployments.mjs` |
| `harden-permissions.mjs` | ya | `node appwrite/ops/harden-permissions.mjs --dry` |

## Batas wewenang

Ditetapkan 2026-07-27. Akses kita berhenti di lapisan konfigurasi dan kode;
lapisan deployment dan kredensial milik tim backend.

**Boleh kita ubah** — setelan runtime, berlaku langsung tanpa deploy:

`events` · `schedule` · `execute` · `timeout` · `enabled` · `logging`

Plus kode Function di `functions/<id>/src/` dan rules/permissions collection.

**Wewenang tim backend** — jangan diubah sendiri:

`scopes` (key & hak akses) · `entrypoint` · `commands` · `runtime` · `name`

Plus `appwrite push functions`, deploy, dan redeploy.

`sync-functions.mjs` default hanya menyentuh kelompok pertama; sisanya dibawa
ulang apa adanya dari live. `drift.mjs` memisahkan laporannya jadi blok A
(bisa kita perbaiki) dan blok B (serahkan ke tim backend).

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

## Catatan untuk tim backend

`appwrite push functions` sekarang **aman untuk scopes** — sejak generator
diperbaiki, `appwrite.config.json` sudah memuat key `scopes` untuk seluruh 26
Function, jadi push tidak lagi mengosongkannya. Sebelum perbaikan itu, setiap
push diam-diam mencabut hak akses Function.
