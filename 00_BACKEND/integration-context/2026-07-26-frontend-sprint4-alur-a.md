# Sprint 4 Alur A (Campaign / PPV) — Handoff Frontend

| | |
|---|---|
| **Tanggal** | 2026-07-26 13:51 |
| **Pemicu** | `create-escrow` kini menulis `campaigns.remainingBudget` (commit `15e4c82`), jadi `publishCampaign` bisa lolos dan Alur A tidak lagi terblokir. |
| **Status** | ✅ **Alur A selesai di sisi frontend** — 8 dari 18 task Sprint 4. Alur B (Rate Card) menyusul di pass terpisah. |
| **Sifat** | Laporan + 3 temuan baru. **Nol perubahan dari kami di `00_BACKEND/`** selain dokumen ini. |
| **Verifikasi** | `tsc --noEmit` bersih · `npm run build` sukses 27 halaman · `npm run lint` **28 masalah / 8 error — sama persis dengan baseline Sprint 3**, nol regresi. |

---

## 0. Ringkasan 1 menit

| # | Temuan | Dampak | Butuh |
|---|---|---|---|
| **B-1** | `campaign_submissions.views` tidak pernah diisi siapa pun | **Reward selalu 0** — kreator tidak akan pernah dibayar | Konfirmasi pendekatan kami (§2) |
| **B-2** | Tidak ada kolom untuk catatan review | Field-nya kami nonaktifkan, bukan buang input diam-diam | Kolom baru (§3) |
| **B-3** | `claimCampaign` membaca `isProfileCompleted` dari `users`, kolomnya tidak ada di sana | **Semua klaim lewat service kalian gagal** | Perbaikan 1 baris (§4) |
| — | Pertanyaan lama: claim `expired` mengunci kreator selamanya | Slot kembali untuk orang lain, tapi pemilik lama terkunci | Belum terjawab sejak T-1 (§5) |

Ditambah **V-1 yang sudah dilaporkan** (hak hapus `campaign_claims`) — jalur create kami sudah memasang `Permission.delete` sendiri, jadi klaim yang lahir dari frontend aman. Klaim dari jalur kalian dan baris lama tetap perlu §1 di dokumen sebelumnya.

---

## 1. Temuan arsitektur yang menentukan bentuk pekerjaan ini

Kami memeriksa `events` tiap Function di `appwrite.config.json`. **Delapan dari sembilan Function bisnis Sprint 4 dipicu event database, bukan HTTP.** Artinya frontend tidak memanggilnya sama sekali — kami menulis dokumen, Function kalian menyala sendiri:

| Aksi pengguna | Frontend menulis | Function yang menyala |
|---|---|---|
| Terbitkan campaign | `campaigns.status` → `active` | `campaign-published` |
| Klaim campaign | create `campaign_claims` | `campaign-claimed` |
| Kirim bukti | create `campaign_submissions` | `ai-fraud-precheck` |
| Setujui submission | `campaign_submissions.status` → `approved` | `calculate-campaign-reward` |

Konsekuensi yang kami tangani:

- **Nol `FUNCTION_IDS` baru** untuk Alur A. Semua lewat SDK.
- **Efeknya asinkron.** UI tidak menganggap hasil Function langsung terlihat. Contoh konkret: setelah kirim bukti, lencana fraud **tidak** ditampilkan sampai `ai-fraud-precheck` menulis balik. Sebelumnya frontend men-set `fraudStatus: "safe"` begitu kirim — kreator melihat "aman" sebelum ada pemeriksaan apa pun. Itu sudah kami buang.
- **`campaign-claimed` tidak menambah `totalClaims`.** Ia hanya mengoreksi bila counter melewati `claimLimit` lalu membuat notifikasi. Penambahan counter kami lakukan sendiri di pemanggil, sama seperti `claim.service.ts:154`. Kami tulis ini eksplisit karena mudah disalahpahami sebagai tugas Function.

---

## 2. 🔴 B-1 — `submission.views` tidak pernah diisi, jadi reward selalu 0

`calculate-campaign-reward:38` menghitung reward dari `doc.views`:

```js
const views = Number(doc.views) || 0;
const reward = Math.min(Math.floor((views / 1000) * rewardPer1000Views), ...);
if (reward <= 0) { /* berhenti, tidak membayar */ }
```

Kami grep seluruh `functions/`: **tidak ada satu pun yang menulis kolom `views`**. Tidak ada scraper, tidak ada webhook TikTok, tidak ada jalur audit. Jadi selama tidak ada yang mengisinya, `views` tetap 0 → reward 0 → `pendingBalance` kreator tidak pernah bertambah, berapa pun bagusnya kontennya.

**Yang kami lakukan:** UMKM mengisi jumlah views saat menyetujui submission. Itu satu-satunya jalur yang bisa berjalan tanpa Function baru, dan menempatkan manusia sebagai verifikator angka yang menentukan pembayaran.

- `ReviewSubmissionModal` kini punya field **"Jumlah Views Terverifikasi"**, muncul hanya saat status yang dipilih `approved`, wajib diisi > 0.
- `views` ditulis **dalam satu `updateDocument` yang sama** dengan `status`. Ini penting: `calculate-campaign-reward` menyala pada update dan langsung membaca `doc.views` — kalau views ditulis di panggilan terpisah, Function sudah terlanjur menghitung dari angka lama.

**Mohon konfirmasi apakah ini model yang kalian maksud.** Kalau sebenarnya direncanakan ada audit views otomatis, beri tahu kami dan field ini kami ubah jadi read-only.

---

## 3. 🟠 B-2 — Tidak ada kolom untuk catatan review

`ReviewSubmissionModal` sejak awal mengumpulkan "Catatan Validator", tapi `campaign_submissions` tidak punya kolom untuk menyimpannya. Layar kreator juga menampilkan `rejectedReason` yang tidak punya sumber sama sekali.

Mengikuti kebijakan yang sudah kita sepakati sejak Sprint 3 — *field yang membuang input pengguna diam-diam lebih buruk daripada tidak ada field* — textarea-nya kami **nonaktifkan** dengan label "Segera tersedia", bukan dibiarkan menerima ketikan yang lalu hilang.

| Prioritas | Target | Kolom | Alasan |
|---|---|---|---|
| 🟠 | `campaign_submissions` | `reviewNotes` string 1000 | Alasan penolakan yang bisa dibaca kreator; sekaligus mengisi `rejectedReason` yang kini kosong |

---

## 4. 🔴 B-3 — `claimCampaign` membaca kolom yang tidak ada

`claim.service.ts:91-93`:

```js
const userDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.users, creatorId);
if (!userDoc.isProfileCompleted) {
  throw new ClaimServiceError('validation', 'Lengkapi profil dulu sebelum claim.');
}
```

Koleksi `users` di `appwrite.config.json` hanya punya: `userId, role, status, email, phone, createdAt`. **Tidak ada `isProfileCompleted`.** Kolom itu ada di `creator_profiles` (dan `umkm_profiles`).

Jadi `userDoc.isProfileCompleted` selalu `undefined` → falsy → **setiap klaim lewat service kalian ditolak dengan "Lengkapi profil dulu"**, tak peduli seberapa lengkap profilnya. Kalau `creatorId` juga bukan `$id` dokumen `users`, `getDocument` malah 404 lebih dulu.

Perbaikannya kecil — baca `creator_profiles` dengan `Query.equal("userId", creatorId)`, sama seperti yang dilakukan `get-creator-profile:72`.

> **Mirror kami sengaja menyimpang di sini.** `claimCampaignInAppwrite` membaca `creator_profiles`, bukan `users` — kalau kami cermin persis, fitur klaim tidak akan pernah jalan. Ini satu-satunya tempat kami tidak setia pada kode kalian di Alur A, dan alasannya faktual (kolomnya memang tidak ada), bukan beda pendapat.

---

## 5. Pertanyaan lama yang belum terjawab: claim `expired` mengunci selamanya

Sudah kami angkat di T-1 §1 sebagai pertanyaan turunan, dan resolusi T-1 (hard delete untuk *unclaim*) tidak menyentuhnya.

`expire-stale-claims` bekerja benar: status → `expired`, `totalClaims` dikurangi, slot kembali terbuka. Tapi cek duplikat di `claimCampaign:126` menolak berdasarkan **keberadaan baris tanpa memfilter status**. Hasilnya timpang:

> Slot dikembalikan untuk kreator lain, tapi kreator yang kehabisan waktu tidak bisa mencoba lagi — selamanya, untuk campaign itu.

Kalau `expire-stale-claims` dimaksudkan mengembalikan kesempatan, guard ini membatalkan maksudnya untuk orang yang paling terdampak. Perbaikannya sama seperti opsi (b) di T-1: `Query.notEqual('status', 'expired')` pada cek duplikat.

**Kami tidak melonggarkannya sepihak** — aturan bisnis harus sama di kedua sisi, dan ini keputusan kalian. Mirror kami mempertahankan perilaku yang sama, hanya pesannya dibuat jujur: *"Batas waktu pengerjaan campaign ini sudah lewat dan tidak bisa diambil lagi."* Satu baris berubah begitu kalian putuskan.

---

## 6. Yang kami bangun

### Lapisan tulis

| Fungsi | Berkas | Catatan |
|---|---|---|
| `publishCampaignInAppwrite` | `src/services/umkm/umkm-appwrite.service.ts` | Cermin `campaign.service.ts:210-240` |
| `reviewSubmissionInAppwrite` | idem | `views` + `status` dalam satu update (§2); status claim ikut disesuaikan |
| `claimCampaignInAppwrite` | `src/services/creator/creator-appwrite.service.ts` | Cermin `claim.service.ts:83-160` + `Permission.delete` + perbaikan §4 |
| `submitProofInAppwrite` | idem | `views: 0`, `fraudStatus` dibiarkan kosong sampai Function menulisnya |

Semua punya pasangan facade mock/real yang **menegakkan guard status yang sama** — kuota penuh, sudah pernah klaim, sudah pernah direview — supaya pesan penolakan terlihat sebelum mock dimatikan.

### UI

- **Terbitkan campaign** — setelah Snap sukses, `remainingBudget` di-poll 5× tiap 2 detik lalu campaign diterbitkan. Webhook Midtrans bisa telat, jadi kalau poll habis campaign **tetap draft** dan pengguna diberi tahu apa adanya; menu "Terbitkan Campaign" di daftar campaign jadi jalan keluarnya. Kami sengaja tidak menganggap "pembayaran selesai" = "campaign tayang".
- **Klaim** — kuota lokal baru naik setelah server menerima. Sebelumnya naik optimistis, sehingga kuota terlihat berkurang walau klaimnya ditolak.
- **Kirim bukti** — tanpa lencana fraud palsu (§1).
- **Review submission** — perhitungan reward lokal dibuang, termasuk fallback `|| 15000` views yang membuat angka rupiah muncul dari ketiadaan. Angka campaign dibaca ulang dari server setelah jeda singkat, bukan ditebak.
- **Reward** — nol kode. `pendingPayouts` di layar keuangan kreator sudah memetakan `wallets.pendingBalance` lewat `get-creator-dashboard-summary:111`, jadi reward muncul sendiri begitu `calculate-campaign-reward` mengkredit.

### Audit

- `s4-no-chat-campaign` ✅ — nol komponen chat di Job Pool, detail job, pekerjaan aktif, dan seluruh layar campaign UMKM. Satu-satunya kecocokan pencarian adalah teks yang justru menjelaskan chat sengaja ditiadakan.
- `s4-ppv-expire` ✅ — `expire-stale-claims` benar; state `expired` sudah tampil di UI sejak Sprint 2. Catatannya di §5.

---

## 7. Urutan uji yang kami sarankan setelah deploy

1. Buat campaign → bayar lewat Snap → campaign harus jadi `active` dalam ~10 detik. Kalau tetap draft, webhook telat — menu "Terbitkan Campaign" harus berhasil.
2. Login kreator → klaim campaign itu → `totalClaims` naik di Console.
3. Batalkan klaim → baris `campaign_claims` harus **hilang** (ini menguji V-1 sekaligus).
4. Klaim lagi campaign yang sama → harus berhasil. Kalau ditolak, hard delete tidak jalan.
5. Kirim bukti URL TikTok → `fraudScore`/`fraudStatus` terisi beberapa detik kemudian.
6. Login UMKM → setujui submission + isi views → `pendingBalance` kreator bertambah, `remainingBudget` campaign berkurang.

**Langkah 6 adalah yang membuktikan B-1.** Kalau views tidak ikut terkirim, reward 0 dan tidak ada yang bergerak.

---

## 8. Yang belum kami sentuh

Sepuluh task Alur B (`s4-rc-*` dan pembersihan layar negosiasi/keuangan) menyusul di pass berikutnya. Menundanya juga menjauhkan pekerjaan dari **V-2** — top-up campaign masih mengkredit `wallets.balance` **dan** `campaigns.remainingBudget` dari satu pembayaran, dan `request-withdrawal` tidak punya guard peran. Itu belum terjawab.

---

## Rujukan

- Temuan sebelumnya: `00_BACKEND/integration-context/2026-07-26-verifikasi-resolusi-T1-T4.md`
- Review & resolusi delete layer: `00_BACKEND/integration-context/2026-07-26-review-frontend-atas-delete-layer.md`
- Skema sumber kebenaran: `00_BACKEND/appwrite.config.json`
