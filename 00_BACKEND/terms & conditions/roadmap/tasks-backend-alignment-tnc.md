# Tugas Backend — Penyelarasan T&C dengan Implementasi

**Tujuan:** Menutup seluruh kesenjangan hasil audit (`../review/audit-caio-cto-vs-backend.md`) agar klausul Syarat & Ketentuan Marketiv V3-1 dapat dieksekusi sistem backend.
**Prioritas:** P0 = blocker publikasi · P1 = penting sebelum MVP lanjutan
**Konvensi:** Setiap tugas mencantumkan target file, kriteria diterima, dan pasal T&C yang dirujuk.

---

## P0 — Blocker Publikasi

### T-01. Sinkronkan fee platform — keputusan: 2% launch → 5% di 1.000 transaksi
**Pasal:** 9, K-1, ADR-008
**Keputusan (locked):** fee **2%** saat launch, naik **5%** otomatis saat 1.000 transaksi `completed`. T&C tetap **5%** (batas legal; undercharge 2% sah, naik = menepati T&C, bukan melanggar).
**Aksi:**
1. Satu konstanta fee: `PLATFORM_FEE_RATE` dari env Appwrite, dibaca semua function (`wallet.service.ts:6`, `create-payment/main.js:13`, `release-escrow/main.js:18`, `get-creator-negotiations/main.js:61`). Hapus 4 hardcode `0.02`.
2. **Snapshot** `fee_rate` ke escrow saat create-escrow (dan ke `payments.fee_amount` saat create-payment) — fee dihitung dari rate saat transaksi dibuat, BUKAN rate global saat release. Order lama tidak boleh kena rate baru.
3. Cron/pemicu: saat count `transactions.status = completed` ≥ 1.000 → flip konstanta ke `0.05` + notifikasi pengguna (rentang waktu naik).
4. Test `calculatePlatformFee` mengikuti rate snapshot per transaksi, bukan satu angka global.
**Kriteria diterima:** satu sumber konstanta; escrow lama tetap 2% setelah flip; flip 1.000 transaksi bekerja; docs = kode = T&C (5% batas).

---

### T-02. Implementasi jalur refund (Pasal 15, K-16)
**Pasal:** 15.1.c, 15.2.b, 15.3, K-16
**Latar:** T&C menjanjikan refund (order dibatalkan, sisa budget campaign, dispute) ke Wallet UMKM. Tidak ada implementasi.
**Keputusan (locked):** Opsi B — refund ke Wallet UMKM + fitur withdrawal UMKM (reuse alur Kreator, selaras T-06). Fee **tidak dikembalikan** (biaya layanan terpakai). Pemicu: otomatis (order dibatalkan/expired) + manual admin (dispute).
**Aksi:**
1. Function baru `refund-order` / `refund-escrow`: escrow `refunded` → kredit `wallets.balance` UMKM + ledger `refund`.
2. Alur pembatalan order `cancelled` (campaign/order) → refund sisa dana.
3. Fee tidak dikembalikan — `refund_fee = 0` (keputusan CTO-26: fee = biaya layanan terpakai).
4. Ledger: koreksi = entry baru (jangan update entry lama).
**Kriteria diterima:** e2e: order dibatalkan → balance UMKM bertambah; ledger memuat baris `refund`; escrow `refunded`; UMKM bisa menarik saldo refund (via T-06).

---

### T-03. Implementasi status akun + mekanisme banding (Pasal 18, CAIO-02)
**Pasal:** 18.1–18.5, CAIO-02
**Latar:** Tidak ada "suspend" di kode; T&C Pasal 18 + banding tidak bisa dijalankan.
**Keputusan (locked):** batas ajukan banding **14 hari** sejak notifikasi suspend; SLA putusan **7 hari**; review **hybrid** (auto untuk kasus jelas, eskalasi admin untuk ambigu); akun **tetap suspend** selama banding berjalan (putusan menang → cabut suspend). Terminated **juga bisa banding** (14 hari, sesuai CAIO — kesempatan peninjauan sebelum keputusan final). Blokir aksi: claim, submit, withdrawal, order baru, offer baru, payment baru. **Tidak** blokir: release-escrow (dana keluar harus selesai), terima pesan. Mekanisme suspend: function admin `suspend-user`/`unsuspend-user` (jejak + notifikasi otomatis) + fallback Console. Notifikasi otomatis saat suspend = menyalakan timer 14 hari (`deadlineAt = suspendAt + 14`).
**Aksi:**
1. `users.status` → `active | suspended | terminated`. Aturan: status non-`active` memblokir claim, submit, withdrawal, order baru, offer baru, payment baru (guard di function money + claim).
2. Koleksi baru `appeals`: `userId`, `actionRef`, `reason`, `evidence`, `deadlineAt` (= suspendAt + 14 hari), `slaDecidedAt` (= submittedAt + 7 hari), `status` (`submitted|under_review|approved|rejected`), `decision`, `decidedAt`.
3. Function `create-appeal` (user, validasi ≤ 14 hari) + `review-appeal` (admin, hybrid: auto-approve bukti kuat / auto-reject fraud score tinggi / eskalasi ambigu) + notifikasi. Function admin `suspend-user` / `unsuspend-user` (notifikasi otomatis saat suspend).
4. Escrow transaksi berjalan saat suspend: dibekukan, diselesaikan via dispute (Pasal 14) — dokumentasikan di `Orders/30_Business_Rules.md`.
**Kriteria diterima:** admin bisa suspend/terminate; user ter-suspend tidak bisa claim/withdraw; user bisa ajukan banding ≤ 14 hari; SLA 7 hari tercatat & dipicu notifikasi; akun tetap suspend selama proses; putusan menang → pulihkan.

---

### T-04. Views diukur sistem, bukan manual (CTO-01)
**Pasal:** 7.1.e–f, 7.1.g
**Keputusan (locked):** MVP = verifikasi manual oleh UMKM dengan jejak tercatat. API TikTok resmi ditunda (butuh TikTok Developer app + OAuth + review) — trigger sejalan flip 1.000 transaksi. Scraping DITOLAK (anti-bot TikTok, ToS, bukti tidak sah).
**Aksi:**
1. `campaign_submissions` tambah: `views_count` (int), `views_captured_at` (datetime), `views_source` (enum `api|scrape|manual_admin`), `views_final` (bool).
2. `review-submission` menulis keempat field dalam transaksi yang sama dengan perubahan status: saat UMKM approve dengan angka views → `views_source=manual_admin`, `views_captured_at=now`, `views_final=true`.
3. `calculate-campaign-reward` membaca `views_final ? views_count : doc.views` — reward terkunci dari angka final, tidak berubah oleh edit pasca-approve.
4. `audit_logs`/log: catat raw sumber data views.
5. Banner UI: "Reward dihitung per 1.000 views. Di bawah 1.000 = Rp0" (data: konsisten dgn `Math.floor` yang sudah ada).
**Kriteria diterima:** unit test `calculateReward(999,…) = 0`, `(4850,…) = 4×tarif` (cap sisa budget); e2e: UMKM approve koreksi views → reward pakai views_count final; edit views setelah approve tidak mengubah reward.

---

### T-05. Auto-approve review Rate Card (CTO-02)
**Pasal:** 7.2.e–f, 8.4.b
**Keputusan (locked):** durasi review **3 hari kalender** sejak deliverable dikirim; lewat tanpa aksi → auto-approve + escrow rilis. 1 permintaan revisi = 1 revisi (berapa pun butirnya, wajib sekaligus). Reminder H-1 (email + notifikasi dashboard, `reminder_sent_at` anti-dobel). Timer **reset** tiap kirim ulang deliverable. Timer pause saat sengketa (Pasal 14).
**Aksi:**
1. `orders` tambah: `review_deadline_at`, `auto_approved` (bool), `revision_count` (int), `revision_limit` (int).
2. Function cron `auto-approve-orders` (pola `expire-stale-claims`): order `delivered` melewati deadline → auto-approve → panggil orchestrator release escrow yang sama dengan approval manual (jangan duplikasi logika release).
3. Notifikasi reminder H-1 ke UMKM (`reminder_sent_at` agar tidak dobel).
4. Definisi "satu revisi" di dokumentasi `Orders/30_Business_Rules.md`.
**Kriteria diterima:** e2e: deliverable dikirim → waktu dimajukan → order `completed`, wallet kreator bertambah; idempoten terhadap event ulang.

---

### T-06. Withdrawal 4-state + reversal + KYC + UMKM (CTO-03, CTO-05)
**Pasal:** 11.1, 11.4, 11.6, 11.8, 15.1.c
**Keputusan (locked):** disbursement via **Midtrans Iris** (B2B API, terpisah dari Snap — aktivasi terpisah). Rate limit: maks 3 withdrawal/hari + cooling period 3 hari setelah ubah rekening. KYC: `none|pending_wa|verified`, wajib ≥ Rp5.000.000, saluran WhatsApp admin (verifikasi dokumen di WA, sistem catat status + timestamp via tombol admin). SLA: dana diterima 1×24 jam kerja, reversal maks 3 hari kerja (revisi T&C 11.4/11.6).
**Aksi:**
1. `withdrawals.status` → `requested | processing | succeeded | failed | reversed`; tambah `failure_reason`, `reversed_at`.
2. Function `withdrawal-callback` dari Midtrans Iris (webhook status disbursement); fallback aksi admin "tandai gagal & kembalikan saldo" (kredit balik maks 3 hari kerja).
3. Reversal = entry ledger baru `type=withdrawal_reversal`, bukan update.
4. **UMKM (CTO-03):** buka withdrawal untuk saldo UMKM yang berasal dari refund/sisa budget — validasi sumber saldo, bukan role. Tambah `requester_role`/`source_origin` di `withdrawals`.
5. Rate limit: maks 3 withdrawal/hari + cooling period 3 hari setelah ubah rekening (pola fraud: ganti rekening → withdraw → ganti lagi).
6. KYC (Pasal 11.8): `kyc_status` `none|pending_wa|verified`; wajib ≥ Rp5.000.000 → tolak + arahkan WhatsApp admin; admin tandai verified di sistem setelah cek dokumen; admin bisa force-request kapan pun.
**Kriteria diterima:** unit: reversal mengembalikan saldo persis; e2e: withdrawal gagal → saldo pulih; UMKM bisa menarik saldo refund; KYC ≥ Rp5jt diblokir sampai verified.

---

### T-07. Standar waktu & alat bukti sistem (CTO-06)
**Pasal:** 21.4–21.5 (baru)
**Aksi:**
1. Dokumentasikan `docs/01_Global/`: datetime disimpan UTC, dirender WIB (UTC+7); "hari" = hari kalender.
2. Buat util `formatWIB()` tunggal.
3. Dokumentasikan frekuensi cron di backend docs.
**Kriteria diterima:** semua tanggal UI WIB; docs menyebut UTC internal.

---

## P1 — Penting Sebelum MVP Lanjutan

### T-08. Custom Offer expired (CTO-19)
**Pasal:** 7.3
`offers` tambah `expires_at`; cron `expire-custom-offers` → status `expired` (pola `expire-stale-claims`); `create-offer` set `expires_at = now + 7 hari`.

### T-09. Chargeback pasca-release (CTO-24)
**Pasal:** 8.9 (baru)
Function penarikan balik: jika payment di-chargeback setelah escrow release, tarik dari wallet penerima; saldo tak cukup → utang tercatat. Idempoten per `gateway_reference`.

### T-10. Limit 3 paket aktif (CTO-22)
**Pasal:** 7.2, K-13
Validasi di Function publish rate card: maks 3 paket `status = published` per creator (bukan hanya UI disable).

### T-11. `work_started_at` order (CTO-20)
**Pasal:** 7.2.d
`orders.work_started_at` = timestamp webhook paid (bukan waktu create order); estimasi `deliveryDays` dihitung dari sini.

### T-12. Kreditasi Kreator / ownership metadata (CAIO-01)
**Pasal:** 16.3
**Keputusan (locked):** format kreditasi = **username TikTok** kreator; titik peralihan kepemilikan = **release escrow**.
Tambah field kreditasi/attribution (`creatorCredit` = username TikTok) pada `campaign_submissions` & `deliverables`; dokumentasikan di Orders/50_Database bahwa release escrow = titik peralihan kepemilikan konten ke UMKM.

### T-13. Penanda AI konten (CAIO-03)
**Pasal:** 12.5
**Keputusan (locked):** opsional, tanpa sanksi otomatis — murni metadata transparansi.
Field opsional `aiGenerated`/`aiDisclosed` (bool) pada `campaign_submissions` & `deliverables` (metadata saja, bukan validasi; tidak memblokir alur apa pun). Log permintaan disclosure.

### T-14. Versi T&C per pengguna (CTO-11)
**Pasal:** 3.3
**Keputusan (locked):** format versi `v3.1` (string konsisten); simpan saat registrasi/consent; cek saat login + interstitial re-consent saat versi berubah + cek di aksi finansial (claim, order, withdrawal).
`users`/`profiles` tambah `tos_version`, `tos_accepted_at`; simpan saat registrasi/consent; interstitial saat versi berubah.

### T-15. Verifikasi email sebelum withdrawal (CTO-10)
**Pasal:** 5.1.e, 5.3.c
**Keputusan (locked):** gate di withdrawal pertama saja (claim tetap boleh); blokir + arahkan ke verifikasi; pakai Appwrite Auth native.
`email_verified_at`; guard di `request-withdrawal` untuk withdrawal pertama.

### T-16. Claim atomik (CTO-12)
**Pasal:** 7.1.c
Pindahkan logika claim dari `claim.service.ts` (klien) ke Appwrite Function `claim-campaign`: cek kuota + tulis claim + increment `totalClaims` dalam satu transaksi atomik.

### T-17. Ledger append-only eksplisit (CTO-31)
**Pasal:** 8.8
Dokumentasikan: `transactions` tidak pernah update/delete; koreksi = entry baru `reverses_transaction_id`. Hapus `deleteDocument` rollback di `request-withdrawal` (ganti tanda `failed`).

### T-18. Rate limit & anti-abuse (CTO-32, CTO-05)
**Pasal:** 11
Rate limit di Function (bukan UI): maks 3 withdrawal/hari, cooling period setelah ubah rekening; dokumentasikan di `Payments/30_Business_Rules.md`.

### T-19. Top-up: keputusan — hapus top-up reguler, pertahankan campaign (CTO-04)
**Pasal:** 8, 10, 10.4–10.5 (baru)
**Keputusan (locked):** hapus `purpose=topup` reguler (kredit `wallets.balance` bebas — risiko PJP). Pertahankan `purpose=campaign` (kredit `campaign.remainingBudget`, terikat campaign — aman).
**Aksi:**
1. Hapus `topup` dari `PURPOSES` (`create-payment/main.js:3`), `PURPOSE_PREFIX` (`:28`), validasi topup (`:193`), itemName topup (`:120-121`).
2. `create-escrow/main.js`: hapus branch `purpose === "topup"` (`:14`), lookup wallet non-campaign (`:102-103`), `type: "deposit"` (`:105`), increment `wallets.balance` (`:129-135`). Jalur campaign (kredit `remainingBudget`) dipertahankan utuh.
3. `payment.service.ts`: hapus `'topup'` dari `PaymentPurpose` (`:5`), validasi (`:118`, `:130`).
4. `wallet.service.ts`: hapus `'deposit'` dari `TransactionType` (`:11`).
5. Docs: `Payments/100_Testing.md`, `Campaigns/30_Business_Rules.md`, ADR-008 — hapus referensi top-up reguler.
**Kriteria diterima:** purpose `topup` tak bisa dibuat (400); campaign funding + escrow + release jalan tanpa wallet deposit; `wallets.balance` UMKM terisi hanya via refund/sisa budget; docs konsisten.

### T-20. AI disclosure & fraud banding (CAIO-03, CTO-13.4)
**Pasal:** 12.5, 13.4
Pastikan banding auto-reject fraud (jalur WhatsApp admin saat ini) tercatat di backend untuk mendukung banding terkait AI; tambah status banding submission.

---

## Perubahan Skema Ringkasan

| Koleksi | Field baru |
|---------|-----------|
| `campaign_submissions` | `views_count`, `views_captured_at`, `views_source`, `views_final`, `aiGenerated`, `aiDisclosed`, `creatorCredit` |
| `orders` | `review_deadline_at`, `auto_approved`, `revision_count`, `revision_limit`, `work_started_at` |
| `offers` | `expires_at` |
| `withdrawals` | status 4-state, `failure_reason`, `reversed_at`, `requester_role`, `source_origin`, `kyc_status` |
| `users`/`profiles` | `tos_version`, `tos_accepted_at`, `email_verified_at`, `npwp` (opsional) |
| `escrows` | `fee_rate` (snapshot rate saat create-escrow, T-01) |
| `transactions` | `reverses_transaction_id` |
| `conversations` | `archived_at` (auto-archive pasca order selesai) |
| `deliverables` | `creatorCredit`, `aiGenerated` |
| **baru** `appeals` | full entitas banding |
| **baru** `audit_logs` | action + payload (dasar alat bukti, CTO-06) |

## Function Baru

- `auto-approve-orders` (cron) — T-05
- `expire-custom-offers` (cron) — T-08
- `refund-order` / `refund-escrow` — T-02
- `withdrawal-callback` — T-06
- `claim-campaign` (atomik) — T-16
- `create-appeal`, `review-appeal` — T-03
- `fee-rate-flip` (cron, pemicu 1.000 transaksi) — T-01

## Pengujian Wajib (sebelum sign-off)

1. `calculateReward(999, …) = 0`; `(4850, …) = 4×tarif`; cap sisa budget — T-04
2. Auto-approve order idempoten — T-05
3. Reversal withdrawal mengembalikan saldo persis — T-06
4. Refund order → balance UMKM bertambah — T-02
5. Suspend → semua aksi finansial terblokir; banding berjalan — T-03
6. Claim paralel kuota 1 → tepat 1 sukses — T-16
