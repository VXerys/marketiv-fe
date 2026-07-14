# 12 — Notifications and Activity Log

## 1. Purpose
Mendefinisikan notification center, unread badge, activity timeline, dan event yang dikirim untuk UMKM/Kreator/Admin.

## 2. Relevant User Roles
- UMKM
- KREATOR
- ADMIN
- Backend Function

## 3. Routes / Screens
- `/dashboard/notifications`
- `/dashboard/umkm`
- `/dashboard/kreator`
- `/admin`

## 4. User Stories
1. Sebagai user, saya ingin mendapat notifikasi saat ada perubahan penting.
2. Sebagai Admin, saya ingin melihat aktivitas sensitif.
3. Sebagai user, saya ingin menandai notifikasi sudah dibaca.

## 5. Main Flow
1. Backend membuat notification saat event penting.
2. Frontend subscribe atau fetch notification user.
3. User membuka notification center.
4. User membaca detail.
5. Frontend menandai read.
6. Activity log disimpan untuk aksi sensitif.

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
- Notification harus punya user_id.
- Reference type/id harus valid jika ada.
- Notification body tidak boleh membocorkan data sensitif.
- Audit log tidak boleh diedit oleh user biasa.

## 9. Backend Responsibilities
- Membuat notification dari events.
- Membuat audit log dari operasi sensitif.
- Menyediakan query unread count.
- Menjaga retention audit log.

## 10. Frontend Responsibilities
- Menampilkan unread badge.
- Menampilkan list notifikasi terbaru.
- Memberi action link sesuai reference.
- Menampilkan activity timeline bila diperlukan.

## 11. UI States
- Loading: tampilkan skeleton sesuai layout, bukan spinner kosong di tengah layar.
- Empty: tampilkan ilustrasi/teks singkat + CTA yang sesuai role.
- Error: tampilkan pesan spesifik dan tombol retry bila aman.
- Disabled: tombol harus menjelaskan kenapa tidak bisa digunakan.
- Success: gunakan toast atau inline confirmation, lalu refresh data terkait.
- Pending: status finansial dan submission harus terlihat jelas dengan badge.

## 12. Edge Cases
- Reference sudah dihapus.
- User membaca notifikasi dari role salah.
- Realtime connection gagal.
- Notifikasi ganda akibat retry event.

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
- [ ] Unread count akurat.
- [ ] Notification tidak membocorkan data lintas user.
- [ ] Audit log tercatat untuk admin/payment/status action.
- [ ] User dapat mark as read.

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
