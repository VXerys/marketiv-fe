# Sprint 6 (Auth) — Permintaan ke Tim Backend

| | |
|---|---|
| **Tanggal** | 2026-07-28 |
| **Dari** | Tim frontend/integrasi |
| **Untuk** | Tim backend — mohon direview bersama `2026-07-28-sprint4-alur-b.md` |
| **Status** | ⬜ Menunggu review & eksekusi |
| **Sifat** | **Hanya berisi item yang wewenangnya di kalian.** Semua perbaikan yang bisa kami kerjakan sendiri sudah kami kerjakan — daftarnya di §D, tidak butuh tindakan kalian. |

---

## 0. Kenapa Dokumen Ini Ada Sekarang

Kami memvalidasi ulang seluruh item sidebar terhadap integrasi Appwrite sebelum demo 2 akun (audit lengkap: `docs/audits/2026-07-28-validasi-sidebar-integrasi.md`). Hasilnya: **belum ada cara untuk login sama sekali** — `src/app/` tidak punya route auth, dan navbar landing menautkan langsung ke `/dashboard/*`.

Jadi Sprint 6 (Auth) naik jadi **prasyarat demo**, bukan lanjutannya. Dari situ muncul empat pertanyaan yang menyentuh wilayah kalian, plus satu temuan pada `create-user-profile`.

**Ringkasan kebutuhan:**

| # | Item | Sifat |
|---|---|---|
| **A-1** | Eksekusi sinkron `create-user-profile` + execute permission | 🔴 Blocker register |
| **A-2** | Keputusan: trigger event `users.*.create` dipertahankan? | 🟡 Konfirmasi |
| **A-3** | Provider Google OAuth + URL callback per environment | 🟡 Bisa ditunda |
| **A-4** | URL recovery password terdaftar sebagai platform | 🔴 Blocker lupa password |
| **A-5** | Permission `delete` pada baris `notifications` — disengaja? | 🟢 Konfirmasi |
| **A-6** | Welcome notification yang didokumentasikan tapi tidak ada | 🟢 Sinkronisasi dokumen |
| **B** | Pengingat: §B handoff Alur B masih ⬜ seluruhnya | 🔴 Blocker demo |

---

## A. Permintaan Baru

### A-1 🔴 `create-user-profile` tidak akan pernah jalan lewat event saat register

**Temuan.** Function mengambil role dari `user.role || user.prefs?.role || user.labels?.find(...)` dan **menolak 400** kalau tidak ketemu (`main.js:15-18`). `businessName`, `category`, `phone`, `displayName` juga dibaca dari `prefs`.

Tapi `prefs` hanya bisa diisi lewat `account.updatePrefs()`, yang **butuh sesi aktif**. Jadi urutan di klien pasti begini:

```text
account.create()                     ← event users.*.create MENYALA di sini
account.createEmailPasswordSession()
account.updatePrefs({ role, ... })   ← prefs baru ada di sini
```

Saat event mengeksekusi Function, `prefs` masih kosong dan `labels` masih kosong → tidak ada role → **400**. Hasilnya: **tidak ada baris `users`, tidak ada `umkm_profiles`/`creator_profiles`, tidak ada `user_storage_usage`.** Hanya `create-user-wallet` yang lolos, karena ia cuma butuh `$id`.

Ini juga sebabnya kami tidak bisa menyalahkan Function-nya: `docs/02_Modules/Authentication/60_API.md` sudah menuliskan maksud yang benar — *"Profil dan storage usage dibuat **sinkron** oleh function `create-user-profile`"*. Yang tidak sinkron dengan dokumen adalah `appwrite.config.json`, yang memasangnya sebagai `["users.*.create"]`.

**Yang kami minta:**

1. **Execute permission** untuk role `users` pada `create-user-profile`, supaya klien bisa memanggilnya lewat `functions.createExecution()` setelah prefs terpasang.
2. **Verifikasi Function menerima payload eksekusi manual**, bukan hanya payload event. `getEventUser(req)` sudah membaca `req.bodyJson` apa adanya, jadi body `{ $id, role, prefs: {...} }` seharusnya langsung cocok — tapi tolong dikonfirmasi, karena kami tidak bisa mengetesnya tanpa permission di atas.

**Kenapa sinkron, bukan menaruh role di `labels` saat create.** Menulis `labels` butuh API key server-side; klien tidak punya. Alternatif lain (Function terpisah yang membungkus seluruh register) berarti password melewati Function — kami lebih memilih password tetap hanya di jalur Appwrite Auth.

### A-2 🟡 Trigger event `users.*.create` — dipertahankan atau dilepas?

**Rekomendasi kami: dipertahankan.** Function-nya sudah idempoten seluruhnya — `ensureUserMirror`, `ensureUmkmProfile`, `ensureCreatorProfile`, `ensureStorageUsage` semuanya cek-dulu-baru-tulis lewat `findByUserId`. Jadi eksekusi ganda (event + sinkron) tidak menghasilkan duplikat, dan event tetap berguna sebagai jaring pengaman untuk akun yang dibuat lewat konsol.

Konsekuensinya: setiap register akan menghasilkan **satu eksekusi gagal 400 di log** (dari event, sebelum prefs ada) diikuti satu eksekusi sukses (sinkron). Kalau log yang berisik itu mengganggu, kami setuju trigger dilepas — tapi tolong beri tahu kami, karena kalau dilepas maka jalur sinkron jadi satu-satunya dan kegagalannya harus kami tangani lebih keras di UI.

### A-3 🟡 Google OAuth — konfigurasi provider & callback

`30_Business_Rules.md` menyebut Google OAuth tersedia untuk kedua role. Yang kami butuhkan dari kalian:

- Provider Google diaktifkan di konsol Appwrite (client ID + secret).
- URL success/failure terdaftar per environment (lokal `http://localhost:3000`, staging).

**Ini boleh ditunda.** Kalau belum siap saat demo, kami sembunyikan tombol Google lewat flag dan register manual sudah cukup untuk membuat 2 akun. Tolong kabari saja mana yang realistis, supaya kami tidak menahan `s6-oauth-google` tanpa alasan.

### A-4 🔴 URL recovery password harus terdaftar

`account.createRecovery(email, url)` menolak URL yang host-nya tidak terdaftar sebagai platform Web di project Appwrite. Mohon pastikan platform untuk `http://localhost:3000` dan host staging sudah terdaftar. Tanpa ini, `/lupa-password` gagal di panggilan pertama.

### A-5 🟢 Baris `notifications` tidak bisa dihapus pemiliknya — disengaja?

Saat menyambungkan halaman `/notifikasi` ke collection `notifications`, kami menemukan bahwa Function penulis memberi baris `[Permission.read(Role.user(userId)), Permission.update(Role.user(userId))]` — **tanpa `delete`**.

Artinya pemilik notifikasi bisa menandainya sudah dibaca, tapi tidak bisa menghapusnya. UI lama punya tombol "Hapus" per baris **dan** "Hapus Sudah Dibaca"; keduanya akan 401 begitu mock dimatikan, jadi **kami buang** dan hanya menyisakan tandai-sudah-dibaca.

Mohon konfirmasi mana yang kalian mau:

- **(a) Biarkan.** Notifikasi jadi log yang tidak bisa dihapus. Tidak ada pekerjaan tambahan; UI sudah menyesuaikan.
- **(b) Tambahkan `Permission.delete(Role.user(userId))`** di Function penulis notifikasi. Kalau ini yang dipilih, kabari kami dan tombolnya kami kembalikan.

Kami tidak menyentuh Function-nya karena itu wilayah kalian.

### A-6 🟢 Welcome notification yang didokumentasikan tapi tidak ada

`docs/02_Modules/Authentication/90_Events.md` menugaskan Welcome Notification ke `create-user-wallet` ("Efek 3"). Kami baca `functions/create-user-wallet/src/main.js` seluruhnya — Function itu **tidak menulis notifikasi apa pun**; ia hanya membuat baris `wallets`.

Ini pola yang sama dengan `notify-client-review` di Sprint 4: dokumen menyebut sesuatu yang tidak pernah dibangun. Tidak memblokir apa pun, tapi mohon diputuskan — implementasikan, atau hapus dari dokumen. Kami tidak menyentuhnya karena itu Function kalian.

---

## B. Pengingat: §B Handoff Alur B Masih ⬜ Seluruhnya

Dari `2026-07-28-sprint4-alur-b.md`, belum ada yang bisa kami verifikasi sudah naik:

| Item | Yang terblokir kalau belum naik |
|---|---|
| `get-umkm-negotiations` (**baru**) | Halaman Negosiasi UMKM kosong |
| `get-creator-negotiations` (kontrak berubah ke `{conversationId}`) | Halaman Negosiasi Kreator kosong |
| `notify-order-activity` (**baru**) | Notifikasi deliverable & revisi |
| `release-escrow` (fee 2% + guard status order) | Angka di layar kreator ≠ saldo wallet |
| `create-order`, `create-escrow` (notifikasi) | 4 titik notifikasi Rate Card |
| `validate-and-upload` (`shareWithOrderId`) | UMKM tidak bisa membuka deliverable yang harus ia review |
| `ai-brief` (clamp 5 kolom) | Brief hilang senyap saat model melewati batas |
| `harden-permissions.mjs` gel. 3 & 4 | **Kreator bisa menyetujui pekerjaannya sendiri dan menarik escrow**; bucket `user-files` terbaca semua user |

⚠️ `get-creator-negotiations` **harus naik bersamaan** dengan commit frontend Alur B — kontraknya tidak kompatibel dua arah.

Demo 2 akun melewati seluruh rantai ini. Kami tidak menjadwalkan demo sampai §B selesai.

---

## C. Blocker Lama yang Belum Tertutup

`APPWRITE_FUNCTION_API_KEY` hanya ada saat build, tidak saat runtime (`2026-07-25-blocker-api-key-runtime.md`). Function yang kami panggil dari klien memakai header `x-appwrite-key` dan sudah bekerja; yang masih tersangkut adalah `ai-brief` di wizard campaign.

Selama belum tertutup, wizard tetap bisa diselesaikan — brief AI adalah aksi opsional, bukan langkah wajib. Jadi ini **tidak memblokir demo**, hanya membuat satu tombol tidak berfungsi.

---

## D. Yang Sudah Kami Kerjakan Sendiri — Tidak Butuh Tindakan Kalian

Dicantumkan supaya kalian tahu apa yang berubah di sisi frontend, bukan untuk direview.

| # | Perubahan | Sebab |
|---|---|---|
| 1 | `session.service.ts` query `users` lewat kolom **`userId`**, bukan `$id` | `create-user-profile` menulis baris dengan `ID.unique()` dan menyimpan id Auth di kolom `userId` — persis seperti `findByUserId` mencarinya. Query lama tidak akan pernah cocok |
| 2 | `SessionUser.name` diambil dari akun Auth, `avatarUrl` dihapus | Collection `users` tidak punya kolom `name` maupun `avatarUrl`; kode lama membaca kolom yang tidak ada |
| 3 | 8 route dipindah dari Server Component ke klien | Sesi Appwrite hidup di browser — pelajaran `s3-ssr-session`, baru diterapkan sebagian |
| 4 | `getOverview()` disambungkan ke `get-umkm-dashboard-summary` | Sebelumnya mengembalikan `success: false` harfiah saat mock OFF |
| 5 | Dua panel sidebar hardcode dibuang | Data karangan yang tampil di setiap layar |
| 6 | `/notifikasi` kedua role disambungkan ke `notifications` | Sebelumnya 20 baris hardcode, lengkap dengan nominal & nomor rekening |
| 7 | 7 fallback `"Dapur Sehat Sukabumi"` dihapus | Kegagalan baca profil tampil sebagai nama usaha orang lain, bukan sebagai kegagalan |

Kami **tidak** menyentuh: kode Function apa pun, `appwrite.config.json`, `function-scopes.json`, dan skrip di `appwrite/ops/`.
