# Verifikasi Resolusi T-1 & T-4 — Dua Masalah Tersisa

| | |
|---|---|
| **Tanggal** | 2026-07-26 13:24 |
| **Pemicu** | Kami `git pull` commit `15e4c82` dan memverifikasi tiap resolusi terhadap kode nyata sebelum memulai Sprint 4. |
| **Status** | 🔴 **T-1 belum bisa berjalan** · 🔴 **T-4 memunculkan duplikasi uang** |
| **Sifat** | Dokumen temuan. Nol perubahan dari kami di `00_BACKEND/` selain dokumen ini. |
| **Konteks** | Arah keputusan kalian di T-1 dan T-4 **sudah tepat** — hard delete memang solusi terbersih untuk unclaim, dan menulis `remainingBudget` memang yang dibutuhkan. Yang kami temukan adalah dua celah implementasi, bukan salah pilih. |

---

## 0. Ringkasan 1 menit

| # | Masalah | Akibat |
|---|---|---|
| **V-1** | `unclaimCampaign` hard delete, tapi **tidak ada `Permission.delete` di mana pun** untuk `campaign_claims` | Setiap pembatalan claim balas **401/403**. Fitur ini tidak akan pernah berhasil satu kali pun. |
| **V-2** | `completeTopup` mengkredit `wallets.balance` **dan** `campaigns.remainingBudget` dari satu pembayaran yang sama | Uang tercatat dua kali. UMKM bisa menarik dana yang seharusnya terkunci di escrow campaign. |

Keduanya kami temukan lewat pembacaan kode, bukan runtime — frontend masih mock. Tapi V-1 bersifat pasti (permission tidak ada = pasti ditolak), dan V-2 bisa diverifikasi dengan satu top-up campaign di staging.

---

## 1. 🔴 V-1 — Hard delete tanpa hak hapus

`unclaimCampaign` kini memanggil `deleteDocument` (`src/services/claim.service.ts:191`). Tapi tidak ada satu pun sumber hak hapus untuk koleksi itu:

| Sumber hak hapus | Kondisi |
|---|---|
| Level collection `campaign_claims` | `["read(\"any\")", "create(\"users\")", "update(\"users\")"]` — **tidak ada `delete`** |
| Jalur create `claimCampaign` (`claim.service.ts:147-150`) | Hanya `Permission.read(Role.user(creatorId))` + `Permission.update(Role.user(creatorId))` — **tidak ada `Permission.delete`** |
| `scripts/backfill-delete-permissions.ts` | `TARGETS` = `campaigns`, `rate_cards`, `offers`, `campaign_assets` — **`campaign_claims` tidak termasuk** |

Karena `rowSecurity: true` dan permission Appwrite bersifat union, tanpa salah satu di atas **tidak ada aktor non-admin yang bisa menghapus baris claim**. `deleteDocument` akan selalu ditolak.

Catatan §7 kalian menulis:

> *"Jika mirror berjalan via SDK browser, tambahkan `Permission.delete(Role.user(creatorId))` saat create claim."*

Kami setuju — dan akan memasangnya di jalur create milik frontend saat membangun `s4-ppv-claim`. Tapi itu hanya menutup **claim yang dibuat frontend nanti**. Yang belum tertutup:

1. **`claimCampaign` di service kalian** (`claim.service.ts:147`) masih membuat baris tanpa `Permission.delete`. Selama jalur itu masih dipakai, claim yang lahir darinya tidak bisa dibatalkan.
2. **Baris claim yang sudah ada** tidak akan pernah dapat hak hapus, karena `campaign_claims` tidak masuk daftar backfill.

Yang kami sarankan — pilih salah satu, keduanya cukup:

- **(a)** Tambahkan `Permission.delete(Role.user(creatorId))` di `claim.service.ts:147` **dan** masukkan `campaign_claims` (ownerField `creatorId`) ke `TARGETS` backfill. Konsisten dengan pola per-baris yang sudah kalian pakai di koleksi lain.
- **(b)** Tambahkan `delete("users")` di level collection `campaign_claims`, dengan catatan union permission berarti setiap pengguna login bisa menghapus baris claim siapa pun — jadi butuh filter kepemilikan yang ketat di setiap jalur hapus. Kami sudah memfilter ownership sebelum menghapus, tapi ini melebarkan permukaan serangan.

Kami condong ke **(a)**.

> **Yang kami lakukan sementara:** mirror frontend sudah kami ubah ke hard delete mengikuti keputusan kalian, dengan penanganan khusus `401/403` → pesan jujur *"Pekerjaan ini tidak bisa dibatalkan dari aplikasi karena diklaim sebelum fitur pembatalan aktif; hubungi support."* Jadi gagalnya tidak diam-diam. Begitu V-1 ditutup, pesan itu tidak akan pernah muncul lagi.

---

## 2. 🔴 V-2 — Top-up campaign menambah uang di dua tempat

`completeTopup` (`functions/create-escrow/src/main.js:76-107`) sekarang menjalankan **dua kredit dari satu pembayaran**:

```js
// selalu jalan, untuk purpose apa pun
await databases.updateDocument(env.databaseId, env.walletsCollectionId, wallet.$id, {
  balance: Number(wallet.balance || 0) + Number(payment.amount)
});

// tambahan baru untuk campaign
if (payment.purpose === "campaign" && payment.campaign_id) {
  ...
  { remainingBudget: Number(campaign.remainingBudget || 0) + Number(payment.amount) }
}
```

Tidak ada pendebitan `wallets.balance` yang mengimbanginya — kami grep seluruh `functions/`: satu-satunya tempat `balance` berkurang adalah `request-withdrawal:88`.

**Akibatnya, UMKM yang top-up campaign Rp1.000.000 mendapat Rp1.000.000 di `wallets.balance` DAN Rp1.000.000 di `campaigns.remainingBudget`.** Uang yang masuk sekali tercatat dua kali.

Yang membuatnya lebih dari sekadar salah catat:

- **`request-withdrawal` tidak punya guard peran.** Kami grep `role`/`creator`/`umkm` di `functions/request-withdrawal/src/main.js` — nihil. Fungsinya hanya mencari `wallets` berdasarkan `userId`. Jadi UMKM bisa menarik Rp1.000.000 itu sementara campaign-nya tetap punya `remainingBudget` penuh, lalu `calculate-campaign-reward` membayar kreator dari saldo yang uangnya sudah keluar.
- **Baris ledger jadi menyesatkan.** `ensureTransaction` menulis `type: "deposit"` untuk top-up campaign, seolah dana itu masuk saldo yang bisa dibelanjakan.

Kemungkinan yang kami lihat — silakan pilih sesuai model yang kalian maksud:

- **(a) Kredit campaign saja.** Bungkus kredit wallet dalam `else`, sehingga `purpose: "campaign"` hanya menambah `remainingBudget`. Paling sesuai dengan istilah "escrow campaign": dananya memang tidak pernah jadi saldo bebas UMKM. Perlu cek apakah ada pembaca yang mengandalkan baris wallet itu.
- **(b) Kredit wallet lalu segera debit.** Wallet naik lalu turun sebesar `amount`, dengan `transactions` mencatat `deposit` + `payment`. Jejak audit lebih kaya, tapi dua tulis tambahan dan riskan tanggung bila gagal di tengah.
- **(c) Memang disengaja** — misalnya `remainingBudget` dimaksudkan sebagai kuota, bukan uang. Kalau begitu, mohon konfirmasi, dan sebaiknya `request-withdrawal` diberi guard peran supaya UMKM tidak bisa menyentuhnya.

Kami condong ke **(a)**, plus `type: "payment"` (bukan `deposit`) untuk baris ledger campaign.

> **Ini tidak memblokir Sprint 4.** `publishCampaign` sekarang lolos, jadi campaign bisa jadi `active` dan Alur A bisa kami uji. Kami angkat sekarang karena menyentuh uang, dan lebih murah diperbaiki sebelum ada data top-up nyata di staging.

---

## 3. Yang kami verifikasi dan hasilnya benar

| Resolusi kalian | Hasil cek |
|---|---|
| T-1 keputusan hard delete | ✅ Arah yang tepat — baris hilang, cek duplikat `claimCampaign` lolos, kreator bisa klaim ulang |
| T-1 guard 400 saat claim tak ditemukan | ✅ Ada, `claim.service.ts:176-180` |
| T-1 `ClaimStatus` dibersihkan | ✅ `unclaimed` hilang dari tipe backend; kami ikut hapus di `src/types/domain.ts` |
| T-2 doc drift | ✅ Resolved otomatis — `50_Database.md:90` memang sudah sinkron lagi |
| T-4 `publishCampaign` bisa lolos | ✅ `remainingBudget` kini terisi saat top-up campaign |
| T-4 env `campaignsCollectionId` | ✅ Terdaftar di `getEnv` + `.env.example` |
| Backfill `ownerField: string \| null` | ✅ Diperbaiki |
| `tsc --noEmit` frontend setelah merge | ✅ Bersih · `npm run build` sukses 27 halaman statis |

---

## 4. Penyesuaian di sisi kami

Mengikuti keputusan T-1, sudah kami ubah:

| Berkas | Perubahan |
|---|---|
| `src/types/domain.ts` | `ClaimStatus` kembali 5 nilai — `unclaimed` dihapus |
| `src/lib/creator-status.ts` | Label `unclaimed` dihapus |
| `src/services/creator/creator-appwrite.service.ts` | `unclaimCampaignInAppwrite` → `deleteDocument` + penanganan 401/403 (V-1) |
| `src/services/creator/creator-dashboard.service.ts` | Catatan "pembatalan permanen" dicabut |
| `src/components/.../PekerjaanAktifView.tsx` | Teks konfirmasi dilonggarkan: kreator **boleh** mengambil campaign itu lagi; checkbox persetujuan dilepas karena aksinya tidak lagi tak-terpulihkan |

**T-5 (`conversationId` + `isArchived` di DTO) kami terima ditampung.** Penjodohan di klien lewat pasangan `umkm_id + creator_id` sudah berjalan; tidak ada yang menunggu.

---

## 5. Yang kami kerjakan berikutnya

**Sprint 4 — Alur Lintas-Role.** Kami mulai karena `publishCampaign` sudah tidak terblokir.

Jalur create claim frontend (`s4-ppv-claim`) akan memasang `Permission.delete(Role.user(creatorId))` sejak awal, jadi claim yang lahir dari frontend langsung bisa dibatalkan tanpa menunggu V-1. Sisanya — claim dari jalur kalian dan baris lama — tetap butuh keputusan di §1.

---

## Rujukan

- Review sebelumnya + resolusi kalian: `00_BACKEND/integration-context/2026-07-26-review-frontend-atas-delete-layer.md` §7
- Commit yang diverifikasi: `15e4c82`
- Skema sumber kebenaran: `00_BACKEND/appwrite.config.json`
