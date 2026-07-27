# Perubahan Sisi Appwrite — Sprint 3 Integrasi Frontend (Lapisan Tulis)

| | |
|---|---|
| **Tanggal** | 2026-07-25 (diperbarui setelah merge dengan `27b7ea7`) → 2026-07-27 (verifikasi B-1…B-5, lihat §Resolusi di bawah) |
| **Pemicu** | Sprint 3 integrasi Appwrite — lapisan **tulis** satu-sisi. Sebelum sprint ini frontend punya **nol** fungsi tulis. |
| **Status** | ✅ **B-1, B-2, B-4, B-5 selesai** · 🔴 **B-3 (`doAndDont` 400 char) masih terbuka** — lihat §Resolusi |
| **Sifat** | 1 Function baru + perbaikan bug pada 2 Function + 1 perbaikan generator. **Nol perubahan skema.** |
| **Terima kasih** | Blocker `APPWRITE_FUNCTION_API_KEY` sudah kalian selesaikan di `27b7ea7`. Kami verifikasi ulang setelah merge — hasilnya benar dan menyeluruh. Detail di §1. |

---

## 0. Ringkasan 1 menit

**Yang berubah untuk kalian:**

1. Ada **Function ke-24 baru**: `request-withdrawal`. Belum pernah di-deploy.
2. `create-payment` yang kalian deploy kemarin **masih belum bisa membuat payment** — bukan karena blocker API key, tapi karena bug lain (`total_amount`). Sudah kami perbaiki di kode; **perlu redeploy**.
3. `midtrans-webhook` ikut diperbaiki (konsekuensi dari #2); **perlu redeploy**.
4. Generator `appwrite.config.json` kami perbaiki karena akan mengembalikan lubang keamanan yang commit `c222063` sudah tutup.

**Yang TIDAK berubah:** nol perubahan skema — tidak ada kolom, enum, index, atau bucket yang ditambah/dihapus/diubah.

---

## 1. Status blocker

### ✅ SELESAI — `APPWRITE_FUNCTION_API_KEY` tidak ada saat runtime

Diselesaikan tim backend di `27b7ea7`. **Kami verifikasi ulang setelah merge:**

| Yang dicek | Hasil |
|---|---|
| Function yang masih memakai `APPWRITE_FUNCTION_API_KEY` sebagai sumber key | **0 dari 24** |
| Function yang memakai `req.headers["x-appwrite-key"]` | **24 dari 24** |
| `getEnv(req)` didefinisikan tapi dipanggil `getEnv()` (sisa refactor) | **0** |
| `node --check` seluruh Function | **24/24 lolos** |

Perubahan scope `databases.*` → `documents.*` juga **benar dan penting**, bukan sekadar kosmetik: `databases.read/write` itu untuk metadata database (bikin/list database), sedangkan semua Function memanggil `listDocuments`/`createDocument` yang butuh `documents.read/write`. Tanpa perbaikan itu Function tetap gagal `401` walaupun key-nya sudah benar.

### 🟡 MASIH TERBUKA

| # | Blocker | Dampak | Butuh |
|---|---|---|---|
| B-1 | `create-payment` tidak menulis `total_amount` (required) | **Tidak ada payment purpose apa pun yang bisa dibuat.** Versi yang ter-deploy sekarang masih begini | **Redeploy** (kode sudah diperbaiki) |
| B-2 | `create-escrow` tidak pernah menulis `campaigns.remainingBudget` | `publishCampaign` mustahil lolos → **campaign tidak bisa jadi `active`**. Memblokir Sprint 4 | **Keputusan kalian** (§5-1) |
| B-3 | `campaign_briefs.doAndDont` cuma 400 char | Brief hasil AI **gagal simpan diam-diam** | Perbesar kolom (§6) |
| B-4 | `request-withdrawal` belum di-deploy | Penarikan saldo kreator belum bisa diuji | Deploy + set env + sync scope (§2) |
| B-5 | `addSocialAccount` menulis `creatorId` yang tak terbaca pembacanya | Akun sosial kreator tidak akan muncul | **Keputusan kalian** (§5-2) |

---

## 2. Yang perlu kalian lakukan (urutan)

1. **Redeploy `create-payment` + `midtrans-webhook`.** Paling mendesak — tanpa ini jalur uang tetap mati (§3.1, §3.2).
2. **Deploy `request-withdrawal`** (Function ke-24, §4):
   - `appwrite push function --function-id request-withdrawal`
   - Tambahkan `request-withdrawal` ke `scripts/set-env-all-functions.sh` (list-nya masih 23), lalu set `APPWRITE_API_KEY`.
   - Jalankan `sync-scopes.ts` — entri `request-withdrawal: ["documents.read","documents.write"]` sudah kami tambahkan di `function-scopes.json`.
   - Catatan: `scripts/deploy-all-functions.sh` sudah kami update ke `TOTAL=24` + `deploy_one "request-withdrawal"`.
3. **Jawab keputusan di §5.** Dua di antaranya memblokir Sprint 4.
4. **Pertimbangkan permintaan kolom di §6.** Prioritas tertinggi `doAndDont` 400 → 4000.

> Kami sengaja **tidak** menyentuh `set-env-all-functions.sh` dan tidak menjalankan deploy apa pun — env & deployment tetap ranah kalian.

---

## 3. Perbaikan kode yang kami lakukan di sisi kalian

### 3.1 🔴 `create-payment` — tidak ada payment yang pernah bisa dibuat

`payments.total_amount` adalah `required: true` **tanpa default**. `create-payment` tidak pernah menulisnya, jadi `createDocument` selalu ditolak `400`.

Ini **bukan** celah khusus campaign — `order`, `topup`, dan `campaign` ketiganya tidak pernah berhasil. Tidak terlihat karena frontend masih mock, jadi belum ada yang memanggilnya. Pola yang sama persis dengan bug `Query` di Sprint 2.

> **Catatan soal verifikasi kemarin:** deploy 23/23 sukses dan `ai-brief` balas 400 — itu memang membuktikan **blocker API key** beres. Tapi `create-payment` tidak ikut diuji dengan body yang valid, jadi bug ini belum ketahuan. Versi yang sekarang ter-deploy masih tidak bisa membuat payment.

```diff
+ const PLATFORM_FEE_RATE = 0.02;   // kanon domain.ts + wallet.service.ts

+ const feeAmount = payload.purpose === "campaign" ? Math.floor(amount * PLATFORM_FEE_RATE) : 0;
+ const totalAmount = amount + feeAmount;

  {
    user_id: userId,
    order_id: payload.orderId || null,
+   campaign_id: payload.campaignId || null,
    amount,
+   total_amount: totalAmount,
+   fee_amount: feeAmount,
    ...
  }
```

Ditambah:
- `validatePayload` mewajibkan `campaignId` bila `purpose === "campaign"`, dan melarangnya untuk purpose lain. Ini satu-satunya cara mengisi `payments.campaign_id`; `idx_campaign_id` memang ada untuk lookup itu.
- `createGatewayReference` menerima refId generik. Campaign kini berprefix `campaign-` (sebelumnya `topup-`, membuat log webhook menyesatkan).
- Midtrans ditagih `totalAmount` (bukan `amount`), dan `itemName` campaign = `"Marketiv Campaign Escrow"`.

**Fee buyer-side HANYA untuk campaign.** `topup` = 0. Order rate card = 0 di sini karena fee-nya seller-side, dipotong saat release (`calculateCreatorPayout`). Aritmetikanya kami uji identik dengan `calculatePlatformFee`/`calculateTotalPayment` frontend pada 50.000 / 100.000 / 3.200.000 / 1.234.567.

### 3.2 🔴 `midtrans-webhook` — konsekuensi langsung dari 3.1

```diff
- if (!isAmountEqual(payment.amount, notification.gross_amount)) {
+ if (!isAmountEqual(payment.total_amount ?? payment.amount, notification.gross_amount)) {
```

Midtrans menagih `total_amount` (budget + fee). Tanpa perbaikan ini **setiap settlement campaign balas `409 Amount mismatch`**, payment tak pernah jadi `paid`, dan `create-escrow` tak pernah jalan. `?? payment.amount` menjaga baris lama yang belum punya `total_amount`.

### 3.3 🔴 Generator akan mengembalikan lubang keamanan

Commit `c222063` (`fix: hapus collection-level read users dari wallets & transactions`) menyunting `appwrite.config.json` **secara manual**, tapi `appwrite/generate_appwrite_json.cjs` tidak ikut diperbarui.

Akibatnya siapa pun yang menjalankan generator — termasuk kami saat mendaftarkan Function ke-24 — akan **mengembalikan `read("users")`** ke `wallets` dan `transactions` tanpa sadar.

Kenapa berbahaya: di Appwrite dengan `rowSecurity: true`, permission level collection dan level baris **bergabung (union)**, bukan beririsan. `read("users")` di level collection berarti **setiap pengguna yang login bisa membaca saldo dan seluruh riwayat transaksi pengguna mana pun** lewat satu `listDocuments` dari browser.

Sudah kami perbaiki di generator (`$permissions: []`) + komentar peringatan agar tidak dikembalikan. Diff hasil regenerasi kami verifikasi secara semantik: **hanya satu blok Function baru; `tables` identik.**

> **Saran proses:** perbaikan yang disunting langsung di `appwrite.config.json` akan hilang pada regenerasi berikutnya. `AGENTS.md` sudah meminta generator & config disinkronkan — mungkin layak dijadikan langkah CI: jalankan generator lalu `git diff --exit-code appwrite.config.json`.
>
> Terkait ini: `27b7ea7` menambahkan `appwrite.config.json` ke `.gitignore`. Karena file-nya **masih tracked**, `.gitignore` belum berpengaruh apa-apa. Tapi kalau nanti ada yang menjalankan `git rm --cached`, registrasi Function (termasuk `request-withdrawal`) hilang dari repo tanpa peringatan. Mohon dipastikan itu memang yang kalian mau.

---

## 4. Function baru: `request-withdrawal`

### Kenapa harus Function

`wallets` dan `transactions` punya `$permissions: []` + `rowSecurity`. Browser **tidak bisa** mendebit saldo. Sementara `withdrawals` punya `create("users")` — artinya klien bisa membuat baris penarikan **tanpa saldonya berkurang**. Itu bug uang yang menunggu terjadi.

`src/services/wallet.service.ts:209-268` (`requestWithdraw`) menulis ke `wallets` dan `transactions`, dua collection `$permissions: []`. **Secara struktural fungsi itu tidak bisa berjalan dari browser.** Function ini adalah port-nya.

> `docs/03_Workflows/50_Withdrawal.md:54` menyatakan "Tidak ada Appwrite Function khusus. Proses sepenuhnya di service layer `wallet.service.ts`." Pernyataan itu tidak bisa terwujud dengan permission saat ini — **dokumen tersebut perlu diperbarui.**

### Kontrak

```
POST  (405 selain itu)
identitas: header x-appwrite-user-id  → 401 "Unauthorized" bila absen
body: { amount:int, payoutMethod:"bank"|"ewallet", providerName, accountNumber,
        accountName, requestKey }
200:  { withdrawalId, amount, status:"processed", processedAt, balanceAfter, transactionId }
```

Validasi (400) — port `validateWithdrawAmount` + `validatePayoutDestination` + batas ukuran kolom:

| Kondisi | Pesan |
|---|---|
| `amount` bukan integer atau ≤ 0 | `Jumlah penarikan tidak valid` |
| `amount < MINIMUM_WITHDRAW` (env, default 50000) | `Minimum penarikan Rp50.000` |
| `payoutMethod` ∉ {bank, ewallet} | `Metode penarikan tidak valid` |
| provider/accountNumber/accountName kosong | `Lengkapi data penarikan` |
| `accountNumber` bukan `/^\d{6,20}$/` | `Nomor rekening tidak valid` |
| panjang > 100 / 100 / 255 | `… terlalu panjang` |
| `requestKey` bukan 8–64 char `[A-Za-z0-9-]` | `requestKey wajib diisi` |

`404` bila tak ada baris `wallets`. `409 Saldo tidak mencukupi`. Batas validator ini kami uji **identik** dengan skema Zod klien di semua boundary (tepat-minimum lolos, kurang 1 ditolak, tepat-saldo lolos, lebih 1 ditolak).

### Idempotensi tanpa perubahan skema

`withdrawals` tidak punya kolom `requestKey` maupun unique index. Kami pakai **document id deterministik**:

```js
const documentId = "wd" + sha256(`${userId}:${requestKey}`).slice(0, 32);   // 34 char, charset valid
```

Panggilan ulang dengan `requestKey` sama gagal `409` di `createDocument`, kami kembalikan sebagai `409 "Permintaan penarikan ini sudah diproses."` Tidak ada debit ganda, tanpa kolom baru. Klien membuat key sekali dengan `crypto.randomUUID()` saat masuk langkah konfirmasi. Guard sekunder: tolak bila ada withdrawal nominal sama dari user sama dalam 60 detik.

### Urutan tulis & kebijakan gagal

1. **`withdrawals` dulu** — audit ada lebih dulu, sehingga kegagalan berikutnya selalu bisa direkonsiliasi.
2. **Re-read wallet, cek ulang saldo, lalu debit.** Appwrite tidak punya compare-and-set. **Gagal → hapus baris audit** (API key boleh menghapus meski user tidak) lalu balas `500`. Tidak ada uang bergerak, tidak ada catatan orphan.
3. **`transactions`.** Gagal → hanya di-log, balas `200` dengan `transactionId: null`. Merekonstruksi dari `withdrawals` jauh lebih aman daripada membatalkan debit yang sudah selesai. Permission baris **wajib** karena `transactions` `$permissions: []` — row perm satu-satunya jalur baca (sama seperti perbaikan `17d5241`).

⚠️ Penarikan ganda oleh dua request **bersamaan** secara teori masih mungkin karena tidak ada lock. Id deterministik memblokir kasus realistis (double-click / retry). Untuk jaminan penuh perlu lock sisi server atau transaction Appwrite (§5-6).

### Env & registrasi

| Variabel | Wajib | Catatan |
|---|---|---|
| `APPWRITE_API_KEY` | ✅ | atau biarkan runtime mengirim `x-appwrite-key` (pola kalian sudah dipakai di sini) |
| `APPWRITE_DATABASE_ID` | ✅ | fallback `NEXT_PUBLIC_DB_ID` |
| `MINIMUM_WITHDRAW` | ❌ | default `50000` |
| `WALLETS_` / `WITHDRAWALS_` / `TRANSACTIONS_COLLECTION_ID` | ❌ | default sesuai nama collection |

Sudah kami daftarkan di: `generate_appwrite_json.cjs`, `appwrite.config.json` (24 Function), `function-scopes.json` (`documents.*`), `scripts/deploy-all-functions.sh` (`TOTAL=24`).
**Belum**: `scripts/set-env-all-functions.sh` masih berisi 23 — sengaja kami biarkan untuk kalian.

---

## 5. Butuh keputusan tim backend

**1. 🔴 `create-escrow` memperlakukan `purpose:"campaign"` sebagai top-up — MEMBLOKIR SPRINT 4**

`functions/create-escrow/src/main.js:12` mengkredit `wallets.balance` dan **tidak pernah** menyentuh `campaigns.remainingBudget`. Padahal `publishCampaign` (`src/services/campaign.service.ts:226`) mensyaratkan:

```js
if (document.remainingBudget <= 0) {
  throw new CampaignServiceError('validation', 'Campaign harus di-top-up terlebih dahulu.');
}
```

**Guard itu tidak akan pernah lolos** → campaign tidak akan pernah bisa jadi `active`. Mohon tentukan alur yang dimaksud:
- (a) `create-escrow` menulis `campaigns.remainingBudget` saat `purpose === "campaign"`, atau
- (b) `publishCampaign` membaca saldo dari sumber lain, atau
- (c) dana campaign memang lewat wallet dan `remainingBudget` diisi di tempat lain.

**2. 🔴 `addSocialAccount` menulis `creatorId` yang tidak pernah bisa dibaca**

- `src/services/user.service.ts:306` menulis `creatorId = creatorProfile.document.$id` (id dokumen profil)
- `functions/get-creator-profile/src/main.js:72` membaca `Query.equal("creatorId", userId)` (id user)

Kedua ujung tidak pernah bertemu. Kami standardisasi ke **`userId`** karena itu nilai yang jalur baca bisa lihat. **Mohon pilih satu dan backfill baris lama.** Kalau kalian memilih `$id` profil, beri tahu kami dan kami ubah.

**3. Konvensi tanda `transactions.amount`**

`wallet.service.ts:255` menulis `amount: -amount` untuk withdrawal. Tapi setiap Function yang ter-deploy (`create-escrow:32`, `completeTopup:82`, `calculate-campaign-reward`) menulis **positif**; mapper baca meneruskan apa adanya; UI merender `formatCurrency(tx.amount)` lalu mengurutkannya — nilai negatif akan mencetak "Rp -50.000" dan merusak sort. **`request-withdrawal` kami menulis positif** dan mengambil arah dari `type`. Mohon konfirmasi.

**4. Permission model union, bukan intersection**

Selain `wallets`/`transactions` (§3.3), `update("users")` di level collection pada **17 collection** berarti user login mana pun bisa meng-update baris siapa pun:

```
campaigns              campaign_briefs        campaign_assets
campaign_claims        campaign_submissions   rate_cards
rate_card_packages     creator_profiles       creator_social_accounts
creator_portfolios     umkm_profiles          conversations
messages               offers                 orders
deliverables           revisions
```

Dan `read("users")` di `withdrawals` berarti **siapa pun bisa membaca nomor rekening + nama pemilik rekening orang lain.**

Saran: pertahankan `create("users")`, cabut `read`/`update` level collection di mana permission baris sudah dipasang. Semua tulisan kami memasang permission baris, jadi tetap berfungsi setelah pengetatan. Sebagai mitigasi sementara kami selalu membaca ownership-filtered sebelum update (defence in depth).

**5. Tak ada collection yang memberi `delete("users")`**

Owner hanya bisa menghapus baris yang dibuat dengan `Permission.delete` per-baris eksplisit. Baris yang dibuat Function (umumnya tanpa argumen permission) atau manual di Console **tidak bisa dihapus pemiliknya**. Kami tangani dengan pesan jujur + tawaran "Jadikan Draft" (rate card) alih-alih gagal senyap. Kalau delete memang harus berfungsi, tambahkan `delete("users")` atau backfill permission baris.

**6. `appwrite@25.2.0` mendukung transaction nyata**

`Databases.createTransaction` / `createOperations` / commit, plus parameter `transactionId` di setiap penulisan dokumen. Kalau server kalian mendukungnya, dua jalur multi-tulis bisa jadi atomik: campaign draft (3 tulis) dan withdrawal (3 tulis). Kami **tidak** mengadopsinya sprint ini karena belum teruji terhadap server ini.

**7. Higiene `ai-brief`** (bukan blocker, tapi menumpuk)

- Identitas dibaca dari `req.body.userId` (:101) → **bisa dipalsukan klien**. 10 Function lain memakai header `x-appwrite-user-id`. Kami sengaja **tidak** mengirim `userId` sama sekali, jadi baris audit `ai_requests` terdegradasi (kosong) alih-alih dipalsukan.
- `req.variables` dipakai di :5, :97, :101, :110 — sudah dihapus di runtime modern, selalu `undefined` (jadi selalu jatuh ke `process.env`, kebetulan aman).
- ⚠️ **Memakai destructuring `req.body` langsung (:16-24), bukan helper `parseBody(req)` seperti 23 Function lain.** Ini jalan **hanya karena** pemanggil kami mengirim `content-type: application/json`. Kalau ada pemanggil yang tidak mengirim header itu, `req.body` berupa string → destructuring menghasilkan `undefined` semua → `400 "Missing required fields"` yang menyesatkan. Mohon disamakan dengan `parseBody(req)`.
- Penulisan `campaign_briefs` internal (:117-128) menelan kegagalan ukuran `doAndDont` di :131-133 (lihat §6).

---

## 6. Permintaan kolom (Sprint 3 sudah selesai tanpanya)

Semua field di bawah **sudah kami hapus dari UI atau dititipkan ke kolom lain**, jadi tidak ada yang menunggu. Ini untuk mengembalikannya nanti.

| Prioritas | Target | Kolom | Alasan |
|---|---|---|---|
| 🔴 **Tinggi** | `campaign_briefs` | **`doAndDont` 400 → 4000** | do/dont hasil AI rutin melewati 400 char → `createDocument` 400 → `ai-brief:131-133` menelannya, jadi brief **gagal simpan diam-diam**. Kami memangkas isi sebagai workaround (item ekor dibuang) — artinya data pengguna hilang tanpa peringatan. |
| 🟠 | `campaign_briefs` | `materialsJson` 300 → 2000 | tidak terpakai pada 300 |
| 🟠 | `campaign_briefs` | `requiredPoints` string 4000 | field wizard; kini dititipkan ke `briefDetail` |
| 🟠 | `campaigns` | `targetLocation` string 100 | wizard "Target Lokasi Kreator"; kini di `briefDetail` |
| 🟠 | `campaigns` | `hashtags` string 500 | field wizard; kini di `briefDetail` |
| 🟡 | `campaigns` | `pauseReason` string 500 | agar modal jeda bisa punya field alasan lagi (kami hapus daripada membuang input user diam-diam) |
| 🟡 | `campaigns` | `thumbnailUrl` string 2048 | permintaan ulang (Sprint 1) |
| 🟡 | `campaign_assets` | `notes` string 1000 | wizard `assetNotes`; kini di `briefDetail` |
| 🟡 | `rate_card_packages` | `status` enum draft/published | agar bisa memakai 1-parent-N-anak alih-alih 1:1 (§7.4) |
| 🟡 | `rate_card_packages` | `platform` string 50 | selector dihapus dari UI (menawarkan YouTube di MVP TikTok-only menyesatkan) |
| 🟡 | `creator_profiles` | `bannerUrl` string 2048 | upload banner dihapus dari UI; tak ada kolom & tak ada bucket banner |
| 🟡 | `creator_profiles` | `averageViews` int / `responseTime` string / `completionRate` int | atau sediakan lewat DTO. Nilai hardcode (48.500 views, "2 jam", 98%) kami hapus — itu **angka performa karangan yang ditampilkan ke kreator tentang dirinya sendiri**. Kini render "—". |
| 🟡 | `creator_portfolios` | `platform` / `niche` / `views` | permintaan ulang (Sprint 2 §7); input dihapus dari UI, tampilan kartu tetap bercabang opsional agar langsung hidup bila kolomnya ada |
| 🟡 | `umkm_profiles` | `instagram` 255, `website` 2048 | input **dihapus** dari UI |
| 🟢 | baru | collection `notification_preferences`, atau kolom JSON di kedua tabel profil | 11 toggle di 2 halaman pengaturan tidak punya tempat penyimpanan; kini disabled dengan label "Segera tersedia" |
| 🟢 | baru | Function `update-account` (`users.phone`, `users.email`, `users.status`) | `users` hanya `read("users")`. Nomor WhatsApp & email kini read-only dengan caption "Dikelola akun — hubungi support"; tombol "Nonaktifkan Akun" disabled |

---

## 7. Detail: apa yang dikerjakan Sprint 3

18 commit fitur Sprint 3, plus 2 commit merge dengan `27b7ea7` dan 1 perbaikan
pasca-merge (batas panjang string, §8). Berikut yang menyentuh data kalian.

### 7.1 Collection & bucket yang kini ditulis frontend

| Aksi pengguna | Collection / bucket | Cara |
|---|---|---|
| Simpan draft campaign (wizard) | `campaigns` (status `draft`) + `campaign_briefs` + `campaign_assets` | SDK langsung |
| Jeda campaign | `campaigns.status` → `paused` | SDK langsung |
| Duplikat campaign | ketiganya di atas, lewat jalur create yang sama | SDK langsung |
| Buat/ubah/hapus paket rate card | `rate_cards` + `rate_card_packages` | SDK langsung |
| Simpan pengaturan UMKM | `umkm_profiles` | SDK langsung |
| Unggah logo UMKM | bucket `logos` | SDK langsung |
| Simpan profil kreator | `creator_profiles` | SDK langsung |
| Unggah avatar kreator | bucket `avatars` | SDK langsung |
| Simpan akun sosial kreator | `creator_social_accounts` | SDK langsung |
| CRUD portofolio kreator | `creator_portfolios` | SDK langsung |
| Unggah thumbnail portofolio | bucket `portfolios` | SDK langsung |
| Brief AI di wizard | — (tidak menulis) | Function `ai-brief` |
| Bayar escrow campaign | `payments` | Function `create-payment` |
| Tarik saldo kreator | `withdrawals` + `wallets` + `transactions` | Function `request-withdrawal` |

**Semua baris baru membawa permission `read(any)` / `update(user:…)` / `delete(user:…)`.** Mohon dikonfirmasi di Console saat verifikasi — grant `delete` itu satu-satunya cara baris tersebut nanti bisa dihapus pemiliknya (§5-5).

Keempat bucket yang kami pakai (`avatars`, `logos`, `portfolios`, `campaign-assets`) semuanya `create("users")` + `fileSecurity:false`, jadi upload langsung dari browser — **tidak** lewat `validate-and-upload`, dan karenanya tidak pernah terdampak blocker API key.

### 7.2 Pemetaan field wizard campaign

Beberapa field wizard tidak punya kolom sendiri. Yang kami lakukan (bukan dibuang diam-diam):

| Field wizard | Ditulis ke |
|---|---|
| `title`, `category`, `description` | `campaigns.title` / `.category` / `.description` |
| **`type` (baru)** | `campaigns.type` — kolom ini `required` tapi wizard belum punya sumbernya, jadi kami tambah picker UGC/Clipping |
| — | `campaigns.platforms` = `["tiktok"]` (MVP) |
| `pricePerThousandViews`, `totalBudgetEscrow`, `creatorQuota` | `rewardPer1000Views`, `budget`, `claimLimit` |
| `brief` + `requiredPoints` + `hashtags` + `location` + `assetNotes` | digabung ke `campaign_briefs.briefDetail` (bersection, ≤10000) |
| `videoStyle` | `campaign_briefs.contentAngle` — label + deskripsi, bukan id, karena ini prosa yang dibaca kreator |
| `callToAction` | `campaign_briefs.cta` (label) |
| `requiredPoints` | `campaign_briefs.doAndDont` — JSON `{do:[],dont:[]}`, **dipangkas ≤400 byte** |
| `externalAssetUrl` | 1 baris `campaign_assets` `{source:"external", type:"link"}` — `type:"link"` penting, mapper baca bercabang di situ untuk "Buka" vs "Unduh" |

### 7.3 Nilai `category` kini konsisten

`umkm_profiles.category` dulu input teks bebas (nilai demo: `"Kuliner — Makanan Sehat"`). Kami ubah jadi `<select>` dengan id yang sama seperti `campaigns.category` (`kuliner`, `fashion`, `pariwisata`, `edukasi`, `kecantikan`, `lainnya`). Nilai lama tidak akan pernah cocok dengan `idx_category` — **kalau ada baris `umkm_profiles` lama, perlu di-backfill.**

### 7.4 Model rate card: 1 `rate_cards` per paket UI (1:1)

`rate_cards` memegang `status`, `rate_card_packages` tidak. Sementara UI punya toggle publish **per paket**. Kami pilih 1:1 supaya toggle tetap jalan tanpa restrukturisasi UI.

Efek samping penting: **kami tidak mem-port `updateRateCard`** (`src/services/creator/creator.service.ts:185-217`) karena fungsi itu **menghapus lalu membuat ulang seluruh paket** pada setiap update, sehingga `orders.packageId` order historis jadi orphan. Kami update baris anak in-place. Kalau nanti ingin kembali ke 1-parent-N-anak, perlu kolom `rate_card_packages.status` (§6).

### 7.5 Perbaikan yang menyentuh angka uang

- **Fee platform diseragamkan ke 2%.** Tiga komponen UMKM masih hardcode `0.15`, dan satu label tertulis "(15%)" padahal angkanya sudah 2% — total 4 titik. Kini semuanya memakai `calculatePlatformFee`/`calculateTotalPayment`.
- **Minimum budget campaign 100.000 → 50.000**, sesuai `MINIMUM_CAMPAIGN_BUDGET`.
- **`ADMIN_FEE` Rp2.500 dihapus** dari layar penarikan kreator. Itu karangan frontend — tidak ada padanannya di backend; `requestWithdraw` mendebit tepat `amount` dan tidak menulis baris fee.
- **Status penarikan diluruskan**: badge "Processing" → "Selesai", transaksi optimistis `pending` → `completed`, dan `pendingPayouts` tidak lagi bertambah. ADR-008 menyatakan withdrawal langsung `processed` tanpa review admin — UI tidak boleh menyiratkan antrean yang tidak ada.

### 7.6 Prasyarat yang kami temukan sendiri

Empat route (`kreator/rate-card`, `kreator/settings`, `kreator/keuangan`, `umkm/pengaturan`) adalah **async Server Component yang memanggil browser Appwrite SDK**, tanpa `middleware.ts` maupun session bridge. Dengan mock OFF, `account.get()` di server tidak punya sesi → `401` → setiap halaman render error state dan form Sprint 3 tak pernah tercapai. Sudah kami pindahkan bacanya ke klien.

**Artinya belum ada jalur SSR terautentikasi di aplikasi ini.** Kalau nanti ada halaman yang butuh data di server, session bridge harus dibangun dulu.

---

## 8. Verifikasi

### Sudah dijalankan (setelah merge dengan `27b7ea7`)

| Cek | Hasil |
|---|---|
| `npx tsc --noEmit` | bersih |
| `npm run build` | sukses, 30 route |
| `node --check` semua Function | 24/24 lolos |
| `npm run lint` | 28 masalah / 8 error — **turun** dari baseline 32/11 |
| Setiap atribut yang ditulis ada di `appwrite.config.json` | **0 atribut tak dikenal** |
| Setiap kolom `required` terisi di jalur create | **0 kolom wajib terlewat** |
| Batas panjang Zod ≤ `size` kolom | **12/12 cocok** |
| Enum `creator_profiles.niche` vs nilai UI | cocok (6 nilai) |
| `FUNCTION_IDS` frontend vs `$id` di config | 11/11 ada |
| Batas validator withdrawal klien vs Function | identik di semua boundary |
| Aritmetika fee Function vs frontend | identik di 4 nominal uji |

> Satu bug ditemukan lewat pengecekan ini dan sudah diperbaiki: 12 field teks tidak punya batas panjang di Zod padahal kolomnya ber-`size` (paling ketat `rate_card_packages.name` = 100). Sebelum diperbaiki, nama paket 101 karakter baru ditolak Appwrite dengan pesan generik "Gagal menyimpan data".

### Belum bisa diverifikasi

`npm test` **tidak bisa dijalankan** — `vitest` & `playwright` ada di script `package.json` tapi tidak terpasang di `devDependencies`. Verifikasi bertumpu pada `tsc`, `build`, `lint`, dan pemeriksaan runtime terpisah untuk logika berisiko (aritmetika fee, pemangkasan `doAndDont`, batas validator withdrawal, id deterministik).

Tiga jalur Function **belum diuji end-to-end** karena belum di-deploy dengan kode terbaru: `ai-brief`, `create-payment` → Snap, `request-withdrawal`. Ketiganya punya jalur mock yang jalan, sehingga UX loading/error tetap bisa diuji di browser hari ini dengan `NEXT_PUBLIC_USE_MOCK_DATA=true`.

### Saat kalian sudah deploy — urutan uji yang kami sarankan

1. **`create-payment` dengan body valid**: `{purpose:"campaign", amount:50000, campaignId:"<id nyata>"}`. Sebelum perbaikan ini balas `400`; sesudahnya harus mengembalikan `paymentId` + `snapToken`. **Ini uji paling penting** — membuktikan jalur uang hidup.
2. **`request-withdrawal` dengan `requestKey` sama dua kali.** Panggilan kedua harus `409`, dan saldo hanya berkurang **sekali**.
3. **`ai-brief` dengan `content-type: application/json`.** Pastikan brief kembali, lalu cek apakah `doAndDont` benar-benar tersimpan di `campaign_briefs` — di sinilah batas 400 char menggigit.

---

## 9. Rollback

| Perubahan | Cara membatalkan | Risiko |
|---|---|---|
| Function `request-withdrawal` | Disable/hapus dari Console | Nol selama frontend masih mock |
| `create-payment` `total_amount` | Revert commit | **Jangan** — tanpa ini tak ada payment yang bisa dibuat |
| `midtrans-webhook` `total_amount` | Revert commit | **Jangan** — settlement campaign akan 409 |
| Generator `$permissions: []` | Revert commit | **Jangan** — mengembalikan kebocoran saldo & riwayat transaksi |

---

## Rujukan

- Skema sumber kebenaran: `00_BACKEND/appwrite.config.json`
- Blocker API key (SELESAI): `00_BACKEND/integration-context/2026-07-25-blocker-api-key-runtime.md`
- Kanon enum & konstanta bisnis: `src/types/domain.ts`
- Helper ServiceResult bersama: `src/services/shared/service-result.ts`
- Skema validasi per modul: `src/lib/validations/`
- Handoff sebelumnya: `00_BACKEND/integration-context/2026-07-23-frontend-sprint2-appwrite-changes.md`

---

## ✅ Resolusi B-1…B-5 — diverifikasi 2026-07-27

Diperiksa satu per satu terhadap kode saat ini, bukan diasumsikan dari commit message.

| ID | Status | Bukti |
|---|---|---|
| **B-1** `create-payment` tanpa `total_amount` | ✅ Selesai | `create-payment/src/main.js:64-65` menulis `total_amount` + `fee_amount`, dan `:62` menulis `campaign_id` |
| **B-2** `create-escrow` tanpa `remainingBudget` | ✅ Selesai | `create-escrow/src/main.js:118-124` — `completeTopup` mengkredit `campaigns.remainingBudget` untuk `purpose: "campaign"`. Ini juga resolusi T-4 |
| **B-3** `campaign_briefs.doAndDont` 400 char | 🔴 **MASIH TERBUKA** | `appwrite.config.json` masih `size: 400`. Brief hasil AI tetap berisiko gagal simpan diam-diam. Perlu keputusan: naikkan ke 4000, atau potong di sisi penulis |
| **B-4** `request-withdrawal` belum di-deploy | ✅ Selesai | Function #24 ada di `appwrite.config.json`, scopes terdaftar di `function-scopes.json`. `set-env-all-functions.sh` sudah tidak ada — env kini lewat Console/CLI |
| **B-5** `addSocialAccount` menulis `creatorId` yang tak terbaca | ✅ **Diperbaiki hari ini** | Lihat di bawah |

### B-5 — dikonfirmasi nyata, lalu diperbaiki

Kedua pembacanya menjodohkan `creator_social_accounts.creatorId` dengan **`creator_profiles.userId`** (id akun Auth):

- `get-creator-profile/src/main.js:72` — `Query.equal("creatorId", userId)`
- `get-creator-directory/src/main.js:74` — `profiles.map((p) => str(p.userId))`

Sedangkan penulisnya, `user.service.ts:306`, berbunyi `data.creatorId || creatorProfile.document.$id` — yaitu **`$id` dokumen profil**, bukan id Auth. Akun sosial yang ditulis lewat jalur ini tidak akan pernah muncul di direktori maupun halaman profil kreator.

Ini kelas kesalahan yang sama persis dengan B-3 Sprint 4 (klaim selalu 404): mencampuradukkan `$id` dokumen dengan id akun Auth pada koleksi yang barisnya dibuat dengan `ID.unique()`.

**Perbaikan:** `creatorId` selalu diambil dari sesi (`user.$id`). Parameter `data.creatorId` sengaja diabaikan dan ditandai `@deprecated` — selain salah kunci, ia membuat seorang kreator bisa menulis akun sosial atas nama orang lain.

### Sisa yang belum ditinjau

§5 item 3, 4, 6, 7 (konvensi tanda `transactions.amount`, permission union 17 koleksi, transaksi Appwrite, higiene `ai-brief`) dan §6 permintaan kolom selain `doAndDont` **belum** ditinjau ulang di pass ini.

Catatan §4 (permission union): sebagian sudah tertutup — `withdrawals` tidak lagi punya `read("users")`, begitu pula `users`, `payments`, `user_files`, `user_storage_usage`, `wallets`, `conversations`, `messages`, `offers`, `orders`. Lihat §Resolusi di `2026-07-27-verifikasi-event-prefix-dan-sisa-wiring.md`.

