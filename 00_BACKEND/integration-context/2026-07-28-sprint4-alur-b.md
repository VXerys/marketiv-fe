# Sprint 4 Alur B — Handoff Tunggal

| | |
|---|---|
| **Tanggal** | 2026-07-28 (diperbarui malam) |
| **Dari** | Tim frontend/integrasi |
| **Untuk** | Tim backend — mohon direview, lalu kerjakan §B |
| **Merespons** | `2026-07-27-respons-backend-eksekusi-deployment.md` |
| **Status** | ✅ Sisi kami selesai · ⬜ Menunggu §B |
| **Sifat** | **SATU file untuk seluruh sprint ini.** Semua yang butuh tindakan atau review tim backend ada di sini. Menggantikan dua dokumen sebelumnya (`permintaan-deploy-hardening-alur-b` dan `handoff-sprint4-alur-b`) yang sudah dihapus. |

---

## 0. Ringkasan 1 Menit

| | Hal | Status |
|---|---|---|
| ✅ | Audit deployment kalian 2026-07-27 | 7/8 klaim terverifikasi benar |
| 🔴 | **3 lubang jalur uang ditutup** — permission deliverables, fee 2%, clamp ai-brief | Butuh deploy |
| 🔴 | **2 Function baru + 2 ditulis ulang** | Butuh push + deploy |
| 🔴 | **Bucket `user-files` bocor** — semua berkas terbaca semua user | Butuh gelombang 4 |
| ✅ | Rantai Alur B: chat → offer → accept → bayar → deliverable → approve | Selesai di frontend |
| ✅ | Notifikasi Rate Card — 0 dari 10 titik → kini tersambung | Butuh deploy |
| ✅ | `doAndDont` 400→4000 | **Ditutup** — Opsi C, tidak jadi dinaikkan |

**Semua keputusan yang dulu kami tunda sudah kami ambil dan implementasikan.** Yang kami minta sekarang adalah **review atas keputusannya** (§C) dan **deploy** (§B) — bukan lagi jawaban.

---

## A. Temuan Keamanan pada Jalur Uang

### A-1 🔴 Deliverable bisa disetujui siapa pun — escrow cair tanpa UMKM

Dua lapis izin sama-sama terlalu longgar:

1. **Level koleksi.** `deliverables` dan `revisions` masih `read/create/update("users")`. Permission Appwrite bersifat **union**, jadi `update("users")` = setiap user login bisa mengubah baris deliverable milik siapa pun.
2. **Level baris.** `order.service.ts` memberi `Permission.update` ke **kedua** pihak order, termasuk kreator.

`release-escrow` dipicu event `deliverables.rows.*.update` dan hanya memeriksa `status === "approved"`. Gabungan keduanya: **kreator bisa menyetujui pekerjaannya sendiri dan menarik escrow tanpa UMKM.** Guard di `approveDeliverable()` tidak menolong — penyerang tidak lewat fungsi itu, cukup `updateDocument` langsung.

Kreator memang tidak butuh hak update: kirim ulang membuat **baris baru** `version + 1`.

### A-2 🔴 `release-escrow` tidak memotong fee 2%

Function mengkredit escrow **penuh** dan hanya menulis satu ledger `release`. ADR-008 mensyaratkan fee 2% seller-side + ledger `fee` terpisah. Sementara itu `get-creator-negotiations` sudah **menampilkan** potongan 2% ke layar kreator — layar dan wallet tidak pernah cocok, dan platform tidak mencatat pendapatan apa pun dari Rate Card Mode.

### A-3 🔴 Bucket `user-files` membocorkan semua berkas

`$permissions: ["read(\"users\")", "create(\"users\")"]` dengan `fileSecurity: true`. Union lagi: **setiap user login bisa mengunduh berkas siapa pun** — deliverable order orang lain, dokumen pribadi, apa saja.

### A-4 🟠 `release-escrow` tidak memeriksa status order

Order `cancelled` pun bisa dipaksa jadi `completed` oleh baris deliverable yang berpindah ke `approved`.

### A-5 🟠 `ai-brief` menulis kolom tanpa clamp — brief hilang senyap

Lima kolom `campaign_briefs` ditulis apa adanya dari Gemini. Kalau model melewati batas, `createDocument` gagal 400 dan errornya **hanya di-log** sementara respons tetap `success: true`.

**Ini akar masalah di balik permintaan `doAndDont` 400→4000.** Jalur wizard sudah memangkas sejak Sprint 3 (`packDoAndDontJson`); Function inilah satu-satunya penulis yang belum.

---

## B. Daftar Kerja Tim Backend

### B-1. 🔴 Ketatkan permission — gelombang 3 & 4

```bash
cd 00_BACKEND && node appwrite/ops/harden-permissions.mjs --dry
```

Harapan: `WOULD deliverables`, `WOULD revisions`, `WOULD bucket:user-files`. Sisanya `SKIP`. Kalau ada target lain ikut muncul, **berhenti** dan kabari kami. Lalu jalankan tanpa `--dry`.

⚠️ **Sebelum menjalankan bucket:** mohon pastikan berkas yang sudah ada di `user-files` punya permission per-berkas. Yang diunggah lewat `validate-and-upload` sudah pasti punya (`Permission.read(Role.user(userId))` sejak awal). Kalau ada berkas yang diunggah lewat jalur lain, pemiliknya akan kehilangan akses — kabari kami dan kami sediakan skrip backfill.

### B-2. 🔴 Push + deploy Function

| Function | Perubahan | Env var khusus |
|---|---|---|
| `get-umkm-negotiations` | **BARU** — DTO negosiasi sisi UMKM | Tidak ada |
| `notify-order-activity` | **BARU** — notifikasi deliverable & revisi | Tidak ada |
| `get-creator-negotiations` | Ditulis ulang: iterasi `conversations`, body `{conversationId}` | — |
| `release-escrow` | Fee 2% + ledger `fee` + guard status order + notifikasi | — |
| `create-order` | Notifikasi order dibuat & offer ditolak | — |
| `create-escrow` | Notifikasi escrow ditahan (UMKM + kreator) | — |
| `validate-and-upload` | Parameter `shareWithOrderId` | — |
| `ai-brief` | Clamp lima kolom | — |

Semua sudah terdaftar di `appwrite.config.json` dan `appwrite/function-scopes.json`. Tidak ada env var baru — semuanya punya fallback ke nama collection default.

⚠️ **`get-creator-negotiations` kontraknya berubah** (body `{orderId}` → `{conversationId}`, respons di-key conversation). Frontend lama tidak kompatibel dengan Function baru dan sebaliknya, jadi keduanya harus naik **bersamaan** dengan commit frontend ini.

### B-3. 🟡 Verifikasi `size` enum sebelum `appwrite push tables`

`createEnumAttr()` kini emit `format: "enum"` + `size`, yang menghentikan push di `creator_profiles.niche`:
- `creator_profiles.niche` → `size: 10` (`pariwisata` / `kecantikan`)
- `ai_requests.feature` → `size: 7` (`landing`)

Laporan kalian di §5b menyebut `niche` sedang dalam migrasi enum → string. **Mohon bandingkan dengan live dulu**; kalau berbeda, kabari kami angkanya dan jangan push.

### B-4. ✅ `doAndDont` — ditutup

Keputusan: **Opsi C.** Kolom tetap 400. Yang diperbaiki adalah penulisnya (§A-5). Terima kasih atas analisis row-limit MariaDB kalian — angka `briefDetail` 40000 byte itu yang membuat keputusan ini jelas.

### B-5. ⛔ Jangan dijalankan

`sync-scopes.ts` — tetap stub.

---

## C. Keputusan yang Kami Ambil — Mohon Direview

Dua hal yang sebelumnya kami tunda karena menyangkut wilayah kalian. Atas arahan pemilik produk, kami mengambil rekomendasi kami dan mengimplementasikannya. **Silakan tolak atau minta ubah kalau tidak setuju.**

### C-1. Storage deliverable — dua masalah berlawanan arah

**Masalahnya.** `validate-and-upload` memasang izin baca hanya untuk pengunggah, jadi UMKM tidak bisa membuka deliverable yang harus ia review. Sekaligus bucket `user-files` punya `read("users")` sehingga berkas siapa pun terbaca (§A-3). Memperbaiki yang kedua tanpa yang pertama akan membuat UMKM benar-benar terkunci.

**Yang kami lakukan:**

1. `validate-and-upload` menerima parameter opsional **`shareWithOrderId`**. Function memuat order itu, memastikan pengunggah memang pesertanya, lalu menambahkan `Permission.read` untuk pihak lawan — pada berkas storage **dan** baris `user_files`.
2. Bucket `user-files` masuk gelombang 4 (§B-1).

**Kenapa `shareWithOrderId`, bukan `shareWithUserId`.** Klien tidak boleh menentukan siapa yang berhak membaca. Dengan orderId, Function yang menurunkan pihak lawannya dari data, setelah memverifikasi pengunggah adalah peserta. Kalau ordernya tidak terbaca atau pengunggah bukan peserta, berkas tetap terunggah tapi **tidak dibagikan** — gagal tertutup, dan unggahan tidak batal di tengah alur kerja.

**Bucket `deliverables` yang sudah ada di config tetap tidak dipakai.** Semua berkas mendarat di `user-files` karena di situlah kuota per-pengguna ditegakkan. Kalau kalian ingin memisahkannya, itu perubahan yang lebih besar dan sebaiknya dibahas terpisah.

### C-2. Notifikasi Rate Card — nol dari sepuluh titik

**Masalahnya.** `docs/03_Workflows/30_RateCard_Order.md` mendaftarkan 10 titik notifikasi; tidak satu pun terkirim. Kami verifikasi `grep -c notification` = 0 di `create-order`, `create-escrow`, dan `release-escrow`, dan `notify-client-review` yang dokumen sebut tidak pernah ada.

**Yang kami lakukan** — menambahkan notifikasi ke Function yang **sudah ada** sedapat mungkin, dan hanya membuat satu Function baru:

| Titik | Ditangani |
|---|---|
| Offer baru masuk → Kreator | ✅ **sudah ada** — `send-chat-notification`; `createOffer` menulis pesan bertipe `offer` yang memicunya |
| Offer ditolak → UMKM | `create-order` (event `offers.*.update` sudah terpasang di sana) |
| Order dibuat → UMKM | `create-order` |
| Pembayaran berhasil → UMKM + Kreator | `create-escrow` |
| Deliverable masuk → UMKM | **`notify-order-activity`** (baru) |
| Revisi diminta → Kreator | **`notify-order-activity`** (baru) |
| Escrow dilepas + fee → Kreator | `release-escrow` |
| Order selesai → UMKM | `release-escrow` |

**Kenapa satu Function untuk dua event.** `notify-order-activity` mendengarkan `deliverables.rows.*.create` **dan** `revisions.rows.*.create`. Keduanya butuh join yang persis sama (baris → `orders` → pihak lawan) dan menulis ke tabel yang sama dengan pola dedup yang sama. Memecahnya jadi dua Function berarti dua deployment dan dua tempat yang harus diingat saat skema berubah — persis beban yang kalian sebut ingin dihindari. Payload-nya dibedakan dari bentuk barisnya (`version` vs `requestedBy`), **bukan** dari header `x-appwrite-event` — format header itu sudah pernah berubah antar versi Appwrite (insiden prefix `tables.` 2026-07-27).

Namanya `notify-order-activity`, bukan `notify-client-review` seperti di dokumen, karena cakupannya dua arah. Dokumen workflow sudah kami perbarui.

**Idempotensi.** Semua notifikasi memakai document id deterministik dari `(sourceId, kind)`, jadi event yang terkirim ulang menghasilkan 409 — bukan notifikasi ganda. Kegagalan menulis notifikasi **tidak pernah** menggagalkan pemanggilnya: dana sudah berpindah, dan membatalkan itu karena notifikasi gagal jauh lebih merugikan.

**Yang masih kosong:** notifikasi "Deliverable disetujui" ke kreator digabung ke pesan "Dana Sudah Cair" — dua notifikasi untuk satu peristiwa hanya jadi kebisingan.

---

## D. Yang Sudah Kami Kerjakan

### D-1. Perbaikan keamanan (§A)

| # | File | Perubahan |
|---|---|---|
| 1 | `src/services/order.service.ts` | Hapus `Permission.update(creatorId)` dari baris `deliverables`. `revisions` tidak diubah — kedua pihak perlu menutup revisi, dan revisi tidak memindahkan uang |
| 2 | `appwrite/ops/harden-permissions.mjs` | Gelombang 3 (tabel) + gelombang 4 (bucket, blok `BUCKET_TARGETS` baru) |
| 3 | `appwrite/generate_appwrite_json.cjs` | Permission `deliverables`, `revisions`, bucket `user-files` disamakan supaya `push` tidak mengembalikan kebocoran |
| 4 | `functions/release-escrow` | Fee 2% + ledger `fee` + guard status order |
| 5 | `functions/ai-brief` | Clamp lima kolom, kegagalan simpan tidak lagi ditelan |
| 6 | `appwrite/generate_appwrite_json.cjs` | `createEnumAttr()` emit `format` + `size` |

**Matematika fee:** escrow Rp1.000.000 → kreator terima **980.000**, ledger `fee` **20.000**. Dua ledger, keduanya `referenceId: escrow.$id` + `referenceType: "escrow"`, di-dedup per `type`. `referenceType` sengaja `"escrow"` bukan `"order"` — `get-creator-dashboard-summary:99` bergantung padanya untuk memisahkan pendapatan Rate Card dari reward Campaign.

**Urutan operasi `release-escrow` tidak kami ubah:** escrow di-flip ke `released` lebih dulu, baru wallet dikredit. Kalau eksekusi terputus di antaranya, `findHeldEscrow` mengembalikan null sehingga kreator tidak dibayar dua kali. Kebalikannya berisiko bayar ganda, dan itu tidak bisa ditarik.

> **Catatan terbuka:** jendela "escrow sudah `released` tapi wallet belum" tetap ada dan butuh koreksi manual bila terjadi. Kondisi yang sama seperti sebelum perubahan. Kalau kalian mau, pola claim-ledger `pending → aksi → completed` yang dipakai `create-escrow` bisa diterapkan di sini.

### D-2. Sprint 4 Alur B

| Task | Isi |
|---|---|
| `s4-rc-chat` | `createConversation` + `sendMessage` + baca pesan per conversationId |
| `s4-rc-offer` | `createOffer` UMKM-only. Row perm: read kedua pihak, `update` kreator, `delete` UMKM. UMKM sengaja tanpa `update` — mengubah harga setelah kreator melihatnya bukan negosiasi yang jujur |
| `s4-rc-accept` | `acceptOffer`/`rejectOffer`. Order tidak dibuat di klien; hasilnya di-poll 5×2 detik karena `create-order` asinkron |
| `s4-rc-payment` | `create-payment` `purpose: "order"`. Escrow tidak di-set optimistis |
| `s4-rc-deliverable` | Tautan https **dan** unggah berkas (§C-1). Setiap kiriman jadi versi baru |
| `s4-rc-approve` | Approve (memicu `release-escrow`) + minta revisi, dibatasi `revisionLimit` |
| `s4-clean-negroom` / `-finance` / `-rcoffer` | Seluruh fabrikasi dibuang — lihat D-4 |

**Ruang negosiasi kini di-key `conversationId`, bukan `orderId`.** Urutan Alur B adalah chat → offer → accept → order; order lahir paling akhir. Route lama menyembunyikan seluruh tahap negosiasi, dan pembaca pesan sisi UMKM mengirim `orderId` ke `Query.equal("conversation_id", …)` — kunci yang tidak akan pernah cocok.

**Fee ditampilkan berbeda per peran, dan itu memang benar** (ADR-008 seller-side): kreator melihat potongan 2%, UMKM melihat harga penuh tanpa tambahan.

### D-3. Bug yang ikut ketahuan dan diperbaiki

| Temuan | Dampak sebelumnya |
|---|---|
| `requestRevision` tidak pernah menyetel `deliverables.status = "revision_requested"` | Deliverable yang ditolak tetap tampil `submitted` selamanya |
| Modal pembayaran negosiasi menambahkan fee 2% ke tagihan UMKM | Melanggar ADR-008, **dan akan ditolak `create-payment` dengan 409** — Function mensyaratkan nominal sama persis dengan `order.amount`. Pembayaran Rate Card tidak akan pernah berhasil |
| `CustomOfferCard` mengecek `orderStatus === "negotiation" \|\| "waiting_payment"` | Dua nilai yang tidak ada di union mana pun — tombol bayar tidak pernah muncul, badge selalu "Tawaran Disetujui" bahkan sebelum dijawab |
| Dua kartu metrik kreator sama-sama menghitung `pending_payment` | "Negosiasi" dan "Menunggu Pembayaran" selalu menampilkan angka identik |
| Halaman list negosiasi kreator fetch di Server Component | Selalu 401 dengan data nyata — sesi Appwrite hidup di klien |
| `NegotiationRoomHeader.tsx` orphan | Tidak pernah dirender; berisi modal verifikasi palsu. Dihapus |
| `wallets.escrowBalance` di dokumen workflow | Kolom itu tidak ada. Dana tertahan dilacak tabel `escrows` |

### D-4. Fabrikasi yang dibuang

Mock `rc-offer-simulated`; balasan otomatis bertimer 1,5 detik di **kedua** sisi; escrow yang hanya `setState` lokal; `window.location.reload()`; modal verifikasi yang menyebut dirinya "simulasi dashboard ini"; modal submit collab yang tidak menulis baris `deliverables` apa pun; `handlePaymentSuccess` yang menandai transaksi lunas di state lokal dan mengarang nomor Midtrans `MID-DEMO-<id>`; daftar metode pembayaran statis yang tidak pernah dikirim ke gateway.

### D-5. Verifikasi yang sudah dijalankan

| Perintah | Hasil |
|---|---|
| `npx tsc --noEmit` | **0 error** |
| `npm run lint` | 8 error / 20 warning — **persis baseline** sebelum sprint ini |
| `npm run build` | **Compiled successfully** |
| `node --check` pada 8 Function yang disentuh | Pass |
| Uji unit `clampDoAndDont` (6 kasus ekstrem) | Semua lulus — output selalu ≤400 char dan JSON valid |
| Regenerate `appwrite.config.json` | Hanya perubahan yang diniatkan |

⚠️ **Belum dijalankan:** `harden-permissions.mjs` tanpa `--dry`, `appwrite push`, dan E2E. Semuanya §B.

---

## E. E2E Setelah Deploy (dijalankan bersama)

1. UMKM buka profil kreator → "Mulai Negosiasi" → percakapan terbuat, kreator melihatnya. Ulangi ke kreator yang sama → **tidak** terbuat percakapan kedua.
2. UMKM kirim Custom Offer → muncul di chat kreator **dan** kreator dapat notifikasi. Pastikan sisi kreator **tidak punya** tombol kirim offer.
3. Kreator accept → tepat **satu** baris `orders` `pending_payment`, UMKM dapat notifikasi. Update offer sekali lagi → tetap satu baris.
4. UMKM bayar Snap sandbox sebesar **persis** `order.amount` — kalau UI menampilkan nominal lain, Function menolak 409 dan itu berarti ada regresi fee. Setelah bayar: `escrows.status = held`, order `in_progress`, **kedua pihak** dapat notifikasi.
5. Kreator kirim deliverable — **coba kedua jalur**, tautan dan unggah berkas. UMKM dapat notifikasi, dan untuk jalur berkas **pastikan UMKM benar-benar bisa membuka tautannya** (inilah yang §C-1 perbaiki).
6. UMKM minta revisi → order `revision`, deliverable `revision_requested`, kreator dapat notifikasi berisi kutipan alasannya → kreator kirim ulang → muncul sebagai `version: 2`.
7. UMKM approve → escrow Rp1.000.000 harus menghasilkan `balance += 980.000`, ledger `release` 980.000 **dan** ledger `fee` 20.000, order `completed`, kedua pihak dapat notifikasi. Angka di layar kreator harus sama dengan angka di wallet.
8. **Uji negatif A:** login sebagai kreator lain, coba `updateDocument` baris `deliverables` order tadi → harus 401/403. Sebelum B-1 ini akan **berhasil**.
9. **Uji negatif B:** login sebagai user lain, coba buka URL berkas deliverable → harus 401/403. Sebelum B-1 ini juga akan **berhasil**.
10. Kreator tarik ≥ Rp50.000 → `withdrawals` terbuat, `balance` berkurang.

Harness `vitest` (102/121 gagal) rusak sejak sebelum sprint ini dan **bukan** gate yang bisa diandalkan.

---

## F. Yang Masih Terbuka

| # | Item | Siapa |
|---|---|---|
| 1 | Atomicity `release-escrow` — jendela escrow-released-tapi-wallet-belum (§D-1) | Bersama |
| 2 | Direct Order (Jalur A) belum terwakili di daftar negosiasi. Order berbasis `packageId` tidak punya conversation. Jalur itu memang belum dibangun — saat dibangun, cara paling bersih adalah ikut membuat `conversations` untuk pasangannya | Frontend, sprint berikutnya |
| 3 | Bucket `deliverables` di config tidak pernah dipakai — semua berkas ke `user-files` karena di situ kuota ditegakkan. Perlu diputuskan: dipakai, atau dihapus dari config | Bersama |
| 4 | Harness `vitest` rusak — tidak ada gate tes | Bersama |
