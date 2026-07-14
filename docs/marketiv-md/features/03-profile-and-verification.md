# 03 — Profile and Verification

## 1. Purpose
Mendefinisikan profile domain user, verifikasi UMKM/Kreator, public creator profile, dan field yang dapat diubah oleh user.

## 2. Relevant User Roles
- UMKM
- KREATOR
- ADMIN

## 3. Routes / Screens
- `/dashboard/umkm/profil`
- `/dashboard/kreator/profil`
- `/dashboard/umkm/kreator/[id]`
- `/admin/users`

## 4. User Stories
1. Sebagai UMKM, saya ingin melengkapi profil usaha agar campaign terlihat kredibel.
2. Sebagai Kreator, saya ingin menampilkan niche dan portofolio agar dipilih UMKM.
3. Sebagai Admin, saya ingin memverifikasi profil agar marketplace lebih aman.

## 5. Main Flow
1. User login dan membuka halaman profil.
2. User mengisi data wajib berdasarkan role.
3. User menyimpan perubahan non-sensitif.
4. Jika perlu verifikasi, user mengirim request review.
5. Admin review profile dan mengubah status verifikasi.
6. Frontend menampilkan badge verified/rejected/pending.

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
- Nama lengkap wajib.
- Nomor WhatsApp harus format valid.
- Social link harus URL valid.
- Foto profil hanya file ringan dan tipe gambar.
- Kreator wajib memilih minimal satu niche.
- UMKM wajib mengisi nama usaha sebelum membuat campaign aktif.

## 9. Backend Responsibilities
- Menyimpan update profile non-sensitif.
- Memproses verification request.
- Membatasi field sensitif seperti role dan saldo.
- Membuat audit log untuk verifikasi/rejection/suspension.
- Menjaga public read hanya untuk data aman.

## 10. Frontend Responsibilities
- Menyediakan form edit profile per role.
- Menampilkan validation error per field.
- Menampilkan public creator card dari data aman saja.
- Tidak menampilkan saldo, email internal, atau data sensitif di public profile.

## 11. UI States
- Loading: tampilkan skeleton sesuai layout, bukan spinner kosong di tengah layar.
- Empty: tampilkan ilustrasi/teks singkat + CTA yang sesuai role.
- Error: tampilkan pesan spesifik dan tombol retry bila aman.
- Disabled: tombol harus menjelaskan kenapa tidak bisa digunakan.
- Success: gunakan toast atau inline confirmation, lalu refresh data terkait.
- Pending: status finansial dan submission harus terlihat jelas dengan badge.

## 12. Edge Cases
- User upload gambar terlalu besar.
- Admin menolak verifikasi dan harus ada alasan.
- Kreator belum verified tetapi mencoba tampil di direktori.
- UMKM belum melengkapi usaha tetapi mencoba publish campaign.

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
- [ ] UMKM dapat menyimpan profil usaha.
- [ ] Kreator dapat menyimpan niche, bio, dan portfolio.
- [ ] Admin dapat mengubah verification status dengan audit log.
- [ ] Public profile hanya menampilkan data aman.

## 16. Out of Scope
- Tidak membuat fitur di luar MVP tanpa feature flag.
- Tidak menambahkan package/layanan baru tanpa approval arsitektur.
- Tidak membuat field database baru tanpa update dokumentasi database.

## 17. AI Coding Assistant Notes
- Pisahkan Appwrite Auth identity dari `profiles`.
- Role tidak boleh diedit langsung dari halaman profil.
- Gunakan verification status untuk mengontrol visibility direktori.

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
