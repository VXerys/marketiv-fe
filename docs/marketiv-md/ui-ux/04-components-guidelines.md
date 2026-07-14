# 04 — Components Guidelines Marketiv

> Dokumen ini mendefinisikan komponen UI utama yang wajib konsisten di seluruh Marketiv.

## 1. Component Philosophy

Komponen Marketiv harus reusable, accessible, dan role-aware.
Komponen tidak boleh mengandung logika bisnis yang berat.
Komponen UI hanya menerima props dan menampilkan state secara jelas.
Komponen harus memakai design token dari Tailwind config.
Komponen tidak boleh hardcode warna hex di file TSX.

## 2. Button

Button adalah elemen aksi paling penting.
Setiap halaman hanya boleh memiliki satu primary action utama.
Button harus memiliki loading state dan disabled state.
Button penting tidak boleh icon-only.

### Button Variants

```txt
Primary   : CTA utama, orange solid
Secondary : CTA sekunder, white + border
Ghost     : aksi ringan, transparent
Danger    : aksi destruktif
Link      : navigasi kecil atau inline action
```

### Button Size

```txt
sm : 36px height
md : 44px height
lg : 48px height
```

### Button Rules

- Primary button memakai bg-primary-500 dan hover bg-primary-600.
- Button mobile untuk aksi utama sebaiknya full-width.
- Button desktop boleh inline.
- Disabled button harus jelas tetapi tetap readable.
- Loading button menampilkan spinner kecil dan teks aksi.

## 3. Input Field

Input harus mudah dibaca dan dipakai di mobile.
Label wajib ada untuk semua field.
Placeholder hanya membantu, bukan pengganti label.
Focus state memakai border atau ring orange.

### Input Structure

```txt
Label
Input control
Helper text atau error text
```

### Input Rules

- Height minimal 44px.
- Font size input minimal 16px di mobile.
- Error text harus spesifik.
- Field uang harus memakai format Rupiah.
- Field URL harus memvalidasi https.
- Field file harus menampilkan batas maksimal 100MB.

## 4. Textarea

Textarea dipakai untuk brief, bio, scope pekerjaan, dan deskripsi paket.
Textarea harus punya character guidance jika ada batas panjang.
Textarea untuk brief harus mendukung AI-generated draft state.

## 5. Select and Filter

Select dipakai untuk role, niche, status, dan sort.
Filter kompleks sebaiknya memakai sheet/drawer di mobile.
Dropdown harus memiliki empty option yang jelas.
Multi-select hanya digunakan jika benar-benar perlu.

## 6. Card

Card adalah container utama di dashboard.
Card memakai background white, border subtle, radius 20–24px, dan shadow halus.
Card tidak boleh terlalu penuh dekorasi.

### Card Types

```txt
Metric Card      : statistik dashboard
Campaign Card    : item campaign/job pool
Creator Card     : profil kreator ringkas
Finance Card     : saldo, escrow, transaksi
Action Card      : modul CTA contextual
Info Card        : panduan atau instruksi
```

## 7. Metric Card

Metric card harus cepat dipindai.
Struktur ideal: label, value, delta/status, icon opsional.
Value harus lebih dominan daripada label.
Delta harus memakai semantic color.

## 8. Campaign Card

Campaign card dipakai pada Job Pool dan daftar campaign UMKM.
Campaign card harus menampilkan judul campaign, niche, bayaran, kuota, status, dan CTA.
Jangan menampilkan chat atau kontak di Campaign Mode.

### Campaign Card Data

- Thumbnail produk atau placeholder.
- Judul campaign.
- Niche badge.
- Harga per 1.000 views.
- Sisa kuota kreator.
- Status campaign.
- CTA sesuai role.

## 9. Creator Card

Creator card dipakai pada direktori kreator.
Creator card harus menampilkan avatar, nama, niche, harga mulai, dan CTA lihat profil.
Social proof boleh ditampilkan jika datanya tersedia.
Jangan menampilkan data palsu hanya untuk mempercantik UI.

## 10. Badge

Badge membantu user memahami status secara cepat.
Badge harus singkat dan konsisten.

### Status Badge

```txt
Draft                : neutral
Aktif                : success
Penuh                : warning
Selesai              : info/success
Dibatalkan           : danger/neutral
Pending              : warning
Valid                : success
Fraud                : danger
Dispute              : danger
Escrow               : primary soft
Menunggu Pembayaran  : warning
```

## 11. Alert and Banner

Alert dipakai untuk warning penting, error, success, dan info.
Banner penting seperti Collab Post warning harus terlihat jelas.
Alert tidak boleh terlalu panjang.
Berikan action jika user perlu melakukan sesuatu.

## 12. Modal

Modal dipakai untuk konfirmasi, custom offer, dan detail cepat.
Modal mobile berubah menjadi bottom sheet jika lebih nyaman.
Aksi destruktif harus memakai confirmation modal.
Modal tidak boleh dipakai untuk form yang terlalu panjang.

## 13. Table

Table dipakai untuk desktop admin, transaksi, laporan, dan daftar campaign kompleks.
Table harus punya header jelas, empty state, loading row, dan pagination.
Di mobile, table berubah menjadi card list.

## 14. Tabs

Tabs dipakai untuk status grouping.
Contoh: Semua, Aktif, Pending, Selesai.
Tabs tidak boleh terlalu banyak; maksimal 5 item utama.
Gunakan horizontal scroll di mobile jika perlu.

## 15. Stepper / Wizard

Wizard wajib dipakai untuk pembuatan campaign.
Setiap step harus fokus pada satu kategori input.
Stepper menampilkan progress user.
Button back dan next harus jelas.
Review step wajib muncul sebelum pembayaran.

## 16. Empty State

Empty state harus menjelaskan kondisi dan next action.
Contoh buruk: `Tidak ada data`.
Contoh baik: `Belum ada campaign aktif. Buat campaign pertama untuk mulai mencari kreator.`

## 17. Skeleton Loading

Skeleton dipakai untuk card, table row, dan profile content.
Skeleton harus menyerupai layout sebenarnya.
Jangan gunakan spinner full-page kecuali untuk initial auth check.

## 18. Toast / Snackbar

Toast dipakai untuk feedback singkat.
Toast sukses maksimal 1 kalimat.
Toast error harus actionable jika memungkinkan.
Jangan menampilkan toast untuk informasi yang harus dibaca lama.

## 19. Avatar

Avatar dipakai untuk kreator, UMKM, dan admin.
Jika foto tidak tersedia, gunakan initials.
Avatar harus memiliki fallback warna netral.
Jangan memakai random avatar dari internet untuk data produksi.

## 20. Progress

Progress dipakai untuk kuota campaign, budget usage, dan wizard step.
Progress harus punya label angka agar tidak ambigu.
Contoh: `3 dari 5 kreator sudah klaim`.

## 21. Component Accessibility

Semua button harus bisa difokuskan dengan keyboard.
Semua input harus terhubung ke label.
Color tidak boleh menjadi satu-satunya indikator status.
Gunakan aria-label untuk icon button yang benar-benar dibutuhkan.
Kontras teks harus cukup pada light background.

## 22. Implementation Priority

Bangun Button, Input, Card, Badge, Alert, Tabs, Table, Modal, Stepper, dan EmptyState terlebih dahulu.
Setelah komponen dasar stabil, lanjutkan ke komponen domain seperti CampaignCard, CreatorCard, FinanceSummaryCard, dan CustomOfferBubble.
