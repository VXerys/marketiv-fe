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

| Collection | Modul | Aksi |
|---|---|---|
| `rate_cards`, `rate_card_packages` | RateCards | read |
| `conversations`, `messages` | Chat | insert (Jalur B) |
| `offers` | Offers | insert → update status (Jalur B) |
| `orders` | Orders | insert → update status |
| `deliverables` | Orders | insert (creator upload) |
| `revisions` | Orders | insert (UMKM minta revisi) |
| `user_files` | Users | insert saat upload deliverable via storage |
| `user_storage_usage` | Users | update kuota |
| `wallets` | Payments | update escrowBalance, balance |
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
   - Webhook `midtrans-webhook` tervalidasi → `payments.status: pending → paid`.
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
8. **Payments** — Buat `escrows`: `{ orderId, amount, status: 'held' }`.
9. **Payments** — Update wallet: `wallets.escrowBalance += amount` (dana UMKM ditahan).
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
9. **Orders** — Buat `orders`: `{ umkmId, creatorId, offerId, amount: offer.price, status: 'pending_payment' }`.
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
    - **Internal (storage)**: upload file via File Manager (`uploadFile({ file })`). File Manager hanya menyimpan file umum dan metadata storage; relasi ke order dicatat di `deliverables.fileId`. File terikat kuota creator (100 MB).
    - **External URL**: link Google Drive/Dropbox/CDN (`https` saja). Bebas kuota.
    - Deliverable tersimpan: `{ orderId, source, fileUrl, version: n+1, status: 'submitted' }`.
15. **Event `deliverables.create`** memicu function **`notify-client-review`**.
16. **Notifications** — Notifikasi ke UMKM: "Deliverable sudah diupload — review sekarang".
17. **Orders** — UMKM review deliverable:
    - **Approve**: `deliverables.status: submitted → approved`.
    - **Request Revision**: `deliverables.status: submitted → revision_requested`, buat `revisions` record.
18. **Jika Request Revision:**
    - Order status: `in_progress → revision`.
    - Notifikasi ke creator: "UMKM minta revisi — {message}".
    - Creator reupload deliverable (version++) → review lagi.
    - Jumlah revisi dibatasi `revisionLimit` (dari package/offer).
19. **Jika Approve:**
    - **Event `deliverables.status (revision_requested→approved)`** memicu function **`release-escrow`**.
20. **Payments** — Release escrow (dipotong fee 2%):
    - `escrows.status: held → released`.
    - `wallets.escrowBalance -= amount` (dana keluar dari escrow).
    - Hitung fee: `feeAmount = floor(amount × 2%)`.
    - Hitung bersih: `creatorAmount = amount - feeAmount`.
    - `wallets.balance += creatorAmount` (dana masuk available balance creator setelah fee).
    - Buat `transactions`:
      - `{ userId: creatorId, amount: creatorAmount, type: 'release', referenceType: 'order', referenceId: orderId }`.
      - `{ userId: creatorId, amount: feeAmount, type: 'fee', referenceType: 'order', referenceId: orderId }`.
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

| Trigger | Function | Aksi |
|---|---|---|
| `offers.status (pending→accepted)` | `create-order` | Buat order dari offer (Jalur B) |
| `payments.status (pending→paid)` | `create-escrow` | Buat escrow, hold dana |
| `deliverables.create` | `notify-client-review` | Notifikasi UMKM untuk review |
| `deliverables.status (revision_requested→approved)` | `release-escrow` | Release escrow ke wallet creator |

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
| Request revision | Revision count < `revisionLimit` | Error "Batas revisi habis" |
| Release escrow | Escrow harus `held` | Error status |

## Notifikasi

| Titik | Notifikasi | Penerima |
|---|---|---|
| Order created (Direct) | "Order menunggu pembayaran" | UMKM |
| Order created (Custom Offer) | "Offer diterima — lakukan pembayaran" | UMKM |
| Offer created | "Offer baru masuk" | Creator |
| Offer rejected | "Offer ditolak" | UMKM |
| Payment success | "Pembayaran berhasil — escrow terkunci" | UMKM + Creator |
| Deliverable uploaded | "Deliverable sudah diupload — review" | UMKM |
| Revision requested | "UMKM minta revisi: {message}" | Creator |
| Deliverable approved | "Deliverable disetujui" | Creator |
| Escrow released | "Order selesai — dana dirilis" | Creator + UMKM |
| Fee deducted | "Fee platform 2% ({amount}) telah dipotong dari order ini" | Creator |

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
