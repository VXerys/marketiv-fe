# Perubahan Sisi Appwrite — Sprint 1 Integrasi Frontend

| | |
|---|---|
| **Tanggal** | 2026-07-23 |
| **Pemicu** | Sprint 1 integrasi Appwrite — dashboard UMKM read-only |
| **Sifat** | Aditif (tambah kolom + tambah Function). Tidak ada kolom dihapus atau berubah tipe. |
| **Status** | ⚠️ **BELUM di-push, BELUM di-deploy.** Masih di working tree. |
| **Runtime dampak** | **Nol untuk saat ini** — frontend masih `NEXT_PUBLIC_USE_MOCK_DATA=true`, jadi tidak ada satu pun query/Function ini yang dieksekusi. |

> **Untuk tim backend:** dokumen ini menjelaskan *mengapa* tiap perubahan diambil, bukan sekadar *apa* yang berubah. Bagian [Butuh keputusan kalian](#7-butuh-keputusan-tim-backend) adalah yang paling perlu direview.

---

## 1. Ringkasan perubahan

| # | Perubahan | Berkas terdampak |
|---|---|---|
| A | Rename nilai enum `fesyen` → `fashion` | `appwrite.config.json`, `appwrite/appwrite.json`, kedua generator, `docs/02_Modules/Users/50_Database.md`, 1 Function |
| B | Kolom baru `creator_profiles.niche` + index `idx_niche` | `appwrite.config.json`, `appwrite/appwrite.json`, kedua generator |
| C | 4 Function DTO baru (read-only) | `functions/get-*` |

---

## 2. Latar belakang: mengapa ada perubahan skema sama sekali

Frontend Sprint 1 memindahkan dashboard UMKM dari mock ke service layer. Saat memetakan tipe view-model (`src/types/umkm-dashboard.types.ts`) ke skema nyata, ditemukan bahwa **sebagian field tidak punya sumber data apa pun**, dan sebagian lain **butuh join lintas collection** yang tidak bisa dilakukan klien tanpa kehilangan data.

Dua pilihan yang tersedia:

1. Hitung/gabungkan di klien → melanggar `docs/marketiv-md/database/08-frontend-data-contract.md` §6, §15, §28 (agregasi & data finansial sensitif harus dari backend), dan memaksa klien menarik seluruh koleksi.
2. Sediakan Function DTO di backend → sesuai kontrak.

Kami memilih **opsi 2**. Satu kolom baru ditambahkan hanya ketika tidak ada cara lain menurunkan nilainya (lihat B).

---

## 3. Perubahan A — rename enum `fesyen` → `fashion`

### Apa
Nilai enum niche `fesyen` diganti menjadi `fashion` di seluruh stack (frontend + skema + Function + dokumen).

```diff
  "elements": [
      "kuliner",
-     "fesyen",
+     "fashion",
      "pariwisata", "edukasi", "kecantikan", "lainnya"
  ]
```

### Mengapa
Sebelumnya ada **dua kosakata untuk satu konsep**: nilai kanon `fesyen` (Bahasa) sementara id tab kategori di UI memakai `fashion` (Inggris). Akibatnya dibutuhkan fungsi penerjemah di frontend, dan setiap perbandingan yang lupa memakainya menghasilkan **filter yang diam-diam kosong** — tidak error, hanya tidak ada hasil. Bug seperti ini mahal dilacak.

Seluruh enum lain di sistem sudah berbahasa Inggris (`kuliner` dan `kecantikan` bertahan karena tidak punya padanan tunggal yang lazim; `fesyen` punya, yaitu `fashion`).

### Mengapa sekarang, bukan nanti
Kolom `creator_profiles.niche` **belum pernah di-push**. Artinya:

- **Sekarang:** ganti string di JSON → selesai, nol migrasi data.
- **Setelah di-push:** enum Appwrite tidak bisa diubah nilainya secara in-place — perlu tambah elemen baru, backfill seluruh baris, lalu hapus elemen lama, dengan jendela waktu di mana kedua nilai valid.

### ⚠️ Yang perlu kalian cek
`campaigns.category` bertipe **string bebas**, bukan enum, dan mungkin sudah berisi data. Jika ada baris dengan nilai `"fesyen"`, setelah perubahan ini frontend akan menampilkannya sebagai kategori fallback (`lainnya`), bukan Fashion. Mohon dicek dan di-backfill bila perlu:

```
category == "fesyen"  →  category = "fashion"
```

---

## 4. Perubahan B — kolom `creator_profiles.niche`

### Definisi

| Properti | Nilai |
|---|---|
| key | `niche` |
| type | `string` (enum) |
| required | `false` |
| size | `100` |
| default | `null` |
| elements | `kuliner`, `fashion`, `pariwisata`, `edukasi`, `kecantikan`, `lainnya` |
| index | `idx_niche` — type `key`, order `ASC` |

### Mengapa kolom baru, bukan diturunkan dari kolom lain
Kami menelusuri seluruh 28 tabel dan **tidak ada kolom yang bisa menurunkan niche kreator**:

- `campaigns.category` adalah kategori bisnis **UMKM**, bukan spesialisasi kreator. Kreator kuliner bisa mengerjakan campaign fesyen — memakainya akan salah label.
- `creator_portfolios` tidak punya kategori terstruktur.
- Menebak dari `bio` bersifat heuristik dan tidak deterministik.

Sementara itu, **filter niche adalah fungsi inti direktori kreator** (kontrak §15) — UMKM mencari kreator berdasarkan bidang. Tanpa kolom ini fitur tidak bisa dibangun.

### Dibuat `required: false` dengan sengaja
Agar aman di-push ke tabel yang sudah berisi data tanpa memblokir baris lama. Sebelum di-backfill, Function mengembalikan `"lainnya"` — UI tetap berfungsi, hanya filter yang belum presisi.

### Rencana backfill yang disarankan
Isi bertahap saat kreator melengkapi profil (onboarding), atau backfill massal bila kalian punya data kategori dari sumber lain. Tidak ada urgensi teknis — nilai `null` tertangani.

---

## 5. Perubahan C — 4 Function DTO baru

Semua **read-only**. Tidak ada satupun yang menulis ke database.

| Function ID | Timeout | Sumber data | Mengembalikan |
|---|---|---|---|
| `get-umkm-profile` | 15s | `users` + `umkm_profiles` + akun Auth | `UmkmProfile` |
| `get-umkm-dashboard-summary` | 30s | `campaigns` + `campaign_submissions` + `orders` + `escrows` | `UmkmDashboardSummary` |
| `get-umkm-finance-summary` | 30s | `payments` + `transactions` + `campaigns` + `orders` + `escrows` | `{ finance, escrow }` |
| `get-creator-directory` | 30s | `creator_profiles` + `creator_social_accounts` + `rate_cards` → `rate_card_packages` | `CreatorProfile[]` atau satu objek |

Konfigurasi seragam: `runtime: node-22`, `entrypoint: src/main.js`, `commands: npm install`, `execute: ["users"]`, dependensi tunggal `node-appwrite@^14.1.0`.

### Mengapa `get-umkm-finance-summary` mengembalikan dua objek sekaligus
Halaman Keuangan membutuhkan ringkasan finansial **dan** rincian escrow. Keduanya diturunkan dari himpunan dokumen yang sama. Memisahkannya menjadi dua Function berarti dua kali agregasi identik atas data yang sama pada setiap pembukaan halaman. Frontend memanggilnya lewat satu accessor gabungan (`getFinanceOverview()`).

### Keputusan skema di dalam Function — yang paling perlu kalian review

Empat field view-model tidak punya kolom sendiri. Untuk masing-masing kami memilih **memakai data yang sudah ada** ketimbang menambah kolom:

| Field | Sumber yang dipilih | Alasan menolak kolom baru |
|---|---|---|
| `ownerName` | Nama akun Appwrite Auth (`users.get().name`) | Sudah diisi saat registrasi dan sudah dipakai `create-user-profile` sebagai `displayName` kreator. Menyalinnya ke `umkm_profiles` menciptakan sumber kebenaran kedua yang langsung basi begitu user ganti nama akun. Fallback: `businessName`. |
| `whatsappNumber` | `users.phone` | Kolom sudah ada dan sudah terisi `create-user-profile`. Kolom terpisah baru layak **jika** nomor WhatsApp bisnis harus berbeda dari nomor login — dan saat itu tiba, hanya Function ini yang perlu berubah. |
| `username`, `engagementRate` | `creator_social_accounts` | Diambil dari **satu akun yang sama** (TikTok diprioritaskan sebagai platform MVP, lalu akun dengan follower terbanyak) supaya username dan angka engagement tidak merujuk akun berbeda. |
| `startingPrice` | Paket termurah dari `rate_cards` berstatus `published` → `rate_card_packages` | Draft rate card **tidak boleh bocor** ke UMKM. |

Jika kalian tidak setuju dengan salah satu keputusan di atas, perubahannya terlokalisasi di satu Function — bukan di skema.

### Bug yang ditemukan & diperbaiki

Implementasi frontend awal memetakan id kreator dari `creator_profiles.$id`. Itu salah: **`orders.creatorId`, `rate_cards.creatorId`, dan `wallets.userId` semuanya memakai `userId`**, bukan id dokumen profil. Akibatnya pencarian rate card untuk kreator mana pun akan selalu mengembalikan kosong — tanpa error.

`get-creator-directory` mengembalikan **`userId`** sebagai `id`. Mohon pertahankan konvensi ini di Function lain yang menyentuh kreator.

---

## 6. Keamanan

- **Identitas tidak pernah dikirim klien.** Keempat Function membaca header `x-appwrite-user-id` (diisi Appwrite dari sesi aktif) — bukan `userId` dari body. Ini **pola yang sudah kalian pakai**, bukan sesuatu yang baru: `create-payment`, `delete-file`, dan `validate-and-upload` sudah melakukan hal yang sama. `userId` tidak bisa dipalsukan dari browser.
- **`execute: ["users"]`** — hanya pengguna terautentikasi yang boleh menjalankan.
- **Pemeriksaan peran** — `get-umkm-profile` menolak dengan `403` bila `users.role !== "umkm"`.
- **Field sensitif tidak pernah keluar** di direktori kreator: nomor WhatsApp, saldo, dan data bank tidak ikut dalam response (kontrak §15).
- **Degradasi anggun** — bila API key tidak punya scope `users.read`, `get-umkm-profile` tidak gagal total; hanya `ownerName` jatuh ke `businessName`.

---

## 7. Butuh keputusan tim backend

Empat hal yang sengaja **tidak** kami putuskan sendiri:

1. **Kedua generator sudah divergen.** `appwrite/generate_appwrite_json.cjs` dan `.js` berbeda sekitar 250 baris satu sama lain, dan keduanya menghasilkan JSON indentasi 2 spasi sementara `appwrite.config.json` yang ter-commit memakai 4 spasi. Menjalankan generator akan menghasilkan reformat ±7.000 baris yang berisiko menimpa skema live. Karena itu **kedua JSON kami patch manual**, dan **kedua generator tetap kami update** agar regenerasi nanti tetap benar. Rekonsiliasi kedua generator sebaiknya kalian tangani.
2. **`docs/marketiv-md/database/08-frontend-data-contract.md` sudah usang.** Dokumen itu mendeskripsikan DTO snake_case Bahasa Indonesia (`campaign_aktif`, `harga_mulai`) sementara tipe TypeScript dan skema nyata memakai camelCase Inggris. Function mengikuti **tipe TypeScript**, bukan dokumen tersebut. Dokumen perlu diperbarui atau ditandai deprecated agar tidak menjebak kontributor berikutnya.
3. **`campaigns.category` masih string bebas.** Pertimbangkan menjadikannya enum yang sama dengan `creator_profiles.niche` supaya konsisten dan tervalidasi di level database.
4. **Scope API key.** `get-umkm-profile` butuh `users.read`. Mohon konfirmasi apakah kebijakan kalian mengizinkan itu untuk Function ini.

---

## 8. Langkah deploy

Urutan penting — schema dulu, baru Function.

```bash
appwrite push table --table-id creator_profiles
```

```bash
appwrite push function --function-id get-umkm-profile --function-id get-umkm-dashboard-summary --function-id get-umkm-finance-summary --function-id get-creator-directory
```

Lalu set variabel di tiap Function:

| Variabel | Wajib | Catatan |
|---|---|---|
| `APPWRITE_API_KEY` | ✅ | `get-umkm-profile` perlu scope `users.read` |
| `APPWRITE_DATABASE_ID` | ✅ | fallback: `NEXT_PUBLIC_DB_ID` |
| `APPWRITE_FUNCTION_API_ENDPOINT` / `APPWRITE_FUNCTION_PROJECT_ID` | ✅ | disuntik otomatis oleh Appwrite |
| `*_COLLECTION_ID` | ❌ | punya default sesuai nama collection (`payments`, `orders`, `escrows`, dst.) — set hanya bila id kalian berbeda |

Function gagal cepat dengan pesan `Missing required environment variables: ...` bila ada yang kurang, jadi salah konfigurasi akan terlihat langsung di log, bukan sebagai data kosong senyap.

### Verifikasi setelah deploy
Frontend **masih memakai mock** (`NEXT_PUBLIC_USE_MOCK_DATA=true`), jadi UI tidak akan berubah setelah deploy. Uji Function langsung lewat Console (Execute) dengan akun UMKM nyata. Mematikan flag mock adalah pekerjaan terpisah (`s5-mock-off`).

---

## 9. Rollback

| Perubahan | Cara membatalkan | Risiko |
|---|---|---|
| 4 Function | Disable/hapus dari Console | Nol — read-only, tidak ada yang memanggil selama mock aktif |
| Kolom `niche` | Hapus kolom | Rendah — optional, belum ada yang bergantung padanya |
| Rename enum | Revert commit sebelum push | Nol bila belum di-push |

---

## 10. Yang **tidak** diubah

- Tidak ada kolom dihapus, di-rename, atau berubah tipe.
- 16 Function yang sudah ada tidak disentuh sama sekali.
- Tidak ada logika bisnis (escrow, payout, fee, fraud) yang berubah.
- Tidak ada data ditulis — keempat Function read-only.

---

## Rujukan

- Skema sumber kebenaran: `00_BACKEND/appwrite.config.json` (`tables[].columns[]`)
- Tipe view-model frontend: `src/types/umkm-dashboard.types.ts`
- Kanon enum & konstanta bisnis: `src/types/domain.ts`
- Lapisan pemanggil: `src/services/umkm/umkm-appwrite.service.ts`
