# FEATURES.md — Marketiv Feature Specification (Appwrite Edition)

> Dokumen ini adalah entry point untuk semua spesifikasi fitur Marketiv.
> Gunakan bersama dokumentasi database Appwrite, technical guidelines, dan UI/UX system.

## 1. Tujuan Dokumentasi

Dokumentasi fitur ini menjelaskan apa yang harus dibangun, siapa aktornya, bagaimana flow-nya, permission yang berlaku, status lifecycle, validasi, edge case, serta boundary antara frontend dan backend.

Dokumen ini bukan hanya daftar halaman. Dokumen ini adalah kontrak implementasi untuk tim Backend, Frontend, UI/UX, QA, dan AI coding assistant di VS Code.

## 2. Product Context

Marketiv adalah platform marketplace hibrida yang menghubungkan UMKM dengan Kreator Mikro untuk kebutuhan pemasaran konten pendek.

Marketiv memiliki dua mode utama:

1. Campaign Mode: UMKM membuat campaign performance-based, kreator klaim job, lalu dibayar berdasarkan views tervalidasi.
2. Rate Card Mode: UMKM memilih kreator spesifik, bernegosiasi via chat, membuat custom offer, dan membayar fixed price via escrow.

## 3. Core Roles

- Guest: user belum login.
- UMKM: pemilik usaha yang membuat campaign, membayar escrow, memilih kreator, dan melihat laporan.
- KREATOR: kreator mikro yang mengklaim campaign, mengirim bukti tayang, membuat rate card, dan menerima payout.
- ADMIN: operator internal yang memverifikasi user, submission, dispute, transaksi, dan laporan.
- Backend Function: trusted execution layer untuk operasi sensitif.

## 4. Technology Boundary

- Auth: Appwrite Auth.
- Domain profile: collection `profiles`.
- Database: Appwrite Databases.
- Storage ringan: Appwrite Storage.
- Aset besar/video mentah: external URL Google Drive/Dropbox.
- Bukti tayang: URL publik TikTok/Instagram.
- Sensitive mutation: Appwrite Functions.
- Realtime: Appwrite Realtime untuk chat, notification, dan status update tertentu.

## 5. Documentation Structure

- `01-product-scope-and-feature-map.md`
- `02-auth-onboarding-and-rbac.md`
- `03-profile-and-verification.md`
- `04-umkm-dashboard.md`
- `05-creator-dashboard.md`
- `06-campaign-mode-umkm.md`
- `07-campaign-mode-creator.md`
- `08-campaign-submission-and-validation.md`
- `09-rate-card-discovery-and-profile.md`
- `10-rate-card-order-chat-and-custom-offer.md`
- `11-finance-escrow-wallet-and-withdrawal.md`
- `12-notifications-and-activity-log.md`
- `13-ai-features-and-automation.md`
- `14-admin-operations-and-reporting.md`
- `15-dispute-resolution-and-trust-safety.md`
- `16-settings-and-account-management.md`
- `17-feature-permissions-matrix.md`
- `18-status-lifecycle-reference.md`
- `19-frontend-backend-contract.md`

## 6. MVP Priority Definition

P0 berarti wajib untuk MVP pertama yang dapat dipakai end-to-end.
P1 berarti penting setelah P0 stabil.
P2 berarti post-MVP atau enhancement lanjutan.

### P0 Features

- Auth registration/login/logout + role routing
- Profile basic untuk UMKM dan Kreator
- UMKM dashboard
- Kreator dashboard
- Campaign creation wizard
- Payment deposit dan escrow record
- Job Pool aktif untuk Kreator
- Claim campaign via backend function
- Submit URL bukti tayang
- Admin validation manual
- Creator wallet read-only
- Rate Card basic CRUD
- Rate Card chat room
- Custom Offer workflow
- Transaction history basic
- Admin report basic

### P1 Features

- Notification center
- Creator/UMKM verification workflow
- AI Brief Assistant
- Withdrawal request workflow
- Dispute workflow detail
- Advanced campaign analytics
- Export laporan P2MW lebih lengkap

### P2 Features

- AI fraud detection advanced
- TikTok/Instagram API integration
- Automated view fetching
- Creator ranking/recommendation
- Referral system
- Mobile app
- Multi-language support

## 7. Global Hard Rules

- Gunakan Bahasa Indonesia yang sederhana, tegas, dan mudah dipahami oleh UMKM.
- Semua flow finansial wajib melewati backend/Appwrite Function, bukan mutasi langsung dari frontend.
- Semua status harus menggunakan enum yang didefinisikan di `18-status-lifecycle-reference.md`.
- Semua operasi sensitif wajib menghasilkan record `audit_logs`.
- UI harus mobile-first, readable di viewport 375px, dan memiliki loading/error/empty state.
- Campaign Mode tidak boleh memiliki chat, tombol kontak, WhatsApp, email, atau komentar.
- Rate Card Mode adalah satu-satunya mode yang memiliki Live Chat dan Custom Offer.
- File video final tidak boleh disimpan di Marketiv; gunakan URL TikTok/Instagram sebagai bukti tayang.
- Aset besar UMKM harus menggunakan Google Drive/Dropbox atau external URL valid.
- Appwrite Auth adalah sumber identity; `profiles` adalah sumber data domain user.

## 8. Backend Usage Notes

Backend wajib membaca file berikut sebelum implementasi fitur:

- `docs/database/02-collections-schema.md`
- `docs/database/04-permissions-and-roles.md`
- `docs/database/05-indexing-and-query-strategy.md`
- `docs/features/17-feature-permissions-matrix.md`
- `docs/features/18-status-lifecycle-reference.md`

Backend wajib menjaga semua operasi finansial dan status lifecycle tetap konsisten.

## 9. Frontend Usage Notes

Frontend wajib membaca file berikut sebelum membuat halaman:

- file fitur terkait halaman tersebut
- `17-feature-permissions-matrix.md`
- `18-status-lifecycle-reference.md`
- `19-frontend-backend-contract.md`

Frontend boleh membaca data yang permission-nya tersedia, tetapi tidak boleh memodifikasi field sensitif secara langsung.

## 10. AI Coding Assistant Usage

Saat menggunakan AI di VS Code, paste file fitur yang relevan sebagai konteks. Instruksikan AI untuk mengikuti route, status, collection, validation, dan out-of-scope yang tertulis di dokumen ini.

Contoh instruksi:

```txt
Implementasikan halaman Job Pool sesuai docs/features/07-campaign-mode-creator.md.
Ikuti schema Appwrite dari docs/database/02-collections-schema.md.
Jangan menambahkan chat di Campaign Mode.
Gunakan status enum dari docs/features/18-status-lifecycle-reference.md.
```

## 11. Definition of Done

- [ ] Feature sesuai user story dan main flow.
- [ ] Route diproteksi sesuai role.
- [ ] Data contract jelas dan mengikuti database docs.
- [ ] Validasi client-side dan server-side tersedia.
- [ ] Loading, empty, error, success, and disabled state tersedia.
- [ ] Audit log dibuat untuk operasi sensitif.
- [ ] Notification dibuat bila fitur memerlukan feedback async.
- [ ] Tidak ada pelanggaran hard rule Campaign Mode dan Finance.
- [ ] QA dapat menguji happy path dan edge cases berdasarkan dokumen.

## 12. Glossary

- **Campaign Mode**: Mode performance-based tanpa chat.
- **Rate Card Mode**: Mode fixed-price dengan chat dan Custom Offer.
- **Escrow**: Dana ditahan sampai kondisi kerja valid.
- **Submission**: Bukti tayang yang dikirim Kreator.
- **Claim**: Aksi Kreator mengambil campaign aktif.
- **Custom Offer**: Penawaran resmi dalam chat Rate Card.
- **Backend Function**: Trusted backend layer untuk mutasi sensitif.
- **Audit Log**: Catatan aksi sensitif.
- **Payout**: Pencairan dana ke Kreator.
- **Refund**: Pengembalian dana ke UMKM.
- **Campaign Mode**: Mode performance-based tanpa chat.
- **Rate Card Mode**: Mode fixed-price dengan chat dan Custom Offer.
- **Escrow**: Dana ditahan sampai kondisi kerja valid.
- **Submission**: Bukti tayang yang dikirim Kreator.
- **Claim**: Aksi Kreator mengambil campaign aktif.
- **Custom Offer**: Penawaran resmi dalam chat Rate Card.
- **Backend Function**: Trusted backend layer untuk mutasi sensitif.
- **Audit Log**: Catatan aksi sensitif.
- **Payout**: Pencairan dana ke Kreator.
- **Refund**: Pengembalian dana ke UMKM.
- **Campaign Mode**: Mode performance-based tanpa chat.
- **Rate Card Mode**: Mode fixed-price dengan chat dan Custom Offer.
- **Escrow**: Dana ditahan sampai kondisi kerja valid.
- **Submission**: Bukti tayang yang dikirim Kreator.
- **Claim**: Aksi Kreator mengambil campaign aktif.
- **Custom Offer**: Penawaran resmi dalam chat Rate Card.
- **Backend Function**: Trusted backend layer untuk mutasi sensitif.
- **Audit Log**: Catatan aksi sensitif.
- **Payout**: Pencairan dana ke Kreator.
- **Refund**: Pengembalian dana ke UMKM.
- **Campaign Mode**: Mode performance-based tanpa chat.
- **Rate Card Mode**: Mode fixed-price dengan chat dan Custom Offer.
- **Escrow**: Dana ditahan sampai kondisi kerja valid.
- **Submission**: Bukti tayang yang dikirim Kreator.
- **Claim**: Aksi Kreator mengambil campaign aktif.
- **Custom Offer**: Penawaran resmi dalam chat Rate Card.
- **Backend Function**: Trusted backend layer untuk mutasi sensitif.
- **Audit Log**: Catatan aksi sensitif.
- **Payout**: Pencairan dana ke Kreator.
- **Refund**: Pengembalian dana ke UMKM.
- **Campaign Mode**: Mode performance-based tanpa chat.
- **Rate Card Mode**: Mode fixed-price dengan chat dan Custom Offer.
- **Escrow**: Dana ditahan sampai kondisi kerja valid.
- **Submission**: Bukti tayang yang dikirim Kreator.
- **Claim**: Aksi Kreator mengambil campaign aktif.
- **Custom Offer**: Penawaran resmi dalam chat Rate Card.
- **Backend Function**: Trusted backend layer untuk mutasi sensitif.
- **Audit Log**: Catatan aksi sensitif.
- **Payout**: Pencairan dana ke Kreator.
- **Refund**: Pengembalian dana ke UMKM.
- **Campaign Mode**: Mode performance-based tanpa chat.
- **Rate Card Mode**: Mode fixed-price dengan chat dan Custom Offer.
- **Escrow**: Dana ditahan sampai kondisi kerja valid.
- **Submission**: Bukti tayang yang dikirim Kreator.
- **Claim**: Aksi Kreator mengambil campaign aktif.
- **Custom Offer**: Penawaran resmi dalam chat Rate Card.
- **Backend Function**: Trusted backend layer untuk mutasi sensitif.
- **Audit Log**: Catatan aksi sensitif.
- **Payout**: Pencairan dana ke Kreator.
- **Refund**: Pengembalian dana ke UMKM.
- **Campaign Mode**: Mode performance-based tanpa chat.
- **Rate Card Mode**: Mode fixed-price dengan chat dan Custom Offer.
- **Escrow**: Dana ditahan sampai kondisi kerja valid.
- **Submission**: Bukti tayang yang dikirim Kreator.
- **Claim**: Aksi Kreator mengambil campaign aktif.
- **Custom Offer**: Penawaran resmi dalam chat Rate Card.
- **Backend Function**: Trusted backend layer untuk mutasi sensitif.
- **Audit Log**: Catatan aksi sensitif.
- **Payout**: Pencairan dana ke Kreator.
- **Refund**: Pengembalian dana ke UMKM.
- **Campaign Mode**: Mode performance-based tanpa chat.
- **Rate Card Mode**: Mode fixed-price dengan chat dan Custom Offer.
- **Escrow**: Dana ditahan sampai kondisi kerja valid.
- **Submission**: Bukti tayang yang dikirim Kreator.
- **Claim**: Aksi Kreator mengambil campaign aktif.
- **Custom Offer**: Penawaran resmi dalam chat Rate Card.
- **Backend Function**: Trusted backend layer untuk mutasi sensitif.
- **Audit Log**: Catatan aksi sensitif.
- **Payout**: Pencairan dana ke Kreator.
- **Refund**: Pengembalian dana ke UMKM.
