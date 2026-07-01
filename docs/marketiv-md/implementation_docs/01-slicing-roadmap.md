# 01 — Slicing Roadmap Marketiv

> Dokumen ini adalah roadmap implementasi UI slicing Marketiv setelah dokumentasi utama selesai.
> Gunakan dokumen ini untuk menentukan urutan kerja, batas scope, dependency, dan acceptance criteria setiap batch.

---

## 1. Tujuan Dokumen

Dokumen ini memastikan proses slicing UI/UX Marketiv berjalan terarah dan tidak melompat-lompat.
Roadmap ini dibuat untuk membantu tim Frontend, UI/UX, Backend, QA, dan AI coding assistant memahami prioritas implementasi.
Fokus utama saat ini adalah dashboard dan fitur inti, bukan polishing landing page.
Landing page tetap penting, tetapi diposisikan setelah foundation dashboard stabil.
Semua slicing harus mengikuti dokumen UI/UX, Features, Database, dan Technical Guidelines yang sudah dibuat.
Roadmap ini tidak menggantikan dokumen fitur.
Roadmap ini menjelaskan urutan eksekusi slicing dari sudut pandang frontend.
Setiap batch harus selesai dengan hasil yang bisa diuji secara visual dan fungsional.
Setiap batch harus menjaga konsistensi design tokens, route map, component inventory, dan rules AI.
Setiap batch harus mempertimbangkan apakah data masih mock atau sudah tersambung ke Appwrite.
Setiap batch harus punya definisi selesai yang eksplisit.

---

## 2. Prinsip Eksekusi Slicing

1. Foundation selalu dikerjakan sebelum halaman fitur.
2. Reusable component dibuat sebelum page-specific component.
3. Dashboard shell dibuat sebelum dashboard content.
4. Route final ditetapkan sebelum membuat banyak halaman.
5. Design token migration harus selesai sebelum visual redesign masif.
6. UI state wajib tersedia: loading, empty, error, success.
7. Semua copy UI harus Bahasa Indonesia yang jelas.
8. Semua komponen penting harus responsive dari viewport 375px.
9. Jangan menambah dependency UI baru tanpa alasan kuat.
10. Jangan membuat business logic sensitif di komponen presentational.
11. Jangan membuat chat untuk Campaign Mode.
12. Jangan membuat mutation payment, wallet, quota, validation, atau dispute di frontend langsung.
13. Semua warna harus memakai token dari `globals.css`.
14. Semua static text utama harus masuk `src/data/content.ts` atau file content terstruktur.
15. Semua dummy data harus berada di `src/data/`.
16. Semua tipe domain harus berada di `src/types/`.
17. Semua komponen reusable harus berada di `src/components/ui/`.
18. Semua komponen layout harus berada di `src/components/layouts/`.
19. Semua komponen fitur harus berada di `src/components/features/<feature-name>/`.
20. Semua halaman harus mengikuti App Router convention.

---

## 3. Status Proyek Saat Roadmap Ini Dibuat

Repo sudah menggunakan Next.js App Router, React, TypeScript, dan Tailwind CSS v4.
Struktur saat ini masih sederhana dan dashboard belum final.
Halaman `/umkm` dan `/creator` masih memakai komponen dashboard yang sama.
Komponen campaign card masih memakai beberapa warna hardcoded.
Design direction baru adalah light mode dengan primary orange, secondary navy, dan warm background.
Backend direction terbaru adalah Appwrite, bukan Supabase.
Docs utama sudah tersedia di `docs/marketiv-md/`.
Slicing harus mengacu pada docs baru, bukan README lama yang mungkin masih dalam proses update.
Step lain seperti README, agent context, dan token migration bisa dikerjakan paralel oleh tim lain.
Roadmap ini fokus pada sequencing slicing agar tim tidak membangun UI secara acak.

---

## 4. Batch 0 — Repository Alignment Check

### 4.1 Tujuan

Batch ini memastikan repo siap menerima slicing besar tanpa konflik konsep.
Batch ini boleh dikerjakan paralel dengan perbaikan README dan agent rules.
Batch ini harus selesai sebelum halaman dashboard final dibuat.
Batch ini bukan batch visual utama.
Batch ini adalah batch sinkronisasi.

### 4.2 Scope

- Pastikan folder `docs/marketiv-md/implementation/` tersedia.
- Pastikan design token direction sudah disepakati.
- Pastikan route final dashboard sudah disepakati.
- Pastikan component inventory sudah dibuat.
- Pastikan AI working guide tersedia.
- Pastikan semua engineer tahu bahwa Appwrite adalah backend target.
- Pastikan Campaign Mode tetap zero-chat.
- Pastikan Rate Card Mode tetap chat-enabled.

### 4.3 Deliverables

- `01-slicing-roadmap.md`
- `02-route-map.md`
- `03-component-inventory.md`
- `04-design-token-migration.md`
- `05-ai-vscode-working-guide.md`

### 4.4 Acceptance Criteria

- Semua dokumen implementation memiliki line count minimal 120 line.
- Semua dokumen menggunakan istilah Appwrite, bukan Supabase.
- Semua dokumen menyebut dependency ke docs utama.
- Semua dokumen bisa dipakai sebagai referensi AI di VS Code.
- Tidak ada instruksi yang bertabrakan dengan Campaign Mode zero-chat.

---

## 5. Batch 1 — Foundation UI System

### 5.1 Tujuan

Batch ini membangun fondasi UI agar seluruh halaman berikutnya konsisten.
Tanpa batch ini, halaman dashboard akan cenderung memiliki style campuran.
Batch ini harus diprioritaskan sebelum membuat halaman fitur yang kompleks.

### 5.2 Scope Utama

- Migrasi design tokens ke orange, navy, warm background, neutral surface.
- Review font decision: tetap Poppins atau migrasi ke Plus Jakarta Sans.
- Buat atau rapikan base UI components.
- Buat dashboard layout primitives.
- Buat semantic status badge.
- Buat loading, empty, error state primitives.
- Buat utility formatter untuk currency, date, percentage, compact number.
- Pastikan semua styling memakai Tailwind v4 token.

### 5.3 Komponen yang Dibuat atau Dirapikan

- `Button`
- `Card`
- `Input`
- `Textarea`
- `Select`
- `Badge`
- `StatusBadge`
- `MetricCard`
- `EmptyState`
- `ErrorState`
- `Skeleton`
- `PageHeader`
- `SectionHeader`
- `DashboardShell`
- `DashboardSidebar`
- `DashboardTopbar`
- `MobileBottomNav`

### 5.4 Data dan Type Support

- `src/types/status.ts`
- `src/types/navigation.ts`
- `src/types/dashboard.ts`
- `src/data/navigation.ts`
- `src/data/status.ts`
- `src/data/content.ts` updates
- `src/lib/formatters.ts`

### 5.5 Acceptance Criteria

- Semua komponen foundation menggunakan named export.
- Semua props memiliki interface eksplisit.
- Tidak ada warna hardcoded pada komponen baru.
- Semua interactive element minimal 44px pada mobile.
- Semua komponen punya responsive behavior.
- Semua visual state punya token: default, hover, focus, disabled.
- Semua komponen bisa dipakai ulang oleh dashboard UMKM dan Kreator.

---

## 6. Batch 2 — Dashboard Shell dan Navigation

### 6.1 Tujuan

Batch ini membangun kerangka dashboard untuk role UMKM, Kreator, dan Admin.
Shell harus konsisten tetapi navigation item berbeda per role.
Dashboard shell harus menjadi fondasi semua route `/dashboard/*` dan `/admin/*`.

### 6.2 Scope

- Buat layout dashboard responsive.
- Buat sidebar desktop.
- Buat topbar dengan page title, notification, profile menu.
- Buat mobile navigation.
- Buat protected layout placeholder.
- Buat role-based navigation config.
- Siapkan active route indicator.
- Siapkan collapsed state untuk sidebar jika diperlukan.

### 6.3 Routes Target

- `/dashboard/umkm`
- `/dashboard/kreator`
- `/admin`

### 6.4 Acceptance Criteria

- Dashboard shell tidak bergantung pada data backend.
- Navigation config tidak hardcoded di JSX page.
- Sidebar tetap readable pada desktop.
- Mobile layout tidak memotong CTA utama.
- Topbar tidak menutupi content.
- Route active state bekerja berdasarkan pathname.
- Admin navigation terpisah dari UMKM/Kreator navigation.

---

## 7. Batch 3 — UMKM Dashboard Overview

### 7.1 Tujuan

Batch ini membuat dashboard utama UMKM yang jelas, aman, dan mudah dipahami.
Target user UMKM mungkin tidak teknis, sehingga UI harus menghindari jargon berlebihan.
Dashboard harus menampilkan status bisnis dan campaign secara ringkas.

### 7.2 Scope

- Welcome section.
- CTA utama `Buat Campaign Baru`.
- Metric cards: campaign aktif, budget escrow, submission pending, estimasi views.
- Campaign list preview.
- Recent activity preview.
- Payment status preview.
- Empty state jika belum ada campaign.
- Skeleton state.

### 7.3 UI Rules

- Satu primary CTA jelas.
- Copy sederhana dan actionable.
- Status menggunakan badge konsisten.
- Currency diformat Rupiah.
- Data mock harus realistis dan sesuai domain Marketiv.
- Tidak ada tombol klaim campaign di dashboard UMKM.
- Tidak ada UI chat Campaign Mode.

### 7.4 Acceptance Criteria

- UMKM dashboard bisa dipahami tanpa penjelasan tambahan.
- Semua card responsive di mobile 375px.
- Empty state mendorong user membuat campaign pertama.
- Tidak ada komponen Kreator yang bocor ke dashboard UMKM.
- Tidak ada mutation data sensitif dari frontend.

---

## 8. Batch 4 — Kreator Dashboard Overview

### 8.1 Tujuan

Batch ini membuat dashboard utama Kreator yang berfokus pada peluang kerja, penghasilan, dan status submission.
UI boleh lebih dinamis daripada UMKM, tetapi tetap bersih dan readable.

### 8.2 Scope

- Welcome section.
- CTA `Lihat Job Pool`.
- CTA `Kelola Rate Card`.
- Metric cards: saldo tersedia, pekerjaan aktif, submission pending, order aktif.
- Job Pool preview.
- Active job preview.
- Payout status preview.
- Empty state jika kreator belum klaim pekerjaan.

### 8.3 UI Rules

- Kreator tidak boleh melihat tombol buat campaign.
- Kreator boleh melihat campaign aktif di Job Pool.
- Kreator boleh melihat status klaim dan submission miliknya.
- Saldo hanya ditampilkan, tidak dimutasi dari UI.
- Withdrawal action harus disiapkan sebagai CTA tetapi operasi backend-only.

### 8.4 Acceptance Criteria

- Dashboard menunjukkan peluang kerja dengan jelas.
- Status submission readable.
- Payout information tidak misleading.
- Tidak ada form finansial yang langsung mengubah saldo.
- Tidak ada state UMKM yang bocor ke dashboard Kreator.

---

## 9. Batch 5 — Campaign Mode Slicing

### 9.1 Tujuan

Batch ini memecah Campaign Mode menjadi UI yang lengkap untuk UMKM dan Kreator.
Campaign Mode adalah flow performance-based dan zero-chat.

### 9.2 Scope UMKM

- Campaign list.
- Campaign detail.
- Campaign creation wizard.
- Step product information.
- Step brief and AI assistant placeholder.
- Step asset external URL or lightweight file.
- Step budget and quota.
- Step review and payment.
- Campaign status cards.

### 9.3 Scope Kreator

- Job Pool page.
- Job Pool filter and search.
- Campaign detail for claim.
- Claim confirmation modal.
- Active job list.
- Active job detail.
- Submit proof URL form.

### 9.4 Hard Restrictions

- No chat button.
- No WhatsApp link.
- No email link.
- No contact owner button.
- No comment section.
- No direct creator-to-UMKM communication.
- No final video upload to Marketiv.

### 9.5 Acceptance Criteria

- Semua CTA sesuai role.
- Claim button disabled jika kuota penuh.
- Submit proof hanya menerima URL TikTok/Instagram secara konsep UI.
- Wizard punya progress indicator.
- Payment step tidak menandai sukses secara frontend.
- Semua status mengikuti lifecycle docs.

---

## 10. Batch 6 — Rate Card Mode Slicing

### 10.1 Tujuan

Batch ini membuat flow premium fixed-price dengan direktori kreator, profil kreator, chat, dan custom offer.
Berbeda dengan Campaign Mode, Rate Card Mode wajib menyediakan chat.

### 10.2 Scope

- Creator directory.
- Creator card.
- Creator profile.
- Rate card package list.
- Start chat CTA.
- Negotiation list.
- Chat room UI.
- Custom offer bubble.
- Accept/reject offer UI.
- Order payment status.
- Collab post submission UI.

### 10.3 UI Rules

- Chat hanya untuk Rate Card Mode.
- Custom offer dikirim oleh UMKM.
- Custom offer diterima atau ditolak oleh Kreator.
- Harga final dan scope terkunci setelah offer diterima.
- Collab Post warning harus tampil pada flow order.

### 10.4 Acceptance Criteria

- Chat UI tidak bisa dipakai untuk Campaign Mode.
- Custom offer berbeda secara visual dari pesan teks biasa.
- Order status jelas.
- Payment dan escrow status tidak dimutasi frontend.
- UI tetap responsive untuk mobile.

---

## 11. Batch 7 — Finance, Wallet, Admin, and Reporting

### 11.1 Tujuan

Batch ini menyelesaikan UI finansial, admin validation, dispute, dan laporan P2MW.
Batch ini memerlukan koordinasi lebih ketat dengan backend.

### 11.2 Scope Finance

- UMKM transaction history.
- Campaign payment status.
- Kreator wallet summary.
- Withdrawal request UI.
- Payout history.
- Refund status.

### 11.3 Scope Admin

- Admin dashboard metrics.
- Submission validation queue.
- Dispute list.
- User management.
- Transaction monitoring.
- Report export UI.

### 11.4 Acceptance Criteria

- Semua financial UI read-only kecuali form request yang backend-only.
- Admin actions harus confirmation dialog.
- Audit log requirement disebut pada UI workflow.
- Export report UI siap untuk kebutuhan P2MW.
- Admin dashboard tidak muncul untuk non-admin role.

---

## 12. Definition of Done Global

Satu batch dianggap selesai jika memenuhi seluruh kriteria berikut.
Semua route dalam batch dapat dibuka tanpa runtime error.
Semua komponen memakai token yang valid.
Semua TypeScript type valid.
`npm run lint` tidak menghasilkan error baru.
Halaman responsive pada mobile 375px, tablet, dan desktop.
Loading state tersedia untuk halaman data-driven.
Empty state tersedia untuk list kosong.
Error state tersedia untuk kegagalan load data.
CTA utama jelas.
Forbidden role action tidak dirender.
Campaign Mode tidak punya chat.
Financial mutation tidak dilakukan langsung dari frontend.
Semua copy UI memakai Bahasa Indonesia.
Semua mock data realistis dan berada di `src/data/`.
Semua komponen mengikuti named export.
Tidak ada dependency baru tanpa approval.

---

## 13. Catatan untuk AI Coding Assistant

Baca dokumen ini sebelum membuat halaman baru.
Ikuti batch aktif yang diberikan oleh user.
Jangan mengerjakan batch berikutnya tanpa instruksi.
Jangan membuat route di luar route map final.
Jangan membuat komponen baru jika component inventory sudah menyediakan komponen yang sesuai.
Jangan mengubah design token tanpa membaca dokumen design token migration.
Jangan mengubah agent rules, README, atau config kecuali diminta.
Jangan melakukan refactor besar dengan alasan best practice.
Tampilkan daftar file yang akan dibuat atau diubah sebelum menghasilkan kode jika prompt meminta plan.
Gunakan full file output hanya jika user meminta.
Gunakan minimal diff jika user meminta fix spesifik.
