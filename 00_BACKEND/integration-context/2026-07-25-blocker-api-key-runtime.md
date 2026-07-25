# Blocker — `APPWRITE_FUNCTION_API_KEY` tidak ada saat runtime

| | |
|---|---|
| **Tanggal** | 2026-07-25 |
| **Pemicu** | Review commit `1f6e3ec` (`fix: ganti var APPWRITE_API_KEY → APPWRITE_FUNCTION_API_KEY di semua function`) |
| **Dampak** | **23 dari 23 Function gagal saat dieksekusi** |
| **Terlihat sekarang?** | Belum — frontend masih `NEXT_PUBLIC_USE_MOCK_DATA=true`, jadi tidak ada Function yang dipanggil |
| **Status verifikasi** | Dari dokumentasi Appwrite. **Belum diuji runtime** — kami tidak punya akses Console/CLI |

---

## 1. Apa yang terjadi

Commit `1f6e3ec` mengganti nama variabel di seluruh Function:

```diff
- appwriteApiKey: process.env.APPWRITE_API_KEY,
+ appwriteApiKey: process.env.APPWRITE_FUNCTION_API_KEY,
```

Alasan yang ditulis di `commits.md`:

> Appwrite Function runtime meng-inject key dengan prefix `FUNCTION_`

Premisnya benar sebagian, tapi kesimpulannya terbalik untuk kasus ini.

## 2. Yang dikatakan dokumentasi Appwrite

Dua hal yang perlu dibaca bersamaan:

1. **`APPWRITE_FUNCTION_API_KEY` hanya ada saat BUILD, bukan saat eksekusi.**
   > "During the build process, dynamic API keys are automatically provided as the
   > environment variable `APPWRITE_FUNCTION_API_KEY`."

2. **Saat eksekusi, kunci datang lewat HEADER, bukan env var.**
   > "During execution, dynamic API keys are automatically provided in the
   > `x-appwrite-key` header."

3. **Prefix `APPWRITE_` reserved — variabel buatan sendiri tidak boleh memakainya.**
   > "They take precedence over your own variables, so do not set keys with the
   > `APPWRITE_` prefix."

Artinya: mengisi `APPWRITE_FUNCTION_API_KEY` manual di Function settings pun bukan
solusi yang aman, karena nama itu milik Appwrite dan nilai injeksi Appwrite menang.

Sumber:
- <https://appwrite.io/docs/products/functions/environment-variables>
- <https://appwrite.io/docs/products/functions/develop>

## 3. Kenapa ini fatal, bukan sekadar warning

`getEnv()` dipanggil **di dalam handler** — artinya saat eksekusi, bukan saat build.
Semua Function memakai pola gagal-cepat yang sama:

```js
const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
```

`process.env.APPWRITE_FUNCTION_API_KEY` bernilai `undefined` saat eksekusi →
`missing` berisi `appwriteApiKey` → **throw sebelum satu baris logika pun jalan.**

Nama lama (`APPWRITE_API_KEY`) justru bekerja: bukan nama yang di-inject Appwrite,
jadi nilai yang kalian isi manual di Function settings terbaca apa adanya.

Terdampak: seluruh 23 Function. Nol yang memakai pola header.

```
$ grep -rl "x-appwrite-key" 00_BACKEND/functions/*/src/main.js
(kosong)

$ grep -rl "APPWRITE_FUNCTION_API_KEY" 00_BACKEND/functions/*/src/main.js | wc -l
23
```

## 4. Perbaikan yang disarankan

Pakai kunci dinamis dari header, sesuai pola resmi Appwrite. Kuncinya per-eksekusi,
berumur pendek, dan otomatis menghormati scope di `function-scopes.json` — jadi
`sync-scopes.ts` yang kalian buat di `c5467ec` tetap relevan, malah jadi lebih penting.

`getEnv()` perlu menerima `req`:

```js
function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID,
    // Kunci dinamis per-eksekusi. Fallback ke env manual untuk uji lokal.
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    ...
  };
}
```

Untuk `expire-stale-claims` yang jalan lewat **schedule**, bukan HTTP: eksekusi
terjadwal juga menerima header yang sama. Mohon dikonfirmasi saat uji — kalau
ternyata tidak, function itu perlu API key statis tersendiri.

Alternatif minimal (bila ingin perubahan sekecil mungkin): kembalikan saja ke
`APPWRITE_API_KEY`. Itu memulihkan kondisi yang sudah bekerja sebelum `1f6e3ec`,
tanpa mengadopsi kunci dinamis.

## 5. Cara memverifikasi tanpa menyalakan frontend

Console → pilih Function mana pun → **Execute**. Bila blocker ini nyata, log
menampilkan `Missing required environment variables: appwriteApiKey` dan
`responseStatusCode` 500. Uji satu function saja sudah cukup membuktikan.

Prioritas uji: `create-user-profile` (dipanggil saat registrasi — kalau ini mati,
tidak ada user baru yang bisa terbentuk sama sekali).

## 6. Status blocker lain dari handoff Sprint 2

Enam poin yang kalian jawab di `c48f62b` sudah kami baca dan **semuanya kami setujui**:

| # | Poin | Catatan kami |
|---|---|---|
| 1 | Backfill notifikasi — 0 baris | Setuju, tidak perlu aksi |
| 2 | `wallets`/`transactions` terbuka | Setuju kritis. `read("users")` sudah hilang dari config — **pastikan config-nya sudah ter-push**, bukan hanya ter-commit |
| 3 | `transactions.status = "completed"` | Benar, `domain.ts` sudah menanganinya |
| 4 | `fesyen` → `fashion` | Setuju, 0 baris terdampak |
| 5 | Scope `users.read` | `function-scopes.json` sudah tepat |
| 6 | Fee 2% | Terima kasih — `0.15` di `create-campaign.utils.ts` memang kami lewatkan. Sekarang file itu memakai helper kanon `calculatePlatformFee()`, bukan literal |

## 7. Yang berubah di frontend hari ini

Sprint 2 selesai: view Kreator dilepas dari data fabrikasi. Tidak ada perubahan
skema, tidak ada Function baru, tidak ada logika bisnis yang berubah.

Satu hal yang mungkin relevan buat kalian: `creator_portfolios` tidak punya kolom
`platform`, `niche`, maupun `views`, padahal UI portofolio menampilkan ketiganya.
Untuk sekarang ketiganya dijadikan opsional dan disembunyikan bila kosong. Kalau
memang ketiganya bagian dari produk, kolomnya perlu ditambahkan — silakan putuskan.

---

## Rujukan

- Handoff Sprint 2: `00_BACKEND/integration-context/2026-07-23-frontend-sprint2-appwrite-changes.md`
- Mapping scope: `00_BACKEND/appwrite/function-scopes.json`
- Script deploy: `00_BACKEND/scripts/deploy-all-functions.sh`
