# Review Frontend atas Lapisan Delete/Cancel

| | |
|---|---|
| **Tanggal** | 2026-07-26 10:53 |
| **Pemicu** | Kami `git pull` setelah kalian selesaikan lapisan delete/cancel (32 file, 25/25 Function OK) dan memverifikasi tiap klaim terhadap kode nyata sebelum mulai wiring frontend. |
| **Status** | 🟡 **2 temuan butuh keputusan kalian**, 1 koreksi arsitektur, 1 tagihan lama, 1 permintaan DTO. |
| **Sifat** | Dokumen temuan + laporan apa yang sudah kami kerjakan (§6). **Nol perubahan dari kami di `00_BACKEND/`** selain dokumen ini sendiri. |
| **Terima kasih** | Kerja kalian cepat dan rapi — Function `cancel-payment` kontraknya bersih (405/401/403/409 + cek ownership + cek status), kolom `is_archived` sudah benar-benar ada di `conversations`, dan 6 service delete/cancel konsisten memvalidasi ownership sebelum menulis. Yang kami angkat di bawah adalah sisa yang belum tertutup, bukan bantahan atas itu. |

---

## 0. Ringkasan 1 menit

| # | Temuan | Dampak | Butuh |
|---|---|---|---|
| **T-1** | `unclaimCampaign` bikin kreator **tidak bisa claim ulang selamanya** | Fitur unclaim jadi jebakan buat kreator | **Keputusan kalian** (§1) |
| **T-2** | Status `unclaimed` belum masuk `50_Database.md` | Doc drift — melanggar aturan AGENTS.md kalian sendiri | Update dokumen (§2) |
| **T-3** | Saran "import service dari `00_BACKEND/src/services/`" tidak bisa dijalankan | Tidak menghalangi — kami mirror seperti Sprint 1–3 | Info saja (§3) |
| **T-4** | `create-escrow` masih tidak menulis `campaigns.remainingBudget` | **Sprint 4 tetap terblokir** | **Keputusan kalian** (§4) |
| **T-5** | Tidak ada Function yang memfilter/mengembalikan `is_archived` | Fitur arsip yang kalian bangun tidak terpakai jalur bacanya; kami jodohkan di klien | Permintaan DTO, bukan blocker (§6) |

**Yang kami verifikasi dan hasilnya benar:** kolom `is_archived`, kebutuhan Function khusus `payments`, registrasi `cancelPayment` di `FUNCTION_IDS`, dan keempat service hard-delete. Detail di §5.

**Yang sudah kami kerjakan tanpa menunggu kalian:** 7 fungsi mirror delete/cancel + UI-nya, semua lolos `tsc`/`build`/`lint` tanpa regresi. Detail di §6.

---

## 1. 🔴 T-1 — Unclaim adalah pintu satu arah

`unclaimCampaign` (`src/services/claim.service.ts:185`) hanya mengubah status baris menjadi `unclaimed`; **barisnya tetap ada**. Sementara `claimCampaign` (`src/services/claim.service.ts:126`) menolak claim baru berdasarkan keberadaan baris, **tanpa memfilter status**:

```js
// 5. Validasi unik (sudah claim sebelumnya?)
const existingClaims = await databases.listDocuments(DATABASE_ID, COLLECTIONS.claims, [
  Query.equal('campaignId', campaignId),
  Query.equal('creatorId', creatorId),
  Query.limit(1),
]);

if (existingClaims.documents.length > 0) { /* ditolak */ }
```

**Akibatnya: kreator yang membatalkan claim tidak akan pernah bisa mengambil campaign itu lagi.** Baris `unclaimed` yang tertinggal terus memblokir dirinya sendiri.

Ini hampir pasti bukan yang dimaksud. Kalau kreator salah pencet lalu membatalkan, hukumannya permanen dan tanpa peringatan. Mohon pilih:

- **(a) Hard delete baris claim saat unclaim.** Paling bersih — claim yang dibatalkan memang tidak meninggalkan jejak yang berguna, dan `campaign_claims` bukan audit trail finansial. Butuh `Permission.delete(Role.user(creatorId))` di jalur create claim.
- **(b) Kecualikan `unclaimed` dari cek duplikat** — `Query.notEqual('status', 'unclaimed')`. Riwayat tersimpan, tapi baris menumpuk dan status `unclaimed` jadi tidak punya arti operasional.
- **(c) Memang disengaja** — unclaim = keluar permanen dari campaign itu. Kalau ini pilihannya, tolong konfirmasi supaya kami bisa menuliskannya jelas-jelas di UI ("Batalkan claim? Kamu tidak bisa mengambil campaign ini lagi.").

Pertanyaan turunan yang sekalian perlu dijawab: **apakah `expired` juga memblokir claim ulang?** Cek duplikat yang sama berlaku untuk status itu, jadi kreator yang kehabisan waktu submit juga terkunci permanen. Kalau `expire-stale-claims` dimaksudkan mengembalikan slot, guard ini membatalkan maksud itu.

> Sampai ada jawaban, kami **tetap wire `unclaimCampaign` di frontend** tapi dengan teks konfirmasi yang menyatakan pembatalan bersifat permanen. Begitu kalian pilih (a) atau (b), teksnya kami longgarkan — satu baris perubahan.

---

## 2. 🟠 T-2 — `unclaimed` belum ada di dokumentasi

`docs/02_Modules/Campaigns/50_Database.md:90` masih:

```
| status | enum | yes | `claimed|submitted|approved|rejected|expired` |
```

`ClaimStatus` di kode sudah punya `unclaimed`, dokumennya belum. AGENTS.md kalian menyatakan *"Documentation is the source of truth"* dan *"Never infer schema from source code"* — dengan kondisi sekarang, siapa pun yang mengikuti aturan itu akan menulis kode yang salah.

Kami menyelaraskan `ClaimStatus` di `src/types/domain.ts` sisi frontend ke nilai yang ada di kode kalian.

**Catatan teknis yang meredakan risikonya:** kolom `campaign_claims.status` di `appwrite.config.json` ternyata bertipe **`string` biasa, bukan enum**. Jadi menulis `unclaimed` tidak akan kena `400` — tidak ada bug diam-diam seperti kasus `doAndDont`. Tapi artinya juga **tidak ada guard di level database**: salah ketik status apa pun akan diterima Appwrite tanpa keluhan. Ini berlaku untuk semua kolom status (`campaigns`, `orders`, `offers`, `rate_cards`, `payments`) — mungkin layak jadi item hardening tersendiri, bukan sekarang.

---

## 3. 🟡 T-3 — Koreksi: frontend tidak bisa import dari `00_BACKEND/`

Dokumen `2026-07-26-bloker-frontend-delete.md` menutup dengan:

> *"Yang perlu frontend lakukan: import service dari `00_BACKEND/src/services/` dan panggil langsung."*

Itu tidak bisa dijalankan:

| Penghalang | Bukti |
|---|---|
| Folder dikecualikan dari kompilasi frontend | `tsconfig.json` → `"exclude": ["node_modules", "00_BACKEND"]` |
| Paket npm terpisah | `00_BACKEND/package.json` → `name: "backend-marketiv"`, `"type": "module"`; root → `name: "marketiv-fe"` |
| `paths` tidak memetakannya | root `tsconfig.json` hanya punya `"@/*": ["./src/*"]` |
| Nol preseden | Tidak ada satu pun `import` dari `00_BACKEND` di seluruh `src/` — yang ada hanya komentar rujukan dokumentasi |

**Bagian analisis kalian yang benar dan penting:** mayoritas fitur ini memang **tidak** butuh Appwrite Function, karena permission collection sudah cukup untuk SDK langsung dari browser. Itu koreksi yang tepat dan menghemat 5 Function. Yang meleset hanya *cara* frontend mengaksesnya.

Pola yang sudah berjalan sejak Sprint 1 adalah **mirror**: logika kalian kami tulis ulang di `src/services/umkm/umkm-appwrite.service.ts` dan `src/services/creator/creator-appwrite.service.ts`, memakai Appwrite SDK browser milik frontend sendiri dan membungkus hasilnya jadi `ServiceResult<T>`. Tidak ada yang perlu kalian ubah — cukup supaya ekspektasi kita sama saat verifikasi nanti.

---

## 4. 🔴 T-4 — Tagihan lama: `create-escrow` & `campaigns.remainingBudget`

Sudah kami angkat di handoff Sprint 3 §5-1, belum terjawab, dan **masih memblokir Sprint 4**.

`functions/create-escrow/src/main.js:12` mengkredit `wallets.balance` untuk `purpose: "campaign"` dan tidak pernah menyentuh `campaigns.remainingBudget`. Padahal `publishCampaign` (`src/services/campaign.service.ts:226`) mensyaratkan:

```js
if (document.remainingBudget <= 0) {
  throw new CampaignServiceError('validation', 'Campaign harus di-top-up terlebih dahulu.');
}
```

Guard itu tidak akan pernah lolos → **campaign tidak akan pernah bisa jadi `active`** → seluruh Alur A Sprint 4 (klaim, submit, review, reward) tidak bisa diuji sama sekali.

Pilihan yang sama seperti sebelumnya: (a) `create-escrow` menulis `remainingBudget` saat `purpose === "campaign"`, (b) `publishCampaign` baca saldo dari sumber lain, atau (c) dana campaign memang lewat wallet dan `remainingBudget` diisi di tempat lain.

**Kami menahan Sprint 4 sampai ini terjawab.** Sprint delete/cancel (yang sedang kami kerjakan) tidak bergantung padanya, jadi jalan terus.

---

## 5. Hasil verifikasi klaim kalian

| Klaim | Hasil | Catatan |
|---|---|---|
| Kolom `is_archived` sudah di-push ke `conversations` | ✅ Benar | Ada di `appwrite.config.json`, `boolean`, `required: false` |
| Hanya `payments` yang butuh Function | ✅ Benar | `payments.$permissions` = `["read(\"users\")"]` saja — tidak ada create/update/delete |
| `cancelPayment` teregistrasi di frontend | ✅ Benar | `src/lib/appwrite/functions.ts:30` |
| Kontrak Function `cancel-payment` | ✅ Rapi | 405/401/400/403/409, cek `user_id` + status `pending` sebelum menulis |
| 4 service hard delete tersedia | ✅ Benar | `deleteCampaign`, `deleteOffer`, `deleteRateCard`, `removeCampaignAsset` — semua validasi ownership + status |
| `tsc --noEmit` frontend setelah merge | ✅ Bersih | Perubahan kalian di `src/lib/appwrite/functions.ts` tidak memecahkan apa pun |

### Catatan atas hasil backfill

`backfill-delete-permissions.ts` melaporkan **0 updated** dan itu disimpulkan sebagai *"semua dokumen existing sudah punya delete perm"*. Kesimpulannya terlalu kuat untuk buktinya:

- Database masih hampir kosong — frontend baru lepas dari mock di Sprint 3, jadi belum banyak baris nyata yang dibuat.
- Baris yang **memang** punya `Permission.delete` adalah yang dibuat jalur tulis frontend Sprint 3 (`umkm-appwrite.service.ts:532`, `creator-appwrite.service.ts:672/947/997`) — bukan hasil backfill.
- Baris yang dibuat **Appwrite Function** (umumnya tanpa argumen permission) atau **manual lewat Console** tetap tidak punya hak hapus, dan `0 updated` tidak membuktikan sebaliknya.

Karena tidak ada satu pun dari 28 collection yang memberi `delete("users")` di level collection, baris-baris itu **tidak akan bisa dihapus pemiliknya**. Saran: jalankan `verify-delete-permissions.ts` lagi setelah ada data uji nyata dari alur frontend, bukan sekarang saat tabelnya masih kosong.

Satu hal kecil: `scripts/backfill-delete-permissions.ts:43` memberi `ownerField: null` padahal `interface Target` mendeklarasikan `ownerField: string`. Lolos karena `tsx` tidak melakukan typecheck. Ubah tipenya jadi `string | null` supaya `tsc` tidak menggagalkan CI kalau nanti script ini ikut dicek.

---

## 6. Yang sudah kami kerjakan di sisi frontend

Semua di bawah selesai tanpa menunggu kalian. `tsc --noEmit` bersih, `npm run build` sukses 30 route, `npm run lint` **28 masalah / 8 error — identik dengan baseline Sprint 3**, nol regresi.

### Mirror layer

| Fungsi | Berkas | Jalur |
|---|---|---|
| `deleteCampaignDraftInAppwrite` | `src/services/umkm/umkm-appwrite.service.ts` | SDK — hapus brief & aset dulu, baru induk |
| `removeCampaignAssetInAppwrite` | idem | SDK — hanya bila induk `draft` |
| `deleteOfferInAppwrite` | idem | SDK — hanya `pending` |
| `cancelOrderInAppwrite` | idem | SDK — `pending_payment` → `cancelled` |
| `cancelPaymentInAppwrite` | idem | Function `cancel-payment` |
| `unclaimCampaignInAppwrite` | `src/services/creator/creator-appwrite.service.ts` | SDK — `claimed` → `unclaimed` + decrement `totalClaims` |
| `getMyConversations` / `setConversationArchived` | `src/services/shared/conversation-appwrite.service.ts` (baru) | SDK — dipakai kedua role |

Masing-masing punya pasangan facade mock/real. Mock **menegakkan guard status yang sama**, bukan sekadar mengembalikan sukses — kalau mock selalu berhasil, pesan penolakan tidak akan pernah terlihat sampai mock dimatikan.

### UI

Terpasang: **Hapus Draft** (kartu & tabel campaign), **Batalkan Pesanan** (ringkasan order di room negosiasi), **Batalkan pekerjaan ini** (kartu Pekerjaan Aktif kreator), **Arsipkan / Batal Arsip + tab Inbox/Arsip** (daftar negosiasi UMKM & Kreator). Satu `ConfirmDialog` reusable di `src/components/ui/confirm-dialog.tsx` — mengunci tombol selama permintaan berjalan dan membiarkan modal terbuka saat gagal.

Kami konsisten memakai **"Hapus"** untuk hard delete dan **"Batalkan"** untuk perubahan status, supaya pengguna tidak salah mengira barisnya hilang padahal masih tersimpan untuk audit.

### Yang sengaja BELUM di-wire (bukan karena terblokir kalian)

| Fitur | Alasan |
|---|---|
| Hapus offer dari timeline chat | `ChatMessage.offerData` tidak membawa `offerId` — mapper `getMessagesByOrderId` tidak meneruskan `messages.offer_id`. Tidak terjangkau tanpa memperluas tipe, dan `s4-rc-offer` akan membangun jalur offer sungguhan. Service-nya sudah siap. |
| Batalkan payment | `FinanceOverviewPage` masih penuh state fabrikasi (`handlePaymentSuccess` mutasi lokal, MID-DEMO). Task Sprint 4 `s4-clean-finance` akan membongkarnya; menempel tombol di atasnya sekarang akan langsung ditulis ulang. Service-nya sudah siap. |
| Hapus aset campaign | Butuh daftar aset di halaman detail campaign yang belum ada. Service-nya sudah siap. |

### ⚠️ T-5 — Fitur arsip kalian belum tersambung ke jalur baca mana pun

`is_archived` **tidak muncul sama sekali di `00_BACKEND/functions/`** — kami grep seluruh folder. Filter `getConversations` di `chat.service.ts` tidak menolong frontend, karena daftar negosiasi kami tidak membacanya: UMKM query `orders` langsung, Kreator lewat DTO `get-creator-negotiations`. Keduanya di-key **orderId**, bukan conversationId.

Kami menjembataninya di klien lewat constraint unik `umkm_id + creator_id` — satu query percakapan, lalu dijodohkan per pasangan peserta. Jalan, tapi berarti setiap konsumen daftar negosiasi harus mengingat penjodohan itu sendiri.

Kalau `get-creator-negotiations` bisa ikut mengembalikan `conversationId` + `isArchived` di DTO-nya, penjodohan klien ini bisa kami buang. Bukan blocker — silakan pertimbangkan saat menyentuh Function itu lagi.

**Sprint 4 kami tahan sampai T-4 terjawab.**

---

## Rujukan

- Konsep awal: `00_BACKEND/integration-context/2026-07-26-konsep-fitur-delete.md`
- Analisis blokir kalian: `00_BACKEND/integration-context/2026-07-26-bloker-frontend-delete.md`
- Tagihan Sprint 3 yang belum terjawab: `00_BACKEND/integration-context/2026-07-25-frontend-sprint3-write-layer.md` §5
- Skema sumber kebenaran: `00_BACKEND/appwrite.config.json`
