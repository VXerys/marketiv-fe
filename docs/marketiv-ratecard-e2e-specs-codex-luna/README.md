# Marketiv Rate Card E2E — Spec-Driven Pack for Codex Luna

## Objective

Menutup blocker utama **Rate Card / Creator Marketplace** agar golden path berikut dapat diuji secara nyata di **staging + Midtrans Sandbox** tanpa ambiguity, false success, atau duplicate financial operation:

`Kreator publish paket → UMKM pilih paket → chat/negosiasi → UMKM kirim Custom Offer → Kreator accept → order pending_payment → UMKM bayar Midtrans → webhook paid → escrow held → order in_progress → Kreator submit deliverable → UMKM revisi/approve → release escrow → wallet Kreator`

## Source of Truth

- Repository: `marketiv-id/marketiv-web`
- Branch: `staging`
- HEAD yang diverifikasi saat spec dibuat: `c75ec9bdacf4747a9f93bf23ed47c587a54ce840`
- Current workflow reference: `00_BACKEND/docs/03_Workflows/30_RateCard_Order.md`
- Current implementation lebih authoritative daripada dokumentasi lama jika terjadi konflik.
- Campaign dan Rate Card adalah domain terpisah. **Jangan mengubah flow Campaign** untuk menyelesaikan spec ini.

## Trello Mapping

1. `[BUG-P0] Rate Card dapat membuat lebih dari satu payment untuk satu order`
   - https://trello.com/c/3fQwVdRS
2. `[BUG-P0] Rate Card room tidak sinkron untuk offer/order/payment/escrow`
   - https://trello.com/c/RQFxA0Ty
3. `[BUG-P1] Konteks paket Rate Card hilang saat masuk negosiasi`
   - https://trello.com/c/FlGhAoK0
4. Parent UAT:
   - `[UAT-E2E-02] Rate Card E2E + Midtrans Sandbox`
   - https://trello.com/c/EaCybJzr

## Recommended Execution Order

### Phase 1 — Financial safety first
Kerjakan **Spec 01: Payment Idempotency**.

Alasan:
- Menyangkut potensi duplicate payment pada gateway.
- Harus selesai sebelum UX menawarkan retry / pay-again.
- Menjadi foundation bagi payment return flow di Spec 02.

### Phase 2 — Make the deal → pay transition reliable
Kerjakan **Spec 02: Negotiation Room Sync & Payment Handoff**.

Alasan:
- Ini blocker langsung terhadap E2E browser.
- Current CTA `Bayar` bergantung pada `pending_payment`, tetapi room tidak selalu otomatis mendapatkan state terbaru.
- Return dari Midtrans harus authoritative, bukan client-side success.

### Phase 3 — Fix product clarity and package provenance
Kerjakan **Spec 03: Package Context Persistence**.

Alasan:
- Paket yang dipilih sekarang hanya menjadi entry point sementara.
- Tidak perlu memblokir penyelesaian safety Task 01–02.
- Setelah Task 01–02 stabil, perubahan data contract ini lebih aman dilakukan dan diregresi.

## Important Constraints

- Jangan membuat satu refactor besar yang mencampur ketiga spec.
- Idealnya satu branch/PR per spec.
- Jangan mengganti Appwrite, Midtrans, auth architecture, atau service-layer pattern.
- Jangan mempercayai redirect/callback browser sebagai status payment final.
- Jangan expose server key.
- Jangan menggunakan broad realtime subscription untuk private financial tables.
- Jangan mengklaim runtime E2E PASS hanya dari unit test/build.
- Setelah perubahan Function/backend, deployment staging dan smoke test tetap diperlukan.
- Preserve existing seller-side Rate Card fee semantics: UMKM membayar harga deal; fee dipotong dari payout Kreator.
- Preserve current Campaign semantics.

## Definition of Done — Whole Pack

Pack ini dianggap selesai ketika:
1. Satu order tidak dapat menghasilkan lebih dari satu active/successful payment.
2. Accept offer → order → CTA payment dapat terlihat tanpa manual reload.
3. Return dari Midtrans menunjukkan verification state sampai backend mengonfirmasi order/escrow.
4. Package provenance tidak hilang setelah masuk chat, refresh, offer, dan order.
5. Golden path berhasil dengan dua browser/session role berbeda di staging.
6. Negative cases payment diuji.
7. Tidak ada duplicate payment, escrow, release, atau ledger.
8. Typecheck/lint/build/test relevan lulus.
9. Campaign regression tidak muncul.
