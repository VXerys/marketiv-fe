# 11 — Finance, Escrow, Wallet, and Withdrawal

## 1. Purpose
Mendefinisikan deposit, escrow ledger, fee platform, payout, wallet kreator, withdrawal, refund, dan transaction history.

## 2. Relevant User Roles
- UMKM
- KREATOR
- ADMIN
- Backend Function

## 3. Routes / Screens
- `/dashboard/umkm/keuangan`
- `/dashboard/kreator/keuangan`
- `/admin/transactions`

## 4. User Stories
1. Sebagai UMKM, saya ingin membayar campaign/order via escrow.
2. Sebagai Kreator, saya ingin melihat saldo dan menarik dana.
3. Sebagai Admin, saya ingin memonitor transaksi dan payout.

## 5. Main Flow
1. UMKM membuat payment intent.
2. Provider payment memproses transaksi.
3. Webhook diterima backend.
4. Backend validasi signature/status.
5. Transaction berubah Success/Escrow.
6. Campaign/order aktif.
7. Setelah pekerjaan valid, payout dibuat.
8. Kreator meminta withdrawal.
9. Admin/backend memproses withdrawal.

## 6. Permission Rules
- Gunakan Bahasa Indonesia yang sederhana, tegas, dan mudah dipahami oleh UMKM.
- Semua flow finansial wajib melewati backend/Appwrite Function, bukan mutasi langsung dari frontend.
- Semua status harus menggunakan enum yang didefinisikan di `18-status-lifecycle-reference.md`.
- Semua operasi sensitif wajib menghasilkan record `audit_logs`.
- UI harus mobile-first, readable di viewport 375px, dan memiliki loading/error/empty state.

## 7. Data Dependencies
- `profiles`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `campaigns`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `campaign_claims`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `campaign_submissions`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `creator_rate_cards`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `rate_card_orders`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `messages`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `transactions`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `withdrawals`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `disputes`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `notifications`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.
- `audit_logs`: gunakan sesuai kebutuhan fitur; jangan buat collection baru tanpa alasan domain yang jelas.

## 8. Validation Rules
- Nominal wajib > 0.
- Payment status hanya dari backend/webhook.
- Saldo tidak boleh negatif.
- Withdrawal tidak boleh melebihi saldo tersedia.
- Semua refund/payout wajib punya transaction record.
- Semua nominal pakai integer minor unit atau decimal konsisten.

## 9. Backend Responsibilities
- Membuat payment token/link.
- Validasi webhook provider.
- Update transaction ledger.
- Update escrow status.
- Update wallet balance secara trusted.
- Membuat withdrawal request dan audit log.

## 10. Frontend Responsibilities
- Menampilkan transaction history.
- Menampilkan saldo read-only.
- Menampilkan payment pending/success/failed.
- Menampilkan form withdrawal dengan validasi.
- Tidak mengubah saldo dari client.

## 11. UI States
- Loading: tampilkan skeleton sesuai layout, bukan spinner kosong di tengah layar.
- Empty: tampilkan ilustrasi/teks singkat + CTA yang sesuai role.
- Error: tampilkan pesan spesifik dan tombol retry bila aman.
- Disabled: tombol harus menjelaskan kenapa tidak bisa digunakan.
- Success: gunakan toast atau inline confirmation, lalu refresh data terkait.
- Pending: status finansial dan submission harus terlihat jelas dengan badge.

## 12. Edge Cases
- Webhook double delivery.
- Payment expired.
- Withdrawal ditolak bank.
- Refund partial.
- Admin override saldo tanpa audit tidak boleh terjadi.

## 13. Error Handling
- 401: arahkan user ke login dan hapus session lokal jika token tidak valid.
- 403: tampilkan halaman akses ditolak, jangan sembunyikan error sebagai data kosong.
- 404: tampilkan not found dengan link kembali ke dashboard.
- 409: konflik bisnis seperti kuota penuh, duplicate claim, atau offer sudah berubah.
- 422: validasi field gagal, tampilkan error di field terkait.
- 500: tampilkan pesan umum + retry; log detail hanya di backend.

## 14. Analytics / Logs
- Catat event page viewed untuk halaman utama fitur.
- Catat CTA clicked untuk aksi utama.
- Catat success/failure untuk mutasi penting.
- Catat admin action ke `audit_logs` dengan before/after data.
- Catat payment/submission/order lifecycle agar laporan P2MW bisa direkonstruksi.

## 15. Acceptance Criteria
- [ ] Semua mutasi dana punya transaction.
- [ ] Frontend tidak bisa update saldo/payment status.
- [ ] Withdrawal mengikuti saldo tersedia.
- [ ] Refund/payout tercatat dan bisa diaudit.

## 16. Out of Scope
- Tidak membuat fitur di luar MVP tanpa feature flag.
- Tidak menambahkan package/layanan baru tanpa approval arsitektur.
- Tidak membuat field database baru tanpa update dokumentasi database.

## 17. AI Coding Assistant Notes
- Ikuti dokumen ini sebagai kontrak fitur.
- Jangan menebak enum, route, atau permission; cek dokumen referensi terkait.
- Pisahkan UI read-only dari mutasi backend-only.
- Buat perubahan kecil, terukur, dan mudah direview.

## 18. Cross-Reference
- `docs/database/02-collections-schema.md` untuk field dan collection.
- `docs/database/04-permissions-and-roles.md` untuk permission Appwrite.
- `docs/features/17-feature-permissions-matrix.md` untuk matrix akses.
- `docs/features/18-status-lifecycle-reference.md` untuk status lifecycle.
- `docs/features/19-frontend-backend-contract.md` untuk boundary implementasi.

## 19. Implementation Checklist
- [ ] Route tersedia dan diproteksi sesuai role.
- [ ] Data fetch memakai query/index yang sudah didokumentasikan.
- [ ] Semua field form tervalidasi client-side dan server-side.
- [ ] Semua mutasi sensitif melewati Appwrite Function.
- [ ] Semua status badge memakai mapping konsisten.
- [ ] Semua empty/loading/error state sudah dibuat.
- [ ] Unit/integration test minimal untuk happy path dan failure path.
- [ ] Dokumentasi diperbarui bila ada perubahan flow.
