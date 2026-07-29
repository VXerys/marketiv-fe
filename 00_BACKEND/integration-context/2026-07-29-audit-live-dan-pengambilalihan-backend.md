# Audit Live & Pengambilalihan Peran Backend

| | |
|---|---|
| **Tanggal** | 2026-07-29 |
| **Sifat** | Dokumen kerja tim sendiri — **bukan** handoff. Sejak hari ini tidak ada tim backend terpisah. |
| **Status** | ✅ **SELESAI** — runbook dijalankan 2026-07-29, `audit-live.mjs` melaporkan 0 blocker |
| **Menggantikan** | Bagian "menunggu tim backend" di `2026-07-28-sprint4-alur-b.md` §B dan `2026-07-28-handoff-auth-sprint6.md` §A/§E |

---

## 0. Perubahan Wewenang

Tim backend berhenti. Seluruh lapisan Appwrite — kode Function, konfigurasi,
permission, deploy, scopes, dan `00_BACKEND/docs/` — sekarang milik tim ini.
Dokumen yang sebelumnya ditulis sebagai serah-terima dibaca ulang sebagai daftar
kerja sendiri.

Satu batas tetap ada dan **bukan** soal wewenang: perintah yang **menulis** ke
Appwrite production diblokir classifier di lingkungan asisten. Baca lolos, tulis
tidak. Jadi polanya tetap — skrip disiapkan lengkap di repo, dijalankan manusia
di terminal. Semua skrip di bawah punya mode `--dry` dan sudah diverifikasi
kering.

---

## 1. Cara Mengaudit Ulang

```bash
cd 00_BACKEND
node appwrite/ops/audit-live.mjs      # bucket, tabel, kolom, deployment  (READ-ONLY)
npm run fn:drift                       # field runtime Function            (READ-ONLY)
```

`audit-live.mjs` **baru** dibuat hari ini. `drift.mjs` hanya membandingkan field
runtime Function dan buta terhadap bucket, tabel, dan kolom — persis kategori
yang menyembunyikan empat dari enam blocker di bawah.

---

## 2. Temuan — 6 Blocker Live

Terverifikasi terhadap project live, bukan dugaan.

| # | Temuan | Dampak nyata |
|---|---|---|
| 1 | Bucket **`user-files` tidak ada di live** | Config & frontend menunjuk ke sana; unggahan dialihkan ke bucket yang salah (lihat §3) |
| 2 | `deliverables` masih `read("users")` + `update("users")` di level koleksi | **Kreator mana pun bisa menyetujui deliverable siapa pun.** `release-escrow` dipicu `deliverables.rows.*.update` dan hanya memeriksa `status === "approved"` — jadi ini jalur mencairkan escrow tanpa persetujuan UMKM |
| 3 | `revisions` sama | Isi & riwayat revisi semua order terbaca dan bisa diubah siapa pun |
| 4 | Kolom **`creator_profiles.niche` hilang di live** | Sisa migrasi enum yang gagal 2026-07-27: kolomnya telanjur dihapus, push berhenti, tidak ada yang membuat ulang. Setiap tulis `niche` ditolak 400 |
| 5 | `get-umkm-negotiations` belum pernah di-push | Halaman Negosiasi UMKM kosong |
| 6 | `notify-order-activity` belum pernah di-push | Notifikasi deliverable & revisi mati |

Ditambah **6 Function yang kodenya sudah diperbarui di repo tapi belum di-deploy**:
`release-escrow` (fee 2% + ledger `fee` + guard status order), `create-order`,
`create-escrow` (notifikasi), `validate-and-upload` (`shareWithOrderId`),
`ai-brief` (clamp 5 kolom), `get-creator-negotiations` (kontrak `conversationId`).

---

## 3. Temuan Terberat — Berkas Unggahan Terbuka Publik

`validate-and-upload` di live punya `DEFAULT_STORAGE_BUCKET_ID = campaign-assets`.
Bucket itu `read("any")` dengan `fileSecurity: false`.

Dua akibat sekaligus:

1. **Setiap berkas yang diunggah bisa diunduh siapa pun tanpa login** — deliverable
   order orang lain, dokumen pribadi, apa pun.
2. Karena `fileSecurity: false`, seluruh `Permission.read` per-berkas yang dipasang
   Function **diabaikan server**. Jadi mekanisme `shareWithOrderId` yang dirancang
   untuk membagi deliverable ke pihak lawan tidak pernah berfungsi sedikit pun —
   ia hanya tampak berfungsi karena semua orang memang sudah bisa membaca semuanya.

Ini lebih berat daripada kebocoran bucket yang tercatat sebelumnya, dan sudah live.

**Akar masalahnya dokumen.** `01_Global/40_Folder_Structure.md` menandai
`user-files` sebagai *"dormant — post-MVP"*, jadi bucket-nya tidak pernah dibuat
dan unggahan dialihkan ke bucket publik. Sementara frontend
(`src/lib/appwrite/config.ts:11`) dan seluruh desain kuota `validate-and-upload`
mengasumsikan `user-files` aktif. Dokumen sudah dikoreksi.

**Yang meringankan:** seluruh bucket berisi **0 berkas**, dan `deliverables`,
`revisions`, `orders` berisi **0 baris**. Jadi tidak ada data yang bocor dan
tidak ada pemilik yang terkunci saat permission diketatkan.

---

## 4. Dua Koreksi atas Catatan Lama

**A-1 bukan blocker.** Handoff Sprint 6 menyebut `create-user-profile` butuh
execute permission untuk role `users`. Ternyata sudah ada — di config **dan** di
live (`fn:drift` melaporkan 0 selisih field). Register lewat `functions.createExecution()`
seharusnya sudah bisa jalan sekarang.

**Blocker API key runtime sudah beres di kode.** Ke-28 Function sudah membaca
`req.headers["x-appwrite-key"]`. Yang tertinggal hanya 23 `.env.example` yang masih
mencantumkan `APPWRITE_FUNCTION_API_KEY` seolah dipakai runtime — sudah diganti
komentar penjelas hari ini.

---

## 5. Temuan Tambahan

| Temuan | Tindakan |
|---|---|
| `ai-brief.APPWRITE_FUNCTION_API_KEY` menyimpan API key 265 karakter dengan `secret: false` — terbaca siapa pun yang punya akses baca konsol/API, sekaligus **tidak berfungsi** karena prefix `APPWRITE_` reserved | Dihapus oleh `fix-function-vars.mjs`. **Cabut key itu di konsol Appwrite** — ia sudah pernah terekspos |
| 14 variabel `APPWRITE_FUNCTION_API_ENDPOINT` / `APPWRITE_FUNCTION_PROJECT_ID` dibuat manual bernilai kosong di 7 Function `get-*` | Dihapus. Nama reserved, Appwrite meng-inject-nya saat runtime; keberadaannya jebakan bagi yang mengira perlu diisi |
| Frontend `provisionUserProfile()` tidak mengirim `email` & `name` | Diperbaiki — `users.email` dan `creator_profiles.displayName` sebelumnya tersimpan string kosong |
| `harden-permissions.mjs` abort dengan stacktrace saat bucket target tidak ada | Diperbaiki — melaporkan `MISS` lalu lanjut |
| **Variabel Function tidak terlacak di repo** (`appwrite.config.json` tidak punya blok `variables`) | Sebagian tertutup oleh `scripts/sync-env-all-functions.sh` — lihat §6a. Sumber kebenarannya `functions/<id>/.env` yang **gitignored**, jadi nilainya tetap tidak terversion; yang berubah adalah sekarang ada satu jalur resmi menyetelnya |
| Harness `vitest`: **103 dari 121 tes gagal** | **Di luar scope perbaikan ini.** Bukan blocker — tidak ada fungsi yang bergantung padanya. Sebagian ekspektasinya juga sudah usang terhadap ADR-008 (mis. `createPayment ... adds 2% fee to totalAmount`, padahal fee seller-side). Perlu workstream sendiri |

---

## 6. Runbook — 5 Langkah Tulis ke Production

Urut. Jangan dilompati: langkah 2 bergantung pada 1, dan 5 memverifikasi semuanya.
Semua skrip idempoten dan aman diulang.

```bash
cd 00_BACKEND
```

**1. Buat bucket `user-files`** — menutup §3
```bash
node appwrite/ops/ensure-buckets.mjs --dry && node appwrite/ops/ensure-buckets.mjs
```

**2. Arahkan unggahan ke bucket itu & buang variabel bermasalah** — menutup §3 & §5
```bash
node appwrite/ops/fix-function-vars.mjs --dry && node appwrite/ops/fix-function-vars.mjs
```

**3. Ketatkan permission gelombang 3 & 4** — menutup blocker 2 & 3
```bash
node appwrite/ops/harden-permissions.mjs --dry && node appwrite/ops/harden-permissions.mjs
```

**4. Pulihkan kolom yang hilang** — menutup blocker 4
```bash
node appwrite/ops/ensure-columns.mjs --dry && node appwrite/ops/ensure-columns.mjs
```

**5. Deploy Function** — menutup blocker 5, 6, dan 6 Function yang kodenya tertinggal
```bash
appwrite push functions --all --force
npm run fn:drift          # harap: NO DRIFT
node appwrite/ops/audit-live.mjs   # harap: tidak ada blocker
```

⚠️ `get-creator-negotiations` kontraknya berubah (`{orderId}` → `{conversationId}`).
Frontend Alur B yang sudah di-commit **tidak kompatibel** dengan versi lama dan
sebaliknya, jadi langkah 5 harus naik bersamaan dengan frontend yang sudah ada di
`staging`.

Sesudah langkah 2: **cabut API key `ai-brief` yang lama di konsol Appwrite.**

### 6a. Peringatan urutan — `sync-env-all-functions.sh`

`00_BACKEND/scripts/sync-env-all-functions.sh` menyalin `functions/<id>/.env` ke
Appwrite. Saat ini **tidak ada satu pun `.env` di repo** (semuanya gitignored),
jadi skrip itu melewati semua Function dan tidak berbenturan dengan apa pun.

Tapi begitu `.env` dibuat, **urutannya jadi penting**: menjalankan skrip itu
*setelah* langkah 2 akan menimpa ulang variabel dari isi `.env`. Kalau `.env`
menyalin nilai lama, `DEFAULT_STORAGE_BUCKET_ID` kembali ke `campaign-assets`
dan lubang §3 terbuka lagi — diam-diam, karena skripnya melaporkan sukses.

Dua pengaman sudah dipasang:

1. `functions/validate-and-upload/.env.example` sekarang berisi
   `DEFAULT_STORAGE_BUCKET_ID=user-files` eksplisit (dulu placeholder
   `your-storage-bucket-id`), dengan penjelasan kenapa jangan diarahkan ke
   `campaign-assets`.
2. Ke-23 `.env.example` tidak lagi memuat `APPWRITE_FUNCTION_API_KEY`, jadi
   `.env` yang dibuat dari template tidak akan menghidupkan ulang variabel yang
   dihapus langkah 2.

Setelah menjalankan skrip itu kapan pun, verifikasi dengan
`node appwrite/ops/audit-live.mjs` dan periksa ulang
`DEFAULT_STORAGE_BUCKET_ID`.

---

## 6b. Hasil Eksekusi Runbook — SELESAI

Seluruh 5 langkah dijalankan 2026-07-29. `node appwrite/ops/audit-live.mjs`
melaporkan **"Tidak ada selisih. Live sama dengan config."** — 28 Function,
28 tabel, 7 bucket, semua kolom `available`, semua variabel terisi.

Keenam blocker di §2 tertutup, dan lubang berkas terbuka publik di §3 ikut
tertutup: `user-files` dibuat dengan `create("users")` + `fileSecurity=true`,
dan `DEFAULT_STORAGE_BUCKET_ID` diarahkan ke sana.

Dua hal yang muncul saat eksekusi dan sudah diperbaiki:

1. **Dua Function baru tidak punya variabel sama sekali.** Deploy-nya berhasil,
   tapi `getEnv()` fail-fast saat `databaseId` kosong dan `APPWRITE_DATABASE_ID`
   tidak punya default di kode — jadi keduanya akan melempar di setiap
   eksekusi. Paket `.env` kiriman tidak memuatnya karena tim backend memang
   tidak pernah punya kedua Function itu. `audit-live.mjs` sekarang menandai
   Function tanpa variabel sebagai blocker supaya tidak terulang.
2. **`sync-env-all-functions.sh` tidak bisa dipakai** — butuh `jq` dan CLI
   `appwrite` di PATH, keduanya tidak ada di mesin dev. Skrip itu melaporkan
   seluruh 28 Function `NOT DEPLOYED` padahal semuanya live. Diganti
   `appwrite/ops/sync-function-vars.mjs` yang tanpa dependensi tambahan.

**Belum diverifikasi:** belum ada satu pun eksekusi Function setelah deploy
2026-07-29 02:37. Konfigurasi sudah benar, tapi belum ada bukti runtime.
Smoke test adalah langkah berikutnya.

## 7. Yang Masih Terbuka Setelah Runbook

| # | Item | Catatan |
|---|---|---|
| 1 | Provider Google OAuth + URL callback | Aksi konsol. Frontend sudah menyembunyikan tombolnya di balik flag, jadi tidak memblokir demo |
| 2 | URL recovery password terdaftar sebagai platform Web | Aksi konsol. Daftarkan origin lokal & staging; tautan email menuju `<origin>/reset-password` |
| 3 | Atomicity `release-escrow` — jendela "escrow sudah `released` tapi wallet belum" | Urutan sekarang sengaja: escrow di-flip dulu supaya kegagalan di tengah tidak membayar kreator dua kali. Kebalikannya berisiko bayar ganda dan itu tidak bisa ditarik |
| 4 | Variabel Function belum terlacak di repo | Lihat §5 |
| 5 | Harness `vitest` 103/121 gagal | Lihat §5 |
| 6 | Bucket `deliverables` di config tidak dipakai | Putuskan: pakai atau hapus dari config |

---

## ✅ Resolusi — Audit Kedua, 2026-07-29 sore

Laporan **"0 blocker"** di §6b ternyata terlalu percaya diri. `audit-live.mjs`
saat itu hanya membandingkan **konfigurasi**; ia tidak memeriksa *deployment mana
yang aktif* dan tidak memeriksa *apakah Function pernah benar-benar jalan*. Kedua
hal itu diperiksa langsung ke API live pada audit kedua, dan di sana ada blocker
yang lolos.

### B-1 — `create-order` menjalankan kode 2026-07-27 (BLOCKER)

Deployment aktifnya `6a67756c489cb4025284`, dibuat **2026-07-27T15:12:44**,
padahal `create-order/src/main.js` terakhir berubah di commit `b8f976c`
(2026-07-28 02:50 UTC).

Ada **5 deployment `ready` dari 2026-07-29** (02:47, 02:52, 02:57, 02:59, 03:04)
yang tidak pernah diaktifkan, plus satu yang tersangkut `building` sejak 03:06:14
— padahal build log-nya sendiri sudah menulis `Build finished.` pada 03:06:19.
Build-nya selesai; status-nya yang tidak pernah dibalik, dan pointer deployment
aktif tidak pernah maju.

Yang tidak pernah hidup di live akibatnya (+73 baris dari `b8f976c`):

1. Cabang `offer.status === "rejected"` — notifikasi **"Penawaran Ditolak"** ke UMKM.
2. Notifikasi **"Penawaran Diterima — selesaikan pembayaran"** setelah order dibuat.

Pembuatan order-nya sendiri tetap jalan; perbaikan itu dari `24ede86` dan sudah
masuk deployment 07-27. Jadi bukan alur uang yang putus, tapi dua titik notifikasi
Alur B mati — dan yang lebih penting, **isi repo ≠ isi live** untuk Function ini,
asumsi yang dipakai seluruh dokumen di folder ini.

`create-escrow` juga tertinggal (aktif 02:37:15, ada `ready` 03:06:07), tapi kode
di antara keduanya identik — yang berubah hanya `.env.example`. Kosmetik, tetap
diselaraskan.

**Ditutup** oleh `appwrite/ops/activate-latest-deployment.mjs`.

### B-2 — `audit-live.mjs` buta terhadap kesegaran deployment (lubang perkakas)

Blok Function-nya hanya memeriksa **apakah `deploymentId` ada**, bukan apakah itu
`ready` terbaru. Persis lubang yang meloloskan B-1 — dan alasan kenapa laporan
"0 blocker" di §6b terasa lebih meyakinkan daripada kenyataannya.

**Ditutup:** `audit-live.mjs` sekarang menandai `STALE-DEP` sebagai blocker,
lengkap dengan tanggal kedua deployment dan perintah perbaikannya.

### B-3 — Build tersangkut sebagai gejala push tidak tuntas

Build yang menggantung inilah yang menghentikan `appwrite push` di tengah dan
menyebabkan B-1. Appwrite Cloud tidak pernah membersihkannya sendiri: project ini
punya sisa build `building` dari 2026-07-26 s/d 07-28 di 16 dari 28 Function.

**Ditutup sebagai warning yang terfilter.** Hanya build yang **lebih baru dari
deployment aktif** yang dilaporkan — build lebih tua berarti push sesudahnya sudah
berhasil dan tidak ada yang perlu dikerjakan. Tanpa filter itu peringatannya muncul
di 16 Function dan berhenti dibaca orang. Setelah difilter tersisa 3:
`delete-file`, `create-order`, `campaign-claimed`.

### B-4 — Akun sisa tanpa wallet

1 akun Auth `testing@gmail.com` (dibuat 2026-07-26) dengan `prefs` **kosong**
— tanpa role, jadi resolusi role di frontend tidak akan jalan untuknya. Punya baris
di `users`, `creator_profiles`, `user_storage_usage`, tapi `wallets` **0 baris**,
dan `create-user-wallet` **belum pernah tereksekusi sekali pun** (`total=0`) meski
event `users.*.create`-nya terpasang benar di live.

**Keputusan:** hapus akun beserta tiga baris yatimnya, mulai dari nol. Registrasi
ulang nanti sekaligus jadi bukti pertama bahwa trigger `users.*.create` menyala.

### Yang tetap terbuka: nol bukti runtime

**0 eksekusi di seluruh 28 Function setelah deploy 02:37.** Ke-40 eksekusi
historis berasal dari 2026-07-25 s/d 07-29 pagi, sebelum perbaikan. Kegagalannya
(`missing scopes ["documents.read"]`, `Cannot find package 'node-appwrite'`,
`Missing required environment variables: appwriteApiKey`) semuanya pre-deploy dan
secara kode sudah ditutup — tapi belum satu pun terbukti sembuh.

E2E penuh Alur A + B **sengaja ditunda sampai sprint UI selesai**. Sampai itu
dijalankan, kalimat yang jujur tentang backend ini adalah *"konfigurasinya benar
dan terverifikasi"*, bukan *"backend-nya jalan"*.

### Pelajaran

Dua kali berturut-turut laporan bersih datang dari perkakas yang tidak memeriksa
kategori tempat kerusakannya berada — 07-29 pagi `drift.mjs` buta terhadap bucket
dan kolom, 07-29 sore `audit-live.mjs` buta terhadap deployment. Polanya sama:
**"tidak ada temuan" hanya sekuat daftar hal yang diperiksa.** Saat sebuah audit
melaporkan nol, yang pertama diperiksa sebaiknya daftar cek-nya, bukan hasilnya.
