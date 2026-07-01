# 02 — Auth, Onboarding, and RBAC

## 1. Purpose
Mendefinisikan autentikasi Appwrite, onboarding awal, role-based access control, session behavior, dan redirect setelah login.

## 2. Relevant User Roles
- Guest
- UMKM
- KREATOR
- ADMIN

## 3. Routes / Screens
- `/login`
- `/register`
- `/verify-email`
- `/forgot-password`
- `/onboarding`
- `/dashboard/umkm`
- `/dashboard/kreator`
- `/admin`

## 4. User Stories
1. Sebagai Guest, saya ingin membuat akun sesuai role agar bisa memakai Marketiv.
2. Sebagai user, saya ingin login dan diarahkan ke dashboard yang benar.
3. Sebagai Admin, saya ingin akses panel admin tanpa bisa diakses role lain.
4. Sebagai user, saya ingin reset password jika lupa.

## 5. Main Flow
1. Guest membuka register.
2. Guest memilih role UMKM atau KREATOR.
3. Frontend membuat akun melalui Appwrite Auth.
4. Backend/function membuat document `profiles`.
5. User memverifikasi email.
6. User login.
7. Middleware membaca session dan profile role.
8. User diarahkan sesuai role.

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
- Email wajib valid.
- Password mengikuti policy keamanan aplikasi.
- Role wajib salah satu: UMKM, KREATOR, ADMIN.
- ADMIN tidak boleh dibuat dari register publik.
- Profile document wajib ada setelah register sukses.
- Email verification wajib sebelum akses fitur finansial.

## 9. Backend Responsibilities
- Membuat profile document setelah user Auth dibuat.
- Assign label/team role bila dipakai.
- Memvalidasi role pada setiap backend-only operation.
- Menolak pembuatan ADMIN dari public endpoint.
- Menjaga session dan token verification.

## 10. Frontend Responsibilities
- Menampilkan form register role-based.
- Menangani session expired.
- Redirect berdasarkan role dari profile.
- Menyembunyikan menu yang tidak sesuai role.
- Menampilkan unauthorized page untuk 403.

## 11. UI States
- Loading: tampilkan skeleton sesuai layout, bukan spinner kosong di tengah layar.
- Empty: tampilkan ilustrasi/teks singkat + CTA yang sesuai role.
- Error: tampilkan pesan spesifik dan tombol retry bila aman.
- Disabled: tombol harus menjelaskan kenapa tidak bisa digunakan.
- Success: gunakan toast atau inline confirmation, lalu refresh data terkait.
- Pending: status finansial dan submission harus terlihat jelas dengan badge.

## 12. Edge Cases
- Auth user berhasil dibuat tetapi profile gagal dibuat.
- Profile ada tetapi role kosong.
- User belum verifikasi email mencoba pembayaran.
- Session expired saat submit form.
- User membuka route admin dari akun UMKM.

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
- [ ] Register UMKM dan KREATOR berhasil membuat Auth user + profile.
- [ ] Login mengarahkan user ke dashboard role yang benar.
- [ ] Route guard mencegah akses silang role.
- [ ] ADMIN hanya dibuat melalui trusted backend/admin operation.

## 16. Out of Scope
- Tidak membuat fitur di luar MVP tanpa feature flag.
- Tidak menambahkan package/layanan baru tanpa approval arsitektur.
- Tidak membuat field database baru tanpa update dokumentasi database.

## 17. AI Coding Assistant Notes
- Gunakan Appwrite Account untuk session user.
- Jangan simpan password di `profiles`.
- Jangan membuat role ADMIN dari form publik.

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
