# 03 — Layout System Marketiv

> Dokumen ini mendefinisikan struktur layout utama untuk dashboard, landing page, dan halaman publik Marketiv.

## 1. Layout Philosophy

Marketiv memakai layout mobile-first dengan scaling ke desktop.
Layout harus membantu user memahami prioritas halaman secara cepat.
Setiap halaman wajib punya struktur: header, context, primary content, dan action area.
Dashboard tidak boleh terasa seperti landing page.
Landing page boleh lebih ekspresif, tetapi tetap mengikuti token visual Marketiv.

## 2. Global Page Container

Gunakan container responsif untuk membatasi lebar konten.
Dashboard desktop boleh memakai full width dengan max content agar table tetap nyaman.
Landing page harus memakai max-width agar hero dan section readable.

```tsx
<main className="min-h-screen bg-background-base text-text-primary">
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
    {children}
  </div>
</main>
```

## 3. Mobile-First Rules

- Desain mulai dari viewport 375px.
- Touch target minimal 44px.
- Input field minimal 44px, ideal 48px.
- Jangan memakai table horizontal kompleks di mobile tanpa fallback card list.
- CTA utama harus mudah dijangkau jempol.
- Form panjang harus dipecah menjadi wizard.
- Sidebar desktop berubah menjadi bottom navigation atau drawer di mobile.
- Header mobile harus ringkas.
- Jangan membuat card berisi terlalu banyak data di mobile.
- Empty state harus memberi langkah berikutnya.

## 4. Desktop Dashboard Shell

Dashboard desktop menggunakan shell dengan sidebar kiri dan topbar.
Sidebar berisi navigasi role-based.
Topbar berisi title halaman, search opsional, notification, dan user menu.
Content area memakai background warm off-white.

```txt
┌──────────────────────────────────────────────┐
│ Sidebar │ Topbar                             │
│         ├────────────────────────────────────│
│         │ Page Header                        │
│         │ Metric Cards                       │
│         │ Main Content                       │
│         │ Table / List / Forms               │
└──────────────────────────────────────────────┘
```

## 5. Mobile Dashboard Shell

Dashboard mobile memakai topbar ringkas dan bottom navigation.
Navigation penting harus role-based.
Content dimulai tepat setelah topbar.
Bottom nav tidak boleh menutupi CTA utama.
Gunakan padding-bottom ekstra jika ada sticky CTA.

```txt
┌──────────────────────┐
│ Topbar               │
├──────────────────────┤
│ Page Content         │
│ Cards / Forms        │
│ Lists                │
├──────────────────────┤
│ Bottom Navigation    │
└──────────────────────┘
```

## 6. Sidebar Rules

Sidebar desktop memiliki width 260px sampai 280px.
Logo ditempatkan di bagian atas.
Menu dikelompokkan berdasarkan modul.
Active item memakai background primary soft dan text primary strong.
Menu yang tidak relevan dengan role tidak boleh dirender.
Campaign Mode tidak boleh menampilkan menu chat.
Rate Card Mode boleh menampilkan menu negosiasi/chat.

## 7. Topbar Rules

Topbar harus ringan dan tidak mengambil terlalu banyak vertical space.
Topbar desktop ideal 72px.
Topbar mobile ideal 56px sampai 64px.
Topbar memuat page title di mobile jika sidebar tidak terlihat.
Search hanya muncul jika halaman memang searchable.
Notification boleh ada tetapi tidak menjadi fokus MVP awal.

## 8. Page Header Pattern

Setiap halaman dashboard memiliki page header yang konsisten.
Page header memuat title, description singkat, dan CTA utama jika ada.
CTA utama ditempatkan kanan di desktop dan full-width/sticky di mobile jika penting.

```tsx
<section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div>
    <h1 className="text-2xl font-bold text-text-primary">Judul Halaman</h1>
    <p className="mt-1 text-sm text-text-secondary">Deskripsi singkat halaman.</p>
  </div>
  <Button>Buat Campaign Baru</Button>
</section>
```

## 9. Dashboard Grid

Gunakan grid 12 kolom di desktop.
Gunakan 6 kolom di tablet.
Gunakan 1 kolom di mobile.
Metric card biasanya 3–4 kolom di desktop.
Chart dan table boleh span lebih besar.

```txt
Desktop: 12 columns, gap 24px
Tablet : 6 columns, gap 20px
Mobile : 1 column, gap 16px
```

## 10. Card Layout Rules

Card harus memiliki padding 16px di mobile dan 20–24px di desktop.
Card tidak boleh penuh warna solid kecuali alert atau CTA module.
Card metric harus memiliki title, value, delta/status, dan optional icon.
Card campaign harus memiliki title, badge, price/views metric, quota, dan CTA.
Card kreator harus memiliki avatar, niche, price, social proof, dan CTA.

## 11. List vs Table Rules

Gunakan table untuk desktop data yang banyak.
Gunakan card list untuk mobile.
Jangan memaksa table 8 kolom di layar 375px.
Untuk mobile, tampilkan hanya data terpenting dan pindahkan detail ke halaman detail.

## 12. Form Layout Rules

Form campaign harus wizard multi-step.
Form rate card boleh satu halaman jika field sedikit.
Form withdrawal harus jelas dan trust-oriented.
Setiap field harus punya label eksplisit.
Helper text wajib untuk field yang rawan salah.
Error text harus muncul dekat field terkait.

## 13. Sticky Action Pattern

Gunakan sticky bottom action untuk mobile pada flow penting.
Contoh: Bayar Sekarang, Klaim Job Ini, Submit Bukti Tayang, Terima Penawaran.
Sticky action harus berada dalam Safe Area.
Jangan gunakan lebih dari satu primary CTA sticky.

## 14. Empty State Layout

Empty state harus berada di card atau panel yang jelas.
Gunakan icon sederhana, title pendek, deskripsi, dan CTA jika relevan.
Empty state tidak boleh hanya menampilkan teks `Data kosong`.

## 15. Loading Layout

Gunakan skeleton untuk metric card, table row, dan campaign card.
Gunakan spinner hanya untuk aksi kecil seperti button submit.
Jangan blank page saat data loading.
Dashboard home harus tetap menunjukkan struktur saat loading.

## 16. Error Layout

Error page harus actionable.
Tampilkan penyebab singkat dan tombol coba lagi.
Untuk error permission, tampilkan pesan role-based yang jelas.
Untuk error pembayaran, arahkan user ke halaman keuangan atau retry payment.

## 17. Landing Page Layout

Landing page memakai section vertical dengan spacing besar.
Hero harus punya headline, subheadline, CTA, dan preview dashboard/campaign.
Section setelah hero harus menjelaskan masalah UMKM dan kreator.
Mode Campaign dan Rate Card harus dijelaskan sebagai dua jalur berbeda.
Escrow trust section harus muncul sebelum CTA akhir.

## 18. Admin Layout

Admin layout boleh lebih dense tetapi tetap readable.
Filter harus berada di atas table.
Bulk action harus jelas dan tidak rawan salah klik.
Export button ditempatkan di kanan atas section report.
Dispute detail harus menampilkan timeline dan action admin.

## 19. Implementation Priority

Urutan implementasi layout: dashboard shell, page header, metric grid, card list, form wizard, table, modal, empty state.
Jangan mulai dari visual landing page sebelum dashboard core stabil.
Setiap layout baru harus dites di mobile dan desktop.
