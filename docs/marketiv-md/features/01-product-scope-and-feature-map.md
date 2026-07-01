# 01 — Product Scope and Feature Map

## 1. Purpose
Menentukan batas produk Marketiv, prioritas MVP, dependency antar fitur, dan peta domain agar tim tidak membangun fitur di luar scope.

## 2. Relevant User Roles
- Guest
- UMKM
- KREATOR
- ADMIN
- Backend Function

## 3. Routes / Screens
- `/`
- `/login`
- `/register`
- `/dashboard/umkm`
- `/dashboard/kreator`
- `/admin`

## 4. User Stories
1. Sebagai UMKM, saya ingin membuat campaign dengan aman agar bisa mendapat promosi konten.
2. Sebagai Kreator, saya ingin menemukan campaign dan rate card order agar bisa menghasilkan pendapatan.
3. Sebagai Admin, saya ingin memvalidasi submission dan dispute agar platform tetap aman.
4. Sebagai tim teknis, saya ingin peta fitur yang jelas agar implementasi tidak melebar.

## 5. Main Flow
1. Definisikan role dan mode utama.
2. Pisahkan fitur P0, P1, dan P2.
3. Petakan dependency antar fitur.
4. Tentukan out-of-scope MVP.
5. Gunakan peta ini untuk sprint planning dan QA scope.

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
- Setiap fitur wajib punya owner role.
- Setiap fitur wajib punya route atau backend function yang jelas.
- Setiap fitur yang menyentuh uang wajib terhubung ke transaction dan audit log.
- Fitur P2 tidak boleh dibangun diam-diam di sprint MVP.

## 9. Backend Responsibilities
- Menjaga feature flags dan route guard.
- Menolak mutasi di luar scope.
- Menyediakan API/function hanya untuk fitur P0/P1 yang disetujui.
- Membuat migration Appwrite bila fitur membutuhkan collection/attribute baru.

## 10. Frontend Responsibilities
- Menampilkan navigasi hanya untuk fitur yang aktif.
- Menjaga empty state untuk fitur yang belum aktif.
- Tidak membuat route tersembunyi untuk fitur P2.
- Mengikuti feature permissions matrix.

## 11. UI States
- Loading: tampilkan skeleton sesuai layout, bukan spinner kosong di tengah layar.
- Empty: tampilkan ilustrasi/teks singkat + CTA yang sesuai role.
- Error: tampilkan pesan spesifik dan tombol retry bila aman.
- Disabled: tombol harus menjelaskan kenapa tidak bisa digunakan.
- Success: gunakan toast atau inline confirmation, lalu refresh data terkait.
- Pending: status finansial dan submission harus terlihat jelas dengan badge.

## 12. Edge Cases
- User mencoba akses fitur P2 yang belum aktif.
- Role salah diarahkan ke dashboard role lain.
- Admin membuka data yang belum punya collection final.
- Frontend menampilkan CTA untuk fitur yang belum ada backend-nya.

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
- [ ] Peta fitur dapat dipakai untuk menyusun backlog sprint.
- [ ] Semua fitur P0 memiliki dokumen detail.
- [ ] Out-of-scope MVP tertulis eksplisit.
- [ ] Dependency antar fitur dapat ditelusuri.

## 16. Out of Scope
- Tidak membuat fitur di luar MVP tanpa feature flag.
- Tidak menambahkan package/layanan baru tanpa approval arsitektur.
- Tidak membuat field database baru tanpa update dokumentasi database.

## 17. AI Coding Assistant Notes
- Gunakan file ini untuk menentukan prioritas kerja sebelum implementasi.
- Jangan implementasikan fitur P2 hanya karena terlihat menarik.
- Saat membuat prompt AI, cantumkan prioritas P0/P1/P2.

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
