# Workflow: Dispute

## Purpose

Sengketa pada order rate card aktif diselesaikan admin dengan tiga opsi keputusan yang menentukan apakah escrow dirilis ke creator atau di-refund ke UMKM.

## Modules Involved

- [Orders](../02_Modules/Orders/00_Index.md) — order & status dispute.
- [Payments](../02_Modules/Payments/00_Index.md) — escrow release/refund.
- Admin — review & keputusan.

## Trigger

UMKM `Open Dispute` pada order aktif (alasan: Konten Tidak Sesuai, Tidak Posting, Spam).

## Step-by-step Flow

1. **Orders** — Dispute dibuka pada order `active`/`in_progress`; order ditandai disputed.
2. **Admin** — Review bukti dari kedua pihak.
3. **Admin** — Keputusan:
   - **Creator Win** → **Payments** release escrow penuh ke wallet creator → order completed.
   - **UMKM Win** → **Payments** refund escrow penuh ke wallet UMKM → order closed/refunded.
   - **Partial Refund** → **Payments** bagi escrow: sebagian ke creator, sebagian refund ke UMKM.
4. **Payments** — Update `escrows`, `wallets`, dan `wallet_transactions` sesuai keputusan; escrow balance → 0 setelah resolusi.
5. **Notifications** — Notifikasi "Dispute Resolved" ke kedua pihak.

## Events / Functions

- Resolusi escrow mengikuti fungsi escrow yang sama: `release-escrow` (Creator Win / porsi creator pada Partial) dan jalur refund (UMKM Win / porsi UMKM).
- Lihat: [`../02_Modules/Orders/90_Events.md`](../02_Modules/Orders/00_Index.md), [`../02_Modules/Payments/90_Events.md`](../02_Modules/Payments/00_Index.md).

## Edge Cases

- Dispute hanya valid setelah pembayaran (escrow sudah locked).
- Partial refund harus tetap menjaga invariant: total release + refund = jumlah escrow.
- Campaign Viral memakai jalur appeal terpisah (creator appeal atas submission rejected → admin final decision), lihat [40_Submission_Fraud.md](40_Submission_Fraud.md).

## Links

- [Orders](../02_Modules/Orders/00_Index.md)
- [Payments](../02_Modules/Payments/00_Index.md)
- [RateCard Order workflow](30_RateCard_Order.md)
