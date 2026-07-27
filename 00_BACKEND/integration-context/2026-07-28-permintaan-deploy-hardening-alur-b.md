# Permintaan Deploy — Hardening Prasyarat Sprint 4 Alur B

| | |
|---|---|
| **Tanggal** | 2026-07-28 |
| **Dari** | Tim frontend/integrasi |
| **Untuk** | Tim backend — mohon direview, lalu kerjakan §C |
| **Merespons** | `2026-07-27-respons-backend-eksekusi-deployment.md` |
| **Status** | ✅ Sisi kami selesai · ⬜ Menunggu §C |
| **Sifat** | Kami mengaudit hasil deployment kalian sebelum membangun Alur B (Rate Card / escrow). Tujuh dari delapan item kalian terverifikasi benar. Tiga cacat baru ditemukan, semuanya di jalur uang Alur B. §A temuan, §B yang kami perbaiki, §C tugas kalian. |

---

## 0. Ringkasan 1 menit

| | Hal | Status |
|---|---|---|
| ✅ | Deployment kalian — 26 Function, `NO DRIFT`, env, cron | Terverifikasi benar |
| 🔴 | `deliverables` bisa di-approve SIAPA PUN yang login → escrow cair | Diperbaiki, butuh deploy |
| 🔴 | `release-escrow` tidak memotong fee 2% (ADR-008) | Diperbaiki, butuh redeploy |
| 🟠 | `release-escrow` tidak cek status order | Diperbaiki, butuh redeploy |
| 🟠 | `ai-brief` menulis kolom tanpa clamp → brief hilang senyap | Diperbaiki, butuh redeploy |
| ✅ | `doAndDont` 400→4000 | **Ditutup — Opsi C.** Tidak jadi dinaikkan |
| 🟡 | `createEnumAttr` tidak emit `size` | Diperbaiki di generator, mohon verifikasi sebelum push tables |

---

## A. Temuan

### A-1 🔴 `deliverables` bisa disetujui siapa pun — escrow cair tanpa UMKM

Dua lapis izin sama-sama terlalu longgar:

1. **Level koleksi.** `deliverables` dan `revisions` masih `read("users"), create("users"), update("users")`. Permission Appwrite bersifat **union**, jadi `update("users")` = setiap user login bisa mengubah baris deliverable milik siapa pun.
2. **Level baris.** `order.service.ts` memberi `Permission.update` ke **kedua** pihak order, termasuk kreator.

`release-escrow` dipicu event `deliverables.rows.*.update` dan hanya memeriksa `status === "approved"`. Gabungan keduanya: **kreator bisa menyetujui pekerjaannya sendiri, escrow langsung masuk wallet-nya, dan UMKM tidak pernah dilibatkan.** Guard `order.umkmId !== user.$id` di `approveDeliverable()` tidak menolong — penyerang tidak lewat fungsi itu, cukup `updateDocument` langsung.

Kreator memang tidak butuh hak update: kirim ulang membuat **baris baru** `version + 1`, bukan memperbarui baris lama. Satu-satunya `updateDocument` pada tabel ini ada di `approveDeliverable`.

`harden-permissions.mjs:14` sudah mencatat kedua tabel ini sebagai "ketatkan menyusul, row perm belum ter-deploy". Prasyarat itu **sudah terpenuhi** oleh push kalian 2026-07-27.

### A-2 🔴 `release-escrow` tidak memotong fee 2%

Function mengkredit `wallet.balance += escrow.amount` **penuh** dan hanya menulis satu ledger `release`. ADR-008 mensyaratkan fee 2% seller-side untuk Rate Card Order, plus ledger `fee` terpisah.

Yang membuatnya kasat mata: `get-creator-negotiations:138` sudah menghitung dan **menampilkan** potongan 2% ke layar kreator. Layar bilang dipotong, wallet tidak. Selain itu platform tidak mencatat pendapatan apa pun dari seluruh Rate Card Mode.

### A-3 🟠 `release-escrow` tidak memeriksa status order

Function langsung `updateOrderCompleted()` tanpa memeriksa order sedang berjalan. Order `cancelled` pun bisa dipaksa jadi `completed`.

### A-4 🟠 `ai-brief` menulis kolom tanpa clamp — brief hilang senyap

`ai-brief` menulis `objective`(2000), `contentAngle`(2000), `cta`(1000), `briefDetail`(10000), dan `doAndDont`(400) langsung dari keluaran Gemini tanpa pemangkasan. Kalau model melewati batas, `createDocument` gagal 400 — dan errornya **hanya di-log** di `catch (briefErr)`, sementara respons tetap `success: true`. UMKM mengira briefnya tersimpan.

**Ini akar masalah di balik permintaan `doAndDont` 400→4000.** Jalur tulis wizard sudah memangkas sejak Sprint 3 (`packDoAndDontJson` di `src/lib/validations/campaign.schema.ts:107`); Function inilah satu-satunya penulis yang belum.

---

## B. Yang sudah kami kerjakan (mohon direview)

| # | File | Perubahan |
|---|---|---|
| B-1 | `src/services/order.service.ts` | Hapus `Permission.update(Role.user(order.creatorId))` dari baris `deliverables`. Read tetap untuk kedua pihak; update UMKM saja. `revisions` tidak diubah — kedua pihak memang perlu menutup revisi, dan revisi tidak memindahkan uang |
| B-2 | `appwrite/ops/harden-permissions.mjs` | Gelombang 3: `deliverables` dan `revisions` → `create("users")` + `rowSecurity: true` |
| B-3 | `appwrite/generate_appwrite_json.cjs` | Permission kedua tabel disamakan, supaya `appwrite push tables` tidak mengembalikan kebocoran (pelajaran M-3) |
| B-4 | `functions/release-escrow/src/main.js` | Fee 2% seller-side + ledger `fee` terpisah + guard status order |
| B-5 | `functions/ai-brief/src/main.js` | `clamp()` untuk empat kolom string, `clampDoAndDont()` untuk JSON, batas panjang ditulis ke prompt, kegagalan simpan tidak lagi ditelan |
| B-6 | `appwrite/generate_appwrite_json.cjs` | `createEnumAttr()` kini emit `format: "enum"` + `size` |
| B-7 | `docs/03_Workflows/30_RateCard_Order.md` | Koreksi drift — lihat §D |

### Rincian B-4 — matematika fee

```js
const feeAmount    = Math.floor(escrowAmount * 0.02);   // = calculatePlatformFee()
const creatorAmount = escrowAmount - feeAmount;          // = calculateCreatorPayout()
```

Contoh escrow Rp1.000.000 → kreator terima **980.000**, ledger `fee` **20.000**.

Dua ledger ditulis, keduanya `referenceId: escrow.$id` + `referenceType: "escrow"`, di-dedup per `type`:
- `type: "release"`, amount `creatorAmount` — dibaca `get-creator-dashboard-summary:99` sebagai pendapatan Rate Card
- `type: "fee"`, amount `feeAmount` — tidak terhitung pendapatan (`EARNING_TYPE = "release"`), murni jejak transparansi

Urutan operasi **tidak** kami ubah: escrow di-flip ke `released` lebih dulu, baru wallet dikredit. Kalau eksekusi terputus di antaranya, `findHeldEscrow` pada pemicuan berikutnya mengembalikan null sehingga kreator tidak dibayar dua kali. Kebalikannya (kredit dulu) justru berisiko bayar ganda, dan itu tidak bisa ditarik.

> **Catatan terbuka:** jendela "escrow sudah `released` tapi wallet belum dikredit" tetap ada dan butuh koreksi manual bila terjadi. Ini kondisi yang sama seperti sebelum perubahan — kami tidak memperburuk, tapi juga belum menutupnya. Kalau kalian mau, pola claim-ledger `pending → aksi → completed` yang dipakai `create-escrow` dan `mature-pending-balance` bisa diterapkan di sini juga.

### Verifikasi yang sudah kami jalankan

| Perintah | Hasil |
|---|---|
| `node --check` pada 4 file yang disentuh | Pass |
| Uji unit `clampDoAndDont` (6 kasus: normal, 40 butir, satu butir 900 char, kosong, null, tipe salah) | Semua lulus — output selalu ≤400 char dan selalu JSON valid |
| `node appwrite/generate_appwrite_json.cjs` + `git diff` | **Hanya 3 perubahan**: perm `deliverables`, perm `revisions`, `format`+`size` pada 2 kolom enum. Nol perubahan lain |

⚠️ **Belum kami jalankan:** `harden-permissions.mjs` tanpa `--dry`, `appwrite push`, dan E2E. Semuanya menunggu kalian (§C).

---

## C. Daftar Kerja Tim Backend

### C-1 🔴 Ketatkan permission `deliverables` & `revisions`

```bash
cd 00_BACKEND && node appwrite/ops/harden-permissions.mjs --dry
```

Harapan: `WOULD deliverables` dan `WOULD revisions`, sisanya `SKIP sudah sesuai`. Kalau ada tabel lain ikut muncul, **berhenti** dan kabari kami. Lalu jalankan tanpa `--dry`.

Live `deliverables` dan `revisions` seharusnya masih 0 baris, jadi tidak ada pemilik yang bisa terkunci dari datanya sendiri. Mohon konfirmasi sebelum menjalankan.

### C-2 🔴 Redeploy 2 Function

`release-escrow` (fee 2% + guard) dan `ai-brief` (clamp). Keduanya sudah kami commit.

### C-3 🟡 Verifikasi `size` enum sebelum `push tables`

`createEnumAttr()` kini emit `size` = panjang elemen terpanjang, mengikuti perilaku server Appwrite:
- `creator_profiles.niche` → `size: 10` (`pariwisata` / `kecantikan`)
- `ai_requests.feature` → `size: 7` (`landing`)

Laporan kalian di §5b menyebut `niche` sedang dalam migrasi enum → string. **Mohon bandingkan dulu dengan live** sebelum `appwrite push tables`; kalau live-nya bukan 10, kabari kami angkanya dan jangan push — kami sesuaikan generator, supaya tidak ada kolom yang tanpa sengaja dipersempit.

### C-4 ✅ `doAndDont` — ditutup, tidak jadi dinaikkan

Keputusan: **Opsi C.** Tidak ada perubahan skema; `doAndDont` tetap 400. Yang diperbaiki adalah penulisnya (`ai-brief`, B-5) yang kini memangkas ke batas kolom alih-alih gagal 400 diam-diam.

Terima kasih atas analisis row-limit MariaDB kalian di §3 — angka `briefDetail` 40000 byte itu yang membuat keputusan ini jelas.

### C-5 ⛔ Jangan dijalankan

`sync-scopes.ts` — tetap stub, jangan disentuh.

---

## D. Drift Dokumen yang Kami Koreksi

`docs/03_Workflows/30_RateCard_Order.md`:

| Yang tertulis | Kenyataan |
|---|---|
| `wallets.escrowBalance += / -= amount` | Kolom itu **tidak ada**. `wallets` = `userId`, `balance`, `pendingBalance`. Dana tertahan dilacak tabel `escrows` |
| Ledger fee `referenceType: 'order'`, `referenceId: orderId` | Kode memakai `'escrow'` + `escrow.$id`, dan `get-creator-dashboard-summary` **bergantung** pada itu untuk memisahkan pendapatan Rate Card dari reward Campaign. Dokumen yang salah, bukan kodenya |
| `notify-client-review` memicu notifikasi review | Function itu tidak ada di `functions/` maupun `appwrite.config.json` |
| Tabel Notifikasi (10 baris) | **Nol** dari semuanya terkirim di jalur Rate Card — `create-order`, `create-escrow`, `release-escrow` tidak menulis ke `notifications` sama sekali |
| Trigger `offers.status (pending→accepted)` | Event Appwrite tidak mengirim `$previous`; yang diperiksa hanya status akhir |

Dua terakhir kami tandai ⬜ di dokumen dan masukkan ke `s5-backend-confirm`, bukan blocker Alur B.

---

## E. Yang Masih Terbuka

| # | Item | Siapa |
|---|---|---|
| 1 | Notifikasi jalur Rate Card (5 titik) + Function `notify-client-review` | Bersama, Sprint 5 |
| 2 | Atomicity `release-escrow` (jendela escrow-released-tapi-wallet-belum) | Bersama, lihat catatan B-4 |
| 3 | `requestRevision` tidak menyetel `deliverables.status = 'revision_requested'` — dokumen menjanjikannya | Tim frontend, ikut `s4-rc-approve` |
| 4 | **Storage deliverable, dua masalah berlawanan arah** — lihat §F | Bersama, sebelum `s4-rc-deliverable` |
| 5 | Harness `vitest` 102/121 gagal — tidak ada gate tes | Bersama |
| 6 | E2E Alur B | Setelah C-1 & C-2 |

---

## F. Catatan: Storage Deliverable (belum diperbaiki, butuh keputusan)

Kami audit jalur upload dan menemukan dua masalah yang justru berlawanan arah. Belum kami sentuh karena perbaikannya menyangkut kontrak `validate-and-upload` yang dipakai banyak fitur lain — mohon dibahas dulu.

**F-1 — UMKM tidak akan bisa membuka deliverable-nya sendiri.**
`validate-and-upload:48` memasang `[Permission.read(Role.user(userId)), Permission.delete(Role.user(userId))]` — hanya pengunggah. Untuk deliverable, pengunggahnya kreator, jadi **UMKM tidak punya izin baca berkas yang harus ia review**. Function juga tidak tahu order mana yang dimaksud, jadi ia tidak bisa menurunkan siapa pihak lawannya.

**F-2 — sekaligus, semua berkas bocor.**
Berkas mendarat di bucket `user-files` (`DEFAULT_STORAGE_BUCKET_ID`, default `user-files`), yang `$permissions`-nya `read("users"), create("users")` dengan `fileSecurity: true`. Union lagi: **setiap user login bisa membaca berkas siapa pun** — deliverable, KTP, kontrak, apa saja. Permission per-berkas di F-1 jadi tidak ada artinya.

Bucket `deliverables` yang sudah didefinisikan di config (`appwrite.config.json`, `fileSecurity: true`) tampaknya **tidak pernah dipakai** — tidak ada kode yang menulis ke sana.

Arah perbaikan yang kami usulkan, mohon pendapat kalian:
1. Cabut `read("users")` dari bucket `user-files` (gelombang 4) — menutup F-2.
2. Beri `validate-and-upload` parameter opsional `shareWithUserId` (atau `orderId`) supaya bisa menambahkan `Permission.read` untuk pihak lawan — menutup F-1.

Urutannya penting: melakukan (1) tanpa (2) akan membuat UMKM benar-benar tidak bisa membuka deliverable.

