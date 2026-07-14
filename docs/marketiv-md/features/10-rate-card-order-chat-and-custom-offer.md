# 10 — Rate Card Order, Chat, and Custom Offer

## 1. Purpose
Mendefinisikan order Rate Card, chat realtime, custom offer, acceptance, payment, escrow, revisi, dan completion.

## 2. Relevant User Roles
- UMKM
- KREATOR
- ADMIN
- Backend Function

## 3. Routes / Screens
- `/dashboard/umkm/negosiasi`
- `/dashboard/umkm/negosiasi/[id_order]`
- `/dashboard/kreator/negosiasi`
- `/dashboard/kreator/negosiasi/[id_order]`

## 4. User Stories
1. Sebagai UMKM, saya ingin chat dengan kreator untuk menyepakati scope.
2. Sebagai UMKM, saya ingin mengirim Custom Offer resmi.
3. Sebagai Kreator, saya ingin menerima/menolak offer.
4. Sebagai Admin, saya ingin meninjau chat saat dispute.

## 5. Main Flow
1. UMKM membuka profile kreator dan mulai chat.
2. Backend membuat rate_card_order status Negosiasi jika belum ada.
3. UMKM/Kreator bertukar pesan.
4. UMKM mengirim Custom Offer.
5. Kreator menerima atau menolak.
6. Jika diterima, order MenungguPembayaran.
7. UMKM bayar.
8. Order masuk Escrow/DalamPengerjaan.
9. Kreator submit collab post.
10. UMKM/Admin verifikasi dan order selesai.

## 6. Permission Rules
- Gunakan Bahasa Indonesia yang sederhana, tegas, dan mudah dipahami oleh UMKM.
- Semua flow finansial wajib melewati backend/Appwrite Function, bukan mutasi langsung dari frontend.
- Semua status harus menggunakan enum yang didefinisikan di `18-status-lifecycle-reference.md`.
- Semua operasi sensitif wajib menghasilkan record `audit_logs`.
- UI harus mobile-first, readable di viewport 375px, dan memiliki loading/error/empty state.
- Rate Card Mode adalah satu-satunya mode yang memiliki Live Chat dan Custom Offer.

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
- Chat hanya untuk Rate Card Mode.
- Participant order saja yang boleh read/write message.
- Custom Offer hanya dibuat UMKM.
- Offer hanya diterima/ditolak Kreator.
- Offer terkunci setelah accepted.
- Harga final harus > 0 dan deadline valid.

## 9. Backend Responsibilities
- Membuat order room.
- Mengatur permission message per participant.
- Mengirim system message pada status transition.
- Membuat payment transaction setelah offer accepted.
- Mengubah status order setelah webhook payment.
- Membuat audit log untuk offer accepted/payment/status.

## 10. Frontend Responsibilities
- Menampilkan chat realtime.
- Menampilkan sticky warning Collab Post.
- Menampilkan Custom Offer card.
- Disable input sesuai status order.
- Tidak menghubungkan chat dengan Campaign Mode.

## 11. UI States
- Loading: tampilkan skeleton sesuai layout, bukan spinner kosong di tengah layar.
- Empty: tampilkan ilustrasi/teks singkat + CTA yang sesuai role.
- Error: tampilkan pesan spesifik dan tombol retry bila aman.
- Disabled: tombol harus menjelaskan kenapa tidak bisa digunakan.
- Success: gunakan toast atau inline confirmation, lalu refresh data terkait.
- Pending: status finansial dan submission harus terlihat jelas dengan badge.

## 12. Edge Cases
- User bukan participant membuka chat.
- Offer lama diterima setelah ada offer baru.
- Payment berhasil tapi realtime belum update.
- Kreator submit link non-collab post.
- Order masuk dispute.

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
- [ ] Chat realtime hanya untuk participant.
- [ ] Custom Offer mengikuti role rule.
- [ ] Payment mengubah status order.
- [ ] Campaign Mode tetap tidak punya chat route.

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
