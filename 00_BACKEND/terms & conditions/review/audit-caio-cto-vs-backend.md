# Audit Temuan CTO & CAIO vs Dokumentasi & Kode Backend

**Perspektif:** Backend Developer (8 tahun pengalaman penyusunan/review T&C platform marketplace)
**Tujuan:** Menjawab per-temuan apakah blocker/rekomendasi CTO (7 P0, 25+ P1, 8 klausul hilang, matriks konsistensi) dan CAIO (3 temuan) **sudah terjawab atau belum** di dokumentasi (`docs/`) dan kode (`src/`, `functions/`) backend.
**Tanggal audit:** 2026-08-02
**Sumber yang diaudit:**
- `docs/02_Modules/*/30_Business_Rules.md`, `50_Database.md`, `70_Backend.md` (10 modul)
- `docs/04_Decisions/ADR-007.md`, `ADR-008.md`
- `src/services/*.ts` (service layer)
- `functions/*/src/main.js` (32 Appwrite Functions)
- `appwrite.config.json` (skema nyata 31 koleksi)

**Legenda:** ✅ Sudah terpenuhi · ⚠️ Sebagian / struktural saja · ❌ Belum · 🚩 Blocker baru ditemukan audit (di luar review CTO/CAIO)

---

## Ringkasan Eksekutif

| Grup | Jumlah | ✅ | ⚠️ | ❌ |
|------|--------|----|----|-----|
| Blocker P0 CTO | 7 | 2 | 0 | 5 |
| Temuan P1 CTO | 26 | 4 | 7 | 15 |
| Klausul hilang (implikasi backend) | 8 | 2 | 2 | 4 |
| Temuan CAIO | 3 | 0 | 1 | 2 |

**Verdict backend:** 🚩 **BELUM SIAP PUBLIKASI.** Selain blocker CTO yang belum tertutup, audit menemukan **3 blocker baru** yang lebih fundamental:

1. **🚩 B-1 — Fee platform: T&C 5% vs Backend 2%.** Seluruh lapisan backend (ADR-008, 3 file Business Rules, `wallet.service.ts:6`, `release-escrow/main.js:18`, `create-payment`) konsisten di **2%**, sedangkan T&C V3 Pasal 9 dan matriks CTO menyebut **5%**. Kode memotong 2%. Artinya: **T&C menulis angka yang tidak diimplementasikan sistem.**
2. **🚩 B-2 — Tidak ada implementasi refund sama sekali.** T&C Pasal 15 menjanjikan refund (ke Wallet UMKM, sisa budget campaign). Kode hanya punya `cancel-payment` (membatalkan payment `pending`). Tidak ada satu pun jalur refund escrow/balance. **Pasal 15 T&C = janji tanpa mesin.**
3. **🚩 B-3 — Tidak ada mekanisme suspend/penangguhan akun.** Kata "suspend" tidak ada di `src/` maupun `functions/`. `users.status` di kode hanya `active` (dokumen bilang `active|suspended`). T&C Pasal 18 (tangga sanksi + banding CAIO-02) tidak bisa dieksekusi sistem.

---

## Bagian A — 7 Blocker P0 CTO

### CTO-01 — Perhitungan views tidak didefinisikan → ❌ BELUM

**Status di docs:**
- `docs/02_Modules/Campaigns/50_Database.md:113` — `views` "Diisi creator saat submit, lalu **ditimpa UMKM saat approve**". Tidak ada `views_captured_at`, `views_source`, `views_final`.

**Status di kode:**
- `functions/calculate-campaign-reward/src/main.js:40` — `const views = Number(doc.views) || 0;` → reward dihitung dari angka manual di payload event.
- `functions/review-submission/src/main.js:41,46,76` — views diinput UMKM sebagai integer saat approve. Tidak ada snapshot sistem.
- ✅ Yang sudah benar: `Math.min(floor((views/1000)*rate), remainingBudget)` → views < 1000 = Rp0 (main.js:44-47) — sudah sesuai redaksi CTO.

**Verdict:** ❌ Belum. Sumber views tetap manual, bukan pengukuran sistem.

**Rekomendasi backend:**
1. `campaign_submissions` tambah: `views_count` (int), `views_captured_at` (datetime), `views_source` (enum `api|scrape|manual_admin`), `views_final` (bool).
2. `review-submission` menulis 3 field tsb dalam transaksi yang sama dengan perubahan status.
3. `calculate-campaign-reward` membaca `views_final ? views_count : doc.views`.

---

### CTO-02 — Tidak ada batas waktu review UMKM (Rate Card) → ❌ BELUM

**Status di docs:** `docs/02_Modules/Orders/30_Business_Rules.md:31-33` — release saat approve; tidak ada deadline. Tidak ada `auto-approve` di dokumen manapun.

**Status di kode:** `appwrite.config.json` skema `orders` — tidak ada `review_deadline_at`, `auto_approved`, `revision_count`. **Tidak ada fungsi `auto-approve-orders`** di daftar 32 functions.

**Verdict:** ❌ Belum. Escrow bisa ditahan UMKM tanpa batas.

**Rekomendasi backend:**
1. `orders` tambah: `review_deadline_at`, `auto_approved`, `revision_count`, `revision_limit`.
2. Fungsi cron baru `auto-approve-orders` (pola `expire-stale-claims`), idempoten (cek `status = delivered`).
3. Panggil orchestrator release yang sama dengan approval manual (jangan duplikasi logika).

---

### CTO-03 — Saldo Wallet UMKM terkunci → ❌ BELUM

**Status di docs:** `docs/02_Modules/Payments/30_Business_Rules.md:100` — withdrawal "langsung diproses", tanpa menyebut siapa yang boleh. K-16 (di T&C) menyatakan refund masuk Wallet UMKM.

**Status di kode:** `functions/request-withdrawal/src/main.js:40-44` — guard eksplisit:
```js
if (role !== "creator") {
  return json(res, { error: "Hanya kreator yang dapat menarik saldo." }, 403);
}
```

**Verdict:** ❌ Belum. Refund UMKM masuk wallet → tidak bisa ditarik. Opsi B CTO (bangun withdrawal UMKM) tidak ada.

**Rekomendasi backend (Opsi B):**
1. Hapus guard `role !== "creator"`, ganti validasi **sumber saldo** (saldo dari refund/sisa budget boleh ditarik UMKM; saldo tertunda & escrow tidak).
2. `withdrawals` tambah `requester_role` dan/atau `source_origin`.

---

### CTO-04 — Wallet+Escrow berpotensi kena regulasi PJP → ❌ BELUM

**Status di docs:** `docs/02_Modules/Payments/50_Database.md:35` — `payments.purpose = order|topup|campaign` → **top-up masih ada** di skema & docs.

**Status di kode:** `src/services/payment.service.ts:5` — `PaymentPurpose = 'order' | 'topup' | 'campaign'`; `functions/create-escrow/src/main.js:14` — `completeTopup()` untuk `topup`/`campaign`. **Top-up MVP belum dihapus.**

**Verdict:** ❌ Belum. Saran CTO (hapus top-up dari MVP, rekening terpisah, Pasal 10.4-10.5) tidak dieksekusi.

**Rekomendasi backend:**
1. Keputusan produk dulu: hapus/tunda `purpose = topup`.
2. Siapkan ledger rekonsiliasi harian (`reconcile-ledger` cron): `SUM(balance+pendingBalance+escrow.held)` vs mutasi bank → alert admin.

---

### CTO-05 — Withdrawal instan tanpa reversal + KYC → ❌ BELUM

**Status di docs:** `docs/02_Modules/Payments/50_Database.md:96` — `withdrawals.status` = `processed` (satu state). `Payments/30_Business_Rules.md:100` — langsung diproses.

**Status di kode:**
- `src/services/wallet.service.ts:10` — `WithdrawalStatus = 'processed'`.
- `functions/request-withdrawal/src/main.js:76` — `status: "processed"` ditulis **sebelum pencairan nyata**; komentar kode mengakui: "risiko produk/keuangan, bukan bug kode" (baris 12-15).
- Tidak ada `withdrawal-callback`, tidak ada status `reversed`, tidak ada KYC.

**Verdict:** ❌ Belum. T&C 11.4/11.6 tidak sinkron dengan kenyataan: saldo langsung berkurang walau uang belum tentu sampai rekening.

**Rekomendasi backend:**
1. `withdrawals.status` → `requested → processing → succeeded | failed | reversed` (4-state).
2. Fungsi `withdrawal-callback` dari penyedia disbursement; fallback aksi admin "tandai gagal & kembalikan saldo".
3. Reversal = entry ledger baru (`type=withdrawal_reversal`), bukan update.
4. Rate limit: maks 3 withdrawal/hari + cooling period setelah ubah rekening.
5. KYC opsional (Pasal 11.8): field verifikasi identitas sebelum penarikan.

---

### CTO-06 — Tidak ada alat bukti sistem + zona waktu → ❌ BELUM (sebagian)

**Status di docs:** Tidak ada standar zona waktu global di `docs/01_Global/`.

**Status di kode:** `functions/midtrans-webhook/src/main.js:213` — `toIsoDate()` mengasumsikan `+07:00` (WIB) untuk input Midtrans; timestamp lain disimpan ISO UTC. Tidak ada util `formatWIB()` terpusat.

**Verdict:** ❌ Belum. Server timestamp memang tersimpan (fondasi alat bukti ada), tapi standar waktu + klausul alat bukti belum terdokumentasi.

**Rekomendasi backend:**
1. Dokumentasikan: seluruh `datetime` disimpan UTC, dirender WIB (UTC+7).
2. Buat util `formatWIB()` tunggal.
3. Dokumentasikan frekuensi cron (batas "selisih wajar").

---

### CTO-07 — Collab Post vs escrow release → ✅ BACKEND SUDAH SESUAI (Opsi 1 CTO)

**Status di docs:** `docs/02_Modules/Orders/30_Business_Rules.md:31-33` — "Saat UMKM approve deliverable, escrow dirilis". Tidak ada Collab Post sebagai syarat release.

**Status di kode:** `functions/release-escrow/src/main.js:45-47` — release saat deliverable `approved` (order `in_progress`/`revision`). Tidak ada validasi Collab Post.

**Verdict:** ✅ Backend sudah mengikuti **Opsi 1 CTO** (release saat approve; Collab Post = kewajiban kontraktual, ditegakkan lewat sanksi Pasal 18). **Yang salah adalah T&C Pasal 8.4.b** yang menjadikan Collab Post syarat release → ini tugas revisi T&C, **bukan** tugas backend.

**Catatan backend:** tidak perlu perubahan kode untuk CTO-07. Opsional: dokumentasikan status order yang tidak boleh cair saat suspend (kait CTO-09).

---

## Bagian B — Temuan P1 CTO (26 item)

| ID | Temuan | Docs | Kode | Verdict |
|----|--------|------|------|---------|
| CTO-08 | Role immutable | `users.role` set saat create (`create-user-profile/main.js:90`); permission users = Admin write (`Users/50_Database.md:40-45`) | Tidak ada endpoint ubah role | ⚠️ Tercegah struktural, tanpa aturan eksplisit |
| CTO-09 | Escrow saat akun suspend | `users.status` "mis. active, suspended" (`Users/50_Database.md:26`) | **Tidak ada "suspend" di src/functions sama sekali** | ❌ Belum (lihat B-3) |
| CTO-10 | Verifikasi email wajib | Tidak ada | Tidak ada `email_verified` di mana pun | ❌ Belum |
| CTO-11 | Simpan versi T&C | Tidak ada | Tidak ada `tos_version`/`tos_accepted_at` | ❌ Belum |
| CTO-12 | Race condition claim | Docs: unique `campaignId+creatorId` (`Campaigns/50_Database.md:95`) | `src/services/claim.service.ts:129,175-180` — read-modify-write `totalClaims` **di klien**; tidak atomik | ⚠️ Sebagian (dedup ada, kuota rawan race) |
| CTO-13 | Link aset mati | Tidak ada klausul/handler | Tidak ada | ❌ Belum |
| CTO-14 | Pause/stop & claim aktif | `campaigns.status` punya `paused` (`Campaigns/30_BR:5-9`) | `expire-stale-claims` hanya memproses status `claimed`; tidak ada aturan claim saat paused | ⚠️ Sebagian |
| CTO-15 | Over-allocation reward | Tidak didokumentasikan | ✅ `atomic.js` `decrementColumn(min:0)` server-enforced; reward capped `remainingBudget` (`calculate-campaign-reward/main.js:44-47,88-93`) | ✅ Sudah |
| CTO-16 | Durasi pending→available | ✅ Didokumentasikan 7 hari (`Payments/30_BR:26-32`) | ✅ `MATURATION_DAYS = 7` (`mature-pending-balance/main.js:28`) + cron | ✅ Sudah di backend; T&C yang kosong |
| CTO-17 | SUPPORTED_PLATFORMS satu konstanta | MVP tiktok only (docs konsisten) | `tiktok` hardcoded di docs/validasi; tidak ada konstanta tunggal | ⚠️ Sebagian |
| CTO-18 | Min budget vs channel Midtrans | `MINIMUM_CAMPAIGN_BUDGET=50000` (`wallet.service.ts:5`) | Tidak ada pengecekan min amount per channel | ⚠️ Sebagian |
| CTO-19 | Custom Offer expired 7 hari | `offers` tdk punya `expires_at` (`Offers/50_Database.md`) | `create-offer` tanpa expiry; status `pending` selamanya | ❌ Belum |
| CTO-20 | Estimasi mulai dari escrow | `rate_card_packages.deliveryDays` ada (`RateCards/50_Database.md:34`) | `orders` tdk punya `work_started_at`; order dibuat `pending_payment` | ❌ Belum |
| CTO-21 | Video wajib link eksternal | ✅ `deliverables` MVP = `external_url` (`Orders/50_Database.md:28`); `user_files` dormant | ✅ | ✅ Sudah |
| CTO-22 | Limit 3 paket | Tidak ada (`RateCards/30_BR:17` "paket bisa ditambah") | Tidak ada validasi | ❌ Belum |
| CTO-23 | Chat archive setelah order | `conversations.is_archived` ada (`Chat/50_Database.md:18`) | `chat.service.ts:275` — archive manual user | ⚠️ Sebagian; tanpa auto-archive/`archived_at` |
| CTO-24 | Chargeback pasca-release | Tidak ada | `midtrans-webhook/main.js:183-184` memetakan chargeback→`cancelled`, **tapi tidak menarik dana yang sudah dirilis** | ❌ Belum |
| CTO-25 | Webhook idempotensi | ✅ Docs menyebut idempotent (`Payments/30_BR:11`) | ✅ Terminal-status guard + signature + amount match (`midtrans-webhook/main.js:4,52-55`); dedup escrow/ledger (`create-escrow`, `calculate-campaign-reward`) | ✅ Sudah |
| CTO-26 | Fee refund proporsional | Tidak ada | Tidak ada jalur refund | ❌ Belum (lihat B-2) |
| CTO-27 | MDR / channel | Tidak ada | Tidak ada | ❌ Belum |
| CTO-28 | Pajak / NPWP | Tidak ada | Tidak ada field `npwp` | ❌ Belum |
| CTO-29 | Definisi escrow | ✅ T&C Pasal 4 sudah benar ("penahanan oleh sistem") | `escrows` collection + status `held/released/refunded` | ✅ Sudah |
| CTO-30 | 3 angka wallet | `wallets` hanya `balance`+`pendingBalance` (`Payments/50_Database.md:14-15`) | `Wallet` type 2 field (`wallet.service.ts:13-20`) | ❌ Belum (hanya 2 angka; escrow di koleksi terpisah) |
| CTO-31 | Ledger append-only | Tidak eksplisit | ⚠️ Money functions hanya `createDocument`; `request-withdrawal` menghapus baris audit saat rollback (main.js:103) | ⚠️ Sebagian |
| CTO-32 | Rate limit withdrawal | Tidak ada | Hanya `findRecentDuplicate` 60 detik nominal sama (`request-withdrawal/main.js:286-297`) | ⚠️ Sebagian |
| CTO-33 | Biaya admin Rp2.500 | Tidak ada di backend | ✅ Tidak ada `ADMIN_FEE` di kode | ✅ Backend bersih; UI yang perlu dihapus |

---

## Bagian C — Klausul Hilang (8) — Implikasi Backend

| # | Klausul | Verdict backend | Catatan |
|---|---------|-----------------|---------|
| 1 | Catatan sistem alat bukti | ⚠️ Fondasi ada (timestamp server tersimpan) | Butuh klausul T&C + standar WIB (CTO-06) |
| 2 | Zona waktu & definisi hari | ❌ Belum | Standar WIB belum terdokumentasi |
| 3 | Chargeback/pencabutan dana | ❌ Belum | Butuh mekanisme penarikan dana pasca-release |
| 4 | KYC verifikasi penerima | ❌ Belum | Butuh field + alur verifikasi (CTO-05) |
| 5 | Pemeliharaan layanan | ✅ Tidak butuh kode | Kebijakan operasional |
| 6 | Force majeure | ✅ Tidak butuh kode | Klausul legal murni |
| 7 | Retensi data vs PDP | ⚠️ Data tersimpan permanen | Butuh kebijakan anonimisasi; ledger tidak boleh dihapus |
| 8 | Batas ukuran berkas | ✅ Didokumentasikan (`Users/30_BR:45-49`: 20MB/file, 100MB/akun, 100 file) | Infrastruktur **dormant** (MVP pakai external URL) — konsisten dgn T&C K-15 |

---

## Bagian D — Matriks Konsistensi (Hasil Audit Aktual)

| Topik | T&C V3 | Docs backend | Kode | Verdict |
|-------|--------|--------------|------|---------|
| **Fee platform** | **5%** (Pasal 9) | **2%** (ADR-008; Payments/Campaigns/RateCards 30_BR) | **2%** (`PLATFORM_FEE_RATE = 0.02`, `wallet.service.ts:6`; `release-escrow/main.js:18`) | 🚩 **KONFLIK BESAR** |
| Min withdrawal Rp50K | ✅ | ✅ (ADR-007) | ✅ `MINIMUM_WITHDRAW = 50000` | ✅ |
| Withdrawal instan | ✅ | ✅ | ✅ status `processed` langsung | ✅ (tanpa reversal → CTO-05) |
| Biaya admin Rp2.500 | placeholder | tdk ada | tdk ada | ✅ backend konsisten; UI ❌ |
| Platform Bukti Tayang | netral | tiktok | tiktok | ⚠️ netral T&C vs tiktok backend |
| Limit 3 paket | ada | tdk ada | tdk ada | ❌ |
| Collab Post vs release | syarat | bukan | bukan | ❌ T&C; backend sudah Opsi 1 |
| Refund ke Wallet UMKM | ya | dokumen setuju (K-16) | **tdk ada implementasi** | 🚩 |
| Pending → available | tdk diatur | 7 hari | `MATURATION_DAYS = 7` | ⚠️ T&C kosong |

---

## Bagian E — Temuan CAIO (3)

### CAIO-01 — Kepemilikan konten hasil kerja (Pasal 16.3) → ⚠️ SEBAGIAN

**Status di kode:** Titik peralihan kepemilikan = release escrow sudah ada (`release-escrow`). Namun **tidak ada metadata kreditasi/attribution Kreator** pada deliverable/submission — tidak ada field "creator credit" yang bisa dipertahankan setelah kepemilikan pindah ke UMKM.

**Verdict:** ⚠️ Sebagian. Mekanisme peralihan ada; dukungan attribution (CAIO-01b: "UMKM tidak boleh menghapus kreditasi") tidak punya dasar data.

**Rekomendasi backend:**
1. Tambah field metadata pembuat/kreditasi pada `campaign_submissions` & `deliverables` (mis. `creatorCredit`/`attribution`).
2. Dokumentasikan di Orders/50_Database bahwa release escrow = titik peralihan kepemilikan.

### CAIO-02 — Mekanisme banding suspend (Pasal 18) → ❌ BELUM

**Status di kode:** Tidak ada status `suspended`, tidak ada entitas banding, tidak ada timer SLA. Lihat B-3.

**Verdict:** ❌ Belum. T&C Pasal 18 (termasuk redaksi banding 18.5) tidak bisa dijalankan sistem.

**Rekomendasi backend:**
1. Implementasikan status akun: `active | suspended | terminated`.
2. Koleksi baru `appeals`: `userId`, `actionRef` (suspend/terminate), `reason`, `evidence`, `deadline_at`, `status`, `decision`.
3. Cron SLA banding (mis. respon 7 hari kerja) + notifikasi.

### CAIO-03 — Penggunaan AI generatif (Pasal 12.5) → ❌ BELUM

**Status di kode:** Modul AI ada (`ai-brief`, `ai-fraud-precheck`) tapi itu AI **internal** Marketiv. Tidak ada penanda/metadata bahwa konten Kreator dibuat dengan AI, tidak ada mekanisme disclosure ke UMKM.

**Verdict:** ❌ Belum. Klausul AI di T&C tidak punya padanan data.

**Rekomendasi backend:**
1. Field opsional `aiGenerated`/`aiDisclosed` pada `campaign_submissions` & `deliverables` (metadata, bukan validasi).
2. Opsional: mekanisme UMKM meminta info AI → cukup flag + riwayat di log.

---

## Bagian F — Temuan Baru Audit (di luar review CTO/CAIO)

| ID | Temuan | Bukti | Dampak |
|----|--------|-------|--------|
| B-1 | Fee 2% (kode) vs 5% (T&C) | `wallet.service.ts:6`, `release-escrow/main.js:18`, ADR-008 vs T&C Pasal 9 | T&C menjanjikan biaya yang tidak dipungut sistem — wajib diputuskan sebelum publikasi |
| B-2 | Tidak ada jalur refund | Hanya `cancel-payment` (payment `pending`); tidak ada refund escrow/balance | Pasal 15 T&C (refund, sisa budget, dispute) = tidak executable |
| B-3 | Tidak ada suspend/penangguhan | 0 kemunculan "suspend" di `src/`+`functions/`; `users.status` kode hanya `active` | Pasal 18 + CAIO-02 mustahil dijalankan |
| B-4 | Claim tidak atomik | `claim.service.ts:129,175-180` read-modify-write di klien | Race condition kuota claim (CTO-12 belum tuntas) |
| B-5 | Top-up masih aktif | `payment.service.ts:5`, `create-escrow/main.js:14` | Eksposur regulasi PJP (CTO-04) |
| B-6 | `user_files`/storage dormant | `Users/30_BR:42-52` | Klausul K-15 (100MB) valid di docs tapi tak berjalan MVP |

---

## Rekomendasi Prioritas

**P0 (block publikasi):**
1. Putuskan fee final: **5% (T&C) vs 2% (backend)**. Jika 5%: ubah `PLATFORM_FEE_RATE`, docs, ADR-008. Jika 2%: revisi T&C Pasal 9. Backend hanya boleh mengikuti satu angka.
2. Implementasi refund (Pasal 15) — jalur refund escrow/balance ke Wallet.
3. Implementasi status suspend + alur banding (Pasal 18, CAIO-02).
4. Views system-captured (CTO-01).
5. Auto-approve Rate Card (CTO-02).
6. Withdrawal 4-state + reversal + KYC + UMKM (CTO-03, CTO-05).

**P1:** CTO-19 (offer expiry), CTO-24 (chargeback), CTO-26 (fee refund), CAIO-01 (attribution), CAIO-03 (AI flag), CTO-22 (limit 3 paket), CTO-20 (work_started_at), CTO-11 (tos_version), CTO-10 (email verify).

Rincian eksekusi: lihat `../roadmap/tasks-backend-alignment-tnc.md`.
