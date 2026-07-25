# Perubahan Sisi Appwrite — Sprint 3 Integrasi Frontend (Lapisan Tulis)

| | |
|---|---|
| **Tanggal** | 2026-07-25 |
| **Pemicu** | Sprint 3 integrasi Appwrite — lapisan **tulis** satu-sisi (sebelumnya frontend nol fungsi tulis) |
| **Sifat** | 1 Function baru (`request-withdrawal`) + **perbaikan bug** pada `create-payment` & `midtrans-webhook` + **1 perbaikan generator** yang mencegah lubang keamanan kembali. Nol perubahan skema. |
| **Status** | ⚠️ **BELUM di-push, BELUM di-deploy.** Masih di branch `sprint-3-write-layer`. |
| **Runtime dampak** | Function baru: nol (frontend masih `NEXT_PUBLIC_USE_MOCK_DATA=true`). Perbaikan `create-payment`: **membuka jalur pembayaran yang selama ini mati total** — lihat §B-1. |

> **Ringkas untuk yang sibuk.** Tiga hal yang paling perlu kalian tahu:
> 1. **`create-payment` tidak pernah bisa membuat baris payment sama sekali** — bukan cuma campaign. Sudah kami perbaiki (§B-1).
> 2. **Generator `appwrite.config.json` akan mengembalikan lubang keamanan** yang commit `c222063` sudah tutup. Sudah kami perbaiki (§B-2).
> 3. Blocker `APPWRITE_FUNCTION_API_KEY` (dokumen `2026-07-25-blocker-api-key-runtime.md`) **masih terbuka** dan membuat 4 jalur Sprint 3 tidak bisa diverifikasi. Function baru kami sengaja memakai pola header-first supaya jalan sebelum maupun sesudah kalian memperbaikinya.

---

## 1. Ringkasan perubahan

| # | Perubahan | Sifat | Berkas terdampak |
|---|---|---|---|
| A | **`create-payment` tidak menulis kolom wajib `total_amount`** | 🔴 Bug — tidak ada payment purpose apa pun yang bisa dibuat | `functions/create-payment/src/main.js` |
| B | **`midtrans-webhook` membandingkan kolom yang salah** | 🔴 Bug — akibat langsung dari perbaikan A | `functions/midtrans-webhook/src/main.js` |
| C | **Generator mengembalikan `read("users")` ke `wallets` & `transactions`** | 🔴 Regresi keamanan menunggu terjadi | `appwrite/generate_appwrite_json.cjs` |
| D | Function `request-withdrawal` baru | Aditif | `functions/request-withdrawal/**` + registrasi |
| E | Sinkron generator + config + scopes + deploy script | Aditif | `appwrite.config.json`, `appwrite/function-scopes.json`, `scripts/deploy-all-functions.sh` |

Tidak ada kolom, enum, index, atau bucket yang ditambah/dihapus/diubah.

---

## 2. Yang perlu kalian lakukan (urutan)

1. **Baca §B-1 dan §B-2 sekarang.** Keduanya bug yang sudah ada sebelum Sprint 3 dan tidak bergantung pada apa pun dari kami.
2. **Redeploy `create-payment` dan `midtrans-webhook`** — perbaikan ini layak duluan, terpisah dari Sprint 3.
3. **Selesaikan blocker `APPWRITE_FUNCTION_API_KEY`** (§C-1). Tanpa ini 4 jalur Sprint 3 tetap tidak terverifikasi.
4. **Deploy `request-withdrawal`** (§D) — `appwrite push function --function-id request-withdrawal`.
5. **Jawab 8 keputusan di §E.** Beberapa memblokir Sprint 4.
6. **Pertimbangkan permintaan kolom di §F.** Sprint 3 sudah selesai tanpanya; ini untuk mengembalikan field yang kami hapus dari UI.

---

## 3. §A — Perubahan kode yang kami lakukan di sisi kalian

### A-1. `create-payment/src/main.js`

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

Plus:
- `validatePayload` mewajibkan `campaignId` untuk `purpose === "campaign"` dan melarangnya untuk purpose lain.
- `createGatewayReference` menerima refId generik; campaign kini dapat prefix `campaign-` (dulu `topup-`, membuat log webhook menyesatkan).
- Midtrans ditagih `totalAmount` (bukan `amount`) dan `itemName` campaign = `"Marketiv Campaign Escrow"`.

**Fee bersifat buyer-side HANYA untuk campaign.** `topup` = 0. Order rate card = 0 di sini karena fee-nya seller-side, dipotong saat release (`calculateCreatorPayout`). Aritmetika kami verifikasi identik dengan `calculatePlatformFee`/`calculateTotalPayment` frontend pada 50.000 / 100.000 / 3.200.000 / 1.234.567.

### A-2. `midtrans-webhook/src/main.js:33`

```diff
- if (!isAmountEqual(payment.amount, notification.gross_amount)) {
+ if (!isAmountEqual(payment.total_amount ?? payment.amount, notification.gross_amount)) {
```

`?? payment.amount` menjaga baris lama yang belum punya `total_amount`.

### A-3. `appwrite/generate_appwrite_json.cjs`

`wallets` dan `transactions` diubah dari `$permissions: ["read(\"users\")"]` menjadi `$permissions: []`, dengan komentar peringatan agar tidak dikembalikan. Lihat §B-2.

---

## 4. §B — Tiga temuan yang paling mendesak

### B-1. 🔴 `create-payment` tidak pernah bisa membuat payment — purpose apa pun

`payments.total_amount` adalah `required: true` **tanpa default** (`appwrite.config.json`). `create-payment` tidak pernah menulisnya, jadi `createDocument` selalu ditolak `400`.

Ini bukan celah khusus campaign. **`order`, `topup`, dan `campaign` semuanya tidak pernah berhasil.** Artinya seluruh jalur uang mati sejak awal, terpisah dari blocker API key.

Tidak terlihat sampai sekarang karena frontend masih mock, jadi tak ada yang pernah memanggilnya — pola yang sama dengan bug `Query` di Sprint 2.

Sudah kami perbaiki (§A-1). **Mohon redeploy.**

### B-2. 🔴 Generator akan mengembalikan lubang keamanan `wallets` & `transactions`

Commit `c222063` (`fix: hapus collection-level read users dari wallets & transactions`) menyunting `appwrite.config.json` **secara manual** tapi tidak memperbarui `appwrite/generate_appwrite_json.cjs`.

Akibatnya: siapa pun yang menjalankan `node appwrite/generate_appwrite_json.cjs` — termasuk kami saat mendaftarkan `request-withdrawal` — akan **mengembalikan `read("users")`** ke kedua collection, tanpa sadar.

Kenapa itu berbahaya: di Appwrite dengan `rowSecurity: true`, permission level collection dan level baris **bergabung (union)**, bukan beririsan. `read("users")` di level collection berarti **setiap pengguna yang login bisa membaca saldo dan seluruh riwayat transaksi pengguna mana pun** dengan satu `listDocuments` dari browser.

Sudah kami perbaiki di generator + komentar peringatan. Diff regenerasi kami verifikasi semantik: **hanya satu blok Function baru; `tables` identik byte-per-byte.**

> **Pelajaran proses, bukan menyalahkan:** setiap perbaikan yang disunting langsung di `appwrite.config.json` akan hilang pada regenerasi berikutnya. `AGENTS.md` sudah meminta generator & config disinkronkan — mungkin layak dijadikan langkah CI: jalankan generator lalu `git diff --exit-code appwrite.config.json`.

### B-3. 🔴 `addSocialAccount` menulis `creatorId` yang tidak pernah bisa dibaca

- `src/services/user.service.ts:306` menulis `creatorId = creatorProfile.document.$id` (id dokumen profil).
- `functions/get-creator-profile/src/main.js:72` membaca `Query.equal("creatorId", userId)` (id user).

Kedua ujung tidak pernah bertemu: **baris yang ditulis service tidak akan pernah terbaca oleh Function pembacanya.**

Kami standardisasi ke **`userId`** karena itu nilai yang jalur baca bisa lihat. **Mohon pilih satu dan backfill baris yang sudah ada.** Kalau kalian memilih `$id` profil, beri tahu kami dan kami ubah.

---

## 5. §C — Blocker yang masih terbuka

### C-1. `APPWRITE_FUNCTION_API_KEY` — belum diperbaiki

Didokumentasikan di `integration-context/2026-07-25-blocker-api-key-runtime.md`. Ringkas: variabel itu **hanya di-inject saat build**; saat runtime kunci dinamis datang lewat header `req.headers["x-appwrite-key"]`. Prefix `APPWRITE_` juga reserved.

**Dampak ke Sprint 3:** empat jalur ini code-complete tapi **tidak bisa kami verifikasi**:

| Jalur | Function |
|---|---|
| Brief AI di wizard campaign | `ai-brief` |
| Pembayaran escrow campaign | `create-payment` |
| Penarikan saldo kreator | `request-withdrawal` |
| (belum dipakai Sprint 3) | `validate-and-upload` |

`request-withdrawal` sengaja kami tulis dengan pola **header-first**:

```js
appwriteApiKey: req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY
```

sehingga Function itu jalan **sebelum maupun sesudah** kalian memperbaiki blocker. Pola yang sama bisa dipakai untuk 23 Function lainnya.

---

## 6. §D — Function baru: `request-withdrawal`

### Mengapa harus Function

`wallets` dan `transactions` punya `$permissions: []` + `rowSecurity`. Browser **tidak bisa** mendebit saldo. Padahal `withdrawals` punya `create("users")`, jadi klien bisa membuat baris penarikan **tanpa saldonya berkurang** — itu bug uang yang menunggu terjadi.

`src/services/wallet.service.ts:209-268` (`requestWithdraw`) menulis ke `wallets` dan `transactions`, dua collection `$permissions: []`. **Secara struktural fungsi itu tidak bisa berjalan dari browser.** Function ini adalah port-nya.

Tidak ada Function withdrawal sebelumnya, dan `docs/03_Workflows/50_Withdrawal.md:54` menyatakan "Tidak ada Appwrite Function khusus. Proses sepenuhnya di service layer `wallet.service.ts`" — pernyataan itu tidak bisa terwujud dengan permission saat ini. **Dokumen itu perlu diperbarui.**

### Kontrak

```
POST  (405 selain itu)
identitas: header x-appwrite-user-id  → 401 "Unauthorized" bila absen
body: { amount:int, payoutMethod:"bank"|"ewallet", providerName, accountNumber,
        accountName, requestKey }
200:  { withdrawalId, amount, status:"processed", processedAt, balanceAfter, transactionId }
```

Validasi (semua 400, port `validateWithdrawAmount` + `validatePayoutDestination` + batas ukuran kolom):

| Kondisi | Pesan |
|---|---|
| `amount` bukan integer atau ≤ 0 | `Jumlah penarikan tidak valid` |
| `amount < MINIMUM_WITHDRAW` (env, default 50000) | `Minimum penarikan Rp50.000` |
| `payoutMethod` ∉ {bank, ewallet} | `Metode penarikan tidak valid` |
| provider/accountNumber/accountName kosong | `Lengkapi data penarikan` |
| `accountNumber` bukan `/^\d{6,20}$/` | `Nomor rekening tidak valid` |
| panjang > 100/100/255 | `… terlalu panjang` |
| `requestKey` bukan 8–64 char `[A-Za-z0-9-]` | `requestKey wajib diisi` |

`404` bila tak ada baris `wallets`. `409` `Saldo tidak mencukupi`. Batas validator ini kami uji identik dengan skema Zod klien di semua boundary.

### Idempotensi tanpa perubahan skema

`withdrawals` tidak punya kolom `requestKey` maupun unique index. Kami pakai **document id deterministik**:

```js
const documentId = "wd" + sha256(`${userId}:${requestKey}`).slice(0, 32);   // 34 char, charset valid
```

Panggilan ulang dengan `requestKey` sama gagal `409` di `createDocument`, yang kami kembalikan sebagai `409 "Permintaan penarikan ini sudah diproses."` Tidak ada debit ganda, tidak perlu kolom baru. Klien membuat key sekali dengan `crypto.randomUUID()` saat masuk langkah konfirmasi. Guard sekunder: tolak bila ada withdrawal nominal sama dari user sama dalam 60 detik.

### Urutan tulis & kebijakan gagal

1. **`withdrawals` dulu** — audit ada lebih dulu, sehingga kegagalan berikutnya selalu bisa direkonsiliasi.
2. **Re-read wallet, cek ulang saldo, lalu debit.** Appwrite tidak punya compare-and-set. **Gagal → hapus baris audit** (API key boleh menghapus meski user tidak) dan balas `500`. Tidak ada uang bergerak, tidak ada catatan orphan.
3. **`transactions`.** Gagal → hanya di-log, balas `200` dengan `transactionId: null`. Merekonstruksi dari `withdrawals` jauh lebih aman daripada membatalkan debit yang sudah selesai. Permission baris **wajib** karena `transactions` `$permissions: []` — row perm satu-satunya jalur baca (sama seperti perbaikan `17d5241`).

Penarikan ganda oleh dua request bersamaan **secara teori masih mungkin** karena tidak ada lock. Id deterministik memblokir kasus realistis (double-click / retry). Kalau kalian ingin jaminan penuh, perlu lock sisi server atau transaction Appwrite (§E-8).

### Registrasi (4 berkas)

1. `appwrite/generate_appwrite_json.cjs` — blok Function baru setelah `create-payment`.
2. `appwrite.config.json` — hasil regenerasi (23 → 24 Function).
3. `appwrite/function-scopes.json` — `"request-withdrawal": ["databases.read", "databases.write"]`.
4. `scripts/deploy-all-functions.sh` — `TOTAL=23` → `24` + `deploy_one "request-withdrawal"`.

Variabel yang perlu diset di Console:

| Variabel | Wajib | Catatan |
|---|---|---|
| `APPWRITE_API_KEY` | ✅ | atau biarkan runtime mengirim `x-appwrite-key` |
| `APPWRITE_DATABASE_ID` | ✅ | fallback `NEXT_PUBLIC_DB_ID` |
| `MINIMUM_WITHDRAW` | ❌ | default `50000` |
| `WALLETS_/WITHDRAWALS_/TRANSACTIONS_COLLECTION_ID` | ❌ | default sesuai nama collection |

---

## 7. §E — Butuh keputusan tim backend

1. **Konvensi tanda `transactions.amount`.** `wallet.service.ts:255` menulis `amount: -amount` untuk withdrawal. Setiap Function yang ter-deploy (`create-escrow:32`, `completeTopup:82`, `calculate-campaign-reward`) menulis **positif**, mapper baca meneruskan apa adanya, dan UI merender `formatCurrency(tx.amount)` lalu mengurutkannya — nilai negatif akan mencetak "Rp -50.000" dan merusak sort. **`request-withdrawal` kami menulis positif** dan mengambil arah dari `type`. Mohon konfirmasi.

2. **`processedAt` required + `WithdrawalStatus` hanya `processed`.** Kombinasi ini berarti platform mencatat payout **selesai pada saat request**, sebelum pencairan nyata terjadi. Itu risiko produk/keuangan, bukan bug kode. Kalau nanti perlu status antara (`pending` → `processed`), butuh nilai enum baru dan `processedAt` jadi opsional.

3. **`AdminWithdrawReview` vs withdrawal direct.** `docs/02_Modules/Payments/80_Frontend.md:31` menyebut panel admin review withdrawal, tapi ADR-008 + kode bilang langsung `processed` tanpa review. Keduanya tidak bisa benar sekaligus. (Utang lama, sudah tercatat sebagai `s5-backend-confirm`.)

4. **`create-escrow` memperlakukan `purpose:"campaign"` sebagai top-up** (`functions/create-escrow/src/main.js:12`): mengkredit `wallets.balance` dan **tidak pernah** menyentuh `campaigns.remainingBudget`. Padahal `publishCampaign` (`campaign.service.ts:226`) mensyaratkan `remainingBudget > 0` sebelum campaign boleh `active`. **Guard itu tidak akan pernah lolos.** → **Ini memblokir Sprint 4** (publish campaign jadi `active`). Mohon tentukan alur yang dimaksud.

5. **Permission model union, bukan intersection.** Selain `wallets`/`transactions` (§B-2), `update("users")` di level collection pada **17 collection** berarti **user login mana pun bisa meng-update baris siapa pun**:

   ```
   campaigns              campaign_briefs        campaign_assets
   campaign_claims        campaign_submissions   rate_cards
   rate_card_packages     creator_profiles       creator_social_accounts
   creator_portfolios     umkm_profiles          conversations
   messages               offers                 orders
   deliverables           revisions
   ```

   Dan `read("users")` di `withdrawals` berarti **siapa pun bisa membaca nomor rekening + nama pemilik rekening orang lain**.

   Saran: pertahankan `create("users")`, cabut `read`/`update` level collection di mana permission baris sudah dipasang. Tulisan kami tetap berhasil setelah pengetatan itu, karena semuanya memasang permission baris. Sebagai mitigasi sementara kami tetap membaca ownership-filtered sebelum update (defence in depth).

6. **Tak ada collection yang memberi `delete("users")`.** Owner hanya bisa menghapus baris yang dibuat dengan `Permission.delete` per-baris eksplisit. Baris yang dibuat Function (umumnya tanpa argumen permission) atau manual di Console **tidak bisa dihapus pemiliknya**. Kami tangani dengan pesan `forbidden` yang jujur + tawaran "Jadikan Draft" (rate card) alih-alih gagal senyap. Kalau kalian ingin delete berfungsi, tambahkan `delete("users")` atau backfill permission baris.

7. **`updateRateCard` menghancurkan referensi order.** `src/services/creator/creator.service.ts:185-217` **menghapus lalu membuat ulang seluruh paket** pada setiap update, sehingga `orders.packageId` order historis jadi orphan. **Kami tidak port fungsi ini**; kami update baris anak in-place. Model kami: **satu `rate_cards` per paket UI (1:1)** supaya update tak pernah melihat paket sibling. Kalau kalian ingin kembali ke 1-parent-N-anak, kami butuh kolom `rate_card_packages.status` (§F).

8. **`appwrite@25.2.0` mendukung transaction nyata** (`Databases.createTransaction` / `createOperations` / commit, plus parameter `transactionId` di setiap penulisan dokumen). Kalau server kalian mendukungnya, dua jalur multi-tulis bisa jadi atomik: campaign draft (3 tulis) dan withdrawal (3 tulis). Kami **tidak** mengadopsinya sprint ini karena belum teruji terhadap server ini. Layak dievaluasi.

9. **Higiene `ai-brief`** (`functions/ai-brief/src/main.js`) — bukan blocker, tapi menumpuk:
   - Identitas dibaca dari `req.body.userId` (:101) → **bisa dipalsukan klien**. 10 Function lain memakai header `x-appwrite-user-id`. Kami sengaja **tidak** mengirim `userId` sama sekali, jadi baris audit `ai_requests` terdegradasi (kosong) alih-alih dipalsukan.
   - `req.variables` dipakai di :5, :97, :101, :110 — sudah dihapus di runtime modern, selalu `undefined`.
   - Penulisan `campaign_briefs` internal (:117-128) menelan kegagalan ukuran `doAndDont` di :131-133 (lihat §F, baris pertama).
   - Memakai destructuring `req.body` (:16-24) bukan helper `parseBody(req)` seperti Function lain; kebetulan jalan hanya karena pemanggil mengirim `content-type: application/json`.

---

## 8. §F — Permintaan kolom (Sprint 3 sudah selesai tanpanya)

Semua field di bawah **sudah kami hapus dari UI atau dititipkan ke kolom lain**, jadi tidak ada yang menunggu. Ini untuk mengembalikannya nanti.

| Prioritas | Target | Kolom | Alasan |
|---|---|---|---|
| 🔴 **Tinggi** | `campaign_briefs` | **`doAndDont` 400 → 4000** | do/dont hasil AI rutin melewati 400 char → `createDocument` 400 → `ai-brief:131-133` menelannya, jadi brief **gagal simpan diam-diam**. Kami memangkas isi sebagai workaround (item ekor dibuang), artinya data pengguna hilang tanpa peringatan. |
| 🟠 | `campaign_briefs` | `materialsJson` 300 → 2000 | tidak terpakai pada 300 |
| 🟠 | `campaign_briefs` | `requiredPoints` string 4000 | field wizard; kini dititipkan ke `briefDetail` |
| 🟠 | `campaigns` | `targetLocation` string 100 | wizard "Target Lokasi Kreator"; kini di `briefDetail` |
| 🟠 | `campaigns` | `hashtags` string 500 | field wizard; kini di `briefDetail` |
| 🟡 | `campaigns` | `pauseReason` string 500 | agar modal jeda bisa punya field alasan lagi (kami hapus daripada membuang input user diam-diam) |
| 🟡 | `campaigns` | `thumbnailUrl` string 2048 | permintaan ulang (Sprint 1) |
| 🟡 | `campaign_assets` | `notes` string 1000 | wizard `assetNotes`; kini di `briefDetail` |
| 🟡 | `rate_card_packages` | `status` enum draft/published | agar bisa memakai 1-parent-N-anak alih-alih 1:1 (§E-7) |
| 🟡 | `rate_card_packages` | `platform` string 50 | selector dihapus dari UI (menawarkan YouTube di MVP TikTok-only menyesatkan) |
| 🟡 | `creator_profiles` | `bannerUrl` string 2048 | upload banner dihapus dari UI; tak ada kolom & tak ada bucket banner |
| 🟡 | `creator_profiles` | `averageViews` int / `responseTime` string / `completionRate` int | atau sediakan lewat DTO. Nilai hardcode (48.500 views, "2 jam", 98%) kami hapus — itu **angka performa karangan yang ditampilkan ke kreator tentang dirinya sendiri**. Kini render "—". |
| 🟡 | `creator_portfolios` | `platform` / `niche` / `views` | permintaan ulang (Sprint 2 §7); input dihapus dari UI, tampilan kartu tetap bercabang opsional agar langsung hidup bila kolomnya ada |
| 🟡 | `umkm_profiles` | `instagram` 255, `website` 2048 | input **dihapus** dari UI |
| 🟢 | baru | collection `notification_preferences`, atau kolom JSON di kedua tabel profil | 11 toggle di 2 halaman pengaturan tidak punya tempat penyimpanan; kini disabled dengan label "Segera tersedia" |
| 🟢 | baru | Function `update-account` (`users.phone`, `users.email`, `users.status`) | `users` hanya `read("users")`. Nomor WhatsApp & email kini read-only dengan caption "Dikelola akun — hubungi support"; tombol "Nonaktifkan Akun" disabled |

---

## 9. §G — Yang sudah kami kerjakan & status verifikasinya

17 commit di branch `sprint-3-write-layer` (termasuk dokumen ini). `npx tsc --noEmit` bersih. Lint repo **turun** dari 32 masalah/11 error (baseline `staging`) menjadi 28/8.

> Catatan uji: `npm test` **tidak bisa dijalankan** — `vitest` & `playwright` ada di script `package.json` tapi tidak terpasang di `devDependencies`. Jadi verifikasi kami bertumpu pada `tsc`, lint, dan pemeriksaan runtime terpisah untuk logika berisiko (aritmetika fee, pemangkasan `doAndDont`, batas validator withdrawal, id deterministik). Memasang `vitest` layak jadi task tersendiri.

### Bisa diverifikasi sekarang (SDK langsung, tidak lewat Function)

Bucket `avatars`, `logos`, `portfolios`, `campaign-assets` semuanya `create("users")` + `fileSecurity: false`, jadi upload langsung dari browser dan **tidak** kena blocker API key.

| Yang ditulis | Collection / bucket |
|---|---|
| Draft campaign dari wizard | `campaigns` (status `draft`) + `campaign_briefs` + `campaign_assets` |
| Jeda campaign | `campaigns.status` → `paused` |
| Duplikat campaign | lewat jalur create yang sama |
| CRUD paket rate card | `rate_cards` + `rate_card_packages` |
| Profil UMKM + logo | `umkm_profiles`, bucket `logos` |
| Profil kreator + avatar | `creator_profiles`, bucket `avatars` |
| Akun sosial kreator | `creator_social_accounts` |
| Portofolio kreator + thumbnail | `creator_portfolios`, bucket `portfolios` |

Semua baris baru membawa `read(any)` / `update(user:…)` / `delete(user:…)` — mohon konfirmasi di Console saat verifikasi.

### Code-complete, TIDAK bisa diverifikasi (blocker §C-1)

`ai-brief`, `create-payment` → Snap, `request-withdrawal`. Ketiganya ter-wire, ter-type, dan punya jalur mock yang jalan, sehingga UX loading/error tetap bisa diuji di browser hari ini. `request-withdrawal` juga **belum ter-deploy**.

### Prasyarat yang kami temukan & perbaiki sendiri

Empat route (`kreator/rate-card`, `kreator/settings`, `kreator/keuangan`, `umkm/pengaturan`) adalah **async Server Component yang memanggil browser Appwrite SDK**, tanpa `middleware.ts` maupun session bridge. Dengan mock OFF, `account.get()` di server tak punya sesi → `401` → setiap halaman render error state dan form Sprint 3 tak pernah tercapai. Sudah kami pindahkan bacaannya ke klien. **Ini artinya belum ada jalur SSR terautentikasi di app** — kalau nanti ada halaman yang butuh data di server, session bridge harus dibangun dulu.

### Sengaja TIDAK dikerjakan

- **Publish campaign → `active`**: Sprint 4, dan terhalang §E-4.
- **Refund / pembatalan campaign sejati**: tak ada nilai enum `cancelled` dan tak ada Function refund. Modal "Batalkan Campaign" yang menjanjikan refund kami ubah jadi "Jeda Campaign" dengan copy jujur.
- **Ganti password** (`account.updatePassword`): jalan dari klien, tapi di luar 9 task Sprint 3.
- **Transaction Appwrite** untuk jalur multi-tulis: menunggu §E-8.

---

## 10. Rollback

| Perubahan | Cara membatalkan | Risiko |
|---|---|---|
| Function `request-withdrawal` | Disable/hapus dari Console | Nol selama frontend masih mock |
| `create-payment` total_amount | Revert commit | **Jangan** — tanpa ini tak ada payment yang bisa dibuat |
| `midtrans-webhook` total_amount | Revert commit | Tinggi — settlement campaign akan 409 |
| Generator `$permissions: []` | Revert commit | **Jangan** — mengembalikan kebocoran saldo & riwayat transaksi |

---

## Rujukan

- Skema sumber kebenaran: `00_BACKEND/appwrite.config.json`
- Blocker aktif: `00_BACKEND/integration-context/2026-07-25-blocker-api-key-runtime.md`
- Kanon enum & konstanta bisnis: `src/types/domain.ts`
- Helper ServiceResult bersama: `src/services/shared/service-result.ts`
- Skema validasi per modul: `src/lib/validations/`
- Handoff sebelumnya: `00_BACKEND/integration-context/2026-07-23-frontend-sprint2-appwrite-changes.md`
