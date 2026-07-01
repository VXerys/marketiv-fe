# Requirements Document

## Introduction

Dokumen ini mendefinisikan requirement untuk migrasi UI dari prototype React + Vite (UI Kits) ke production codebase marketiv-web berbasis Next.js 16. Migrasi mencakup adopsi shadcn/ui component library dengan Radix UI primitives, integrasi library pendukung (Recharts, Motion, Sonner, dll.), konversi page/route dari react-router ke Next.js App Router, serta adaptasi seluruh komponen agar sesuai dengan Marketiv Studio System v5.8 design tokens. Proses migrasi harus mempertahankan route structure yang sudah ada, menjaga kompatibilitas React 19, dan memastikan "use client" boundaries yang benar.

## Glossary

- **Migration_System**: Sistem keseluruhan yang menangani proses migrasi UI kit ke marketiv-web
- **Component_Library**: Kumpulan shadcn/ui components yang diadaptasi dengan Marketiv design tokens
- **Design_Token_Layer**: Layer CSS variables yang mendefinisikan warna, radius, shadow, dan typography Marketiv Studio System v5.8
- **Route_Adapter**: Pola konversi dari react-router pages ke Next.js App Router file-based routing
- **Dependency_Manager**: Sistem yang mengelola instalasi dan konfigurasi package dependencies baru
- **Theme_Provider**: Komponen yang menyediakan design tokens ke seluruh component tree
- **Primitive_Mapper**: Proses yang memetakan existing custom dashboard primitives ke shadcn equivalents
- **Page_Migrator**: Sistem yang mengkonversi page components dari prototype ke Next.js compatible pages
- **Client_Boundary**: Directive "use client" yang menandai komponen sebagai Client Component di Next.js

## Requirements

### Requirement 1: Instalasi dan Konfigurasi Dependencies

**User Story:** Sebagai developer, saya ingin semua library dependencies dari UI Kit prototype terinstal dan terkonfigurasi di marketiv-web, sehingga seluruh komponen yang dimigrasikan dapat berfungsi dengan benar.

#### Acceptance Criteria

1. WHEN migrasi dimulai, THE Dependency_Manager SHALL menginstal Radix UI packages berikut dengan versi minimum yang sesuai dari UI Kit prototype: @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-tabs, @radix-ui/react-select, @radix-ui/react-popover, @radix-ui/react-accordion, @radix-ui/react-checkbox, @radix-ui/react-switch, @radix-ui/react-tooltip, @radix-ui/react-alert-dialog, @radix-ui/react-aspect-ratio, @radix-ui/react-avatar, @radix-ui/react-collapsible, @radix-ui/react-context-menu, @radix-ui/react-hover-card, @radix-ui/react-label, @radix-ui/react-menubar, @radix-ui/react-navigation-menu, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-separator, @radix-ui/react-slider, @radix-ui/react-slot, @radix-ui/react-toggle-group, @radix-ui/react-toggle
2. WHEN migrasi dimulai, THE Dependency_Manager SHALL menginstal utility libraries berikut dengan versi minimum yang sesuai dari UI Kit prototype: recharts, motion, sonner, vaul, lucide-react, cmdk, embla-carousel-react, date-fns, react-dnd, react-dnd-html5-backend, input-otp, react-day-picker, react-resizable-panels, tw-animate-css
3. THE Dependency_Manager SHALL mempertahankan dependencies yang sudah ada tanpa mengubah versi atau menghapusnya: @phosphor-icons/react, react-hook-form, @hookform/resolvers, zod, class-variance-authority, clsx, tailwind-merge, appwrite
4. IF suatu package memiliki peer dependency conflict dengan React 19 atau Next.js 16, THEN THE Dependency_Manager SHALL menggunakan versi terbaru dari package tersebut yang mendukung React 19, atau menerapkan --legacy-peer-deps flag saat instalasi, dan mendokumentasikan package yang terdampak dalam catatan migrasi
5. WHEN seluruh dependencies telah diinstal, THE Dependency_Manager SHALL memverifikasi keberhasilan instalasi dengan menjalankan `next build` tanpa error terkait dependency resolution, import resolution, atau type incompatibility
6. THE Dependency_Manager SHALL menginstal setiap package menggunakan caret range (^) berdasarkan versi yang tercantum di UI Kit prototype package.json, sehingga versi yang terinstal dapat direproduksi secara konsisten melalui lockfile

### Requirement 2: Adaptasi Design Token Layer

**User Story:** Sebagai developer, saya ingin CSS variables shadcn/ui di-override dengan Marketiv Studio System v5.8 design tokens, sehingga seluruh komponen tampil sesuai identitas visual Marketiv.

#### Acceptance Criteria

1. THE Design_Token_Layer SHALL mendefinisikan CSS variables dengan nilai berikut: --background: #fbf7ef (warm cream/paper), --primary: #f97316 (orange), --primary-foreground: #ffffff
2. THE Design_Token_Layer SHALL mendefinisikan navy emphasis colors: --navy-900: #0c172b, --navy-800: #12213a, --navy-700: #1e3a5f
3. THE Design_Token_Layer SHALL mendefinisikan radius tokens sesuai Marketiv Studio System: --radius-1: 12px, --radius-2: 18px, --radius-3: 26px, --radius-4: 36px
4. THE Design_Token_Layer SHALL mendefinisikan shadow tokens dengan nilai berikut: --shadow-1: 0 8px 24px rgba(15, 23, 42, .06), --shadow-2: 0 18px 46px rgba(15, 23, 42, .10), --shadow-3: 0 32px 90px rgba(15, 23, 42, .16), --orange-glow: 0 20px 60px rgba(249, 115, 22, .22)
5. THE Design_Token_Layer SHALL mengonfigurasi font-family utama sebagai "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, dengan heading font "Sora", "Plus Jakarta Sans", sans-serif
6. THE Design_Token_Layer SHALL memetakan shadcn CSS variables ke Marketiv equivalents berikut: --card: #fffdf8, --popover: #fffdf8, --muted: #f3f5f8, --accent: #fff7ed, --border: rgba(17, 24, 39, .10), --ring: #f97316, --destructive: #dc2626
7. WHILE dark mode tidak menjadi prioritas, THE Design_Token_Layer SHALL menyediakan dark mode class scope (.dark) yang menduplikasi seluruh light mode variables sebagai placeholder, sehingga switching ke dark mode tidak menyebabkan undefined variable errors

### Requirement 3: Migrasi shadcn/ui Component Library

**User Story:** Sebagai developer, saya ingin memiliki full set shadcn/ui components yang sudah diadaptasi ke Marketiv design system, sehingga saya dapat membangun UI secara konsisten dan cepat.

#### Acceptance Criteria

1. THE Component_Library SHALL menyediakan seluruh 48 komponen shadcn/ui berikut di direktori `src/components/ui/` dengan penamaan file kebab-case (contoh: `alert-dialog.tsx`, `dropdown-menu.tsx`, `toggle-group.tsx`): Accordion, AlertDialog, Alert, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, InputOTP, Input, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, ToggleGroup, Toggle, Tooltip, useMobile hook, dan utils
2. WHEN sebuah komponen shadcn/ui dimigrasikan, THE Component_Library SHALL menerapkan CSS variables dari Design_Token_Layer (sebagaimana didefinisikan di Requirement 2) menggantikan default shadcn gray/neutral theme, sehingga komponen menggunakan var(--background), var(--primary), var(--radius-1) hingga var(--radius-4), dan var(--shadow-1) hingga var(--shadow-3) sesuai konteks komponen
3. THE Component_Library SHALL menambahkan "use client" directive pada baris pertama setiap file komponen yang menggunakan React hooks (useState, useEffect, useRef, useCallback, useMemo), event handlers (onClick, onChange, onSubmit), atau browser APIs (window, document, localStorage)
4. THE Component_Library SHALL memastikan setiap komponen kompatibel dengan React 19: menghapus forwardRef pattern pada komponen yang tidak mengekspos ref ke parent (contoh: komponen wrapper seperti Card, Badge, Alert), dan mempertahankan ref forwarding hanya pada komponen input/interactive yang memerlukan imperative access dari parent (contoh: Input, Textarea, Select, Dialog trigger)
5. IF sebuah existing component di `src/components/ui/` sudah ada (badge.tsx, Button.tsx, card.tsx, input.tsx, skeleton.tsx, textarea.tsx), THEN THE Component_Library SHALL menggantikannya dengan versi shadcn/ui yang sudah diadaptasi ke Marketiv tokens, dengan mempertahankan prop interface yang sama atau superset dari versi sebelumnya agar consumer yang ada tidak break
6. THE Component_Library SHALL mengekspor setiap komponen menggunakan named exports dengan format PascalCase yang sesuai nama komponen (contoh: `export { Button }`, `export { AlertDialog, AlertDialogTrigger, AlertDialogContent }`) tanpa default exports
7. THE Component_Library SHALL memastikan seluruh file komponen lolos TypeScript compilation (`tsc --noEmit`) tanpa error setelah migrasi
8. IF sebuah komponen shadcn/ui memiliki sub-components (contoh: Dialog memiliki DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter), THEN THE Component_Library SHALL mengekspor seluruh sub-components sebagai named exports dari file yang sama

### Requirement 4: Pemetaan Custom Primitives ke shadcn Equivalents

**User Story:** Sebagai developer, saya ingin custom dashboard primitives yang ada dipetakan ke shadcn/ui equivalents, sehingga codebase menjadi lebih konsisten dan maintainable.

#### Acceptance Criteria

1. WHEN migrasi selesai, THE Primitive_Mapper SHALL menggantikan internal implementation DashboardCard dengan shadcn Card (Card, CardHeader, CardContent, CardFooter) sambil mempertahankan seluruh 6 variant yang ada (default, soft, elevated, featured, dark, danger) dan 4 padding option (none, sm, md, lg) melalui className overrides pada shadcn Card
2. WHEN migrasi selesai, THE Primitive_Mapper SHALL memetakan DashboardButton ke shadcn Button component dengan pemetaan variant sebagai berikut: primary→primary, secondary→secondary, outline→outline, ghost→ghost, soft→soft, danger→danger, danger-outline→danger, icon→size icon
3. WHEN migrasi selesai, THE Primitive_Mapper SHALL memetakan DashboardBadge ke shadcn Badge component dengan pemetaan tone-ke-variant: green→success, amber→warning, red→danger, blue→info, neutral→neutral, orange→default, purple→default, slate→neutral, serta mempertahankan logic getDashboardStatusTone dan getDashboardCategoryTone sebagai helper functions
4. WHEN migrasi selesai, THE Primitive_Mapper SHALL memetakan DashboardModal ke shadcn Dialog component dengan mempertahankan props isOpen, title, description, footer, confirmLabel, cancelLabel, onConfirm, onClose, dan variant (default/danger)
5. WHEN migrasi selesai, THE Primitive_Mapper SHALL memetakan DashboardActionMenu ke shadcn DropdownMenu component dengan mempertahankan interface ActionMenuItem (label, icon, onClick, disabled, tone)
6. WHEN migrasi selesai, THE Primitive_Mapper SHALL memetakan DashboardProgress ke shadcn Progress component dengan mempertahankan 5 tone options (orange, green, yellow, red, blue), label, valueLabel, dan kalkulasi percentage dari value/max
7. THE Primitive_Mapper SHALL mempertahankan DashboardMetricCard, DashboardStateCard, MarketplaceCard, dan ResponsiveDataRow sebagai higher-level composed components yang menggunakan shadcn primitives di dalamnya tanpa mengubah public props interface mereka
8. THE Primitive_Mapper SHALL menyediakan backward-compatible re-exports dari nama primitives lama (DashboardCard, DashboardButton, DashboardBadge, DashboardModal, DashboardActionMenu, DashboardProgress) di file index.ts dengan deprecation notice berupa JSDoc @deprecated tag pada setiap re-export
9. IF shadcn target component (Dialog, DropdownMenu, atau Progress) belum tersedia di src/components/ui pada saat migrasi dimulai, THEN THE Primitive_Mapper SHALL menambahkan component tersebut terlebih dahulu sebelum melakukan pemetaan

### Requirement 5: Migrasi Halaman Dashboard UMKM

**User Story:** Sebagai UMKM user, saya ingin semua halaman dashboard UMKM memiliki UI baru sesuai prototype, sehingga pengalaman pengguna lebih modern dan konsisten.

#### Acceptance Criteria

1. THE Page_Migrator SHALL memigrasikan halaman overview dashboard UMKM di route `/dashboard/umkm` dengan layout, metrics cards, dan summary widgets sesuai prototype, menggunakan shadcn Card dan komponen dari Component_Library
2. THE Page_Migrator SHALL memigrasikan halaman campaign list di route `/dashboard/umkm/campaign` dengan tabel/grid kampanye, filter, dan status badges menggunakan shadcn Table, Badge, dan Input components
3. THE Page_Migrator SHALL memigrasikan halaman campaign create wizard di route `/dashboard/umkm/campaign/buat` dengan multi-step form menggunakan shadcn Form, Tabs, dan Input components
4. THE Page_Migrator SHALL memigrasikan halaman campaign detail di route `/dashboard/umkm/campaign/[campaignId]` dengan detail view, progress tracking, dan action buttons
5. THE Page_Migrator SHALL memigrasikan halaman kreator directory di route `/dashboard/umkm/kreator` dengan card grid, search, dan filter functionality menggunakan shadcn Input untuk search dan Select untuk filter
6. THE Page_Migrator SHALL memigrasikan halaman keuangan di route `/dashboard/umkm/keuangan` dengan financial charts (Recharts), transaction tables, dan summary metrics menggunakan shadcn Chart wrapper dan Table components
7. THE Page_Migrator SHALL memigrasikan halaman analitik di route `/dashboard/umkm/analitik` sebagai route baru dengan minimal 2 chart visualizations dan 1 metrics summary section
8. THE Page_Migrator SHALL memigrasikan halaman pengaturan di route `/dashboard/umkm/pengaturan` sebagai route baru dengan settings form menggunakan shadcn Form, Input, Select, dan Switch components dengan minimal 3 configurable fields
9. WHEN sebuah halaman menggunakan data fetching, THE Page_Migrator SHALL menempatkan fetch logic (async data calls) di Server Component dan interactive UI (components menggunakan useState, useEffect, atau event handlers) di Client Component dengan "use client" directive
10. THE Page_Migrator SHALL mempertahankan integrasi dengan existing data layer (mock data files di `src/data/` dan service functions di `src/services/`) tanpa menggantikannya dengan hardcoded data di dalam page components
11. WHEN halaman yang dimigrasikan memiliki UI elements yang sesuai dengan shared dashboard primitives (DashboardCard, DashboardMetricCard, DashboardBadge, DashboardButton, DashboardProgress), THE Page_Migrator SHALL menggunakan primitives tersebut atau shadcn equivalents yang sudah dimapped sesuai Requirement 4
12. IF route `/dashboard/umkm/analitik` atau `/dashboard/umkm/pengaturan` belum ada, THEN THE Page_Migrator SHALL membuat route baru dengan file `page.tsx` tanpa mengubah route structure existing yang sudah ada

### Requirement 6: Migrasi Halaman Dashboard Creator

**User Story:** Sebagai Creator user, saya ingin semua halaman dashboard Creator memiliki UI baru sesuai prototype, sehingga saya dapat mengakses fitur dengan tampilan yang lebih profesional.

#### Acceptance Criteria

1. THE Page_Migrator SHALL memigrasikan halaman overview kreator di route `/dashboard/kreator` dengan metrics cards (total earnings, active jobs, completed jobs, pending negotiations), recent activity list (maksimum 10 item terbaru), dan quick action buttons yang masing-masing menavigasi ke route terkait
2. THE Page_Migrator SHALL memigrasikan halaman job pool di route `/dashboard/kreator/job-pool` dengan toggle list/grid view, filter berdasarkan kategori dan status, sorting berdasarkan tanggal dan reward, serta menampilkan job cards dengan reward, quota, deadline, dan status
3. THE Page_Migrator SHALL memigrasikan halaman job detail di route `/dashboard/kreator/job-pool/[id]` dengan informasi job meliputi: judul, deskripsi, reward, deadline, quota tersisa, persyaratan, asset links (Google Drive/Dropbox URL), brand info, dan apply action button
4. THE Page_Migrator SHALL memigrasikan halaman pekerjaan aktif di route `/dashboard/kreator/pekerjaan-aktif` dengan active jobs list yang menampilkan progress bar per job (persentase penyelesaian tahap), deadline countdown, dan status badge per pekerjaan
5. THE Page_Migrator SHALL memigrasikan halaman submit bukti di route `/dashboard/kreator/pekerjaan-aktif/[id]` dengan form yang menerima public TikTok/Instagram URL sebagai bukti tayang, preview link yang disubmit, tombol submit, dan confirmation dialog sebelum pengiriman
6. THE Page_Migrator SHALL memigrasikan halaman negosiasi list di route `/dashboard/kreator/negosiasi` dengan negotiation cards yang menampilkan nama brand/UMKM, package yang dinegosiasikan, harga yang ditawarkan, dan status badge (menunggu, diterima, ditolak, expired)
7. THE Page_Migrator SHALL memigrasikan halaman negosiasi room di route `/dashboard/kreator/negosiasi/[id]` dengan message list chronological, form untuk mengirim pesan atau counter-offer (harga dan catatan), tombol terima/tolak offer, dan Collab Post warning indicator
8. THE Page_Migrator SHALL memigrasikan halaman profil di route `/dashboard/kreator/profil` dengan form profil (nama, bio, niche, social media links) menggunakan react-hook-form + Zod validation, dan avatar upload yang menerima format gambar (JPG, PNG, WebP) dengan ukuran maksimum 2MB
9. THE Page_Migrator SHALL memigrasikan halaman rate card di route `/dashboard/kreator/rate-card` dengan tabel pricing yang menampilkan nama paket, deskripsi layanan, harga, dan durasi per service item, serta aksi tambah, edit, dan hapus service item
10. THE Page_Migrator SHALL memigrasikan halaman keuangan kreator di route `/dashboard/kreator/keuangan` dengan earnings summary chart (Recharts dengan Marketiv color palette), withdrawal request form (dummy/simulasi), dan transaction history list dengan filter berdasarkan periode dan tipe transaksi
11. WHEN sebuah halaman kreator menggunakan data fetching, THE Page_Migrator SHALL menempatkan fetch logic di Server Component dan interactive UI di Client Component dengan "use client" directive pada komponen yang menggunakan hooks atau event handlers
12. IF data gagal dimuat pada halaman kreator, THEN THE Page_Migrator SHALL menampilkan error state dengan judul error, deskripsi penyebab, dan retry CTA yang memuat ulang data
13. WHEN halaman kreator tidak memiliki data (list kosong), THE Page_Migrator SHALL menampilkan empty state dengan ilustrasi/ikon, judul deskriptif, dan CTA yang relevan untuk memulai aksi terkait

### Requirement 7: Konversi Layout dan Navigation

**User Story:** Sebagai developer, saya ingin layout dan navigation structure dari prototype dikonversi ke Next.js App Router patterns, sehingga navigasi berfungsi dengan baik di production.

#### Acceptance Criteria

1. THE Route_Adapter SHALL mengkonversi RootLayout (UMKM layout) menjadi Next.js layout.tsx di `/dashboard/umkm/layout.tsx` menggunakan shadcn SidebarProvider dan Sidebar component, dengan sidebar width 16rem (expanded) dan 3rem (collapsed icon mode)
2. THE Route_Adapter SHALL mengkonversi CreatorLayout menjadi Next.js layout.tsx di `/dashboard/kreator/layout.tsx` menggunakan shadcn SidebarProvider dan Sidebar component, dengan sidebar width 16rem (expanded) dan 3rem (collapsed icon mode)
3. THE Route_Adapter SHALL memastikan Sidebar navigation items untuk UMKM layout berisi link ke setiap route yang ada di `/dashboard/umkm/` (campaign, kreator, negosiasi, keuangan), dan untuk Kreator layout berisi link ke setiap route di `/dashboard/kreator/` (job-pool, pekerjaan-aktif, negosiasi, profil, rate-card, keuangan), dengan active state ditentukan oleh pathname match
4. THE Route_Adapter SHALL mengimplementasikan responsive behavior: sidebar collapsible (mode "icon") di viewport >= 768px menggunakan shadcn Sidebar collapsible prop, dan sidebar ditampilkan sebagai shadcn Sheet (side="left") di viewport < 768px menggunakan useIsMobile hook dengan breakpoint 768px
5. THE Route_Adapter SHALL mempertahankan topbar/header yang berisi brand mark (logo dan nama aplikasi), user menu (avatar dengan link ke profil), dan notification indicator (icon bell dengan badge dot untuk notifikasi unread) pada setiap layout
6. WHEN user mengklik navigation link di sidebar atau topbar, THE Route_Adapter SHALL menggunakan Next.js Link component sehingga navigasi terjadi secara client-side tanpa full page reload
7. IF sidebar navigation item href cocok dengan pathname aktif saat ini (exact match untuk root route, startsWith match untuk sub-route), THEN THE Route_Adapter SHALL menampilkan item tersebut dalam visual active state yang berbeda dari item non-aktif

### Requirement 8: Integrasi Icon System

**User Story:** Sebagai developer, saya ingin icon system yang konsisten antara Lucide React (dari prototype) dan Phosphor Icons (existing), sehingga tidak ada visual inconsistency.

#### Acceptance Criteria

1. THE Migration_System SHALL menginstal lucide-react sebagai icon library tambahan di samping @phosphor-icons/react yang sudah ada
2. WHEN sebuah komponen shadcn/ui membutuhkan icon, THE Migration_System SHALL menggunakan Lucide React icons sebagai default
3. THE Migration_System SHALL mempertahankan Phosphor Icons pada komponen-komponen existing yang sudah menggunakannya tanpa melakukan penggantian massal
4. THE Migration_System SHALL mendokumentasikan panduan penggunaan icon di file steering atau README: Lucide untuk shadcn/ui components dan komponen baru, Phosphor untuk legacy/custom components yang sudah ada
5. WHEN icon digunakan sebagai standalone button (tanpa text label), THE Migration_System SHALL memastikan elemen tersebut memiliki aria-label yang deskriptif
6. THE Migration_System SHALL memastikan semua icon yang digunakan memiliki ukuran konsisten: 16px untuk inline/badge, 20px untuk button/nav, 24px untuk header/hero contexts

### Requirement 9: Integrasi Animation dan Motion

**User Story:** Sebagai user, saya ingin UI memiliki animasi halus sesuai prototype, sehingga pengalaman interaksi terasa premium dan responsif.

#### Acceptance Criteria

1. WHEN migrasi dimulai, THE Migration_System SHALL menginstal dan mengonfigurasi motion library (framer-motion successor) untuk page transitions dan component animations, dengan menambahkan "use client" directive pada setiap file yang menggunakan motion APIs
2. WHEN migrasi dimulai, THE Migration_System SHALL menginstal tw-animate-css dan mengimpornya di Tailwind CSS entry file untuk menyediakan utility classes (animate-in, fade-in, slide-in-from-top, zoom-in, animate-out) pada shadcn components
3. WHEN sebuah komponen memiliki animasi di prototype, THE Migration_System SHALL memigrasikan animasi tersebut menggunakan motion library dengan Client_Boundary yang tepat, memastikan animasi memiliki durasi antara 150ms hingga 500ms
4. THE Migration_System SHALL menerapkan default easing curve menggunakan CSS variable --ease: cubic-bezier(.2, .8, .2, 1) yang didefinisikan di globals.css untuk seluruh transition dan animation properties
5. IF sebuah animasi menyebabkan layout shift lebih dari 0.1 CLS atau frame rate di bawah 30fps pada mobile viewport (kurang dari 768px width), THEN THE Migration_System SHALL menyediakan reduced-motion alternative menggunakan prefers-reduced-motion media query yang menghapus transform dan opacity transitions
6. THE Migration_System SHALL membatasi penggunaan motion library hanya untuk page transitions dan complex orchestrated animations, sedangkan micro-interactions (hover, focus, enter/exit pada dialogs dan popovers) SHALL menggunakan tw-animate-css utility classes atau CSS transitions dengan var(--ease)
7. IF prefers-reduced-motion media query bernilai reduce, THEN THE Migration_System SHALL menonaktifkan seluruh motion library animations dan menampilkan komponen dalam final state tanpa animasi transisi

### Requirement 10: Integrasi Data Visualization

**User Story:** Sebagai UMKM/Creator user, saya ingin melihat data analytics dalam bentuk chart yang informatif, sehingga saya dapat memahami performa campaign dan earnings.

#### Acceptance Criteria

1. THE Migration_System SHALL menginstal dan mengonfigurasi Recharts library untuk data visualization, memastikan package tercatat di dependencies pada package.json dan dapat di-import tanpa error
2. THE Migration_System SHALL mengintegrasikan shadcn Chart component wrapper yang menggunakan Recharts di bawahnya, ditempatkan di `src/components/ui/chart.tsx`
3. WHEN halaman analitik atau keuangan membutuhkan chart, THE Migration_System SHALL menggunakan Recharts dengan Marketiv color palette yang didefinisikan sebagai chart theme config: orange-500 sebagai primary, navy-700 sebagai secondary, green-500 sebagai success, blue-500 sebagai info, dan purple-500 sebagai accent
4. THE Migration_System SHALL menambahkan "use client" directive pada semua chart components karena Recharts membutuhkan browser APIs
5. THE Migration_System SHALL memastikan chart components responsive pada viewport mobile (minimum 320px width) dengan menggunakan ResponsiveContainer dari Recharts, minimum chart height 200px, dan memastikan axis labels serta legend tidak terpotong atau saling bertumpuk
6. IF data untuk chart kosong atau belum tersedia, THEN THE Migration_System SHALL menampilkan empty state placeholder yang menginformasikan bahwa belum ada data untuk ditampilkan, menggantikan area chart yang kosong
7. IF data chart gagal dimuat, THEN THE Migration_System SHALL menampilkan pesan error yang menginformasikan kegagalan loading data beserta opsi untuk retry

### Requirement 11: Integrasi Toast dan Notification System

**User Story:** Sebagai user, saya ingin mendapatkan feedback visual (toast notifications) setelah melakukan aksi, sehingga saya tahu status operasi yang dilakukan.

#### Acceptance Criteria

1. THE Migration_System SHALL menginstal Sonner sebagai toast notification library dan menyediakan komponen Toaster wrapper dengan "use client" directive di `src/components/ui/sonner.tsx`
2. THE Migration_System SHALL menempatkan Toaster component di application root layout (`src/app/layout.tsx`) sehingga toast tersedia di seluruh halaman termasuk dashboard UMKM dan Creator
3. WHEN user melakukan aksi yang berhasil (submit form, save changes), THE Migration_System SHALL menampilkan toast success dengan indikator warna hijau (--green: #16a34a) sesuai design system alert.success
4. IF sebuah aksi gagal atau terjadi error, THEN THE Migration_System SHALL menampilkan toast error dengan indikator warna merah (--red: #dc2626) sesuai design system alert.error
5. THE Migration_System SHALL mengonfigurasi Sonner dengan posisi bottom-right, durasi tampil 4 detik, dan maksimum 3 toast ditampilkan secara bersamaan
6. WHEN migrasi Sonner selesai, THE Migration_System SHALL menggantikan seluruh implementasi toast ad-hoc berbasis local state (pola showToast/setToastMessage/setTimeout) di komponen existing dengan pemanggilan toast() dari Sonner

### Requirement 12: Preservasi Route Structure dan Backward Compatibility

**User Story:** Sebagai developer, saya ingin route structure yang sudah ada tetap berfungsi setelah migrasi, sehingga tidak ada breaking changes pada navigation flow.

#### Acceptance Criteria

1. THE Migration_System SHALL mempertahankan seluruh existing UMKM routes dengan memastikan setiap route memiliki page.tsx yang valid dan dapat di-render tanpa runtime error: `/dashboard/umkm`, `/dashboard/umkm/campaign`, `/dashboard/umkm/campaign/[campaignId]`, `/dashboard/umkm/campaign/buat`, `/dashboard/umkm/kreator`, `/dashboard/umkm/kreator/[id]`, `/dashboard/umkm/keuangan`, `/dashboard/umkm/negosiasi`, `/dashboard/umkm/negosiasi/[id_order]`
2. THE Migration_System SHALL mempertahankan seluruh existing Creator routes dengan memastikan setiap route memiliki page.tsx yang valid dan dapat di-render tanpa runtime error: `/dashboard/kreator`, `/dashboard/kreator/job-pool`, `/dashboard/kreator/job-pool/[id]`, `/dashboard/kreator/pekerjaan-aktif`, `/dashboard/kreator/pekerjaan-aktif/[id]`, `/dashboard/kreator/negosiasi`, `/dashboard/kreator/negosiasi/[id_order]`, `/dashboard/kreator/profil`, `/dashboard/kreator/rate-card`, `/dashboard/kreator/keuangan`
3. WHEN route baru ditambahkan, THE Migration_System SHALL menambahkan route `/dashboard/umkm/analitik`, `/dashboard/umkm/pengaturan`, dan `/dashboard/umkm/campaign/create` tanpa mengubah path atau dynamic parameter names dari routes yang sudah ada di kriteria 1 dan 2
4. THE Migration_System SHALL mempertahankan seluruh fungsi service layer di `src/services/` yang menggunakan Appwrite SDK (client, databases, account, storage, functions) dengan memastikan setiap fungsi tetap callable dan return type-nya tidak berubah setelah migrasi
5. THE Migration_System SHALL mempertahankan react-hook-form + Zod validation patterns pada form pages yang dimigrasikan, dengan memastikan FormProvider, useForm hook, dan Zod schema resolver tetap digunakan pada setiap halaman yang mengandung form input
6. IF sebuah existing route menghasilkan error setelah migrasi komponen UI-nya, THEN THE Migration_System SHALL memastikan error tidak menyebabkan blank page, melainkan menampilkan fallback UI melalui Next.js error.tsx boundary pada level route segment yang relevan

### Requirement 13: React 19 Compatibility dan Next.js Best Practices

**User Story:** Sebagai developer, saya ingin seluruh komponen yang dimigrasikan kompatibel dengan React 19 dan mengikuti Next.js App Router best practices, sehingga aplikasi stabil dan performant.

#### Acceptance Criteria

1. THE Migration_System SHALL mengkonversi seluruh forwardRef patterns dari prototype (React 18) menjadi direct ref prop pattern yang didukung React 19, termasuk menghapus React.forwardRef wrapper dan menerima ref sebagai regular prop pada function component signature
2. THE Migration_System SHALL memastikan setiap file yang menggunakan useState, useEffect, useRef, useCallback, useMemo, event handlers (onClick, onChange, onSubmit, dll.), atau browser APIs (window, document, localStorage, navigator) memiliki "use client" directive di baris pertama file sebelum import statements
3. THE Migration_System SHALL memisahkan Server Components dari Client Components pada setiap halaman dengan struktur: file page.tsx sebagai Server Component yang menangani data fetching dan static rendering, lalu meneruskan data sebagai props ke child Client Components yang menangani interactive UI dan state management
4. THE Migration_System SHALL menggunakan Next.js Image component (`next/image`) untuk setiap elemen gambar raster (PNG, JPG, WebP, AVIF) menggantikan tag HTML `<img>`, kecuali untuk inline SVG icons yang tetap menggunakan SVG element atau icon library component
5. THE Migration_System SHALL menggunakan Next.js Link component (`next/link`) untuk seluruh internal navigation links menggantikan react-router Link dan anchor tags yang mengarah ke route internal
6. IF prototype menggunakan useNavigate(), useParams(), useSearchParams(), atau useLocation() dari react-router-dom, THEN THE Migration_System SHALL menggantinya dengan useRouter(), useParams(), useSearchParams(), atau usePathname() dari next/navigation sesuai fungsi equivalennya
7. WHEN proses migrasi komponen selesai, THE Migration_System SHALL memverifikasi bahwa `next build` berhasil tanpa error terkait React 19 compatibility (no forwardRef deprecation warnings) dan tanpa error terkait Client/Server Component boundary violations
8. IF sebuah Server Component perlu meneruskan data ke Client Component, THEN THE Migration_System SHALL meneruskan data tersebut melalui props yang serializable (string, number, boolean, plain object, array) tanpa meneruskan functions atau class instances

### Requirement 14: Form Integration dengan shadcn Form Components

**User Story:** Sebagai developer, saya ingin form-form yang ada menggunakan shadcn Form component yang terintegrasi dengan react-hook-form dan Zod, sehingga validasi dan UX form konsisten.

#### Acceptance Criteria

1. THE Migration_System SHALL mengintegrasikan shadcn Form component wrapper yang menggunakan react-hook-form dan @hookform/resolvers dengan zodResolver di bawahnya
2. WHEN sebuah halaman memiliki form (campaign create, pengaturan, profil, rate-card), THE Migration_System SHALL menggunakan shadcn Form, FormField, FormItem, FormLabel, FormControl, FormMessage pattern dengan validasi yang terpicu pada saat submit dan pada saat field kehilangan fokus (onBlur) untuk subsequent validations
3. THE Migration_System SHALL mempertahankan Zod schemas yang sudah ada di `src/lib/validations/` dan menghubungkannya ke react-hook-form menggunakan zodResolver dari @hookform/resolvers
4. THE Migration_System SHALL menggunakan shadcn Input, Select, Checkbox, Switch, Textarea, Calendar components di dalam FormControl
5. IF validasi Zod gagal pada sebuah field, THEN THE Migration_System SHALL menampilkan pesan error menggunakan FormMessage component yang ditampilkan langsung di bawah field terkait dengan warna --destructive dari Design_Token_Layer
6. WHILE form sedang dalam proses submit (isSubmitting state), THE Migration_System SHALL menonaktifkan tombol submit dan menampilkan indikator loading untuk mencegah pengiriman ganda

### Requirement 15: Mobile Responsiveness dan Drawer Integration

**User Story:** Sebagai mobile user, saya ingin UI dashboard tetap berfungsi dengan baik di perangkat mobile, sehingga saya dapat mengakses fitur tanpa hambatan.

#### Acceptance Criteria

1. THE Migration_System SHALL menginstal dan mengonfigurasi Vaul library untuk mobile drawer interactions
2. WHILE viewport width kurang dari 768px, THE Migration_System SHALL merender Drawer (Vaul) sebagai pengganti Dialog pada seluruh komponen yang menggunakan shadcn Dialog, sehingga konten modal ditampilkan sebagai bottom drawer yang dapat di-swipe untuk dismiss
3. THE Migration_System SHALL mengimplementasikan useMobile hook dengan breakpoint 768px menggunakan window.matchMedia API untuk conditional rendering antara desktop dan mobile variants
4. WHILE viewport width kurang dari 768px, THE Migration_System SHALL menampilkan semua table data dengan horizontal scroll (overflow-x: auto) atau responsive card layout sebagai alternatif, sehingga seluruh kolom data tetap dapat diakses tanpa terpotong
5. WHILE viewport width kurang dari 768px, THE Migration_System SHALL mengubah sidebar navigation menjadi slide-in Sheet (off-canvas drawer) yang dipicu oleh hamburger menu button di header
6. IF useMobile hook dirender di server (window undefined), THEN THE Migration_System SHALL mengembalikan nilai default false dan menunda deteksi viewport hingga client-side hydration selesai tanpa menyebabkan layout shift pada konten utama
