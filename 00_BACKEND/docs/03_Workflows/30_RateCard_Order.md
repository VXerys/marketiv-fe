# Workflow: Rate Card Order (Escrow)

## Purpose

Alur pesanan rate card dengan escrow: UMKM menemukan creator, lalu memesan langsung (Direct Order via paket rate card) atau bernegosiasi via chat (Custom Offer) → order → payment → escrow hold → deliverable → approve → release escrow ke wallet creator.

## Modules Involved

- [RateCards](../02_Modules/RateCards/00_Index.md) — discovery creator & rate card.
- [Chat](../02_Modules/Chat/00_Index.md) — percakapan UMKM ↔ creator (untuk jalur Custom Offer).
- [Offers](../02_Modules/Offers/00_Index.md) — custom offer & accept/reject (untuk jalur Custom Offer).
- [Orders](../02_Modules/Orders/00_Index.md) — aggregate order, deliverable, revisi.
- [Users](../02_Modules/Users/00_Index.md) — file manager & storage kuota (upload deliverable).
- [Payments](../02_Modules/Payments/00_Index.md) — Midtrans payment gateway, escrow, wallet, transaksi.
- [Notifications](../02_Modules/Notifications/00_Index.md) — notifikasi di setiap tahap.

## Trigger

UMKM buka `Creator Discovery` → profil creator → lihat rate card → pilih jalur pemesanan.

## Data Model — Collection yang Terlibat

> **Permission `deliverables` & `revisions`** — keduanya `create("users")` + `rowSecurity`, **tanpa** `read`/`update("users")` level koleksi. Permission Appwrite bersifat union, jadi `update("users")` di sana akan membuat setiap user login bisa menyetujui deliverable siapa pun — dan approve itulah yang mencairkan escrow. Akses hanya lewat permission baris: `deliverables` → read kedua pihak, **update UMKM saja**; `revisions` → read + update kedua pihak.

| Collection | Modul | Aksi |
|---|---|---|
| `rate_cards`, `rate_card_packages` | RateCards | read |
| `conversations`, `messages` | Chat | insert (Jalur B) |
| `offers` | Offers | insert → update status (Jalur B) |
| `orders` | Orders | insert → update status |
| `deliverables` | Orders | insert (creator upload) |
| `ratecard_deliverable_validations` | Admin | keputusan final valid/invalid untuk versi deliverable |
| `revisions` | Orders | insert (UMKM minta revisi) |
| `user_files` | Users | insert saat upload deliverable via storage |
| `user_storage_usage` | Users | update kuota |
| `wallets` | Payments | update `balance` (kolomnya hanya `userId`, `balance`, `pendingBalance`) |
| `escrows` | Payments | insert → update status |
| `transactions` | Payments | insert |
| `notifications` | Notifications | insert notifikasi |

---

## Jalur A: Direct Order (Tanpa Negosiasi)

### Step-by-step Flow

1. **RateCards** — UMKM browse/search/filter creator di halaman Creator Discovery. Filter MVP: kota, range harga. Sort: harga terendah/tertinggi, rating tertinggi, pesanan terbanyak.
2. **RateCards** — Buka profil creator → lihat rate card + paket yang `published`.
3. **RateCards** — Pilih paket → klik "Pesan".
4. **Orders** — Sistem buat `orders`: `{ umkmId, creatorId, packageId, amount: package.price, status: 'pending_payment' }`.
5. **Notifications** — Notifikasi ke UMKM: "Order menunggu pembayaran".
6. **Payments** — UMKM bayar via Midtrans:
   - Input: amount = `hargaPaket` (sesuai rate card, tanpa tambahan fee).
   - Appwrite Function `create-payment` membuat transaksi Midtrans dan mengembalikan `snapToken`/`redirectUrl`.
   - UMKM menyelesaikan pembayaran di Midtrans sebesar harga paket.
   - URL kembali Midtrans hanya membuka ruang negosiasi dengan marker verifikasi; browser tidak boleh menandai pembayaran sukses sendiri.
   - Webhook `midtrans-webhook` tervalidasi → `payments.status: pending → paid`.
   - UI menyatakan pembayaran berhasil hanya setelah DTO ruang dari server sudah mencapai `in_progress` (escrow telah diproses).
6b. **Frontend** — UMKM melihat **modal sukses**:
   - Title: "Pembayaran Berhasil!"
   - Body: "Pesanan #{orderId} sedang diproses. Tunggu Creator mengirimkan deliverable."
   - Tombol: "Lihat Pesanan" → redirect ke halaman **Order Detail** (`/orders/{orderId}`).
   - Atau auto-redirect setelah 3 detik ke Order Detail.
6c. **Frontend** — Halaman **Order Detail** menampilkan:
   - Status badge: `in_progress`.
   - Informasi Creator, paket, amount.
   - CTA: "Menunggu deliverable dari Creator..." (belum ada tombol upload/review).
7. **Event `payments.status (pending→paid)`** memicu function **`create-escrow`**.
8. **Payments** — Buat `escrows`: `{ orderId, amount, status: 'held' }`. Baris inilah satu-satunya catatan dana tertahan — tabel `wallets` hanya punya `userId`, `balance`, `pendingBalance`, **tidak ada `escrowBalance`**.
9. **Payments** — Catat `transactions`: `{ userId: umkmId, type: 'payment', referenceType: 'order', referenceId: orderId }`.
10. **Orders** — Update order: `status: pending_payment → in_progress`.
11. **Notifications** — Notifikasi ke creator: "Order baru: {package.title} — segera upload deliverable".

---

## Jalur B: Custom Offer (Dengan Negosiasi)

### Step-by-step Flow

1. **RateCards** — UMKM browse/search/filter creator, buka profil, lihat rate card aktif.
2. **Chat** — UMKM klik "Chat" → `createConversation(umkmId, creatorId)` → kirim pesan via realtime.
3. **Chat** — Negosiasi via chat (teks, gambar, file). Semua pesan tersimpan di `messages`.
4. **Offers** — UMKM `createOffer()` di dalam percakapan:
   ```
   { conversationId, creatorId, umkmId,
     title, description, price, deadline, revisionLimit }
   ```
5. **Offers** — Offer status: `pending`.
6. **Notifications** — Notifikasi ke creator: "Offer baru dari {umkmName}".
7. **Offers** — Creator review offer → accept / reject.
8. **Jika creator accept:**
   - **Event `offers.status (pending→accepted)`** memicu function **`create-order`**.
9. **Orders** — Buat `orders`: `{ umkmId, creatorId, offerId, packageId?, packageNameSnapshot?, packagePriceSnapshot?, amount: offer.price, status: 'pending_payment' }`. Snapshot hanya provenance; `amount` selalu harga final offer, bukan harga paket mutable.
10. **Notifications** — Notifikasi ke UMKM: "Offer diterima — lakukan pembayaran".
11. **Jika creator reject:**
    - Offer status `rejected`.
    - Notifikasi ke UMKM: "Offer ditolak".
    - Alur selesai di sini.

12. **Payments** — UMKM bayar (sama dengan Jalur A langkah 6–11).
13. Lanjut ke tahap Deliverable & Review (sama untuk kedua jalur).

---

## Tahap Bersama: Deliverable & Review

14. **Orders** — Creator `uploadDeliverable()`:
    - **Internal (storage)**: upload via Function `validate-and-upload` dengan `shareWithOrderId` — Function menurunkan pihak lawan dari baris `orders` dan memberinya `Permission.read`. **Tanpa parameter itu UMKM tidak akan bisa membuka berkasnya.** Relasi ke order dicatat di `deliverables.fileId`. Terikat kuota creator.
    - **External URL**: link Google Drive/Dropbox/CDN (`https` saja). Bebas kuota.
    - Deliverable tersimpan: `{ orderId, source, fileUrl, version: n+1, status: 'submitted' }`.
15. **Event `deliverables.rows.*.create`** memicu function **`notify-order-activity`**.
16. **Notifications** — Notifikasi ke UMKM: "Deliverable sudah diupload — review sekarang".
17. **Admin Marketiv** — review manual bukti kolaborasi. MVP ini tidak memakai verifikasi otomatis Instagram/TikTok atau klaim API platform.
    - Function `review-ratecard-deliverable` menyimpan satu keputusan final immutable, beserta snapshot deliverable/version/source/evidence URL.
    - `invalid` wajib punya catatan; kreator mengunggah versi baru setelah perbaikan.
18. **Orders** — UMKM review deliverable yang sudah berstatus validation `valid`:
    - **Approve**: `deliverables.status: submitted → approved`. Persetujuan browser sendiri tidak cukup untuk pencairan.
    - **Request Revision**: `deliverables.status: submitted → revision_requested`, buat `revisions` record.
18. **Jika Request Revision:**
    - Order status: `in_progress → revision`.
    - Notifikasi ke creator: "UMKM minta revisi — {message}".
    - Creator reupload deliverable (version++) → review lagi.
    - Jumlah revisi dibatasi `revisionLimit` (dari package/offer).
20. **Jika Approve:**
    - Event deliverable atau validation memicu `release-escrow`. Function memuat ulang order, versi deliverable terbaru, dan validation snapshot; dana hanya dirilis bila ketiganya konsisten dan keputusan Admin `valid`.
20. **Payments** — Release escrow (dipotong fee 2%):
    - Guard: order harus `in_progress` atau `revision`, dan escrow harus `held`. Di luar itu Function berhenti tanpa efek.
    - `escrows.status: held → released` **lebih dulu**, baru wallet dikredit. Urutan ini disengaja: kalau eksekusi terputus di antaranya, escrow sudah tidak `held` sehingga pemicu ulang tidak membayar dua kali.
    - Hitung fee: `feeAmount = floor(amount × 2%)`.
    - Hitung bersih: `creatorAmount = amount - feeAmount`.
    - `wallets.balance += creatorAmount` (dana masuk available balance creator setelah fee).
    - Buat `transactions` (di-dedup per `referenceId` + `referenceType` + `type`):
      - `{ userId: creatorId, amount: creatorAmount, type: 'release', referenceType: 'escrow', referenceId: escrowId }`.
      - `{ userId: creatorId, amount: feeAmount, type: 'fee', referenceType: 'escrow', referenceId: escrowId }` — hanya bila `feeAmount > 0`.
    - `referenceType: 'escrow'` bukan `'order'`: `get-creator-dashboard-summary` membedakan pendapatan Rate Card (`release` + `escrow`) dari reward Campaign (`release` + `campaign_submission`) lewat field itu.
21. **Orders** — Update order: `status: in_progress/revision → completed`.
22. **Notifications** — Notifikasi ke kedua pihak: "Order selesai — dana sudah dirilis ke wallet creator".
23. **Notifications** — Notifikasi ke creator: "Fee platform 2% ({feeAmount}) telah dipotong dari order ini".

## State Transitions

```text
DIRECT ORDER:
  RateCard Package Selected → Order (pending_payment) → Payment → Escrow Held → Order (in_progress)
                                                                                        ↓
                                                                              Deliverable Uploaded → Review
                                                                                                      ↓
                                                                                          Approve → Escrow Released → Completed
                                                                                          Revision → Order (revision) → Reupload → Review loop

CUSTOM OFFER:
  Chat → Offer (pending) → Creator Accept → Order (pending_payment) → [sama seperti di atas]
                        → Creator Reject → Selesai

ORDER STATUS: pending_payment → in_progress → revision → completed | cancelled
ESCROW STATUS: held → released | refunded
DELIVERABLE STATUS: submitted → approved | revision_requested
```

## Events / Functions

| Trigger | Function | Aksi | Status |
|---|---|---|---|
| `offers.rows.*.update` (status `accepted`) | `create-order` | Buat order dari offer (Jalur B) | ✅ live |
| `payments.rows.*.update` (status `paid`) | `create-escrow` | Buat escrow, hold dana | ✅ live |
| `deliverables.rows.*.create` | `notify-order-activity` | Notifikasi UMKM: hasil kerja masuk | ✅ live |
| `revisions.rows.*.create` | `notify-order-activity` | Notifikasi Kreator: UMKM minta revisi | ✅ live |
| `deliverables.rows.*.update`, `ratecard_deliverable_validations.rows.*.create` | `release-escrow` | Re-evaluate release setelah UMKM approve + Admin valid | perlu deploy |

Event Appwrite **tidak mengirim `$previous`**, jadi Function tidak bisa memagari transisi (`pending→accepted`); yang diperiksa hanya status akhir. Perlindungan terhadap eksekusi ganda datang dari tempat lain: unique index `orders.idx_offerId` untuk `create-order`, dan guard `escrow.status = held` untuk `release-escrow`.

## Validation Rules per Langkah

| Langkah | Validasi | Gagal → |
|---|---|---|
| Direct Order | Package harus `published` | Error |
| Custom Offer | Hanya UMKM yang bisa create offer | 403 Forbidden |
| Accept/reject offer | Hanya creator penerima | 403 Forbidden |
| Create order | Offer harus `accepted` | Error status |
| Payment | Amount harus >= order.amount | Error |
| Payment | Order harus `pending_payment` | Error status |
| Upload deliverable | Order harus `in_progress` atau `revision` | Error status |
| Upload deliverable storage | Kuota creator cukup | Error "Kuota penuh" |
| Approve deliverable | Deliverable harus `submitted` | Error status |
| Validasi deliverable | Hanya Admin aktif; keputusan final satu kali dan `invalid` wajib catatan | 403/409/Error |
| Request revision | Revision count < `revisionLimit` | Error "Batas revisi habis" |
| Release escrow | Escrow harus `held` | `status: "ignored"` |
| Release escrow | Order harus `in_progress` atau `revision` | `status: "ignored"` |
| Release escrow | Deliverable latest harus approved dan validation valid harus match snapshot | `status: "ignored"` |
| Approve deliverable | Hanya UMKM pemilik order — ditegakkan permission baris, bukan hanya kode | 401/403 dari Appwrite |

## Notifikasi

Semua notifikasi memakai document id deterministik dari `(sourceId, kind)`, jadi event yang terkirim ulang menghasilkan 409 — bukan notifikasi ganda. Kegagalannya tidak pernah menggagalkan Function pemanggil: dana sudah berpindah, dan membatalkan itu karena notifikasi gagal jauh lebih merugikan daripada notifikasi yang hilang.

| Titik | Notifikasi | Penerima | Ditulis oleh |
|---|---|---|---|
| Order created (Direct) | "Order menunggu pembayaran" | UMKM | ⬜ Jalur A belum dibangun |
| Order created (Custom Offer) | "Offer diterima — lakukan pembayaran" | UMKM | `create-order` |
| Offer created | "Offer baru masuk" | Creator | `send-chat-notification` |
| Offer rejected | "Offer ditolak" | UMKM | `create-order` |
| Payment success | "Pembayaran berhasil — escrow terkunci" | UMKM + Creator | `create-escrow` |
| Deliverable uploaded | "Deliverable sudah diupload — review" | UMKM | `notify-order-activity` |
| Revision requested | "UMKM minta revisi: {message}" | Creator | `notify-order-activity` |
| Escrow released | "Dana Sudah Cair" — nominal bersih + potongan fee 2% dalam satu pesan | Creator | `release-escrow` |
| Order completed | "Pesanan Selesai" | UMKM | `release-escrow` |

## Edge Cases

- **Cancel sebelum bayar** — order `pending_payment` → `cancelled` langsung; tidak ada efek finansial.
- **Cancel setelah bayar** — hanya bisa via dispute (admin review → refund/reject). Lihat [60_Dispute.md](60_Dispute.md).
- **Revisi berulang** — dibatasi `revisionLimit` dari paket/offer. Jika habis, creator tidak wajib merevisi lagi (opsi: UMKM approve apa adanya atau buka dispute).
- **Upload deliverable via File Manager ditolak** jika kuota creator penuh. Creator harus hapus file lama atau beralih ke external URL.
- **Deliverable external URL rusak** — sistem tetap menyimpan; UMKM bisa request revisi atau buka dispute.
- **Creator tidak upload deliverable sampai deadline** — UMKM bisa buka dispute atau batalkan order (admin review).
- **Release escrow gagal** — transaksi harus atomic: escrow release + wallet update + order completed dalam satu function. Jika salah satu gagal, rollback.
- **Partial deliverable** — MVP tidak mendukung partial delivery; satu order = satu deliverable final (dengan versi).

## Links

- [RateCards](../02_Modules/RateCards/00_Index.md)
- [Chat](../02_Modules/Chat/00_Index.md)
- [Offers](../02_Modules/Offers/00_Index.md)
- [Orders](../02_Modules/Orders/00_Index.md)
- [Users](../02_Modules/Users/00_Index.md)
- [Payments](../02_Modules/Payments/00_Index.md)
- [Notifications](../02_Modules/Notifications/00_Index.md)
- [Dispute workflow](60_Dispute.md)
