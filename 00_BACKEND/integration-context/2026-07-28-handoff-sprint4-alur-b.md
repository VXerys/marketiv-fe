# Handoff Sprint 4 Alur B — Deploy & Keputusan yang Ditunggu

| | |
|---|---|
| **Tanggal** | 2026-07-28 (malam) |
| **Dari** | Tim frontend/integrasi |
| **Untuk** | Tim backend — mohon direview, lalu kerjakan §B |
| **Merespons** | `2026-07-28-permintaan-deploy-hardening-alur-b.md` (masih menunggu §C di sana) |
| **Status** | ✅ Sisi kami selesai · ⬜ Menunggu §B · ⬜ Menunggu keputusan §C |
| **Sifat** | Rantai Rate Card Mode (Alur B) sudah tersambung ujung ke ujung di frontend. Yang tersisa adalah deploy dan dua keputusan. |

---

## 0. Ringkasan 1 menit

| | Hal | Status |
|---|---|---|
| ✅ | Rantai Alur B: chat → offer → accept → bayar → deliverable → approve | Selesai di frontend |
| 🔴 | **Function baru `get-umkm-negotiations`** | Butuh push + deploy |
| 🔴 | **`get-creator-negotiations` ditulis ulang** | Butuh redeploy |
| 🔴 | Deploy hardening 2026-07-28 (`release-escrow`, `ai-brief`, permission gelombang 3) | **Masih menunggu** |
| ⬜ | Keputusan storage deliverable (§F handoff sebelumnya) | Menunggu kalian |
| ⬜ | Notifikasi jalur Rate Card — nol dari 10 titik terkirim | Menunggu keputusan |

---

## A. Apa yang Berubah dan Kenapa

### A-1. Ruang negosiasi di-key `conversationId`, bukan `orderId`

Urutan Alur B adalah **chat → offer → accept → order**. Order lahir PALING AKHIR, dibuat `create-order` setelah kreator menerima offer. Route dan kedua daftar negosiasi sebelumnya di-key `orderId` dan beriterasi atas tabel `orders`, sehingga seluruh tahap negosiasi — justru bagian yang layar itu namai — tidak punya tempat sama sekali.

Gejalanya sudah ada di kode: pembaca pesan sisi UMKM mengirim `orderId` ke `Query.equal("conversation_id", …)`, kunci yang tidak akan pernah cocok. Chat UMKM selalu kosong.

`conversations` punya unique index `umkm_id + creator_id`, jadi satu percakapan per pasangan dan id-nya stabil sepanjang hidup relasi. Itu kunci yang benar.

### A-2. `stage` menggantikan `status` di DTO negosiasi

`OrderStatus` tidak punya nilai untuk "order belum ada". Ditambahkan `NegotiationStage`:

```
chatting → offer_pending → (offer_rejected | awaiting_order) → OrderStatus…
```

Diturunkan di Function (`deriveStage`), bukan di klien — supaya kedua dashboard tidak bisa berbeda pendapat.

### A-3. Fee ditampilkan berbeda per peran — dan itu memang benar

ADR-008: Rate Card Order **seller-side**. UMKM membayar persis harga rate card; potongan 2% diambil dari pendapatan kreator saat escrow dirilis.

- `get-creator-negotiations` → `platformFee = floor(price × 2%)`, `totalAmount` = yang DITERIMA kreator
- `get-umkm-negotiations` → `platformFee = 0`, `totalAmount` = yang DIBAYAR UMKM

Kami juga menemukan modal pembayaran di ruang negosiasi menambahkan 2% ke tagihan UMKM. Selain melanggar ADR-008, itu akan **ditolak `create-payment` dengan 409** — Function mensyaratkan nominalnya sama persis dengan `order.amount`. Sudah diperbaiki.

---

## B. Daftar Kerja Tim Backend

### B-1. 🔴 Push + deploy Function baru: `get-umkm-negotiations`

Sudah ada di `functions/get-umkm-negotiations/`, terdaftar di `appwrite.config.json` dan `appwrite/function-scopes.json`.

| Field | Nilai |
|---|---|
| `execute` | `["users"]` |
| `events` | `[]` |
| `scopes` | `["documents.read"]` |
| `timeout` | 30 |
| Env vars | **Tidak ada yang khusus** — semuanya punya fallback ke nama collection default |

Cermin dari `get-creator-negotiations`; yang berbeda hanya sisi peserta, profil lawan bicara, dan semantik fee.

### B-2. 🔴 Redeploy `get-creator-negotiations`

Ditulis ulang: sumber iterasinya pindah dari `orders` ke `conversations`, dan responsnya kini menerima body `{ conversationId }` alih-alih `{ orderId }`. Kontrak DTO-nya berubah — **frontend lama tidak kompatibel dengan Function baru dan sebaliknya**, jadi keduanya harus naik bersamaan dengan commit frontend ini.

### B-3. 🔴 Deploy hardening 2026-07-28 yang belum jalan

Ini prasyarat langkah E2E 6 & 7 di bawah. Rinciannya di handoff sebelumnya:

```bash
cd 00_BACKEND && node appwrite/ops/harden-permissions.mjs --dry
```

Harapan: `WOULD deliverables` dan `WOULD revisions`, sisanya `SKIP`. Lalu jalankan tanpa `--dry`, dan redeploy `release-escrow` + `ai-brief`.

### B-4. 🟡 Verifikasi `size` enum sebelum `appwrite push tables`

Masih sama seperti handoff sebelumnya (§C-3). `creator_profiles.niche` → `size: 10`, `ai_requests.feature` → `size: 7`. Mohon bandingkan dengan live dulu; kalau berbeda, kabari kami angkanya dan jangan push.

### B-5. ⛔ Jangan dijalankan

`sync-scopes.ts` — tetap stub.

---

## C. Keputusan yang Kami Tunggu

### C-1. Storage deliverable — jalur unggah berkas masih tertutup

Diulang dari §F handoff sebelumnya karena sekarang **memblokir fitur yang sudah dibangun**. Untuk saat ini kreator hanya bisa mengirim deliverable sebagai **URL eksternal (https)**; `uploadDeliverableSchema` menolak `source: "storage"` secara eksplisit.

Dua masalah berlawanan arah:

1. **`validate-and-upload:48`** memasang `[Permission.read(Role.user(userId)), Permission.delete(...)]` — hanya pengunggah. Untuk deliverable, pengunggahnya kreator, jadi **UMKM tidak punya izin baca berkas yang harus ia review**.
2. Berkas mendarat di bucket **`user-files`**, yang `$permissions`-nya `read("users"), create("users")` dengan `fileSecurity: true`. Union lagi: setiap user login bisa membaca berkas siapa pun. Permission per-berkas di (1) jadi tidak ada artinya.

Bucket `deliverables` yang sudah didefinisikan di config tampaknya **tidak pernah dipakai** — tidak ada kode yang menulis ke sana.

Usulan kami, mohon pendapat:
- Beri `validate-and-upload` parameter opsional `shareWithUserId` (atau `orderId`) supaya bisa menambahkan `Permission.read` untuk pihak lawan → menutup (1)
- Cabut `read("users")` dari bucket `user-files` sebagai gelombang 4 → menutup (2)

**Urutannya penting**: melakukan yang kedua tanpa yang pertama akan membuat UMKM benar-benar tidak bisa membuka deliverable.

### C-2. Notifikasi jalur Rate Card — nol dari sepuluh titik

`docs/03_Workflows/30_RateCard_Order.md` mendaftarkan 10 titik notifikasi. **Tidak satu pun terkirim.** `create-order`, `create-escrow`, dan `release-escrow` tidak menulis ke `notifications` sama sekali (sudah kami verifikasi: `grep -c notification` = 0 di ketiganya), dan Function `notify-client-review` yang dokumen sebut tidak ada di repo maupun config.

Dampak nyatanya: kreator tidak tahu ada offer masuk, UMKM tidak tahu deliverable sudah dikirim, dan keduanya tidak tahu dana sudah dilepaskan — kecuali kalau kebetulan membuka halamannya.

Pertanyaannya: apakah ini digarap sebagai satu Function `notify-*` baru, atau ditempelkan ke Function-Function yang sudah ada? Kami tidak mengambil keputusan sepihak karena menyangkut jumlah Function yang kalian kelola.

---

## D. Yang Sudah Kami Kerjakan

| Task | Isi |
|---|---|
| `s4-rc-chat` | `createConversation` + `sendMessage` + baca pesan per conversationId. Row perm kedua pihak. Duplikat percakapan ditangani dua jalur: cek awal dan tangkap 409 |
| `s4-rc-offer` | `createOffer` UMKM-only. Row perm: read kedua pihak, `update` kreator, `delete` UMKM. UMKM sengaja tanpa `update` — mengubah harga setelah kreator melihatnya bukan negosiasi yang jujur. `offer.schema.ts` dibuat (Sprint 3 mencatatnya selesai tapi filenya tidak pernah ada) |
| `s4-rc-accept` | `acceptOffer`/`rejectOffer` kreator. Order TIDAK dibuat di klien — `create-order` yang mengerjakannya, dan hasilnya di-poll 5×2 detik karena asinkron |
| `s4-rc-payment` | `create-payment` `purpose: "order"`. Escrow tidak di-set optimistis |
| `s4-rc-deliverable` | Kirim hasil kerja sebagai URL https. Setiap kiriman jadi versi baru. **Row perm: `update` UMKM saja** — memberi kreator hak update sama dengan mengizinkannya menyetujui pekerjaannya sendiri lalu menarik dananya |
| `s4-rc-approve` | Approve (memicu `release-escrow`) + minta revisi, dibatasi `revisionLimit` |
| `s4-clean-negroom` | Fabrikasi dibuang: mock `rc-offer-simulated`, balasan otomatis bertimer di kedua sisi, escrow lokal, `window.location.reload()`, modal verifikasi "simulasi dashboard ini", modal submit collab yang tidak menulis apa pun |
| `s4-clean-finance` + `s35-ui-payment` | `handlePaymentSuccess` (setTimeout lalu tandai lunas di state lokal) diganti aksi nyata: lanjut ke Snap `redirect_url`, atau batalkan lewat `cancel-payment` |
| `s4-clean-rcoffer` + `s35-ui-offer` | Route simulasi dibuang; penawaran yang belum dijawab bisa ditarik kembali |

### Bug yang ikut ketahuan dan diperbaiki

| Temuan | Dampak sebelumnya |
|---|---|
| `requestRevision` tidak pernah menyetel `deliverables.status = "revision_requested"` | Deliverable yang ditolak tetap tampil `submitted` selamanya. Ini §E-3 handoff sebelumnya |
| `CustomOfferCard` mengecek `orderStatus === "negotiation" \|\| "waiting_payment"` | Dua nilai yang tidak ada di union mana pun — tombol bayar tidak pernah muncul, badge selalu berbunyi "Tawaran Disetujui" bahkan sebelum dijawab |
| Modal pembayaran negosiasi menambahkan fee 2% ke tagihan UMKM | Melanggar ADR-008, dan akan ditolak `create-payment` dengan 409 |
| Dua kartu metrik kreator sama-sama menghitung `pending_payment` | "Negosiasi" dan "Menunggu Pembayaran" selalu menampilkan angka identik |
| Halaman list negosiasi kreator fetch di Server Component | Akan selalu 401 dengan data nyata — sesi Appwrite hidup di klien |
| `NegotiationRoomHeader.tsx` orphan | Tidak pernah dirender; berisi modal verifikasi palsu. Dihapus |
| `finance/modals/PaymentSimulationModal.tsx` orphan setelah diganti | Dihapus |

### Verifikasi yang sudah dijalankan

| Perintah | Hasil |
|---|---|
| `npx tsc --noEmit` | **0 error** |
| `npm run lint` | 8 error / 20 warning — **persis baseline** sebelum perubahan (semuanya pre-existing di file yang tidak disentuh) |
| `npm run build` | **Compiled successfully** |
| `node --check` pada 4 Function | Pass |
| Regenerate `appwrite.config.json` | Diff hanya +19 baris = blok Function baru |

⚠️ **Belum kami jalankan:** E2E. Semuanya menunggu B-1, B-2, dan B-3.

---

## E. E2E Setelah Deploy (kami jalankan bersama)

1. UMKM buka profil kreator → "Mulai Negosiasi" → percakapan terbuat, kreator melihatnya. Ulangi ke kreator yang sama → **tidak** terbuat percakapan kedua (unique index).
2. UMKM kirim Custom Offer → muncul di chat kreator. Pastikan sisi kreator **tidak punya** tombol kirim offer.
3. Kreator accept → tepat **satu** baris `orders` berstatus `pending_payment`. Update offer sekali lagi → tetap satu baris (unique index `idx_offerId`).
4. UMKM bayar Snap sandbox sebesar **persis** `order.amount` — kalau UI menampilkan nominal lain, Function menolak 409 dan itu berarti ada regresi fee. Setelah bayar: `escrows.status = held`, order `in_progress`.
5. Kreator kirim deliverable (URL https) → UMKM minta revisi → order `revision`, deliverable `revision_requested` → kreator kirim ulang → muncul sebagai `version: 2`.
6. UMKM approve → escrow Rp1.000.000 harus menghasilkan `balance += 980.000`, ledger `release` 980.000 **dan** ledger `fee` 20.000, order `completed`. Angka di layar kreator harus sama dengan angka di wallet.
7. **Uji negatif:** login sebagai kreator lain, coba `updateDocument` baris `deliverables` order tadi → harus 401/403. Sebelum B-3, ini akan **berhasil** — itulah lubangnya.
8. Kreator tarik ≥ Rp50.000 → `withdrawals` terbuat, `balance` berkurang.

Harness `vitest` (102/121 gagal) rusak sejak sebelum sprint ini dan bukan gate yang bisa diandalkan.

---

## F. Yang Masih Terbuka

| # | Item | Siapa |
|---|---|---|
| 1 | Storage deliverable (§C-1) | Keputusan bersama |
| 2 | Notifikasi jalur Rate Card (§C-2) | Keputusan bersama |
| 3 | Atomicity `release-escrow` — jendela escrow-released-tapi-wallet-belum | Bersama |
| 4 | Direct Order (Jalur A) belum terwakili di daftar negosiasi. Order berbasis `packageId` tidak punya conversation. Jalur itu memang belum dibangun — saat dibangun, cara paling bersih adalah ikut membuat `conversations` untuk pasangannya | Frontend, sprint berikutnya |
| 5 | Harness `vitest` rusak | Bersama |
