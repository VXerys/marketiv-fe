# Perubahan Sisi Appwrite — Sprint 2 Integrasi Frontend

| | |
|---|---|
| **Tanggal** | 2026-07-23 |
| **Pemicu** | Sprint 2 integrasi Appwrite — dashboard Kreator read-only |
| **Sifat** | Aditif (3 Function baru) + **perbaikan bug** pada 5 Function yang sudah ada. Nol perubahan skema. |
| **Status** | ⚠️ **BELUM di-push, BELUM di-deploy.** Masih di working tree. |
| **Runtime dampak** | Function baru: nol (frontend masih `NEXT_PUBLIC_USE_MOCK_DATA=true`). Perbaikan bug: **positif dan signifikan** — lihat §2. |

> **Terima kasih atas respons Sprint 1.** Pertanyaan #1 (generator divergen) dan #2 (data contract usang) sudah tuntas — generator tunggal membuat putaran ini jauh lebih bersih: regenerasi menghasilkan diff **48 baris tambah, 0 hapus**, persis 3 blok Function baru. Pertanyaan #3 dan #4 masih terbuka, diulang di §7.

---

## 1. Ringkasan perubahan

| # | Perubahan | Sifat | Berkas terdampak |
|---|---|---|---|
| A | **`Query` tidak di-import di 5 Function** | 🔴 Bug — Function crash saat dijalankan | `ai-fraud-precheck`, `calculate-campaign-reward`, `campaign-claimed`, `campaign-published`, `expire-stale-claims` |
| B | **Notifikasi ditulis tanpa permission baris** | 🔴 Bug — notifikasi tak pernah terbaca | 4 Function di atas (kecuali `ai-fraud-precheck`) |
| C | 3 Function DTO baru (read-only) | Aditif | `functions/get-creator-*` |
| D | Sinkron generator + config | Aditif | `appwrite/generate_appwrite_json.cjs`, `appwrite.config.json` |

---

## 2. Perubahan A — `Query` tidak pernah di-import (paling mendesak)

### Apa yang ditemukan

Lima Function memakai `Query.equal(...)` / `Query.limit(...)` tetapi baris import-nya hanya:

```js
import { Client, Databases, ID } from "node-appwrite";
```

Dalam ES module, `Query` yang tidak di-import adalah **`ReferenceError: Query is not defined`** — bukan `undefined`, melainkan exception yang melempar begitu baris itu dieksekusi.

| Function | Baris pemakaian | Akibat bila dipanggil |
|---|---|---|
| `calculate-campaign-reward` | 23–25, 116 | Reward campaign tidak pernah dihitung; pendingBalance kreator tidak bertambah |
| `campaign-claimed` | 39 | Klaim tidak pernah terverifikasi; UMKM tidak dinotifikasi |
| `campaign-published` | 22–23 | Kreator tidak pernah tahu ada campaign baru |
| `expire-stale-claims` | 19–21, 60 | Klaim basi tidak pernah kedaluwarsa; slot campaign tertahan selamanya |
| `ai-fraud-precheck` | 63–65, 154 | Deteksi duplikat postUrl gagal |

Itu **seluruh pipeline Campaign Mode (PPV)**. Karena frontend masih memakai mock, tidak ada yang pernah memicunya, jadi bug ini tidak terlihat sampai sekarang.

### Perbaikan

Satu baris per berkas:

```diff
- import { Client, Databases, ID } from "node-appwrite";
+ import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";
```

(`ai-fraud-precheck` hanya butuh `Query` — tidak menulis notifikasi.)

### Yang perlu kalian lakukan
**Redeploy kelima Function.** Perbaikan ini tidak ada hubungannya dengan Sprint 2 dan layak di-deploy duluan.

### Saran pencegahan
Tidak ada langkah build atau lint yang menyentuh `functions/**` — bug seperti ini lolos tanpa sinyal apa pun. Menambahkan satu langkah `node --check` untuk setiap `functions/*/src/main.js` di CI akan menangkap seluruh kelas kesalahan ini dalam hitungan detik.

---

## 3. Perubahan B — notifikasi tanpa permission baris

### Apa yang ditemukan

Collection `notifications` punya `$permissions: []` dan `rowSecurity: true`. Artinya akses **hanya** bisa datang dari permission per-baris. Dari lima Function yang menulis notifikasi, hanya `send-chat-notification` yang memasangnya:

```js
[Permission.read(Role.user(receiverId)), Permission.update(Role.user(receiverId))]
```

Empat lainnya menulis dokumen **tanpa argumen permission sama sekali** → baris tercipta, tidak error, tetapi tidak akan pernah terbaca oleh siapa pun dari klien. Gagal senyap: UI menampilkan daftar notifikasi kosong tanpa pesan kesalahan.

### Perbaikan

| Function | Pemilik notifikasi |
|---|---|
| `calculate-campaign-reward` | `creatorId` |
| `campaign-claimed` | `campaign.umkmId` |
| `campaign-published` | `creator.userId` |
| `expire-stale-claims` | `claim.creatorId` |

Semuanya diberi `[Permission.read(Role.user(...)), Permission.update(Role.user(...))]`. `update` diperlukan agar penerima bisa menandai notifikasi sudah dibaca (`isRead`).

Sekalian, `calculate-campaign-reward` juga kini memasang `Permission.read(Role.user(creatorId))` pada baris `transactions` yang dibuatnya — sejajar dengan yang sudah dilakukan `release-escrow`. Alasannya di §7 poin 3.

### ⚠️ Butuh keputusan kalian: baris notifikasi lama

Perbaikan ini hanya berlaku untuk notifikasi **baru**. Baris yang sudah terlanjur dibuat tanpa permission tetap tidak terbaca selamanya. Pilihan kalian:

- backfill permission lewat script admin (API key bisa membacanya), atau
- terima bahwa notifikasi pra-perbaikan hilang — mengingat frontend masih mock, kemungkinan besar jumlahnya nol atau sangat sedikit.

Kami tidak menjalankan backfill apa pun.

---

## 4. Perubahan C — 3 Function DTO baru

Semua **read-only**. Konfigurasi seragam dengan 4 Function Sprint 1: `runtime node-22`, `entrypoint src/main.js`, `commands npm install`, `execute ["users"]`, dependensi tunggal `node-appwrite@^14.1.0`, identitas dari header `x-appwrite-user-id` (**tidak pernah** dari body).

| Function ID | Timeout | Sumber data | Mengembalikan |
|---|---|---|---|
| `get-creator-profile` | 15s | `users` + `creator_profiles` + `creator_social_accounts` + akun Auth | `CreatorProfile` |
| `get-creator-dashboard-summary` | 30s | `campaigns` + `campaign_claims` + `campaign_submissions` + `orders` + `escrows` + `wallets` + `transactions` + `rate_cards` | `CreatorMetric` |
| `get-creator-negotiations` | 30s | `orders` + `offers` + `escrows` + `conversations` + `messages` + `umkm_profiles` + `rate_card_packages` + `deliverables` | `CreatorNegotiation[]` atau satu objek |

### Mengapa ketiganya tidak bisa jadi query klien

Bukan preferensi arsitektur — tiga tembok teknis:

1. **`escrows` tidak terbaca klien.** `$permissions: []` + `rowSecurity: true`, dan `create-escrow` memasang `Permission.read` pada dokumen **`transactions`**, bukan pada escrow-nya (baris 122). Jadi `CreatorNegotiation.escrowStatus` dan `CreatorMetric.escrowBalance` mustahil tanpa Function. *(Ini konsisten — `get-umkm-finance-summary` juga sudah menempuh jalur yang sama.)*
2. **Agregasi uang.** `CreatorMetric` menjumlahkan saldo, escrow, dan pendapatan dari 8 collection. Kontrak §9/§26 melarang klien menghitungnya, dan menariknya berarti klien mengunduh seluruh ledger.
3. **`orders` terlalu tipis.** Kolomnya hanya `offerId`, `packageId`, `creatorId`, `umkmId`, `amount`, `status`, `createdAt` — sementara view-model butuh judul proyek, scope, deadline, identitas UMKM, pesan terakhir, dan status escrow. Enam collection sekali jalan.

### Keputusan di dalam Function — yang paling perlu kalian review

| Field | Sumber yang dipilih | Alasan |
|---|---|---|
| `CreatorProfile.name` | akun Auth, fallback `creator_profiles.displayName` | Sama persis dengan `get-umkm-profile`; akun Auth lebih baru bila user ganti nama |
| `CreatorProfile.username`, `engagementRate` | `creator_social_accounts`, **satu akun yang sama** (TikTok diprioritaskan, lalu follower terbanyak) | Konvensi identik `get-creator-directory` — supaya username & engagement tidak dari akun berbeda |
| `CreatorProfile.startingPrice` | paket termurah dari rate card `published` | Sengaja mengabaikan draft **walaupun ini view pemilik**, supaya angkanya sama persis dengan yang dilihat UMKM |
| `CreatorProfile.instagramUrl` / `tiktokUrl` | disusun dari username | URL profil deterministik; tidak perlu kolom |
| `CreatorMetric.campaignEarnings` vs `rateCardEarnings` | `transactions.type = "release"`, dibedakan lewat `referenceType` (`campaign_submission` vs `escrow`) | Satu-satunya pembeda yang tersedia di ledger |
| `CreatorMetric.thisMonthEarnings` | filter `$createdAt` | `transactions` tidak punya kolom tanggal sendiri |
| `CreatorNegotiation.deliverables` | `rate_card_packages.output` | `offers.description` sudah dipakai sebagai `scope` |
| `CreatorNegotiation.unreadCount` | `messages` dengan `sender_id ≠ kreator` dan `read_at` kosong | — |

### ⚠️ Fee: sengaja berbeda dari mock

`src/mocks/creator-dashboard.mock.ts` memakai fee **3%** dan `totalAmount = finalPrice + platformFee`. Keduanya salah untuk kreator:

- tarifnya **2%** (`PLATFORM_FEE_RATE`, `00_BACKEND/src/services/wallet.service.ts`);
- rate card order adalah **seller-side** (ADR-008) — kreator **menerima** nominal **dikurangi** fee, bukan membayar tambahan.

`get-creator-negotiations` memakai 2% dibulatkan ke bawah dan `totalAmount = finalPrice − platformFee`. Mock akan kami luruskan saat wiring view.

### Yang **tidak** dikembalikan karena tidak ada sumbernya

Dikembalikan kosong/`undefined`, bukan diisi tebakan: `CreatorProfile.bannerUrl`, `averageViews`, `responseTime`, `completionRate`, `portfolioUrl`; `CreatorJob.targetViews`, `productDescription`, `targetAudience`, `thumbnailUrl`; `CreatorActiveWork.rejectedReason`.

`isVerified` dipetakan ke `isProfileCompleted` — konvensi yang sudah dipakai `get-umkm-profile` dan `get-creator-directory`. Bila verifikasi identitas nanti jadi konsep tersendiri, barulah kolom `isVerified` layak ada.

**Keputusan yang kami minta:** UI kreator menampilkan sebagian field di atas. Tambah kolom, atau hapus field-nya dari UI? Kami tidak mengarang nilainya.

---

## 5. Keamanan

- Identitas keempat—kini ketujuh—Function DTO selalu dari header `x-appwrite-user-id`, tidak pernah dari body.
- `get-creator-profile` menolak `403` bila `users.role !== "creator"`.
- `get-creator-negotiations` menyertakan `creatorId` **sebagai filter query**, bukan sebagai pemeriksaan setelah dokumen terambil — order kreator lain tidak pernah terbaca walaupun `orderId`-nya ditebak. Responsnya `404`, bukan `403`, supaya tidak membocorkan keberadaan order milik orang lain.
- Nomor WhatsApp, data bank, dan saldo tidak ikut dalam response profil.

---

## 6. ⚠️ Temuan keamanan: `wallets` & `transactions` terbuka untuk semua user

Bukan bagian dari perubahan kami — ditemukan saat menelusuri permission, dan kami **tidak mengubahnya sendiri**.

```
wallets       →  $permissions: ['read("users")']   rowSecurity: true
transactions  →  $permissions: ['read("users")']   rowSecurity: true
```

Di Appwrite, permission level koleksi memberi akses **terlepas dari** permission baris — document security menambah, bukan mempersempit. Artinya: **setiap pengguna yang login bisa membaca saldo dan seluruh riwayat transaksi pengguna mana pun**, cukup dengan satu `listDocuments` dari browser.

Perbaikan yang kami sarankan: kosongkan `$permissions` kedua koleksi dan andalkan permission baris, yang **sudah** dipasang oleh `create-user-wallet`, `create-escrow`, `release-escrow`, dan `wallet.service.ts`. Satu-satunya penulis yang belum memasangnya adalah `calculate-campaign-reward` — sudah kami perbaiki di §3, jadi pengetatan ini aman dilakukan setelah redeploy.

Kami tidak mengubahnya karena berpotensi memutus pembacaan yang saat ini berjalan, dan itu keputusan kalian. Tapi menurut kami ini temuan paling serius di dokumen ini.

---

## 7. Butuh keputusan tim backend

1. **Backfill permission notifikasi lama** — §3.
2. **Perketat `$permissions` `wallets` & `transactions`** — §6.
3. **`transactions.status` menulis `"completed"`**, nilai yang tidak ada di union `PaymentStatus | EscrowStatus`. Kami menambahkannya ke kanon frontend (`src/types/domain.ts`) karena itu memang nilai yang backend tulis — tapi kalau sebenarnya ini tidak disengaja dan seharusnya `"released"`, beri tahu kami dan kami cabut.
4. **Utang Sprint 1 #3 — `campaigns.category` masih string bebas.** Belum jadi enum, dan yang lebih mendesak: **apakah baris berisi `"fesyen"` sudah di-backfill ke `"fashion"`?** Bila belum, campaign itu akan tampil sebagai kategori `lainnya` di seluruh UI. Perintahnya sesederhana `category == "fesyen" → category = "fashion"`.
5. **Utang Sprint 1 #4 — scope API key `users.read`.** Masih belum terkonfirmasi. `get-creator-profile` juga memerlukannya, dengan degradasi anggun yang sama (bila tidak ada scope, `name` jatuh ke `displayName`, Function tidak gagal).
6. **`PLATFORM_FEE_RATE` frontend tertinggal di 5%** sejak fee diturunkan ke 2% (`2ab8113`). Sudah kami perbaiki di `src/types/domain.ts`. Ada satu lagi di `src/components/.../negotiation.utils.ts` yang hardcode **10%** — itu kode UMKM, akan kami tangani di `s3-fee-buyer`, kami sebut di sini supaya kalian tahu angka fee di UI belum bisa dipercaya.

---

## 8. Langkah deploy

Tidak ada perubahan skema — **tidak perlu `push table`**.

Perbaikan bug duluan (tidak bergantung pada apa pun):

```bash
appwrite push function --function-id ai-fraud-precheck --function-id calculate-campaign-reward --function-id campaign-claimed --function-id campaign-published --function-id expire-stale-claims
```

Lalu Function baru:

```bash
appwrite push function --function-id get-creator-profile --function-id get-creator-dashboard-summary --function-id get-creator-negotiations
```

Variabel di tiap Function baru:

| Variabel | Wajib | Catatan |
|---|---|---|
| `APPWRITE_API_KEY` | ✅ | `get-creator-profile` perlu scope `users.read` |
| `APPWRITE_DATABASE_ID` | ✅ | fallback: `NEXT_PUBLIC_DB_ID` |
| `APPWRITE_FUNCTION_API_ENDPOINT` / `APPWRITE_FUNCTION_PROJECT_ID` | ✅ | disuntikkan otomatis oleh Appwrite |
| `*_COLLECTION_ID` | ❌ | punya default sesuai nama collection — set hanya bila id kalian berbeda |

Function gagal cepat dengan `Missing required environment variables: ...`, jadi salah konfigurasi terlihat di log, bukan sebagai data kosong senyap.

### Verifikasi setelah deploy

Frontend masih memakai mock, jadi UI tidak berubah. Uji lewat Console (Execute) dengan akun kreator nyata:

- `get-creator-profile` — tanpa body. Uji negatif: jalankan dengan akun UMKM → harus `403`.
- `get-creator-dashboard-summary` — tanpa body.
- `get-creator-negotiations` — dua mode: tanpa body (array) dan `{"orderId":"..."}` (satu objek). Uji negatif: `orderId` milik kreator lain → harus `404`.
- **Perbaikan notifikasi** — picu satu `campaign-claimed`, lalu baca `notifications` dari sesi klien UMKM tersebut. Sebelum perbaikan hasilnya kosong; sesudahnya baris muncul.

---

## 9. Rollback

| Perubahan | Cara membatalkan | Risiko |
|---|---|---|
| 3 Function baru | Disable/hapus dari Console | Nol — read-only, tidak ada yang memanggil selama mock aktif |
| Import `Query` | Revert commit | **Jangan** — tanpa ini kelima Function crash |
| Permission notifikasi | Revert commit | Rendah, tapi mengembalikan gagal-senyap |

---

## 10. Yang **tidak** diubah

- Nol perubahan skema — tidak ada kolom, enum, index, atau bucket yang ditambah/dihapus/diubah.
- Logika bisnis (escrow, payout, fee, fraud) tidak disentuh — hanya import dan argumen permission.
- 4 Function DTO Sprint 1 tidak disentuh sama sekali.
- Tidak ada data yang ditulis atau di-backfill.

---

## Rujukan

- Skema sumber kebenaran: `00_BACKEND/appwrite.config.json`
- Tipe view-model kreator: `src/types/creator-dashboard.ts`
- Kanon enum & konstanta bisnis: `src/types/domain.ts`
- Lapisan pemanggil: `src/services/creator/creator-appwrite.service.ts`
- Handoff sebelumnya: `00_BACKEND/integration-context/2026-07-23-frontend-sprint1-appwrite-changes.md`
