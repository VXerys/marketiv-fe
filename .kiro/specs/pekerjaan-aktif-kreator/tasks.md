# Implementation Plan — Pekerjaan Aktif Kreator Revamp

## Task List

- [ ] 1. Refactor Pekerjaan Aktif List View
  - File: `src/components/features/creator-dashboard/PekerjaanAktifView.tsx`
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_

  - [ ] 1.1 Update Metrics Overview Cards
    - Ubah background metric card dari warm cream/neutral menjadi solid putih atau slate-grey.
    - Rapikan susunan ikon dan penanda warna tone violet/neutral.
    - _Requirements: 1.1, 1.2, 2.1_

  - [ ] 1.2 Update Listing Card Layout (`MarketplaceCard`)
    - Ubah border dan background card menjadi solid putih dan abu-abu dingin (`bg-white` dengan border `border-neutral-200/60`).
    - Format letak thumbnail produk, info brand, status badge, dan teks deadline kritis (merah saat terlewat).
    - _Requirements: 1.2, 1.3, 2.2_

  - [ ] 1.3 Implement Fraud Warning Alert Box
    - Tambahkan render alert box berwarna merah dengan border `border-red-150` jika submission terdeteksi anomali/fraud (`work.submissionStatus === 'Fraud'`).
    - _Requirements: 2.3_

  - [ ] 1.4 Update Card Buttons
    - Atur tombol utama menjadi `Submit Bukti Tayang` (violet fill) dan secondary action `Lihat Detail` (outline border-neutral) jika belum dikirim.
    - Tampilkan tulisan `Sudah Dikirim` (non-interaktif, neutral) jika bukti posting sudah diajukan.
    - _Requirements: 2.4_

- [ ] 2. Refactor Detail Pekerjaan Aktif View
  - File: `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx`
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 2.1 Implement Dark Hero Section Spanduk
    - Bangun hero section dengan warna gelap premium (`#0c172b`), radial gradient violet-biru, tombol kembali, profil brand, badge niche/status, judul kampanye putih besar, tarif CPM, detail target views, dan thumbnail besar di sebelah kanan.
    - _Requirements: 3.1_

  - [ ] 2.2 Implement Violet Tab Selector
    - Ubah garis tab aktif "Detail" menggunakan warna violet (`border-primary text-primary`).
    - _Requirements: 1.1, 3.2_

  - [ ] 2.3 Update Tentang Campaign & Brief Layout
    - Atur letak deskripsi produk, instruksi video, CTA, dan Card Do's/Don'ts dengan background soft emerald/rose dan card berlatar putih bersih.
    - Tambahkan tombol "Buka Aset Drive" dengan visual yang rapi.
    - _Requirements: 1.2, 3.3_

  - [ ] 2.4 Revamp Submit Form (Untuk Link Bukti Tayang)
    - Desain ulang selektor platform (TikTok / Instagram) dengan button rounded besar premium.
    - Berikan input URL publik dengan petunjuk larangan upload file video (P2MW compliance).
    - Implementasikan validasi format URL platform (TikTok: `tiktok.com`, Instagram: `instagram.com`).
    - _Requirements: 3.3_

  - [ ] 2.5 Revamp Submitted Details & Verification Stats
    - Jika sudah dikirim, tampilkan detail URL postingan, platform, data views terverifikasi, dan pendapatan cair (jika Valid) dengan layout premium.
    - _Requirements: 3.4_

  - [ ] 2.6 Implement Timeline Progres & Rules Side Pane
    - Tambahkan pelacakan vertikal timeline `Di-klaim` -> `Bukti Video Di-submit` -> `Audit Validasi Admin` di kolom kanan.
    - Tampilkan card aturan pembayaran dan verifikasi views.
    - _Requirements: 3.5_

- [ ] 3. Quality Assurance & Build Checks
  - [ ] 3.1 Jalankan `npm run build` untuk memverifikasi kompilasi typescript/next.js.
  - [ ] 3.2 Lakukan peninjauan visual untuk memastikan warna cream dan aksen oranye UMKM tidak bocor.
  - [ ] 3.3 Pastikan formulir URL menolak tautan salah sesuai spesifikasi.
