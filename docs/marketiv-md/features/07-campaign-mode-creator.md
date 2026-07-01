# 07 — Campaign Mode Creator

## 1. Purpose
Mendefinisikan Job Pool, detail campaign, claim campaign, dan pekerjaan aktif untuk Kreator.

## 2. Relevant User Roles
- KREATOR
- ADMIN
- Backend Function

## 3. Routes / Screens
- `/dashboard/kreator/job-pool`
- `/dashboard/kreator/job-pool/[id]`
- `/dashboard/kreator/pekerjaan-aktif`

## 4. User Stories
1. Sebagai Kreator, saya ingin melihat campaign aktif agar bisa memilih job.
2. Sebagai Kreator, saya ingin klaim campaign jika kuota tersedia.
3. Sebagai Kreator, saya ingin melihat pekerjaan yang sudah saya klaim.

## 5. Main Flow
1. Kreator membuka Job Pool.
2. Frontend menampilkan campaign status Aktif.
3. Kreator filter berdasarkan niche/harga.
4. Kreator membuka detail.
5. Kreator menekan Klaim Job Ini.
6. Backend cek duplikasi dan kuota.
7. Backend membuat claim.
8. Pekerjaan muncul di Pekerjaan Aktif.

## 6. Permission Rules
- Gunakan Bahasa Indonesia yang sederhana, tegas, dan mudah dipahami oleh UMKM.
- Semua flow finansial wajib melewati backend/Appwrite Function, bukan mutasi langsung dari frontend.
- Semua status harus menggunakan enum yang didefinisikan di `18-status-lifecycle-reference.md`.
- Semua operasi sensitif wajib menghasilkan record `audit_logs`.
- UI harus mobile-first, readable di viewport 375px, dan memiliki loading/error/empty state.
- Campaign Mode tidak boleh memiliki chat, tombol kontak, WhatsApp, email, atau komentar.

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
- User harus KREATOR.
- Campaign harus Aktif.
- Kuota tersedia.
- Kreator belum pernah klaim campaign yang sama.
- Kreator profile tidak boleh suspended.

## 9. Backend Responsibilities
- Mengeksekusi createCampaignClaim secara atomik/sekuensial.
- Cek duplicate claim.
- Cek kuota.
- Increment kuota_terpakai.
- Membuat notification untuk UMKM/Kreator.

## 10. Frontend Responsibilities
- Menampilkan campaign card dengan kuota dan bayaran.
- Disable CTA jika kuota penuh atau sudah klaim.
- Tidak menampilkan kontak UMKM.
- Menampilkan active job list.

## 11. UI States
- Loading: tampilkan skeleton sesuai layout, bukan spinner kosong di tengah layar.
- Empty: tampilkan ilustrasi/teks singkat + CTA yang sesuai role.
- Error: tampilkan pesan spesifik dan tombol retry bila aman.
- Disabled: tombol harus menjelaskan kenapa tidak bisa digunakan.
- Success: gunakan toast atau inline confirmation, lalu refresh data terkait.
- Pending: status finansial dan submission harus terlihat jelas dengan badge.

## 12. Edge Cases
- Dua kreator klaim bersamaan.
- Campaign menjadi penuh saat detail terbuka.
- Kreator klik claim berkali-kali.
- Campaign dibatalkan setelah diklaim.

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
- [ ] Claim berhasil hanya jika semua rule terpenuhi.
- [ ] Duplicate claim ditolak.
- [ ] Kuota penuh men-disable CTA.
- [ ] Campaign Mode tetap tanpa chat.

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
